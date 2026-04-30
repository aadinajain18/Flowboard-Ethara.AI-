import { useMemo } from "react";

interface PasswordStrengthProps {
  password: string;
}

function getStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: "Weak", color: "#C75050" };
  if (score <= 2) return { score, label: "Fair", color: "#f97316" };
  if (score <= 3) return { score, label: "Good", color: "#D4A84B" };
  if (score <= 4) return { score, label: "Strong", color: "#7CB87C" };
  return { score, label: "Very Strong", color: "#5A9A5A" };
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const strength = useMemo(() => getStrength(password), [password]);

  if (!password) return null;

  return (
    <div className="mt-2 space-y-1.5">
      {/* Strength bar */}
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{
              backgroundColor:
                i < strength.score ? strength.color : "rgba(238,229,218,0.08)",
            }}
          />
        ))}
      </div>
      {/* Label */}
      <p
        className="text-[11px] font-medium transition-colors duration-300"
        style={{ color: strength.color }}
      >
        {strength.label}
      </p>
    </div>
  );
}
