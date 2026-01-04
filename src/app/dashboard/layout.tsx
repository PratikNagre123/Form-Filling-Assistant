
import { AppNavbar } from '@/components/AppNavbar';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cookieStore = await cookies();
    const userId = cookieStore.get('session_user_id');
    const userName = cookieStore.get('session_user_name')?.value || 'User';

    if (!userId) {
        redirect('/login');
    }

    return (
        <div className="min-h-screen bg-muted/20">
            <AppNavbar userName={userName} />
            <main className="container mx-auto max-w-5xl p-4 sm:p-6 lg:p-8 space-y-8">
                {children}
            </main>
        </div>
    );
}
