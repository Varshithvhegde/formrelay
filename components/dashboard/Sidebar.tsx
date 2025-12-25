'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FileText, Settings, LogOut, Menu, X, Plus } from 'lucide-react'
import { useState } from 'react'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { signOut } from '@/app/actions' // Server Action for signout
import { CreateFormDialog } from '@/components/dashboard/CreateFormDialog'

interface SidebarProps {
    userEmail?: string
}

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/forms', label: 'Forms', icon: FileText },
    // { href: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar({ userEmail }: SidebarProps) {
    const pathname = usePathname()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    return (
        <>
            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-b border-border">
                <div className="flex items-center justify-between p-4">
                    <Logo size="sm" />
                    <Button
                        variant="ghost"
                        size="sm" // replaced "icon" with sm or equivalent for now as "icon" size wasn't in my simple Button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </Button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <nav className="border-t border-border p-4 space-y-2 animate-slide-up">
                        {navItems.map((item) => {
                            const Icon = item.icon
                            const isActive = pathname === item.href ||
                                (item.href !== '/dashboard' && pathname.startsWith(item.href))
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                                        isActive
                                            ? "bg-primary/10 text-primary border border-primary/20"
                                            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                    )}
                                >
                                    <Icon className="h-5 w-5" />
                                    {item.label}
                                </Link>
                            )
                        })}
                        <CreateFormDialog trigger={
                            <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground w-full transition-all">
                                <Plus className="h-5 w-5" />
                                New Form
                            </button>
                        } />
                        <form action={signOut} className="w-full">
                            <button
                                type="submit"
                                className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground w-full"
                            >
                                <LogOut className="h-5 w-5" />
                                Sign Out
                            </button>
                        </form>
                    </nav>
                )}
            </header>

            {/* Desktop Sidebar */}
            <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-64 lg:flex-col bg-card/50 backdrop-blur-xl border-r border-border">
                <div className="flex flex-col h-full">
                    <div className="p-6">
                        <Logo />
                    </div>

                    <nav className="flex-1 px-4 space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon
                            const isActive = pathname === item.href ||
                                (item.href !== '/dashboard' && pathname.startsWith(item.href))
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                                        isActive
                                            ? "bg-primary/10 text-primary border border-primary/20"
                                            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                    )}
                                >
                                    <Icon className="h-5 w-5" />
                                    {item.label}
                                </Link>
                            )
                        })}
                        <CreateFormDialog trigger={
                            <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground w-full transition-all">
                                <Plus className="h-5 w-5" />
                                New Form
                            </button>
                        } />
                    </nav>

                    <div className="p-4 border-t border-border">
                        <div className="flex items-center gap-3 px-4 py-2 mb-2">
                            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium">
                                {userEmail?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{userEmail}</p>
                            </div>
                        </div>
                        <form action={signOut}>
                            <Button
                                variant="ghost"
                                className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
                            >
                                <LogOut className="h-5 w-5" />
                                Sign Out
                            </Button>
                        </form>
                    </div>
                </div>
            </aside>
        </>
    )
}
