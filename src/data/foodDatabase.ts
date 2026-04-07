import type { FoodItem } from '../types';

/**
 * Structured food database with nutritional information per serving.
 * Values are approximate and based on common serving sizes.
 * Each entry uses a lowercase singular key for consistent lookup.
 */
export const FOOD_DATABASE: ReadonlyArray<FoodItem> = [
  // Grains
  { id: 'rice', name: 'Rice (1 cup)', calories: 206, protein: 4.3, carbs: 45, fats: 0.4, category: 'grain' },
  { id: 'bread', name: 'Bread (1 slice)', calories: 79, protein: 2.7, carbs: 15, fats: 1, category: 'grain' },
  { id: 'sandwich', name: 'Sandwich', calories: 300, protein: 12, carbs: 36, fats: 12, category: 'grain' },
  { id: 'roti', name: 'Roti', calories: 120, protein: 3, carbs: 20, fats: 3.5, category: 'grain' },
  { id: 'chapati', name: 'Chapati', calories: 120, protein: 3, carbs: 20, fats: 3.5, category: 'grain' },
  { id: 'pasta', name: 'Pasta (1 cup)', calories: 220, protein: 8, carbs: 43, fats: 1.3, category: 'grain' },
  { id: 'oatmeal', name: 'Oatmeal (1 cup)', calories: 154, protein: 5, carbs: 27, fats: 2.6, category: 'grain' },
  { id: 'noodles', name: 'Noodles (1 cup)', calories: 219, protein: 7, carbs: 40, fats: 3.3, category: 'grain' },

  // Protein
  { id: 'egg', name: 'Egg', calories: 78, protein: 6, carbs: 0.6, fats: 5, category: 'protein' },
  { id: 'chicken', name: 'Chicken Breast (100g)', calories: 165, protein: 31, carbs: 0, fats: 3.6, category: 'protein' },
  { id: 'fish', name: 'Fish Fillet (100g)', calories: 136, protein: 20, carbs: 0, fats: 5.8, category: 'protein' },
  { id: 'paneer', name: 'Paneer (100g)', calories: 265, protein: 18, carbs: 1.2, fats: 21, category: 'protein' },
  { id: 'tofu', name: 'Tofu (100g)', calories: 76, protein: 8, carbs: 1.9, fats: 4.8, category: 'protein' },
  { id: 'dal', name: 'Dal (1 cup)', calories: 198, protein: 14, carbs: 34, fats: 0.8, category: 'protein' },
  { id: 'lentils', name: 'Lentils (1 cup)', calories: 230, protein: 18, carbs: 40, fats: 0.8, category: 'protein' },

  // Dairy
  { id: 'milk', name: 'Milk (1 glass)', calories: 149, protein: 8, carbs: 12, fats: 8, category: 'dairy' },
  { id: 'yogurt', name: 'Yogurt (1 cup)', calories: 100, protein: 17, carbs: 6, fats: 0.7, category: 'dairy' },
  { id: 'cheese', name: 'Cheese (1 slice)', calories: 113, protein: 7, carbs: 0.4, fats: 9, category: 'dairy' },
  { id: 'curd', name: 'Curd (1 cup)', calories: 98, protein: 11, carbs: 4, fats: 4.3, category: 'dairy' },
  { id: 'buttermilk', name: 'Buttermilk (1 glass)', calories: 40, protein: 3.3, carbs: 4.8, fats: 0.9, category: 'dairy' },

  // Fruits
  { id: 'apple', name: 'Apple', calories: 95, protein: 0.5, carbs: 25, fats: 0.3, category: 'fruit' },
  { id: 'banana', name: 'Banana', calories: 105, protein: 1.3, carbs: 27, fats: 0.4, category: 'fruit' },
  { id: 'orange', name: 'Orange', calories: 62, protein: 1.2, carbs: 15.4, fats: 0.2, category: 'fruit' },
  { id: 'mango', name: 'Mango', calories: 99, protein: 1.4, carbs: 25, fats: 0.6, category: 'fruit' },
  { id: 'grapes', name: 'Grapes (1 cup)', calories: 104, protein: 1.1, carbs: 27, fats: 0.2, category: 'fruit' },

  // Vegetables
  { id: 'salad', name: 'Salad (1 bowl)', calories: 65, protein: 2.5, carbs: 12, fats: 0.7, category: 'vegetable' },
  { id: 'sabzi', name: 'Sabzi / Vegetable Curry', calories: 150, protein: 4, carbs: 18, fats: 7, category: 'vegetable' },
  { id: 'broccoli', name: 'Broccoli (1 cup)', calories: 55, protein: 3.7, carbs: 11, fats: 0.6, category: 'vegetable' },
  { id: 'spinach', name: 'Spinach (1 cup)', calories: 23, protein: 2.9, carbs: 3.6, fats: 0.4, category: 'vegetable' },
  { id: 'carrot', name: 'Carrot', calories: 41, protein: 0.9, carbs: 10, fats: 0.2, category: 'vegetable' },

  // Snacks & Outside Food
  { id: 'chips', name: 'Chips (1 bag)', calories: 274, protein: 3, carbs: 25, fats: 18, category: 'snack' },
  { id: 'biscuit', name: 'Biscuit', calories: 50, protein: 0.6, carbs: 7, fats: 2, category: 'snack' },
  { id: 'cookie', name: 'Cookie', calories: 72, protein: 0.9, carbs: 9.6, fats: 3.4, category: 'snack' },
  { id: 'samosa', name: 'Samosa', calories: 262, protein: 4, carbs: 28, fats: 15, category: 'outside' },
  { id: 'burger', name: 'Burger', calories: 354, protein: 17, carbs: 29, fats: 19, category: 'outside' },
  { id: 'pizza', name: 'Pizza (1 slice)', calories: 285, protein: 12, carbs: 36, fats: 10, category: 'outside' },
  { id: 'fries', name: 'French Fries', calories: 312, protein: 3.4, carbs: 41, fats: 15, category: 'outside' },
  { id: 'biryani', name: 'Biryani (1 plate)', calories: 490, protein: 18, carbs: 55, fats: 22, category: 'outside' },
  { id: 'momos', name: 'Momos (6 pcs)', calories: 210, protein: 8, carbs: 24, fats: 9, category: 'outside' },

  // Beverages
  { id: 'tea', name: 'Tea (1 cup)', calories: 30, protein: 0.5, carbs: 6, fats: 0.5, category: 'beverage' },
  { id: 'coffee', name: 'Coffee (1 cup)', calories: 50, protein: 1, carbs: 6, fats: 2, category: 'beverage' },
  { id: 'juice', name: 'Juice (1 glass)', calories: 110, protein: 1, carbs: 26, fats: 0.3, category: 'beverage' },
  { id: 'cola', name: 'Cola (1 can)', calories: 140, protein: 0, carbs: 39, fats: 0, category: 'beverage' },
  { id: 'smoothie', name: 'Smoothie (1 glass)', calories: 160, protein: 4, carbs: 32, fats: 2, category: 'beverage' },
  { id: 'water', name: 'Water', calories: 0, protein: 0, carbs: 0, fats: 0, category: 'beverage' },
] as const;

/**
 * Lookup map for O(1) food item retrieval by ID.
 * Generated once at module load for performance.
 */
export const FOOD_LOOKUP: ReadonlyMap<string, FoodItem> = new Map(
  FOOD_DATABASE.map((item) => [item.id, item])
);

/** Get all unique food category names */
export const FOOD_CATEGORIES = [...new Set(FOOD_DATABASE.map((f) => f.category))];

/** Search foods by partial name match */
export function searchFoods(query: string): FoodItem[] {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) return [];

  return FOOD_DATABASE.filter(
    (item) =>
      item.id.includes(normalizedQuery) ||
      item.name.toLowerCase().includes(normalizedQuery)
  );
}
