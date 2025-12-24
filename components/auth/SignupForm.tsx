'use client'

import { useActionState } from 'react'
import { signup } from '@/app/actions'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Card, CardContent } from '@/components/ui/Card'

const initialState = {
    error: '',
}

export function SignupForm() {
    const [state, action, pending] = useActionState(signup, initialState)

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
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                className="bg-secondary/50 border-input"
                                placeholder="Create a password"
                            />
                        </div>

                        {state?.error && (
                            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20">
                                {state.error}
                            </div>
                        )}

                        <div>
                            <Button type="submit" className="w-full shadow-lg shadow-primary/20" isLoading={pending}>
                                Create account
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
