# Email & SMS Notification Setup Guide

## 📧 Email Notification Services

### Option 1: EmailJS (Recommended for Quick Start)
**Best for**: Testing and small-scale applications
**Free Tier**: 200 emails/month

1. **Sign Up**: Visit [https://www.emailjs.com/](https://www.emailjs.com/)
2. **Create Email Service**:
   - Go to Email Services
   - Click "Add New Service"
   - Choose Gmail, Outlook, or any email provider
   - Follow authentication steps
3. **Create Email Template**:
   - Go to Email Templates
   - Create template with variables: `{{to_email}}`, `{{subject}}`, `{{message}}`, `{{html_content}}`
4. **Get Credentials**:
   - Service ID (e.g., `service_abc123`)
   - Template ID (e.g., `template_xyz789`)
   - Public Key (from Account settings)
5. **Add to Your App**:
   ```javascript
   // In services/notificationService.ts
   const EMAIL_CONFIG = {
     emailJsServiceId: 'your_service_id',
     emailJsTemplateId: 'your_template_id',
     emailJsPublicKey: 'your_public_key'
   };
   ```

### Option 2: SendGrid
**Best for**: Production with high volume
**Free Tier**: 100 emails/day

1. **Sign Up**: [https://sendgrid.com/](https://sendgrid.com/)
2. **Create API Key**: Settings → API Keys → Create API Key
3. **Setup Backend** (Required for security):
   ```javascript
   // Backend API endpoint (Node.js example)
   const sgMail = require('@sendgrid/mail');
   sgMail.setApiKey(process.env.SENDGRID_API_KEY);
   
   app.post('/api/send-email', async (req, res) => {
     const msg = {
       to: req.body.to,
       from: 'noreply@healbuddy.com',
       subject: req.body.subject,
       text: req.body.body,
       html: req.body.html
     };
     await sgMail.send(msg);
     res.json({ success: true });
   });
   ```

### Option 3: AWS SES
**Best for**: Enterprise and scalable solutions
**Pricing**: Very cost-effective for high volume

---

## 📱 SMS Notification Services

### Option 1: Twilio (International)
**Best for**: Global reach
**Free Trial**: $15 credit

1. **Sign Up**: [https://www.twilio.com/](https://www.twilio.com/)
2. **Get Phone Number**: Buy a Twilio phone number
3. **Get Credentials**:
   - Account SID
   - Auth Token
   - Twilio Phone Number
4. **Important**: Must use backend API (never expose tokens in frontend)
   ```javascript
   // Backend API
   const twilio = require('twilio');
   const client = twilio(accountSid, authToken);
   
   app.post('/api/send-sms', async (req, res) => {
     await client.messages.create({
       body: req.body.message,
       from: twilioPhoneNumber,
       to: req.body.to
     });
     res.json({ success: true });
   });
   ```

### Option 2: MSG91 (India - Recommended)
**Best for**: Indian phone numbers
**Free Trial**: Available

1. **Sign Up**: [https://msg91.com/](https://msg91.com/)
2. **Get API Key**: Dashboard → API Keys
3. **Register Sender ID**: Must register sender name (e.g., "HEALBD")
4. **Setup**:
   ```javascript
   // Backend API
   app.post('/api/send-sms', async (req, res) => {
     const response = await fetch('https://api.msg91.com/api/v5/flow/', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
         'authkey': process.env.MSG91_AUTH_KEY
       },
       body: JSON.stringify({
         sender: 'HEALBD',
         mobiles: req.body.to,
         message: req.body.message,
         route: '4'
       })
     });
     res.json({ success: true });
   });
   ```

### Option 3: Fast2SMS (India)
**Best for**: Budget-friendly Indian SMS
**Website**: [https://www.fast2sms.com/](https://www.fast2sms.com/)

---

## 🔧 Implementation Steps

### Step 1: Choose Your Services
- Email: EmailJS (for quick start) or SendGrid (for production)
- SMS: MSG91 or Fast2SMS (for India) or Twilio (international)

### Step 2: Update Configuration
In `services/notificationService.ts`, update the config:

```typescript
const EMAIL_CONFIG = {
  emailJsServiceId: 'YOUR_SERVICE_ID',
  emailJsTemplateId: 'YOUR_TEMPLATE_ID',
  emailJsPublicKey: 'YOUR_PUBLIC_KEY'
};

const SMS_CONFIG = {
  msg91AuthKey: 'YOUR_MSG91_KEY',
  msg91SenderId: 'HEALBD'
};
```

### Step 3: Create Backend API (Recommended for Production)

**Node.js/Express Backend Example**:

```javascript
// server.js
const express = require('express');
const cors = require('cors');
const sgMail = require('@sendgrid/mail');
const app = express();

app.use(cors());
app.use(express.json());

// SendGrid setup
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Email endpoint
app.post('/api/send-email', async (req, res) => {
  try {
    const { to, subject, body, html } = req.body;
    await sgMail.send({
      to,
      from: 'noreply@healbuddy.com',
      subject,
      text: body,
      html
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// SMS endpoint (MSG91)
app.post('/api/send-sms', async (req, res) => {
  try {
    const { to, message } = req.body;
    const response = await fetch('https://api.msg91.com/api/v5/flow/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'authkey': process.env.MSG91_AUTH_KEY
      },
      body: JSON.stringify({
        sender: 'HEALBD',
        mobiles: to,
        message,
        route: '4'
      })
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

### Step 4: Environment Variables

Create `.env` file:
```env
# Email
EMAILJS_SERVICE_ID=service_xyz123
EMAILJS_TEMPLATE_ID=template_abc456
EMAILJS_PUBLIC_KEY=your_public_key

# Or for SendGrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxx

# SMS - MSG91
MSG91_AUTH_KEY=your_auth_key
MSG91_SENDER_ID=HEALBD

# Or for Twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Backend API URLs
BACKEND_API_URL=https://your-backend.com/api/send-email
BACKEND_SMS_API_URL=https://your-backend.com/api/send-sms
```

---

## 🚀 Quick Start (For Testing)

### Using EmailJS (No Backend Required)

1. Sign up at EmailJS
2. Update config in `notificationService.ts`
3. Test:
   ```javascript
   // In browser console
   import { sendEmail } from './services/notificationService';
   
   sendEmail({
     to: 'test@example.com',
     subject: 'Test Email',
     body: 'This is a test!'
   });
   ```

### Using Mock Services (For Development)

```javascript
// In notificationService.ts
export const sendEmail = async (config) => {
  console.log('📧 Email would be sent to:', config.to);
  console.log('Subject:', config.subject);
  return true; // Mock success
};

export const sendSMS = async (config) => {
  console.log('📱 SMS would be sent to:', config.to);
  console.log('Message:', config.message);
  return true; // Mock success
};
```

---

## 📊 Cost Comparison

| Service | Free Tier | Paid Plans | Best For |
|---------|-----------|------------|----------|
| **EmailJS** | 200/month | $10/month (1000) | Quick start, testing |
| **SendGrid** | 100/day | $15/month (40K) | Production apps |
| **Twilio SMS** | $15 credit | $0.0075/SMS | International |
| **MSG91** | Trial | ₹0.15-0.25/SMS | India |
| **Fast2SMS** | Trial | ₹0.10-0.20/SMS | India budget |

---

## 🔒 Security Best Practices

1. **Never expose API keys in frontend code**
2. **Always use environment variables**
3. **Implement rate limiting on backend**
4. **Validate email/phone numbers before sending**
5. **Use HTTPS for all API calls**
6. **Log all notification attempts**
7. **Implement retry mechanism for failures**

---

## 📝 Testing

1. **Test with your own email/phone first**
2. **Check spam folder for emails**
3. **Verify phone number format** (+91XXXXXXXXXX for India)
4. **Monitor API usage/credits**
5. **Test notification templates**

---

## 🆘 Troubleshooting

### Emails not received?
- Check spam folder
- Verify sender email is authenticated
- Check EmailJS/SendGrid logs
- Verify email template syntax

### SMS not received?
- Verify phone number format includes country code
- Check DND (Do Not Disturb) registry
- Verify sender ID is registered
- Check SMS service credits/balance
- Test with different provider

### API errors?
- Verify API keys are correct
- Check CORS settings on backend
- Monitor rate limits
- Check console for error messages

---

## 📞 Support

For detailed setup help:
- **EmailJS Docs**: https://www.emailjs.com/docs/
- **SendGrid Docs**: https://docs.sendgrid.com/
- **Twilio Docs**: https://www.twilio.com/docs/
- **MSG91 Docs**: https://docs.msg91.com/

---

Ready to implement? Start with EmailJS for emails (easiest) and add SMS later!
