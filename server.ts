import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { INITIAL_PRODUCTS } from './src/data/products.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// Initialize Google GenAI SDK if valid API key is provided
let aiClient: GoogleGenAI | null = null;
const hasValidGeminiKey = Boolean(
  process.env.GEMINI_API_KEY && 
  process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY' &&
  process.env.GEMINI_API_KEY.length > 10
);
if (hasValidGeminiKey) {
  aiClient = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });
}

// Resilient Gemini Model caller with automatic fallback between 3.1-flash-lite and 3.8-flash
async function callGeminiWithFallback(contents: string, config: any): Promise<string | null> {
  if (!aiClient) return null;
  const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];
  for (const model of modelsToTry) {
    try {
      const res = await aiClient.models.generateContent({
        model,
        contents,
        config,
      });
      if (res && res.text) {
        return res.text;
      }
    } catch (err: any) {
      console.warn(`Model ${model} deferred:`, err?.message || err);
    }
  }
  return null;
}

// Fallback rule-based NLP matcher for Indian languages & shopping terms with dynamic assistance adaptation
function localShoppingNLPMatcher(prompt: string, state: string = 'INDEPENDENT') {
  const p = prompt.toLowerCase().trim();

  // Helper to adapt tone based on current assistance state
  const adaptTone = (concise: string, warm: string, guided: string, ultraSimple: string) => {
    if (state === 'HIGH_ASSISTANCE') return ultraSimple;
    if (state === 'GUIDED_ASSISTANCE') return guided;
    if (state === 'MILD_ASSISTANCE') return warm;
    return concise;
  };

  // Price queries
  if (p.includes('price') || p.includes('rate') || p.includes('cost') || p.includes('kitna') || p.includes('kela') || p.includes('bele') || p.includes('vila')) {
    if (p.includes('milk') || p.includes('doodh') || p.includes('haalu')) {
      return {
        intent: 'CHECK_PRICE',
        entity: 'milk',
        response: adaptTone(
          'Nandini Toned Milk: ₹44 (1L) / ₹24 (500ml).',
          'Nandini Toned Fresh Milk is ₹44 for 1 Litre, and ₹24 for 500ml. Would you like me to add it?',
          'Here are the prices: Option 1 is 1 Litre for ₹44. Option 2 is 500ml for ₹24. Which size do you prefer?',
          'Fresh milk costs 44 rupees for 1 litre. Tap the green Add button below to add it.'
        ),
        matchedProductIds: ['prod_milk_nandini_1l', 'prod_milk_nandini_500ml']
      };
    }
    if (p.includes('oil') || p.includes('tel') || p.includes('enne')) {
      return {
        intent: 'CHECK_PRICE',
        entity: 'oil',
        response: adaptTone(
          'Fortune Sunflower: ₹138. Saffola Gold: ₹185.',
          'Fortune Sunflower Oil 1 Litre is ₹138. Saffola Gold Heart Care is ₹185.',
          'Two options available: Fortune Sunflower Oil is budget-friendly at ₹138. Saffola Gold is ₹185 for heart care.',
          'The oil price is 138 rupees. We have placed the choice right in front of you.'
        ),
        matchedProductIds: ['prod_oil_sunflower_1l', 'prod_oil_saffola_gold_1l']
      };
    }
  }

  // Cheapest oil task
  if ((p.includes('cheap') || p.includes('sasta') || p.includes('kam daam') || p.includes('kadime')) && (p.includes('oil') || p.includes('tel') || p.includes('enne'))) {
    return {
      intent: 'SEARCH_PRODUCT',
      entity: 'cheapest oil',
      response: adaptTone(
        'Cheapest: Fortune Sunflower Oil 1L at ₹138.',
        'The cheapest cooking oil is Fortune Refined Sunflower Oil (1 Litre) at ₹138 (11% off). Should I put this in your basket?',
        'The best budget option is Fortune Sunflower Oil at ₹138. I have highlighted it on your screen for easy addition.',
        'We found the cheapest cooking oil for you. It is Fortune Oil for 138 rupees. Tap the big button below to add it.'
      ),
      matchedProductIds: ['prod_oil_sunflower_1l']
    };
  }

  // Compare products
  if (p.includes('compare') || p.includes('difference') || p.includes('farq') || p.includes('anthara')) {
    return {
      intent: 'COMPARE_PRODUCTS',
      entity: 'oil comparison',
      response: adaptTone(
        'Fortune ₹138 (daily cooking) vs Saffola ₹185 (heart care).',
        'Here is a simple comparison: Fortune Sunflower Oil is budget-friendly at ₹138. Saffola Gold is ₹185 and has natural antioxidants specially formulated for cholesterol and heart care.',
        'Here is a step-by-step comparison: Option A is Fortune Oil at ₹138 for general cooking. Option B is Saffola Gold at ₹185 with natural antioxidants for heart health. Which would you prefer?',
        'We opened a side-by-side comparison for you. Take your time to tap whichever option you want.'
      ),
      matchedProductIds: ['prod_oil_sunflower_1l', 'prod_oil_saffola_gold_1l']
    };
  }

  // Repeat / usual order
  if (p.includes('usual') || p.includes('repeat') || p.includes('yesterday') || p.includes('pichla') || p.includes('hamesha') || p.includes('hinde')) {
    return {
      intent: 'REPEAT_ORDER',
      entity: 'usual items',
      response: adaptTone(
        'Loaded usual essentials: Milk 1L, Whole Wheat Bread, Tata Tea Gold.',
        'Here are your frequently ordered essentials: Nandini Toned Milk 1L, Whole Wheat Bread, and Tata Tea Gold. Tap to add them directly!',
        'I found your regular morning items: fresh milk, wheat bread, and tea. I have laid them out clearly so you can add them with one tap.',
        'Here are your daily items from yesterday. Tap the green button to add them safely.'
      ),
      matchedProductIds: ['prod_milk_nandini_1l', 'prod_bread_wheat_400g', 'prod_tea_tata_gold_250g']
    };
  }

  // Breakfast under budget
  if (p.includes('breakfast') || p.includes('nashta') || p.includes('thindi') || p.includes('budget') || p.includes('200')) {
    return {
      intent: 'SEARCH_PRODUCT',
      entity: 'breakfast',
      response: adaptTone(
        'Breakfast under ₹200: Bread (₹45), Curd (₹45), Bananas (₹48). Total: ₹138.',
        'Here are nutritious senior-friendly breakfast items under ₹200: Whole Wheat Bread (₹45), Milky Mist Curd (₹45), and Fresh Bananas (₹48). Total is just ₹138!',
        'I selected healthy breakfast essentials within your ₹200 budget: soft bread, fresh curd, and sweet bananas. Total is ₹138.',
        'We found soft breakfast food for you under 200 rupees. Everything is ready on your screen.'
      ),
      matchedProductIds: ['prod_bread_wheat_400g', 'prod_curd_milky_mist_500g', 'prod_banana_robusta_1kg']
    };
  }

  // Milk purchase
  if (p.includes('milk') || p.includes('doodh') || p.includes('haalu') || p.includes('paal')) {
    const isSmall = p.includes('500') || p.includes('half') || p.includes('adha') || p.includes('chota');
    const selectedId = isSmall ? 'prod_milk_nandini_500ml' : 'prod_milk_nandini_1l';
    return {
      intent: 'ADD_TO_CART',
      entity: 'milk',
      quantity: 1,
      response: isSmall 
        ? adaptTone(
            'Added Nandini Milk 500ml (₹24).',
            'Added Nandini Toned Milk 500ml (₹24) to your basket.',
            'Added 500ml Nandini Milk to your basket for ₹24. Next: do you need bread or tea?',
            'Done! 1 small packet of milk is placed in your basket for 24 rupees.'
          )
        : adaptTone(
            'Added Nandini Milk 1L (₹44).',
            'Added Nandini Fresh Toned Milk 1 Litre (₹44) to your basket.',
            'Added 1 Litre Nandini Milk to your basket for ₹44. Next: do you need bread or tea?',
            'Done! 1 packet of fresh milk is placed in your basket for 44 rupees. No need to hurry.'
          ),
      matchedProductIds: [selectedId]
    };
  }

  // Cooking oil search/add
  if (p.includes('oil') || p.includes('tel') || p.includes('enne') || p.includes('sunflower')) {
    return {
      intent: 'SEARCH_PRODUCT',
      entity: 'cooking oil',
      response: 'I found 2 good options for cooking oil: Fortune Sunflower Oil (₹138) and Saffola Heart Care Oil (₹185). Which one do you prefer?',
      matchedProductIds: ['prod_oil_sunflower_1l', 'prod_oil_saffola_gold_1l']
    };
  }

  // Bread
  if (p.includes('bread') || p.includes('roti') || p.includes('pav')) {
    return {
      intent: 'ADD_TO_CART',
      entity: 'bread',
      quantity: 1,
      response: 'Added Modern 100% Whole Wheat Bread (₹45) to your basket. It is soft, fiber-rich, and zero-maida.',
      matchedProductIds: ['prod_bread_wheat_400g']
    };
  }

  // Apples / Fruits
  if (p.includes('apple') || p.includes('seb') || p.includes('sebu') || p.includes('fruit')) {
    return {
      intent: 'ADD_TO_CART',
      entity: 'apples',
      quantity: 1,
      response: 'Found Fresh Royal Gala Apples 500g (₹98). Sweet, juicy, and easy to slice.',
      matchedProductIds: ['prod_apples_fresh_500g']
    };
  }

  // Curd / Dahi
  if (p.includes('curd') || p.includes('dahi') || p.includes('mosaru') || p.includes('thayir')) {
    return {
      intent: 'ADD_TO_CART',
      entity: 'curd',
      quantity: 1,
      response: 'Added Milky Mist Farm Fresh Curd 500g (₹45) to your basket. Great for gut health and cooling for digestion.',
      matchedProductIds: ['prod_curd_milky_mist_500g']
    };
  }

  // Oats
  if (p.includes('oats') || p.includes('quaker')) {
    return {
      intent: 'ADD_TO_CART',
      entity: 'oats',
      quantity: 1,
      response: 'Added Quaker Instant Rolled Oats 1kg (₹180) to your basket. Recommended for heart and cholesterol health.',
      matchedProductIds: ['prod_oats_quaker_1kg']
    };
  }

  // Tea
  if (p.includes('tea') || p.includes('chai') || p.includes('chaha')) {
    return {
      intent: 'ADD_TO_CART',
      entity: 'tea',
      quantity: 1,
      response: 'Added Tata Tea Gold 250g (₹145) with aromatic long leaves to your basket.',
      matchedProductIds: ['prod_tea_tata_gold_250g']
    };
  }

  // Checkout / Place order
  if (p.includes('checkout') || p.includes('order') || p.includes('buy') || p.includes('bill') || p.includes('kareedna')) {
    return {
      intent: 'CHECKOUT',
      entity: 'checkout',
      response: 'Sure! Let us review your order summary and delivery address. You can pay with Cash on Delivery when the delivery boy arrives.',
      matchedProductIds: []
    };
  }

  // Remove
  if (p.includes('remove') || p.includes('delete') || p.includes('hatao') || p.includes('beda') || p.includes('nikalo')) {
    return {
      intent: 'REMOVE_FROM_CART',
      entity: 'item',
      response: 'I will help you remove that item right away. Which item should I take out?',
      matchedProductIds: []
    };
  }

  // General fallback
  return {
    intent: 'SEARCH_PRODUCT',
    entity: p,
    response: `I searched for "${prompt}". Here are the matching products from our grocery store.`,
    matchedProductIds: INITIAL_PRODUCTS.filter(item => 
      item.name.toLowerCase().includes(p) || 
      item.tags.some(t => p.includes(t)) ||
      item.category.includes(p)
    ).map(i => i.id)
  };
}

