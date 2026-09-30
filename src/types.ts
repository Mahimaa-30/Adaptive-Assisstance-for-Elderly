export type Category = 
  | 'all'
  | 'dairy'
  | 'cooking-oil'
  | 'bakery'
  | 'fruits-vegetables'
  | 'staples'
  | 'tea-coffee'
  | 'wellness';

export interface Product {
  id: string;
  name: string;
  localName: {
    hi: string;
    kn: string;
    ta: string;
  };
  brand: string;
  category: Category;
  packSize: string;
  volumeOrWeight: string;
  price: number;
  originalPrice: number;
  discountPercent?: number;
  image: string;
  inStock: boolean;
  rating: number;
  tags: string[];
  nutritionalHighlight?: string;
  dietary: 'veg' | 'non-veg';
  suitableForSenior?: string[]; // e.g. "Low Sodium", "Diabetic Friendly", "Bone Health"
  description: string;
  isDailyEssential?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type AssistanceState = 
  | 'INDEPENDENT'
  | 'MILD_ASSISTANCE'
  | 'GUIDED_ASSISTANCE'
  | 'HIGH_ASSISTANCE';

export interface InteractionSignals {
  repeatedCommandsCount: number;
  correctionsCount: number;
  clarificationsCount: number;
  wrongSelectionsCount: number;
  failedActionsCount: number;
  dialogueTurns: number;
  uiSteps: number;
  hesitationSeconds: number;
  lastActionTimestamp: number;
  sessionStartTime: number;
}

export interface AssistanceDecision {
  state: AssistanceState;
  score: number; // 0 - 100
  dominantFactors: string[];
  suggestedAction: string;
  policy: {
    dialogueComplexity: 'concise' | 'reassuring' | 'guided_step_by_step' | 'ultra_simple_prominent';
    maxVisibleChoices: number; // e.g. 4 vs 3 vs 2 vs 1
    showComparisonCard: boolean;
    autoVoiceReadout: boolean;
    largeConfirmationModal: boolean;
    showCaregiverAssistButton: boolean;
    enableUndoTimeoutSeconds: number;
    highlightFocusHalo: boolean;
  };
  probabilities?: Record<AssistanceState, number>;
  modelMetadata?: {
    datasetSize: number;
    trainingAlgorithm: string;
    validationAccuracy: string;
    macroF1: string;
  };
}

export type EvaluationSystemMode = 
  | 'SYSTEM_A_CONVENTIONAL'
  | 'SYSTEM_B_NON_ADAPTIVE'
  | 'SYSTEM_C_ADAPTIVE';

export interface BenchmarkTask {
  id: string;
  title: string;
  instruction: string;
  localInstruction?: {
    hi: string;
    kn: string;
  };
  targetGoalDescription: string;
  successCondition: (cart: CartItem[], orderCompleted: boolean) => boolean;
  suggestedPrompt: string;
}

export interface TaskEvaluationResult {
  taskId: string;
  taskTitle: string;
  systemMode: EvaluationSystemMode;
  completed: boolean;
  elapsedSeconds: number;
  errorCount: number;
  clarificationCount: number;
  turnsCount: number;
  assistanceStateReached: AssistanceState;
  perceivedEffortScore: number; // 1 to 5 (NASA-TLX simplified)
  satisfactionScore: number; // 1 to 5
  timestamp: string;
}

export interface DialogueMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  audioBase64?: string;
  language?: string;
  timestamp: Date;
  intentDetected?: string;
  entitiesExtracted?: Record<string, any>;
  highlightedProducts?: Product[];
  actionPrompt?: {
    label: string;
    actionType: 'CONFIRM_CART' | 'ADD_ITEM' | 'COMPARE' | 'CHECKOUT' | 'CALL_CAREGIVER';
    payload?: any;
  };
}

export interface UserProfile {
  id: string;
  name: string;
  salutation: string;
  age: number;
  phone: string;
  address: string;
  landmark: string;
  preferredLanguage: 'en' | 'hi' | 'kn' | 'ta' | 'te';
  dietaryTags: string[];
  caregiverName: string;
  caregiverPhone: string;
  frequentlyBoughtProductIds: string[];
}

export interface Order {
  id: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: 'COD' | 'CAREGIVER_BILL' | 'UPI';
  deliveryAddress: string;
  deliverySlot: string;
  createdAt: string;
  status: 'PLACED' | 'PACKING' | 'OUT_FOR_DELIVERY' | 'DELIVERED';
  assistanceStateAtOrder: AssistanceState;
}
