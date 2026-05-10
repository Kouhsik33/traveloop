import { buildBudgetPrompt, buildItineraryPrompt, buildPackingPrompt, callGeminiText } from "@/lib/gemini";

export async function generateItinerary(body) {
    return callGeminiText(buildItineraryPrompt(body));
}
export async function generatePackingList(body) {
    return callGeminiText(buildPackingPrompt(body));
}
export async function estimateBudget(body) {
    return callGeminiText(buildBudgetPrompt(body));
}
