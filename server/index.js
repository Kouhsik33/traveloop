import cors from "cors";
import "dotenv/config";
import express from "express";

const app = express();
const port = Number(process.env.PORT || 5000);
const accessKey = process.env.UNSPLASH_ACCESS_KEY;
const frontendOrigin = process.env.FRONTEND_URL || "http://localhost:5173";
const cache = new Map();
const cacheTtlMs = 1000 * 60 * 60 * 12;

const fallbackImages = {
  Goa: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1080&q=80",
  Gokarna: "https://images.unsplash.com/photo-1593693411515-c20261bcad6e?auto=format&fit=crop&w=1080&q=80",
  default: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1080&q=80",
};

const cityKeywordMap = {
  Goa: "beach tropical travel",
  Gokarna: "coastal beach mountains",
};

function normalizeCity(city) {
  const value = String(city || "").trim();
  if (/goa/i.test(value)) return "Goa";
  if (/gokarna/i.test(value)) return "Gokarna";
  return value || "default";
}

function fallbackPayload(city) {
  const normalizedCity = normalizeCity(city);
  return {
    city: normalizedCity,
    imageUrl: fallbackImages[normalizedCity] || fallbackImages.default,
    smallImageUrl: fallbackImages[normalizedCity] || fallbackImages.default,
    alt: `${normalizedCity} travel destination`,
    photographerName: null,
    photographerUrl: null,
    unsplashUrl: null,
    source: "fallback",
  };
}

app.use(cors({ origin: frontendOrigin, credentials: true }));

app.get("/api/city-image", async (req, res) => {
  const city = normalizeCity(req.query.city);
  if (!city || city === "default") {
    return res.status(400).json({ error: "A supported city query is required" });
  }

  const cached = cache.get(city);
  if (cached && cached.expiresAt > Date.now()) {
    return res.json(cached.payload);
  }

  if (!accessKey) {
    const payload = fallbackPayload(city);
    cache.set(city, { payload, expiresAt: Date.now() + cacheTtlMs });
    return res.json(payload);
  }

  const keywords = cityKeywordMap[city] || `${city} travel`;
  const params = new URLSearchParams({
    query: `${city} ${keywords}`,
    orientation: "landscape",
    per_page: "1",
    content_filter: "high",
  });

  try {
    const response = await fetch(`https://api.unsplash.com/search/photos?${params.toString()}`, {
      headers: {
        Authorization: `Client-ID ${accessKey}`,
        "Accept-Version": "v1",
      },
    });

    if (!response.ok) {
      return res.json(fallbackPayload(city));
    }

    const data = await response.json();
    const photo = data.results?.[0];
    if (!photo) {
      return res.json(fallbackPayload(city));
    }

    const trackingParams = "?utm_source=travel_loop&utm_medium=referral";
    const payload = {
      city,
      imageUrl: photo.urls.regular,
      smallImageUrl: photo.urls.small,
      alt: photo.alt_description || `${city} travel destination`,
      photographerName: photo.user?.name || null,
      photographerUrl: photo.user?.links?.html ? `${photo.user.links.html}${trackingParams}` : null,
      unsplashUrl: photo.links?.html ? `${photo.links.html}${trackingParams}` : null,
      source: "unsplash",
    };

    cache.set(city, { payload, expiresAt: Date.now() + cacheTtlMs });
    return res.json(payload);
  } catch {
    return res.json(fallbackPayload(city));
  }
});

app.listen(port, () => {
  console.log(`Travel-Loop image proxy running on http://localhost:${port}`);
});
