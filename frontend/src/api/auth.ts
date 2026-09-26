import { api } from "../lib/api-client";

export type LoginResponse = {
  message: string;
  token: string;
};

export type RegisterResponse = {
  id: number;
  email: string;
  createdAt: string;
};

export async function registerUser(data: {
  email: string;
  password: string;
}): Promise<RegisterResponse> {
  const response = await api.post<RegisterResponse>("/auth/register", data);
  return response.data;
}

export async function loginUser(data: {
  email: string;
  password: string;
}): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>("/auth/login", data);
  return response.data;
}

export async function getCurrentUser(): Promise<void> {
  await api.get("/auth/me");
}
