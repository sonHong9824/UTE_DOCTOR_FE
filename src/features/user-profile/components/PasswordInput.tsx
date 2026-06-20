"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { CircleAlert, Eye, EyeOff, type LucideIcon } from "lucide-react";
import { useState } from "react";

interface PasswordInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  icon?: LucideIcon;
  placeholder?: string;
  autoComplete?: string;
  helperText?: string;
  error?: string;
}

// Password field with a local-only show/hide toggle and helper/error text.
// State here is purely visual — it never alters the submitted value.
export default function PasswordInput({
  id,
  label,
  value,
  onChange,
  icon: Icon,
  placeholder,
  autoComplete,
  helperText,
  error,
}: PasswordInputProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="space-y-1.5">
      <Label
        htmlFor={id}
        className="text-sm font-medium text-slate-700 dark:text-slate-200"
      >
        {Icon ? <Icon className="h-3.5 w-3.5 text-sky-500" /> : null}
        {label}
      </Label>

      <div className="relative">
        <Input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={Boolean(error)}
          className={cn(
            "h-11 rounded-xl pr-11 transition-all duration-200",
            "focus-visible:border-sky-500 focus-visible:ring-sky-500/30",
            error &&
              "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/30"
          )}
        />
        <button
          type="button"
          onClick={() => setShow((prev) => !prev)}
          aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          tabIndex={-1}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>

      {error ? (
        <p className="flex items-center gap-1.5 text-xs font-medium text-destructive">
          <CircleAlert className="h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      ) : helperText ? (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      ) : null}
    </div>
  );
}
