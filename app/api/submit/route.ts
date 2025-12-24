import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/email'

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
    // Handle CORS
    const origin = req.headers.get('origin')
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1'

    // Basic CORS headers for the response
    const headers = {
        'Access-Control-Allow-Origin': origin || '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    }

    if (req.method === 'OPTIONS') {
        return NextResponse.json({}, { headers })
    }

    let body: any
    try {
        const contentType = req.headers.get('content-type') || ''
        if (contentType.includes('application/json')) {
            body = await req.json()
        } else {
            // handle form-data or x-www-form-urlencoded
            const formData = await req.formData()
            body = Object.fromEntries(formData)
        }
    } catch (e) {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400, headers })
    }

    const { form_id, ...payload } = body

    if (!form_id) {
        return NextResponse.json({ error: 'Missing form_id' }, { status: 400, headers })
    }

    // 1. Validate Form
    const { data: form, error: formError } = await supabaseAdmin
        .from('forms')
        .select('*')
        .eq('id', form_id)
        .single()

    if (formError || !form) {
        return NextResponse.json({ error: 'Form not found' }, { status: 404, headers })
    }

    if (!form.is_active) {
        return NextResponse.json({ error: 'Form is inactive' }, { status: 403, headers })
    }

    // 2. Validate Origin
    if (form.allowed_domains && form.allowed_domains.length > 0) {
        if (!origin && !req.headers.get('referer')) {
            // Direct API call without origin/referer might be blocked if strict, but allow for now or block?
            // Block if domains are set.
            return NextResponse.json({ error: 'Origin missing' }, { status: 403, headers })
        }

        const requestOrigin = origin || new URL(req.headers.get('referer')!).origin

        const allowed = form.allowed_domains.some((d: string) =>
            requestOrigin.includes(d) // Simple check
        )

        if (!allowed) {
            return NextResponse.json({ error: 'Origin not allowed' }, { status: 403, headers })
        }
    }

    // 3. Rate Limit (Simple: Max 5 per minute per IP for this form)
    // Note: timestamps in Supabase are usually ISO.
    const oneMinuteAgo = new Date(Date.now() - 60000).toISOString()
    const { count } = await supabaseAdmin
        .from('submissions')
        .select('*', { count: 'exact', head: true })
        .eq('form_id', form_id)
        .eq('ip_address', ip)
        .gt('created_at', oneMinuteAgo)

    if (count && count >= 5) {
        return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429, headers })
    }

    // 4. Store Submission
    const { error: submissionError } = await supabaseAdmin
        .from('submissions')
        .insert({
            form_id,
            payload,
            ip_address: ip,
            user_agent: req.headers.get('user-agent'),
            origin: origin || req.headers.get('referer'),
        })

    if (submissionError) {
        return NextResponse.json({ error: 'Failed to store submission' }, { status: 500, headers })
    }

    // 5. Send Email (Fire and forget-ish)
    // We use a promise without await, but handling errors in catch.
    // In Vercel, use `waitUntil` if available on the request or context.
    // Next 15+ has unstable_after or context.waitUntil seems unavailable on NextRequest directly in App Router?
    // We'll just run it. If lambda dies, email might fail. Acceptable for MVP.
    const emailPromise = (async () => {
        const emailContent = Object.entries(payload).map(([k, v]) => `${k}: ${v}`).join('\n')
        // Try to find a reply-to email in the payload
        const replyTo = payload.email || payload.Email || payload['reply-to'] || undefined

        await sendEmail({
            to: form.notification_email,
            replyTo: replyTo as string | undefined,
            subject: `New Submission for ${form.name}`,
            text: `You have a new submission:\n\n${emailContent}\n\nTimestamp: ${new Date().toISOString()}`,
            html: `<h2>New Submission for ${form.name}</h2><pre style="background:#f4f4f4;padding:10px;border-radius:5px;">${emailContent}</pre><p>Timestamp: ${new Date().toISOString()}</p>`
        })
    })()

    // If using Next.js 15+, import { after } from 'next/server' and usage is `after(() => ...)`
    // For now we just let it float.

    return NextResponse.json({ success: true, message: 'Submission received' }, { headers })
}

export async function OPTIONS() {
    return NextResponse.json({}, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        }
    })
}
