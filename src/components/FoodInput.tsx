import { useState, useCallback, useRef, useEffect } from 'react';
import { searchFoods } from '../data/foodDatabase';
import type { FoodItem } from '../types';

/**
 * FoodInput component handles user food entry with autocomplete suggestions.
 *
 * Features:
 * - Text parsing for "quantity item" format
 * - Autocomplete dropdown from food database
 * - Error display for invalid inputs
 * - Keyboard navigation support
 */

interface FoodInputProps {
  /** Callback fired when user submits a food entry. Returns error string or null. */
  onAddFood: (input: string) => string | null;
}

export default function FoodInput({ onAddFood }: FoodInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<FoodItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Update autocomplete suggestions as user types
  useEffect(() => {
    const trimmed = inputValue.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Extract the food name part (ignore leading quantity)
    const foodNamePart = trimmed.replace(/^\d+(\.\d+)?\s*/, '');
    if (foodNamePart.length >= 2) {
      const results = searchFoods(foodNamePart).slice(0, 5);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
      setSelectedIndex(-1);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [inputValue]);

  // Close suggestions on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = useCallback(() => {
    const trimmed = inputValue.trim();
    if (!trimmed) {
      setError('Please enter a food item');
      return;
    }

    const result = onAddFood(trimmed);
    if (result) {
      setError(result);
    } else {
      setInputValue('');
      setError(null);
      setShowSuggestions(false);
    }
  }, [inputValue, onAddFood]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          // Select the highlighted suggestion
          selectSuggestion(suggestions[selectedIndex]);
        } else {
          handleSubmit();
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
      }
    },
    [selectedIndex, suggestions, handleSubmit]
  );

  const selectSuggestion = useCallback(
    (food: FoodItem) => {
      // Preserve the quantity prefix if user already typed one
      const quantityMatch = inputValue.match(/^(\d+(\.\d+)?)\s*/);
      const prefix = quantityMatch ? quantityMatch[1] + ' ' : '1 ';
      setInputValue(prefix + food.id);
      setShowSuggestions(false);
      setError(null);
      inputRef.current?.focus();
    },
    [inputValue]
  );

  return (
    <div className="food-input-container" role="search" aria-label="Food entry">
      <div className="food-input-wrapper">
        <div className="input-row">
          <input
            ref={inputRef}
            id="food-input"
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setError(null);
            }}
            onKeyDown={handleKeyDown}
            placeholder='e.g., "2 sandwich" or "apple"'
            className="food-text-input"
            aria-label="Enter food item with quantity"
            aria-describedby={error ? 'food-input-error' : undefined}
            aria-invalid={!!error}
            autoComplete="off"
          />
          <button
            id="add-food-btn"
            onClick={handleSubmit}
            className="add-food-button"
            aria-label="Add food entry"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Add
          </button>
        </div>

        {/* Autocomplete dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="suggestions-dropdown"
            role="listbox"
            aria-label="Food suggestions"
          >
            {suggestions.map((food, index) => (
              <button
                key={food.id}
                className={`suggestion-item ${index === selectedIndex ? 'selected' : ''}`}
                onClick={() => selectSuggestion(food)}
                role="option"
                aria-selected={index === selectedIndex}
              >
                <span className="suggestion-name">{food.name}</span>
                <span className="suggestion-calories">{food.calories} kcal</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p id="food-input-error" className="input-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
