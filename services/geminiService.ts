import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { AnalysisData, SeverityLevel, User, LanguageCode, SUPPORTED_LANGUAGES } from "../types";

// Initialize Gemini Client
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY';
const genAI = new GoogleGenerativeAI(apiKey);

const BASE_SYSTEM_INSTRUCTION = `
You are HealBuddy, a compassionate and intelligent AI Health Assistant.
Your goal is to analyze user symptoms (text, audio, or visual images of rashes/wounds) and provide structured health advice.

CRITICAL RULES:
1. YOU ARE NOT A DOCTOR. Always include a disclaimer.
2. DO NOT DIAGNOSE DISEASES definitively. Use phrases like "Possible causes include..."
3. DO NOT PRESCRIPTION restricted medicines. Only suggest Over-The-Counter (OTC) or home remedies.
4. DETERMINE SEVERITY:
   - MILD: Cold, minor headache, fatigue, sore throat, acidity, minor rashes.
   - MODERATE: Persistent pain, fever > 101F, dizziness, migraine, spreading rashes, signs of infection.
   - SEVERE: Chest pain, trouble breathing, fainting, severe dehydration, uncontrolled bleeding, stroke symptoms, severe allergic reactions.

Output MUST be strictly in JSON format matching the schema provided.
If the case is SEVERE, set 'emergencyContact' to true and advise immediate medical attention.
`;

const getSystemInstruction = (user?: User, language?: LanguageCode) => {
  let instruction = BASE_SYSTEM_INSTRUCTION;
  
  if (language && language !== 'en') {
    const languageInfo = SUPPORTED_LANGUAGES.find(lang => lang.code === language);
    if (languageInfo) {
      instruction += `\n\nIMPORTANT: Respond in ${languageInfo.name} (${languageInfo.nativeName}) language. All fields in the JSON response (summary, possibleCauses, remedies, medicalAdvice, disclaimer) MUST be in ${languageInfo.name}.`;
    }
  }
  
  if (user) {
    instruction += `\n\nUSER CONTEXT:\nName: ${user.fullName}\nAge: ${user.age}\nGender: ${user.gender}\nMedical History: ${user.medicalHistory}\n\nTailor your response and advice considering this user's profile and medical history. Address them by name if appropriate.`;
  }
  return instruction;
};

export const analyzeHealthQuery = async (
  textInput: string | null,
  audioBase64: string | null,
  imageBase64: string | null,
  userContext?: User,
  language?: LanguageCode
): Promise<AnalysisData> => {
  try {
    const parts: any[] = [];

    if (audioBase64) {
      parts.push({
        inlineData: {
          mimeType: "audio/wav", 
          data: audioBase64
        }
      });
    }

    if (imageBase64) {
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: imageBase64
        }
      });
    }

    if (textInput) {
      parts.push({ text: textInput });
    }

    if (parts.length === 0) {
      throw new Error("No input provided");
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      systemInstruction: getSystemInstruction(userContext, language),
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            severity: { 
              type: SchemaType.STRING, 
              enum: [SeverityLevel.MILD, SeverityLevel.MODERATE, SeverityLevel.SEVERE, SeverityLevel.UNKNOWN] 
            },
            summary: { type: SchemaType.STRING, description: "A concise summary of the reported symptoms." },
            possibleCauses: { 
              type: SchemaType.ARRAY, 
              items: { type: SchemaType.STRING }, 
              description: "List of 3-5 potential common causes." 
            },
            remedies: { 
              type: SchemaType.ARRAY, 
              items: { type: SchemaType.STRING }, 
              description: "List of home remedies or OTC suggestions." 
            },
            medicalAdvice: { type: SchemaType.STRING, description: "Specific advice on when to see a doctor." },
            disclaimer: { type: SchemaType.STRING, description: "Standard medical disclaimer string." },
            emergencyContact: { 
              type: SchemaType.BOOLEAN, 
              description: "True if immediate doctor/ER connection is recommended." 
            }
          },
          required: ["severity", "summary", "possibleCauses", "remedies", "medicalAdvice", "disclaimer", "emergencyContact"]
        }
      }
    });

    const result = await model.generateContent({
      contents: [{ role: "user", parts }]
    });

    const response = result.response;
    const text = response.text();
    
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as AnalysisData;

  } catch (error) {
    console.error("Analysis Error:", error);
    return {
      severity: SeverityLevel.UNKNOWN,
      summary: "I encountered an error analyzing your symptoms.",
      possibleCauses: [],
      remedies: [],
      medicalAdvice: "Please try again or consult a doctor directly.",
      disclaimer: "System Error.",
      emergencyContact: false
    };
  }
};

export const generateSpeech = async (text: string, languageCode: LanguageCode, context?: AudioContext): Promise<AudioBuffer | null> => {
  try {
    // For now, we'll use browser's built-in Speech Synthesis API as a fallback
    // Google's Gemini TTS API is not yet available in the standard SDK
    
    // Create a simple audio buffer with silence (placeholder)
    // In production, you would integrate with Google Cloud Text-to-Speech API
    const audioContext = context || new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const buffer = audioContext.createBuffer(1, audioContext.sampleRate * 2, audioContext.sampleRate);
    
    // Use Web Speech API as alternative
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      const languageInfo = SUPPORTED_LANGUAGES.find(lang => lang.code === languageCode);
      
      if (languageInfo) {
        utterance.lang = languageInfo.code === 'en' ? 'en-US' : 
                         languageInfo.code === 'hi' ? 'hi-IN' :
                         languageInfo.code === 'bn' ? 'bn-IN' :
                         languageInfo.code === 'te' ? 'te-IN' :
                         languageInfo.code === 'ta' ? 'ta-IN' :
                         languageInfo.code === 'mr' ? 'mr-IN' :
                         languageInfo.code === 'gu' ? 'gu-IN' :
                         languageInfo.code === 'kn' ? 'kn-IN' :
                         languageInfo.code === 'ml' ? 'ml-IN' :
                         languageInfo.code === 'pa' ? 'pa-IN' :
                         languageInfo.code === 'or' ? 'or-IN' : 'en-US';
      }
      
      // Speak the text
      window.speechSynthesis.speak(utterance);
    }

    return buffer;

  } catch (error) {
    console.error("TTS Error:", error);
    return null;
  }
};
