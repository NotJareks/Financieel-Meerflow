import { cn } from "@/lib/utils";

export function EmptyState({
  icon,
  title,
  description,
  children,
  compact = false,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  children?: React.ReactNode;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[18px] border border-dashed border-white/[0.12] text-center",
        compact ? "px-6 py-8" : "px-8 py-12",
        className
      )}
    >
      {icon && (
        <div className="mx-auto mb-4 grid h-11 w-11 place-items-center rounded-full border border-border text-xl text-accent">
          {icon}
        </div>
      )}
      <h3 className="mb-2 text-xl">{title}</h3>
      {description && (
        <p className="mx-auto mb-5 max-w-[480px] text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
      {children}
    </div>
  );
}

export function GoalProgress({
  currentCents,
  goalCents,
  large = false,
}: {
  currentCents: number;
  goalCents: number;
  large?: boolean;
}) {
  const percentage =
    goalCents > 0 ? Math.min(100, Math.round((currentCents / goalCents) * 100)) : 0;
  return (
    <div className={cn("progress-track", large && "h-2")}>
      <div className="progress-fill" style={{ width: `${percentage}%` }} />
    </div>
  );
}
