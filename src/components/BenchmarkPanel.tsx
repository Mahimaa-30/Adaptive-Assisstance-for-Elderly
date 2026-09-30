import React, { useState } from 'react';
import { 
  X, 
  FlaskConical, 
  Activity, 
  Play, 
  CheckCircle2, 
  BarChart3, 
  Sliders, 
  Sparkles, 
  RotateCcw, 
  Check, 
  AlertTriangle,
  Info
} from 'lucide-react';
import { 
  AssistanceDecision, 
  AssistanceState, 
  BenchmarkTask, 
  EvaluationSystemMode, 
  InteractionSignals, 
  TaskEvaluationResult 
} from '../types';
import { BENCHMARK_TASKS } from '../data/benchmarkTasks';

interface BenchmarkPanelProps {
  isOpen: boolean;
  onClose: () => void;
  systemMode: EvaluationSystemMode;
  onChangeSystemMode: (mode: EvaluationSystemMode) => void;
  activeSignals: InteractionSignals;
  assistanceDecision: AssistanceDecision;
  manualOverrideState: AssistanceState | null;
  onSetManualOverride: (state: AssistanceState | null) => void;
  onSimulateSignal: (type: 'repeated' | 'correction' | 'clarification' | 'wrong_selection' | 'failed_action') => void;
  onResetSignals: () => void;
  activeTask: BenchmarkTask | null;
  onStartTask: (task: BenchmarkTask) => void;
  onCompleteTask: (effortScore: number, satisfactionScore: number) => void;
  evaluationHistory: TaskEvaluationResult[];
}

