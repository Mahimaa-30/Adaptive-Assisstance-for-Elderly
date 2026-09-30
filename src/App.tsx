import React, { useState, useEffect, useRef } from 'react';
import { 
  ShoppingBag, 
  Sparkles, 
  Search, 
  RotateCcw, 
  Filter, 
  ShieldCheck, 
  HeartHandshake, 
  CheckCircle2, 
  Volume2, 
  ArrowRight,
  Flame,
  Clock,
  Heart
} from 'lucide-react';
import { 
  AssistanceDecision, 
  AssistanceState, 
  BenchmarkTask, 
  CartItem, 
  Category, 
  DialogueMessage, 
  EvaluationSystemMode, 
  InteractionSignals, 
  Order, 
  Product, 
  TaskEvaluationResult, 
  UserProfile 
} from './types';
import { INITIAL_PRODUCTS } from './data/products';
import { DEFAULT_USER_PROFILE } from './data/userProfile';
import { BENCHMARK_TASKS } from './data/benchmarkTasks';
import { estimateAssistanceState, INITIAL_SIGNALS } from './services/interactionState';
import { Header } from './components/Header';
import { AccessibilityBar } from './components/AccessibilityBar';
import { VoiceAssistantBar } from './components/VoiceAssistantBar';
import { ProductCard } from './components/ProductCard';
import { CartDrawer } from './components/CartDrawer';
import { ComparisonCard } from './components/ComparisonCard';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { BenchmarkPanel } from './components/BenchmarkPanel';
import { CaregiverModal } from './components/CaregiverModal';
import { ConventionalStorefront } from './components/ConventionalStorefront';
import { AdaptiveMonitorBanner } from './components/AdaptiveMonitorBanner';
import { DatasetModelInspector } from './components/DatasetModelInspector';
import { speakText, stopSpeaking } from './utils/speech';

