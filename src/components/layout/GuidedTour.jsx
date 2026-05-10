import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "@/lib/constants";
import { Compass, Map, Search, Sparkles, Users, X } from "lucide-react";
import "@/styles/components/ui.css";

const TOUR_KEY = "traveloop.tour.completed.v1";

const steps = [
  {
    icon: Compass,
    title: "Your travel command center",
    body: "Start on the dashboard to see trip progress, recommended destinations, and shortcuts tuned to your profile."
  },
  {
    icon: Map,
    title: "Build real trips",
    body: "Create a trip, add city stops, attach notes, packing items, photos, and keep the itinerary in one place."
  },
  {
    icon: Sparkles,
    title: "Use AI with context",
    body: "AI tools now use your trip style, dates, first city, and profile context instead of generic prompts."
  },
  {
    icon: Search,
    title: "Explore before you search",
    body: "Search shows recommended destinations and activities first, then narrows live backend results as you type."
  },
  {
    icon: Users,
    title: "Share and learn",
    body: "Community lets travellers post tips, react, comment, and copy shareable snippets while backend feed APIs evolve."
  }
];

export function startGuidedTour() {
  window.dispatchEvent(new Event("traveloop-start-tour"));
}

export function GuidedTour() {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const step = steps[index];
  const StepIcon = step.icon;

  useEffect(() => {
    const completed = localStorage.getItem(TOUR_KEY) === "true";
    if (!completed) setOpen(true);

    const start = () => {
      setIndex(0);
      setOpen(true);
    };
    window.addEventListener("traveloop-start-tour", start);
    return () => window.removeEventListener("traveloop-start-tour", start);
  }, []);

  const close = () => {
    localStorage.setItem(TOUR_KEY, "true");
    setOpen(false);
  };

  const next = () => {
    if (index === steps.length - 1) {
      close();
      return;
    }
    setIndex((value) => value + 1);
  };

  if (!open) return null;

  return (
    <div className="tour-overlay" role="dialog" aria-modal="true" aria-labelledby="tour-title">
      <div className="tour-panel">
        <button className="tour-close" type="button" onClick={close} aria-label="Close tour">
          <X size={18} />
        </button>
        <div className="tour-icon"><StepIcon size={28} /></div>
        <div className="tour-kicker">Traveloop tour</div>
        <h2 id="tour-title" className="tour-title">{step.title}</h2>
        <p className="tour-body">{step.body}</p>
        <div className="tour-dots" aria-label={`Step ${index + 1} of ${steps.length}`}>
          {steps.map((item, itemIndex) => (
            <span key={item.title} className={`tour-dot${itemIndex === index ? " active" : ""}`} />
          ))}
        </div>
        <div className="tour-actions">
          <Link to={ROUTES.tripNew} className="btn btn-secondary" onClick={close}>Plan a Trip</Link>
          <button type="button" className="btn btn-primary" onClick={next}>
            {index === steps.length - 1 ? "Finish Tour" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
