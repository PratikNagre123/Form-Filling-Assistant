
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
    CheckSquare,
    Square,
    Plus,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import * as z from "zod";

export const formSchema = z.object({
    name: z.string().optional(),
    dob: z.string().optional(),
    gender: z.string().optional(),
    address: z.string().optional(),
    aadhaar: z.string().optional(),
    pan: z.string().optional(),
});

export type FormValues = z.infer<typeof formSchema>;
export type FormField = {
    name: string;
    type: 'text' | 'checkbox' | 'photo' | 'signature' | 'date';
};

export const allFields: (keyof FormValues)[] = [
    "name",
    "dob",
    "gender",
    "address",
    "aadhaar",
    "pan",
];

export const fieldConfig: Record<
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
