'use client'

import { useActionState } from 'react'
import { signup } from '@/app/actions'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'

const initialState = { error: '' }

export function SignupForm() {
    const [state, action, pending] = useActionState(signup, initialState)

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
                <Label htmlFor="password">Password</Label>
                <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    placeholder="Create a password (min. 8 chars)"
                />
            </div>

            {state?.error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg border border-destructive/20">
                    {state.error}
                </div>
            )}

            <Button type="submit" className="w-full" variant="hero" isLoading={pending}>
                Create account
            </Button>

            <p className="text-xs text-center text-muted-foreground">
                By signing up you agree to our terms of service.
            </p>
        </form>
    )
}
