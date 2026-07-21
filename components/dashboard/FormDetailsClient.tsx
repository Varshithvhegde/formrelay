'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Switch } from '@/components/ui/Switch'
import { Label } from '@/components/ui/Label'
import { ArrowLeft, Check, Code, Copy, Eye, EyeOff, FileText, Inbox, Monitor, Settings, Trash2, X, Search, ChevronLeft, ChevronRight, Globe, MapPin, Clock, Play, AlertCircle, CheckCircle2 } from 'lucide-react'
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

type Tab = 'submissions' | 'setup' | 'settings' | 'playground'

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

    // Playground state
    const [testName, setTestName] = useState('John Doe')
    const [testEmail, setTestEmail] = useState('john@example.com')
    const [testMessage, setTestMessage] = useState('This is a test message.')
    const [isTesting, setIsTesting] = useState(false)
    const [testResult, setTestResult] = useState<{ success: boolean; data?: any; error?: string; status?: number } | null>(null)

    const handleTestSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsTesting(true)
        setTestResult(null)

        try {
            const res = await fetch(endpointUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    form_id: form.id,
                    name: testName,
                    email: testEmail,
                    message: testMessage,
                })
            })

            const data = await res.json()
            setTestResult({
                success: res.ok,
                status: res.status,
                data: data,
                error: !res.ok ? data.error || 'Request failed' : undefined
            })

            // Refresh submissions list slightly after to ensure realtime catches it or manual refresh works
            if (res.ok) {
                // optional: trigger a soft refetch if needed, but realtime usually handles it
            }

        } catch (err: any) {
            setTestResult({
                success: false,
                error: err.message || 'Network error'
            })
        } finally {
            setIsTesting(false)
        }
    }

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
            <div className="flex flex-col gap-3">
                <NextLink href="/dashboard/forms" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit">
                    <ArrowLeft className="h-3.5 w-3.5" />
                    All forms
                </NextLink>
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">{form.name}</h1>
                            <span className={cn(
                                "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border",
                                form.is_active
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                    : "bg-destructive/10 text-destructive border-destructive/20"
                            )}>
                                <span className={cn("h-1.5 w-1.5 rounded-full", form.is_active ? "bg-emerald-400" : "bg-destructive")} />
                                {form.is_active ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        <p className="font-mono text-xs text-muted-foreground/60 mt-1 select-all">{form.id}</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 border-b border-border/50 pb-0 -mb-px overflow-x-auto">
                {([
                    { id: 'submissions' as Tab, label: 'Submissions', icon: Inbox, badge: currentTotalCount as number | undefined },
                    { id: 'playground'  as Tab, label: 'Playground',  icon: Play,  badge: undefined },
                    { id: 'setup'       as Tab, label: 'Setup',       icon: Code,  badge: undefined },
                    { id: 'settings'    as Tab, label: 'Settings',    icon: Settings, badge: undefined },
                ]).map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all whitespace-nowrap border-b-2 -mb-px",
                            activeTab === tab.id
                                ? "text-primary border-primary"
                                : "text-muted-foreground border-transparent hover:text-foreground hover:border-border"
                        )}
                    >
                        <tab.icon className="h-4 w-4" />
                        {tab.label}
                        {tab.badge !== undefined && (
                            <span className={cn(
                                "text-xs px-1.5 py-0.5 rounded-full border",
                                activeTab === tab.id
                                    ? "bg-primary/10 text-primary border-primary/20"
                                    : "bg-secondary/60 text-muted-foreground border-border/50"
                            )}>
                                {tab.badge}
                            </span>
                        )}
                    </button>
                ))}
                <div className="flex-1" />
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground mb-1 shrink-0" onClick={handleManualRefresh} disabled={isRefreshing}>
                    <RefreshCw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")} />
                </Button>
            </div>

            {/* Submissions Tab */}
            {activeTab === 'submissions' && (
                <div className="animate-fade-in space-y-4">
                    {/* Search Bar — full width, prominent */}
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search by name, email, or message…"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-secondary/40 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>

                    {submissions.length === 0 ? (
                        <div className="text-center py-20 bg-secondary/10 rounded-2xl border border-dashed border-border/50">
                            <div className="h-14 w-14 rounded-2xl border border-border/60 bg-card flex items-center justify-center mx-auto mb-4">
                                <Inbox className="h-6 w-6 text-muted-foreground/50" />
                            </div>
                            <h3 className="font-semibold mb-1">
                                {searchQuery ? 'No results found' : 'No submissions yet'}
                            </h3>
                            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                                {searchQuery
                                    ? `No submissions match "${searchQuery}"`
                                    : <>Submissions appear here instantly. Check the <button onClick={() => setActiveTab('setup')} className="text-primary hover:underline">Setup tab</button> to integrate your form.</>
                                }
                            </p>
                        </div>
                    ) : (
                        <div className={cn("space-y-2", isSearchPending && "opacity-40 pointer-events-none transition-opacity")}>
                            {submissions.map((sub) => {
                                const payload = typeof sub.payload === 'string' ? JSON.parse(sub.payload) : sub.payload
                                const name = payload.name || payload.firstName || payload['First Name'] || 'Unknown'
                                const email = payload.email || payload.Email || ''
                                const message = payload.message || payload.Message || ''
                                const initials = name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()

                                return (
                                    <div
                                        key={sub.id}
                                        onClick={() => handleSubmissionClick(sub)}
                                        className={cn(
                                            "group relative flex items-start gap-4 px-4 py-4 rounded-xl border transition-all duration-150 cursor-pointer",
                                            sub.is_read
                                                ? "bg-card/30 border-border/50 hover:bg-card/60 hover:border-border"
                                                : "bg-primary/5 border-primary/20 hover:bg-primary/8 hover:border-primary/35"
                                        )}
                                    >
                                        {/* Avatar */}
                                        <div className={cn(
                                            "h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5",
                                            sub.is_read
                                                ? "bg-secondary text-muted-foreground"
                                                : "bg-primary/15 text-primary border border-primary/25"
                                        )}>
                                            {initials}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            {/* Row 1: name + email + unread pill */}
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={cn(
                                                    "text-sm font-semibold truncate",
                                                    sub.is_read ? "text-foreground/80" : "text-foreground"
                                                )}>{name}</span>
                                                {email && (
                                                    <span className="text-xs text-muted-foreground truncate shrink-0">{email}</span>
                                                )}
                                                {!sub.is_read && (
                                                    <span className="ml-auto shrink-0 h-1.5 w-1.5 rounded-full bg-primary" />
                                                )}
                                            </div>
                                            {/* Row 2: message preview */}
                                            {message && (
                                                <p className="text-sm text-muted-foreground line-clamp-1 mb-2">{message}</p>
                                            )}
                                            {/* Row 3: time + origin */}
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs text-muted-foreground/60 font-mono" suppressHydrationWarning>
                                                    {new Date(sub.created_at).toLocaleString()}
                                                </span>
                                                {sub.origin && (
                                                    <span className="text-xs text-muted-foreground/50 flex items-center gap-1">
                                                        <Globe className="h-3 w-3" />
                                                        {tryGetHostname(sub.origin)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions — visible on hover */}
                                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5">
                                            <button
                                                title={sub.is_read ? 'Mark unread' : 'Mark read'}
                                                className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                                                onClick={(e) => toggleReadStatus(e, sub)}
                                            >
                                                {sub.is_read ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                            </button>
                                            <button
                                                title="Delete"
                                                className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                                onClick={(e) => handleDeleteClick(e, sub.id)}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalCount > pageSize && (
                        <div className="flex items-center justify-between pt-3 border-t border-border/40 mt-2">
                            <p className="text-xs text-muted-foreground">
                                {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, totalCount)} of {totalCount}
                            </p>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage <= 1 || isSearchPending}
                                    className="h-7 w-7 rounded-lg flex items-center justify-center border border-border/60 text-muted-foreground hover:border-border hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                >
                                    <ChevronLeft className="h-3.5 w-3.5" />
                                </button>
                                <span className="text-xs font-medium px-2 text-muted-foreground">
                                    {currentPage} / {totalPages}
                                </span>
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage >= totalPages || isSearchPending}
                                    className="h-7 w-7 rounded-lg flex items-center justify-center border border-border/60 text-muted-foreground hover:border-border hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                >
                                    <ChevronRight className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Setup Tab */}
            {activeTab === 'setup' && (
                <div className="space-y-5 animate-fade-in">
                    {/* Endpoint */}
                    <div className="rounded-2xl border border-border overflow-hidden bg-card/50">
                        <div className="flex items-center justify-between px-5 py-3 border-b border-border/50 bg-secondary/30">
                            <div className="flex items-center gap-2">
                                <Code className="h-4 w-4 text-primary" />
                                <span className="text-sm font-semibold">API Endpoint</span>
                            </div>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                onClick={() => copyToClipboard(endpointUrl, 'endpoint')}
                            >
                                {copiedStates['endpoint'] ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                            </Button>
                        </div>
                        <div className="px-5 py-4 font-mono text-sm text-foreground/90 break-all">
                            <span className="text-primary/70 mr-2">POST</span>{endpointUrl}
                        </div>
                    </div>

                    {/* HTML */}
                    <div className="rounded-2xl border border-border overflow-hidden bg-card/50">
                        <div className="flex items-center justify-between px-5 py-3 border-b border-border/50 bg-secondary/30">
                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-primary" />
                                <span className="text-sm font-semibold">HTML Form</span>
                                <span className="text-xs font-mono text-muted-foreground/60 bg-secondary px-1.5 py-0.5 rounded border border-border/50">html</span>
                            </div>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                onClick={() => copyToClipboard(`<form action="${endpointUrl}" method="POST">
  <input type="hidden" name="form_id" value="${form.id}" />
  <input type="email" name="email" placeholder="Email" required />
  <textarea name="message" placeholder="Message" required></textarea>
  <button type="submit">Send</button>
</form>`, 'html')}
                            >
                                {copiedStates['html'] ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                            </Button>
                        </div>
                        <pre className="text-sm font-mono px-5 py-4 bg-secondary/10 overflow-x-auto text-foreground/90 leading-relaxed custom-scrollbar">
                            {`<form action="${endpointUrl}" method="POST">
  <input type="hidden" name="form_id" value="${form.id}" />
  <input type="email" name="email" placeholder="Email" required />
  <textarea name="message" placeholder="Message" required></textarea>
  <button type="submit">Send</button>
</form>`}
                        </pre>
                    </div>

                    {/* JS */}
                    <div className="rounded-2xl border border-border overflow-hidden bg-card/50">
                        <div className="flex items-center justify-between px-5 py-3 border-b border-border/50 bg-secondary/30">
                            <div className="flex items-center gap-2">
                                <Code className="h-4 w-4 text-primary" />
                                <span className="text-sm font-semibold">JavaScript Fetch</span>
                                <span className="text-xs font-mono text-muted-foreground/60 bg-secondary px-1.5 py-0.5 rounded border border-border/50">js</span>
                            </div>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
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
                                {copiedStates['js'] ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                            </Button>
                        </div>
                        <pre className="text-sm font-mono px-5 py-4 bg-secondary/10 overflow-x-auto text-foreground/90 leading-relaxed custom-scrollbar">
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
                </div>
            )}

            {/* Playground Tab */}
            {activeTab === 'playground' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
                    {/* Test Form */}
                    <Card className="glass-card">
                        <CardContent className="p-6 space-y-6">
                            <div className="flex items-center gap-3 border-b border-border/50 pb-4">
                                <Play className="h-5 w-5 text-primary" />
                                <h3 className="text-lg font-semibold">Test Submission</h3>
                            </div>

                            <form onSubmit={handleTestSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="testName">Name</Label>
                                    <Input
                                        id="testName"
                                        value={testName}
                                        onChange={(e) => setTestName(e.target.value)}
                                        placeholder="John Doe"
                                        className="bg-secondary/50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="testEmail">Email</Label>
                                    <Input
                                        id="testEmail"
                                        type="email"
                                        value={testEmail}
                                        onChange={(e) => setTestEmail(e.target.value)}
                                        placeholder="john@example.com"
                                        className="bg-secondary/50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="testMessage">Message</Label>
                                    <Input
                                        id="testMessage"
                                        value={testMessage}
                                        onChange={(e) => setTestMessage(e.target.value)}
                                        placeholder="Hello world!"
                                        className="bg-secondary/50"
                                    />
                                </div>

                                <div className="pt-4">
                                    <Button type="submit" disabled={isTesting} className="w-full">
                                        {isTesting ? (
                                            <>
                                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Play className="mr-2 h-4 w-4" />
                                                Send Test Request
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Response Viewer */}
                    <div className="space-y-6">
                        <Card className="glass-card h-full">
                            <CardContent className="p-6 space-y-4 h-full flex flex-col">
                                <div className="flex items-center justify-between border-b border-border/50 pb-4">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <Monitor className="h-5 w-5 text-primary" />
                                        Response
                                    </h3>
                                    {testResult && (
                                        <span className={cn(
                                            "text-xs font-mono px-2 py-1 rounded border",
                                            testResult.success
                                                ? "bg-green-500/10 text-green-500 border-green-500/20"
                                                : "bg-red-500/10 text-red-500 border-red-500/20"
                                        )}>
                                            Status: {testResult.status || (testResult.success ? 200 : 500)}
                                        </span>
                                    )}
                                </div>

                                <div className="flex-1 bg-black/40 rounded-lg border border-border/50 p-4 font-mono text-sm overflow-auto custom-scrollbar relative min-h-[300px]">
                                    {testResult ? (
                                        <div className="space-y-2 animate-fade-in">
                                            {testResult.success ? (
                                                <div className="flex items-center gap-2 text-green-500 mb-4">
                                                    <CheckCircle2 className="h-5 w-5" />
                                                    <span className="font-semibold">Submission Successful!</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-red-500 mb-4">
                                                    <AlertCircle className="h-5 w-5" />
                                                    <span className="font-semibold">Submission Failed</span>
                                                </div>
                                            )}

                                            <div className="text-muted-foreground mb-1">Response Body:</div>
                                            <pre className="text-foreground/90 whitespace-pre-wrap">
                                                {JSON.stringify(testResult.data || { error: testResult.error }, null, 2)}
                                            </pre>

                                            {testResult.data?.debug_error && (
                                                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
                                                    <strong>Debug Error:</strong>
                                                    <pre className="mt-1 whitespace-pre-wrap text-xs">
                                                        {JSON.stringify(testResult.data.debug_error, null, 2)}
                                                    </pre>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground/50">
                                            <Code className="h-12 w-12 mb-4 opacity-20" />
                                            <p>Send a request to see the response here</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
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
                                    <Label htmlFor="redirect_url">Redirect URL (Optional)</Label>
                                    <Input
                                        id="redirect_url"
                                        name="redirect_url"
                                        type="url"
                                        defaultValue={form.redirect_url}
                                        className="bg-secondary/50 border-input"
                                        placeholder="https://example.com/thank-you"
                                    />
                                    <p className="text-xs text-muted-foreground">Redirect users to this URL after submission (work only with HTML form submissions).</p>
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
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
                    <div
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
                        onClick={() => setSelectedSubmission(null)}
                    />
                    <div className="relative w-full sm:max-w-xl bg-card border border-border sm:rounded-2xl shadow-2xl animate-scale-in overflow-hidden flex flex-col max-h-[92vh]">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 shrink-0">
                            <div className="flex items-center gap-3">
                                <h2 className="text-base font-semibold">Submission</h2>
                                <span className="px-2 py-0.5 text-xs font-medium bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
                                    Read
                                </span>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 rounded-lg"
                                onClick={() => setSelectedSubmission(null)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
                            {/* Metadata */}
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { icon: Clock,   label: 'Submitted', value: new Date(selectedSubmission.created_at).toLocaleString(), mono: true, suppress: true },
                                    { icon: Globe,   label: 'Origin',    value: selectedSubmission.origin || 'Direct API', mono: true },
                                    { icon: MapPin,  label: 'IP',        value: selectedSubmission.ip_address || 'Unknown', mono: true },
                                    { icon: Monitor, label: 'Browser',   value: getBrowserName(selectedSubmission.user_agent), mono: false },
                                ].map(({ icon: Icon, label, value, mono, suppress }) => (
                                    <div key={label} className="p-3 rounded-xl bg-secondary/30 border border-border/40">
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
                                            <Icon className="h-3 w-3" /> {label}
                                        </div>
                                        <p
                                            className={cn("text-sm truncate", mono ? "font-mono" : "")}
                                            suppressHydrationWarning={suppress}
                                            title={value}
                                        >
                                            {value}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Payload Fields */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Form Data</h3>
                                {Object.entries(selectedSubmission.payload || {}).map(([key, value]) => (
                                    <div key={key}>
                                        <Label className="text-xs text-muted-foreground mb-1.5 block capitalize">{key.replace(/_/g, ' ')}</Label>
                                        <div className="w-full rounded-xl border border-border/60 bg-secondary/20 px-4 py-3 text-sm font-mono whitespace-pre-wrap break-words text-foreground/90">
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