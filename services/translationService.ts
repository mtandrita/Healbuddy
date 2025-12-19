import { GoogleGenerativeAI } from "@google/generative-ai";
import { LanguageCode, SUPPORTED_LANGUAGES } from "../types";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY';
const genAI = new GoogleGenerativeAI(apiKey);

/**
 * Translate text from one language to another using Gemini AI
 */
export const translateText = async (
  text: string,
  fromLanguage: LanguageCode,
  toLanguage: LanguageCode
): Promise<string> => {
  try {
    if (fromLanguage === toLanguage) {
      return text;
    }

    const fromLang = SUPPORTED_LANGUAGES.find(l => l.code === fromLanguage);
    const toLang = SUPPORTED_LANGUAGES.find(l => l.code === toLanguage);

    if (!fromLang || !toLang) {
      throw new Error('Unsupported language');
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: `You are a professional medical translator. Translate the following text from ${fromLang.name} to ${toLang.name}. Maintain medical terminology accuracy and cultural sensitivity. Return ONLY the translated text, nothing else.`
    });

    const result = await model.generateContent(text);
    const response = result.response;
    const translatedText = response.text();

    return translatedText.trim();
  } catch (error) {
    console.error('Translation Error:', error);
    return text; // Fallback to original text
  }
};

/**
 * Translate and speak text (for doctor-to-patient communication)
 */
export const translateAndSpeak = async (
  text: string,
  fromLanguage: LanguageCode,
  toLanguage: LanguageCode
): Promise<string> => {
  try {
    // First translate the text
    const translatedText = await translateText(text, fromLanguage, toLanguage);

    // Then speak it using Web Speech API
    if ('speechSynthesis' in window) {
      // Stop any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(translatedText);
      
      // Set language code for speech synthesis
      const langCode = toLanguage === 'en' ? 'en-US' : 
                       toLanguage === 'hi' ? 'hi-IN' :
                       toLanguage === 'bn' ? 'bn-IN' :
                       toLanguage === 'te' ? 'te-IN' :
                       toLanguage === 'ta' ? 'ta-IN' :
                       toLanguage === 'mr' ? 'mr-IN' :
                       toLanguage === 'gu' ? 'gu-IN' :
                       toLanguage === 'kn' ? 'kn-IN' :
                       toLanguage === 'ml' ? 'ml-IN' :
                       toLanguage === 'pa' ? 'pa-IN' :
                       toLanguage === 'or' ? 'or-IN' :
                       toLanguage === 'as' ? 'as-IN' : 'en-US';
      
      utterance.lang = langCode;
      utterance.rate = 0.9; // Slightly slower for better comprehension
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      window.speechSynthesis.speak(utterance);
    }

    return translatedText;
  } catch (error) {
    console.error('Translate and Speak Error:', error);
    return text;
  }
};

/**
 * Translate audio transcript (for patient voice input)
 */
export const translateAudioTranscript = async (
  transcript: string,
  fromLanguage: LanguageCode,
  toLanguage: LanguageCode
): Promise<string> => {
  return translateText(transcript, fromLanguage, toLanguage);
};

/**
 * Get available voices for a language
 */
export const getAvailableVoices = (languageCode: LanguageCode): SpeechSynthesisVoice[] => {
  if (!('speechSynthesis' in window)) {
    return [];
  }

  const langCode = languageCode === 'en' ? 'en' : 
                   languageCode === 'hi' ? 'hi' :
                   languageCode === 'bn' ? 'bn' :
                   languageCode === 'te' ? 'te' :
                   languageCode === 'ta' ? 'ta' :
                   languageCode === 'mr' ? 'mr' :
                   languageCode === 'gu' ? 'gu' :
                   languageCode === 'kn' ? 'kn' :
                   languageCode === 'ml' ? 'ml' :
                   languageCode === 'pa' ? 'pa' :
                   languageCode === 'or' ? 'or' :
                   languageCode === 'as' ? 'as' : 'en';

  const voices = window.speechSynthesis.getVoices();
  return voices.filter(voice => voice.lang.startsWith(langCode));
};

/**
 * Batch translate multiple messages (for chat history)
 */
export const batchTranslate = async (
  messages: { text: string; id: string }[],
  fromLanguage: LanguageCode,
  toLanguage: LanguageCode
): Promise<{ [id: string]: string }> => {
  try {
    if (fromLanguage === toLanguage) {
      return messages.reduce((acc, msg) => {
        acc[msg.id] = msg.text;
        return acc;
      }, {} as { [id: string]: string });
    }

    const translations: { [id: string]: string } = {};
    
    // Translate messages in parallel (up to 5 at a time to avoid rate limits)
    const batchSize = 5;
    for (let i = 0; i < messages.length; i += batchSize) {
      const batch = messages.slice(i, i + batchSize);
      const results = await Promise.all(
        batch.map(msg => translateText(msg.text, fromLanguage, toLanguage))
      );
      
      batch.forEach((msg, idx) => {
        translations[msg.id] = results[idx];
      });
    }

    return translations;
  } catch (error) {
    console.error('Batch Translation Error:', error);
    return messages.reduce((acc, msg) => {
      acc[msg.id] = msg.text;
      return acc;
    }, {} as { [id: string]: string });
  }
};

/**
 * Detect language from text using Gemini AI
 */
export const detectLanguage = async (text: string): Promise<LanguageCode> => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: `Detect the language of the following text. Return ONLY the two-letter language code from this list: en (English), hi (Hindi), bn (Bengali), te (Telugu), ta (Tamil), mr (Marathi), gu (Gujarati), kn (Kannada), ml (Malayalam), pa (Punjabi), or (Odia), as (Assamese). Return only the code, nothing else.`
    });

    const result = await model.generateContent(text);
    const response = result.response;
    const detectedCode = response.text().trim().toLowerCase();

    // Validate detected code
    if (SUPPORTED_LANGUAGES.find(l => l.code === detectedCode)) {
      return detectedCode as LanguageCode;
    }

    return 'en'; // Default to English
  } catch (error) {
    console.error('Language Detection Error:', error);
    return 'en';
  }
};

/**
 * Stop any ongoing speech
 */
export const stopSpeech = (): void => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};
