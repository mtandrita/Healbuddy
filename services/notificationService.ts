import { EmailNotificationConfig, SMSNotificationConfig, Appointment, Prescription } from '../types';

// Email Service Configuration
// You can use services like EmailJS, SendGrid, AWS SES, or Mailgun
// For production, replace with your actual API keys

const EMAIL_CONFIG = {
  // EmailJS Configuration (Free tier: 200 emails/month)
  emailJsServiceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || 'YOUR_EMAILJS_SERVICE_ID',
  emailJsTemplateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'YOUR_EMAILJS_TEMPLATE_ID',
  emailJsPublicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'YOUR_EMAILJS_PUBLIC_KEY',
  
  // Alternative: Use your backend API endpoint
  backendApiUrl: import.meta.env.VITE_BACKEND_API_URL || 'https://your-backend.com/api/send-email'
};

// SMS Service Configuration
// You can use services like Twilio, MSG91, or Fast2SMS
const SMS_CONFIG = {
  // Twilio Configuration
  twilioAccountSid: import.meta.env.VITE_TWILIO_ACCOUNT_SID || 'YOUR_TWILIO_ACCOUNT_SID',
  twilioAuthToken: import.meta.env.VITE_TWILIO_AUTH_TOKEN || 'YOUR_TWILIO_AUTH_TOKEN',
  twilioPhoneNumber: import.meta.env.VITE_TWILIO_PHONE_NUMBER || 'YOUR_TWILIO_PHONE',
  
  // Alternative: MSG91 (Popular in India)
  msg91AuthKey: import.meta.env.VITE_MSG91_AUTH_KEY || 'YOUR_MSG91_AUTH_KEY',
  msg91SenderId: import.meta.env.VITE_MSG91_SENDER_ID || 'HEALBD',
  
  // Alternative: Fast2SMS (India)
  fast2smsApiKey: import.meta.env.VITE_FAST2SMS_API_KEY || 'YOUR_FAST2SMS_API_KEY',
  
  // Alternative: Use your backend API endpoint
  backendApiUrl: import.meta.env.VITE_BACKEND_SMS_API_URL || 'https://your-backend.com/api/send-sms'
};

/**
 * Send Email using EmailJS (Client-side)
 * Sign up at: https://www.emailjs.com/
 */
export const sendEmailViaEmailJS = async (config: EmailNotificationConfig): Promise<boolean> => {
  try {
    // Load EmailJS SDK if not already loaded
    if (typeof (window as any).emailjs === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
      script.async = true;
      document.head.appendChild(script);
      await new Promise(resolve => script.onload = resolve);
    }

    const emailjs = (window as any).emailjs;
    emailjs.init(EMAIL_CONFIG.emailJsPublicKey);

    const templateParams = {
      to_email: config.to,
      subject: config.subject,
      message: config.body,
      html_content: config.html || config.body
    };

    await emailjs.send(
      EMAIL_CONFIG.emailJsServiceId,
      EMAIL_CONFIG.emailJsTemplateId,
      templateParams
    );

    console.log('Email sent successfully via EmailJS');
    return true;
  } catch (error) {
    console.error('EmailJS Error:', error);
    return false;
  }
};

/**
 * Send Email via Backend API
 * This is the recommended approach for production
 */
export const sendEmailViaBackend = async (config: EmailNotificationConfig): Promise<boolean> => {
  try {
    const response = await fetch(EMAIL_CONFIG.backendApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: config.to,
        subject: config.subject,
        body: config.body,
        html: config.html
      })
    });

    if (!response.ok) throw new Error('Email API failed');
    
    console.log('Email sent successfully via Backend');
    return true;
  } catch (error) {
    console.error('Backend Email Error:', error);
    return false;
  }
};

/**
 * Send SMS using Twilio
 * Sign up at: https://www.twilio.com/
 */
