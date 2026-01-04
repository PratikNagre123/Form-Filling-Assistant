
import React from 'react';
import { AppNavbar } from '@/components/AppNavbar';
import { cookies } from 'next/headers';
import { WebAppInstructions } from '@/components/instructions-content';

export default async function InstructionsPage() {
    const cookieStore = await cookies();
    const userName = cookieStore.get('session_user_name')?.value || 'Guest';

    return (
        <div className="min-h-screen bg-muted/20 font-body">
            <AppNavbar userName={userName} />

            <main className="container mx-auto px-4 py-8 max-w-4xl space-y-12">

                <div className="flex flex-col gap-2 md:items-center md:text-center pb-8 border-b">
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard Guide</h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Learn how to use the web dashboard effectively.
                    </p>
                </div>

                {/* Only Web App Instructions for Dashboard Users */}
                <div className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500 delay-100">
                    <WebAppInstructions />
                </div>

            </main>
        </div>
    );
}
