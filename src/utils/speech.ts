// Web Speech API interface declarations for TypeScript
interface IWindow extends Window {
  webkitSpeechRecognition?: any;
  SpeechRecognition?: any;
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  const win = window as unknown as IWindow;
  return !!(win.SpeechRecognition || win.webkitSpeechRecognition);
}

export async function requestMicrophonePermission(): Promise<{ granted: boolean; error?: string }> {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    return { granted: false, error: 'Media devices API is not supported in this browser' };
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // Stop the stream immediately once permission is verified
    stream.getTracks().forEach(track => track.stop());
    return { granted: true };
  } catch (err: any) {
    console.warn('Microphone permission request failed:', err);
    return { 
      granted: false, 
      error: err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
        ? 'Permission denied by browser'
        : err.message || 'Microphone unavailable'
    };
  }
}

let activeRecognitionInstance: any = null;

export function stopCurrentRecognition() {
  if (activeRecognitionInstance) {
    try {
      activeRecognitionInstance.abort();
    } catch (e) {
      // ignore
    }
    activeRecognitionInstance = null;
  }
}

export function createSpeechRecognizer(
  lang: string = 'en-IN',
  onResult: (transcript: string) => void,
  onError: (errCode: string, friendlyMessage: string) => void,
  onEnd: () => void
) {
  const win = window as unknown as IWindow;
  const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;

  if (!SpeechRecognitionClass) {
    return null;
  }

  stopCurrentRecognition();

  const recognition = new SpeechRecognitionClass();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = lang;
  recognition.maxAlternatives = 1;

  let hasResult = false;

  recognition.onresult = (event: any) => {
    if (event.results && event.results.length > 0) {
      const transcript = event.results[0][0].transcript;
      hasResult = true;
      onResult(transcript);
    }
  };

  recognition.onerror = (event: any) => {
    const err = event.error || 'unknown';
    let friendly = 'Microphone could not capture your voice. Please try again or type below.';

    if (err === 'not-allowed') {
      friendly = 'Microphone access was blocked. Please tap "Allow" in your browser address bar.';
    } else if (err === 'no-speech') {
      friendly = 'We didn\'t hear any voice. Please tap the microphone again and speak clearly.';
    } else if (err === 'audio-capture') {
      friendly = 'No microphone device was detected on your computer or phone.';
    } else if (err === 'network') {
      friendly = 'Speech recognition network service is currently busy. Please type below or tap quick suggestions.';
    } else if (err === 'aborted') {
      friendly = '';
    }

    onError(err, friendly);
  };

  recognition.onend = () => {
    activeRecognitionInstance = null;
    onEnd();
  };

  activeRecognitionInstance = recognition;
  return recognition;
}

/**
 * Text-to-Speech synthesizer with senior-friendly pacing.
 */
let currentAudio: HTMLAudioElement | null = null;

export async function speakText(
  text: string,
  options: {
    slowSpeed?: boolean;
    language?: string;
    useGeminiTTS?: boolean;
    onStart?: () => void;
    onEnd?: () => void;
  } = {}
) {
  const { slowSpeed = true, language = 'en-IN', useGeminiTTS = false, onStart, onEnd } = options;

  // Stop any currently playing speech
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }

  onStart?.();

  // Try Server Gemini TTS first if requested
  if (useGeminiTTS) {
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, speechRate: slowSpeed ? 'slow' : 'normal' }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.audioBase64) {
          const audio = new Audio(`data:audio/wav;base64,${data.audioBase64}`);
          currentAudio = audio;
          audio.onended = () => {
            currentAudio = null;
            onEnd?.();
          };
          audio.onerror = () => {
            fallbackBrowserSpeech(text, slowSpeed, language, onEnd);
          };
          await audio.play();
          return;
        }
      }
    } catch (e) {
      console.warn('Gemini TTS unavailable, falling back to browser speech synthesis', e);
    }
  }

  // Fallback to browser Web Speech Synthesis
  fallbackBrowserSpeech(text, slowSpeed, language, onEnd);
}

function fallbackBrowserSpeech(
  text: string,
  slowSpeed: boolean,
  language: string,
  onEnd?: () => void
) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    onEnd?.();
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  // Slower rate for older adults (0.85x) to ensure clear comprehension
  utterance.rate = slowSpeed ? 0.85 : 1.0;
  utterance.pitch = 1.0;
  utterance.lang = language || 'en-IN';

  utterance.onend = () => {
    onEnd?.();
  };
  utterance.onerror = () => {
    onEnd?.();
  };

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
