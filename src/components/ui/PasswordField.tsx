"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type PasswordFieldProps = {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  minLength?: number;
  autoComplete?: string;
};

export default function PasswordField({
  value,
  onChange,
  placeholder = "Mot de passe",
  minLength,
  autoComplete = "current-password",
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        className="input pr-12"
        placeholder={placeholder}
        value={value}
        minLength={minLength}
        autoComplete={autoComplete}
        required
        onChange={(event) => onChange(event.target.value)}
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
        className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1.5 text-muted transition hover:bg-fg/10 hover:text-fg"
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}