// Conversational Shopping Endpoint
app.post('/api/chat', async (req: Request, res: Response): Promise<void> => {
  try {
    const { prompt, assistanceState, preferredLanguage, cart, userProfile } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }

    // If Gemini is available, utilize Gemini 3.8 Flash with structured response
    if (aiClient) {
      try {
        const systemInstruction = `
You are Sahay, a compassionate, patient, elderly-friendly conversational AI shopping assistant for an Indian quick-commerce grocery app.
The user is an older adult (senior citizen) shopping for daily essentials.
Preferred language of user: ${preferredLanguage || 'en'} (User may speak in English, Hindi, Kannada, Tamil, or Hinglish/code-mixed phrases).
Current Assistance State: ${assistanceState || 'INDEPENDENT'}.
Rules based on Assistance State:
- INDEPENDENT: Keep response polite, concise, and clear (1-2 sentences).
- MILD_ASSISTANCE: Reassuring, warm, slightly more descriptive (2-3 sentences).
- GUIDED_ASSISTANCE: Step-by-step guidance. Use simple, gentle words. If they are choosing between options, clearly state Option A vs Option B with prices.
- HIGH_ASSISTANCE: Extremely clear, ultra-simple words. No jargon. Tell them exactly what you did or what they should tap next. Reassure them that there is no hurry.

Known Products in Store:
${JSON.stringify(INITIAL_PRODUCTS.map(p => ({ id: p.id, name: p.name, price: p.price, pack: p.packSize, category: p.category, tags: p.tags })))}

Return a strict JSON object with:
{
  "intent": "SEARCH_PRODUCT" | "ADD_TO_CART" | "REMOVE_FROM_CART" | "COMPARE_PRODUCTS" | "CHECK_PRICE" | "REPEAT_ORDER" | "CHECKOUT" | "CLARIFICATION" | "HELP",
  "spokenResponse": "Warm natural response tailored to the senior and assistance state in the user's language or simple English",
  "matchedProductIds": ["prod_id_1", "prod_id_2"],
  "identifiedQuantity": 1,
  "confidence": 0.95,
  "needsConfirmation": boolean
}
`;

        const rawText = await callGeminiWithFallback(prompt, {
          systemInstruction,
          responseMimeType: 'application/json',
          maxOutputTokens: 300,
        });

        if (rawText) {
          const parsed = JSON.parse(rawText);
          res.json({
            intent: parsed.intent || 'SEARCH_PRODUCT',
            spokenResponse: parsed.spokenResponse,
            matchedProductIds: parsed.matchedProductIds || [],
            identifiedQuantity: parsed.identifiedQuantity || 1,
            needsConfirmation: parsed.needsConfirmation || false,
            usedGemini: true,
          });
          return;
        }
      } catch (geminiErr: any) {
        console.warn('Gemini chat parsing deferred:', geminiErr?.message || geminiErr);
      }
    }

    // Fast local rule-based matcher with dynamic assistance adaptation
    const localResult = localShoppingNLPMatcher(prompt, assistanceState || 'INDEPENDENT');
    res.json({
      intent: localResult.intent,
      spokenResponse: localResult.response,
      matchedProductIds: localResult.matchedProductIds || [],
      identifiedQuantity: (localResult as any).quantity || 1,
      needsConfirmation: assistanceState === 'HIGH_ASSISTANCE',
      usedGemini: false,
    });
  } catch (err: any) {
    console.error('Chat endpoint error:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// Dynamic In-Memory Grocery Product Store
let liveProductsStore: any[] = [...INITIAL_PRODUCTS];

// Fallback high-quality curated images for dynamically generated groceries
const CATEGORY_IMAGE_FALLBACKS: Record<string, string> = {
  dairy: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80',
  bakery: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
  oil_ghee: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80',
  fruits_veg: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80',
  staples: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
  beverages: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
  health_care: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
  snacks: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=600&q=80',
};

// Dynamic Products API (Supports live filtering and search)
app.get('/api/products', (req: Request, res: Response) => {
  const { q, category } = req.query;
  let results = [...liveProductsStore];

  if (category && typeof category === 'string' && category !== 'all') {
    results = results.filter(p => p.category === category);
  }

  if (q && typeof q === 'string' && q.trim()) {
    const search = q.toLowerCase().trim();
    results = results.filter(p => 
      p.name.toLowerCase().includes(search) || 
      p.tags.some((t: string) => t.toLowerCase().includes(search)) ||
      (p.brand && p.brand.toLowerCase().includes(search))
    );
  }

  res.json({ products: results, count: results.length });
});

// Dynamic AI Product Generator & Search API
app.post('/api/products/search-dynamic', async (req: Request, res: Response): Promise<void> => {
  try {
    const { query, preferredLanguage } = req.body;
    if (!query || typeof query !== 'string') {
      res.status(400).json({ error: 'Search query is required' });
      return;
    }

    const qLower = query.toLowerCase().trim();

    // Check existing live products first
    const existing = liveProductsStore.filter(p => 
      p.name.toLowerCase().includes(qLower) || 
      p.tags.some((t: string) => t.toLowerCase().includes(qLower)) ||
      p.category.includes(qLower)
    );

    if (existing.length >= 2 || !aiClient) {
      res.json({ products: existing, generatedDynamically: false });
      return;
    }

    // Use Gemini 3.8 Flash to dynamically generate authentic Indian grocery items
    const prompt = `
Generate 2 authentic Indian grocery products for an elderly quick-commerce grocery store in Bangalore/India matching the user's search: "${query}".
Return a strict JSON array of objects with the exact schema:
[
  {
    "id": "prod_dynamic_slug_unique",
    "name": "Brand and Full Name (e.g. MTR Roasted Rava 1kg, Dabur Chyawanprash Sugar-Free 500g)",
    "localName": {
      "hi": "Hindi translation",
      "kn": "Kannada translation",
      "ta": "Tamil translation"
    },
    "brand": "Real Indian Brand (e.g. MTR, Dabur, Aashirvaad, Tata, Britannia, Saffola, 24 Mantra)",
    "category": "dairy" | "oil_ghee" | "fruits_veg" | "staples" | "beverages" | "bakery" | "snacks" | "health_care",
    "packSize": "e.g. 500g Pouch, 1 Litre Bottle, 1kg Bag",
    "volumeOrWeight": "e.g. 500g",
    "price": 120,
    "originalPrice": 140,
    "discountPercent": 14,
    "imageCategory": "staples",
    "nutritionalHighlight": "Key health highlight for seniors",
    "suitableForSenior": ["Senior Benefit 1", "Senior Benefit 2"],
    "description": "Short 1-sentence elderly-friendly product description.",
    "isDailyEssential": boolean,
    "tags": ["tag1", "tag2", "tag3"]
  }
]
`;

    const rawText = await callGeminiWithFallback(prompt, {
      responseMimeType: 'application/json',
      maxOutputTokens: 1500,
    }) || '[]';
    const cleanedJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const generatedItems = JSON.parse(cleanedJson);

    const validatedNewProducts: any[] = [];
    if (Array.isArray(generatedItems)) {
      for (const item of generatedItems) {
        if (item.name && item.price) {
          const cat = item.category || 'staples';
          const newProd = {
            id: item.id || `prod_dyn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            name: item.name,
            localName: item.localName || { hi: item.name, kn: item.name, ta: item.name },
            brand: item.brand || 'Fresh Mart',
            category: cat,
            packSize: item.packSize || 'Standard Pack',
            volumeOrWeight: item.volumeOrWeight || item.packSize,
            price: Number(item.price) || 99,
            originalPrice: Number(item.originalPrice) || Number(item.price) + 20,
            discountPercent: Number(item.discountPercent) || 10,
            image: CATEGORY_IMAGE_FALLBACKS[cat] || CATEGORY_IMAGE_FALLBACKS.staples,
            inStock: true,
            rating: 4.8,
            tags: Array.isArray(item.tags) ? item.tags : [item.name.toLowerCase()],
            nutritionalHighlight: item.nutritionalHighlight || 'Fresh & pure essential for daily household use',
            dietary: 'veg',
            suitableForSenior: Array.isArray(item.suitableForSenior) ? item.suitableForSenior : ['Easy to Prepare', 'Nutritious'],
            description: item.description || `Fresh ${item.name} delivered in 10 minutes.`,
            isDailyEssential: !!item.isDailyEssential,
          };
          validatedNewProducts.push(newProd);
          // Add to live store so user can add to cart and order
          liveProductsStore.unshift(newProd);
        }
      }
    }

    res.json({
      products: [...validatedNewProducts, ...existing],
      generatedDynamically: validatedNewProducts.length > 0,
    });
  } catch (err: any) {
    console.warn('Dynamic product generation deferred:', err?.message || err);
    res.json({ products: liveProductsStore.slice(0, 4), generatedDynamically: false, error: err?.message || String(err) });
  }
});

// Dynamic Live Market Refresh (Seeds fresh on-demand items)
app.post('/api/products/refresh-market', async (_req: Request, res: Response): Promise<void> => {
  try {
    if (!aiClient) {
      res.json({ products: liveProductsStore, message: 'Live market is running' });
      return;
    }

    const prompt = `
Generate 3 fresh seasonal Indian grocery essentials for seniors in Bangalore today (e.g. tender coconut, fresh palak, whole ragi flour, roasted cumin, almond milk).
Return strict JSON array of 3 products following standard schema with keys:
id, name, localName ({hi, kn, ta}), brand, category, packSize, volumeOrWeight, price, originalPrice, discountPercent, category, tags, nutritionalHighlight, suitableForSenior, description, isDailyEssential.
`;

    const rawText = await callGeminiWithFallback(prompt, {
      responseMimeType: 'application/json',
      maxOutputTokens: 1500,
    }) || '[]';

    const cleanedJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const items = JSON.parse(cleanedJson);
    if (Array.isArray(items)) {
      items.forEach((item: any) => {
        const cat = item.category || 'fruits_veg';
        const newProd = {
          ...item,
          id: item.id || `prod_dyn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          image: CATEGORY_IMAGE_FALLBACKS[cat] || CATEGORY_IMAGE_FALLBACKS.fruits_veg,
          inStock: true,
          rating: 4.9,
          dietary: 'veg',
        };
        liveProductsStore.unshift(newProd);
      });
    }

    res.json({ products: liveProductsStore, count: liveProductsStore.length });
  } catch (e: any) {
    console.warn('Market refresh deferred:', e?.message || e);
    res.json({ products: liveProductsStore, count: liveProductsStore.length });
  }
});

// Personalized Recommendation Engine
app.post('/api/recommend', (req: Request, res: Response) => {
  const { dietaryTags, frequentlyBoughtProductIds, cartProductIds } = req.body;
  
  const freqIds: string[] = frequentlyBoughtProductIds || [];
  const inCart: string[] = cartProductIds || [];

  const recommendations = liveProductsStore.map(product => {
    let score = 0;
    if (freqIds.includes(product.id)) score += 50;
    if (product.isDailyEssential) score += 20;
    if (inCart.includes(product.id)) score -= 30;
    if (product.suitableForSenior && product.suitableForSenior.length > 0) score += 15;
    return { product, score };
  })
  .sort((a, b) => b.score - a.score)
  .slice(0, 6)
  .map(item => item.product);

  res.json({ recommendations });
});

// Text-to-Speech Endpoint using Gemini 3.8 Flash Lite TTS
app.post('/api/tts', async (req: Request, res: Response): Promise<void> => {
  try {
    const { text, speechRate } = req.body;
    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Text is required for TTS' });
      return;
    }

    if (!aiClient) {
      res.status(503).json({ error: 'Gemini API not configured, using browser Web Speech' });
      return;
    }

    const ttsResponse = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: text,
              speechMetadata: {
                style: speechRate === 'slow' 
                  ? 'Gentle, very calm, slow-paced, warm caring grandmotherly tone' 
                  : 'Clear, polite, friendly conversational tone',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      res.status(500).json({ error: 'No audio returned' });
      return;
    }

    res.json({ audioBase64: base64Audio, mimeType: 'audio/wav' });
  } catch (ttsErr: any) {
    console.warn('TTS error (falling back to browser Web Speech):', ttsErr.message);
    res.status(500).json({ error: ttsErr.message || 'TTS generation failed' });
  }
});

// Setup Vite in Dev or serve static in Prod
async function startServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`SahayMart elder-centric server running on port ${PORT} [production=${isProduction}]`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
