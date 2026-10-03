"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface MoneyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type"> {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function MoneyInput({
  id,
  value,
  onChange,
  placeholder = "0,00",
  className,
  autoFocus,
  ...rest
}: MoneyInputProps) {
  return (
    <div className={cn("money-input-shell", className)}>
      <span>€</span>
      <input
        id={id}
        type="text"
        inputMode="decimal"
        value={value}
        autoFocus={autoFocus}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        {...rest}
      />
    </div>
  );
}
