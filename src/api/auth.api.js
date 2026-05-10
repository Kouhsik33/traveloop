import { apiClient, unwrap } from "./client";

export async function login(body) {
  const res = await apiClient.post(`/auth/login`, body);
  return unwrap(res).user;
}

export async function register(body) {
  const res = await apiClient.post(`/auth/register`, body);
  return unwrap(res).user;
}

export async function logout() {
  await apiClient.post(`/auth/logout`);
}

export async function getMe() {
  const res = await apiClient.get(`/auth/me`);
  return unwrap(res).user;
}

export async function forgotPassword(email) {
  const res = await apiClient.post(`/auth/forgot-password`, { email });
  return unwrap(res);
}

export async function resetPassword(body) {
  const res = await apiClient.post(`/auth/reset-password`, body);
  return unwrap(res);
}
