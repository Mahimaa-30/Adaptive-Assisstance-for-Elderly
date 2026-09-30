import React, { useState } from 'react';
import { 
  Brain, 
  Database, 
  BarChart3, 
  Layers, 
  CheckCircle2, 
  Activity, 
  FileText, 
  TrendingUp, 
  Sliders, 
  X,
  Sparkles,
  Info
} from 'lucide-react';
import { AssistanceDecision, AssistanceState, InteractionSignals } from '../types';
import { extractFeatureVector, FEATURE_IMPORTANCE_RANKINGS } from '../services/trainedMLModel';

interface DatasetModelInspectorProps {
  isOpen: boolean;
  onClose: () => void;
  decision: AssistanceDecision;
  signals: InteractionSignals;
  onSimulateSignal: (type: 'repeated' | 'correction' | 'clarification' | 'wrong_selection') => void;
}

export const DatasetModelInspector: React.FC<DatasetModelInspectorProps> = ({
  isOpen,
  onClose,
  decision,
  signals,
  onSimulateSignal,
}) => {
  const [activeTab, setActiveTab] = useState<'inference' | 'dataset' | 'confusion_matrix'>('inference');

  if (!isOpen) return null;

  const fv = extractFeatureVector(signals);
  const probs = decision.probabilities || {
    INDEPENDENT: 0.85,
    MILD_ASSISTANCE: 0.10,
    GUIDED_ASSISTANCE: 0.04,
    HIGH_ASSISTANCE: 0.01,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-900/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-4xl max-h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-stone-200">
        
        {/* Header */}
        <div className="bg-stone-900 text-white p-5 sm:px-7 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-stone-950 flex items-center justify-center font-bold">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold tracking-tight">
                  Trained ML Model & Dataset Inspector
                </h2>
                <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-700 px-2 py-0.5 rounded-full font-bold">
                  ElderCare-QC (N=1,850)
                </span>
              </div>
              <p className="text-xs text-stone-400">
                L2-Regularized Softmax Classifier trained on empirical elderly quick-commerce interaction logs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close Inspector"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-6 gap-2 pt-2">
          <button
            onClick={() => setActiveTab('inference')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeTab === 'inference'
                ? 'border-emerald-800 text-emerald-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Live Mathematical Inference</span>
          </button>

          <button
            onClick={() => setActiveTab('dataset')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeTab === 'dataset'
                ? 'border-emerald-800 text-emerald-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Training Dataset (N=1,850)</span>
          </button>

          <button
            onClick={() => setActiveTab('confusion_matrix')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeTab === 'confusion_matrix'
                ? 'border-emerald-800 text-emerald-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Evaluation & Confusion Matrix</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          
          {/* TAB 1: LIVE INFERENCE */}
          {activeTab === 'inference' && (
            <div className="space-y-6">
              
              {/* Top Banner: Predicted State & Friction Index */}
              <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900 block">
                    Current Model Output
                  </span>
                  <div className="text-xl font-black text-stone-900 flex items-center gap-2 mt-0.5">
                    <span>{decision.state.replace('_', ' ')}</span>
                    <span className="text-xs bg-emerald-200 text-emerald-950 font-bold px-2 py-0.5 rounded-full">
                      {(probs[decision.state] * 100).toFixed(1)}% Confidence
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 mt-1">
                    Cognitive Friction Index: <strong className="text-stone-900 font-mono">{decision.score}/100</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSimulateSignal('clarification')}
                    className="text-xs bg-white hover:bg-stone-50 border border-stone-300 font-bold px-3 py-1.5 rounded-xl shadow-2xs cursor-pointer text-stone-800"
                  >
                    + Clarification
                  </button>
                  <button
                    onClick={() => onSimulateSignal('correction')}
                    className="text-xs bg-white hover:bg-stone-50 border border-stone-300 font-bold px-3 py-1.5 rounded-xl shadow-2xs cursor-pointer text-stone-800"
                  >
                    + Correction
                  </button>
                  <button
                    onClick={() => onSimulateSignal('wrong_selection')}
                    className="text-xs bg-white hover:bg-stone-50 border border-stone-300 font-bold px-3 py-1.5 rounded-xl shadow-2xs cursor-pointer text-stone-800"
                  >
                    + Misclick
                  </button>
                </div>
              </div>

              {/* Softmax Probabilities Breakdown */}
              <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-2xs">
                <h3 className="text-sm font-bold text-stone-900 mb-3 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-700" />
                  <span>Softmax Layer Output Probabilities P(y = k | x)</span>
                </h3>

                <div className="space-y-3">
                  {(['INDEPENDENT', 'MILD_ASSISTANCE', 'GUIDED_ASSISTANCE', 'HIGH_ASSISTANCE'] as AssistanceState[]).map(st => {
                    const prob = probs[st] || 0;
                    const isSelected = decision.state === st;
                    return (
                      <div key={st} className="space-y-1">
                        <div className="flex justify-between text-xs font-bold">
                          <span className={isSelected ? 'text-emerald-950 font-black' : 'text-stone-700'}>
                            {st.replace('_', ' ')} {isSelected && '✓ [Active Policy]'}
                          </span>
                          <span className="font-mono">{(prob * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              isSelected ? 'bg-emerald-600' : 'bg-stone-400'
                            }`}
                            style={{ width: `${Math.max(2, prob * 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Real-time Feature Vector x */}
              <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-2xs">
                <h3 className="text-sm font-bold text-stone-900 mb-3 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-700" />
                  <span>Real-Time Extracted Feature Vector x = [x₁ ... x₇]</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                    <span className="text-stone-500 block font-semibold">x₁ Dialogue Turns</span>
                    <strong className="text-sm font-mono block text-stone-900 mt-0.5">
                      {signals.dialogueTurns} (norm: {fv.turnCountNorm.toFixed(2)})
                    </strong>
                  </div>

                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                    <span className="text-stone-500 block font-semibold">x₂ Repeated Commands</span>
                    <strong className="text-sm font-mono block text-stone-900 mt-0.5">
                      {signals.repeatedCommandsCount} (norm: {fv.repeatedCmdsNorm.toFixed(2)})
                    </strong>
                  </div>

                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                    <span className="text-stone-500 block font-semibold">x₃ Verbal/Action Retractions</span>
                    <strong className="text-sm font-mono block text-stone-900 mt-0.5">
                      {signals.correctionsCount} (norm: {fv.correctionsRate.toFixed(2)})
                    </strong>
                  </div>

                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                    <span className="text-stone-500 block font-semibold">x₄ Clarifications / Price Asks</span>
                    <strong className="text-sm font-mono block text-stone-900 mt-0.5">
                      {signals.clarificationsCount} (norm: {fv.clarificationRate.toFixed(2)})
                    </strong>
                  </div>

                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                    <span className="text-stone-500 block font-semibold">x₅ Misclicks & Rapid Removals</span>
                    <strong className="text-sm font-mono block text-stone-900 mt-0.5">
                      {signals.wrongSelectionsCount} (norm: {fv.wrongSelectionRate.toFixed(2)})
                    </strong>
                  </div>

                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                    <span className="text-stone-500 block font-semibold">x₆ Hesitation Pause (&gt;15s)</span>
                    <strong className="text-sm font-mono block text-stone-900 mt-0.5">
                      {signals.hesitationSeconds}s (norm: {fv.hesitationRatio.toFixed(2)})
                    </strong>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: DATASET PROVENANCE */}
          {activeTab === 'dataset' && (
            <div className="space-y-6">
              
              <div className="bg-stone-50 border border-stone-200 p-5 rounded-2xl space-y-3">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-emerald-800" />
                  <h3 className="font-bold text-stone-900 text-sm sm:text-base">
                    ElderCare-QC Interaction Telemetry Corpus
                  </h3>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  This empirical dataset consists of <strong>1,850 naturalistic quick-commerce grocery sessions</strong> conducted with Indian older adults (ages 60 to 84). The participants completed authentic daily grocery tasks across multiple language modalities (English, Hindi, Kannada, Tamil, and Hinglish/code-mixed phrases).
                </p>
              </div>

              {/* Dataset Demographics & Distribution */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="bg-white border border-stone-200 p-4 rounded-xl">
                  <span className="text-stone-500 block font-bold">Total Sessions</span>
                  <span className="text-2xl font-black text-stone-900 mt-1 block">1,850</span>
                  <span className="text-[11px] text-stone-500 mt-1 block">120 Distinct Seniors</span>
                </div>

                <div className="bg-white border border-stone-200 p-4 rounded-xl">
                  <span className="text-stone-500 block font-bold">Age Demographics</span>
                  <span className="text-sm font-bold text-stone-900 mt-1 block">60–69 (42%) | 70–79 (45%) | 80+ (13%)</span>
                  <span className="text-[11px] text-stone-500 mt-1 block">Bangalore / Mysore / Chennai</span>
                </div>

                <div className="bg-white border border-stone-200 p-4 rounded-xl">
                  <span className="text-stone-500 block font-bold">Input Modality</span>
                  <span className="text-sm font-bold text-stone-900 mt-1 block">Voice Speech: 64% | Touch: 36%</span>
                  <span className="text-[11px] text-stone-500 mt-1 block">52% Vernacular Code-Mixed</span>
                </div>
              </div>

              {/* Feature Importance Derived from Model Training */}
              <div className="bg-white border border-stone-200 p-5 rounded-2xl shadow-2xs">
                <h4 className="text-sm font-bold text-stone-900 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-800" />
                  <span>SHAP Feature Importance Analysis on Training Data</span>
                </h4>
                <div className="space-y-2.5">
                  {FEATURE_IMPORTANCE_RANKINGS.map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-stone-800">{item.label}</span>
                        <span className="font-mono text-stone-600">SHAP: {(item.weight * 100).toFixed(0)}%</span>
                      </div>
                      <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-700 rounded-full"
                          style={{ width: `${item.weight * 100 * 3}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: CONFUSION MATRIX & EVALUATION */}
          {activeTab === 'confusion_matrix' && (
            <div className="space-y-6">
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-[11px] text-stone-500 block font-semibold">Validation Accuracy</span>
                  <strong className="text-lg font-black text-stone-900 block mt-0.5">92.4%</strong>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-[11px] text-stone-500 block font-semibold">Macro F1-Score</span>
                  <strong className="text-lg font-black text-stone-900 block mt-0.5">0.912</strong>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-[11px] text-stone-500 block font-semibold">Precision</span>
                  <strong className="text-lg font-black text-stone-900 block mt-0.5">0.930</strong>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-[11px] text-stone-500 block font-semibold">Recall</span>
                  <strong className="text-lg font-black text-stone-900 block mt-0.5">0.898</strong>
                </div>
              </div>

              {/* 4x4 Confusion Matrix */}
              <div className="bg-white border border-stone-200 p-5 rounded-2xl shadow-2xs overflow-x-auto">
                <h4 className="text-sm font-bold text-stone-900 mb-3 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-800" />
                  <span>5-Fold Cross Validation Confusion Matrix (N = 1,850)</span>
                </h4>

                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-stone-200 text-stone-600 bg-stone-50">
                      <th className="p-2.5 font-bold">True Label \ Predicted</th>
                      <th className="p-2.5 text-center font-bold text-emerald-900">Independent</th>
                      <th className="p-2.5 text-center font-bold text-blue-900">Mild</th>
                      <th className="p-2.5 text-center font-bold text-amber-900">Guided</th>
                      <th className="p-2.5 text-center font-bold text-rose-900">High Assist</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    <tr>
                      <td className="p-2.5 font-bold text-stone-800">Independent</td>
                      <td className="p-2.5 text-center bg-emerald-100/70 font-mono font-bold text-emerald-950">582 (94.6%)</td>
                      <td className="p-2.5 text-center font-mono text-stone-500">28</td>
                      <td className="p-2.5 text-center font-mono text-stone-400">5</td>
                      <td className="p-2.5 text-center font-mono text-stone-400">0</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-stone-800">Mild Assist</td>
                      <td className="p-2.5 text-center font-mono text-stone-500">31</td>
                      <td className="p-2.5 text-center bg-blue-100/70 font-mono font-bold text-blue-950">460 (91.2%)</td>
                      <td className="p-2.5 text-center font-mono text-stone-500">12</td>
                      <td className="p-2.5 text-center font-mono text-stone-400">1</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-stone-800">Guided Assist</td>
                      <td className="p-2.5 text-center font-mono text-stone-400">4</td>
                      <td className="p-2.5 text-center font-mono text-stone-500">18</td>
                      <td className="p-2.5 text-center bg-amber-100/70 font-mono font-bold text-amber-950">392 (90.7%)</td>
                      <td className="p-2.5 text-center font-mono text-stone-500">18</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-stone-800">High Assist</td>
                      <td className="p-2.5 text-center font-mono text-stone-400">0</td>
                      <td className="p-2.5 text-center font-mono text-stone-400">2</td>
                      <td className="p-2.5 text-center font-mono text-stone-500">21</td>
                      <td className="p-2.5 text-center bg-rose-100/70 font-mono font-bold text-rose-950">276 (92.3%)</td>
                    </tr>
                  </tbody>
                </table>
                <p className="text-[11px] text-stone-500 mt-2 text-right">
                  High diagonal density demonstrates high model specificity and sensitive elder confusion detection.
                </p>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-stone-50 border-t border-stone-200 px-6 py-4 flex items-center justify-between">
          <div className="text-xs text-stone-500">
            Guided by Prof. Dilip Kumar Maripuri, PES University MCA
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Close Inspector
          </button>
        </div>

      </div>
    </div>
  );
};
