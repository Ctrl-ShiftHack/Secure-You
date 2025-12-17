import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID')
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN')
const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER')
const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY')
const SENDGRID_FROM_EMAIL = Deno.env.get('SENDGRID_FROM_EMAIL')

interface SOSRequest {
  contactId: string
  contactName: string
  phoneNumber: string
  email: string
  userName: string
  timestamp: string
  location: {
    latitude: number
    longitude: number
    mapLink: string
  }
  message: string
}

async function sendSMS(phoneNumber: string, message: string) {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
    console.warn('Twilio credentials not configured - skipping SMS')
    return { sent: false, error: 'Twilio not configured' }
  }

  try {
    const auth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: phoneNumber,
          From: TWILIO_PHONE_NUMBER,
          Body: message,
        }),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error('Twilio error:', error)
      return { sent: false, error: error }
    }

    const data = await response.json()
    return { sent: true, error: null, sid: data.sid }
  } catch (error) {
    console.error('SMS send error:', error)
    return { sent: false, error: error.message }
  }
}

async function sendEmail(to: string, subject: string, htmlContent: string) {
  if (!SENDGRID_API_KEY || !SENDGRID_FROM_EMAIL) {
    console.warn('SendGrid credentials not configured - skipping email')
    return { sent: false, error: 'SendGrid not configured' }
  }

  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: SENDGRID_FROM_EMAIL },
        subject: subject,
        content: [{ type: 'text/html', value: htmlContent }],
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('SendGrid error:', error)
      return { sent: false, error: error }
    }

    return { sent: true, error: null }
  } catch (error) {
    console.error('Email send error:', error)
    return { sent: false, error: error.message }
  }
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    const data: SOSRequest = await req.json()

    // Validate required fields
    if (!data.contactName || !data.phoneNumber || !data.email || !data.userName) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Create SMS message
    const smsMessage = `🚨 EMERGENCY ALERT 🚨\n\n${data.userName} needs help!\n\nMessage: ${data.message}\n\nLocation: ${data.location.mapLink}\n\nTime: ${new Date(data.timestamp).toLocaleString()}\n\nThis is an automated SOS alert from SecureYou app.`

    // Create email HTML
    const emailHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
            .content { background: #f9fafb; padding: 20px; margin-top: 20px; }
            .alert-box { background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; }
            .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚨 EMERGENCY ALERT</h1>
            </div>
            <div class="content">
              <div class="alert-box">
                <h2>${data.userName} needs immediate help!</h2>
                <p><strong>Message:</strong> ${data.message}</p>
                <p><strong>Time:</strong> ${new Date(data.timestamp).toLocaleString()}</p>
                <p><strong>Location:</strong></p>
                <p>Latitude: ${data.location.latitude}, Longitude: ${data.location.longitude}</p>
                <a href="${data.location.mapLink}" class="button">View Location on Map</a>
              </div>
              <p>This is an automated SOS alert from the SecureYou safety app. Please check on ${data.userName} immediately.</p>
            </div>
            <div class="footer">
              <p>This is an automated message. Do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `

    // Send SMS and Email in parallel
    const [smsResult, emailResult] = await Promise.all([
      sendSMS(data.phoneNumber, smsMessage),
      sendEmail(data.email, `🚨 Emergency Alert from ${data.userName}`, emailHTML),
    ])

    return new Response(
      JSON.stringify({
        success: true,
        results: {
          sms: smsResult,
          email: emailResult,
        },
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  }
})
