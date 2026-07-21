'use client'

import { useActionState } from 'react'
import { login } from '@/app/actions'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import Link from 'next/link'

const initialState = { error: '' }

export function LoginForm() {
    const [state, action, pending] = useActionState(login, initialState)

    return (
        <form action={action} className="space-y-5">
            <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="name@example.com"
                />
            </div>

            <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link
                        href="#"
                        className="text-xs text-muted-foreground hover:text-primary transition-colors"
                        onClick={(e) => e.preventDefault()}
                    >
                        Forgot password?
                    </Link>
                </div>
                <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    placeholder="Enter your password"
                />
            </div>

            {state?.error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg border border-destructive/20">
                    {state.error}
                </div>
            )}

            <Button type="submit" className="w-full" variant="hero" isLoading={pending}>
                Sign in
            </Button>
        </form>
    )
}
