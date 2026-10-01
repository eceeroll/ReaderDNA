import { useEffect, useRef, useState } from "react";
import { Navigate, Outlet } from "react-router";
import { getCurrentUser } from "../../api/auth";
import { ApiError } from "../../lib/api-client";
import { clearToken, getToken, readSessionToken } from "../../lib/auth-storage";
import { Button } from "../ui/Button";
import { FieldError } from "../ui/FieldError";
import { TopNav } from "./TopNav";

function sessionCheckErrorMessage(error: unknown): string {
  return error instanceof ApiError
    ? error.message
    : "Something went wrong. Please try again.";
}

export function AppShell() {
  const token = readSessionToken();
  const [confirmed, setConfirmed] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(() => Boolean(token));
  const sessionCheckActiveRef = useRef(true);

  useEffect(() => {
    const stored = getToken();
    if (stored && readSessionToken() === null) {
      clearToken();
    }
  }, []);

  function loadCurrentUser() {
    getCurrentUser()
      .then(() => {
        if (!sessionCheckActiveRef.current) {
          return;
        }

        setConfirmed(true);
        setLoadError(null);
        setIsChecking(false);
      })
      .catch((error: unknown) => {
        if (!sessionCheckActiveRef.current) {
          return;
        }

        setConfirmed(false);
        setLoadError(sessionCheckErrorMessage(error));
        setIsChecking(false);
      });
  }

  useEffect(() => {
    if (!token) {
      return;
    }

    sessionCheckActiveRef.current = true;
    loadCurrentUser();

    return () => {
      sessionCheckActiveRef.current = false;
    };
  }, [token]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (isChecking) {
    return <p className="text-ink-muted p-8">Loading...</p>;
  }

  if (loadError !== null) {
    return (
      <div className="p-8">
        <div className="max-w-md">
          <FieldError message={loadError} align="start" />
          <Button
            type="button"
            variant="secondary"
            className="mt-3"
            onClick={() => {
              setIsChecking(true);
              setLoadError(null);
              loadCurrentUser();
            }}
          >
            Try again
          </Button>
        </div>
      </div>
    );
  }

  if (!confirmed) {
    return <p className="text-ink-muted p-8">Loading...</p>;
  }

  return (
    <>
      <TopNav />
      <Outlet />
    </>
  );
}
