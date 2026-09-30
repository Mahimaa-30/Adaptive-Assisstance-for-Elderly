import React from 'react';
import { 
  Sliders, 
  Brain, 
  Sparkles, 
  Eye, 
  Volume2, 
  ShieldCheck, 
  ChevronRight, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle 
} from 'lucide-react';
import { AssistanceDecision, AssistanceState, InteractionSignals } from '../types';

interface AdaptiveMonitorBannerProps {
  decision: AssistanceDecision;
  signals: InteractionSignals;
  onSetState: (state: AssistanceState | null) => void;
  manualOverrideState: AssistanceState | null;
  onSimulateFriction: (type: 'repeated' | 'correction' | 'clarification' | 'wrong_selection') => void;
  onReset: () => void;
  fontSize: 'normal' | 'large' | 'xlarge';
}

export const AdaptiveMonitorBanner: React.FC<AdaptiveMonitorBannerProps> = ({
  decision,
  signals,
  onSetState,
  manualOverrideState,
  onSimulateFriction,
  onReset,
  fontSize,
}) => {
  const { state, score, policy } = decision;

  const stateColors = {
    INDEPENDENT: {
      badge: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      bar: 'bg-emerald-600',
      title: 'Independent Shopping Environment',
      desc: 'User is navigating fluently. Standard 4-column layout, compact cards, concise dialogue.',
    },
    MILD_ASSISTANCE: {
      badge: 'bg-blue-100 text-blue-900 border-blue-300',
      bar: 'bg-blue-600',
      title: 'Mild Assistance Environment',
      desc: 'Slight pause detected. Choices pruned to top 3, reassuring confirmations, warmer dialogue.',
    },
    GUIDED_ASSISTANCE: {
      badge: 'bg-amber-100 text-amber-950 border-amber-400',
      bar: 'bg-amber-500',
      title: 'Guided Step-by-Step Environment',
      desc: 'Clarifications/corrections detected. Screen simplified to top 2 choices with side-by-side comparison, high-contrast halos, and auto-voice feedback.',
    },
    HIGH_ASSISTANCE: {
      badge: 'bg-rose-100 text-rose-950 border-rose-400 ring-2 ring-rose-200',
      bar: 'bg-rose-600',
      title: 'Ultra-Simplified Focal Environment',
      desc: 'High friction observed. Cognitive load reduced to a SINGLE prominent focal card, read-aloud prompts, and double order verification.',
    },
  }[state];

  return (
    <section className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden mb-6 transition-all">
      {/* Top Header */}
      <div className="bg-stone-900 text-white px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-500 text-stone-950 flex items-center justify-center font-extrabold text-sm">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-tight flex items-center gap-2">
              <span>Dynamic Interaction-Aware Adaptive Assistant</span>
              <span className="text-[10px] font-mono bg-stone-800 text-stone-300 px-2 py-0.5 rounded border border-stone-700">
                Core Research Feature
              </span>
            </h2>
            <p className="text-[11px] text-stone-400">
              Observes user behavior in real time → Estimates assistance needs → Dynamically reshapes interface & dialogue
            </p>
          </div>
        </div>

        {/* Live Detected State Badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-400">Assistance State:</span>
          <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 shadow-2xs ${stateColors.badge}`}>
            <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
            <span>{state.replace('_', ' ')}</span>
          </span>
        </div>
      </div>

      {/* Main Adaptive Inspector Content */}
      <div className="p-4 sm:p-5 space-y-4">
        
        {/* Row 1: Live Cognitive Friction Gauge + Active Policy Transformations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Cognitive Load Metric */}
          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-bold text-stone-700 mb-1.5">
              <span>Estimated Cognitive Load:</span>
              <span className="font-mono text-sm">{score}/100</span>
            </div>
            
            {/* Visual Gauge Bar */}
            <div className="w-full h-3 bg-stone-200 rounded-full overflow-hidden mb-2">
              <div 
                className={`h-full transition-all duration-500 ${stateColors.bar}`} 
                style={{ width: `${Math.max(5, score)}%` }}
              />
            </div>

            <div className="text-[11px] text-stone-500 flex justify-between">
              <span>0 (Independent)</span>
              <span>40 (Guided)</span>
              <span>70+ (High)</span>
            </div>
          </div>

          {/* Current Dynamic Environment Adaptations */}
          <div className="md:col-span-2 p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-200 flex flex-col justify-between">
            <div className="text-xs font-bold text-emerald-950 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              <span>How The Environment Is Dynamically Adapting Right Now:</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-white p-2 rounded-lg border border-emerald-100">
                <span className="text-[10px] text-stone-500 uppercase block font-semibold">Catalogue Density</span>
                <strong className="text-stone-900 font-bold block text-sm">
                  {policy.maxVisibleChoices} {policy.maxVisibleChoices === 1 ? 'Focal Card' : 'Choices Max'}
                </strong>
              </div>

              <div className="bg-white p-2 rounded-lg border border-emerald-100">
                <span className="text-[10px] text-stone-500 uppercase block font-semibold">Dialogue Tone</span>
                <strong className="text-stone-900 font-bold block text-sm capitalize">
                  {policy.dialogueComplexity.replace(/_/g, ' ')}
                </strong>
              </div>

              <div className="bg-white p-2 rounded-lg border border-emerald-100">
                <span className="text-[10px] text-stone-500 uppercase block font-semibold">Audio Guidance</span>
                <strong className="text-stone-900 font-bold block text-sm">
                  {policy.autoVoiceReadout ? 'Auto-Speaking' : 'On-Demand'}
                </strong>
              </div>

              <div className="bg-white p-2 rounded-lg border border-emerald-100">
                <span className="text-[10px] text-stone-500 uppercase block font-semibold">Checkout Safety</span>
                <strong className="text-stone-900 font-bold block text-sm">
                  {policy.largeConfirmationModal ? 'Double Verification' : '1-Step Fast'}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Observable Interaction Signals & Quick Test Simulation Buttons */}
        <div className="pt-2 border-t border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          {/* Signal Counters */}
          <div className="flex items-center flex-wrap gap-2 text-stone-600">
            <span className="font-semibold text-stone-800">Observed Signals:</span>
            <span className="bg-stone-100 px-2 py-0.5 rounded text-[11px] font-mono">
              {signals.dialogueTurns} Turns
            </span>
            <span className="bg-stone-100 px-2 py-0.5 rounded text-[11px] font-mono">
              {signals.correctionsCount} Corrections
            </span>
            <span className="bg-stone-100 px-2 py-0.5 rounded text-[11px] font-mono">
              {signals.clarificationsCount} Clarifications
            </span>
            <span className="bg-stone-100 px-2 py-0.5 rounded text-[11px] font-mono">
              {signals.wrongSelectionsCount} Misclicks
            </span>
            <span className="bg-stone-100 px-2 py-0.5 rounded text-[11px] font-mono">
              {signals.hesitationSeconds}s Pause
            </span>
          </div>

          {/* Quick Dynamic State Trigger Buttons for Live Demo */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-stone-800 text-[11px] mr-1">Demo State Switch:</span>
            
            <button
              onClick={() => onSetState('INDEPENDENT')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                state === 'INDEPENDENT' && manualOverrideState === 'INDEPENDENT'
                  ? 'bg-emerald-800 text-white'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-800'
              }`}
            >
              1. Independent
            </button>

            <button
              onClick={() => onSetState('MILD_ASSISTANCE')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                state === 'MILD_ASSISTANCE' && manualOverrideState === 'MILD_ASSISTANCE'
                  ? 'bg-blue-800 text-white'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-800'
              }`}
            >
              2. Mild
            </button>

            <button
              onClick={() => onSetState('GUIDED_ASSISTANCE')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                state === 'GUIDED_ASSISTANCE' && manualOverrideState === 'GUIDED_ASSISTANCE'
                  ? 'bg-amber-600 text-white'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-800'
              }`}
            >
              3. Guided
            </button>

            <button
              onClick={() => onSetState('HIGH_ASSISTANCE')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                state === 'HIGH_ASSISTANCE' && manualOverrideState === 'HIGH_ASSISTANCE'
                  ? 'bg-rose-700 text-white'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-800'
              }`}
            >
              4. High Friction
            </button>

            {manualOverrideState && (
              <button
                onClick={() => onSetState(null)}
                className="px-2 py-1 text-[11px] text-emerald-800 hover:underline font-bold cursor-pointer ml-1"
              >
                Auto-Detect
              </button>
            )}
          </div>
        </div>

      </div>
    </section>
  );
};
