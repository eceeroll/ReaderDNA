import axios, { AxiosError } from "axios";
import { getToken } from "./auth-storage";

const baseURL = import.meta.env.VITE_API_URL;

if (!baseURL) {
  throw new Error("VITE_API_URL is not defined");
}

export type ApiFieldIssue = {
  path: (string | number)[];
  message: string;
};

export class ApiError extends Error {
  readonly status: number;
  readonly issues?: ApiFieldIssue[];

  constructor(status: number, message: string, issues?: ApiFieldIssue[]) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.issues = issues;
  }
}

type BackendErrorBody = {
  message: string;
  issues?: unknown;
};

function isBackendErrorBody(data: unknown): data is BackendErrorBody {
  return (
    typeof data === "object" &&
    data !== null &&
    "message" in data &&
    typeof (data as { message: unknown }).message === "string"
  );
}

function isApiFieldIssueArray(value: unknown): value is ApiFieldIssue[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        "path" in item &&
        "message" in item &&
        Array.isArray((item as { path: unknown }).path) &&
        typeof (item as { message: unknown }).message === "string",
    )
  );
}

function toApiError(error: unknown): ApiError {
  if (error instanceof AxiosError) {
    if (!error.response) {
      return new ApiError(0, "Unable to reach the server");
    }

    const { status, data } = error.response;

    if (isBackendErrorBody(data)) {
      const issues = isApiFieldIssueArray(data.issues)
        ? data.issues
        : undefined;
      return new ApiError(status, data.message, issues);
    }

    return new ApiError(status, "Request failed");
  }

  if (error instanceof Error) {
    return new ApiError(0, error.message);
  }

  return new ApiError(0, "Request failed");
}

export const api = axios.create({
  baseURL,
  headers: { Accept: "application/json" },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(toApiError(error)),
);
