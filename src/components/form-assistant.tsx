
"use client";

import Link from "next/link";
import { Newspaper, FileCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export function FormAssistant() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Choose Your Form</CardTitle>
                <CardDescription>Select a standard form or upload your own to begin.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                <Link href="/dashboard/default-form" className="w-full">
                    <Button variant="outline" className="w-full h-auto p-6 flex flex-col gap-4 items-center justify-center">
                        <Newspaper className="h-10 w-10 text-primary" />
                        <span className="text-lg font-semibold">Use Default Form</span>
                        <span className="text-sm text-muted-foreground text-center">Fill out our standard application form.</span>
                    </Button>
                </Link>
                <Link href="/dashboard/custom-form" className="w-full">
                    <Button variant="outline" className="w-full h-auto p-6 flex flex-col gap-4 items-center justify-center">
                        <FileCode className="h-10 w-10 text-primary" />
                        <span className="text-lg font-semibold">Upload Custom Form</span>
                        <span className="text-sm text-muted-foreground text-center">Extract fields from your own PDF or image.</span>
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
}
