import { useState, type FormEvent } from "react";
import { Link } from "react-router";
import { registerUser } from "../api/auth";
import { ApiError } from "../lib/api-client";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { FieldError } from "../components/ui/FieldError";
import { Input } from "../components/ui/Input";
import { PasswordInput } from "../components/ui/PasswordInput";

function SuccessIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12l3 3 5-6" />
    </svg>
  );
}

export function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [registered, setRegistered] = useState(false);

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

    if (password !== confirmPassword) {
      setFieldErrors({ confirmPassword: "Passwords do not match" });
      setLoading(false);
      return;
    }

    try {
      await registerUser({ email, password });
      setRegistered(true);
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
          {registered ? (
          <div className="flex flex-col gap-6">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success-tint text-success">
              <SuccessIcon />
            </div>
            <div>
              <h1 className="font-display text-2xl text-ink">
                Account created!
              </h1>
              <p className="mt-2 font-sans text-[15px] text-ink-muted">
                Registration was successful. You can now sign in to start
                building your library.
              </p>
            </div>
            <Link to="/login" className="w-full">
              <Button variant="primary" type="button" className="w-full">
                Sign in
              </Button>
            </Link>
          </div>
        ) : (
          <form
            noValidate
            onSubmit={handleSubmit}
            className="flex flex-col gap-6"
          >
            <h1 className="font-display text-ink text-2xl">
              Create your account
            </h1>

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
              {fieldErrors.email && (
                <FieldError className="mt-2" message={fieldErrors.email} />
              )}
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
                  clearFieldError("confirmPassword");
                  setPassword(e.target.value);
                }}
                invalid={Boolean(fieldErrors.password)}
              />
              {fieldErrors.password && (
                <FieldError className="mt-2" message={fieldErrors.password} />
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block font-sans text-[15px] text-ink"
              >
                Confirm password
              </label>
              <PasswordInput
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => {
                  clearFieldError("confirmPassword");
                  setConfirmPassword(e.target.value);
                }}
                invalid={Boolean(fieldErrors.confirmPassword)}
              />
              {fieldErrors.confirmPassword && (
                <FieldError className="mt-2" message={fieldErrors.confirmPassword} />
              )}
            </div>

            <Button
              variant="primary"
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? "Creating account..." : "Register"}
            </Button>
          </form>
          )}
        </Card>
      </div>
    </div>
  );
}
