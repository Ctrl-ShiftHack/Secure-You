# Edge Function Setup - SMS & Email Alerts

This document explains how to deploy and configure the Supabase Edge Function for sending SMS (Twilio) and Email (SendGrid) alerts.

## Prerequisites

1. **Supabase Account** - Your project: `xgytbxirkeqkstofupvd`
2. **Twilio Account** - Sign up at https://www.twilio.com/try-twilio
3. **SendGrid Account** - Sign up at https://sendgrid.com/free/

## Step 1: Get API Credentials

### Twilio Setup
1. Go to https://console.twilio.com/
2. Get your **Account SID** and **Auth Token** from the dashboard
3. Get a **Twilio Phone Number** (or use Trial number for testing)
4. Note these credentials - you'll need them for environment variables

### SendGrid Setup
1. Go to https://app.sendgrid.com/settings/api_keys
2. Click "Create API Key"
3. Give it a name (e.g., "SecureYou SOS Alerts")
4. Select "Full Access" or "Restricted Access" (Mail Send permission required)
5. Copy the API key (you won't see it again!)
6. Verify your sender email at https://app.sendgrid.com/settings/sender_auth

## Step 2: Install Supabase CLI

```bash
# Windows (PowerShell)
scoop install supabase

# Or download from:
# https://github.com/supabase/cli/releases

# macOS/Linux
brew install supabase/tap/supabase
```

## Step 3: Link Your Supabase Project

```bash
cd C:\Users\user\Downloads\Secure-You-main

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref xgytbxirkeqkstofupvd
```

## Step 4: Deploy the Edge Function

```bash
# Deploy the send-sos-alert function
supabase functions deploy send-sos-alert

# The function will be available at:
# https://xgytbxirkeqkstofupvd.supabase.co/functions/v1/send-sos-alert
```

## Step 5: Set Environment Variables (Secrets)

```bash
# Set Twilio credentials
supabase secrets set TWILIO_ACCOUNT_SID=your_account_sid_here
supabase secrets set TWILIO_AUTH_TOKEN=your_auth_token_here
supabase secrets set TWILIO_PHONE_NUMBER=+1234567890

# Set SendGrid credentials
supabase secrets set SENDGRID_API_KEY=your_sendgrid_api_key_here
supabase secrets set SENDGRID_FROM_EMAIL=alerts@yourdomain.com

# Verify secrets are set
supabase secrets list
```

**Important:** Replace the placeholder values with your actual credentials!

## Step 6: Test the Edge Function

### Using PowerShell
```powershell
$headers = @{
  "Authorization" = "Bearer YOUR_ANON_KEY"
  "Content-Type" = "application/json"
}

$body = @{
  contactId = "test-contact-id"
  contactName = "Test Contact"
  phoneNumber = "+1234567890"
  email = "test@example.com"
  userName = "Test User"
  timestamp = (Get-Date -Format "o")
  location = @{
    latitude = 23.8103
    longitude = 90.4125
    mapLink = "https://www.google.com/maps?q=23.8103,90.4125"
  }
  message = "This is a test SOS alert"
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Uri "https://xgytbxirkeqkstofupvd.supabase.co/functions/v1/send-sos-alert" `
  -Method Post `
  -Headers $headers `
  -Body $body
```

### Using curl (Bash)
```bash
curl -X POST \
  "https://xgytbxirkeqkstofupvd.supabase.co/functions/v1/send-sos-alert" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "contactId": "test-contact-id",
    "contactName": "Test Contact",
    "phoneNumber": "+1234567890",
    "email": "test@example.com",
    "userName": "Test User",
    "timestamp": "2024-01-01T12:00:00Z",
    "location": {
      "latitude": 23.8103,
      "longitude": 90.4125,
      "mapLink": "https://www.google.com/maps?q=23.8103,90.4125"
    },
    "message": "This is a test SOS alert"
  }'
```

### Expected Response
```json
{
  "success": true,
  "results": {
    "sms": {
      "sent": true,
      "error": null
    },
    "email": {
      "sent": true,
      "error": null
    }
  }
}
```

## Step 7: Update Frontend Environment

Your frontend is already configured! The `supabase.functions.invoke()` call in `src/lib/emergency.ts` will automatically use the deployed function.

## Troubleshooting

### SMS not sending
- Check Twilio Account SID and Auth Token are correct
- Verify Twilio phone number is in E.164 format (+1234567890)
- Check Twilio console for error messages
- If using Trial account, add recipient numbers to "Verified Caller IDs"

### Email not sending
- Verify SendGrid API key has "Mail Send" permission
- Check sender email is verified in SendGrid
- Look for emails in spam/junk folder
- Check SendGrid Activity Feed for delivery status

### Edge Function errors
```bash
# View function logs
supabase functions logs send-sos-alert

# Check secrets are set
supabase secrets list
```

## Cost Estimation

### Twilio (SMS)
- **Trial:** Free credits for testing (limited)
- **Production:** ~$0.0075 per SMS (US)
- **Example:** 100 SOS alerts/month × 3 contacts = 300 SMS = ~$2.25/month

### SendGrid (Email)
- **Free Tier:** 100 emails/day forever
- **Production:** First 100 emails/day are free
- **Example:** 100 SOS alerts/month × 3 contacts = 300 emails = FREE

### Supabase Edge Functions
- **Free Tier:** 500,000 invocations/month
- **Production:** Well within free tier for typical usage
- **Example:** 100 SOS alerts/month × 3 contacts = 300 invocations = FREE

**Total estimated cost:** ~$2-5/month for moderate usage (mostly Twilio SMS)

## Security Notes

1. **Never commit secrets** - Environment variables are stored securely in Supabase
2. **API keys stay on server** - Edge Functions run on Supabase infrastructure
3. **Credentials never exposed** - Frontend doesn't have access to Twilio/SendGrid keys
4. **Rate limiting recommended** - Consider adding rate limits to prevent abuse

## Alternative: Fallback to Console Logs

If you don't want to set up Twilio/SendGrid yet, the function will gracefully fail and the app will continue working with console logs. However, **real SMS/Email won't be sent**.

To enable console-only mode (for development):
- Don't set the environment variables
- The function will skip SMS/Email sending
- Notifications will still be logged in the database

## Production Checklist

Before going live:

- [ ] Twilio account upgraded from Trial to paid (if needed)
- [ ] SendGrid sender email verified
- [ ] Edge Function deployed and tested
- [ ] Environment variables (secrets) configured
- [ ] Test SOS alert with real phone number
- [ ] Test SOS alert with real email
- [ ] Check Twilio/SendGrid dashboards for delivery
- [ ] Monitor Edge Function logs for errors
- [ ] Set up monitoring/alerts for function failures

## Support Resources

- **Twilio Docs:** https://www.twilio.com/docs/sms/api
- **SendGrid Docs:** https://docs.sendgrid.com/
- **Supabase Edge Functions:** https://supabase.com/docs/guides/functions
- **Supabase CLI:** https://supabase.com/docs/reference/cli

---

**Need help?** Check the function logs:
```bash
supabase functions logs send-sos-alert --tail
```
