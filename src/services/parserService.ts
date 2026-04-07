import type { ParsedFoodInput } from '../types';

/**
 * Parser Service
 *
 * Responsible for interpreting raw user input strings into structured data.
 * Handles formats like "2 sandwich", "1 apple", "banana", etc.
 */

/** Pattern: quantity (optional, defaults to 1) followed by food name */
const QUANTITY_ITEM_PATTERN = /^\s*(\d+(?:\.\d+)?)\s+(.+)\s*$/;
const NAME_ONLY_PATTERN = /^\s*([a-zA-Z\s]+)\s*$/;

/** Maximum reasonable quantity to prevent input abuse */
const MAX_QUANTITY = 100;

/**
 * Parse a raw user input string into a structured ParsedFoodInput.
 *
 * Supported formats:
 * - "2 sandwich"   → { quantity: 2, itemName: "sandwich" }
 * - "apple"        → { quantity: 1, itemName: "apple" }
 * - "1.5 rice"     → { quantity: 1.5, itemName: "rice" }
 *
 * @param input - Raw user input string
 * @returns ParsedFoodInput or null if input is invalid
 */
export function parseFoodInput(input: string): ParsedFoodInput | null {
  if (!input || typeof input !== 'string') return null;

  const trimmed = input.trim().toLowerCase();
  if (trimmed.length === 0) return null;

  // Try "quantity item" format first
  const quantityMatch = trimmed.match(QUANTITY_ITEM_PATTERN);
  if (quantityMatch) {
    const quantity = parseFloat(quantityMatch[1]);
    const itemName = normalizeName(quantityMatch[2]);

    if (!isValidQuantity(quantity) || !isValidName(itemName)) return null;
    return { quantity, itemName };
  }

  // Try name-only format (defaults to quantity 1)
  const nameMatch = trimmed.match(NAME_ONLY_PATTERN);
  if (nameMatch) {
    const itemName = normalizeName(nameMatch[1]);
    if (!isValidName(itemName)) return null;
    return { quantity: 1, itemName };
  }

  return null;
}

/**
 * Normalize a food item name: trim, lowercase, and handle common plurals.
 */
function normalizeName(name: string): string {
  let normalized = name.trim().toLowerCase();

  // Words that should keep their plural form (they're database IDs)
  const keepPlural = new Set(['fries', 'grapes', 'noodles', 'lentils', 'chips', 'momos']);
  if (keepPlural.has(normalized)) return normalized;

  // Simple plural → singular rules
  const pluralRules: [RegExp, string][] = [
    [/ches$/, 'ch'],    // sandwiches → sandwich
    [/shes$/, 'sh'],
    [/ses$/, 'se'],
    [/ies$/, 'y'],
    [/s$/, ''],          // apples → apple
  ];

  for (const [pattern, replacement] of pluralRules) {
    if (pattern.test(normalized) && normalized.length > 3) {
      normalized = normalized.replace(pattern, replacement);
      break;
    }
  }

  return normalized;
}

/** Validate quantity is positive, finite, and within bounds */
function isValidQuantity(q: number): boolean {
  return Number.isFinite(q) && q > 0 && q <= MAX_QUANTITY;
}

/** Validate item name is non-empty and reasonable length */
function isValidName(name: string): boolean {
  return name.length > 0 && name.length <= 50;
}

/**
 * Get a user-facing validation error message.
 * @returns Error string or null if input is valid
 */
export function getInputValidationError(input: string): string | null {
  if (!input || input.trim().length === 0) {
    return 'Please enter a food item (e.g., "2 sandwich" or "apple")';
  }

  const parsed = parseFoodInput(input);
  if (!parsed) {
    return 'Invalid format. Try: "2 sandwich" or "apple"';
  }

  return null;
}
