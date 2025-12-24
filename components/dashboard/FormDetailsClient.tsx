'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { ArrowLeft, Check, Code, Copy, Eye, FileText, Inbox, Monitor, Settings, Trash2, X } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { deleteSubmission, updateForm } from '@/app/actions'
import { useActionState } from 'react'

interface FormDetailsClientProps {
    form: any
    submissions: any[]
}

type Tab = 'submissions' | 'setup' | 'settings'

const initialState = {
    error: '',
    success: '',
}

export function FormDetailsClient({ form, submissions: initialSubmissions }: FormDetailsClientProps) {
    const [activeTab, setActiveTab] = useState<Tab>('submissions')
    const [submissions, setSubmissions] = useState(initialSubmissions)
    const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null)
    const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({})

    // Action state for settings form
    const [state, updateAction, isUpdating] = useActionState(updateForm, initialState)

    const endpointUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/submit`

    const getBrowserName = (userAgent: string) => {
        if (!userAgent) return 'Unknown'
        if (userAgent.includes('Edg/')) return 'Edge'
        if (userAgent.includes('Chrome/')) return 'Chrome'
        if (userAgent.includes('Firefox/')) return 'Firefox'
        if (userAgent.includes('Safari/')) return 'Safari'
        return 'Web View'
    }

    const copyToClipboard = (text: string, key: string) => {
        navigator.clipboard.writeText(text)
        setCopiedStates(prev => ({ ...prev, [key]: true }))
        setTimeout(() => {
            setCopiedStates(prev => ({ ...prev, [key]: false }))
        }, 2000)
    }

    const handleDeleteSubmission = async (e: React.MouseEvent, subId: string) => {
        e.stopPropagation()
        if (confirm('Delete this submission?')) {
            // Optimistic update
            setSubmissions(prev => prev.filter(s => s.id !== subId))
            // Server Action
            await deleteSubmission(subId)
        }
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <Link href="/dashboard/forms" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors w-fit">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Link>
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold tracking-tight text-foreground">{form.name}</h1>
                            <span className={cn(
                                "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border",
                                form.is_active
                                    ? "bg-[hsl(142,76%,36%)]/10 text-[hsl(142,76%,36%)] border-[hsl(142,76%,36%)]/20"
                                    : "bg-destructive/10 text-destructive border-destructive/20"
                            )}>
                                <span className={cn("h-1.5 w-1.5 rounded-full", form.is_active ? "bg-[hsl(142,76%,36%)]" : "bg-destructive")} />
                                {form.is_active ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        <p className="font-mono text-sm text-muted-foreground mt-2">{form.id}</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 border-b border-border/50 pb-6">
                <button
                    onClick={() => setActiveTab('submissions')}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                        activeTab === 'submissions'
                            ? "bg-secondary text-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    )}
                >
                    <Inbox className="h-4 w-4" />
                    Submissions
                    <span className="ml-1 text-xs bg-background/50 px-1.5 py-0.5 rounded-full border border-border/50">
                        {submissions.length}
                    </span>
                </button>
                <button
                    onClick={() => setActiveTab('setup')}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                        activeTab === 'setup'
                            ? "bg-secondary text-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    )}
                >
                    <Code className="h-4 w-4" />
                    Setup
                </button>
                <button
                    onClick={() => setActiveTab('settings')}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                        activeTab === 'settings'
                            ? "bg-secondary text-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    )}
                >
                    <Settings className="h-4 w-4" />
                    Settings
                </button>
            </div>

            {/* Submissions Tab */}
            {activeTab === 'submissions' && (
                <div className="animate-fade-in">
                    {submissions.length === 0 ? (
                        <div className="text-center py-20 bg-secondary/20 rounded-xl border border-dashed border-border/50">
                            <div className="bg-secondary/50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Inbox className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-medium mb-1">No submissions yet</h3>
                            <p className="text-muted-foreground max-w-sm mx-auto">
                                Submissions from your form will appear here. Check the Setup tab to integrate your form.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {submissions.map((sub) => {
                                const payload = typeof sub.payload === 'string' ? JSON.parse(sub.payload) : sub.payload
                                const name = payload.name || payload.firstName || payload['First Name'] || 'Unknown'
                                const email = payload.email || payload.Email || 'No email'
                                const message = payload.message || payload.Message || Object.values(payload).join(' ').slice(0, 100)

                                return (
                                    <div
                                        key={sub.id}
                                        onClick={() => setSelectedSubmission(sub)}
                                        className="group relative flex items-start justify-between p-4 rounded-xl border border-border bg-card/50 hover:bg-secondary/50 hover:border-primary/30 transition-all cursor-pointer"
                                    >
                                        <div className="flex gap-4">
                                            <div className="mt-1 h-2 w-2 rounded-full bg-primary shrink-0" />
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-medium text-foreground">{name}</span>
                                                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                                                        <Inbox className="h-3 w-3" /> {email}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-muted-foreground line-clamp-1">{message}</p>
                                                <p className="text-xs text-muted-foreground mt-2 font-mono" suppressHydrationWarning>
                                                    {new Date(sub.created_at).toLocaleString()} • {sub.ip_address || 'No IP'} • {getBrowserName(sub.user_agent)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 hover:text-primary"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setSelectedSubmission(sub)
                                                }}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 hover:text-destructive"
                                                onClick={(e) => handleDeleteSubmission(e, sub.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Setup Tab */}
            {activeTab === 'setup' && (
                <div className="space-y-6 animate-fade-in">
                    <Card className="glass-card">
                        <CardContent className="p-6 space-y-4">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                <Code className="h-5 w-5 text-primary" />
                                API Endpoint
                            </h3>
                            <div className="relative group">
                                <div className="font-mono text-sm bg-secondary/50 border border-border rounded-lg p-4 break-all pr-12">
                                    POST {endpointUrl}
                                </div>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="absolute right-2 top-2 h-8 w-8"
                                    onClick={() => copyToClipboard(endpointUrl, 'endpoint')}
                                >
                                    {copiedStates['endpoint'] ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="glass-card">
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-primary" />
                                    HTML Form Example
                                </h3>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded border border-border">
                                    HTML
                                </div>
                            </div>

                            <div className="relative group rounded-lg overflow-hidden border border-border">
                                <div className="absolute right-2 top-2 z-10">
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8 bg-background/50 backdrop-blur-sm border border-border/50 hover:bg-background"
                                        onClick={() => copyToClipboard(`<form action="${endpointUrl}" method="POST">
  <input type="hidden" name="form_id" value="${form.id}" />
  <input type="email" name="email" placeholder="Email" required />
  <textarea name="message" placeholder="Message" required></textarea>
  <button type="submit">Send</button>
