
import { FormAssistant } from '@/components/form-assistant';

export default function Dashboard() {
    return (
        <div className="space-y-8 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
            {/* Hero Section */}
            <div className="flex flex-col gap-2 md:items-center md:text-center py-6 md:py-10">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
                    Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">FormAssistant</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Simplify your paperwork. Select a workflow below to auto-fill documents or process generic forms with AI.
                </p>
            </div>

            <FormAssistant />
        </div>
    );
}
