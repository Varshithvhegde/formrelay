'use client'

import { useActionState } from 'react'
import { createForm } from '@/app/actions'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import Link from 'next/link'

const initialState = {
    error: '',
}

export function CreateForm() {
    const [state, action, pending] = useActionState(createForm, initialState)

    return (
        <form action={action} className="space-y-6 max-w-lg bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div>
                <Label htmlFor="name">Form Name</Label>
                <div className="mt-1">
                    <Input id="name" name="name" placeholder="e.g. Contact Us" required />
                </div>
                <p className="mt-1 text-xs text-gray-500">A friendly name to identify this form.</p>
            </div>

            <div>
                <Label htmlFor="notification_email">Notification Email</Label>
                <div className="mt-1">
                    <Input id="notification_email" name="notification_email" type="email" placeholder="you@example.com" required />
                </div>
                <p className="mt-1 text-xs text-gray-500">Where should submissions be sent?</p>
            </div>

            <div>
                <Label htmlFor="allowed_domains">Allowed Domains</Label>
                <div className="mt-1">
                    <Input id="allowed_domains" name="allowed_domains" placeholder="example.com, my-site.com" />
                </div>
                <p className="mt-1 text-xs text-gray-500">Comma separated list of domains allowed to submit. Leave empty to allow all (not recommended).</p>
            </div>

            {state?.error && <p className="text-red-500 text-sm">{state.error}</p>}

            <div className="flex justify-end space-x-3 pt-4">
                <Link href="/dashboard/forms">
                    <Button type="button" variant="secondary">Cancel</Button>
                </Link>
                <Button type="submit" isLoading={pending}>Create Form</Button>
            </div>
        </form>
    )
}
