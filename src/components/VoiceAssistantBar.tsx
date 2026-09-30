import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Send, Volume2, Sparkles, AlertCircle, CheckCircle2, RotateCcw, HelpCircle } from 'lucide-react';
import { AssistanceState, DialogueMessage } from '../types';
import { createSpeechRecognizer, isSpeechRecognitionSupported, requestMicrophonePermission, stopCurrentRecognition } from '../utils/speech';

interface VoiceAssistantBarProps {
  onSendMessage: (text: string) => void;
  assistanceState: AssistanceState;
  lastMessage: DialogueMessage | null;
  isProcessing: boolean;
  isSpeaking: boolean;
  onStopSpeaking: () => void;
  onReplayAudio: (text: string) => void;
  language: 'en' | 'hi' | 'kn' | 'ta';
  fontSize: 'normal' | 'large' | 'xlarge';
}

export const VoiceAssistantBar: React.FC<VoiceAssistantBarProps> = ({
  onSendMessage,
  assistanceState,
  lastMessage,
  isProcessing,
  isSpeaking,
  onStopSpeaking,
  onReplayAudio,
  language,
  fontSize,
}) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [hasSpeechSupport, setHasSpeechSupport] = useState(true);

  useEffect(() => {
    setHasSpeechSupport(isSpeechRecognitionSupported());
  }, []);

  const languageSpeechCode = {
    en: 'en-IN',
    hi: 'hi-IN',
    kn: 'kn-IN',
    ta: 'ta-IN',
  }[language];

  const handleStartListening = async () => {
    if (isListening) {
      stopCurrentRecognition();
      setIsListening(false);
      return;
    }

    setSpeechError(null);

    // Request microphone permission gracefully first
    try {
      const perm = await requestMicrophonePermission();
      if (!perm.granted && perm.error && perm.error.toLowerCase().includes('denied')) {
        setSpeechError('Microphone permission was denied by browser. Please tap the camera/mic icon in your address bar to allow access, or tap any quick suggestion below.');
        return;
      }
    } catch (e) {
      // Proceed to recognizer fallback
    }

    const recognizer = createSpeechRecognizer(
      languageSpeechCode,
      (transcript) => {
        setIsListening(false);
        if (transcript && transcript.trim()) {
          onSendMessage(transcript.trim());
        }
      },
      (errCode, friendlyMessage) => {
        setIsListening(false);
        if (errCode !== 'aborted' && friendlyMessage) {
          setSpeechError(friendlyMessage);
        }
      },
      () => {
        setIsListening(false);
      }
    );

    if (recognizer) {
      try {
        recognizer.start();
        setIsListening(true);
      } catch (e: any) {
        setIsListening(false);
        console.warn('SpeechRecognition start error:', e);
        setSpeechError('Could not start microphone. You can tap the sample voice queries below to speak them instantly.');
      }
    } else {
      setSpeechError('Speech recognition is not supported in this browser. Please type below or tap any quick suggestion chip.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isProcessing) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  // Example prompts based on language
  const suggestedPrompts = {
    en: [
      'Buy 1 litre nandini milk',
      'Cheapest cooking oil',
      'Add my usual morning items',
      'Compare fortune and saffola oil',
    ],
    hi: [
      '1 लीटर नंदिनी दूध कार्ट में डालो',
      'सबसे सस्ता कुकिंग तेल कौन सा है?',
      'रोज़ का नाश्ता सामान जोड़ो',
      'फॉर्च्यून और सफोला तेल की तुलना करो',
    ],
    kn: [
      '೧ ಲೀಟರ್ ನಂದಿನಿ ಹಾಲು ಹಾಕಿ',
      'ಅತಿ ಕಡಿಮೆ ಬೆಲೆಯ ಅಡುಗೆ ಎಣ್ಣೆ ಯಾವುದು?',
      'ನನ್ನ ದಿನನಿತ್ಯದ ವಸ್ತುಗಳನ್ನು ಸೇರಿಸಿ',
      'ಫಾರ್ಚೂನ್ ಮತ್ತು ಸಫೋಲಾ ಎಣ್ಣೆಯನ್ನು ಹೋಲಿಸಿ',
    ],
    ta: [
      '1 லிட்டர் நந்தினி பால் வேண்டும்',
      'குறைந்த விலை சமையல் எண்ணெய்',
      'வழக்கமான காலை உணவு பொருட்கள்',
    ],
  }[language];

  const isHighAssistance = assistanceState === 'HIGH_ASSISTANCE';
  const isGuided = assistanceState === 'GUIDED_ASSISTANCE';

  return (
    <section className={`rounded-2xl border transition-all ${
      isHighAssistance 
        ? 'bg-amber-50/90 border-amber-300 shadow-md p-6' 
        : isGuided
        ? 'bg-emerald-50/80 border-emerald-300 shadow-sm p-5'
        : 'bg-white border-stone-200 shadow-xs p-4 sm:p-5'
    }`}>
      {/* Top Banner / Guidance Note */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-sm">
            S
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-stone-900 leading-tight">
              Sahay Voice & Text Shopping Companion
            </h2>
            <p className="text-xs sm:text-sm text-stone-600">
              {isHighAssistance 
                ? 'Speak gently or tap the large buttons. We are guiding you step-by-step.' 
                : isGuided
                ? 'Speak in English, Hindi, or Kannada. We will simplify and compare choices for you.'
                : 'Speak naturally or type what you need for 10-minute grocery delivery.'}
            </p>
          </div>
        </div>

        {/* Live Audio Playback status */}
        {isSpeaking && (
          <button
            onClick={onStopSpeaking}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-100 border border-rose-300 text-rose-800 rounded-lg text-xs font-semibold cursor-pointer animate-pulse"
          >
            <Volume2 className="w-4 h-4 text-rose-600" />
            <span>Speaking... Tap to Stop</span>
          </button>
        )}
      </div>

      {/* Main Interactive Controls: Mic Button & Input */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* Large Prominent Microphone Button */}
        <button
          onClick={handleStartListening}
          disabled={isProcessing}
          aria-label={isListening ? 'Listening to speech, tap to cancel' : 'Tap to speak your grocery order'}
          className={`relative group flex items-center justify-center rounded-2xl transition-all cursor-pointer ${
            isListening
              ? 'w-20 h-20 bg-rose-600 text-white ring-4 ring-rose-300 ring-offset-2 animate-bounce'
              : isHighAssistance
              ? 'w-20 h-20 bg-emerald-800 hover:bg-emerald-900 text-white shadow-lg ring-4 ring-amber-300'
              : 'w-16 h-16 sm:w-18 sm:h-18 bg-emerald-800 hover:bg-emerald-900 text-white shadow-md'
          }`}
        >
          {isListening ? (
            <MicOff className="w-8 h-8" />
          ) : (
            <Mic className="w-8 h-8 group-hover:scale-105 transition-transform" />
          )}
          <span className="sr-only">
            {isListening ? 'Listening' : 'Start Voice Input'}
          </span>
        </button>

        {/* Text Input Form with Large Controls */}
        <form onSubmit={handleSubmit} className="flex-1 w-full flex items-stretch gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                isListening 
                  ? 'Listening... please speak now' 
                  : isHighAssistance
                  ? 'Type grocery item here (e.g. 1 litre milk, bread)...'
                  : 'Search by voice or type (e.g. "Buy 1L milk", "Cheapest oil")...'
              }
              disabled={isListening || isProcessing}
              className={`w-full h-full min-h-[52px] px-4 rounded-xl border border-stone-300 bg-white text-stone-900 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-emerald-700 transition-all ${
                fontSize === 'xlarge' ? 'text-lg' : fontSize === 'large' ? 'text-base' : 'text-sm'
              }`}
            />
          </div>

          <button
            type="submit"
            disabled={!inputText.trim() || isProcessing}
            aria-label="Send message"
            className="px-6 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Send className="w-5 h-5" />
            <span className="hidden sm:inline">Ask</span>
          </button>
        </form>
      </div>

      {/* Mic Status & Error Alert */}
      {isListening && (
        <div className="mt-3 flex items-center gap-2 text-rose-700 text-sm font-medium animate-pulse">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block"></span>
          <span>Listening... Please speak your item clearly into your device microphone.</span>
        </div>
      )}

      {speechError && (
        <div className="mt-3 p-3 bg-amber-50 border border-amber-300 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-amber-950 shadow-2xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-medium">{speechError}</span>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => onSendMessage(suggestedPrompts[0])}
              className="px-2.5 py-1 bg-amber-200/80 hover:bg-amber-300 text-amber-950 rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              Try sample: &ldquo;{suggestedPrompts[0]}&rdquo;
            </button>
            <button
              type="button"
              onClick={() => setSpeechError(null)}
              className="text-stone-500 hover:text-stone-900 font-bold px-1.5 py-0.5 cursor-pointer"
              aria-label="Dismiss error"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* One-Tap Spoken Suggestion Chips */}
      <div className="mt-4 pt-3 border-t border-stone-200/80">
        <div className="flex items-center gap-2 text-xs text-stone-600 mb-2">
          <span className="font-semibold text-stone-700">Quick Voice Suggestions:</span>
          <span>Tap any chip to speak it automatically:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {suggestedPrompts.map((promptText, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSendMessage(promptText)}
              disabled={isProcessing}
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-white hover:bg-stone-100 border border-stone-200 text-stone-800 transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <Mic className="w-3 h-3 text-emerald-700" />
              <span>&ldquo;{promptText}&rdquo;</span>
            </button>
          ))}
        </div>
      </div>

      {/* Latest Assistant Spoken Dialogue Box */}
      {lastMessage && (
        <div className={`mt-4 p-4 rounded-xl border transition-all ${
          lastMessage.sender === 'assistant' 
            ? 'bg-white border-emerald-200 shadow-2xs' 
            : 'bg-stone-50 border-stone-200'
        }`}>
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                  {lastMessage.sender === 'assistant' ? 'Sahay Response' : 'You said'}
                </span>
                {lastMessage.intentDetected && (
                  <span className="text-xs text-stone-500 font-mono">
                    [{lastMessage.intentDetected}]
                  </span>
                )}
              </div>
              <p className={`font-medium text-stone-900 leading-relaxed ${
                fontSize === 'xlarge' ? 'text-xl' : fontSize === 'large' ? 'text-lg' : 'text-base'
              }`}>
                {lastMessage.text}
              </p>
            </div>

            {lastMessage.sender === 'assistant' && (
              <button
                onClick={() => onReplayAudio(lastMessage.text)}
                title="Listen to this response again"
                className="p-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors shrink-0 cursor-pointer"
                aria-label="Replay voice audio"
              >
                <Volume2 className="w-5 h-5 text-emerald-800" />
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
