export function getCityFromTitle(title) {
  const value = String(title || "");
  if (value.includes("Goa")) return "Goa";
  if (value.includes("Gokarna")) return "Gokarna";
  return "default";
}
