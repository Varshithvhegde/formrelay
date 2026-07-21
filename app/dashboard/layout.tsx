import { createClient } from '@/utils/supabase/server'
import { Sidebar } from '@/components/dashboard/Sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    return (
        <div className="min-h-screen bg-background text-foreground font-sans">
            <Sidebar userEmail={user?.email} />

            {/* Main content */}
            <div className="lg:pl-60 pt-14 lg:pt-0 min-h-screen flex flex-col">
                <main className="flex-1 p-6 lg:p-8 animate-fade-in relative z-0">
                    {children}
                </main>
            </div>
        </div>
    )
}
