import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { FormActions } from '@/components/dashboard/FormActions'
import { FormDetailsClient } from '@/components/dashboard/FormDetailsClient'

export default async function FormDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data: form } = await supabase
        .from('forms')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

    if (!form) {
        notFound()
    }

    // Fetch submissions
    const { data: submissions } = await supabase
        .from('submissions')
        .select('*')
        .eq('form_id', id)
        .order('created_at', { ascending: false })
        .limit(100)

    return (
        <FormDetailsClient form={form} submissions={submissions || []} />
    )
}
