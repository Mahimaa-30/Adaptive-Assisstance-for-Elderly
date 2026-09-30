import { UserProfile } from '../types';

export const DEFAULT_USER_PROFILE: UserProfile = {
  id: 'user_elder_01',
  name: 'Shanthamma Gowda',
  salutation: 'Smt.',
  age: 68,
  phone: '+91 98450 12345',
  address: 'Flat 204, Shanthi Apartments, 4th Cross, Malleshwaram',
  landmark: 'Opposite Margosa Tree Park, Near Rama Mandir',
  preferredLanguage: 'en',
  dietaryTags: ['Vegetarian', 'Low Sodium', 'Calcium Rich', 'Senior Friendly'],
  caregiverName: 'Ananya (Daughter)',
  caregiverPhone: '+91 98451 98765',
  frequentlyBoughtProductIds: [
    'prod_milk_nandini_1l',
    'prod_bread_wheat_400g',
    'prod_tea_tata_gold_250g',
    'prod_salt_tata_lite_1kg'
  ]
};
