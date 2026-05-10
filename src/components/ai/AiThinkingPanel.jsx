import { useEffect, useState } from "react";
import { MapPin, Route, Sparkles, WalletCards } from "lucide-react";
import "@/styles/components/ai.css";

const steps = [
  { icon: MapPin, label: "Analyzing destinations", tip: "Balancing popular sights with quieter local finds." },
  { icon: Route, label: "Optimizing route flow", tip: "Keeping travel days realistic and reducing backtracking." },
  { icon: WalletCards, label: "Optimizing budget allocation", tip: "Prioritizing stays, food, transport, and emergency buffer." },
  { icon: Sparkles, label: "Finding hidden gems", tip: "Adding context-aware experiences for your travel style." },
];

export function AiThinkingPanel({ title = "Traveloop AI is planning", destination = "your trip" }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => setActive((value) => (value + 1) % steps.length), 1600);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <section className="ai-thinking" aria-live="polite">
      <div className="ai-thinking-visual">
        <div className="ai-orbit" />
        <div className="ai-card-stack">
          {[0, 1, 2].map((item) => (
            <div key={item} className="ai-skeleton-card">
              <span />
              <strong />
              <em />
            </div>
          ))}
        </div>
      </div>
      <div className="ai-thinking-copy">
        <p className="ai-kicker">AI thinking</p>
        <h3>{title}</h3>
        <p>Building a personalized response for {destination}.</p>
        <div className="ai-progress"><span style={{ width: `${((active + 1) / steps.length) * 100}%` }} /></div>
        <div className="ai-step-list">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.label} className={`ai-step${active === index ? " active" : ""}`}>
                <Icon size={16} />
                <div>
                  <strong>{step.label}...</strong>
                  <span>{step.tip}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
