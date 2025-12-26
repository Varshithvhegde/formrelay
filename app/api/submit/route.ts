import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail, generateEmailTemplate } from '@/lib/email'

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
    // Handle CORS
    const origin = req.headers.get('origin')

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
    let isJson = false
    try {
        const contentType = req.headers.get('content-type') || ''
        if (contentType.includes('application/json')) {
            isJson = true
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
    const originToCheck = origin || req.headers.get('referer') || ''
    if (form.allowed_domains && form.allowed_domains.length > 0) {
        // Use user's logic for domain checking
        const originHost = originToCheck ? new URL(originToCheck).hostname : ''
        const isAllowed = form.allowed_domains.some((d: string) =>
            originHost === d || originHost.endsWith('.' + d)
        )

        // Strict check: if allowed domains are set, we MUST have a matching origin
        // If origin is missing, we block if we are in strict mode (implied by having allowed_domains set)
        if (!isAllowed) {
            return NextResponse.json({ error: 'Origin not allowed' }, { status: 403, headers })
        }
    }

    // Capture precise metadata
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ||
        req.headers.get('x-real-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || ''

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
            user_agent: userAgent,
            origin: origin || req.headers.get('referer'),
        })

    if (submissionError) {
        return NextResponse.json({ error: 'Failed to store submission' }, { status: 500, headers })
    }

    // 5. Send Email
    // Only proceed if email notifications are enabled
    if (form.email_notifications_enabled) {
        let recipient = form.notification_email

        // Fallback to user email if notification_email is not set
        if (!recipient) {
            const { data: profile } = await supabaseAdmin
                .from('profiles')
                .select('email')
                .eq('id', form.user_id)
                .single()
            recipient = profile?.email
        }

        if (recipient) {
            const emailContent = Object.entries(payload).map(([k, v]) => `${k}: ${v}`).join('\n')
            const replyTo = payload.email || payload.Email || payload['reply-to'] || undefined

            const cleanTo = recipient.trim()
            console.log(`[API] Sending email to: '${cleanTo}' (Source: ${form.notification_email ? 'Form Settings' : 'Account Email'})`)

            // Await for verification (helps debugging)
            const { error: emailError } = await sendEmail({
                to: cleanTo,
                replyTo: replyTo as string | undefined,
                subject: `New Submission for ${form.name}`,
                text: `You have a new submission:\n\n${emailContent}\n\nTimestamp: ${new Date().toISOString()}`,
                html: generateEmailTemplate(form.name, payload)
            })

            if (emailError) {
                console.error('Failed to send email:', emailError)
                if (isJson) {
                    return NextResponse.json({
                        success: true,
                        message: 'Submission saved, but email failed',
                        debug_error: emailError
                    }, { headers })
                }
            }
        }
    }

    // 6. Return Response
    if (!isJson && form.redirect_url) {
        return NextResponse.redirect(form.redirect_url, { status: 303 })
    }

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
