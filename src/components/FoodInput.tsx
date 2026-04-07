import { useState, useCallback, useRef, useEffect } from 'react';
import { searchFoods } from '../data/foodDatabase';
import type { FoodItem } from '../types';

/**
 * FoodInput Component
 *
 * Zero-friction food entry with:
 * - Natural language parsing ("2 sandwich", "apple")
 * - Autocomplete dropdown from food database
 * - Outside food toggle checkbox
 * - Keyboard navigation (↑/↓/Enter/Esc)
 * - Accessible ARIA attributes
 */

interface FoodInputProps {
  /** Callback when user submits food. Returns error string or null on success. */
  onAddFood: (input: string, isOutsideFood: boolean) => string | null;
}

export default function FoodInput({ onAddFood }: FoodInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [isOutsideFood, setIsOutsideFood] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<FoodItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ─── Autocomplete Logic ──────────────────────────────────────────

  useEffect(() => {
    const trimmed = inputValue.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Extract food name (ignore leading quantity)
    const foodPart = trimmed.replace(/^\d+(\.\d+)?\s*/, '');
    if (foodPart.length >= 2) {
      const results = searchFoods(foodPart).slice(0, 5);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
      setSelectedIndex(-1);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [inputValue]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current && !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // ─── Handlers ────────────────────────────────────────────────────

  const handleSubmit = useCallback(() => {
    const trimmed = inputValue.trim();
    if (!trimmed) {
      setError('Please enter a food item');
      return;
    }

    const result = onAddFood(trimmed, isOutsideFood);
    if (result) {
      setError(result);
    } else {
      setInputValue('');
      setError(null);
      setShowSuggestions(false);
      setIsOutsideFood(false);
    }
  }, [inputValue, isOutsideFood, onAddFood]);

  const selectSuggestion = useCallback(
    (food: FoodItem) => {
      const qtyMatch = inputValue.match(/^(\d+(\.\d+)?)\s*/);
      const prefix = qtyMatch ? qtyMatch[1] + ' ' : '1 ';
      setInputValue(prefix + food.id);
      setShowSuggestions(false);
      setError(null);
      inputRef.current?.focus();
    },
    [inputValue]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          selectSuggestion(suggestions[selectedIndex]);
        } else {
          handleSubmit();
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, -1));
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
      }
    },
    [selectedIndex, suggestions, handleSubmit, selectSuggestion]
  );

  // ─── Render ──────────────────────────────────────────────────────

  return (
    <div className="food-input-container" role="search" aria-label="Food entry">
      {/* Input row */}
      <div className="food-input-wrapper">
        <div className="input-row">
          <input
            ref={inputRef}
            id="food-input"
            type="text"
            value={inputValue}
            onChange={(e) => { setInputValue(e.target.value); setError(null); }}
            onKeyDown={handleKeyDown}
            placeholder='e.g., "2 sandwich" or "apple"'
            className="food-text-input"
            aria-label="Enter food item with quantity"
            aria-invalid={!!error}
            autoComplete="off"
          />
          <button
            id="add-food-btn"
            onClick={handleSubmit}
            className="add-food-button"
            aria-label="Add food entry"
          >
            <span aria-hidden="true">+</span> Add
          </button>
        </div>

        {/* Autocomplete dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div ref={dropdownRef} className="suggestions-dropdown" role="listbox">
            {suggestions.map((food, idx) => (
              <button
                key={food.id}
                className={`suggestion-item ${idx === selectedIndex ? 'selected' : ''}`}
                onClick={() => selectSuggestion(food)}
                role="option"
                aria-selected={idx === selectedIndex}
              >
                <span className="suggestion-name">{food.name}</span>
                <span className="suggestion-cal">{food.calories} kcal</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Outside food toggle */}
      <label className="outside-food-toggle" htmlFor="outside-food-checkbox">
        <input
          id="outside-food-checkbox"
          type="checkbox"
          checked={isOutsideFood}
          onChange={(e) => setIsOutsideFood(e.target.checked)}
          className="outside-food-checkbox"
        />
        <span className="toggle-label">🍔 Outside food</span>
        <span className="toggle-hint">(applies score penalty)</span>
      </label>

      {/* Error message */}
      {error && (
        <p className="input-error" role="alert">{error}</p>
      )}
    </div>
  );
}
