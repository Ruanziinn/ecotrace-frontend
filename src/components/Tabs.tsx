import { LayoutDashboard, Package, Coins, Vote } from "lucide-react";

export type TabKey = "dashboard" | "cooperativa" | "staking" | "governanca";

const tabs: { key: TabKey; label: string; icon: any }[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "cooperativa", label: "Cooperativa", icon: Package },
  { key: "staking", label: "Staking", icon: Coins },
  { key: "governanca", label: "Governança", icon: Vote },
];

export function Tabs({ active, onChange }: { active: TabKey; onChange: (k: TabKey) => void }) {
  return (
    <div className="container mt-6">
      <div className="flex gap-1 overflow-x-auto rounded-xl border border-border bg-card p-1">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = active === t.key;
          return (
            <button
              key={t.key}
              onClick={() => onChange(t.key)}
              className={`flex flex-1 min-w-[120px] items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all
                ${isActive
                  ? "gradient-primary text-primary-foreground shadow-[var(--shadow-glow)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