export const BenchmarkPanel: React.FC<BenchmarkPanelProps> = ({
  isOpen,
  onClose,
  systemMode,
  onChangeSystemMode,
  activeSignals,
  assistanceDecision,
  manualOverrideState,
  onSetManualOverride,
  onSimulateSignal,
  onResetSignals,
  activeTask,
  onStartTask,
  onCompleteTask,
  evaluationHistory,
}) => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'signals' | 'comparison'>('tasks');
  const [effortRating, setEffortRating] = useState<number>(2);
  const [satisfactionRating, setSatisfactionRating] = useState<number>(5);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative animate-in fade-in duration-200 max-h-[92vh] flex flex-col justify-between">
        
        {/* Modal Top Header */}
        <div>
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-stone-200">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 mb-1">
                <FlaskConical className="w-4 h-4 text-amber-600" />
                <span>MCA Capstone Research & Benchmarking Lab</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-stone-950 font-serif">
                Interaction-Aware Adaptive AI Evaluation
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
                Experimental setup comparing System A (Conventional), System B (Non-Adaptive), and System C (Proposed Adaptive).
              </p>
            </div>

            <button
              onClick={onClose}
              aria-label="Close research panel"
              className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* System Mode Switcher (System A vs B vs C) */}
          <div className="my-4 p-3 bg-stone-100/80 rounded-2xl border border-stone-200">
            <span className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-2">
              Select Experimental Configuration:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                onClick={() => onChangeSystemMode('SYSTEM_A_CONVENTIONAL')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  systemMode === 'SYSTEM_A_CONVENTIONAL'
                    ? 'bg-white border-stone-900 shadow-sm ring-2 ring-stone-900'
                    : 'bg-stone-50 border-stone-200 hover:bg-white text-stone-600'
                }`}
              >
                <div className="font-bold text-xs text-stone-900">System A: Conventional</div>
                <div className="text-[11px] text-stone-500 mt-0.5 leading-snug">
                  Dense quick-commerce, no adaptive dialogue, standard cards.
                </div>
              </button>

              <button
                onClick={() => onChangeSystemMode('SYSTEM_B_NON_ADAPTIVE')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  systemMode === 'SYSTEM_B_NON_ADAPTIVE'
                    ? 'bg-white border-emerald-700 shadow-sm ring-2 ring-emerald-700'
                    : 'bg-stone-50 border-stone-200 hover:bg-white text-stone-600'
                }`}
              >
                <div className="font-bold text-xs text-emerald-900">System B: Non-Adaptive</div>
                <div className="text-[11px] text-stone-500 mt-0.5 leading-snug">
                  Elderly-friendly UI + voice assistant, but fixed static guidance.
                </div>
              </button>

              <button
                onClick={() => onChangeSystemMode('SYSTEM_C_ADAPTIVE')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  systemMode === 'SYSTEM_C_ADAPTIVE'
                    ? 'bg-emerald-800 text-white shadow-md ring-2 ring-emerald-900'
                    : 'bg-stone-50 border-stone-200 hover:bg-white text-stone-600'
                }`}
              >
                <div className={`font-bold text-xs ${systemMode === 'SYSTEM_C_ADAPTIVE' ? 'text-white' : 'text-stone-900'}`}>
                  System C: Proposed Adaptive ★
                </div>
                <div className={`text-[11px] mt-0.5 leading-snug ${systemMode === 'SYSTEM_C_ADAPTIVE' ? 'text-emerald-100' : 'text-stone-500'}`}>
                  Real-time signal tracking + ML estimation + dynamic assistance policy.
                </div>
              </button>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-stone-200 pb-2 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'tasks' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Evaluation Tasks (5)
            </button>
            <button
              onClick={() => setActiveTab('signals')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'signals' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Interaction Signals & ML State
            </button>
            <button
              onClick={() => setActiveTab('comparison')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'comparison' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Benchmark Comparative Results ({evaluationHistory.length})
            </button>
          </div>
        </div>

        {/* Tab 1: Benchmark Tasks */}
        {activeTab === 'tasks' && (
          <div className="flex-1 overflow-y-auto py-3 space-y-3">
            {activeTask && (
              <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl mb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div>
                  <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
                    ACTIVE BENCHMARK TASK RUNNING:
                  </span>
                  <h4 className="font-bold text-stone-950 text-base">{activeTask.title}</h4>
                  <p className="text-xs text-stone-700 mt-0.5">{activeTask.instruction}</p>
                  <p className="text-[11px] text-amber-800 font-mono mt-1">
                    Try voice prompt: &ldquo;{activeTask.suggestedPrompt}&rdquo;
                  </p>
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-stone-600 font-medium">Perceived Effort:</span>
                    <select
                      value={effortRating}
                      onChange={(e) => setEffortRating(Number(e.target.value))}
                      className="text-xs bg-white border border-stone-300 rounded-md p-1"
                    >
                      <option value="1">1 - Very Low Effort</option>
                      <option value="2">2 - Low Effort</option>
                      <option value="3">3 - Moderate</option>
                      <option value="4">4 - High Effort</option>
                      <option value="5">5 - Very Hard</option>
                    </select>
                  </div>

                  <button
                    onClick={() => onCompleteTask(effortRating, satisfactionRating)}
                    className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Record & End Task</span>
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-2.5">
              {BENCHMARK_TASKS.map((task) => {
                const isCurrent = activeTask?.id === task.id;
                return (
                  <div
                    key={task.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isCurrent 
                        ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-200' 
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-bold text-stone-900 text-sm">{task.title}</h4>
                        <p className="text-xs text-stone-600 mt-0.5">{task.instruction}</p>
                        <div className="text-[11px] text-emerald-800 font-medium mt-1">
                          Goal: {task.targetGoalDescription}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          onStartTask(task);
                          onClose();
                        }}
                        disabled={isCurrent}
                        className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>{isCurrent ? 'Running...' : 'Run Task'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Live Interaction Signals & Decision Logic */}
        {activeTab === 'signals' && (
          <div className="flex-1 overflow-y-auto py-3 space-y-4">
            {/* Live Cognitive Assistance Index */}
            <div className="p-4 bg-stone-900 text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                  ML Estimated Cognitive Assistance State:
                </span>
                <div className="text-2xl font-bold font-serif mt-1 flex items-center gap-2">
                  <span>{assistanceDecision.state.replace('_', ' ')}</span>
                  <span className="text-sm font-mono font-normal text-stone-300">
                    (Score: {assistanceDecision.score}/100)
                  </span>
                </div>
                <p className="text-xs text-stone-300 mt-1">
                  {assistanceDecision.suggestedAction}
                </p>
              </div>

              {/* Manual Override for Viva Demonstration */}
              <div className="flex flex-col gap-1.5 bg-stone-800 p-2.5 rounded-xl border border-stone-700">
                <span className="text-[11px] text-stone-300 font-semibold">
                  Manual Viva State Override:
                </span>
                <select
                  value={manualOverrideState || 'AUTO'}
                  onChange={(e) => onSetManualOverride(e.target.value === 'AUTO' ? null : (e.target.value as any))}
                  className="bg-stone-900 border border-stone-600 text-white text-xs rounded-lg px-2.5 py-1.5 outline-none font-medium"
                >
                  <option value="AUTO">Auto (Follow Signals ML)</option>
                  <option value="INDEPENDENT">Force Independent</option>
                  <option value="MILD_ASSISTANCE">Force Mild Assistance</option>
                  <option value="GUIDED_ASSISTANCE">Force Guided Assistance</option>
                  <option value="HIGH_ASSISTANCE">Force High Assistance</option>
                </select>
              </div>
            </div>

            {/* Observable Interaction Signal Counters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
                  Repeated Commands
                </span>
                <div className="text-xl font-bold font-mono text-stone-900 mt-1">
                  {activeSignals.repeatedCommandsCount}
                </div>
                <button
                  onClick={() => onSimulateSignal('repeated')}
                  className="mt-2 text-[11px] text-emerald-800 hover:text-emerald-950 font-semibold underline cursor-pointer"
                >
                  + Simulate Signal
                </button>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
                  Corrections Count
                </span>
                <div className="text-xl font-bold font-mono text-stone-900 mt-1">
                  {activeSignals.correctionsCount}
                </div>
                <button
                  onClick={() => onSimulateSignal('correction')}
                  className="mt-2 text-[11px] text-emerald-800 hover:text-emerald-950 font-semibold underline cursor-pointer"
                >
                  + Simulate Signal
                </button>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
                  Clarification Requests
                </span>
                <div className="text-xl font-bold font-mono text-stone-900 mt-1">
                  {activeSignals.clarificationsCount}
                </div>
                <button
                  onClick={() => onSimulateSignal('clarification')}
                  className="mt-2 text-[11px] text-emerald-800 hover:text-emerald-950 font-semibold underline cursor-pointer"
                >
                  + Simulate Signal
                </button>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
                  Accidental / Misclicks
                </span>
                <div className="text-xl font-bold font-mono text-stone-900 mt-1">
                  {activeSignals.wrongSelectionsCount}
                </div>
                <button
                  onClick={() => onSimulateSignal('wrong_selection')}
                  className="mt-2 text-[11px] text-emerald-800 hover:text-emerald-950 font-semibold underline cursor-pointer"
                >
                  + Simulate Signal
                </button>
              </div>
            </div>

            {/* Decision Factors Breakdown */}
            <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-xs">
              <span className="font-bold text-stone-800 uppercase tracking-wider block mb-1.5">
                Active Decision Tree Trigger Factors:
              </span>
              {assistanceDecision.dominantFactors.length === 0 ? (
                <span className="text-stone-500">No friction detected yet. User navigating smoothly.</span>
              ) : (
                <ul className="space-y-1 list-disc list-inside text-stone-700">
                  {assistanceDecision.dominantFactors.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={onResetSignals}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-700 hover:bg-rose-50 rounded-lg font-medium cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Telemetry Counters</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Comparative Results Report */}
        {activeTab === 'comparison' && (
          <div className="flex-1 overflow-y-auto py-3 space-y-4">
            <div className="text-xs text-stone-600">
              This table summarizes quantitative benchmark results across completed tasks, validating the research hypothesis that System C improves task completion and reduces perceived effort.
            </div>

            {evaluationHistory.length === 0 ? (
              <div className="p-8 text-center bg-stone-50 rounded-2xl border border-stone-200">
                <BarChart3 className="w-10 h-10 text-stone-400 mx-auto mb-2" />
                <h4 className="font-bold text-stone-800 text-sm">No benchmark evaluations recorded yet</h4>
                <p className="text-xs text-stone-500 mt-1">
                  Select a task from the &ldquo;Evaluation Tasks&rdquo; tab and click &ldquo;Run Task&rdquo; to collect empirical comparative data.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-stone-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-100 text-stone-700 font-bold border-b border-stone-200">
                    <tr>
                      <th className="p-2.5">Task</th>
                      <th className="p-2.5">Configuration</th>
                      <th className="p-2.5">Status</th>
                      <th className="p-2.5 font-mono">Time (s)</th>
                      <th className="p-2.5 font-mono">Errors</th>
                      <th className="p-2.5 font-mono">Turns</th>
                      <th className="p-2.5">Final State</th>
                      <th className="p-2.5">Effort</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 font-medium">
                    {evaluationHistory.map((res, i) => (
                      <tr key={i} className="hover:bg-stone-50/80">
                        <td className="p-2.5 font-semibold text-stone-900 max-w-[140px] truncate">
                          {res.taskTitle}
                        </td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            res.systemMode === 'SYSTEM_C_ADAPTIVE' 
                              ? 'bg-emerald-100 text-emerald-900' 
                              : res.systemMode === 'SYSTEM_B_NON_ADAPTIVE'
                              ? 'bg-blue-100 text-blue-900'
                              : 'bg-stone-200 text-stone-800'
                          }`}>
                            {res.systemMode === 'SYSTEM_C_ADAPTIVE' ? 'System C' : res.systemMode === 'SYSTEM_B_NON_ADAPTIVE' ? 'System B' : 'System A'}
                          </span>
                        </td>
                        <td className="p-2.5">
                          {res.completed ? (
                            <span className="text-emerald-700 font-bold flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" /> Success
                            </span>
                          ) : (
                            <span className="text-rose-700 font-bold">Failed</span>
                          )}
                        </td>
                        <td className="p-2.5 font-mono tabular-nums">{res.elapsedSeconds}s</td>
                        <td className="p-2.5 font-mono tabular-nums">{res.errorCount}</td>
                        <td className="p-2.5 font-mono tabular-nums">{res.turnsCount}</td>
                        <td className="p-2.5 text-[11px] text-stone-600">{res.assistanceStateReached}</td>
                        <td className="p-2.5 font-mono tabular-nums">{res.perceivedEffortScore}/5</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Modal Footer */}
        <div className="pt-4 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Close Lab Panel
          </button>
        </div>
      </div>
    </div>
  );
};
