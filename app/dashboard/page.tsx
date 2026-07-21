import { createClient } from '@/utils/supabase/server'
import { Card, CardContent } from '@/components/ui/Card'
import { FileText, TrendingUp, Inbox, ArrowRight, Plus } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { CreateFormDialog } from '@/components/dashboard/CreateFormDialog'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data: forms } = await supabase
        .from('forms')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    const formsCount = forms?.length || 0
    const activeForms = forms?.filter(f => f.is_active).length || 0
    const displayName = user.email?.split('@')[0] ?? 'there'

    const stats = [
        {
            label: 'Total Forms',
            value: formsCount,
            icon: FileText,
            color: 'text-muted-foreground',
            bg: 'bg-secondary/60',
        },
        {
            label: 'Active',
            value: activeForms,
            icon: TrendingUp,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10',
        },
        {
            label: 'This Month',
            value: '—',
            sub: 'submissions',
            icon: Inbox,
            color: 'text-primary',
            bg: 'bg-primary/10',
        },
    ]

    return (
        <div className="space-y-10 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <p className="text-sm text-muted-foreground mb-1">Welcome back</p>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Hey, <span className="gradient-text">{displayName}</span> 👋
                    </h1>
                </div>
                <CreateFormDialog trigger={
                    <Button className="shadow-lg shadow-primary/20 shrink-0">
                        <Plus className="h-4 w-4" /> New Form
                    </Button>
                } />
            </div>

            {/* Stats row */}
            <div className="grid gap-4 sm:grid-cols-3">
                {stats.map((stat) => (
                    <Card key={stat.label} className="glass-card overflow-hidden">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                                <div className={`p-2 rounded-lg ${stat.bg}`}>
                                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                                </div>
                            </div>
                            <div className={`text-3xl font-bold tabular-nums ${stat.color}`}>{stat.value}</div>
                            {stat.sub && <p className="text-xs text-muted-foreground mt-0.5">{stat.sub}</p>}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Recent Forms */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Recent Forms</h2>
                    <Link
                        href="/dashboard/forms"
                        className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5"
                    >
                        View all <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {forms?.slice(0, 6).map((form) => (
                        <Link key={form.id} href={`/dashboard/forms/${form.id}`} className="block group will-gpu">
                            <div className="h-full p-5 rounded-xl border border-border bg-card/40 hover:bg-card/70 hover:border-primary/30 transition-all duration-200 relative overflow-hidden">
                                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,hsl(187_85%_53%/0.05),transparent)] opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none" />

                                <div className="flex items-start justify-between mb-3">
                                    <div className="p-2 rounded-lg bg-secondary/60">
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <span className={`h-2 w-2 rounded-full mt-1 ${form.is_active ? 'bg-emerald-400' : 'bg-muted-foreground/40'}`} />
                                </div>

                                <p className="font-semibold text-foreground text-sm truncate mb-1">{form.name}</p>
                                <p className="text-xs text-muted-foreground">
                                    {new Date(form.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>

                                <div className="mt-4 flex items-center text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-all duration-200 -translate-y-1 group-hover:translate-y-0">
                                    Open <ArrowRight className="ml-1 h-3 w-3" />
                                </div>
                            </div>
                        </Link>
                    ))}

                    {(!forms || forms.length === 0) && (
                        <div className="col-span-full py-16 text-center rounded-2xl border border-dashed border-border/60 bg-secondary/10">
                            <div className="h-14 w-14 rounded-2xl border border-border/60 bg-card flex items-center justify-center mx-auto mb-4">
                                <FileText className="h-6 w-6 text-muted-foreground/50" />
                            </div>
                            <h3 className="font-semibold mb-1">No forms yet</h3>
                            <p className="text-sm text-muted-foreground mb-6">Create your first form to start receiving submissions</p>
                            <CreateFormDialog />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
