chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'fill_form' && request.data) {
        const stats = fillForm(request.data, false);
        sendResponse({ status: 'done', stats });
    }
    else if (request.action === 'analyze_form') {
        const report = fillForm(request.data || {}, true);
        sendResponse({ status: 'done', report });
    }
    return true;
});

function fillForm(data, dryRun) {
    const inputs = document.querySelectorAll('input, textarea, select, [role="textbox"], [contenteditable="true"]');
    let filledCount = 0;
    let analysisReport = [];
    const hasData = data && Object.keys(data).length > 0;

    const toDisplayDate = (isoDate) => {
        if (!isoDate) return '';
        const [y, m, d] = isoDate.split('-');
        return `${d}/${m}/${y}`;
    };

    inputs.forEach(input => {
        if (input.type === 'hidden' || input.type === 'submit' || input.type === 'file' || input.style.display === 'none') return;
        if (input.disabled || input.readOnly) return;
        if (input.classList.contains('exportInput') === false && !input.getAttribute('aria-labelledby') && !input.name && !input.id) return;

        const context = getContext(input).toLowerCase();
        if (context.length < 2 || context === 'search' || context === 'your answer') return;

        if (!hasData && dryRun) {
            analysisReport.push({ field: context, status: 'detected' });
            return;
        }

        let matchFound = false;
        for (const [key, value] of Object.entries(data)) {
            const normKey = key.toLowerCase();
            let isMatch = false;

            // --- SMART MATCHING RULES ---

            // 1. FULL NAME vs GENERIC NAME
            // If form asks for "Full Name", "Name", "Student Name" -> Use Full Name
            if (normKey === 'full name') {
                if (context === 'name' || 
                    context === 'full name' ||
                    context === 'student name' || 
                    context === 'candidate name' ||
                    (context.includes('name') && !context.includes('first') && !context.includes('last') && !context.includes('middle') && !context.includes('sur') && !context.includes('father') && !context.includes('mother'))) {
                    isMatch = true;
                }
            }
            
            // 2. SPECIFIC NAME PARTS (First/Middle/Last)
            else if (normKey === 'first name') {
                if (context.includes('first') || context.includes('given name')) isMatch = true;
            }
            else if (normKey === 'middle name') {
                if (context.includes('middle')) isMatch = true;
            }
            else if (normKey === 'last name') {
                // Catches: "Last Name", "Lastname", "Surname", "Family Name"
                if (context.includes('last') || context.includes('surname') || context.includes('family')) isMatch = true;
            }

            // 3. PARENT NAMES
            else if (normKey.includes('father') || normKey.includes('guardian')) {
                if (context.includes('father') || context.includes('guardian') || context.includes('parent')) isMatch = true;
            }

            // 4. ADDRESS COMPONENTS
            else if (normKey === 'city') {
                if (context === 'city' || context.includes('city') || context.includes('district')) isMatch = true;
            }
            else if (normKey === 'state') {
                if (context === 'state' || context.includes('state') || context.includes('province')) isMatch = true;
            }
            else if (normKey === 'pincode' || normKey === 'pin') {
                if (context.includes('pin') || context.includes('zip') || context.includes('postal')) isMatch = true;
            }
            else if (normKey === 'address line 1') {
                if (context.includes('address') && (context.includes('1') || context.includes('line') || context.includes('street'))) isMatch = true;
            }
            else if (normKey === 'full address') {
                // Fallback for generic "Address" boxes that aren't split
                if ((context === 'address' || context === 'permanent address' || context === 'current address') && !context.includes('line')) isMatch = true;
            }

            // 5. ID NUMBERS
            else if (normKey.includes('aadhaar') || normKey.includes('uid')) {
                 if (context.includes('aadhaar') || context.includes('aadhar') || context.includes('uid')) isMatch = true;
            }
            else if (normKey.includes('pan')) {
                 if (context.includes('pan')) isMatch = true;
            }

            // 6. DATES
            else if (normKey.includes('dob') || normKey.includes('date')) {
                if (context.includes('date') || context.includes('dob') || context.includes('birth')) isMatch = true;
            }

            // 7. General Fallback
            else if (context.includes(normKey)) {
                isMatch = true;
            }

            if (isMatch) {
                matchFound = true;
                if (dryRun) {
                    analysisReport.push({ field: context, value: value, status: 'matched' });
                } else {
                    let finalValue = value;
                    if ((normKey.includes('date') || normKey.includes('dob')) && input.type !== 'date') {
                        finalValue = toDisplayDate(value);
                    }
                    setValue(input, finalValue);
                    filledCount++;
                }
                break;
            }
        }

        if (dryRun && hasData && !matchFound) {
            analysisReport.push({ field: context, value: null, status: 'missing' });
        }
    });

    if (dryRun) return analysisReport;
    if (filledCount > 0) showToast(`Filled ${filledCount} fields!`);
    else showToast(`No matching fields found.`);
    return filledCount;
}

