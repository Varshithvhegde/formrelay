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

export async function createForm(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const name = formData.get('name') as string
    const notification_email = formData.get('notification_email') as string
    const allowed_domains_raw = formData.get('allowed_domains') as string

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

    const allowed_domains = allowed_domains_raw
        ? allowed_domains_raw.split(',').map((d) => d.trim()).filter((d) => d.length > 0)
        : []

    const { error } = await supabase.from('forms').update({
        name,
        notification_email,
        allowed_domains
    }).eq('id', id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath(`/dashboard/forms/${id}`)
    redirect(`/dashboard/forms/${id}`)
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
    // Also revalidate list
    revalidatePath('/dashboard/forms')
}
