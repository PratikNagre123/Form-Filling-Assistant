
"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Zap, Shield, PlayCircle, Chrome, Download, Github, Linkedin, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExtensionInstructions, WebAppInstructions } from "@/components/instructions-content";

export function LandingPage() {
    const handleExtensionClick = () => {
        const link = document.createElement("a");
        link.href = "/extension.zip";
        link.download = "form-assistant-extension.zip";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Scroll to instructions
        const element = document.getElementById('instructions-section');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground font-body selection:bg-blue-100 selection:text-blue-900">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                            <Zap className="w-5 h-5" />
                        </div>
                        <span>FormAssistant</span>
                    </div>
                    <div className="hidden md:flex gap-6 text-sm font-medium text-muted-foreground">
                        <a href="#features" className="hover:text-foreground transition-colors">Features</a>
                        <a href="#how-it-works" className="hover:text-foreground transition-colors">How it Works</a>
                        <a href="#instructions-section" className="hover:text-foreground transition-colors">Setup Guide</a>
                        <a href="#about" className="hover:text-foreground transition-colors">About</a>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/login">
                            <Button variant="ghost" size="sm" className="hidden sm:flex hover:bg-muted font-medium">Log in</Button>
                        </Link>
                        <Link href="/register">
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-105 font-medium">Get Started</Button>
                        </Link>
                    </div>
                </div>
            </header>

            <main>
                {/* Hero Section */}
                <section className="relative overflow-hidden py-20 lg:py-32 bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-950/20">
                    <div className="container mx-auto px-4 text-center relative z-10">
                        <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-800 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2 animate-pulse"></span>
                            New: Custom Form Support
                        </div>
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 dark:from-white dark:via-blue-200 dark:to-white animate-in fade-in slide-in-from-bottom-8 duration-700">
                            Fill Forms 10x Faster <br className="hidden md:block" /> with AI Intelligence
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
                            Stop typing the same data repeatedly. Securely extract details from your documents and auto-fill any web form instantly.
                        </p>

                        {/* Fork in the Road: Two Ways to Use */}
                        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">

                            {/* Option 1: Web App */}
                            <div className="group relative">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl blur opacity-30 group-hover:opacity-75 transition duration-500"></div>
                                <div className="relative h-full bg-card hover:bg-card/50 border border-border rounded-xl p-8 transition-all duration-300 hover:scale-[1.02] flex flex-col items-center text-center">
                                    <div className="h-14 w-14 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center mb-4 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/40 transition-colors">
                                        <PlayCircle className="w-7 h-7 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">Launch Web App</h3>
                                    <p className="text-muted-foreground mb-6">
                                        Upload documents, extract data, and fill standard forms directly in your dashboard.
                                    </p>
                                    <Link href="/register" className="mt-auto w-full">
                                        <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white" size="lg">
                                            Start Dashboard <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>

                            {/* Option 2: Browser Extension */}
                            <div onClick={handleExtensionClick} className="group relative cursor-pointer">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl blur opacity-30 group-hover:opacity-75 transition duration-500"></div>
                                <div className="relative h-full bg-card hover:bg-card/50 border border-border rounded-xl p-8 transition-all duration-300 hover:scale-[1.02] flex flex-col items-center text-center">
                                    <div className="h-14 w-14 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mb-4 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/40 transition-colors">
                                        <Chrome className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">Get Chrome Extension</h3>
                                    <p className="text-muted-foreground mb-6">
                                        Auto-fill forms on any website while you browse. Download and install in seconds.
                                    </p>
                                    <div className="mt-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center w-full transition-all">
                                        Download & Instructions <Download className="w-4 h-4 ml-2" />
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Abstract Background Elements */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-200/20 dark:bg-blue-900/10 rounded-full blur-3xl -z-10 animate-pulse duration-3000"></div>
                </section>

                {/* Features Section */}
                <section id="features" className="py-20 bg-muted/30">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold tracking-tight mb-4">Everything You Need to Speed Up</h2>
                            <p className="text-muted-foreground max-w-2xl mx-auto">
                                Powerful features designed to handle any form, anywhere.
                            </p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                { title: "Smart Extraction", icon: Zap, text: "Advanced OCR technology instantly reads and digitizes data from image IDs and PDFs." },
                                { title: "Secure Storage", icon: Shield, text: "Your data is encrypted locally. We never store your personal documents on our servers." },
                                { title: "One-Click Fill", icon: CheckCircle2, text: "Populate entire forms in a single click using the browser extension." }
                            ].map((feature, i) => (
                                <div key={i} className="bg-card p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
                                    <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 mb-4">
                                        <feature.icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                                    <p className="text-muted-foreground">{feature.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Instructions Combined Section */}
                <section id="instructions-section" className="py-20 bg-background border-t">
                    <div className="container mx-auto px-4 max-w-5xl">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold tracking-tight mb-4">Complete Setup Guide</h2>
                            <p className="text-muted-foreground max-w-2xl mx-auto">
                                Everything you need to know to get started with FormAssistant.
                            </p>
                        </div>

                        <div className="space-y-16">
                            {/* Extension Guide */}
                            <div className="space-y-8">
                                <div className="border-l-4 border-blue-600 pl-6">
                                    <h3 className="text-2xl font-bold">1. Browser Extension</h3>
                                    <p className="text-muted-foreground">For filling out external websites.</p>
                                </div>
                                <ExtensionInstructions />
                            </div>

                            <hr />

                            {/* Web App Guide */}
                            <div className="space-y-8">
                                <div className="border-l-4 border-purple-600 pl-6">
                                    <h3 className="text-2xl font-bold">2. Web Application</h3>
                                    <p className="text-muted-foreground">For document processing and standard forms.</p>
                                </div>
                                <WebAppInstructions />
                            </div>
                        </div>
                    </div>
                </section>


                {/* About/Footer Section */}
                <section id="about" className="py-20 bg-muted/50 border-t">
                    <div className="container mx-auto px-4 max-w-4xl text-center">
                        <div className="mb-12">
                            <h2 className="text-3xl font-bold tracking-tight mb-4">Meet the Team</h2>
                            <p className="text-muted-foreground">
                                Built with updates by passionate developers.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 mb-16">
                            {/* Profile 1 */}
                            <div className="bg-card rounded-xl p-8 shadow-sm border hover:shadow-md transition-all">
                                <div className="w-24 h-24 mx-auto rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-4 text-2xl font-bold">
                                    PN
                                </div>
                                <h3 className="text-xl font-bold mb-1">Pratik Nagre</h3>
                                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-4">Lead Developer & Creator</p>
                                <p className="text-muted-foreground text-sm mb-6">
                                    Passionate about AI and automation. Created FormAssistant to simplify redundant data entry tasks for everyone.
                                </p>
                                <div className="flex items-center justify-center gap-4">
                                    <a href="https://github.com/pratik-nagre" target="_blank" rel="noreferrer" className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors">
                                        <Github className="w-5 h-5" />
                                    </a>
                                    <a href="https://www.linkedin.com/in/pratiknagre/" target="_blank" rel="noreferrer" className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors">
                                        <Linkedin className="w-5 h-5 text-blue-600" />
                                    </a>
                                    <a href="mailto:pratiknagre34@gmail.com?subject=Inquiry%20regarding%20FormAssistant" target="_blank" className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors">
                                        <Mail className="w-5 h-5" />
                                    </a>
                                </div>
                            </div>

                            {/* Profile 2 */}
                            <div className="bg-card rounded-xl p-8 shadow-sm border hover:shadow-md transition-all">
                                <div className="w-24 h-24 mx-auto rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mb-4 text-2xl font-bold">
                                    TM
                                </div>
                                <h3 className="text-xl font-bold mb-1">Veer Bobde</h3>
                                <p className="text-sm text-purple-600 dark:text-purple-400 font-medium mb-4">Co-Developer</p>
                                <p className="text-muted-foreground text-sm mb-6">
                                    Contributed to the core architecture and UI design. Dedicated to building seamless user experiences.
                                </p>
                                <div className="flex items-center justify-center gap-4">
                                    <a href="https://github.com/Veerbobade20" target="_blank" rel="noreferrer" className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors">
                                        <Github className="w-5 h-5" />
                                    </a>
                                    <a href="https://www.linkedin.com/in/veer-bobade-7036242b5/" target="_blank" rel="noreferrer" className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors">
                                        <Linkedin className="w-5 h-5 text-blue-600" />
                                    </a>
                                    <a href="mailto:veerbobade22@gmail.com?subject=Inquiry%20regarding%20FormAssistant" target="_blank" className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors">
                                        <Mail className="w-5 h-5" />
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="border-t pt-8">
                            <p className="text-sm text-muted-foreground">
                                &copy; 2024 FormAssistant. All rights reserved. <br />
                                Built for speed, security, and simplicity.
                            </p>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
