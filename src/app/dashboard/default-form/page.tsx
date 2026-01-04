
import { DefaultFormFlow } from '@/components/DefaultFormFlow';

export default function DefaultFormPage() {
    return (
        <div className="space-y-6 animate-in fade-in-50 slide-in-from-right-8 duration-500">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Standard Application Form</h2>
                <p className="text-muted-foreground">Extract data from your ID and auto-fill our standard form.</p>
            </div>
            <DefaultFormFlow />
        </div>
    );
}
