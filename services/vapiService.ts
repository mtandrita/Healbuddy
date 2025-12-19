// Vapi AI Voice Agent Service for Heal Buddy
// Phone Number: +1 (415) 231-1749

export const VAPI_CONFIG = {
  publicKey: '083d61ac-3165-4bb5-a317-76e0142ea111',
  assistantId: '839291f5-0e84-400f-b809-e5607fb2f7d6',
  phoneNumber: '+1 (415) 231-1749',
  phoneNumberFormatted: '+14152311749',
};

export interface VapiAppointment {
  id: string;
  patientName: string;
  patientPhone: string;
  appointmentType: string;
  preferredDate: string;
  preferredTime: string;
  reason: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  bookedVia: 'phone' | 'web';
  createdAt: number;
  callId?: string;
}

// Store for phone-booked appointments (in production, use a database)
const PHONE_APPOINTMENTS_KEY = 'heal_buddy_phone_appointments';

export const savePhoneAppointment = (appointment: Omit<VapiAppointment, 'id' | 'createdAt'>): VapiAppointment => {
  const appointments = getPhoneAppointments();
  const newAppointment: VapiAppointment = {
    ...appointment,
    id: `phone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: Date.now(),
  };
  appointments.push(newAppointment);
  localStorage.setItem(PHONE_APPOINTMENTS_KEY, JSON.stringify(appointments));
  return newAppointment;
};

export const getPhoneAppointments = (): VapiAppointment[] => {
  const stored = localStorage.getItem(PHONE_APPOINTMENTS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const updatePhoneAppointment = (id: string, updates: Partial<VapiAppointment>): VapiAppointment | null => {
  const appointments = getPhoneAppointments();
  const index = appointments.findIndex(a => a.id === id);
  if (index !== -1) {
    appointments[index] = { ...appointments[index], ...updates };
    localStorage.setItem(PHONE_APPOINTMENTS_KEY, JSON.stringify(appointments));
    return appointments[index];
  }
  return null;
};

export const deletePhoneAppointment = (id: string): boolean => {
  const appointments = getPhoneAppointments();
  const filtered = appointments.filter(a => a.id !== id);
  if (filtered.length !== appointments.length) {
    localStorage.setItem(PHONE_APPOINTMENTS_KEY, JSON.stringify(filtered));
    return true;
  }
  return false;
};

// Vapi Web SDK integration for in-browser voice calls
export class VapiClient {
  private vapi: any = null;
  private isInitialized = false;

  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;
    
    try {
      // Dynamically load Vapi SDK
      if (!(window as any).Vapi) {
        await this.loadVapiScript();
      }
      
      this.vapi = new (window as any).Vapi(VAPI_CONFIG.publicKey);
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize Vapi:', error);
      return false;
    }
  }

  private loadVapiScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if ((window as any).Vapi) {
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@vapi-ai/web@latest/dist/vapi.umd.min.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Vapi SDK'));
      document.head.appendChild(script);
    });
  }

  async startCall(assistantId?: string): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    if (this.vapi) {
      // Start a call with the default assistant or specified one
      await this.vapi.start(assistantId);
    }
  }

  stopCall(): void {
    if (this.vapi) {
      this.vapi.stop();
    }
  }

  onCallStart(callback: () => void): void {
    if (this.vapi) {
      this.vapi.on('call-start', callback);
    }
  }

  onCallEnd(callback: (data: any) => void): void {
    if (this.vapi) {
      this.vapi.on('call-end', callback);
    }
  }

  onMessage(callback: (message: any) => void): void {
    if (this.vapi) {
      this.vapi.on('message', callback);
    }
  }

  onError(callback: (error: any) => void): void {
    if (this.vapi) {
      this.vapi.on('error', callback);
    }
  }

  onSpeechStart(callback: () => void): void {
    if (this.vapi) {
      this.vapi.on('speech-start', callback);
    }
  }

  onSpeechEnd(callback: () => void): void {
    if (this.vapi) {
      this.vapi.on('speech-end', callback);
    }
  }
}

// Singleton instance
export const vapiClient = new VapiClient();

// Helper to format phone number for display
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
};
