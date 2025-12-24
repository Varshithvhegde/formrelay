import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { FileText, TrendingUp, Inbox, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // Fetch Forms
    const { data: forms } = await supabase
        .from('forms')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    const formsCount = forms?.length || 0
    const activeForms = forms?.filter(f => f.is_active).length || 0

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground mt-1">Welcome back! Here's an overview of your forms.</p>
                </div>
                <Link href="/dashboard/forms/new">
                    <Button className="shadow-lg shadow-primary/25">New Form</Button>
                </Link>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="glass-card">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Forms</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formsCount}</div>
                    </CardContent>
                </Card>
                <Card className="glass-card">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Active Forms</CardTitle>
                        <TrendingUp className="h-4 w-4 text-[hsl(142,76%,36%)]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-[hsl(142,76%,36%)]">{activeForms}</div>
                    </CardContent>
                </Card>
                <Card className="glass-card">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">This Month</CardTitle>
                        <Inbox className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">--</div>
                        <p className="text-xs text-muted-foreground">submissions</p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Forms */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Recent Forms</h2>
                    <Link href="/dashboard/forms" className="text-sm text-primary hover:underline flex items-center gap-1">
                        View all <ArrowRight className="h-3 w-3" />
                    </Link>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {forms?.slice(0, 6).map((form) => (
                        <Link key={form.id} href={`/dashboard/forms/${form.id}`} className="block group">
                            <Card className="h-full hover:border-primary/50 hover:bg-card/80 transition-all duration-300">
                                <CardHeader className="space-y-0 pb-2">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-base font-medium truncate pr-4">{form.name}</CardTitle>
                                        {form.is_active ? (
                                            <div className="h-2 w-2 rounded-full bg-[hsl(142,76%,36%)]" />
                                        ) : (
                                            <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(form.created_at).toLocaleDateString()}
                                    </p>
                                    <div className="mt-4 flex items-center text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                                        Manage Form <ArrowRight className="ml-1 h-3 w-3" />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                    {(!forms || forms.length === 0) && (
                        <div className="col-span-full py-12 text-center bg-card/30 border border-dashed border-border rounded-xl">
                            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                            <h3 className="text-lg font-medium">No forms yet</h3>
                            <p className="text-muted-foreground mb-6">Create your first form to get started</p>
                            <Link href="/dashboard/forms/new">
                                <Button>Create Form</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
