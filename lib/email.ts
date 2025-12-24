export interface SendEmailParams {
    to: string
    replyTo?: string
    subject: string
    text: string
    html: string
}

export async function sendEmail({ to, replyTo, subject, text, html }: SendEmailParams) {
    if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY is not set. Email not sent.')
        return { data: null, error: 'RESEND_API_KEY missing' }
    }

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
            },
            body: JSON.stringify({
                from: 'FormRelay <onboarding@resend.dev>', // Default Resend domain for testing
                to: [to],
                reply_to: replyTo,
                subject: subject,
                text: text,
                html: html,
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Resend API Error:', errorData);
            return { data: null, error: errorData }
        }

        const data = await response.json();
        return { data, error: null }
    } catch (error) {
        console.error('Email Fetch Error:', error)
        return { data: null, error }
    }
}
