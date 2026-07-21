import { SignupForm } from '@/components/auth/SignupForm'
import { Metadata } from 'next'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { Zap, Mail, Shield } from 'lucide-react'

export const metadata: Metadata = {
    title: 'Sign Up — FormRelay',
}

const highlights = [
    { icon: Zap,    text: 'Live in under 2 minutes' },
    { icon: Mail,   text: 'Email alerts on every submit' },
    { icon: Shield, text: 'Spam protection by default' },
]

export default async function SignupPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
        redirect('/dashboard')
    }

    return (
        <div className="min-h-screen bg-background flex relative overflow-hidden">
            {/* Left panel */}
            <div className="hidden lg:flex lg:w-[46%] flex-col justify-between p-12 border-r border-border/40 relative overflow-hidden">
                <div className="absolute inset-0 dot-grid opacity-40 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />

                <Link href="/" className="relative z-10">
                    <Logo size="lg" />
                </Link>

                <div className="relative z-10 space-y-8">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight mb-3">
                            Start collecting<br />
                            <span className="gradient-text">in minutes.</span>
                        </h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Free to use. No credit card. Open source and self-hostable if you need full control.
                        </p>
                    </div>
                    <div className="space-y-4">
                        {highlights.map(({ icon: Icon, text }) => (
                            <div key={text} className="flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-card/30">
                                <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                                    <Icon className="h-4 w-4 text-primary" />
                                </div>
                                <p className="text-sm text-foreground/80 font-medium">{text}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <p className="text-xs text-muted-foreground/50 relative z-10">© 2025 FormRelay</p>
            </div>

            {/* Right panel */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
                <div className="w-full max-w-sm">
                    <div className="lg:hidden flex justify-center mb-8">
                        <Link href="/"><Logo size="lg" /></Link>
                    </div>

                    <div className="mb-8">
                        <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Already have one?{' '}
                            <Link href="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </div>

                    <SignupForm />
                </div>
            </div>
        </div>
    )
}
