document.addEventListener('DOMContentLoaded', () => {
    // --- UI ELEMENTS ---

    // Screens
    const screenWelcome = document.getElementById('screen-welcome');
    const screenWorkspace = document.getElementById('screen-workspace');

    // Welcome Screen Buttons & Areas
    const preAnalyzeBtn = document.getElementById('pre-analyze-btn');
    const skipBtn = document.getElementById('skip-btn');
    const proceedBtn = document.getElementById('proceed-btn');
    const preAnalysisResult = document.getElementById('pre-analysis-result');
    const fieldList = document.getElementById('field-list');

    // Workspace Screen Buttons & Areas
    const backBtn = document.getElementById('back-btn');
    const fileInput = document.getElementById('file-upload');
    const statusDiv = document.getElementById('status');
    const statusText = document.getElementById('status-text');
    const resultDiv = document.getElementById('result');
    const extractedList = document.getElementById('extracted-items');
    const fillBtn = document.getElementById('fill-btn');
    const clearBtn = document.getElementById('clear-btn');

    // API Key Section
    const apiKeyInput = document.getElementById('api-key-input');
    const saveKeyBtn = document.getElementById('save-api-key');
    
    // NEW: PDF Banner & Popout Button
    const pdfBanner = document.getElementById('pdf-banner');
    const popoutBtn = document.getElementById('popout-btn');

    // State
    let accumulatedData = {};


    // --- 0. INITIALIZATION (Restore Data & Key) ---
    const storedKey = localStorage.getItem('GEMINI_API_KEY');
    if (storedKey) {
        apiKeyInput.value = storedKey;
        apiKeyInput.style.borderColor = '#10b981'; // Green border
    }

    // NEW: Restore previous session data (Fixes data loss on pop-out)
    // This checks if we saved data before the popup closed last time
    chrome.storage.local.get(['formData'], (result) => {
        if (result.formData && Object.keys(result.formData).length > 0) {
            accumulatedData = result.formData;
            renderExtractedData();
            showWorkspace(); // Go straight to workspace if we have data
            if(resultDiv) resultDiv.classList.remove('hidden');
        }
    });


    // --- 1. API KEY LOGIC ---
    saveKeyBtn.addEventListener('click', () => {
        const key = apiKeyInput.value.trim();
        if (key) {
            localStorage.setItem('GEMINI_API_KEY', key);
            alert('API Key Saved Securely!');
            apiKeyInput.style.borderColor = '#10b981';
        } else {
            alert('Please enter a valid key.');
        }
    });


    // --- 2. POPOUT LOGIC (NEW) ---
    // This handles the new button to keep the window open
    if (popoutBtn) {
        popoutBtn.addEventListener('click', () => {
            // Save current state before popping out
            chrome.storage.local.set({ formData: accumulatedData });
            
            // Open popup.html in a new small window
            chrome.windows.create({
                url: "popup.html",
                type: "popup",
                width: 400,
                height: 600
            });
            // The standard popup will close automatically here, but the new window will load the data
        });
    }


    // --- 3. NAVIGATION & PDF CHECK ---

    // Function to check if we are on a PDF
    async function checkPDFMode() {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        // Check if URL ends in .pdf
        if (tab && tab.url && tab.url.toLowerCase().endsWith('.pdf')) {
            // It IS a PDF
            if(pdfBanner) pdfBanner.style.display = 'block'; // Show warning
            if(fillBtn) fillBtn.style.display = 'none';      // Hide Fill button
        } else {
            // Normal Web Page
            if(pdfBanner) pdfBanner.style.display = 'none';
            if(fillBtn) fillBtn.style.display = 'block';
        }
    }

    // Skip Button
    if (skipBtn) {
        skipBtn.addEventListener('click', () => {
            showWorkspace();
        });
    }

    // Proceed Button
    if (proceedBtn) {
        proceedBtn.addEventListener('click', () => {
            showWorkspace();
        });
    }

    // Back Button
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            screenWorkspace.classList.add('hidden');
            if (screenWelcome) screenWelcome.classList.remove('hidden');
            if (preAnalysisResult) preAnalysisResult.classList.add('hidden');
            
            // NEW: Clear storage if user explicitly goes back
            chrome.storage.local.remove(['formData']);
            accumulatedData = {};
        });
    }

    function showWorkspace() {
        if (screenWelcome) screenWelcome.classList.add('hidden');
        screenWorkspace.classList.remove('hidden');
        checkPDFMode(); // Run PDF check whenever workspace opens
    }


    // --- 4. PRE-ANALYSIS LOGIC ---
    if (preAnalyzeBtn) {
        preAnalyzeBtn.addEventListener('click', async () => {
            const originalText = preAnalyzeBtn.textContent;
            preAnalyzeBtn.textContent = 'Scanning...';

            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            // Prevent analysis on PDF tabs
            if (tab && tab.url && tab.url.toLowerCase().endsWith('.pdf')) {
                alert("Cannot scan PDF structure directly. Please skip to Upload and use 'Click-to-Copy' mode.");
                preAnalyzeBtn.textContent = originalText;
                return;
            }

            if (tab) {
                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    files: ['content.js']
                }, () => {
                    chrome.tabs.sendMessage(tab.id, {
                        action: 'analyze_form',
                        data: null 
                    }, (response) => {
                        preAnalyzeBtn.textContent = originalText;

                        if (chrome.runtime.lastError) {
                            console.error(chrome.runtime.lastError);
                            return;
                        }

                        if (response && response.report) {
                            renderFieldDiscovery(response.report);
                        } else {
                            alert("No input fields found on this page.");
                        }
                    });
                });
            }
        });
    }

    function renderFieldDiscovery(report) {
        if (!preAnalysisResult || !fieldList) return;

        preAnalysisResult.classList.remove('hidden');
        fieldList.innerHTML = '';

        if (report.length === 0) {
            fieldList.innerHTML = '<div class="extracted-item">No input fields detected.</div>';
            return;
        }

        report.forEach(item => {
            const div = document.createElement('div');
            div.className = 'extracted-item';
            div.style.borderLeft = "4px solid #6366f1"; // Blue
            div.innerHTML = `
                <div style="font-size:11px; color:#94a3b8; text-transform:uppercase;">Detected Field</div>
                <div style="color:#e2e8f0; font-weight:500;">${item.field}</div>
            `;
            fieldList.appendChild(div);
        });
    }


    // --- 5. FILE UPLOAD & GEMINI PROCESSING ---
    fileInput.addEventListener('change', async (e) => {
        const API_KEY = localStorage.getItem('GEMINI_API_KEY');
        
        if (!API_KEY) {
            alert("⚠️ Please enter and save your Gemini API Key first.");
            return;
        }

        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        // UI Reset
        statusDiv.classList.remove('hidden');
        resultDiv.classList.add('hidden');
        statusText.textContent = `Reading ${files.length} document(s)...`;

        try {
            for (const file of files) {
                const base64Data = await readFileAsBase64(file);
                const base64Content = base64Data.split(',')[1];
                const mimeType = file.type;

                statusText.textContent = `Analyzing ${file.name}...`;
                const newData = await callGeminiAPI(API_KEY, base64Content, mimeType);
                
                Object.assign(accumulatedData, newData);
            }

            // NEW: Save data immediately so it persists if you Pop Out
            chrome.storage.local.set({ formData: accumulatedData });

            renderExtractedData();
            statusDiv.classList.add('hidden');
            resultDiv.classList.remove('hidden');
            checkPDFMode(); // Check PDF mode again to update UI

        } catch (error) {
            console.error(error);
            statusText.textContent = "Error: " + error.message;
            alert("Failed: " + error.message);
        } finally {
            fileInput.value = ''; // Reset input
        }
    });


    // --- 6. FILL BUTTON LOGIC ---
    fillBtn.addEventListener('click', async () => {
        const buttonOriginalText = fillBtn.textContent;
        fillBtn.textContent = 'Filling...';

        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        if (tab) {
            chrome.tabs.sendMessage(tab.id, {
                action: 'fill_form',
                data: accumulatedData
            }, (response) => {
                if (chrome.runtime.lastError || !response) {
                    chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        files: ['content.js']
                    }, () => {
                        chrome.tabs.sendMessage(tab.id, {
                            action: 'fill_form',
                            data: accumulatedData
                        });
                        finishFill();
                    });
                } else {
                    finishFill();
                }
            });
        }

        function finishFill() {
            fillBtn.textContent = 'Done!';
            setTimeout(() => { fillBtn.textContent = buttonOriginalText; }, 2000);
        }
    });


    // --- 7. CLEAR DATA ---
    clearBtn.addEventListener('click', () => {
        accumulatedData = {};
        chrome.storage.local.remove(['formData']); // NEW: Clear storage too
        renderExtractedData();
        resultDiv.classList.add('hidden');
    });


    // --- HELPERS ---

    // Renders items with Click-to-Copy functionality
    function renderExtractedData() {
        extractedList.innerHTML = '';
        if (Object.keys(accumulatedData).length === 0) return;

        // Add hint
        const hint = document.createElement('div');
        hint.style.fontSize = "10px";
        hint.style.color = "#94a3b8";
        hint.style.marginBottom = "5px";
        hint.style.textAlign = "right";
        hint.innerText = "(Click items to Copy)";
        extractedList.appendChild(hint);

        for (const [key, value] of Object.entries(accumulatedData)) {
            const item = document.createElement('div');
            item.className = 'extracted-item';
            // Added cursor pointer style inline if not in CSS
            item.style.cursor = 'pointer'; 
            item.title = "Click to copy";
            item.innerHTML = `<strong>${key}:</strong> <span>${value}</span>`;
            
            // Click to copy logic
            item.addEventListener('click', () => {
                navigator.clipboard.writeText(value);
                
                // Visual Feedback
                const originalBg = item.style.backgroundColor;
                item.style.backgroundColor = "#334155"; // Highlight color
                item.innerHTML = `<strong>${key}:</strong> <span style="color:#10b981;">Copied!</span>`;
                
                setTimeout(() => {
                    item.style.backgroundColor = originalBg;
                    item.innerHTML = `<strong>${key}:</strong> <span>${value}</span>`;
                }, 800);
            });

            extractedList.appendChild(item);
        }
    }

    function readFileAsBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    async function callGeminiAPI(apiKey, base64Image, mimeType) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        
        // --- UPDATED PROMPT: Added W/O support and robust Name Splitting ---
        const promptText = `
            Analyze this Indian ID (Aadhaar/PAN/Voter). Extract details to JSON.
            
            Rules:
            1. NAME SPLITTING (CRITICAL): 
               - "Full Name": The complete name as on card.
               - "First Name": First part of name.
               - "Middle Name": Middle part (if exists).
               - "Last Name": Last/Surname.
               - "Father's Name": Extract if listed as S/O (Son of), D/O (Daughter of), W/O (Wife of), or explicitly "Father's Name".
            
            2. ID NUMBER: 
               - If Aadhaar, use key "Aadhaar Number".
               - If PAN, use key "PAN Number".
               - If Voter, use key "Voter ID".

            3. ADDRESS SPLITTING:
               - "Full Address": Complete address.
               - "Address Line 1": House/Street/Locality.
               - "City": City/District.
               - "State": State name.
               - "Pincode": 6-digit PIN.

            4. OTHER:
               - "Date of Birth": Format YYYY-MM-DD.
               - "Gender": Male/Female.

            5. Return ONLY JSON. No markdown.
        `;

        const requestBody = {
            contents: [{
                parts: [
                    { text: promptText },
                    { inline_data: { mime_type: mimeType, data: base64Image } }
                ]
            }]
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
             const errText = await response.text();
             console.error("Gemini API Error Details:", errText);
             throw new Error(`API Error: ${response.status} - ${errText}`);
        }

        const result = await response.json();
        
        if (!result.candidates || !result.candidates[0].content) {
            throw new Error("The AI model refused to process this image (Safety/Policy).");
        }

        const text = result.candidates[0].content.parts[0].text;
        const cleanJson = text.replace(/```json|```/g, '').trim();
        return JSON.parse(cleanJson);
    }
});