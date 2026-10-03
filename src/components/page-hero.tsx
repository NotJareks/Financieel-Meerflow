import { cn } from "@/lib/utils";

export function PageHero({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end",
        className
      )}
    >
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1 className="text-[clamp(2.5rem,5vw,4.5rem)] leading-none">{title}</h1>
        {description && (
          <p className="mt-5 max-w-[620px] text-base leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-col gap-3 sm:flex-row">{actions}</div>
      )}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  className,
}: {
  eyebrow: string;
  title: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-6", className)}>
      <span className="eyebrow">{eyebrow}</span>
      <h2 className="text-3xl">{title}</h2>
    </div>
  );
}
