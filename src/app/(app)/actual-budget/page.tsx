import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guards";
import { formatCents } from "@/lib/money";
import { formatMonth, capitalize, getCurrentMonth, isValidMonth } from "@/lib/dates";
import {
  getBudgetCategories,
  getMonthlyBudgetByCategory,
  toMonthlyCents,
} from "@/lib/budget";
import { PageHero, SectionHeading } from "@/components/page-hero";
import { EmptyState } from "@/components/empty-state";
import { MonthPicker } from "@/components/actual-budget/month-picker";
import { SpendingEditor } from "@/components/actual-budget/spending-editor";
import { SaveToPotForm } from "@/components/actual-budget/save-to-pot-form";
import { cn } from "@/lib/utils";

export default async function ActualBudgetPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const user = await requireUser();
  const { month: monthParam } = await searchParams;
  const month = monthParam && isValidMonth(monthParam) ? monthParam : getCurrentMonth();

  const [expenses, pots, actualMonths] = await Promise.all([
    prisma.budgetExpense.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
    }),
    prisma.pot.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true },
    }),
    prisma.actualBudgetMonth.findMany({
      where: { userId: user.id },
      include: { spending: true },
      orderBy: { month: "desc" },
    }),
  ]);

  const currentMonthRecord = actualMonths.find((record) => record.month === month) ?? null;
  const actualByCategory = new Map(
    (currentMonthRecord?.spending ?? []).map((row) => [row.category, row.amountCents])
  );

  const budgetByCategory = getMonthlyBudgetByCategory(expenses);
  const categories = getBudgetCategories(expenses);

  const budgetedTotal = expenses.reduce(
    (sum, expense) => sum + toMonthlyCents(expense.amountCents, expense.frequency),
    0
  );
  const spentTotal = [...actualByCategory.values()].reduce(
    (sum, amount) => sum + amount,
    0
  );
  const remaining = budgetedTotal - spentTotal;
  const savedCents = currentMonthRecord?.savedCents ?? 0;
  const availableToSave = Math.max(0, remaining - savedCents);

  const rows = categories.map((category) => ({
    category,
    budgetedCents: budgetByCategory.get(category) ?? 0,
    actualCents: actualByCategory.get(category) ?? 0,
  }));

  // Headline & description
  let headline = "Houd je uitgaven bij";
  let description =
    "Vul per categorie in wat je daadwerkelijk hebt uitgegeven. Je ziet automatisch hoeveel je overhoudt.";

  if (remaining > 0) {
    headline = `${formatCents(remaining)} over deze maand`;
    description =
      savedCents > 0
        ? `Je hebt deze maand minder uitgegeven dan begroot. ${formatCents(
            savedCents
          )} is al naar een spaarpot gereserveerd.`
        : "Je hebt deze maand minder uitgegeven dan begroot. Je kunt een deel hiervan opzijzetten.";
  } else if (remaining < 0) {
    headline = `${formatCents(Math.abs(remaining))} boven budget`;
    description =
      "Je werkelijke uitgaven zijn hoger dan het bedrag dat je vooraf had begroot.";
  } else {
    headline = "Precies binnen budget";
    description = "Je werkelijke uitgaven zijn gelijk aan je begrote uitgaven.";
  }

  return (
    <>
      <PageHero
        eyebrow="WERKELIJKE UITGAVEN"
        title="Werkelijk maandbudget"
        description="Vul achteraf in wat je deze maand daadwerkelijk hebt uitgegeven en ontdek hoeveel geld je hebt overgehouden."
      />

      <div className="mb-5 flex flex-col justify-between gap-6 rounded-[18px] border border-border bg-white/[0.025] p-7 md:flex-row md:items-center">
        <div>
          <span className="eyebrow">MAAND</span>
          <h2 className="text-2xl">Welke maand wil je bekijken?</h2>
        </div>
        <MonthPicker month={month} />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Begroot"
          value={budgetedTotal}
          description="Je verwachte maandelijkse uitgaven."
        />
        <SummaryCard
          label="Werkelijk uitgegeven"
          value={spentTotal}
          description="Wat je daadwerkelijk hebt uitgegeven."
        />
        <SummaryCard
          label="Overgehouden"
          value={remaining}
          description="Het verschil tussen je begroting en je werkelijke uitgaven."
          positive
        />
        <SummaryCard
          label="Naar spaarpot"
          value={savedCents}
          description="Bedrag dat je uit het maandbudget hebt gereserveerd."
        />
      </div>

      <div className="mb-4 flex flex-col justify-between gap-6 rounded-[18px] border border-accent/15 bg-gradient-to-br from-accent/[0.1] to-white/[0.018] p-8 md:flex-row md:items-center">
        <div>
          <span className="eyebrow">DEZE MAAND</span>
          <h2 className="text-2xl">{headline}</h2>
          <p className="mb-0 mt-2 max-w-[700px] text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
        <div className="min-w-[210px] text-left md:text-right">
          <span className="mb-2 block text-[0.72rem] uppercase tracking-[0.12em] text-muted-foreground">
            Over
          </span>
          <strong className="font-serif text-4xl text-accent-light">
            {formatCents(availableToSave)}
          </strong>
        </div>
      </div>

      <div className="panel mb-4">
        <div className="mb-6 flex items-end justify-between gap-5">
          <div>
            <span className="eyebrow">WERKELIJKE UITGAVEN</span>
            <h2 className="text-2xl">Deze maand</h2>
          </div>
          <span className="text-[0.7rem] text-muted-foreground">
            Bedragen zijn per maand
          </span>
        </div>

        <SpendingEditor month={month} rows={rows} />
      </div>

      <div className="panel mb-4">
        <div className="mb-6">
          <span className="eyebrow">GELD OPZIJZETTEN</span>
          <h2 className="text-2xl">Wat wil je sparen?</h2>
        </div>

        <SaveToPotForm
          month={month}
          pots={pots.map((pot) => ({ id: pot.id, name: pot.name }))}
          availableCents={availableToSave}
          savedCents={savedCents}
        />
      </div>

      <div className="panel">
        <SectionHeading eyebrow="HISTORIE" title="Eerdere maanden" className="mb-6" />

        {actualMonths.length === 0 ? (
          <EmptyState
            compact
            title="Nog geen maandhistorie"
            description="Zodra je een werkelijke maand invult, verschijnt deze hier."
          />
        ) : (
          <div>
            {actualMonths.map((record) => {
              const spent = record.spending.reduce(
                (sum, row) => sum + row.amountCents,
                0
              );
              const monthRemaining = budgetedTotal - spent;
              return (
                <Link
                  key={record.id}
                  href={`/actual-budget?month=${record.month}`}
                  className="grid grid-cols-2 items-center gap-5 border-b border-border px-1 py-4 transition-colors last:border-b-0 hover:bg-white/[0.025] md:grid-cols-[1.5fr_1fr_1fr_1fr_1fr]"
                >
                  <div className="flex flex-col gap-1">
                    <strong className="text-[0.88rem] font-medium">
                      {capitalize(formatMonth(record.month))}
                    </strong>
                    <span className="text-[0.68rem] text-muted-foreground">
                      Werkelijk uitgegeven
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[0.68rem] text-muted-foreground">
                      Begroot
                    </span>
                    <strong className="text-[0.8rem]">
                      {formatCents(budgetedTotal)}
                    </strong>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[0.68rem] text-muted-foreground">
                      Werkelijk
                    </span>
                    <strong className="text-[0.8rem]">{formatCents(spent)}</strong>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[0.68rem] text-muted-foreground">
                      Over
                    </span>
                    <strong
                      className={cn(
                        "text-[0.8rem]",
                        monthRemaining >= 0 ? "text-success" : "text-danger"
                      )}
                    >
                      {formatCents(monthRemaining)}
                    </strong>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[0.68rem] text-muted-foreground">
                      Gespaard
                    </span>
                    <strong className="text-[0.8rem]">
                      {formatCents(record.savedCents)}
                    </strong>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

function SummaryCard({
  label,
  value,
  description,
  positive = false,
}: {
  label: string;
  value: number;
  description: string;
  positive?: boolean;
}) {
  return (
    <div
      className={
        positive
          ? "rounded-[18px] border border-accent/20 bg-gradient-to-br from-accent/[0.12] to-white/[0.025] p-6"
          : "rounded-[18px] border border-border bg-white/[0.025] p-6"
      }
    >
      <div className="card-label">{label}</div>
      <div className="mt-4 font-serif text-[1.8rem] text-accent-light">
        {formatCents(value)}
      </div>
      <p className="mt-2.5 text-[0.8rem] leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
