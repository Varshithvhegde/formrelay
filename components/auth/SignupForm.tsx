'use client'

import { useActionState } from 'react'
import { signup } from '@/app/actions'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import Link from 'next/link'

const initialState = {
    error: '',
}

export function SignupForm() {
    const [state, action, pending] = useActionState(signup, initialState)

    return (
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                <form action={action} className="space-y-6">
                    <div>
                        <Label htmlFor="email">Email address</Label>
                        <div className="mt-1">
                            <Input id="email" name="email" type="email" autoComplete="email" required />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="password">Password</Label>
                        <div className="mt-1">
                            <Input id="password" name="password" type="password" autoComplete="new-password" required />
                        </div>
                    </div>

                    {state?.error && <div className="text-red-600 text-sm">{state.error}</div>}

                    <div>
                        <Button type="submit" className="w-full" isLoading={pending}>
                            Sign up
                        </Button>
                    </div>
                </form>

                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">Or</span>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-center text-sm">
                        <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                            Sign in to your account
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
