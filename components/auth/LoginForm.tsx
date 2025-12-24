'use client'

import { useActionState } from 'react'
import { login } from '@/app/actions'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/Card'

const initialState = {
    error: '',
}

export function LoginForm() {
    const [state, action, pending] = useActionState(login, initialState)

    return (
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
            <Card className="glass-card shadow-lg shadow-black/20">
                <CardContent className="pt-6">
                    <form action={action} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email address</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="bg-secondary/50 border-input"
                                placeholder="name@example.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Password</Label>
                                <Link
                                    href="#"
                                    className="text-xs text-primary hover:text-primary/90"
                                    onClick={(e) => e.preventDefault()} // No reset password yet
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
                                className="bg-secondary/50 border-input"
                                placeholder="Enter your password"
                            />
                        </div>

                        {state?.error && (
                            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20">
                                {state.error}
                            </div>
                        )}

                        <div>
                            <Button type="submit" className="w-full shadow-lg shadow-primary/20" isLoading={pending}>
                                Sign in
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
