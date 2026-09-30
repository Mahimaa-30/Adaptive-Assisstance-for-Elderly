import { AssistanceDecision, AssistanceState, InteractionSignals } from '../types';
import { predictInteractionState } from './trainedMLModel';

export const INITIAL_SIGNALS: InteractionSignals = {
  repeatedCommandsCount: 0,
  correctionsCount: 0,
  clarificationsCount: 0,
  wrongSelectionsCount: 0,
  failedActionsCount: 0,
  dialogueTurns: 0,
  uiSteps: 0,
  hesitationSeconds: 0,
  lastActionTimestamp: Date.now(),
  sessionStartTime: Date.now(),
};

/**
 * Feature weights modeled after Decision Tree / Random Forest feature importance
 * as outlined in the MCA Capstone research synopsis.
 */
export const FEATURE_WEIGHTS = {
  repeatedCommands: 7.5,
  corrections: 10.0,
  clarifications: 6.0,
  wrongSelections: 11.5,
  failedActions: 12.0,
  dialogueTurnsStalled: 3.5,
  hesitationPaces: 2.0,
};

export function estimateAssistanceState(
  signals: InteractionSignals,
  manualOverrideState?: AssistanceState | null
): AssistanceDecision {
  // Run mathematical inference using the trained ML model (ElderCare-QC dataset N=1,850)
  const prediction = predictInteractionState(signals);

  if (manualOverrideState) {
    return createDecisionFromState(manualOverrideState, 85, [
      'Manual researcher override engaged for capstone demonstration'
    ], prediction.stateProbabilities, prediction.modelMetadata);
  }

  const idleSeconds = signals.hesitationSeconds;
  const factors: string[] = [];

  if (signals.repeatedCommandsCount > 0) {
    factors.push(`${signals.repeatedCommandsCount} repeated commands detected`);
  }
  if (signals.correctionsCount > 0) {
    factors.push(`${signals.correctionsCount} verbal/cart corrections`);
  }
  if (signals.clarificationsCount > 0) {
    factors.push(`${signals.clarificationsCount} clarification requests`);
  }
  if (signals.wrongSelectionsCount > 0) {
    factors.push(`${signals.wrongSelectionsCount} accidental or rapid removals`);
  }
  if (signals.failedActionsCount > 0) {
    factors.push(`${signals.failedActionsCount} failed inputs or unparsed voice turns`);
  }
  if (idleSeconds > 15) {
    factors.push(`${idleSeconds}s of prolonged hesitation`);
  }

  return createDecisionFromState(
    prediction.predictedState, 
    prediction.cognitiveFrictionIndex, 
    factors,
    prediction.stateProbabilities,
    prediction.modelMetadata
  );
}

function createDecisionFromState(
  state: AssistanceState,
  score: number,
  dominantFactors: string[],
  probabilities?: Record<AssistanceState, number>,
  modelMetadata?: any
): AssistanceDecision {
  switch (state) {
    case 'HIGH_ASSISTANCE':
      return {
        state,
        score,
        dominantFactors: dominantFactors.length ? dominantFactors : ['High interaction friction detected'],
        suggestedAction: 'Reduce cognitive load to single focal card with read-aloud and explicit two-button confirmation.',
        policy: {
          dialogueComplexity: 'ultra_simple_prominent',
          maxVisibleChoices: 1,
          showComparisonCard: false,
          autoVoiceReadout: true,
          largeConfirmationModal: true,
          showCaregiverAssistButton: true,
          enableUndoTimeoutSeconds: 12,
          highlightFocusHalo: true,
        },
        probabilities,
        modelMetadata,
      };

    case 'GUIDED_ASSISTANCE':
      return {
        state,
        score,
        dominantFactors: dominantFactors.length ? dominantFactors : ['Moderate friction: questions or corrections noticed'],
        suggestedAction: 'Offer guided step-by-step assistance, pairwise comparisons, and auto-voice feedback.',
        policy: {
          dialogueComplexity: 'guided_step_by_step',
          maxVisibleChoices: 2,
          showComparisonCard: true,
          autoVoiceReadout: true,
          largeConfirmationModal: true,
          showCaregiverAssistButton: true,
          enableUndoTimeoutSeconds: 10,
          highlightFocusHalo: true,
        },
        probabilities,
        modelMetadata,
      };

    case 'MILD_ASSISTANCE':
      return {
        state,
        score,
        dominantFactors: dominantFactors.length ? dominantFactors : ['Slight hesitation or initial retry observed'],
        suggestedAction: 'Provide warm reassuring confirmations and prune catalogue choices to top 3 relevant items.',
        policy: {
          dialogueComplexity: 'reassuring',
          maxVisibleChoices: 3,
          showComparisonCard: false,
          autoVoiceReadout: false,
          largeConfirmationModal: false,
          showCaregiverAssistButton: false,
          enableUndoTimeoutSeconds: 8,
          highlightFocusHalo: false,
        },
        probabilities,
        modelMetadata,
      };

    case 'INDEPENDENT':
    default:
      return {
        state: 'INDEPENDENT',
        score,
        dominantFactors: dominantFactors.length ? dominantFactors : ['Smooth fluent navigation observed'],
        suggestedAction: 'Maintain concise responses and standard full multi-item catalog display.',
        policy: {
          dialogueComplexity: 'concise',
          maxVisibleChoices: 6,
          showComparisonCard: false,
          autoVoiceReadout: false,
          largeConfirmationModal: false,
          showCaregiverAssistButton: false,
          enableUndoTimeoutSeconds: 5,
          highlightFocusHalo: false,
        },
        probabilities,
        modelMetadata,
      };
  }
}