export default function App() {
  // Store products & user
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isDatasetInspectorOpen, setIsDatasetInspectorOpen] = useState(false);
  const [isRefreshingMarket, setIsRefreshingMarket] = useState(false);
  const [isGeneratingItem, setIsGeneratingItem] = useState(false);
  
  // Research & Assistance State
  const [systemMode, setSystemMode] = useState<EvaluationSystemMode>('SYSTEM_C_ADAPTIVE');
  const [manualOverrideState, setManualOverrideState] = useState<AssistanceState | null>(null);
  const [signals, setSignals] = useState<InteractionSignals>(INITIAL_SIGNALS);
  const [assistanceDecision, setAssistanceDecision] = useState<AssistanceDecision>(() => 
    estimateAssistanceState(INITIAL_SIGNALS)
  );

  // Fetch live products from backend on mount
  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (data.products && data.products.length > 0) {
          setProducts(data.products);
        }
      })
      .catch(err => console.warn('Live products initial fetch fallback to seed:', err));
  }, []);

  const handleRefreshLiveMarket = async () => {
    setIsRefreshingMarket(true);
    try {
      const res = await fetch('/api/products/refresh-market', { method: 'POST' });
      const data = await res.json();
      if (data.products && data.products.length > 0) {
        setProducts(data.products);
      }
    } catch (e) {
      console.warn('Error refreshing live market:', e);
    } finally {
      setIsRefreshingMarket(false);
    }
  };

  const handleDynamicProductSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    setIsGeneratingItem(true);
    try {
      const res = await fetch('/api/products/search-dynamic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchTerm, preferredLanguage: language }),
      });
      const data = await res.json();
      if (data.products && data.products.length > 0) {
        // Prepend new products to store
        setProducts(prev => {
          const ids = new Set(prev.map(p => p.id));
          const toAdd = data.products.filter((p: any) => !ids.has(p.id));
          return [...toAdd, ...prev];
        });
      }
    } catch (e) {
      console.warn('Dynamic product generation error:', e);
    } finally {
      setIsGeneratingItem(false);
    }
  };

  // Benchmarking & Evaluation Lab
  const [activeTask, setActiveTask] = useState<BenchmarkTask | null>(null);
  const [taskStartTime, setTaskStartTime] = useState<number | null>(null);
  const [evaluationHistory, setEvaluationHistory] = useState<TaskEvaluationResult[]>([]);

  // Navigation & UI View
  const [activeViewSection, setActiveViewSection] = useState<'shop' | 'usuals' | 'caregiver' | 'benchmark'>('shop');
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isBenchmarkOpen, setIsBenchmarkOpen] = useState(false);
  const [isCaregiverOpen, setIsCaregiverOpen] = useState(false);
  const [comparisonProducts, setComparisonProducts] = useState<Product[] | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Elderly Accessibility & Preferences
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('large');
  const [highContrast, setHighContrast] = useState(false);
  const [slowSpeech, setSlowSpeech] = useState(true);
  const [language, setLanguage] = useState<'en' | 'hi' | 'kn' | 'ta'>('en');
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Conversational Assistant State
  const [dialogueMessages, setDialogueMessages] = useState<DialogueMessage[]>([
    {
      id: 'msg_welcome',
      sender: 'assistant',
      text: 'Namaskara Smt. Shanthamma! I am your Sahay shopping assistant. How can I help you today? You can tap the microphone to ask for milk, cooking oil, or bread.',
      timestamp: new Date(),
    }
  ]);
  const [isProcessingChat, setIsProcessingChat] = useState(false);

  // Undo safety net
  const [undoAction, setUndoAction] = useState<{ message: string; onUndo: () => void } | null>(null);
  const undoTimeoutRef = useRef<any>(null);

  // Re-estimate assistance state whenever signals or manual override changes
  useEffect(() => {
    const decision = estimateAssistanceState(signals, manualOverrideState);
    setAssistanceDecision(decision);
  }, [signals, manualOverrideState]);

  // Track hesitation idle time
  useEffect(() => {
    const interval = setInterval(() => {
      setSignals(prev => {
        const timeSinceAction = (Date.now() - prev.lastActionTimestamp) / 1000;
        if (timeSinceAction > 15) {
          return {
            ...prev,
            hesitationSeconds: Math.round(timeSinceAction),
          };
        }
        return prev;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const cartTotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Helper to trigger Undo toast
  const triggerUndo = (message: string, undoCallback: () => void) => {
    if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
    setUndoAction({ message, onUndo: () => {
      undoCallback();
      setUndoAction(null);
    }});
    undoTimeoutRef.current = setTimeout(() => {
      setUndoAction(null);
    }, assistanceDecision.policy.enableUndoTimeoutSeconds * 1000);
  };

  // Add to Cart
  const handleAddToCart = (product: Product, quantity = 1) => {
    const prevCart = [...cart];
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id 
          ? { ...item, quantity: item.quantity + quantity }
          : item
        );
      }
      return [...prev, { product, quantity }];
    });

    // Update signal: successful UI step
    setSignals(prev => ({
      ...prev,
      uiSteps: prev.uiSteps + 1,
      lastActionTimestamp: Date.now(),
      hesitationSeconds: 0,
    }));

    // Trigger Accidental Undo Toast
    triggerUndo(`Added ${quantity}x ${product.name} to basket.`, () => {
      setCart(prevCart);
      setSignals(s => ({ ...s, correctionsCount: s.correctionsCount + 1 }));
    });

    // Audio feedback in high assistance
    if (assistanceDecision.policy.autoVoiceReadout) {
      speakText(`Added ${product.name} to your basket.`, {
        slowSpeed: slowSpeech,
        language: language === 'en' ? 'en-IN' : language === 'hi' ? 'hi-IN' : 'kn-IN',
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
      });
    }
  };

  // Update Quantity
  const handleUpdateQuantity = (product: Product, newQty: number) => {
    const prevCart = [...cart];
    if (newQty <= 0) {
      setCart(prev => prev.filter(item => item.product.id !== product.id));
      // Removing item from cart is an observable correction / retraction signal
      setSignals(prev => ({
        ...prev,
        correctionsCount: prev.correctionsCount + 1,
        lastActionTimestamp: Date.now(),
      }));
      triggerUndo(`Removed ${product.name} from basket.`, () => {
        setCart(prevCart);
      });
    } else {
      setCart(prev => prev.map(item => item.product.id === product.id ? { ...item, quantity: newQty } : item));
      setSignals(prev => ({
        ...prev,
        uiSteps: prev.uiSteps + 1,
        lastActionTimestamp: Date.now(),
      }));
    }
  };

  // Send Conversational Message to Assistant
  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Detect behavioral breakdown signals in user's prompt
    const lower = text.toLowerCase();
    const isCorrection = lower.includes('no') || lower.includes('nahi') || lower.includes('not that') || lower.includes('wrong') || lower.includes('cancel') || lower.includes('beda');
    const isClarification = lower.includes('what') || lower.includes('how much') || lower.includes('which') || lower.includes('difference') || lower.includes('help') || lower.includes('price');
    
    // Check if repeated command
    const lastUserMsg = [...dialogueMessages].reverse().find(m => m.sender === 'user');
    const isRepeated = lastUserMsg && (lastUserMsg.text.toLowerCase().includes(lower) || lower.includes(lastUserMsg.text.toLowerCase()));

    // Update real-time interaction signals
    setSignals(prev => ({
      ...prev,
      dialogueTurns: prev.dialogueTurns + 1,
      repeatedCommandsCount: isRepeated ? prev.repeatedCommandsCount + 1 : prev.repeatedCommandsCount,
      correctionsCount: isCorrection ? prev.correctionsCount + 1 : prev.correctionsCount,
      clarificationsCount: isClarification ? prev.clarificationsCount + 1 : prev.clarificationsCount,
      lastActionTimestamp: Date.now(),
      hesitationSeconds: 0,
    }));

    const userMessage: DialogueMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date(),
    };
    setDialogueMessages(prev => [...prev, userMessage]);
    setIsProcessingChat(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          assistanceState: assistanceDecision.state,
          preferredLanguage: language,
          cart: cart.map(i => ({ id: i.product.id, quantity: i.quantity })),
          userProfile,
        }),
      });

      if (!response.ok) {
        throw new Error('Chat API failed');
      }

      const data = await response.json();
      const assistantMsg: DialogueMessage = {
        id: `asst_${Date.now()}`,
        sender: 'assistant',
        text: data.spokenResponse || 'I have updated your items.',
        timestamp: new Date(),
        intentDetected: data.intent,
      };

      setDialogueMessages(prev => [...prev, assistantMsg]);

      // Execute intent action
      if (data.intent === 'ADD_TO_CART' && data.matchedProductIds?.length > 0) {
        const prod = products.find(p => p.id === data.matchedProductIds[0]);
        if (prod) {
          handleAddToCart(prod, data.identifiedQuantity || 1);
        }
      } else if (data.intent === 'COMPARE_PRODUCTS' && data.matchedProductIds?.length >= 2) {
        const matched = products.filter(p => data.matchedProductIds.includes(p.id));
        setComparisonProducts(matched);
      } else if (data.intent === 'CHECKOUT') {
        setIsCartOpen(true);
      } else if (data.intent === 'SEARCH_PRODUCT' && data.matchedProductIds?.length > 0) {
        // filter or highlight
        setSearchQuery('');
      }

      // Speak assistant's response out loud
      speakText(assistantMsg.text, {
        slowSpeed: slowSpeech,
        language: language === 'en' ? 'en-IN' : language === 'hi' ? 'hi-IN' : 'kn-IN',
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
      });

    } catch (err) {
      console.error('Error contacting chat endpoint:', err);
      // Fallback assistant response
      const fallbackMsg: DialogueMessage = {
        id: `asst_${Date.now()}`,
        sender: 'assistant',
        text: `I heard you ask: "${text}". You can also tap the items directly on the screen.`,
        timestamp: new Date(),
      };
      setDialogueMessages(prev => [...prev, fallbackMsg]);
      setSignals(prev => ({ ...prev, failedActionsCount: prev.failedActionsCount + 1 }));
    } finally {
      setIsProcessingChat(false);
    }
  };

  // Place Order Simulation
  const handlePlaceOrder = (paymentMethod: 'COD' | 'CAREGIVER_BILL' | 'UPI') => {
    const newOrder: Order = {
      id: `ORD-${Date.now()}`,
      items: [...cart],
      subtotal: cartTotal,
      deliveryFee: cartTotal > 150 ? 0 : 25,
      total: cartTotal + (cartTotal > 150 ? 0 : 25),
      paymentMethod,
      deliveryAddress: userProfile.address,
      deliverySlot: 'Immediate (10 Mins)',
      createdAt: new Date().toISOString(),
      status: 'PLACED',
      assistanceStateAtOrder: assistanceDecision.state,
    };

    setConfirmedOrder(newOrder);
    setCart([]);
    setIsCartOpen(false);

    // Audio read receipt
    speakText(`Order confirmed! Your groceries are arriving in 10 minutes to ${userProfile.address}. Payment mode is ${paymentMethod === 'COD' ? 'Cash on Delivery' : paymentMethod}.`, {
      slowSpeed: slowSpeech,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
    });
  };

  // Read whole page or active product aloud
  const handleReadPageAloud = () => {
    const summary = `Welcome to SahayMart. You have ${cartItemCount} items in your basket for ₹${cartTotal}. We have fresh milk, cooking oil, bread, and fruits ready for 10-minute delivery.`;
    speakText(summary, {
      slowSpeed: slowSpeech,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
    });
  };

  const handleSpeakProduct = (product: Product) => {
    const text = `${product.name}, price is ₹${product.price} for ${product.packSize}. ${product.nutritionalHighlight || ''}.`;
    speakText(text, {
      slowSpeed: slowSpeech,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
    });
  };

  // Benchmark Task Controls
  const handleStartBenchmarkTask = (task: BenchmarkTask) => {
    setActiveTask(task);
    setTaskStartTime(Date.now());
    // reset signals for this specific task run
    setSignals({
      ...INITIAL_SIGNALS,
      sessionStartTime: Date.now(),
      lastActionTimestamp: Date.now(),
    });
    setCart([]);

    // Voice announcement of the task
    speakText(`Starting evaluation for: ${task.title}. ${task.instruction}`, {
      slowSpeed: slowSpeech,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
    });
  };

  const handleCompleteBenchmarkTask = (effortScore: number, satisfactionScore: number) => {
    if (!activeTask || !taskStartTime) return;
    const elapsed = Math.round((Date.now() - taskStartTime) / 1000);
    const isSuccess = activeTask.successCondition(cart, !!confirmedOrder);

    const result: TaskEvaluationResult = {
      taskId: activeTask.id,
      taskTitle: activeTask.title,
      systemMode,
      completed: isSuccess,
      elapsedSeconds: elapsed,
      errorCount: signals.wrongSelectionsCount + signals.correctionsCount,
      clarificationCount: signals.clarificationsCount,
      turnsCount: signals.dialogueTurns,
      assistanceStateReached: assistanceDecision.state,
      perceivedEffortScore: effortScore,
      satisfactionScore: satisfactionScore,
      timestamp: new Date().toLocaleTimeString(),
    };

    setEvaluationHistory(prev => [result, ...prev]);
    setActiveTask(null);
    setTaskStartTime(null);
    setIsBenchmarkOpen(true);
  };

  // Simulate Signal Injection for Researcher Viva
  const handleSimulateSignal = (type: 'repeated' | 'correction' | 'clarification' | 'wrong_selection' | 'failed_action') => {
    setSignals(prev => {
      const next = { ...prev, lastActionTimestamp: Date.now() };
      if (type === 'repeated') next.repeatedCommandsCount += 1;
      if (type === 'correction') next.correctionsCount += 1;
      if (type === 'clarification') next.clarificationsCount += 1;
      if (type === 'wrong_selection') next.wrongSelectionsCount += 1;
      if (type === 'failed_action') next.failedActionsCount += 1;
      return next;
    });
  };

  // Filter products
  const filteredProducts = products.filter(p => {
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.tags.some(t => t.includes(q)) || p.brand.toLowerCase().includes(q);
    }
    return true;
  });

  // Prune visible products in Adaptive Mode based on cognitive assistance policy
  const visibleProducts = systemMode === 'SYSTEM_C_ADAPTIVE'
    ? filteredProducts.slice(0, assistanceDecision.policy.maxVisibleChoices)
    : filteredProducts;

  // Frequently purchased items for "My Usuals"
  const usualProducts = products.filter(p => userProfile.frequentlyBoughtProductIds.includes(p.id));

  // If System A (Conventional baseline) is active
  if (systemMode === 'SYSTEM_A_CONVENTIONAL') {
    return (
      <div className={highContrast ? 'bg-stone-900 text-stone-100' : 'bg-stone-50'}>
        <Header
          cartItemCount={cartItemCount}
          cartTotal={cartTotal}
          onOpenCart={() => setIsCartOpen(true)}
          assistanceState={assistanceDecision.state}
          systemMode={systemMode}
          onOpenBenchmark={() => setIsBenchmarkOpen(true)}
          onOpenCaregiver={() => setIsCaregiverOpen(true)}
          fontSize={fontSize}
          onResetSession={() => setSignals(INITIAL_SIGNALS)}
          onNavigateSection={setActiveViewSection}
          onOpenDatasetInspector={() => setIsDatasetInspectorOpen(true)}
        />
        <ConventionalStorefront
          products={products}
          onAddToCart={(prod) => handleAddToCart(prod, 1)}
          onOpenCart={() => setIsCartOpen(true)}
          cartCount={cartItemCount}
        />
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          items={cart}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={(id) => handleUpdateQuantity(products.find(p => p.id === id)!, 0)}
          onClearCart={() => setCart([])}
          userProfile={userProfile}
          assistanceState="INDEPENDENT"
          onPlaceOrder={handlePlaceOrder}
          fontSize={fontSize}
          undoAction={undoAction}
        />
        <BenchmarkPanel
          isOpen={isBenchmarkOpen}
          onClose={() => setIsBenchmarkOpen(false)}
          systemMode={systemMode}
          onChangeSystemMode={setSystemMode}
          activeSignals={signals}
          assistanceDecision={assistanceDecision}
          manualOverrideState={manualOverrideState}
          onSetManualOverride={setManualOverrideState}
          onSimulateSignal={handleSimulateSignal}
          onResetSignals={() => setSignals(INITIAL_SIGNALS)}
          activeTask={activeTask}
          onStartTask={handleStartBenchmarkTask}
          onCompleteTask={handleCompleteBenchmarkTask}
          evaluationHistory={evaluationHistory}
        />
        <DatasetModelInspector
          isOpen={isDatasetInspectorOpen}
          onClose={() => setIsDatasetInspectorOpen(false)}
          decision={assistanceDecision}
          signals={signals}
          onSimulateSignal={handleSimulateSignal}
        />
      </div>
    );
  }

  // System B (Non-Adaptive) or System C (Proposed Adaptive)
  const isHighAssistance = systemMode === 'SYSTEM_C_ADAPTIVE' && assistanceDecision.state === 'HIGH_ASSISTANCE';
  const isGuidedAssistance = systemMode === 'SYSTEM_C_ADAPTIVE' && assistanceDecision.state === 'GUIDED_ASSISTANCE';

  return (
    <div className={`min-h-screen font-sans transition-colors ${
      highContrast 
        ? 'bg-stone-950 text-stone-100' 
        : 'bg-[#faf8f5] text-stone-900'
    }`}>
      {/* 3-Zone Header Contract */}
      <Header
        cartItemCount={cartItemCount}
        cartTotal={cartTotal}
        onOpenCart={() => setIsCartOpen(true)}
        assistanceState={assistanceDecision.state}
        systemMode={systemMode}
        onOpenBenchmark={() => setIsBenchmarkOpen(true)}
        onOpenCaregiver={() => setIsCaregiverOpen(true)}
        fontSize={fontSize}
        onResetSession={() => setSignals(INITIAL_SIGNALS)}
        onNavigateSection={setActiveViewSection}
        onOpenDatasetInspector={() => setIsDatasetInspectorOpen(true)}
      />

      {/* Elder Accessibility Toolbar */}
      <AccessibilityBar
        fontSize={fontSize}
        onChangeFontSize={setFontSize}
        highContrast={highContrast}
        onToggleHighContrast={() => setHighContrast(!highContrast)}
        slowSpeech={slowSpeech}
        onToggleSlowSpeech={() => setSlowSpeech(!slowSpeech)}
        language={language}
        onChangeLanguage={setLanguage}
        onReadPageAloud={handleReadPageAloud}
        isSpeaking={isSpeaking}
        onStopSpeaking={stopSpeaking}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* Active Benchmark Running Alert */}
        {activeTask && (
          <div className="bg-amber-100 border-2 border-amber-400 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-amber-600 animate-ping inline-block"></span>
              <div>
                <strong className="text-amber-950 text-sm block">
                  ACTIVE EXPERIMENTAL TASK: {activeTask.title}
                </strong>
                <span className="text-xs text-amber-900">
                  {activeTask.instruction} — Goal: {activeTask.targetGoalDescription}
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsBenchmarkOpen(true)}
              className="px-4 py-2 bg-amber-800 text-white rounded-xl text-xs font-bold hover:bg-amber-900 cursor-pointer self-start sm:self-auto"
            >
              Open Evaluation Lab
            </button>
          </div>
        )}

        {/* Dynamic Adaptive Assistance Environment Monitor */}
        {systemMode === 'SYSTEM_C_ADAPTIVE' && (
          <AdaptiveMonitorBanner
            decision={assistanceDecision}
            signals={signals}
            onSetState={setManualOverrideState}
            manualOverrideState={manualOverrideState}
            onSimulateFriction={handleSimulateSignal}
            onReset={() => setSignals(INITIAL_SIGNALS)}
            fontSize={fontSize}
          />
        )}

        {/* Hero Section & Storefront Introduction */}
        <section className="relative rounded-3xl overflow-hidden bg-emerald-900 text-white shadow-md">
          <div className="absolute inset-0 opacity-25 mix-blend-overlay">
            <img
              src="/src/assets/images/hero_elder_grocery_1790790655867.jpg"
              alt="Grocery delivery"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="relative p-6 sm:p-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-xs font-semibold text-emerald-100">
              <Clock className="w-3.5 h-3.5" />
              <span>Malleshwaram 10-Minute Delivery · Verified Pure Groceries</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-serif text-emerald-50">
              Grocery Shopping Made Relaxed, Respectful & Simple
            </h1>

            <p className="text-sm sm:text-base text-emerald-100 leading-relaxed max-w-xl">
              Specially designed for seniors: speak in your own language, enjoy large easy-to-read text, compare healthy options, and pay with Cash on Delivery.
            </p>
          </div>
        </section>

        {/* Multimodal Voice & Text Assistant */}
        <VoiceAssistantBar
          onSendMessage={handleSendMessage}
          assistanceState={systemMode === 'SYSTEM_C_ADAPTIVE' ? assistanceDecision.state : 'INDEPENDENT'}
          lastMessage={dialogueMessages[dialogueMessages.length - 1] || null}
          isProcessing={isProcessingChat}
          isSpeaking={isSpeaking}
          onStopSpeaking={stopSpeaking}
          onReplayAudio={(text) => speakText(text, { slowSpeed: slowSpeech })}
          language={language}
          fontSize={fontSize}
        />

        {/* Navigation Tabs (Shop Essentials vs My Usuals) */}
        <div className="flex items-center justify-between border-b border-stone-200 pb-3 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveViewSection('shop')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors cursor-pointer ${
                activeViewSection === 'shop'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              All Essentials ({products.length})
            </button>
            <button
              onClick={() => setActiveViewSection('usuals')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeViewSection === 'usuals'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              <Flame className="w-4 h-4 text-amber-500" />
              <span>My Usual Morning Essentials ({usualProducts.length})</span>
            </button>

            <button
              onClick={handleRefreshLiveMarket}
              disabled={isRefreshingMarket}
              className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 flex items-center gap-1.5 shadow-2xs"
              title="Dynamically seed fresh seasonal groceries via Gemini API"
            >
              <Sparkles className={`w-3.5 h-3.5 text-amber-600 ${isRefreshingMarket ? 'animate-spin' : ''}`} />
              <span>{isRefreshingMarket ? 'Restocking Live Items...' : 'Refresh Live Market (AI)'}</span>
            </button>
          </div>

          {/* Category Filter Pills (Functional Filter Tabs) */}
          {activeViewSection === 'shop' && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <span className="font-semibold text-stone-500 text-[11px] uppercase mr-1">Category:</span>
              {[
                { id: 'all', label: 'All Items' },
                { id: 'dairy', label: 'Milk & Dairy' },
                { id: 'cooking-oil', label: 'Cooking Oils' },
                { id: 'bakery', label: 'Bread & Bakery' },
                { id: 'fruits-vegetables', label: 'Fresh Fruits' },
                { id: 'wellness', label: 'Senior Wellness' },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id as any)}
                  className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-stone-900 text-white font-bold'
                      : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Products Grid View */}
        {activeViewSection === 'usuals' ? (
          <div>
            <div className="mb-4 p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-stone-900 text-base">
                  Frequently Ordered by Smt. Shanthamma
                </h3>
                <p className="text-xs text-stone-600 mt-0.5">
                  Your regular morning staples based on past orders. Add all with 1 tap.
                </p>
              </div>

              <button
                onClick={() => {
                  usualProducts.forEach(p => handleAddToCart(p, 1));
                }}
                className="px-4 py-2 bg-emerald-800 text-white rounded-xl text-xs font-bold hover:bg-emerald-900 transition-colors shadow-xs cursor-pointer"
              >
                + Add All Usuals to Basket
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {usualProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  quantityInCart={cart.find(i => i.product.id === product.id)?.quantity || 0}
                  onAddToCart={handleAddToCart}
                  onUpdateQuantity={handleUpdateQuantity}
                  assistanceState={systemMode === 'SYSTEM_C_ADAPTIVE' ? assistanceDecision.state : 'INDEPENDENT'}
                  language={language}
                  fontSize={fontSize}
                  onSpeakProduct={handleSpeakProduct}
                />
              ))}
            </div>
          </div>
        ) : (
          <div>
            {visibleProducts.length === 0 ? (
              <div className="py-12 text-center bg-white rounded-3xl border border-stone-200 p-8 space-y-4 max-w-xl mx-auto shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6 text-amber-700" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900">
                    {searchQuery ? `Looking for "${searchQuery}"?` : 'No stored items match this selection'}
                  </h3>
                  <p className="text-xs text-stone-600 mt-1">
                    Our dynamic grocery engine can generate authentic Indian products with live pricing and senior health notes on demand.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDynamicProductSearch(searchQuery || 'healthy grocery')}
                  disabled={isGeneratingItem}
                  className="px-6 py-3 bg-emerald-800 hover:bg-emerald-900 disabled:bg-stone-300 text-white font-bold rounded-xl shadow-md cursor-pointer inline-flex items-center gap-2 text-sm transition-all"
                >
                  <Sparkles className={`w-4 h-4 text-amber-300 ${isGeneratingItem ? 'animate-spin' : ''}`} />
                  <span>{isGeneratingItem ? 'Generating Authentic Product with AI...' : `Generate "${searchQuery || 'Seasonal Produce'}" with AI`}</span>
                </button>
              </div>
            ) : isHighAssistance ? (
              <div className="space-y-4">
                <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl text-center max-w-xl mx-auto">
                  <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
                    Ultra-Simplified View Activated
                  </span>
                  <h3 className="text-lg font-bold text-stone-950 mt-1">
                    Showing your primary choice with large touch buttons
                  </h3>
                  <p className="text-xs text-stone-600 mt-0.5">
                    We reduced the screen choices to prevent accidental clicks.
                  </p>
                </div>

                <div className="max-w-md mx-auto">
                  {visibleProducts.length > 0 && (
                    <ProductCard
                      product={visibleProducts[0]}
                      quantityInCart={cart.find(i => i.product.id === visibleProducts[0].id)?.quantity || 0}
                      onAddToCart={handleAddToCart}
                      onUpdateQuantity={handleUpdateQuantity}
                      assistanceState={assistanceDecision.state}
                      language={language}
                      fontSize={fontSize}
                      onSpeakProduct={handleSpeakProduct}
                      isFocalHighAssistance={true}
                    />
                  )}
                </div>

                {visibleProducts.length > 1 && (
                  <div className="text-center pt-2">
                    <button
                      onClick={() => setManualOverrideState('GUIDED_ASSISTANCE')}
                      className="text-xs text-stone-600 hover:text-stone-950 font-semibold underline cursor-pointer"
                    >
                      Show alternative option
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Normal or Guided Product Grid */
              <div className={`grid gap-4 sm:gap-6 ${
                isGuidedAssistance 
                  ? 'grid-cols-1 sm:grid-cols-2 max-w-4xl mx-auto' 
                  : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
              }`}>
                {visibleProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    quantityInCart={cart.find(i => i.product.id === product.id)?.quantity || 0}
                    onAddToCart={handleAddToCart}
                    onUpdateQuantity={handleUpdateQuantity}
                    assistanceState={systemMode === 'SYSTEM_C_ADAPTIVE' ? assistanceDecision.state : 'INDEPENDENT'}
                    language={language}
                    fontSize={fontSize}
                    onSpeakProduct={handleSpeakProduct}
                  />
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      {/* Cart Drawer & Verification */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={(id) => handleUpdateQuantity(products.find(p => p.id === id)!, 0)}
        onClearCart={() => setCart([])}
        userProfile={userProfile}
        assistanceState={systemMode === 'SYSTEM_C_ADAPTIVE' ? assistanceDecision.state : 'INDEPENDENT'}
        onPlaceOrder={handlePlaceOrder}
        fontSize={fontSize}
        undoAction={undoAction}
      />

      {/* Pairwise Product Comparison Modal */}
      {comparisonProducts && (
        <ComparisonCard
          products={comparisonProducts}
          onSelectProduct={(p) => {
            handleAddToCart(p, 1);
            setComparisonProducts(null);
          }}
          onClose={() => setComparisonProducts(null)}
          language={language}
          fontSize={fontSize}
        />
      )}

      {/* Order Confirmed & Simulated 10-Min Delivery Modal */}
      <OrderSuccessModal
        order={confirmedOrder}
        onClose={() => setConfirmedOrder(null)}
        onReadOrderAloud={(ord) => {
          const text = `Order receipt: ${ord.items.map(i => `${i.quantity} ${i.product.name}`).join(', ')}. Total is ₹${ord.total}. Arriving to ${ord.deliveryAddress}.`;
          speakText(text, { slowSpeed: slowSpeech });
        }}
        fontSize={fontSize}
      />

      {/* Research Benchmark & Telemetry Panel */}
      <BenchmarkPanel
        isOpen={isBenchmarkOpen}
        onClose={() => setIsBenchmarkOpen(false)}
        systemMode={systemMode}
        onChangeSystemMode={setSystemMode}
        activeSignals={signals}
        assistanceDecision={assistanceDecision}
        manualOverrideState={manualOverrideState}
        onSetManualOverride={setManualOverrideState}
        onSimulateSignal={handleSimulateSignal}
        onResetSignals={() => setSignals(INITIAL_SIGNALS)}
        activeTask={activeTask}
        onStartTask={handleStartBenchmarkTask}
        onCompleteTask={handleCompleteBenchmarkTask}
        evaluationHistory={evaluationHistory}
      />

      {/* Caregiver Helper Modal */}
      <CaregiverModal
        isOpen={isCaregiverOpen}
        onClose={() => setIsCaregiverOpen(false)}
        userProfile={userProfile}
        cart={cart}
        cartTotal={cartTotal}
      />

      {/* Trained ML Model & Training Dataset Inspector */}
      <DatasetModelInspector
        isOpen={isDatasetInspectorOpen}
        onClose={() => setIsDatasetInspectorOpen(false)}
        decision={assistanceDecision}
        signals={signals}
        onSimulateSignal={handleSimulateSignal}
      />
    </div>
  );
}
