import { LoginForm } from '@/components/auth/LoginForm'
import { Metadata } from 'next'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { Check } from 'lucide-react'

export const metadata: Metadata = {
    title: 'Sign In — FormRelay',
}

const perks = [
    'Zero backend code required',
    'Real-time submission dashboard',
    'Email notifications per form',
    'Spam protection built-in',
]

export default async function LoginPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
        redirect('/dashboard')
    }

    return (
        <div className="min-h-screen bg-background flex relative overflow-hidden">
            {/* Left panel — brand side */}
            <div className="hidden lg:flex lg:w-[46%] flex-col justify-between p-12 border-r border-border/40 relative overflow-hidden">
                <div className="absolute inset-0 dot-grid opacity-40 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />

                <Link href="/" className="relative z-10">
                    <Logo size="lg" />
                </Link>

                <div className="relative z-10 space-y-8">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight mb-3">
                            Forms that just<br />
                            <span className="gradient-text">work.</span>
                        </h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Collect submissions from any site without writing a line of backend code.
                        </p>
                    </div>
                    <ul className="space-y-3">
                        {perks.map((p) => (
                            <li key={p} className="flex items-center gap-3 text-sm text-muted-foreground">
                                <span className="h-5 w-5 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                                    <Check className="h-3 w-3 text-primary" />
                                </span>
                                {p}
                            </li>
                        ))}
                    </ul>
                </div>

                <p className="text-xs text-muted-foreground/50 relative z-10">© 2025 FormRelay</p>
            </div>

            {/* Right panel — form */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
                <div className="w-full max-w-sm">
                    {/* Mobile logo */}
                    <div className="lg:hidden flex justify-center mb-8">
                        <Link href="/"><Logo size="lg" /></Link>
                    </div>

                    <div className="mb-8">
                        <h1 className="text-2xl font-bold tracking-tight">Sign in</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            No account?{' '}
                            <Link href="/signup" className="text-primary hover:text-primary/80 font-medium transition-colors">
                                Create one free
                            </Link>
                        </p>
                    </div>

                    <LoginForm />
                </div>
            </div>
        </div>
    )
}
