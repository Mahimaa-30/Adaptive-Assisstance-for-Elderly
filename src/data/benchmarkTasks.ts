import { BenchmarkTask } from '../types';

export const BENCHMARK_TASKS: BenchmarkTask[] = [
  {
    id: 'task_milk_1l',
    title: 'Task 1: Purchase 1 Litre of Milk',
    instruction: 'Find and purchase 1 Litre of milk (Nandini Toned Milk 1L) and complete the simulated order.',
    localInstruction: {
      hi: '1 लीटर दूध (नंदिनी टोंड मिल्क) खोजें और कार्ट में जोड़कर ऑर्डर पूरा करें।',
      kn: '೧ ಲೀಟರ್ ನಂದಿನಿ ಹಾಲು ಹುಡುಕಿ ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಿ ಆರ್ಡರ್ ಮಾಡಿ.'
    },
    targetGoalDescription: 'Cart must contain at least 1 unit of 1L milk and order placed.',
    successCondition: (cart, orderCompleted) => {
      const hasMilk = cart.some(item => item.product.id === 'prod_milk_nandini_1l');
      return hasMilk && orderCompleted;
    },
    suggestedPrompt: 'Buy 1 litre nandini milk'
  },
  {
    id: 'task_cheapest_oil',
    title: 'Task 2: Find the Cheapest Cooking Oil',
    instruction: 'Ask for the cheapest cooking oil, add it to your cart, and review the price.',
    localInstruction: {
      hi: 'सबसे सस्ता कुकिंग ऑयल पूछें और उसे कार्ट में जोड़ें।',
      kn: 'ಅತಿ ಕಡಿಮೆ ಬೆಲೆಯ ಅಡುಗೆ ಎಣ್ಣೆ ಯಾವುದು ಎಂದು ಕೇಳಿ ಕಾರ್ಟ್‌ಗೆ ಹಾಕಿ.'
    },
    targetGoalDescription: 'Cheapest oil (Fortune Sunflower Oil at ₹138) identified and added to cart.',
    successCondition: (cart) => {
      return cart.some(item => item.product.id === 'prod_oil_sunflower_1l');
    },
    suggestedPrompt: 'Which is the cheapest cooking oil?'
  },
  {
    id: 'task_repeat_order',
    title: 'Task 3: Add a Previously Purchased Product',
    instruction: 'Request to reorder your usual items or repeat previous morning essentials.',
    localInstruction: {
      hi: 'अपनी पिछली खरीदारी या सुबह की ज़रूरी चीज़ें दोबारा ऑर्डर करें।',
      kn: 'ಹಿಂದೆ ತರಿಸಿದ ವಸ್ತುಗಳನ್ನು ಅಥವಾ ದಿನನಿತ್ಯದ ವಸ್ತುಗಳನ್ನು ಮತ್ತೆ ಸೇರಿಸಿ.'
    },
    targetGoalDescription: 'Cart contains one or more frequently bought products from history.',
    successCondition: (cart) => {
      return cart.length > 0 && cart.some(item => ['prod_milk_nandini_1l', 'prod_bread_wheat_400g', 'prod_tea_tata_gold_250g'].includes(item.product.id));
    },
    suggestedPrompt: 'Add my usual morning items'
  },
  {
    id: 'task_breakfast_budget',
    title: 'Task 4: Find Breakfast Products Under ₹200',
    instruction: 'Find healthy breakfast items suitable for seniors within a total budget of ₹200.',
    localInstruction: {
      hi: '₹200 के अंदर नाश्ते के लिए पौष्टिक सामान खोजें।',
      kn: '₹೨೦೦ ರೊಳಗೆ ಆರೋಗ್ಯಕರ ಉಪಾಹಾರ ಪದಾರ್ಥಗಳನ್ನು ತೋರಿಸಿ.'
    },
    targetGoalDescription: 'Cart contains 2 or more breakfast items (bread, curd, bananas) under ₹200 total.',
    successCondition: (cart) => {
      const total = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
      return cart.length >= 2 && total <= 200;
    },
    suggestedPrompt: 'Show healthy breakfast items under 200 rupees'
  },
  {
    id: 'task_compare_oils',
    title: 'Task 5: Compare Two Products and Select One',
    instruction: 'Compare Fortune Sunflower Oil with Saffola Gold Oil and choose the one suited for heart health.',
    localInstruction: {
      hi: 'फॉर्च्यून और सफोला कुकिंग ऑयल की तुलना करें और एक चुनें।',
      kn: 'ಫಾರ್ಚೂನ್ ಮತ್ತು ಸಫೋಲಾ ಎಣ್ಣೆಯನ್ನು ಹೋಲಿಸಿ ಒಂದನ್ನು ಆಯ್ಕೆ ಮಾಡಿ.'
    },
    targetGoalDescription: 'Comparison displayed and either Fortune or Saffola selected.',
    successCondition: (cart) => {
      return cart.some(item => ['prod_oil_sunflower_1l', 'prod_oil_saffola_gold_1l'].includes(item.product.id));
    },
    suggestedPrompt: 'Compare fortune and saffola oil'
  }
];