</form>`, 'html')}
                                    >
                                        {copiedStates['html'] ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                </div>
                                <pre className="text-sm font-mono p-4 bg-secondary/30 overflow-x-auto text-foreground/90">
                                    {`<form action="${endpointUrl}" method="POST">
  <input type="hidden" name="form_id" value="${form.id}" />
  <input type="email" name="email" placeholder="Email" required />
  <textarea name="message" placeholder="Message" required></textarea>
  <button type="submit">Send</button>
</form>`}
                                </pre>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="glass-card">
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                    <Code className="h-5 w-5 text-primary" />
                                    JavaScript Fetch Example
                                </h3>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded border border-border">
                                    JAVASCRIPT
                                </div>
                            </div>

                            <div className="relative group rounded-lg overflow-hidden border border-border">
                                <div className="absolute right-2 top-2 z-10">
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8 bg-background/50 backdrop-blur-sm border border-border/50 hover:bg-background"
                                        onClick={() => copyToClipboard(`fetch("${endpointUrl}", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    form_id: "${form.id}",
    name: "John Doe",
    email: "john@example.com",
    message: "Hello!"
  })
})`, 'js')}
                                    >
                                        {copiedStates['js'] ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                </div>
                                <pre className="text-sm font-mono p-4 bg-secondary/30 overflow-x-auto text-foreground/90">
                                    {`fetch("${endpointUrl}", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    form_id: "${form.id}",
    name: "John Doe",
    email: "john@example.com",
    message: "Hello!"
  })
})`}
                                </pre>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
                <div className="max-w-xl mx-auto animate-fade-in">
                    <Card className="glass-card">
                        <CardContent className="p-6 space-y-6">
                            <div className="flex items-center gap-3 border-b border-border/50 pb-4 mb-4">
                                <Settings className="h-5 w-5 text-primary" />
                                <h3 className="text-lg font-semibold">Form Settings</h3>
                            </div>

                            <form action={updateAction} className="space-y-6">
                                <input type="hidden" name="id" value={form.id} />

                                <div className="space-y-2">
                                    <Label htmlFor="name">Form Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        defaultValue={form.name}
                                        required
                                        className="bg-secondary/50 border-input"
                                        placeholder="e.g. Contact Us"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="notification_email">Notification Email</Label>
                                    <Input
                                        id="notification_email"
                                        name="notification_email"
                                        type="email"
                                        defaultValue={form.notification_email}
                                        required
                                        className="bg-secondary/50 border-input"
                                        placeholder="you@example.com"
                                    />
                                    <p className="text-xs text-muted-foreground">Submissions will be sent to this email.</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="allowed_domains">Allowed Domains</Label>
                                    <Input
                                        id="allowed_domains"
                                        name="allowed_domains"
                                        defaultValue={form.allowed_domains?.join(', ')}
                                        className="bg-secondary/50 border-input"
                                        placeholder="example.com, myblog.com"
                                    />
                                    <p className="text-xs text-muted-foreground">Comma-separated list of domains. Leave empty to allow all.</p>
                                </div>

                                {state?.error && (
                                    <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20">
                                        {state.error}
                                    </div>
                                )}

                                {state?.success && (
                                    <div className="bg-[hsl(142,76%,36%)]/10 text-[hsl(142,76%,36%)] text-sm p-3 rounded-md border border-[hsl(142,76%,36%)]/20">
                                        {state.success}
                                    </div>
                                )}

                                <div className="pt-4 flex justify-end">
                                    <Button type="submit" isLoading={isUpdating}>Save Changes</Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Submission Details Modal */}
            {selectedSubmission && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
                        onClick={() => setSelectedSubmission(null)}
                    />
                    <div className="relative w-full max-w-2xl bg-[#0f1117] border border-border rounded-xl shadow-2xl animate-scale-in overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-border/50">
                            <div className="flex items-center gap-3">
                                <h2 className="text-xl font-semibold">Submission Details</h2>
                                <span className="px-2 py-0.5 text-xs font-medium bg-secondary text-muted-foreground rounded-full border border-border">
                                    Read
                                </span>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-secondary rounded-full"
                                onClick={() => setSelectedSubmission(null)}
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            {/* Metadata Card */}
                            <div className="bg-secondary/20 rounded-xl p-4 border border-border/50 mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider mb-1">
                                        <Inbox className="h-3 w-3" /> Submitted
                                    </div>
                                    <p className="font-mono text-sm" suppressHydrationWarning>{new Date(selectedSubmission.created_at).toLocaleString()}</p>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider mb-1">
                                        <Monitor className="h-3 w-3" /> System
                                    </div>
                                    <p className="font-mono text-sm text-muted-foreground truncate" title={selectedSubmission.user_agent}>
                                        {selectedSubmission.ip_address} • {selectedSubmission.user_agent.split(')')[0] + ')'}
                                    </p>
                                </div>
                            </div>

                            {/* Payload Fields */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold">Form Data</h3>
                                {Object.entries(selectedSubmission.payload || {}).map(([key, value]) => (
                                    <div key={key} className="space-y-2">
                                        <Label className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</Label>
                                        <div className="w-full rounded-lg border border-border bg-secondary/30 px-4 py-3 text-sm text-foreground font-mono whitespace-pre-wrap break-words">
                                            {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
