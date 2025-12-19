/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY: string
  readonly VITE_EMAILJS_SERVICE_ID: string
  readonly VITE_EMAILJS_TEMPLATE_ID: string
  readonly VITE_EMAILJS_PUBLIC_KEY: string
  readonly VITE_BACKEND_API_URL: string
  readonly VITE_TWILIO_ACCOUNT_SID: string
  readonly VITE_TWILIO_AUTH_TOKEN: string
  readonly VITE_TWILIO_PHONE_NUMBER: string
  readonly VITE_MSG91_AUTH_KEY: string
  readonly VITE_MSG91_SENDER_ID: string
  readonly VITE_FAST2SMS_API_KEY: string
  readonly VITE_BACKEND_SMS_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
