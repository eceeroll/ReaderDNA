import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";
import { Input, type InputProps } from "./Input";

export type PasswordInputProps = Omit<InputProps, "type">;

export function PasswordInput({ className, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        {...props}
        type={visible ? "text" : "password"}
        className={clsx("pr-12", className)}
      />
      <button
        type="button"
        className="absolute inset-y-0 right-0 flex items-center px-4 text-ink-muted transition-colors duration-250 ease-standard hover:text-ink"
        aria-label={visible ? "Hide password" : "Show password"}
        onClick={() => setVisible((current) => !current)}
      >
        {visible ? (
          <EyeOff size={16} strokeWidth={1.75} aria-hidden />
        ) : (
          <Eye size={16} strokeWidth={1.75} aria-hidden />
        )}
      </button>
    </div>
  );
}