export const sendSMSViaTwilio = async (config: SMSNotificationConfig): Promise<boolean> => {
  try {
    // Note: For security, Twilio should be called from backend only
    // This is a placeholder - implement backend endpoint
    const response = await fetch('https://api.twilio.com/2010-04-01/Accounts/' + SMS_CONFIG.twilioAccountSid + '/Messages.json', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(SMS_CONFIG.twilioAccountSid + ':' + SMS_CONFIG.twilioAuthToken),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        To: config.to,
        From: SMS_CONFIG.twilioPhoneNumber,
        Body: config.message
      })
    });

    if (!response.ok) throw new Error('Twilio API failed');
    
    console.log('SMS sent successfully via Twilio');
    return true;
  } catch (error) {
    console.error('Twilio Error:', error);
    return false;
  }
};

/**
 * Send SMS using MSG91 (India)
 * Sign up at: https://msg91.com/
 */
export const sendSMSViaMSG91 = async (config: SMSNotificationConfig): Promise<boolean> => {
  try {
    const response = await fetch('https://api.msg91.com/api/v5/flow/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'authkey': SMS_CONFIG.msg91AuthKey
      },
      body: JSON.stringify({
        sender: SMS_CONFIG.msg91SenderId,
        mobiles: config.to,
        message: config.message,
        route: '4' // Transactional route
      })
    });

    if (!response.ok) throw new Error('MSG91 API failed');
    
    console.log('SMS sent successfully via MSG91');
    return true;
  } catch (error) {
    console.error('MSG91 Error:', error);
    return false;
  }
};

/**
 * Send SMS using Fast2SMS (India)
 * Sign up at: https://www.fast2sms.com/
 */
export const sendSMSViaFast2SMS = async (config: SMSNotificationConfig): Promise<boolean> => {
  try {
    const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'authorization': SMS_CONFIG.fast2smsApiKey
      },
      body: JSON.stringify({
        route: 'v3',
        sender_id: 'HEALBD',
        message: config.message,
        language: 'english',
        flash: 0,
        numbers: config.to
      })
    });

    if (!response.ok) throw new Error('Fast2SMS API failed');
    
    console.log('SMS sent successfully via Fast2SMS');
    return true;
  } catch (error) {
    console.error('Fast2SMS Error:', error);
    return false;
  }
};

/**
 * Send SMS via Backend API (RECOMMENDED for Production)
 */
export const sendSMSViaBackend = async (config: SMSNotificationConfig): Promise<boolean> => {
  try {
    const response = await fetch(SMS_CONFIG.backendApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: config.to,
        message: config.message
      })
    });

    if (!response.ok) throw new Error('SMS API failed');
    
    console.log('SMS sent successfully via Backend');
    return true;
  } catch (error) {
    console.error('Backend SMS Error:', error);
    return false;
  }
};

/**
 * Main function to send Email (Choose your preferred method)
 */
export const sendEmail = async (config: EmailNotificationConfig): Promise<boolean> => {
  // Try backend first, fallback to EmailJS
  const backendSuccess = await sendEmailViaBackend(config);
  if (backendSuccess) return true;
  
  // Fallback to EmailJS (client-side)
  return await sendEmailViaEmailJS(config);
};

/**
 * Main function to send SMS (Choose your preferred method)
 */
export const sendSMS = async (config: SMSNotificationConfig): Promise<boolean> => {
  // IMPORTANT: For production, always use backend API for security
  // Never expose API keys in frontend code
  
  // Try backend API
  return await sendSMSViaBackend(config);
  
  // For testing only (uncomment one):
  // return await sendSMSViaMSG91(config);
  // return await sendSMSViaFast2SMS(config);
  // return await sendSMSViaTwilio(config);
};

/**
 * Send Appointment Confirmation via Email
 */
