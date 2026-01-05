"use client";

import { FormAssistant } from '@/components/form-assistant';
import { QuickTips } from '@/components/dashboard-widgets';
import { Zap, Play, Download } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useLanguageStore } from "@/lib/store";
import { dashboardTranslations } from "@/components/translations";

export default function Dashboard() {
    const { language } = useLanguageStore();
    const t = dashboardTranslations[language] || dashboardTranslations["en-US"];

    return (
        <div className="container mx-auto px-4 space-y-8 animate-in fade-in-50 slide-in-from-bottom-4 duration-500 pb-10">
            {/* Hero Section */}
            <div className="flex flex-col gap-4 md:items-center md:text-center py-8">
                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 shadow-sm">
                    <Zap className="mr-1 h-3 w-3" />
                    <span>{t.ai_badge}</span>
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
                    {t.welcome} <span className="text-primary">FormAssistant</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    {t.hero_subtitle}
                </p>
            </div>

            {/* Main Content Vertical Stack */}
            <div className="max-w-5xl mx-auto space-y-12">

                {/* 1. Start Task Selection */}
                <section>
                    <FormAssistant />
                </section>

                {/* 2. Demo Video */}
                <section>
                    <div className="rounded-xl border-4 border-purple-200 bg-card text-card-foreground shadow-2xl overflow-hidden ring-4 ring-purple-100/50 dark:ring-purple-900/20 dark:border-purple-800">
                        {/* Fake Browser Title Bar */}
                        <div className="h-10 border-b bg-purple-50/50 dark:bg-purple-900/10 flex items-center px-4 gap-2">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-400/80" />
                                <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                                <div className="w-3 h-3 rounded-full bg-green-400/80" />
                            </div>
                            <div className="ml-4 text-xs text-muted-foreground font-medium flex items-center gap-1.5 bg-background/50 px-3 py-1 rounded-md border shadow-sm">
                                <Play className="w-3 h-3" /> demo-workflow.mp4
                            </div>
                        </div>

                        {/* Video Container */}
                        <div className="relative aspect-video bg-black">
                            <video
                                autoPlay
                                loop
                                muted
                                playsInline
                                controls
                                className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity"
                                poster="/placeholder-video-poster.jpg"
                            >
                                <source src="/demo-workflow.mp4" type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                        </div>

                        <div className="p-6 flex items-center justify-between gap-4">
                            <div className="space-y-1">
                                <h3 className="font-semibold leading-none tracking-tight">{t.demo_title}</h3>
                                <p className="text-sm text-muted-foreground">
                                    {t.demo_desc}
                                </p>
                            </div>
                            <Button asChild variant="outline" className="shrink-0 border-purple-200 hover:bg-purple-50 hover:text-purple-700 dark:border-purple-800 dark:hover:bg-purple-900/30">
                                <a href="/demo-workflow.mp4" download="FormAssistant-Demo.mp4">
                                    <Download className="mr-2 h-4 w-4" />
                                    {t.download_video}
                                </a>
                            </Button>
                        </div>
                    </div>
                </section>

                {/* 3. Helpful Tips */}
                <section>
                    <QuickTips />
                </section>

            </div>
        </div>
    );
}
