import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Bot, Sparkles, MapPin, Key, Eye, EyeOff, CheckCircle } from "lucide-react";

/* ── Gemini direct-call helper ────────────────────────── */
const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const SYSTEM_PROMPT = `You are TravelBot, the friendly AI travel assistant for Traveloop — an Indian travel planning platform.
You help travelers plan trips across India and the world. Keep replies concise (2–4 short paragraphs or bullet points max).
Use emojis sparingly but naturally. Focus on: destinations, itineraries, budget tips, hidden gems, food, transport, safety.
Always end with a helpful follow-up question or tip to keep the conversation going.`;

async function callGemini(apiKey, history, userMessage) {
  const contents = [
    ...history.map((m) => ({
      role: m.role === "bot" ? "model" : "user",
      parts: [{ text: m.text }],
    })),
    { role: "user", parts: [{ text: userMessage }] },
  ];

  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents,
      generationConfig: { maxOutputTokens: 512, temperature: 0.7 },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Gemini error ${res.status}`);
  }
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "Sorry, I couldn't generate a reply.";
}

/* ── Fallback knowledge base (no API key) ─────────────── */
const BOT_RESPONSES = {
  budget: [
    "💰 **Top budget travel tips:**\n• Book trains 90 days ahead on IRCTC\n• Stay in hostels or OYO Rooms (₹400–800/night)\n• Eat at local dhabas (₹50–150/meal)\n• Travel mid-week — flights are 30% cheaper\n• Use state RTC buses between nearby cities",
    "Budget hack: A comfortable India trip can cost ₹1,200–2,000/day including stay, food & transport. The trick is mixing trains with local buses! 🚌",
  ],
  india: [
    "🇮🇳 **Must-visit places in India:**\n• **North:** Leh–Ladakh, Spiti Valley, Shimla, Rishikesh\n• **West:** Goa, Jaipur, Jodhpur, Udaipur\n• **South:** Munnar, Coorg, Hampi, Pondicherry\n• **East:** Darjeeling, Meghalaya, Majuli Island\n• **Hidden:** Ziro Valley, Tawang, Chopta, Gokarna",
  ],
  hidden: [
    "💎 **Offbeat gems in India:**\n• **Sandakphu, WB** — Views of 4 of the world's 5 highest peaks\n• **Ziro Valley, Arunachal** — UNESCO tentative list, zero tourists\n• **Chopta, Uttarakhand** — Mini Switzerland, trek to Tungnath temple\n• **Mandu, MP** — Abandoned Afghan-style fort city\n• **Gokarna, Karnataka** — Goa vibes, half the crowd",
  ],
  season: [
    "🌤️ **Best time to travel:**\n• **Oct–Feb:** Rajasthan, South India, Goa (peak season)\n• **Mar–May:** Himachal, before monsoon rains\n• **May–Jun:** Ladakh opens — best for bikes & trekking\n• **Jul–Sep:** Meghalaya (waterfalls!), Kerala backwaters",
  ],
  solo: [
    "🎒 **Solo travel essentials:**\n• Share your live location with a trusted contact\n• Book first-night stay before arriving in a new city\n• Hostels are great for meeting fellow travelers\n• Download Google Maps offline for the region\n• Learn 5 words in the local language — locals love it! 🙏",
  ],
  food: [
    "🍛 **Must-try regional foods:**\n• **North:** Butter chicken, Chole Bhature, Lassi\n• **South:** Masala dosa, Biryani, Filter coffee\n• **West:** Vada Pav, Dhokla, Pav Bhaji\n• **East:** Momos, Litti Chokha, Rasgulla\nRule: if a dhaba has a crowd, eat there! 🤤",
  ],
  transport: [
    "🚂 **Getting around India:**\n• **Trains:** Best for long distances — book on IRCTC app\n• **Flights:** IndiGo & Air India Express for cheap fares\n• **Buses:** Volvo sleeper buses for overnight trips\n• **Local:** Ola/Uber in cities, auto-rickshaws for short hops\n• **Bike rentals:** Available in Goa, Manali, Ladakh",
  ],
  default: [
    "That's a great question! Post in the community feed above to get real answers from fellow Traveloopers who've been there. 🌍",
    "Real travelers share amazing insights in the community feed! Or add your Gemini API key (⚙ settings above) for AI-powered answers. ✨",
    "I'd check the community posts for first-hand experiences. Tip: add your free Gemini API key in settings to unlock AI replies! 🤖",
  ],
};

function getFallbackResponse(message) {
  const lower = message.toLowerCase();
  if (/budget|cheap|cost|₹|money/.test(lower)) return BOT_RESPONSES.budget;
  if (/india|best place|visit|destination/.test(lower)) return BOT_RESPONSES.india;
  if (/hidden|gem|offbeat|secret/.test(lower)) return BOT_RESPONSES.hidden;
  if (/season|when|monsoon|winter|summer|time to/.test(lower)) return BOT_RESPONSES.season;
  if (/solo|alone|single|women/.test(lower)) return BOT_RESPONSES.solo;
  if (/food|eat|cuisine|restaurant|dhaba/.test(lower)) return BOT_RESPONSES.food;
  if (/train|flight|bus|transport|travel by|getting/.test(lower)) return BOT_RESPONSES.transport;
  return BOT_RESPONSES.default;
}

/* ── Storage helpers ──────────────────────────────────── */
const STORAGE_KEY = "traveloop_gemini_key";
const loadKey = () => {
  try { return localStorage.getItem(STORAGE_KEY) || ""; } catch { return ""; }
};
const saveKey = (k) => {
  try { if (k) localStorage.setItem(STORAGE_KEY, k); else localStorage.removeItem(STORAGE_KEY); } catch { }
};

const QUICK_REPLIES = [
  "Best places in India? 🇮🇳",
  "Budget travel tips 💰",
  "Hidden gems 💎",
  "Best travel season 🌤️",
  "Solo travel tips 🎒",
];

const INITIAL_BOT_MSG = {
  id: "bot-init",
  role: "bot",
  text: "👋 Hi Traveller! I'm TravelBot — your community guide.\n\nAsk me anything: best destinations, budget tips, hidden gems, or travel seasons.\n\n💡 Add your free **Gemini API key** in settings (⚙) for smarter AI-powered answers! ✈️",
  ts: new Date(),
};

/* ── Component ────────────────────────────────────────── */
export default function CommunityChatWidget() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState("chat"); // "chat" | "settings"
  const [messages, setMessages] = useState([INITIAL_BOT_MSG]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(0);
  const [hasOpened, setHasOpened] = useState(false);
  const [error, setError] = useState("");

  /* API key state */
  const [apiKey, setApiKey] = useState(loadKey);
  const [keyDraft, setKeyDraft] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [keySaved, setKeySaved] = useState(false);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setUnread(0);
      if (view === "chat") setTimeout(() => inputRef.current?.focus(), 320);
    }
  }, [open, view]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  /* Attract attention after 4s */
  useEffect(() => {
    if (hasOpened) return;
    const t = setTimeout(() => setUnread(1), 4000);
    return () => clearTimeout(t);
  }, [hasOpened]);

  const handleOpen = () => {
    setOpen(true);
    setHasOpened(true);
    setUnread(0);
  };

  /* Save API key */
  const handleSaveKey = () => {
    const trimmed = keyDraft.trim();
    saveKey(trimmed);
    setApiKey(trimmed);
    setKeySaved(true);
    setTimeout(() => {
      setKeySaved(false);
      setView("chat");
    }, 1200);
  };

  const handleClearKey = () => {
    saveKey("");
    setApiKey("");
    setKeyDraft("");
    setKeySaved(false);
  };

  /* Send a message */
  const sendMessage = useCallback(
    async (text) => {
      const trimmed = (text || input).trim();
      if (!trimmed || typing) return;
      setError("");

      const userMsg = { id: `u-${Date.now()}`, role: "user", text: trimmed, ts: new Date() };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setTyping(true);

      try {
        let botText;
        if (apiKey) {
          // Use Gemini — pass last 10 messages as history (skip the initial greeting)
          const history = messages.slice(-10).filter((m) => m.id !== "bot-init");
          botText = await callGemini(apiKey, history, trimmed);
        } else {
          // Fallback canned response with artificial delay
          await new Promise((r) => setTimeout(r, 900 + Math.random() * 700));
          const pool = getFallbackResponse(trimmed);
          botText = pool[Math.floor(Math.random() * pool.length)];
        }
        setMessages((prev) => [
          ...prev,
          { id: `b-${Date.now()}`, role: "bot", text: botText, ts: new Date() },
        ]);
      } catch (err) {
        const msg = err?.message || "Something went wrong. Check your API key in settings.";
        setError(msg);
        setMessages((prev) => [
          ...prev,
          {
            id: `b-err-${Date.now()}`,
            role: "bot",
            text: `⚠️ ${msg}`,
            ts: new Date(),
            isError: true,
          },
        ]);
      } finally {
        setTyping(false);
      }
    },
    [input, typing, apiKey, messages]
  );

  const formatTs = (d) =>
    d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  const hasKey = Boolean(apiKey);

  return (
    <>
      {/* ── Floating Action Button ─────────────────────── */}
      <button
        id="community-chat-fab"
        className={`chat-fab ${open ? "chat-fab--open" : ""}`}
        onClick={open ? () => setOpen(false) : handleOpen}
        aria-label={open ? "Close TravelBot" : "Open TravelBot chat"}
        title={open ? "Close chat" : "Chat with TravelBot"}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
        {!open && unread > 0 && (
          <span className="chat-fab-badge" aria-label={`${unread} new`}>
            {unread}
          </span>
        )}
      </button>

      {/* ── Chat Panel ────────────────────────────────── */}
      <aside
        className={`chat-panel ${open ? "chat-panel--visible" : ""}`}
        role="dialog"
        aria-modal="false"
        aria-label="TravelBot chat"
      >
        {/* Header */}
        <div className="chat-panel-header">
          <div className="chat-bot-info">
            <div className="chat-bot-avatar">
              <Bot size={18} />
            </div>
            <div>
              <div className="chat-bot-name">
                TravelBot <Sparkles size={12} />
                {hasKey && (
                  <span className="chat-ai-badge">AI</span>
                )}
              </div>
              <div className="chat-bot-status">
                <span className="chat-status-dot" />
                {hasKey ? "Gemini AI · Active" : "Online · Community Assistant"}
              </div>
            </div>
          </div>
          <div className="chat-header-actions">
            <button
              className={`chat-settings-btn ${view === "settings" ? "active" : ""}`}
              onClick={() => setView((v) => (v === "settings" ? "chat" : "settings"))}
              aria-label="API key settings"
              title="Configure Gemini API key"
            >
              <Key size={15} />
            </button>
            <button
              className="chat-close-btn"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── Settings view ─────────────────────────── */}
        {view === "settings" ? (
          <div className="chat-settings-panel">
            <div className="chat-settings-title">
              <Key size={16} /> Gemini API Key
            </div>
            <p className="chat-settings-desc">
              Add your free Google Gemini API key to enable AI-powered travel answers.{" "}
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="chat-settings-link"
              >
                Get a free key →
              </a>
            </p>

            {hasKey && (
              <div className="chat-key-status">
                <CheckCircle size={14} /> Key configured —&nbsp;
                <button className="chat-key-clear" onClick={handleClearKey}>
                  Remove
                </button>
              </div>
            )}

            <div className="chat-key-input-row">
              <input
                type={showKey ? "text" : "password"}
                className="chat-input chat-key-input"
                placeholder="AIza..."
                value={keyDraft}
                onChange={(e) => setKeyDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSaveKey(); }}
                aria-label="Gemini API key"
              />
              <button
                className="chat-key-eye"
                onClick={() => setShowKey((v) => !v)}
                aria-label={showKey ? "Hide key" : "Show key"}
                type="button"
              >
                {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            <button
              className="chat-key-save-btn"
              onClick={handleSaveKey}
              disabled={!keyDraft.trim() || keySaved}
            >
              {keySaved ? <><CheckCircle size={14} /> Saved!</> : "Save Key"}
            </button>

            <p className="chat-settings-note">
              🔒 Your key is stored only in your browser's localStorage and never sent to Traveloop servers.
            </p>
          </div>
        ) : (
          <>
            {/* ── Messages ──────────────────────────── */}
            <div className="chat-messages" id="chat-messages-list" aria-live="polite">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`chat-bubble-wrap chat-bubble-wrap--${msg.role}`}
                >
                  {msg.role === "bot" && (
                    <div className="chat-avatar-sm" aria-hidden="true">
                      <Bot size={14} />
                    </div>
                  )}
                  <div
                    className={`chat-bubble chat-bubble--${msg.role}${msg.isError ? " chat-bubble--error" : ""}`}
                  >
                    {msg.text.split("\n").map((line, i, arr) => (
                      <span key={i}>
                        {line}
                        {i < arr.length - 1 && <br />}
                      </span>
                    ))}
                    <time className="chat-ts">{formatTs(msg.ts)}</time>
                  </div>
                </div>
              ))}

              {typing && (
                <div className="chat-bubble-wrap chat-bubble-wrap--bot">
                  <div className="chat-avatar-sm" aria-hidden="true">
                    <Bot size={14} />
                  </div>
                  <div className="chat-bubble chat-bubble--bot chat-typing" aria-label="TravelBot is typing">
                    <span /><span /><span />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick replies */}
            <div className="chat-quick-replies" aria-label="Quick reply suggestions">
              {QUICK_REPLIES.map((qr) => (
                <button
                  key={qr}
                  className="chat-quick-reply"
                  onClick={() => sendMessage(qr)}
                  tabIndex={open ? 0 : -1}
                  disabled={typing}
                >
                  {qr}
                </button>
              ))}
            </div>

            {/* Input row */}
            <div className="chat-input-row">
              <MapPin size={14} className="chat-input-icon" aria-hidden="true" />
              <input
                ref={inputRef}
                id="chat-message-input"
                className="chat-input"
                placeholder={hasKey ? "Ask TravelBot anything..." : "Ask about destinations, tips..."}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                maxLength={500}
                aria-label="Chat message"
                tabIndex={open ? 0 : -1}
                disabled={typing}
              />
              <button
                className="chat-send-btn"
                onClick={() => sendMessage()}
                disabled={!input.trim() || typing}
                aria-label="Send message"
                tabIndex={open ? 0 : -1}
              >
                <Send size={16} />
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
