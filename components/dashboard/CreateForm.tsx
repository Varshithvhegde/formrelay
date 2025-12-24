'use client'

import { useActionState } from 'react'
import { createForm } from '@/app/actions'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/Card'

const initialState = {
    error: '',
}

export function CreateForm() {
    const [state, action, pending] = useActionState(createForm, initialState)

    return (
        <Card className="glass-card max-w-lg">
            <CardContent className="pt-6">
                <form action={action} className="space-y-6">
                    <div>
                        <Label htmlFor="name">Form Name</Label>
                        <div className="mt-1">
                            <Input id="name" name="name" placeholder="e.g. Contact Us" required className="bg-secondary/50 border-input" />
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">A friendly name to identify this form.</p>
                    </div>

                    <div>
                        <Label htmlFor="notification_email">Notification Email</Label>
                        <div className="mt-1">
                            <Input id="notification_email" name="notification_email" type="email" placeholder="you@example.com" required className="bg-secondary/50 border-input" />
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">Where should submissions be sent?</p>
                    </div>

                    <div>
                        <Label htmlFor="allowed_domains">Allowed Domains</Label>
                        <div className="mt-1">
                            <Input id="allowed_domains" name="allowed_domains" placeholder="example.com, my-site.com" className="bg-secondary/50 border-input" />
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">Comma separated list of domains allowed to submit. Leave empty to allow all (not recommended).</p>
                    </div>

                    {state?.error && (
                        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20">
                            {state.error}
                        </div>
                    )}

                    <div className="flex justify-end space-x-3 pt-4">
                        <Link href="/dashboard/forms">
                            <Button type="button" variant="outline">Cancel</Button>
                        </Link>
                        <Button type="submit" isLoading={pending}>Create Form</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
