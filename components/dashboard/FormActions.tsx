'use client'

import { toggleFormStatus, deleteForm } from '@/app/actions'
import { Button } from '@/components/ui/Button'
import { useTransition } from 'react'

export function FormActions({ formId, isActive }: { formId: string, isActive: boolean }) {
    const [pending, startTransition] = useTransition()

    const handleToggle = () => {
        startTransition(async () => {
            await toggleFormStatus(formId, !isActive)
        })
    }

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this form?')) {
            startTransition(async () => {
                await deleteForm(formId)
            })
        }
    }

    return (
        <div className="flex space-x-2">
            <Button
                variant={isActive ? "secondary" : "default"}
                size="sm"
                onClick={handleToggle}
                isLoading={pending}
            >
                {isActive ? 'Disable' : 'Enable'}
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete} isLoading={pending}>
                Delete
            </Button>
        </div>
    )
}
