


"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import jsPDF from "jspdf";
import {
  Upload,
  Loader2,
  Download,
  FileText,
  User,
  CalendarDays,
  Users,
  MapPin,
  Fingerprint,
  CreditCard,
  X,
  Camera,
  ArrowRight,
  Check,
  FileUp,
  FileCode,
  Newspaper,
  BookUser,
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { extractDataAction, extractFormSchemaAction } from "@/app/actions";
import { VoiceInputButton } from "@/components/voice-input-button";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  name: z.string().optional(),
  dob: z.string().optional(),
  gender: z.string().optional(),
  address: z.string().optional(),
  aadhaar: z.string().optional(),
  pan: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const allFields: (keyof FormValues)[] = [
  "name",
  "dob",
  "gender",
  "address",
  "aadhaar",
  "pan",
];

const fieldConfig: Record<
  keyof FormValues,
  { label: string; icon: LucideIcon }
> = {
  name: { label: "Full Name", icon: User },
  dob: { label: "Date of Birth", icon: CalendarDays },
  gender: { label: "Gender", icon: Users },
  address: { label: "Address", icon: MapPin },
  aadhaar: { label: "Aadhaar Number", icon: Fingerprint },
  pan: { label: "PAN Number", icon: CreditCard },
};

function DefaultFormFlow() {
    const [step, setStep] = useState(1);
    const [docFile, setDocFile] = useState<File | null>(null);
    const [docPreview, setDocPreview] = useState<string | null>(null);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [isExtracting, setIsExtracting] = useState(false);
    
    const { toast } = useToast();
    const docInputRef = useRef<HTMLInputElement>(null);
    const photoInputRef = useRef<HTMLInputElement>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            dob: "",
            gender: "",
            address: "",
            aadhaar: "",
            pan: "",
        },
    });

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

    const handlePhotoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile && selectedFile.type.startsWith("image/")) {
            setPhotoFile(selectedFile);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleExtractData = async () => {
        if (!docFile) return;

        setIsExtracting(true);
        form.reset();

        const reader = new FileReader();
        reader.readAsDataURL(docFile);
        reader.onload = async () => {
            const dataUrl = reader.result as string;
            const result = await extractDataAction(dataUrl);

            setIsExtracting(false);
            if ("error" in result) {
                toast({
                    variant: "destructive",
                    title: "Extraction Failed",
                    description: result.error,
                });
            } else {
                const formattedResult = {
                    ...result,
                    dob: result.dob ? result.dob.split('T')[0] : '',
                };
                form.reset(formattedResult);
                setStep(2);
                toast({
                    title: "Data Extracted",
                    description: "Please review and complete the form.",
                });
            }
        };
        reader.onerror = () => {
            setIsExtracting(false);
            toast({
                variant: "destructive",
                title: "File Read Error",
                description: "Could not read the selected file.",
            });
        };
    };

    const handleDownloadPdf = () => {
        const doc = new jsPDF();
        const data = form.getValues();

        doc.setFontSize(22);
        const primaryColorHsl = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
        const colorString = `hsl(${primaryColorHsl.split(' ').join(',')})`;
        doc.setTextColor(colorString);
        doc.text("Extracted Form Data", 20, 20);

        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);

        let y = 40;

        if (photoPreview) {
            try {
                doc.addImage(photoPreview, 'JPEG', 140, y, 50, 50);
                y += 60; // Add space after photo
            } catch (error) {
                console.error("Error adding image to PDF:", error);
                toast({
                    variant: "destructive",
                    title: "PDF Error",
                    description: "Failed to add the photo to the PDF."
                });
            }
        }

        allFields.forEach((key) => {
            if (data[key]) {
                doc.setFont("helvetica", "bold");
                doc.text(`${fieldConfig[key].label}:`, 20, y);
                doc.setFont("helvetica", "normal");
                const textDimensions = doc.getTextDimensions(data[key] as string, { maxWidth: 110 });
                doc.text(data[key] as string, 70, y, { maxWidth: 110 });
                y += textDimensions.h + 6;
            }
        });

        doc.save("form-data.pdf");
    };
    
    const clearDocPreview = () => {
        setDocFile(null);
        setDocPreview(null);
        if (docInputRef.current) docInputRef.current.value = "";
    }

    const clearPhotoPreview = () => {
        setPhotoFile(null);
        setPhotoPreview(null);
        if (photoInputRef.current) photoInputRef.current.value = "";
    }

    const renderFields = () => {
        return allFields.map((fieldName) => {
            const config = fieldConfig[fieldName];
            if (!config) return null;
            const { icon: Icon, label } = config;
            return (
                <FormField
                    key={fieldName}
                    control={form.control}
                    name={fieldName}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="flex items-center text-muted-foreground">
                                <Icon className="h-4 w-4 mr-2" />
                                {label}
                            </FormLabel>
                            <FormControl>
                                <div className="relative flex items-center">
                                    <Input
                                        placeholder={`Enter ${label.toLowerCase()}`}
                                        {...field}
                                        className="bg-background/80"
                                    />
                                    <VoiceInputButton
                                        onTranscript={(transcript) => form.setValue(fieldName, transcript, { shouldValidate: true })}
                                    />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            );
        });
    }
    
    const renderUploadCard = (
      title: string,
      description: string,
      file: File | null,
      preview: string | null,
      handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
      clearPreview: () => void,
      accept: string,
      Icon: LucideIcon,
      inputRef: React.RefObject<HTMLInputElement>
    ) => (
      <div className="space-y-4">
        <h3 className="font-semibold text-lg flex items-center"><Icon className="h-5 w-5 mr-2 text-primary"/>{title}</h3>
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
                style={{objectFit:"contain"}}
                className="rounded-lg p-2"
              />
            </div>
          ) : file ? (
            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
              <FileText className="w-10 h-10 mb-3 text-primary" />
              <p className="mb-2 text-sm font-semibold">{file.name}</p>
              <p className="text-xs text-muted-foreground">{ (file.size / 1024).toFixed(2) } KB</p>
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
              <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-8 w-8 rounded-full z-10" onClick={(e) => {e.preventDefault(); clearPreview();}}>
                <X className="h-4 w-4" />
                <span className="sr-only">Clear preview</span>
              </Button>
          )}
          <Input ref={inputRef} id={title.toLowerCase().replace(/[\s\(\)]+/g, "-")} type="file" className="hidden" onChange={handleFileChange} accept={accept} />
        </label>
      </div>
    );

    return (
        <div className="space-y-8">
            <Card className={cn("transition-all duration-500", step < 1 && "opacity-50")}>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground mr-3 font-bold text-lg">1</div>
                        Upload Source Document
                        {step > 1 && <Check className="ml-auto h-6 w-6 text-green-500" />}
                    </CardTitle>
                    <CardDescription>Upload an ID card, form, or any document to extract information from.</CardDescription>
                </CardHeader>
                {step === 1 && (
                    <>
                        <CardContent>
                            {renderUploadCard(
                                "Source Document",
                                "Upload an image or PDF of your document to extract information.",
                                docFile,
                                docPreview,
                                handleDocFileChange,
                                clearDocPreview,
                                "image/*,application/pdf",
                                FileUp,
                                docInputRef
                            )}
                        </CardContent>
                        <CardFooter>
                            <Button
                                onClick={handleExtractData}
                                disabled={!docFile || isExtracting}
                                className="w-full"
                            >
                                {isExtracting ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <ArrowRight className="mr-2 h-4 w-4" />
                                )}
                                {isExtracting ? "Extracting..." : "Extract & Continue"}
                            </Button>
                        </CardFooter>
                    </>
                )}
            </Card>

            <Card className={cn("transition-all duration-500", step < 2 && "opacity-50 pointer-events-none")}>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <div className={cn("flex items-center justify-center w-8 h-8 rounded-full mr-3 font-bold text-lg", step === 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>2</div>
                        Review & Complete
                        {step > 2 && <Check className="ml-auto h-6 w-6 text-green-500" />}
                    </CardTitle>
                    <CardDescription>Review the extracted data, make corrections, and upload a profile photo if needed.</CardDescription>
                </CardHeader>
                {step === 2 && (
                    <>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-start">
                                <div className="md:col-span-3 space-y-6">
                                    <Form {...form}>
                                        <form className="space-y-4">
                                            {renderFields()}
                                        </form>
                                    </Form>
                                </div>
                                <div className="md:col-span-2 space-y-4">
                                    {renderUploadCard(
                                        "Profile Photo (Optional)",
                                        "Upload a passport-style photo for the form.",
                                        photoFile,
                                        photoPreview,
                                        handlePhotoFileChange,
                                        clearPhotoPreview,
                                        "image/*",
                                        Camera,
                                        photoInputRef
                                    )}
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={() => setStep(3)} className="w-full">
                                <Check className="mr-2 h-4 w-4" />
                                Confirm & Proceed to Download
                            </Button>
                        </CardFooter>
                    </>
                )}
            </Card>

            <Card className={cn("transition-all duration-500", step < 3 && "opacity-50 pointer-events-none")}>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <div className={cn("flex items-center justify-center w-8 h-8 rounded-full mr-3 font-bold text-lg", step === 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>3</div>
                        Download
                    </CardTitle>
                    <CardDescription>Your form data is ready. Download it as a PDF.</CardDescription>
                </CardHeader>
                {step === 3 && (
                    <CardContent>
                        <div className="flex items-center justify-center p-8 bg-muted/50 rounded-lg">
                            <Button onClick={handleDownloadPdf} size="lg">
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

function CustomFormFlow() {
    const [step, setStep] = useState(1);
    const [customFormFile, setCustomFormFile] = useState<File | null>(null);
    const [customFormPreview, setCustomFormPreview] = useState<string | null>(null);
    const [isExtractingSchema, setIsExtractingSchema] = useState(false);
    const [extractedSchema, setExtractedSchema] = useState<string[] | null>(null);
    const [isFilling, setIsFilling] = useState(false);
    
    const [docFile, setDocFile] = useState<File | null>(null);
    const [docPreview, setDocPreview] = useState<string | null>(null);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    const { toast } = useToast();
    const customFormInputRef = useRef<HTMLInputElement>(null);
    const docInputRef = useRef<HTMLInputElement>(null);
    const photoInputRef = useRef<HTMLInputElement>(null);
    
    // Using a dynamic schema with react-hook-form
    const form = useForm();
    
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
    
    const clearCustomFormPreview = () => {
        setCustomFormFile(null);
        setCustomFormPreview(null);
        if(customFormInputRef.current) customFormInputRef.current.value = "";
    };

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
                result.fields.forEach(field => {
                    form.register(field);
                });
                setStep(2);
                toast({
                    title: 'Form Fields Extracted',
                    description: "Next, you'll upload documents to fill these fields.",
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

    const renderUploadCard = (
        title: string,
        description: string,
        file: File | null,
        preview: string | null,
        handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
        clearPreview: () => void,
        accept: string,
        Icon: LucideIcon,
        inputRef: React.RefObject<HTMLInputElement>
      ) => (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg flex items-center"><Icon className="h-5 w-5 mr-2 text-primary"/>{title}</h3>
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
                  style={{objectFit:"contain"}}
                  className="rounded-lg p-2"
                />
              </div>
            ) : file ? (
              <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                <FileText className="w-10 h-10 mb-3 text-primary" />
                <p className="mb-2 text-sm font-semibold">{file.name}</p>
                <p className="text-xs text-muted-foreground">{ (file.size / 1024).toFixed(2) } KB</p>
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
                <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-8 w-8 rounded-full z-10" onClick={(e) => {e.preventDefault(); clearPreview();}}>
                  <X className="h-4 w-4" />
                  <span className="sr-only">Clear preview</span>
                </Button>
            )}
            <Input ref={inputRef} id={title.toLowerCase().replace(/[\s\(\)]+/g, "-")} type="file" className="hidden" onChange={handleFileChange} accept={accept} />
          </label>
        </div>
    );
    
    return (
        <div className="space-y-8">
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

            <Card className={cn("transition-all duration-500", step < 2 && "opacity-50 pointer-events-none")}>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <div className={cn("flex items-center justify-center w-8 h-8 rounded-full mr-3 font-bold text-lg", step === 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>2</div>
                        Fill Custom Form
                    </CardTitle>
                    <CardDescription>Your custom form is ready to be filled. Upload your source documents to pre-fill the fields.</CardDescription>
                </CardHeader>
                {step === 2 && (
                    <CardContent>
                    {extractedSchema && (
                        <Form {...form}>
                            <form className="space-y-6">
                                <div className="p-6 border rounded-lg bg-background/50">
                                    <h3 className="text-lg font-semibold mb-4">Extracted Form Fields</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                        {extractedSchema.map((fieldName) => (
                                            <FormField
                                                key={fieldName}
                                                control={form.control}
                                                name={fieldName}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-muted-foreground capitalize">{fieldName.toLowerCase()}</FormLabel>
                                                        <FormControl>
                                                            <div className="relative flex items-center">
                                                                <Input placeholder={`Enter ${fieldName.toLowerCase()}`} {...field} />
                                                                <VoiceInputButton
                                                                    onTranscript={(transcript) => form.setValue(fieldName, transcript, { shouldValidate: true })}
                                                                />
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </form>
                        </Form>
                    )}
                    </CardContent>
                )}
            </Card>
        </div>
    );
}

export function FormAssistant() {
  const [formType, setFormType] = useState<"default" | "custom" | null>(null);

  if (!formType) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Choose Your Form</CardTitle>
          <CardDescription>Select a standard form or upload your own to begin.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          <Button variant="outline" className="h-auto p-6 flex flex-col gap-4 items-center justify-center" onClick={() => setFormType('default')}>
              <Newspaper className="h-10 w-10 text-primary" />
              <span className="text-lg font-semibold">Use Default Form</span>
              <span className="text-sm text-muted-foreground text-center">Fill out our standard application form.</span>
          </Button>
          <Button variant="outline" className="h-auto p-6 flex flex-col gap-4 items-center justify-center" onClick={() => setFormType('custom')}>
              <FileCode className="h-10 w-10 text-primary" />
              <span className="text-lg font-semibold">Upload Custom Form</span>
              <span className="text-sm text-muted-foreground text-center">Extract fields from your own PDF or image.</span>
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  if (formType === 'default') {
    return <DefaultFormFlow />;
  }

  if (formType === 'custom') {
    return <CustomFormFlow />;
  }

  return null;
}
