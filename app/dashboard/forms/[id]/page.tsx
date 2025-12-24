import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { FormActions } from '@/components/dashboard/FormActions'
import { FormDetailsClient } from '@/components/dashboard/FormDetailsClient'

export default async function FormDetailsPage({
    params,
    searchParams
}: {
    params: Promise<{ id: string }>
    searchParams: Promise<{ page?: string, query?: string }>
}) {
    const { id } = await params
    const { page = '1', query = '' } = await searchParams
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

    const currentPage = parseInt(page)
    const ITEMS_PER_PAGE = 5
    const offset = (currentPage - 1) * ITEMS_PER_PAGE

    let submissions = []
    let totalCount = 0

    if (query) {
        // Search Mode: Fetch larger set and filter in memory (since JSONB text search is tricky)
        const { data } = await supabase
            .from('submissions')
            .select('*')
            .eq('form_id', id)
            .order('created_at', { ascending: false })
            .limit(500) // Search limit

        const allMatches = (data || []).filter((sub: any) => {
            const raw = JSON.stringify(sub).toLowerCase()
            return raw.includes(query.toLowerCase())
        })

        totalCount = allMatches.length
        submissions = allMatches.slice(offset, offset + ITEMS_PER_PAGE)
    } else {
        // Pagination Mode: Efficient DB Range
        const { count, data } = await supabase
            .from('submissions')
            .select('*', { count: 'exact' })
            .eq('form_id', id)
            .order('created_at', { ascending: false })
            .range(offset, offset + ITEMS_PER_PAGE - 1)

        totalCount = count || 0
        submissions = data || []
    }

    return (
        <FormDetailsClient
            form={form}
            submissions={submissions}
            totalCount={totalCount}
            currentPage={currentPage}
            pageSize={ITEMS_PER_PAGE}
            initialSearchQuery={query}
        />
    )
}
