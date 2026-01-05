"use client";

import { BookOpen, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguageStore } from "@/lib/store";
import { dashboardTranslations } from "@/components/translations";

export function QuickTips() {
    const { language } = useLanguageStore();
    const t = dashboardTranslations[language] || dashboardTranslations["en-US"];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    {t.quick_tips_title}
                </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border p-4 bg-muted/30">
                    <div className="flex flex-col gap-2">
                        <span className="text-sm font-semibold flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" /> {t.tip_extension_title}
                        </span>
                        <span className="text-sm text-muted-foreground">
                            {t.tip_extension_desc}
                        </span>
                    </div>
                </div>
                <div className="rounded-lg border p-4 bg-muted/30">
                    <div className="flex flex-col gap-2">
                        <span className="text-sm font-semibold flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" /> {t.tip_results_title}
                        </span>
                        <span className="text-sm text-muted-foreground">
                            {t.tip_results_desc}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
