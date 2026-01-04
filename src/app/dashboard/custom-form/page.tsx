
import { CustomFormFlow } from '@/components/CustomFormFlow';

export default function CustomFormPage() {
    return (
        <div className="space-y-6 animate-in fade-in-50 slide-in-from-right-8 duration-500">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Custom Form Assistant</h2>
                <p className="text-muted-foreground">Upload any blank form, extract its fields, and fill it using your documents.</p>
            </div>
            <CustomFormFlow />
        </div>
    );
}
