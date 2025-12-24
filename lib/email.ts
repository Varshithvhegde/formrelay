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
                from: 'FormRelay <onboarding@resend.dev>',
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

export function generateEmailTemplate(formName: string, payload: any) {
    const timestamp = new Date().toLocaleString()
    const payloadRows = Object.entries(payload).map(([key, value]) => `
        <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #2a2a2a; color: #888888; font-size: 14px; font-weight: 500; text-transform: capitalize; width: 30%; vertical-align: top;">
                ${key.replace(/_/g, ' ')}
            </td>
            <td style="padding: 12px 0 12px 16px; border-bottom: 1px solid #2a2a2a; color: #e5e5e5; font-size: 14px; font-weight: 400; text-align: right; vertical-align: top; word-break: break-word;">
                ${typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
            </td>
        </tr>
    `).join('')

    return `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<style>
    body { margin: 0; padding: 0; background-color: #000000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
</style>
</head>
<body style="background-color: #000000; margin: 0; padding: 40px 0;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #000000; padding: 20px;">
        <!-- Header -->
        <tr>
            <td align="center" style="padding-bottom: 30px;">
                <h1 style="color: #00a8ff; font-size: 24px; margin: 0; font-weight: 600; font-family: 'JetBrains Mono', monospace; letter-spacing: -0.5px;">
                    <span style="font-size: 28px; vertical-align: middle; margin-right: 8px;">📬</span> New Form Submission
                </h1>
            </td>
        </tr>

        <!-- Card -->
        <tr>
            <td>
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0f0f0f; border-radius: 16px; border: 1px solid #2a2a2a; overflow: hidden;">
                    <!-- Form Info -->
                    <tr>
                        <td style="padding: 32px 32px 24px 32px; border-bottom: 1px solid #2a2a2a; background-color: #121212;">
                            <p style="margin: 0 0 8px 0; color: #666666; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 500;">Form</p>
                            <h2 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 600;">${formName}</h2>
                            <p style="margin: 16px 0 0 0; color: #444444; font-size: 12px;">Submitted at ${timestamp}</p>
                        </td>
                    </tr>

                    <!-- Payload -->
                    <tr>
                        <td style="padding: 16px 32px 32px 32px;">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                ${payloadRows}
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>

        <!-- Footer -->
        <tr>
            <td align="center" style="padding-top: 30px;">
                <p style="margin: 0; color: #444444; font-size: 12px;">
                    Sent by <span style="color: #666666;">FormRelay</span> • Your Contact Form Backend
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
    `
}
