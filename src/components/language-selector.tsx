import * as React from "react"
import { Globe } from "lucide-react"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const languages = [
    { label: "English", value: "en-US" },
    { label: "Hindi (हिंदी)", value: "hi-IN" },
    { label: "Marathi (मराठी)", value: "mr-IN" },
    { label: "Tamil (தமிழ்)", value: "ta-IN" },
    { label: "Telugu (తెలుగు)", value: "te-IN" },
]

interface LanguageSelectorProps {
    value: string
    onChange: (value: string) => void
}

export function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
    return (
        <div className="flex items-center space-x-2">
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger className="w-[180px] bg-background">
                    <Globe className="mr-2 h-4 w-4 opacity-50" />
                    <SelectValue placeholder="Select Language" />
                </SelectTrigger>
                <SelectContent>
                    {languages.map((language) => (
                        <SelectItem key={language.value} value={language.value}>
                            {language.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}
