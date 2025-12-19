# Healthcare Buddy - Quick Start Guide

## ✅ Setup Complete!

Your comprehensive telemedicine app with AI-powered translation is ready!

## 🚀 Running the Application

The development server is running at: **http://localhost:5174/**

### Commands:
- **Start Dev Server**: `npm run dev`
- **Build for Production**: `npm run build`
- **Preview Production Build**: `npm preview`

## 🎯 Key Features Configured

### 1. **Multi-Language Support (12 Languages)**
   - English, Hindi, Bengali, Telugu, Tamil, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Odia, Assamese
   - Real-time UI translation
   - Language-specific voice responses

### 2. **AI Health Assistant**
   - Powered by Google Gemini AI
   - Analyzes text, voice, and image inputs
   - Provides severity assessment and recommendations
   - Multi-language medical advice

### 3. **Doctor-Patient Translation Chat** ⭐ NEW
   - Real-time text translation between any supported languages
   - Auto-speak translations in patient's/doctor's language
   - Bidirectional communication
   - Voice synthesis for accessibility

### 4. **Appointment Booking System**
   - Book consultations with specialists
   - Automatic Google Meet link generation
   - Email and SMS notifications

### 5. **Prescription Management**
   - View all prescriptions
   - Download as text files
   - Share via email or WhatsApp

### 6. **Notification Center**
   - Appointment reminders
   - Prescription notifications
   - Email and SMS delivery

## 🔑 API Key Configuration

✅ **Gemini API Key Already Configured!**
Your API key is set in `.env` file.

## 📱 How to Use

### For Patients:

1. **Register/Login**
   - Create account with your preferred language
   - Add mobile number for SMS notifications

2. **Describe Symptoms**
   - Type, speak, or upload images
   - AI analyzes and provides recommendations
   - Get responses in your language

3. **Book Appointment**
   - Click "Appointments" in header
   - Select doctor and time slot
   - Receive email/SMS confirmation

4. **Talk to Doctor** ⭐ NEW
   - Click "Doctor Chat" button in header
   - Messages auto-translate between languages
   - Voice synthesis reads translations aloud
   - Example: You type in Hindi → Doctor reads in English

### Translation Features:

**Text Translation:**
- Patient writes in Hindi → Doctor sees English
- Doctor replies in English → Patient sees Hindi

**Voice Translation:**
- Auto-speak feature reads translations aloud
- Toggle on/off in chat interface
- Works for all 12 supported languages

**Usage Example:**
```
Patient (Hindi): "मुझे बुखार और सिरदर्द है"
→ Translates to English: "I have fever and headache"
→ Doctor hears in English (voice)

Doctor (English): "Take rest and drink fluids"
→ Translates to Hindi: "आराम करें और तरल पदार्थ पिएं"  
→ Patient hears in Hindi (voice)
```

## 🔧 Technical Stack
```bash
cp .env.example .env
```

### 2. Get your API Keys:

#### **Google Gemini API** (Required for AI features):
- Visit: https://aistudio.google.com/app/apikey
- Create a new API key
- Add to `.env`: `VITE_GEMINI_API_KEY=your_key_here`

#### **EmailJS** (For email notifications):
- Visit: https://www.emailjs.com/
- Sign up for free account (200 emails/month)
- Follow setup guide in `EMAIL_SMS_SETUP.md`

#### **SMS Service** (Optional):
- **MSG91** (India): https://msg91.com/
- **Twilio** (International): https://www.twilio.com/
- **Fast2SMS** (India Budget): https://www.fast2sms.com/
- Follow detailed setup in `EMAIL_SMS_SETUP.md`

## 📱 Features Available

✅ **Multi-language Support**: 12 languages (English + 11 Indian languages)
✅ **AI Health Assistant**: Powered by Google Gemini
✅ **Voice Input/Output**: Speech recognition and text-to-speech
✅ **Image Analysis**: Upload medical images for AI analysis
✅ **Appointment Booking**: Schedule doctor consultations
✅ **Prescription Management**: View and download prescriptions
✅ **Email Notifications**: Appointment and prescription alerts
✅ **SMS Notifications**: Mobile alerts (requires API configuration)
✅ **Notification Center**: In-app notification management

## 📖 Documentation

- **Email/SMS Setup**: See `EMAIL_SMS_SETUP.md`
- **Project Structure**: See workspace root

## 🛠️ Development Notes

- The `@tailwind` CSS warnings are normal - they're processed by PostCSS during build
- Environment variables must start with `VITE_` to be accessible in the app
- For production, use a backend API for SMS/email to secure API keys
- LocalStorage is used for data persistence (suitable for demo/testing)

## 🎯 Current Status

✅ All TypeScript errors fixed
✅ All dependencies installed
✅ Development server running
✅ All features implemented
⏳ Awaiting API key configuration

## 💡 Tips

1. Test with just Gemini API key first (for AI features)
2. Add EmailJS next (easiest, no backend needed)
3. Add SMS later (requires more setup)
4. Use sample data for testing without real appointments

---

**Need Help?** Check the detailed documentation in `EMAIL_SMS_SETUP.md`
