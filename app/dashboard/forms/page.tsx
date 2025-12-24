import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { Plus, ArrowRight, FileText } from 'lucide-react'

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
        <div className="space-y-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">My Forms</h1>
                <Link href="/dashboard/forms/new">
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        New Form
                    </Button>
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {forms?.map((form) => (
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
                                <div className="text-xs text-muted-foreground space-y-1">
                                    <p>Created: {new Date(form.created_at).toLocaleDateString()}</p>
                                    {form.allowed_domains && form.allowed_domains.length > 0 && (
                                        <p className="truncate">Limit: {form.allowed_domains.length} domains</p>
                                    )}
                                </div>
                                <div className="mt-4 flex items-center text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                                    View Details <ArrowRight className="ml-1 h-3 w-3" />
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
    )
}
