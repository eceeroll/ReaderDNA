import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router";
import { getCurrentUser } from "../../api/auth";
import { clearToken, getToken, readSessionToken } from "../../lib/auth-storage";
import { TopNav } from "./TopNav";

export function AppShell() {
  const token = readSessionToken();
  const [confirmed, setConfirmed] = useState(false);
  const [rejected, setRejected] = useState(false);

  useEffect(() => {
    const stored = getToken();
    if (stored && readSessionToken() === null) {
      clearToken();
    }
  }, []);

  useEffect(() => {
    if (!token) {
      return;
    }

    let active = true;

    getCurrentUser()
      .then(() => {
        if (active) setConfirmed(true);
      })
      .catch(() => {
        if (active) setRejected(true);
      });

    return () => {
      active = false;
    };
  }, [token]);

  if (!token || rejected) {
    return <Navigate to="/login" replace />;
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