export const sendAppointmentEmailNotification = async (
  appointment: Appointment,
  userEmail: string,
  userName: string
): Promise<boolean> => {
  const emailConfig: EmailNotificationConfig = {
    to: userEmail,
    subject: '✅ Appointment Confirmed - HealBuddy',
    body: `Dear ${userName},

Your appointment has been confirmed!

Appointment Details:
━━━━━━━━━━━━━━━━━━━━━━
Doctor: ${appointment.doctorName}
Date: ${new Date(appointment.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
Time: ${appointment.time}
Appointment ID: ${appointment.id}

Meeting Link: ${appointment.meetingLink || 'Will be shared shortly'}

${appointment.symptoms ? `Your Symptoms: ${appointment.symptoms}` : ''}

Important Reminders:
• Join the meeting 5 minutes early
• Keep your medical history ready
• Prepare any questions for the doctor
• You'll receive a reminder 30 minutes before

Need to reschedule? Contact us at support@healbuddy.com

Stay healthy!
Team HealBuddy`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
    .detail-box { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
    .detail-row { margin: 10px 0; }
    .label { font-weight: bold; color: #667eea; }
    .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Appointment Confirmed!</h1>
    </div>
    <div class="content">
      <p>Dear <strong>${userName}</strong>,</p>
      <p>Your appointment has been successfully confirmed. We look forward to serving you!</p>
      
      <div class="detail-box">
        <h3 style="margin-top: 0; color: #667eea;">Appointment Details</h3>
        <div class="detail-row"><span class="label">Doctor:</span> ${appointment.doctorName}</div>
        <div class="detail-row"><span class="label">Date:</span> ${new Date(appointment.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
        <div class="detail-row"><span class="label">Time:</span> ${appointment.time}</div>
        <div class="detail-row"><span class="label">Appointment ID:</span> ${appointment.id}</div>
      </div>

      ${appointment.meetingLink ? `<a href="${appointment.meetingLink}" class="button">Join Video Consultation</a>` : ''}

      ${appointment.symptoms ? `<p><strong>Your Symptoms:</strong><br>${appointment.symptoms}</p>` : ''}

      <h4>Important Reminders:</h4>
      <ul>
        <li>Join the meeting 5 minutes early</li>
        <li>Keep your medical history ready</li>
        <li>Prepare any questions for the doctor</li>
        <li>You'll receive a reminder 30 minutes before</li>
      </ul>

      <p>Need to reschedule? Contact us at <a href="mailto:support@healbuddy.com">support@healbuddy.com</a></p>
    </div>
    <div class="footer">
      <p>Stay healthy!<br><strong>Team HealBuddy</strong></p>
      <p style="font-size: 11px; color: #999;">This is an automated message. Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
    `
  };

  return await sendEmail(emailConfig);
};

/**
 * Send Appointment Confirmation via SMS
 */
export const sendAppointmentSMSNotification = async (
  appointment: Appointment,
  mobileNumber: string,
  userName: string
): Promise<boolean> => {
  const smsConfig: SMSNotificationConfig = {
    to: mobileNumber,
    message: `Dear ${userName}, Your appointment with ${appointment.doctorName} is confirmed for ${new Date(appointment.date).toLocaleDateString()} at ${appointment.time}. Meeting: ${appointment.meetingLink || 'Will be shared'}. ID: ${appointment.id}. -HealBuddy`
  };

  return await sendSMS(smsConfig);
};

/**
 * Send Prescription via Email
 */
export const sendPrescriptionEmailNotification = async (
  prescription: Prescription,
  userEmail: string
): Promise<boolean> => {
  const medicationsList = prescription.medications
    .map((med, idx) => `${idx + 1}. ${med.name} - ${med.dosage}, ${med.frequency}, ${med.duration}`)
    .join('\n');

  const emailConfig: EmailNotificationConfig = {
    to: userEmail,
    subject: '💊 New Prescription - HealBuddy',
    body: `Dear ${prescription.patientName},

Dr. ${prescription.doctorName} has issued a new prescription for you.

Prescription Details:
━━━━━━━━━━━━━━━━━━━━━━
Prescription ID: ${prescription.id}
Date: ${new Date(prescription.date).toLocaleDateString()}
Diagnosis: ${prescription.diagnosis}

Medications Prescribed:
${medicationsList}

Instructions: ${prescription.instructions}

${prescription.followUp ? `Follow-up: ${prescription.followUp}` : ''}

Please download your prescription from the HealBuddy app for complete details.

Stay healthy!
Team HealBuddy`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
    .detail-box { background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
    .med-item { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; border: 1px solid #d1fae5; }
    .label { font-weight: bold; color: #059669; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>💊 New Prescription</h1>
    </div>
    <div class="content">
      <p>Dear <strong>${prescription.patientName}</strong>,</p>
      <p>Dr. ${prescription.doctorName} has issued a new prescription for you.</p>
      
      <div class="detail-box">
        <div><span class="label">Prescription ID:</span> ${prescription.id}</div>
        <div><span class="label">Date:</span> ${new Date(prescription.date).toLocaleDateString()}</div>
        <div><span class="label">Diagnosis:</span> ${prescription.diagnosis}</div>
      </div>

      <h3 style="color: #059669;">Medications Prescribed:</h3>
      ${prescription.medications.map((med, idx) => `
        <div class="med-item">
          <strong>${idx + 1}. ${med.name}</strong><br>
          <small>Dosage: ${med.dosage} | Frequency: ${med.frequency} | Duration: ${med.duration}</small><br>
          ${med.instructions ? `<em style="color: #666;">Note: ${med.instructions}</em>` : ''}
        </div>
      `).join('')}

      <p><strong>Instructions:</strong><br>${prescription.instructions}</p>
      
      ${prescription.followUp ? `<p style="background: #fef3c7; padding: 15px; border-radius: 5px; border-left: 4px solid #f59e0b;"><strong>Follow-up Required:</strong><br>${prescription.followUp}</p>` : ''}

      <p>Please download your complete prescription from the HealBuddy app.</p>
    </div>
    <div class="footer">
      <p>Stay healthy!<br><strong>Team HealBuddy</strong></p>
    </div>
  </div>
</body>
</html>
    `
  };

  return await sendEmail(emailConfig);
};

/**
 * Send Prescription via SMS
 */
export const sendPrescriptionSMSNotification = async (
  prescription: Prescription,
  mobileNumber: string
): Promise<boolean> => {
  const smsConfig: SMSNotificationConfig = {
    to: mobileNumber,
    message: `Dear ${prescription.patientName}, Dr. ${prescription.doctorName} has issued a new prescription (ID: ${prescription.id}). Diagnosis: ${prescription.diagnosis}. Please check the HealBuddy app for complete details. -HealBuddy`
  };

  return await sendSMS(smsConfig);
};

/**
 * Send Appointment Reminder (30 minutes before)
 */
export const sendAppointmentReminder = async (
  appointment: Appointment,
  userEmail: string,
  mobileNumber: string | undefined,
  userName: string
): Promise<void> => {
  // Email reminder
  const emailConfig: EmailNotificationConfig = {
    to: userEmail,
    subject: '⏰ Appointment Reminder - In 30 Minutes!',
    body: `Dear ${userName},

This is a reminder that your appointment with Dr. ${appointment.doctorName} is scheduled in 30 minutes.

Time: ${appointment.time}
Meeting Link: ${appointment.meetingLink}

Please join 5 minutes early.

Team HealBuddy`
  };

  await sendEmail(emailConfig);

  // SMS reminder
  if (mobileNumber) {
    const smsConfig: SMSNotificationConfig = {
      to: mobileNumber,
      message: `REMINDER: Your appointment with Dr. ${appointment.doctorName} is in 30 minutes at ${appointment.time}. Join: ${appointment.meetingLink} -HealBuddy`
    };

    await sendSMS(smsConfig);
  }
};
