
"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import jsPDF from "jspdf";
import {
    Upload,
    Loader2,
    Download,
    FileText,
    X,
    Camera,
    ArrowRight,
    Check,
    FileCode,
    BookUser,
    Plus,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { extractFormSchemaAction, mapDocumentToFormAction } from "@/app/actions";
import { VoiceInputButton } from "@/components/voice-input-button";
import { cn } from "@/lib/utils";
import { Checkbox } from "./ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField as FormFieldType } from "./form-config";

export function CustomFormFlow() {
    const [step, setStep] = useState(1);
    const [customFormFile, setCustomFormFile] = useState<File | null>(null);
    const [customFormPreview, setCustomFormPreview] = useState<string | null>(null);
    const [isExtractingSchema, setIsExtractingSchema] = useState(false);
    const [extractedSchema, setExtractedSchema] = useState<FormFieldType[] | null>(null);

    const [docFile, setDocFile] = useState<File | null>(null);
    const [docPreview, setDocPreview] = useState<string | null>(null);
    const [isMapping, setIsMapping] = useState(false);

    // State for photo fields
    const [photoPreviews, setPhotoPreviews] = useState<Record<string, string | null>>({});
    const photoInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

    const { toast } = useToast();
    const [highlightedFields, setHighlightedFields] = useState<string[]>([]);
    const [isAddingField, setIsAddingField] = useState(false);
    const [newFieldName, setNewFieldName] = useState("");
    const [newFieldType, setNewFieldType] = useState<FormFieldType['type']>("text");

    const customFormInputRef = useRef<HTMLInputElement>(null);
    const docInputRef = useRef<HTMLInputElement>(null);

    const form = useForm();
    const { formState: { errors }, watch } = form;
    const formValues = watch();

    const isFormFilled = extractedSchema ? extractedSchema.filter(f => f.type !== 'photo').every(field => !!formValues[field.name]) : false;

    useEffect(() => {
        if (extractedSchema) {
            const defaultValues = extractedSchema.reduce((acc, field) => {
                acc[field.name] = field.type === 'checkbox' ? false : '';
                return acc;
            }, {} as Record<string, any>);
            form.reset(defaultValues);
            extractedSchema.forEach(field => {
                form.register(field.name);
            });
        }
    }, [extractedSchema, form]);

    const handleCustomFormFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            setCustomFormFile(selectedFile);
            if (selectedFile.type.startsWith("image/")) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setCustomFormPreview(reader.result as string);
                };
                reader.readAsDataURL(selectedFile);
            } else {
                setCustomFormPreview(null);
            }
        }
    };

    const handleDocFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            setDocFile(selectedFile);
            if (selectedFile.type.startsWith("image/")) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setDocPreview(reader.result as string);
                };
                reader.readAsDataURL(selectedFile);
            } else {
                setDocPreview(null); // No preview for non-image files like PDF
            }
        }
    };

    const handlePhotoFileChange = (fieldName: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreviews(prev => ({ ...prev, [fieldName]: reader.result as string }));
                form.setValue(fieldName, reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const clearCustomFormPreview = () => {
        setCustomFormFile(null);
        setCustomFormPreview(null);
        if (customFormInputRef.current) customFormInputRef.current.value = "";
    };

    const clearDocPreview = () => {
        setDocFile(null);
        setDocPreview(null);
        if (docInputRef.current) docInputRef.current.value = "";
    }

    const clearPhotoPreview = (fieldName: string) => {
        setPhotoPreviews(prev => ({ ...prev, [fieldName]: null }));
        form.setValue(fieldName, '');
        const inputRef = photoInputRefs.current[fieldName];
        if (inputRef) inputRef.value = "";
    }

    const handleExtractSchema = async () => {
        if (!customFormFile) return;
        setIsExtractingSchema(true);

        const reader = new FileReader();
        reader.readAsDataURL(customFormFile);
        reader.onload = async () => {
            const dataUrl = reader.result as string;
            const result = await extractFormSchemaAction(dataUrl);

            setIsExtractingSchema(false);
            if ('error' in result) {
                toast({
                    variant: 'destructive',
                    title: 'Schema Extraction Failed',
                    description: result.error,
                });
            } else {
                setExtractedSchema(result.fields);
                setStep(2);
                toast({
                    title: 'Form Fields Extracted',
                    description: "Next, upload a document to fill these fields automatically.",
                });
            }
        };
        reader.onerror = () => {
            setIsExtractingSchema(false);
            toast({
                variant: 'destructive',
                title: 'File Read Error',
                description: 'Could not read the selected file.',
            });
        };
    };

    const handleMapDocument = async () => {
        if (!docFile || !extractedSchema) return;
        setIsMapping(true);

        const fieldNames = extractedSchema.map(f => f.name);

        const reader = new FileReader();
        reader.readAsDataURL(docFile);
        reader.onload = async () => {
            const dataUrl = reader.result as string;
            const result = await mapDocumentToFormAction(dataUrl, fieldNames);

            setIsMapping(false);
            if ('error' in result) {
                toast({
                    variant: 'destructive',
                    title: 'Auto-fill Failed',
                    description: result.error,
                });
            } else {
                const currentValues = form.getValues();
                const newValues = { ...currentValues, ...result.mappedData };

                // Identify changed fields for highlighting
                const changed = Object.keys(result.mappedData).filter(
                    key => result.mappedData[key] && result.mappedData[key] !== currentValues[key]
                );

                form.reset(newValues);
                setHighlightedFields(changed);

                // Reset highlighting after 3 seconds
                setTimeout(() => setHighlightedFields([]), 3000);

                // Clear the used document to allow uploading a new one
                setDocFile(null);
                setDocPreview(null);
                if (docInputRef.current) docInputRef.current.value = "";

                toast({
                    title: 'Form Updated',
                    description: `Updated ${changed.length} fields from the document. You can upload another document to fill more fields.`,
                });
            }
        };
        reader.onerror = () => {
            setIsMapping(false);
            toast({
                variant: 'destructive',
                title: 'File Read Error',
                description: 'Could not read the source document file.',
            });
        };
    };

    const handleDownloadPdf = () => {
        const doc = new jsPDF();
        const data = form.getValues();

        doc.setFontSize(22);
        // Use a reliable hex color code for jsPDF
        doc.setTextColor("#00BFFF");
        doc.text("Custom Form Data", 20, 20);

        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);

        let y = 40;

        if (extractedSchema) {
            // Handle photo placements first if any
            const photoFields = extractedSchema.filter(f => f.type === 'photo');
            photoFields.forEach((field, index) => {
                const photoPreview = photoPreviews[field.name];
                if (photoPreview) {
                    try {
                        // Simple positioning for now, can be improved
                        const x = index % 2 === 0 ? 140 : 80;
                        if (index > 0 && index % 2 === 0) y += 60;
                        doc.addImage(photoPreview, 'JPEG', x, y, 50, 50);
                    } catch (error) {
                        console.error("Error adding image to PDF:", error);
                    }
                }
            });
            if (photoFields.length > 0) y += 60;


            extractedSchema.forEach((field) => {
                const fieldValue = data[field.name];
                if (field.type !== 'photo') {
                    doc.setFont("helvetica", "bold");
                    const labelOriginal = field.name.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
                    const label = `${labelOriginal}:`;
                    doc.text(label, 20, y);

                    const labelWidth = doc.getTextWidth(label);
                    // Dynamically calculate value X position. 
                    // Base alignment is at 80, but if label is long, push it further with a 5px margin.
                    const valueStartX = Math.max(80, 20 + labelWidth + 5);

                    doc.setFont("helvetica", "normal");

                    const displayValue = field.type === 'checkbox'
                        ? (fieldValue ? 'Yes' : 'No')
                        : (fieldValue || ''); // Ensure we print something even if empty for alignment

                    // Wrap text within the remaining page width (assuming 210mm page width, ~190mm usable, minus valueStartX)
                    const maxTextWidth = 190 - valueStartX;
                    const textDimensions = doc.getTextDimensions(displayValue as string, { maxWidth: maxTextWidth });

                    doc.text(displayValue as string, valueStartX, y, { maxWidth: maxTextWidth });

                    // Increment Y based on the taller of the two (usually value text if wrapped)
                    // If label was somehow multiline (unlikely with just text()), we'd need more checks, 
                    // but label is single line here.
                    y += Math.max(10, textDimensions.h + 6);

                    // Add a new page if we are running out of space
                    if (y > 280) {
                        doc.addPage();
                        y = 20;
                    }
                }
            });
        }

        doc.save("custom-form-data.pdf");
    };

    const renderUploadCard = (
        title: string,
        description: string,
        file: File | null,
        preview: string | null,
        handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
        clearPreview: () => void,
        accept: string,
        Icon: LucideIcon,
        inputRef: React.RefObject<HTMLInputElement>,
        key?: string
    ) => (
        <div className="space-y-4" key={key}>
            <h3 className="font-semibold text-lg flex items-center"><Icon className="h-5 w-5 mr-2 text-primary" />{title}</h3>
            <p className="text-sm text-muted-foreground -mt-2">{description}</p>
            <label
                htmlFor={title.toLowerCase().replace(/[\s\(\)]+/g, "-")}
                className={cn(
                    "relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors",
                    { "border-primary bg-muted/20": !preview && !file }
                )}
            >
                {preview ? (
                    <div className="relative w-full h-full">
                        <Image
                            src={preview}
                            alt="Preview"
                            fill
                            style={{ objectFit: "contain" }}
                            className="rounded-lg p-2"
                        />
                    </div>
                ) : file ? (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                        <FileText className="w-10 h-10 mb-3 text-primary" />
                        <p className="mb-2 text-sm font-semibold">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-10 h-10 mb-3 text-primary" />
                        <p className="mb-2 text-sm text-foreground">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {accept === "image/*" ? "Image files" : "Image or PDF files"}
                        </p>
                    </div>
                )}
                {(preview || file) && (
                    <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-8 w-8 rounded-full z-10" onClick={(e) => { e.preventDefault(); clearPreview(); }}>
                        <X className="h-4 w-4" />
                        <span className="sr-only">Clear preview</span>
                    </Button>
                )}
                <Input ref={inputRef} id={title.toLowerCase().replace(/[\s\(\)]+/g, "-")} type="file" className="hidden" onChange={handleFileChange} accept={accept} />
            </label>
        </div>
    );

    const renderPhotoUpload = (field: FormFieldType) => (
        <div className="space-y-4" key={field.name}>
            <h3 className="font-semibold text-lg flex items-center"><Camera className="h-5 w-5 mr-2 text-primary" />{field.name}</h3>
            <label
                htmlFor={field.name}
                className={cn(
                    "relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors",
                    { "border-primary bg-muted/20": !photoPreviews[field.name] }
                )}
            >
                {photoPreviews[field.name] ? (
                    <div className="relative w-full h-full">
                        <Image src={photoPreviews[field.name]!} alt={`${field.name} preview`} fill style={{ objectFit: "contain" }} className="rounded-lg p-1" />
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center p-4">
                        <Upload className="w-8 h-8 mb-2 text-primary" />
                        <p className="text-sm font-semibold">Upload Photo</p>
                        <p className="text-xs text-muted-foreground">Click or drag & drop</p>
                    </div>
                )}
                {photoPreviews[field.name] && (
                    <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7 rounded-full z-10" onClick={(e) => { e.preventDefault(); clearPhotoPreview(field.name) }}>
                        <X className="h-4 w-4" />
                    </Button>
                )}
                <Input
                    ref={(el) => { photoInputRefs.current[field.name] = el; }}
                    id={field.name}
                    type="file"
                    className="hidden"
                    onChange={handlePhotoFileChange(field.name)}
                    accept="image/*"
                />
            </label>
        </div>
    );


    return (
        <div className="space-y-8">
            {/* Step 1: Upload Custom Form */}
            <Card className={cn("transition-all duration-500", step < 1 && "opacity-50")}>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground mr-3 font-bold text-lg">1</div>
                        Upload Custom Form
                        {step > 1 && <Check className="ml-auto h-6 w-6 text-green-500" />}
                    </CardTitle>
                    <CardDescription>Upload a PDF or an image of the form you want to fill out. We'll extract the fields for you.</CardDescription>
                </CardHeader>
                {step === 1 && (
                    <>
                        <CardContent>
                            {renderUploadCard(
                                "Custom Form Document",
                                "Upload the blank form here.",
                                customFormFile,
                                customFormPreview,
                                handleCustomFormFileChange,
                                clearCustomFormPreview,
                                "image/*,application/pdf",
                                FileCode,
                                customFormInputRef
                            )}
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleExtractSchema} disabled={!customFormFile || isExtractingSchema} className="w-full">
                                {isExtractingSchema ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
                                {isExtractingSchema ? "Analyzing Form..." : "Extract Form Fields & Continue"}
                            </Button>
                        </CardFooter>
                    </>
                )}
            </Card>

            {/* Step 2: Fill & Download */}
            <Card className={cn("transition-all duration-500", step < 2 && "opacity-50 pointer-events-none")}>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <div className={cn("flex items-center justify-center w-8 h-8 rounded-full mr-3 font-bold text-lg", step === 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>2</div>
                        Fill & Download
                    </CardTitle>
                    <CardDescription>Auto-fill details from your document, or enter them manually.</CardDescription>
                </CardHeader>
                {step === 2 && (
                    <CardContent className="space-y-8">
                        {/* Auto-fill Section */}
                        <div className="rounded-lg border bg-muted/30 p-4">
                            <h4 className="font-semibold mb-4 flex items-center">
                                <BookUser className="mr-2 h-5 w-5 text-primary" />
                                Auto-fill from Document
                            </h4>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-end">
                                <div>
                                    {renderUploadCard(
                                        "Source Document",
                                        "Upload ID card or document.",
                                        docFile,
                                        docPreview,
                                        handleDocFileChange,
                                        clearDocPreview,
                                        "image/*,application/pdf",
                                        BookUser,
                                        docInputRef,
                                        "source-doc-compact"
                                    )}
                                </div>
                                <Button onClick={handleMapDocument} disabled={!docFile || isMapping} className="w-full h-14 mb-[4px]">
                                    {isMapping ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
                                    {isMapping ? "Filling..." : "Auto-Fill Fields"}
                                </Button>
                            </div>
                        </div>

                        {/* Form Fields Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold">Form Details</h3>
                            </div>
                            <Form {...form}>
                                <form className="space-y-6">
                                    {extractedSchema && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {extractedSchema.filter(f => f.type === 'photo').map(field => (
                                                <div key={field.name} className="md:col-span-2">
                                                    {renderPhotoUpload(field)}
                                                </div>
                                            ))}

                                            {extractedSchema.filter(f => f.type !== 'photo').map((field) => {
                                                const isHighlighted = highlightedFields.includes(field.name);

                                                if (field.type === 'checkbox') {
                                                    return (
                                                        <FormField
                                                            key={field.name}
                                                            control={form.control}
                                                            name={field.name}
                                                            render={({ field: formField }) => (
                                                                <FormItem className={cn("flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 transition-all duration-500", isHighlighted && "border-green-500 bg-green-50 shadow-[0_0_10px_rgba(34,197,94,0.3)]")}>
                                                                    <FormControl>
                                                                        <Checkbox
                                                                            checked={formField.value || false}
                                                                            onCheckedChange={formField.onChange}
                                                                        />
                                                                    </FormControl>
                                                                    <div className="space-y-1 leading-none">
                                                                        <FormLabel className="capitalize text-base">
                                                                            {field.name.toLowerCase().replace(/_/g, ' ')}
                                                                        </FormLabel>
                                                                    </div>
                                                                </FormItem>
                                                            )}
                                                        />
                                                    )
                                                }

                                                return (
                                                    <FormField
                                                        key={field.name}
                                                        control={form.control}
                                                        name={field.name}
                                                        render={({ field: formField }) => (
                                                            <FormItem className={cn("transition-all duration-500", isHighlighted && "scale-[1.02]")}>
                                                                <FormLabel className={cn("capitalize no-underline", isHighlighted ? "text-green-600 font-bold" : "text-muted-foreground")}>
                                                                    {field.name.toLowerCase().replace(/_/g, ' ')}
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <div className="relative flex items-center">
                                                                        <Input
                                                                            placeholder={`Enter ${field.name.toLowerCase().replace(/_/g, ' ')}`}
                                                                            {...formField}
                                                                            value={formField.value || ''}
                                                                            className={cn("transition-all duration-300", isHighlighted && "border-green-500 ring-2 ring-green-200")}
                                                                            type={field.type === 'date' ? 'date' : 'text'}
                                                                        />
                                                                        <VoiceInputButton
                                                                            onTranscript={(transcript) => form.setValue(field.name, transcript, { shouldValidate: true })}
                                                                        />
                                                                    </div>
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                );
                                            })}
                                        </div>
                                    )}

                                    <div className="flex justify-center mt-6">
                                        <Dialog open={isAddingField} onOpenChange={setIsAddingField}>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" className="border-dashed">
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    Add Another Field
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Add New Field</DialogTitle>
                                                    <DialogDescription>
                                                        Manually add a missing field to the form.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="grid gap-4 py-4">
                                                    <div className="grid grid-cols-4 items-center gap-4">
                                                        <Label htmlFor="name" className="text-right">
                                                            Name
                                                        </Label>
                                                        <Input
                                                            id="name"
                                                            value={newFieldName}
                                                            onChange={(e) => setNewFieldName(e.target.value)}
                                                            className="col-span-3"
                                                            placeholder="e.g., Passport Number"
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-4 items-center gap-4">
                                                        <Label htmlFor="type" className="text-right">
                                                            Type
                                                        </Label>
                                                        <Select value={newFieldType} onValueChange={(val: any) => setNewFieldType(val)}>
                                                            <SelectTrigger className="col-span-3">
                                                                <SelectValue placeholder="Select type" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="text">Text</SelectItem>
                                                                <SelectItem value="date">Date</SelectItem>
                                                                <SelectItem value="checkbox">Checkbox</SelectItem>
                                                                <SelectItem value="photo">Photo</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                                <DialogFooter>
                                                    <Button onClick={(e) => {
                                                        e.preventDefault();
                                                        if (newFieldName && extractedSchema) {
                                                            const newField: FormFieldType = { name: newFieldName.replace(/\s+/g, '_'), type: newFieldType }; // Sanitize name
                                                            setExtractedSchema([...extractedSchema, newField]);
                                                            form.setValue(newField.name, newFieldType === 'checkbox' ? false : ''); // Init value
                                                            setIsAddingField(false);
                                                            setNewFieldName("");
                                                            setNewFieldType("text");
                                                            toast({ title: "Field Added", description: `${newFieldName} has been added to the form.` });
                                                        }
                                                    }}>Add Field</Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </form>
                            </Form>
                        </div>

                        {/* Footer Actions */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t">
                            <Button onClick={handleDownloadPdf} size="lg" className="w-full sm:w-auto ml-auto">
                                <Download className="mr-2 h-5 w-5" />
                                Download as PDF
                            </Button>
                        </div>
                    </CardContent>
                )}
            </Card>

        </div>
    );
}
