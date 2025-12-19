export enum SeverityLevel {
  MILD = 'MILD',
  MODERATE = 'MODERATE',
  SEVERE = 'SEVERE',
  UNKNOWN = 'UNKNOWN'
}

export type LanguageCode = 'en' | 'hi' | 'bn' | 'te' | 'ta' | 'mr' | 'gu' | 'kn' | 'ml' | 'pa' | 'or' | 'as';

export interface Language {
  code: LanguageCode;
  name: string;
  nativeName: string;
  voiceName: string; // Gemini TTS voice name
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', voiceName: 'Kore' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', voiceName: 'Kore' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', voiceName: 'Kore' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', voiceName: 'Kore' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', voiceName: 'Kore' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', voiceName: 'Kore' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', voiceName: 'Kore' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', voiceName: 'Kore' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', voiceName: 'Kore' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', voiceName: 'Kore' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', voiceName: 'Kore' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', voiceName: 'Kore' },
];

export interface Translations {
  greeting: string;
  describeSymptoms: string;
  uploadImage: string;
  voiceInput: string;
  send: string;
  processing: string;
  clearChat: string;
  connectDoctor: string;
  severeWarning: string;
  assessment: string;
  severity: string;
  summary: string;
  possibleCauses: string;
  remedies: string;
  medicalAdvice: string;
  disclaimer: string;
  awaitingAnalysis: string;
  awaitingAnalysisDesc: string;
  selectLanguage: string;
  profile: string;
  logout: string;
  chatCleared: string;
}

export interface AnalysisData {
  severity: SeverityLevel;
  summary: string;
  possibleCauses: string[];
  remedies: string[];
  medicalAdvice: string;
  disclaimer: string;
  emergencyContact: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text?: string;
  audioData?: string; // base64
  imageData?: string; // base64
  analysis?: AnalysisData;
  timestamp: number;
}

export interface User {
  fullName: string;
  email: string;
  password?: string;
  age: number;
  gender: string;
  medicalHistory: string;
  preferredLanguage: LanguageCode;
  mobileNumber?: string;
}

export interface EmailNotificationConfig {
  to: string;
  subject: string;
  body: string;
  html?: string;
}

export interface SMSNotificationConfig {
  to: string;
  message: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  availability: TimeSlot[];
  consultationFee: number;
  rating: number;
  languages: LanguageCode[];
}

export interface TimeSlot {
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  isBooked: boolean;
}

export interface Appointment {
  id: string;
  userId: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  meetingLink?: string;
  prescriptionId?: string;
  symptoms: string;
  createdAt: number;
}

export interface Prescription {
  id: string;
  appointmentId: string;
  doctorId: string;
  doctorName: string;
  patientId: string;
  patientName: string;
  date: string;
  diagnosis: string;
  medications: Medication[];
  instructions: string;
  followUp?: string;
  documentUrl?: string;
  createdAt: number;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'appointment' | 'prescription' | 'reminder' | 'general';
  title: string;
  message: string;
  read: boolean;
  createdAt: number;
  actionUrl?: string;
  appointmentId?: string;
  prescriptionId?: string;
}
