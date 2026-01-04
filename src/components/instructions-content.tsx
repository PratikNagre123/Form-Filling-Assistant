
import React from 'react';
import { Download, Upload, Eye, Chrome, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function ExtensionInstructions() {
    return (
        <section id="extension-setup" className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Chrome className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Chrome Extension Setup</h2>
                    <p className="text-muted-foreground">Automate form filling directly on websites.</p>
                </div>
            </div>

            <Card className="border-blue-200/50 dark:border-blue-900/50 shadow-sm">
                <CardHeader>
                    <CardTitle>1. Download & Prepare</CardTitle>
                    <CardDescription>Get the extension files to your local machine.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-4 border rounded-lg bg-secondary/20 flex flex-col sm:flex-row items-center gap-4 justify-between">
                        <div className="space-y-1">
                            <p className="font-medium">Download Extension Package</p>
                            <p className="text-sm text-muted-foreground">Latest version: 1.0.0 (ZIP)</p>
                        </div>
                        <a href="/extension.zip" download="form-assistant-extension.zip">
                            <Button className="w-full sm:w-auto gap-2 bg-blue-600 hover:bg-blue-700">
                                <Download className="w-4 h-4" /> Download .Zip
                            </Button>
                        </a>
                    </div>
                    <p className="text-sm border-l-2 border-primary pl-4 py-1 text-muted-foreground">
                        <strong>Note:</strong> After downloading, <span className="text-foreground font-medium">unzip the file</span> into a folder named <code>chrome-extension</code> (or any name you prefer).
                    </p>
                </CardContent>
            </Card>

            <Card className="border-blue-200/50 dark:border-blue-900/50 shadow-sm">
                <CardHeader>
                    <CardTitle>2. Install in Chrome</CardTitle>
                    <CardDescription>Load the unpacked extension into your browser.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <ol className="list-decimal list-inside space-y-4 text-muted-foreground">
                        <li className="pl-2">
                            Open Google Chrome and navigate to <code className="bg-muted px-1.5 py-0.5 rounded text-foreground">chrome://extensions</code>
                        </li>
                        <li className="pl-2">
                            Enable <strong className="text-foreground">Developer mode</strong> using the toggle switch in the top right corner.
                        </li>
                        <li className="pl-2">
                            Click the <strong className="text-foreground">Load unpacked</strong> button that appears in the top left.
                        </li>
                        <li className="pl-2">
                            Select the unzipped folder (the one containing <code>manifest.json</code>).
                        </li>
                    </ol>
                    <div className="rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900 p-4 flex gap-3 text-sm text-green-800 dark:text-green-300">
                        <ShieldCheck className="w-5 h-5 shrink-0" />
                        <p>
                            Only install unpacked extensions from sources you trust. This extension runs locally and communicates only with this web app's secure API.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </section>
    );
}

export function WebAppInstructions() {
    return (
        <section id="webapp-usage" className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                    <FileText className="w-8 h-8 text-primary" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Web Dashboard Usage</h2>
                    <p className="text-muted-foreground">Extract data from documents without the extension.</p>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Upload className="w-5 h-5 text-blue-500" /> Upload
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Drag & Drop your PDF, PNG, or JPG documents into the upload zone. The AI will instantly start processing.
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Eye className="w-5 h-5 text-purple-500" /> Review
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            See extracted fields side-by-side with your document. Edit any values that need correction before exporting.
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Download className="w-5 h-5 text-green-500" /> Export
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Download the structured data as JSON or Copy to Clipboard to use in your other applications.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}

import { FileText } from 'lucide-react';
