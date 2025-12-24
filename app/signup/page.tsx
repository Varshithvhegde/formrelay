import { SignupForm } from '@/components/auth/SignupForm'
import { Metadata } from 'next'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Logo } from '@/components/Logo'

export const metadata: Metadata = {
    title: 'Sign Up - FormRelay',
}

export default async function SignupPage() {
    // Edge Case: Check if user is already logged in
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
        redirect('/dashboard')
    }

    return (
        <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(187_85%_53%/0.1),transparent_70%)] pointer-events-none" />
            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="flex justify-center mb-6">
                    <Link href="/">
                        <Logo size="lg" />
                    </Link>
                </div>
                <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-foreground">Create your account</h2>
                <p className="mt-2 text-center text-sm text-muted-foreground">
                    Or{' '}
                    <Link href="/login" className="font-medium text-primary hover:text-primary/90 transition-colors">
                        sign in to existing account
                    </Link>
                </p>
            </div>
            <SignupForm />
        </div>
    )
}
