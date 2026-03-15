import { useState } from "react";

interface ModuleCardProps {
  emoji: string;
  name: string;
  description: string;
  badge: "Core" | "AI" | "Premium";
  features: string[];
  delay: number;
}

const badgeStyles = {
  Core: "gradient-bg text-primary-foreground",
  AI: "bg-accent text-accent-foreground",
  Premium: "bg-amber-500 text-primary-foreground",
};

const ModuleCard = ({ emoji, name, description, badge, features, delay }: ModuleCardProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="animate-fade-up group cursor-pointer rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:border-primary/40 hover:shadow-[0_0_30px_hsl(280,80%,60%,0.1)]"
      style={{ animationDelay: `${delay}ms` }}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{emoji}</span>
          <div>
            <h3 className="font-heading text-lg font-bold text-foreground">{name}</h3>
            <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${badgeStyles[badge]}`}>
          {badge}
        </span>
      </div>

      <div
        className={`grid transition-all duration-300 ${
          expanded ? "mt-4 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="flex flex-wrap gap-2">
            {features.map((feature) => (
              <span
                key={feature}
                className="rounded-md border border-border bg-secondary px-2.5 py-1 text-xs text-secondary-foreground transition-colors hover:border-primary/30"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
        <span>{features.length} features</span>
        <span className="ml-auto transition-transform duration-200" style={{ transform: expanded ? "rotate(180deg)" : "rotate(0)" }}>
          ▼
        </span>
      </div>
    </div>
  );
};

export default ModuleCard;
