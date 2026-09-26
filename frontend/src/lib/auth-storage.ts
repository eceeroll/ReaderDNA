const TOKEN_KEY = "auth_token";

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split(".");
  if (parts.length !== 3 || parts.some((part) => part.length === 0)) {
    return null;
  }

  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "=",
    );
    const payload: unknown = JSON.parse(atob(padded));

    if (typeof payload !== "object" || payload === null) {
      return null;
    }

    return payload as Record<string, unknown>;
  } catch {
    return null;
  }
}

function isUsableJwt(token: string): boolean {
  const payload = decodeJwtPayload(token);

  if (
    !payload ||
    typeof payload.userId !== "number" ||
    typeof payload.email !== "string" ||
    typeof payload.exp !== "number"
  ) {
    return false;
  }

  return payload.exp * 1000 > Date.now();
}

export function readSessionToken(): string | null {
  const token = getToken();

  if (!token || !isUsableJwt(token)) {
    return null;
  }

  return token;
}

export function setToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export function clearToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error(error);
  }
}
