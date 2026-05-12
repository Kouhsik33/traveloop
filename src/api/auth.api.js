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

export async function updateProfile(body) {
  const res = await apiClient.put(`/auth/profile`, body);
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

export async function deleteAccount(otp) {
  const res = await apiClient.delete(`/users/delete-account`, { data: { otp } });
  return unwrap(res);
}

export async function requestDeleteAccountOtp() {
  const res = await apiClient.post(`/users/delete-account/request-otp`, {});
  return unwrap(res);
}

export async function requestProfileVerificationOtp(body) {
  const res = await apiClient.post(`/users/profile-verification/request-otp`, body);
  return unwrap(res);
}

export async function verifyProfileOtp(body) {
  const res = await apiClient.post(`/users/profile-verification/verify`, body);
  return unwrap(res);
}
