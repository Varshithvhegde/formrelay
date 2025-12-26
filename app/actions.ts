'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(prevState: any, formData: FormData) {
    const supabase = await createClient()
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}

export async function signup(prevState: any, formData: FormData) {
    const supabase = await createClient()
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        },
    })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}

export async function signOut() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/login')
}

// createForm update
export async function createForm(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const name = formData.get('name') as string
    const notification_email = formData.get('notification_email') as string
    const allowed_domains_raw = formData.get('allowed_domains') as string
    const email_notifications_enabled = formData.get('email_notifications_enabled') as string
    const redirect_url = formData.get('redirect_url') as string

    const allowed_domains = allowed_domains_raw
        ? allowed_domains_raw.split(',').map((d) => d.trim()).filter((d) => d.length > 0)
        : []

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated' }
    }

    const { error } = await supabase.from('forms').insert({
        user_id: user.id,
        name,
        notification_email,
        allowed_domains,
        email_notifications_enabled: email_notifications_enabled === 'true',
        redirect_url: redirect_url || null,
    })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard/forms')
    redirect('/dashboard/forms')
}

export async function updateForm(prevState: any, formData: FormData) {
    const supabase = await createClient()
    const id = formData.get('id') as string
    const name = formData.get('name') as string
    const notification_email = formData.get('notification_email') as string
    const allowed_domains_raw = formData.get('allowed_domains') as string
    const email_notifications_enabled = formData.get('email_notifications_enabled') as string
    const redirect_url = formData.get('redirect_url') as string

    const allowed_domains = allowed_domains_raw
        ? allowed_domains_raw.split(',').map((d) => d.trim()).filter((d) => d.length > 0)
        : null

    // safe parsing
    const domainsToUpdate = allowed_domains_raw !== null
        ? allowed_domains_raw.split(',').map(d => d.trim()).filter(d => d.length > 0)
        : []

    const { error } = await supabase.from('forms').update({
        name,
        notification_email,
        allowed_domains: domainsToUpdate,
        email_notifications_enabled: email_notifications_enabled === 'true',
        redirect_url: redirect_url || null,
    }).eq('id', id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath(`/dashboard/forms/${id}`)
    return { success: 'Form updated successfully' }
}

export async function deleteForm(formId: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('forms').delete().eq('id', formId)

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath('/dashboard/forms')
    redirect('/dashboard/forms')
}

export async function toggleFormStatus(formId: string, isActive: boolean) {
    const supabase = await createClient()
    const { error } = await supabase.from('forms').update({ is_active: isActive }).eq('id', formId)
    if (error) throw new Error(error.message)
    revalidatePath(`/dashboard/forms/${formId}`)
    revalidatePath('/dashboard/forms')
}

export async function deleteSubmission(submissionId: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('submissions').delete().eq('id', submissionId)
    if (error) throw new Error(error.message)
    // We don't know the formId here easily to revalidate just the page, so we might need to rely on client-side optimistic updates or pass formId.
    // But revalidating layout is safest for now or just letting client handle it.
}
