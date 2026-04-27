import { ReactNode } from "react";

export function StatCard({
  label, value, icon, hint, accent,
}: {
  label: string; value: ReactNode; icon: ReactNode; hint?: ReactNode; accent?: boolean;
}) {
  return (
    <div className="eco-card animate-fade-in relative overflow-hidden">
      {accent && <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />}
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-bold">{value}</p>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
      </div>
    </div>
  );
}
