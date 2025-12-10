# Email Service SMTP Timeout Fix

## Issue
SMTP connection timeout when sending emails from Render:
```
Error: Connection timeout
code: 'ETIMEDOUT',
command: 'CONN'
```

## Root Cause
Cloud hosting platforms like Render often block or restrict outbound SMTP connections on standard ports (25, 465, 587) to prevent spam. The basic `service: 'gmail'` configuration doesn't work well in these environments.

## Solution Applied
Updated SMTP configuration with:
- **Explicit host/port settings** instead of service shorthand
- **Longer timeouts** (10 seconds)
- **TLS configuration** with `rejectUnauthorized: false`
- **Port 587** with STARTTLS (most compatible)

## Setup Instructions

### For Gmail (Current Setup):

1. **Enable 2-Factor Authentication** on your Gmail account
   - Go to Google Account → Security → 2-Step Verification

2. **Generate App Password**:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the 16-character password

3. **Update Render Environment Variables**:
   ```
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-16-char-app-password
   NOTIFICATION_EMAIL=your-email@gmail.com
   ```

> [!WARNING]
> **If Gmail still doesn't work on Render**, it's likely due to Render's firewall blocking SMTP ports entirely. In that case, you MUST use a transactional email service.

## Alternative: Use Transactional Email Service (RECOMMENDED)

If Gmail doesn't work, switch to a service designed for production:

### **Option A: Resend (Easiest)**
```bash
npm install resend
```
- Free tier: 100 emails/day
- No SMTP needed (uses API)
- Very simple setup

### **Option B: SendGrid**
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
```
- Free tier: 100 emails/day
- Works on all hosting platforms

### **Option C: Mailgun**
```env
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USER=postmaster@your-domain.mailgun.org
EMAIL_PASSWORD=your-mailgun-password
```
- Free tier: 5,000 emails/month

## Files Changed
- [emailService.js](file:///d:/project-email/backend/utils/emailService.js) - Updated SMTP configuration
- [.env.example](file:///d:/project-email/backend/.env.example) - Added SMTP variables

## Testing
After deploying, test the email service:
1. Try signup with OTP
2. Check Render logs for connection errors
3. If still timing out, switch to a transactional email service
