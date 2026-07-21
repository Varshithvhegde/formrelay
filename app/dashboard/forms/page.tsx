import { createClient } from '@/utils/supabase/server'
import { FileText, ArrowRight, Plus } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { CreateFormDialog } from '@/components/dashboard/CreateFormDialog'

export default async function FormsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data: forms } = await supabase
        .from('forms')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            <div className="flex items-end justify-between">
                <div>
                    <p className="text-sm text-muted-foreground mb-1">Manage</p>
                    <h1 className="text-3xl font-bold tracking-tight">My Forms</h1>
                </div>
                <CreateFormDialog trigger={
                    <Button className="shadow-lg shadow-primary/20 shrink-0">
                        <Plus className="h-4 w-4" /> New Form
                    </Button>
                } />
            </div>

            {forms && forms.length > 0 && (
                <div className="flex items-center gap-4 text-sm text-muted-foreground border-b border-border/40 pb-4">
                    <span>{forms.length} form{forms.length !== 1 ? 's' : ''}</span>
                    <span>·</span>
                    <span className="text-emerald-400">{forms.filter(f => f.is_active).length} active</span>
                </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {forms?.map((form) => (
                    <Link key={form.id} href={`/dashboard/forms/${form.id}`} className="block group will-gpu">
                        <div className="h-full p-5 rounded-xl border border-border bg-card/40 hover:bg-card/70 hover:border-primary/30 transition-all duration-200 relative overflow-hidden">
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,hsl(187_85%_53%/0.05),transparent)] opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none" />

                            <div className="flex items-start justify-between mb-3">
                                <div className="p-2 rounded-lg bg-secondary/60">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <span className={`h-1.5 w-1.5 rounded-full ${form.is_active ? 'bg-emerald-400' : 'bg-muted-foreground/40'}`} />
                                    <span className={`text-xs font-medium ${form.is_active ? 'text-emerald-400' : 'text-muted-foreground'}`}>
                                        {form.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>

                            <p className="font-semibold text-foreground text-sm truncate mb-1">{form.name}</p>
                            <p className="text-xs text-muted-foreground mb-1">
                                Created {new Date(form.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                            {form.allowed_domains?.length > 0 && (
                                <p className="text-xs text-muted-foreground/60">
                                    {form.allowed_domains.length} domain{form.allowed_domains.length !== 1 ? 's' : ''}
                                </p>
                            )}

                            <div className="mt-4 flex items-center text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-all duration-200 -translate-y-1 group-hover:translate-y-0">
                                View details <ArrowRight className="ml-1 h-3 w-3" />
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
                        <CreateFormDialog trigger={
                            <Button><Plus className="h-4 w-4" /> Create Form</Button>
                        } />
                    </div>
                )}
            </div>
        </div>
    )
}
