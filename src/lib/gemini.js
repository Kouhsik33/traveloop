const KEY_STORAGE = "traveloop.userGeminiKey.v1";
const MODEL_STORAGE = "traveloop.userGeminiModel.v1";
const DEFAULT_MODEL = "gemini-2.5-flash";

export function getGeminiSettings() {
  return {
    apiKey: localStorage.getItem(KEY_STORAGE) || "",
    model: localStorage.getItem(MODEL_STORAGE) || DEFAULT_MODEL,
  };
}

export function saveGeminiSettings({ apiKey, model = DEFAULT_MODEL }) {
  const nextKey = String(apiKey || "").trim();
  if (nextKey) localStorage.setItem(KEY_STORAGE, nextKey);
  else localStorage.removeItem(KEY_STORAGE);
  localStorage.setItem(MODEL_STORAGE, model || DEFAULT_MODEL);
}

export function maskGeminiKey(key) {
  if (!key) return "No key saved";
  if (key.length <= 10) return `${key.slice(0, 2)}...${key.slice(-2)}`;
  return `${key.slice(0, 6)}...${key.slice(-4)}`;
}

const jsonFromText = (text) => {
  const trimmed = text.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
  return JSON.parse(trimmed);
};

export async function callGeminiText(prompt, { apiKey, model } = getGeminiSettings()) {
  if (!apiKey) {
    const error = new Error("Add your Gemini API key in Profile settings before using AI features.");
    error.code = "MISSING_GEMINI_KEY";
    throw error;
  }

  let response;
  try {
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model || DEFAULT_MODEL)}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.65, responseMimeType: "application/json" },
        }),
      }
    );
  } catch (err) {
    const error = new Error("Gemini could not be reached. Check your connection or try again shortly.");
    error.code = "GEMINI_NETWORK_ERROR";
    error.cause = err;
    throw error;
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const reason = payload?.error?.message || response.statusText;
    const error = new Error(formatGeminiError(response.status, reason));
    error.code = response.status === 400 || response.status === 403 ? "INVALID_GEMINI_KEY" : "GEMINI_ERROR";
    error.status = response.status;
    throw error;
  }

  const payload = await response.json();
  const text = payload?.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("") || "";
  if (!text) throw new Error("Gemini returned an empty response. Please try again.");
  return jsonFromText(text);
}

export async function validateGeminiKey(apiKey, model = DEFAULT_MODEL) {
  const result = await callGeminiText('Return exactly {"ok":true} as JSON.', { apiKey, model });
  return result?.ok === true;
}

export function formatGeminiError(status, reason) {
  if (status === 400 || status === 403) return "Gemini rejected this API key. Check the key in Profile settings and confirm the Generative Language API is enabled.";
  if (status === 429) return "Gemini quota or rate limit reached. Wait a little, switch keys, or reduce requests.";
  if (status >= 500) return "Gemini is temporarily unavailable. Your trip data is safe; try again shortly.";
  return `Gemini request failed: ${reason}`;
}

export function isTemporaryGeminiFailure(err) {
  if (!(err instanceof Error)) return false;
  return err.status >= 500 || err.code === "GEMINI_NETWORK_ERROR";
}

export function buildItineraryPrompt(body) {
  return `Create a practical India-friendly travel itinerary as JSON only.
Schema: {"stops":[{"city":"string","country":"string","days":number,"estimatedCostUsd":number,"activities":[{"name":"string","category":"string","costUsd":number,"durationHours":number}]}]}
Use realistic routing, hidden gems, and local context. Keep all numeric cost fields in INR, even though the API field names still end in Usd for legacy compatibility.
Request: ${JSON.stringify(body)}`;
}

export function buildPackingPrompt(body) {
  return `Create a packing checklist as JSON only.
Schema: [{"category":"string","items":["string"]}]
Use the traveller context, season, trip type, and destination. Request: ${JSON.stringify(body)}`;
}

export function buildBudgetPrompt(body) {
  return `Estimate a travel budget as JSON only.
Schema: {"cityId":"string","cityName":"string","perDayUsd":number,"accommodationUsd":number,"foodUsd":number,"activitiesUsd":number}
Use INR numeric fields, even though the API field names still end in Usd for legacy compatibility. Include transport, hotel, food, activities, shopping, miscellaneous, and emergency buffer in the per-day reasoning.
Request: ${JSON.stringify(body)}`;
}
