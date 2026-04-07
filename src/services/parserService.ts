import type { ParsedFoodInput } from '../types';

/**
 * Parser service responsible for interpreting user food input strings.
 * Handles formats like "2 sandwich", "1 apple", "3 roti", etc.
 */

/** Regex pattern: optional quantity (defaults to 1) followed by food name */
const INPUT_PATTERN = /^\s*(\d+(?:\.\d+)?)\s+(.+)\s*$/;
const NAME_ONLY_PATTERN = /^\s*([a-zA-Z\s]+)\s*$/;

/**
 * Parse a raw user input string into a structured ParsedFoodInput.
 *
 * Supported formats:
 * - "2 sandwich"   → { quantity: 2, itemName: "sandwich" }
 * - "apple"        → { quantity: 1, itemName: "apple" }
 * - "0.5 rice"     → { quantity: 0.5, itemName: "rice" }
 *
 * @param input - Raw user input string
 * @returns ParsedFoodInput or null if input is invalid
 */
export function parseFoodInput(input: string): ParsedFoodInput | null {
  if (!input || typeof input !== 'string') {
    return null;
  }

  const trimmed = input.trim().toLowerCase();
  if (trimmed.length === 0) {
    return null;
  }

  // Try matching "quantity item" pattern first
  const quantityMatch = trimmed.match(INPUT_PATTERN);
  if (quantityMatch) {
    const quantity = parseFloat(quantityMatch[1]);
    const itemName = normalizeItemName(quantityMatch[2]);

    if (!isValidQuantity(quantity) || !isValidItemName(itemName)) {
      return null;
    }

    return { quantity, itemName };
  }

  // Try matching name-only pattern (quantity defaults to 1)
  const nameMatch = trimmed.match(NAME_ONLY_PATTERN);
  if (nameMatch) {
    const itemName = normalizeItemName(nameMatch[1]);

    if (!isValidItemName(itemName)) {
      return null;
    }

    return { quantity: 1, itemName };
  }

  return null;
}

/**
 * Normalize a food item name by trimming, lowercasing,
 * and converting plurals to singular where applicable.
 */
function normalizeItemName(name: string): string {
  let normalized = name.trim().toLowerCase();

  // Simple plural-to-singular conversion for common suffixes
  const pluralRules: [RegExp, string][] = [
    [/ies$/, 'y'],       // e.g., "fries" is kept as-is via specific check
    [/ches$/, 'ch'],     // e.g., "sandwiches" → "sandwich"
    [/shes$/, 'sh'],
    [/ses$/, 'se'],
    [/s$/, ''],          // general plural removal
  ];

  // Don't de-pluralize certain words
  const keepPlural = ['fries', 'grapes', 'noodles', 'lentils', 'chips', 'momos'];
  if (keepPlural.includes(normalized)) {
    return normalized;
  }

  for (const [pattern, replacement] of pluralRules) {
    if (pattern.test(normalized) && normalized.length > 3) {
      normalized = normalized.replace(pattern, replacement);
      break;
    }
  }

  return normalized;
}

/** Validate that the quantity is a positive finite number */
function isValidQuantity(quantity: number): boolean {
  return Number.isFinite(quantity) && quantity > 0 && quantity <= 100;
}

/** Validate that the item name is non-empty and reasonable */
function isValidItemName(name: string): boolean {
  return name.length > 0 && name.length <= 50;
}

/**
 * Generate a validation error message for invalid input.
 * @returns Human-readable error message or null if input is valid
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
