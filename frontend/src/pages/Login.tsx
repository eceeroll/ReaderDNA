import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { loginUser } from "../api/auth";
import { ApiError } from "../lib/api-client";
import { setToken } from "../lib/auth-storage";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { PasswordInput } from "../components/ui/PasswordInput";

function WarningIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </svg>
  );
}

function FieldError({ message }: { message: string }) {
  return (
    <p className="mt-2 flex items-center gap-2 rounded-md bg-error-tint px-3 py-2 text-[13px] text-error">
      <WarningIcon />
      {message}
    </p>
  );
}

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  function clearFieldError(field: string) {
    setFieldErrors((prev) => {
      if (!(field in prev)) return prev;
      const { [field]: _removed, ...rest } = prev;
      return rest;
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFieldErrors({});
    setFormError(null);
    setLoading(true);

    try {
      const response = await loginUser({ email, password });
      setToken(response.token);
      navigate("/");
    } catch (error) {
      if (error instanceof ApiError && error.issues) {
        const errors: Record<string, string> = {};
        for (const issue of error.issues) {
          errors[String(issue.path[0])] = issue.message;
        }
        setFieldErrors(errors);
      } else if (error instanceof ApiError) {
        setFormError(error.message);
      } else {
        setFormError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-page px-4">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/20 blur-3xl"
      />
      <div className="relative w-full max-w-100">
        <div className="mb-8 text-center">
          <p className="font-display text-2xl text-brand">ReaderDNA</p>
          <p className="mt-2 font-accent text-[16px] text-ink-muted">
            Your reading, decoded.
          </p>
        </div>
        <Card className="w-full shadow-md border-transparent">
          <form
          noValidate
          onSubmit={handleSubmit}
          className="flex flex-col gap-6"
        >
          <h1 className="font-display text-ink text-2xl">Welcome back</h1>

          {formError !== null && (
            <p className="bg-error-tint text-error rounded-md p-3">
              {formError}
            </p>
          )}

          <div>
            <label
              htmlFor="email"
              className="mb-2 block font-sans text-[15px] text-ink"
            >
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                clearFieldError("email");
                setEmail(e.target.value);
              }}
              invalid={Boolean(fieldErrors.email)}
            />
            {fieldErrors.email && <FieldError message={fieldErrors.email} />}
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block font-sans text-[15px] text-ink"
            >
              Password
            </label>
            <PasswordInput
              id="password"
              value={password}
              onChange={(e) => {
                clearFieldError("password");
                setPassword(e.target.value);
              }}
              invalid={Boolean(fieldErrors.password)}
            />
            {fieldErrors.password && (
              <FieldError message={fieldErrors.password} />
            )}
          </div>

          <Button
            variant="primary"
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? "Signing in..." : "Sign in"}
          </Button>

          <p className="font-sans text-[15px] text-ink-muted">
            New here?{" "}
            <Link to="/register" className="text-ink">
              Create your account
            </Link>
          </p>
          </form>
        </Card>
      </div>
    </div>
  );
}
