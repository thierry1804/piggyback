import React from 'react';
import { cn } from '@/lib/utils';

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: number | string; // Value in cents or empty string
  onChange: (value: number | "") => void;
  label?: string;
  error?: string;
}

export function CurrencyInput({ value, onChange, className, label, error, ...props }: CurrencyInputProps) {
  // Convert cents to string for display (1234 -> "12.34")
  const displayValue = value === "" ? "" : (Number(value) / 100).toString();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    
    // Allow empty
    if (val === "") {
      onChange("");
      return;
    }

    // Regex to allow only numbers and up to 2 decimal places
    if (/^\d*\.?\d{0,2}$/.test(val)) {
      // Convert back to cents for parent (12.34 -> 1234)
      const cents = Math.round(parseFloat(val) * 100);
      onChange(cents);
    }
  };

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="text-sm font-medium text-foreground/80 font-display">
          {label}
        </label>
      )}
      <div className="relative group">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold group-focus-within:text-primary transition-colors">
          {props.placeholder?.includes('Ar') ? 'Ar' : '$'}
        </span>
        <input
          type="number"
          step="0.01"
          min="0"
          value={displayValue}
          onChange={handleChange}
          className={cn(
            "w-full pl-8 pr-4 py-3 rounded-xl",
            "bg-background border-2 border-border/50",
            "text-lg font-medium text-foreground",
            "placeholder:text-muted-foreground/50",
            "focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10",
            "transition-all duration-200",
            error && "border-destructive focus:border-destructive focus:ring-destructive/10",
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-sm text-destructive font-medium">{error}</p>}
    </div>
  );
}
