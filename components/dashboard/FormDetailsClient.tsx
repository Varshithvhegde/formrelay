'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Switch } from '@/components/ui/Switch'
import { Label } from '@/components/ui/Label'
import { ArrowLeft, Check, Code, Copy, Eye, EyeOff, FileText, Inbox, Monitor, Settings, Trash2, X, Search, ChevronLeft, ChevronRight, Globe, MapPin, Clock } from 'lucide-react'
import { RefreshCw } from 'lucide-react'
import NextLink from 'next/link'
import { cn } from '@/lib/utils'
import { deleteSubmission, updateForm, deleteForm, toggleFormStatus } from '@/app/actions'
import { useActionState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/AlertDialog"

interface FormDetailsClientProps {
    form: any
    submissions: any[]
    totalCount: number
    currentPage: number
    pageSize: number
    initialSearchQuery: string
}

type Tab = 'submissions' | 'setup' | 'settings'

const initialState: { error?: string; success?: string } = {
    error: '',
    success: '',
}

const getBrowserName = (userAgent: string) => {
    if (!userAgent) return 'Unknown'
    if (userAgent.includes('Firefox')) return 'Firefox'
    if (userAgent.includes('Chrome')) return 'Chrome'
    if (userAgent.includes('Safari')) return 'Safari'
    if (userAgent.includes('Edge')) return 'Edge'
    return 'Other'
}

const tryGetHostname = (url: string) => {
    try {
        return new URL(url).hostname
    } catch {
        return url
    }
}

export function FormDetailsClient({
    form,
    submissions: initialSubmissions,
    totalCount,
    currentPage,
    pageSize,
    initialSearchQuery
}: FormDetailsClientProps) {
    const [activeTab, setActiveTab] = useState<Tab>('submissions')
    const [submissions, setSubmissions] = useState(initialSubmissions)
    const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null)
    const [submissionToDelete, setSubmissionToDelete] = useState<string | null>(null)
    const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({})

    // Search and Pagination
    const [searchQuery, setSearchQuery] = useState(initialSearchQuery)
    const [isSearchPending, setIsSearchPending] = useState(false)
    const [isDeleteFormDialogOpen, setIsDeleteFormDialogOpen] = useState(false)
    const [isDeletingForm, setIsDeletingForm] = useState(false)
    const [emailEnabled, setEmailEnabled] = useState(form.email_notifications_enabled)

    // Action state for settings form
    const [state, updateAction, isUpdating] = useActionState(updateForm, initialState)
    const [isRefreshing, setIsRefreshing] = useState(false)

    const router = useRouter()
    const supabase = createClient()

    const [currentTotalCount, setCurrentTotalCount] = useState(totalCount)

    // Sync state with props when router.refresh() updates them
    useEffect(() => {
        setSubmissions(initialSubmissions)
        setCurrentTotalCount(totalCount)
    }, [initialSubmissions, totalCount])

    // Realtime subscription
    useEffect(() => {
        const channel = supabase
            .channel('realtime_submissions')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'submissions',
                    filter: `form_id=eq.${form.id}`,
                },
                (payload) => {
                    const newSubmission = payload.new as any
                    setSubmissions((prev) => [newSubmission, ...prev])
                    setCurrentTotalCount((prev) => prev + 1)
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'submissions',
                    filter: `form_id=eq.${form.id}`,
                },
                (payload) => {
                    setSubmissions((prev) => prev.map((sub) =>
                        sub.id === payload.new.id ? { ...sub, ...payload.new } : sub
                    ))
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'DELETE',
                    schema: 'public',
                    table: 'submissions',
                    filter: `form_id=eq.${form.id}`,
                },
                (payload) => {
                    setSubmissions((prev) => prev.filter((sub) => sub.id !== payload.old.id))
                    setCurrentTotalCount((prev) => Math.max(0, prev - 1))
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase, form.id])

    // Debounce search query update to URL
    useEffect(() => {
        // Skip initial render or matching query
        if (searchQuery === initialSearchQuery) return

        setIsSearchPending(true)
        const timer = setTimeout(() => {
            const params = new URLSearchParams()
            if (searchQuery) params.set('query', searchQuery)
            params.set('page', '1') // Reset to page 1 on search
            router.push(`?${params.toString()}`)
            setIsSearchPending(false)
        }, 300)
        return () => clearTimeout(timer)
    }, [searchQuery, router, initialSearchQuery])

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams()
        if (searchQuery) params.set('query', searchQuery)
        params.set('page', newPage.toString())
        router.push(`?${params.toString()}`)
    }

    const totalPages = Math.ceil(totalCount / pageSize)

    const handleManualRefresh = () => {
        setIsRefreshing(true)
        router.refresh()
        setTimeout(() => setIsRefreshing(false), 1000)
    }

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

    const handleDeleteClick = (e: React.MouseEvent, subId: string) => {
        e.stopPropagation()
        setSubmissionToDelete(subId)
    }

    const confirmDelete = async () => {
        if (!submissionToDelete) return

        // Optimistic update
        setSubmissions(prev => prev.filter(s => s.id !== submissionToDelete))
        // Server Action
        await deleteSubmission(submissionToDelete)
        setSubmissionToDelete(null)
    }

    const toggleReadStatus = async (e: React.MouseEvent, submission: any) => {
        e.stopPropagation()
        const newStatus = !submission.is_read

        // Optimistic update
        setSubmissions(prev => prev.map(s =>
            s.id === submission.id ? { ...s, is_read: newStatus } : s
        ))

        await supabase
            .from('submissions')
            .update({ is_read: newStatus })
            .eq('id', submission.id)
    }

    const handleSubmissionClick = async (submission: any) => {
        setSelectedSubmission(submission)
        if (!submission.is_read) {
            // Optimistic update
            setSubmissions(prev => prev.map(s =>
                s.id === submission.id ? { ...s, is_read: true } : s
            ))

            await supabase
                .from('submissions')
                .update({ is_read: true })
                .eq('id', submission.id)
        }
    }

    const handleFormDelete = async () => {
        setIsDeletingForm(true)
        try {
            await deleteForm(form.id)
            // Redirect is handled in server action
        } catch (error) {
            console.error('Failed to delete form:', error)
            setIsDeletingForm(false)
            setIsDeleteFormDialogOpen(false)
        }
    }

    const handleStatusToggle = async (checked: boolean) => {
        try {
            await toggleFormStatus(form.id, checked)
            router.refresh()
        } catch (error) {
            console.error('Failed to update status:', error)
        }
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <NextLink href="/dashboard/forms" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors w-fit">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </NextLink>
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
                        {currentTotalCount}
                    </span>
                </button>
                <div className="h-4 w-px bg-border/50 mx-2" />
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={handleManualRefresh} disabled={isRefreshing}>
                    <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
                </Button>
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
                <div className="animate-fade-in space-y-4">
                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search submissions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 bg-secondary/50 border-input w-full md:w-80"
                        />
                    </div>

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
                        <div className={cn("space-y-3", isSearchPending && "opacity-50 transition-opacity")}>
                            {submissions.map((sub) => {
                                const payload = typeof sub.payload === 'string' ? JSON.parse(sub.payload) : sub.payload
                                const name = payload.name || payload.firstName || payload['First Name'] || 'Unknown'
                                const email = payload.email || payload.Email || 'No email'
                                const message = payload.message || payload.Message || 'No message'

                                return (
                                    <div
                                        key={sub.id}
                                        onClick={() => handleSubmissionClick(sub)}
                                        className={cn(
                                            "group relative flex items-start justify-between p-4 rounded-xl border transition-all cursor-pointer",
                                            sub.is_read
                                                ? "bg-card/50 border-border hover:bg-secondary/50 hover:border-primary/30"
                                                : "bg-primary/5 border-primary/20 hover:border-primary/40"
                                        )}
                                    >
                                        <div className="flex gap-4">
                                            <div className={cn(
                                                "mt-1 h-2 w-2 rounded-full shrink-0",
                                                sub.is_read ? "bg-muted-foreground/30" : "bg-primary animate-pulse"
                                            )} />
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-medium text-foreground">{name}</span>
                                                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                                                        <Inbox className="h-3 w-3" /> {email}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-muted-foreground line-clamp-1">{message}</p>
                                                <div className="flex items-center gap-3 mt-2">
                                                    <p className="text-xs text-muted-foreground font-mono" suppressHydrationWarning>
                                                        {new Date(sub.created_at).toLocaleString()}
                                                    </p>
                                                    {sub.origin && (
                                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                            <Globe className="h-3 w-3" />
                                                            {tryGetHostname(sub.origin)}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 hover:text-primary"
                                                onClick={(e) => toggleReadStatus(e, sub)}
                                            >
                                                {sub.is_read ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 hover:text-destructive"
                                                onClick={(e) => handleDeleteClick(e, sub.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    {/* Pagination Controls */}
                    {totalCount > 0 && (
                        <div className="flex items-center justify-between pt-4 border-t border-border/50">
                            <p className="text-sm text-muted-foreground">
                                Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, totalCount)} of {totalCount}
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage <= 1 || isSearchPending}
                                    className="h-8 w-8 p-0"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <span className="text-sm font-medium">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage >= totalPages || isSearchPending}
                                    className="h-8 w-8 p-0"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
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
                                        className="bg-secondary/50 border-input"
                                        placeholder="you@example.com"
                                    />
                                    <p className="text-xs text-muted-foreground">Submissions will be sent to this email.</p>
                                </div>

                                <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm bg-secondary/20">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">Email Notifications</Label>
                                        <div className="text-xs text-muted-foreground">
                                            Receive email for each submission
                                        </div>
                                    </div>
                                    <Switch
                                        checked={emailEnabled}
                                        onCheckedChange={setEmailEnabled}
                                    />
                                    <input type="hidden" name="email_notifications_enabled" value={emailEnabled ? 'true' : 'false'} />
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

                    {/* Danger Zone */}
                    <Card className="glass-card mt-6 border-destructive/20">
                        <CardContent className="p-6 space-y-6">
                            <div className="flex items-center gap-3 border-b border-destructive/20 pb-4 mb-4">
                                <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
                                <h3 className="text-lg font-semibold text-destructive">Danger Zone</h3>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Form Status</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Enable or disable new submissions.
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={cn("text-xs font-medium uppercase", form.is_active ? "text-green-500" : "text-destructive")}>
                                        {form.is_active ? 'Active' : 'Disabled'}
                                    </span>
                                    <Switch
                                        checked={form.is_active}
                                        onCheckedChange={handleStatusToggle}
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-border/50 flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base text-destructive">Delete Form</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Permanently remove this form and all its data.
                                    </p>
                                </div>
                                <Button
                                    variant="destructive"
                                    onClick={() => setIsDeleteFormDialogOpen(true)}
                                >
                                    Delete Form
                                </Button>
                            </div>
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
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider mb-1">
                                        <Clock className="h-3 w-3" /> Submitted
                                    </div>
                                    <p className="font-mono text-sm" suppressHydrationWarning>{new Date(selectedSubmission.created_at).toLocaleString()}</p>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider mb-1">
                                        <Globe className="h-3 w-3" /> Origin
                                    </div>
                                    <p className="font-mono text-sm truncate" title={selectedSubmission.origin}>
                                        {selectedSubmission.origin || 'Direct API'}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider mb-1">
                                        <MapPin className="h-3 w-3" /> IP Address
                                    </div>
                                    <p className="font-mono text-sm">{selectedSubmission.ip_address || 'Unknown'}</p>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider mb-1">
                                        <Monitor className="h-3 w-3" /> Browser
                                    </div>
                                    <p className="font-mono text-sm text-muted-foreground truncate" title={selectedSubmission.user_agent}>
                                        {getBrowserName(selectedSubmission.user_agent)}
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
            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!submissionToDelete} onOpenChange={(open) => !open && setSubmissionToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the submission.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete Form Confirmation Dialog */}
            <AlertDialog open={isDeleteFormDialogOpen} onOpenChange={setIsDeleteFormDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete this form?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the form <strong>{form.name}</strong> and all {totalCount} submissions associated with it.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeletingForm}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault()
                                handleFormDelete()
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={isDeletingForm}
                        >
                            {isDeletingForm ? 'Deleting...' : 'Delete Form'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}