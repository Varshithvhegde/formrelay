'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FileText, LogOut, Menu, X, Plus } from 'lucide-react'
import { useState } from 'react'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { signOut } from '@/app/actions'
import { CreateFormDialog } from '@/components/dashboard/CreateFormDialog'

interface SidebarProps {
  userEmail?: string
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/forms', label: 'Forms', icon: FileText },
]

function NavLink({ href, label, icon: Icon, exact = false, onClick }: {
  href: string
  label: string
  icon: React.ElementType
  exact?: boolean
  onClick?: () => void
}) {
  const pathname = usePathname()
  const isActive = exact
    ? pathname === href
    : pathname === href || (href !== '/dashboard' && pathname.startsWith(href))

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
        isActive
          ? "bg-primary/10 text-primary border border-primary/20"
          : "text-muted-foreground hover:bg-secondary hover:text-foreground border border-transparent"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
      {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
    </Link>
  )
}

export function Sidebar({ userEmail }: SidebarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const initial = userEmail?.charAt(0).toUpperCase() ?? '?'

  return (
    <>
      {/* ── Mobile header ── */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between px-4 h-14">
          <Logo size="sm" />
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {mobileMenuOpen && (
          <nav className="border-t border-border p-3 space-y-1 animate-slide-up bg-background/98 backdrop-blur-xl">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                onClick={() => setMobileMenuOpen(false)}
              />
            ))}
            <CreateFormDialog trigger={
              <button className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground w-full transition-all border border-transparent">
                <Plus className="h-4 w-4 shrink-0" />
                New Form
              </button>
            } />
            <form action={signOut} className="w-full">
              <button
                type="submit"
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground w-full border border-transparent"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                Sign Out
              </button>
            </form>
          </nav>
        )}
      </header>

      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-60 lg:flex-col bg-card/40 backdrop-blur-xl border-r border-border/60">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-border/40">
          <Logo />
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
            />
          ))}

          <div className="pt-2 border-t border-border/40 mt-2">
            <CreateFormDialog trigger={
              <button className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground w-full transition-all border border-transparent group">
                <div className="h-4 w-4 rounded-md border border-dashed border-muted-foreground/50 flex items-center justify-center group-hover:border-primary/50 group-hover:text-primary transition-colors shrink-0">
                  <Plus className="h-2.5 w-2.5" />
                </div>
                New Form
              </button>
            } />
          </div>
        </nav>

        {/* User section */}
        <div className="p-3 border-t border-border/40">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-secondary/40 border border-border/40 mb-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/40 to-primary/20 border border-primary/30 flex items-center justify-center text-primary text-sm font-bold shrink-0">
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate text-foreground">{userEmail}</p>
              <p className="text-[10px] text-muted-foreground">Free plan</p>
            </div>
          </div>
          <form action={signOut}>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground text-sm h-9"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </form>
        </div>
      </aside>
    </>
  )
}
