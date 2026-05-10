import { apiClient, unwrap } from "./client";

export async function sendEmail(body) {
  const res = await apiClient.post(`/notifications/email`, body);
  return unwrap(res);
}

export async function sendSms(body) {
  const res = await apiClient.post(`/notifications/sms`, body);
  return unwrap(res);
}

export async function sendWhatsApp(body) {
  const res = await apiClient.post(`/notifications/whatsapp`, body);
  return unwrap(res);
}
