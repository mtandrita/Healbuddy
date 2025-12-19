import React, { useState, useRef, useEffect } from 'react';
import Header from './components/Header';
import VoiceRecorder from './components/VoiceRecorder';
import AnalysisResult from './components/AnalysisResult';
import AppointmentBooking from './components/AppointmentBooking';
import PrescriptionViewer from './components/PrescriptionViewer';
import NotificationCenter from './components/NotificationCenter';
import DoctorChatTranslator from './components/DoctorChatTranslator';
import VoiceAIAgent from './components/VoiceAIAgent';
import { ChatMessage, AnalysisData, User, LanguageCode } from './types';
import { analyzeHealthQuery, generateSpeech } from './services/geminiService';
import { getTranslation } from './services/translations';

interface DashboardProps {
  currentUser: User;
  onProfileClick: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ currentUser, onProfileClick }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [latestAnalysis, setLatestAnalysis] = useState<AnalysisData | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>(currentUser.preferredLanguage || 'en');
  const [showAppointmentBooking, setShowAppointmentBooking] = useState(false);
  const [showPrescriptions, setShowPrescriptions] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDoctorChat, setShowDoctorChat] = useState(false);
  const [showVoiceAIAgent, setShowVoiceAIAgent] = useState(false);
  const [doctorLanguage, setDoctorLanguage] = useState<LanguageCode>('en');
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const t = getTranslation(currentLanguage);

  // Initial greeting
  useEffect(() => {
    setMessages([{
      id: 'init',
      role: 'assistant',
      text: t.greeting.replace('{name}', currentUser.fullName),
      timestamp: Date.now()
    }]);

    return () => {
      audioContextRef.current?.close();
    };
  }, [currentUser, currentLanguage]);

  const handleLanguageChange = (language: LanguageCode) => {
    setCurrentLanguage(language);
    // Update user preference
    const updatedUser = { ...currentUser, preferredLanguage: language };
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    // Update users array
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex((u: User) => u.email === currentUser.email);
    if (userIndex !== -1) {
      users[userIndex] = updatedUser;
      localStorage.setItem('users', JSON.stringify(users));
    }
  };

  const getAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  };

  const handleConnectToDoctor = () => {
    window.open("https://meet.google.com/zko-fvqi-hop", "_blank");
  };

  const handleClearChat = () => {
    setMessages([{
      id: Date.now().toString(),
      role: 'assistant',
      text: t.chatCleared,
      timestamp: Date.now()
    }]);
    setLatestAnalysis(null);
    setSelectedImage(null);
    setInputText('');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setSelectedImage(base64String);
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
  };

  const processInput = async (text: string | null, audioBase64: string | null, imageBase64Full: string | null) => {
    if ((!text && !audioBase64 && !imageBase64Full) || isProcessing) return;

    setIsProcessing(true);

    let rawImageBase64 = null;
    if (imageBase64Full) {
      rawImageBase64 = imageBase64Full.split(',')[1];
    }

    const newUserMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: text || (audioBase64 ? "🎤 Voice Input" : ""),
      imageData: imageBase64Full || undefined,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, newUserMsg]);
    setInputText('');
    setSelectedImage(null);

    try {
      const analysis = await analyzeHealthQuery(text, audioBase64, rawImageBase64, currentUser, currentLanguage);
      setLatestAnalysis(analysis);

      const assistantText = analysis.emergencyContact 
        ? t.severeWarning.replace('{name}', currentUser.fullName)
        : t.assessment.replace('{name}', currentUser.fullName);

      const newAssistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: assistantText,
        analysis: analysis,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, newAssistantMsg]);

      const textToSpeak = analysis.summary;
      const ctx = getAudioContext();
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      const audioBuffer = await generateSpeech(textToSpeak, currentLanguage, ctx);
      if (audioBuffer) {
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        source.start(0);
      }

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        text: "I'm sorry, I had trouble processing that. Please try again.",
        timestamp: Date.now()
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendMessage = () => {
    if (!inputText.trim() && !selectedImage) return;
    processInput(inputText, null, selectedImage);
  };

  const handleVoiceInput = (base64Audio: string) => {
    processInput(null, base64Audio, selectedImage);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 font-sans overflow-hidden">
      <Header 
        user={currentUser} 
        onProfileClick={onProfileClick} 
        selectedLanguage={currentLanguage}
        onLanguageChange={handleLanguageChange}
        onNotificationClick={() => setShowNotifications(true)}
        onAppointmentClick={() => setShowAppointmentBooking(true)}
        onPrescriptionClick={() => setShowPrescriptions(true)}
        onDoctorChatClick={() => {
          setDoctorLanguage('en'); // Default to English, can be customized
          setShowDoctorChat(true);
        }}
        onVoiceAIClick={() => setShowVoiceAIAgent(true)}
      />

      {/* Modals */}
      {showAppointmentBooking && (
        <AppointmentBooking
          currentUser={currentUser}
          onClose={() => setShowAppointmentBooking(false)}
          symptoms={inputText}
        />
      )}

      {showPrescriptions && (
        <PrescriptionViewer
          currentUser={currentUser}
          onClose={() => setShowPrescriptions(false)}
        />
      )}

      {showNotifications && (
        <NotificationCenter
          currentUser={currentUser}
          onClose={() => setShowNotifications(false)}
        />
      )}

      <main className="flex-1 w-full max-w-6xl mx-auto p-4 md:p-6 flex gap-6 min-h-0 overflow-hidden">
        
        <div className="flex-1 flex flex-col bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden relative">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
               style={{ backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col-reverse gap-6 z-10 scrollbar-hide">
            {isProcessing && (
              <div className="flex items-end gap-3">
                 <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                 </div>
                 <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-md flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}

            {[...messages].reverse().map((msg) => (
              <div key={msg.id} className={`flex items-end gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
                  msg.role === 'user' ? 'bg-blue-600' : 'bg-teal-500'
                }`}>
                  {msg.role === 'user' ? (
                    <span className="text-white text-xs font-bold">{currentUser.fullName.charAt(0)}</span>
                  ) : (
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  )}
                </div>

                <div className={`max-w-[95%] md:max-w-[80%] flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`px-5 py-3 shadow-md ${
                    msg.role === 'user' 
                      ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl rounded-tr-none' 
                      : 'bg-white text-slate-700 border border-slate-100 rounded-2xl rounded-tl-none w-full'
                  }`}>
                    {msg.imageData && (
                      <img src={msg.imageData} alt="User upload" className="max-w-full h-auto rounded-lg mb-2 border border-white/20" />
                    )}
                    {msg.text && <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">{msg.text}</p>}
                    {msg.analysis && (
                      <div className="mt-4 pt-4 border-t border-slate-100">
                         <AnalysisResult 
                            data={msg.analysis} 
                            onConnectDoctor={handleConnectToDoctor} 
                            className="border-0 shadow-none p-0" 
                         />
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium px-1">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 md:p-4 border-t border-slate-100 bg-white z-20">
            {selectedImage && (
              <div className="mb-3 flex items-start">
                <div className="relative group">
                  <img src={selectedImage} alt="Preview" className="h-20 w-auto rounded-lg border border-slate-200 shadow-sm" />
                  <button 
                    onClick={removeSelectedImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-end gap-2">
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileSelect} 
              />
              
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="p-3 mb-[2px] rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors"
                title="Upload Image"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>

              <div className="mb-[2px]">
                 <VoiceRecorder onRecordingComplete={handleVoiceInput} disabled={isProcessing} />
              </div>
              
              <div className="flex-1 relative">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder={t.describeSymptoms}
                  disabled={isProcessing}
                  rows={1}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-base rounded-2xl py-3.5 px-5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 resize-none"
                  style={{ minHeight: '50px', maxHeight: '120px' }}
                />
              </div>
              
              <button
                onClick={handleSendMessage}
                disabled={(!inputText.trim() && !selectedImage) || isProcessing}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 mb-[2px] rounded-full transition-colors flex-shrink-0 shadow-md"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            <div className="mt-2 flex justify-center">
               <button onClick={handleClearChat} className="text-xs text-slate-400 hover:text-red-500 transition-colors font-medium">{t.clearChat}</button>
            </div>
          </div>
        </div>

        <div className={`hidden md:flex flex-col h-full flex-1 md:max-w-md transition-all duration-500 ease-out ${latestAnalysis ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 md:opacity-100 md:translate-x-0'}`}>
          {latestAnalysis ? (
             <AnalysisResult data={latestAnalysis} onConnectDoctor={handleConnectToDoctor} className="h-full" />
          ) : (
            <div className="h-full flex items-center justify-center text-slate-300 border-2 border-dashed border-slate-200 rounded-3xl bg-white/50 p-8 text-center">
              <div className="max-w-xs">
                <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">{t.awaitingAnalysis}</h3>
                <p className="text-sm">{t.awaitingAnalysisDesc}</p>
              </div>
            </div>
          )}
        </div>

      </main>

      {/* Modals */}
      {showAppointmentBooking && (
        <AppointmentBooking
          currentUser={currentUser}
          onClose={() => setShowAppointmentBooking(false)}
          symptoms={inputText}
        />
      )}

      {showPrescriptions && (
        <PrescriptionViewer
          currentUser={currentUser}
          onClose={() => setShowPrescriptions(false)}
        />
      )}

      {showNotifications && (
        <NotificationCenter
          currentUser={currentUser}
          onClose={() => setShowNotifications(false)}
        />
      )}

      {showDoctorChat && (
        <DoctorChatTranslator
          currentUser={currentUser}
          doctorLanguage={doctorLanguage}
          onClose={() => setShowDoctorChat(false)}
        />
      )}

      {showVoiceAIAgent && (
        <VoiceAIAgent
          onClose={() => setShowVoiceAIAgent(false)}
          currentUser={currentUser}
        />
      )}
    </div>
  );
};


export default Dashboard;
