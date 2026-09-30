import React from 'react';
import { Type, Volume2, Globe, SunMedium, HelpCircle } from 'lucide-react';

interface AccessibilityBarProps {
  fontSize: 'normal' | 'large' | 'xlarge';
  onChangeFontSize: (size: 'normal' | 'large' | 'xlarge') => void;
  highContrast: boolean;
  onToggleHighContrast: () => void;
  slowSpeech: boolean;
  onToggleSlowSpeech: () => void;
  language: 'en' | 'hi' | 'kn' | 'ta';
  onChangeLanguage: (lang: 'en' | 'hi' | 'kn' | 'ta') => void;
  onReadPageAloud: () => void;
  isSpeaking: boolean;
  onStopSpeaking: () => void;
}

export const AccessibilityBar: React.FC<AccessibilityBarProps> = ({
  fontSize,
  onChangeFontSize,
  highContrast,
  onToggleHighContrast,
  slowSpeech,
  onToggleSlowSpeech,
  language,
  onChangeLanguage,
  onReadPageAloud,
  isSpeaking,
  onStopSpeaking,
}) => {
  return (
    <div className={`border-b transition-colors ${
      highContrast 
        ? 'bg-stone-900 border-amber-400 text-stone-100' 
        : 'bg-emerald-50/70 border-emerald-100 text-stone-800'
    }`}>
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-sm">
        {/* Left: Quick Elder Comfort Controls */}
        <div className="flex items-center flex-wrap gap-4">
          {/* Font Size Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-600 flex items-center gap-1">
              <Type className="w-3.5 h-3.5" /> Text Size:
            </span>
            <div className="flex items-center bg-white rounded-lg border border-stone-200 p-0.5 shadow-xs">
              <button
                onClick={() => onChangeFontSize('normal')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  fontSize === 'normal' 
                    ? 'bg-emerald-800 text-white font-bold' 
                    : 'text-stone-700 hover:text-stone-950'
                }`}
              >
                Normal
              </button>
              <button
                onClick={() => onChangeFontSize('large')}
                className={`px-2.5 py-1 text-sm font-medium rounded-md transition-colors ${
                  fontSize === 'large' 
                    ? 'bg-emerald-800 text-white font-bold' 
                    : 'text-stone-700 hover:text-stone-950'
                }`}
              >
                Large
              </button>
              <button
                onClick={() => onChangeFontSize('xlarge')}
                className={`px-2.5 py-1 text-base font-semibold rounded-md transition-colors ${
                  fontSize === 'xlarge' 
                    ? 'bg-emerald-800 text-white font-bold' 
                    : 'text-stone-700 hover:text-stone-950'
                }`}
              >
                X-Large
              </button>
            </div>
          </div>

          {/* Speech Pace Toggle */}
          <button
            onClick={onToggleSlowSpeech}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
              slowSpeech 
                ? 'bg-amber-100 border-amber-300 text-amber-900 font-semibold' 
                : 'bg-white border-stone-200 text-stone-700 hover:border-stone-300'
            }`}
          >
            <span>Voice Speed:</span>
            <span className="font-bold">{slowSpeech ? 'Slow & Gentle (0.8x)' : 'Normal (1.0x)'}</span>
          </button>

          {/* High Contrast Toggle */}
          <button
            onClick={onToggleHighContrast}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
              highContrast 
                ? 'bg-amber-400 border-amber-500 text-stone-950 font-bold' 
                : 'bg-white border-stone-200 text-stone-700 hover:border-stone-300'
            }`}
          >
            <SunMedium className="w-3.5 h-3.5" />
            <span>High Contrast: {highContrast ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        {/* Right: Language Selection & Read Aloud */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-stone-500" />
            <select
              value={language}
              onChange={(e) => onChangeLanguage(e.target.value as any)}
              className="bg-white border border-stone-200 text-stone-800 text-xs font-medium rounded-lg px-2.5 py-1 focus:ring-1 focus:ring-emerald-700 outline-none"
            >
              <option value="en">English (English)</option>
              <option value="hi">हिंदी (Hindi)</option>
              <option value="kn">ಕನ್ನಡ (Kannada)</option>
              <option value="ta">தமிழ் (Tamil)</option>
            </select>
          </div>

          {/* Read Aloud Button */}
          {isSpeaking ? (
            <button
              onClick={onStopSpeaking}
              className="flex items-center gap-1.5 px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold cursor-pointer animate-pulse"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Stop Speaking</span>
            </button>
          ) : (
            <button
              onClick={onReadPageAloud}
              className="flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-stone-50 border border-stone-200 text-stone-800 rounded-lg text-xs font-medium cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>Read Aloud</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