// --- UNIVERSAL CONTEXT EXTRACTOR (Improved Table Logic) ---
function getContext(el) {
    let text = "";
    
    // 1. ARIA-LABELLEDBY
    const labelledBy = el.getAttribute('aria-labelledby');
    if (labelledBy) {
        const ids = labelledBy.split(' ');
        ids.forEach(id => {
            const labelEl = document.getElementById(id);
            if (labelEl) text += " " + labelEl.innerText.replace('*', '');
        });
    }

    // 2. ARIA-LABEL
    if (text.trim().length < 2) {
        const ariaLabel = el.getAttribute('aria-label');
        if (ariaLabel && ariaLabel.toLowerCase() !== "your answer") text += " " + ariaLabel;
    }

    // 3. HTML LABELS
    if (text.trim().length < 2 && el.labels && el.labels.length > 0) {
        el.labels.forEach(l => text += " " + l.innerText);
    }

    // 4. ROBUST TABLE / SIBLING STRATEGY
    if (text.trim().length < 2) {
        // Strategy A: Previous Sibling (skipping <br> or empty text nodes)
        let prev = el.previousElementSibling;
        while (prev && (prev.tagName === 'BR' || prev.innerText.trim() === '')) {
            prev = prev.previousElementSibling;
        }
        
        if (prev && (prev.tagName === 'LABEL' || prev.tagName === 'SPAN' || prev.tagName === 'B' || prev.tagName === 'DIV' || prev.tagName === 'STRONG')) {
            text += " " + prev.innerText;
        }
        
        // Strategy B: Previous Table Cell (Independent check)
        // Even if Sibling check failed, we still check the table cell
        if (text.trim().length < 2) {
            const parentTd = el.closest('td');
            if (parentTd) {
                const prevTd = parentTd.previousElementSibling;
                if (prevTd) text += " " + prevTd.innerText;
            }
        }
    }

    // 5. ATTRIBUTES
    if (text.trim().length < 2) {
        if (el.placeholder) text += " " + el.placeholder;
        if (el.name) text += " " + el.name;
        if (el.id) text += " " + el.id;
    }

    // 6. PARENT HEADER
    if (text.trim().length < 2) {
        let parent = el.parentElement;
        for (let i = 0; i < 4; i++) {
            if (parent) {
                const qHeader = parent.querySelector('[role="heading"], .M7eMe');
                if (qHeader) { text = qHeader.innerText; break; }
                parent = parent.parentElement;
            }
        }
    }

    return text.replace(/[\n\r\t*:]/g, " ").replace("Your answer", "").replace(/[^a-zA-Z0-9 ]/g, " ").replace(/\s+/g, " ").trim().substring(0, 60);
}

function setValue(el, value) {
    el.focus();
    el.value = value;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    el.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true }));
    el.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
    el.blur();
}

function showToast(msg) {
    const toast = document.createElement('div');
    toast.textContent = msg;
    toast.style.cssText = "position:fixed; bottom:20px; right:20px; background:#222; color:#fff; padding:10px 20px; border-radius:5px; z-index:9999;";
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}