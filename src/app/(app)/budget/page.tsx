import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guards";
import { formatCents } from "@/lib/money";
import { frequencyLabel, toMonthlyCents, getMonthlyBudgetByCategory, getBudgetCategories } from "@/lib/budget";
import { PageHero, SectionHeading } from "@/components/page-hero";
import { EmptyState } from "@/components/empty-state";
import { AddIncomeDialog } from "@/components/budget/add-income-dialog";
import { AddExpenseDialog } from "@/components/budget/add-expense-dialog";
import { DeleteItemButton } from "@/components/budget/delete-item-button";
import { SavingGoalInput } from "@/components/budget/saving-goal-input";

export default async function BudgetPage() {
  const user = await requireUser();

  const [incomes, expenses, settings] = await Promise.all([
    prisma.budgetIncome.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
    }),
    prisma.budgetExpense.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
    }),
    prisma.budgetSettings.findUnique({ where: { userId: user.id } }),
  ]);

  const monthlyIncomeCents = incomes.reduce(
    (sum, income) => sum + toMonthlyCents(income.amountCents, income.frequency),
    0
  );
  const monthlyExpenseCents = expenses.reduce(
    (sum, expense) => sum + toMonthlyCents(expense.amountCents, expense.frequency),
    0
  );
  const availableCents = monthlyIncomeCents - monthlyExpenseCents;
  const savingGoalCents = settings?.monthlySavingGoalCents ?? 0;
  const freeCents = availableCents - savingGoalCents;

  const categories = getBudgetCategories(expenses);
  const budgetByCategory = getMonthlyBudgetByCategory(expenses);
  const categoryEntries = [...budgetByCategory.entries()].sort((a, b) => b[1] - a[1]);

  // Conclusion (mirrors the original app)
  let conclusionTitle = "Begin met je maandbudget";
  let conclusionText =
    "Voeg je inkomsten en vaste lasten toe om te zien hoeveel ruimte je iedere maand hebt.";

  if (incomes.length > 0 || expenses.length > 0) {
    if (availableCents < 0) {
      conclusionTitle = "Je vaste lasten zijn hoger dan je inkomsten";
      conclusionText = `Op basis van je huidige gegevens kom je ongeveer ${formatCents(
        Math.abs(availableCents)
      )} per maand tekort.`;
    } else if (savingGoalCents > availableCents) {
      conclusionTitle = "Je spaardoel is hoger dan je beschikbare ruimte";
      conclusionText = `Na je vaste lasten blijft ${formatCents(
        availableCents
      )} over. Je huidige spaardoel is ${formatCents(savingGoalCents)}.`;
    } else {
      conclusionTitle = `${formatCents(availableCents)} beschikbaar per maand`;
      conclusionText = `Na je vaste lasten kun je ongeveer ${formatCents(
        savingGoalCents
      )} opzijzetten en blijft er ${formatCents(
        freeCents
      )} over als vrij besteedbaar bedrag.`;
    }
  }

  return (
    <>
      <PageHero
        eyebrow="PLANNING"
        title="Mijn maandbudget"
        description="Bereken vooraf hoeveel er maandelijks binnenkomt, welke vaste lasten je hebt en hoeveel ruimte er overblijft."
        actions={
          <>
            <AddIncomeDialog />
            <AddExpenseDialog />
          </>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard label="Netto inkomsten" value={monthlyIncomeCents} />
        <SummaryCard label="Vaste lasten" value={monthlyExpenseCents} />
        <SummaryCard label="Beschikbaar" value={availableCents} />
        <SummaryCard label="Vrij te besteden" value={freeCents} highlight />
      </div>

      <div className="mb-6 flex flex-col justify-between gap-6 rounded-[18px] border border-accent/15 bg-gradient-to-br from-accent/[0.08] to-white/[0.02] p-7 md:flex-row md:items-center">
        <div>
          <span className="eyebrow">MAANDELIJKS SPAARDOEL</span>
          <h2 className="text-2xl">Wat wil je iedere maand opzijzetten?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Dit bedrag wordt meegenomen in je berekening van het vrij te
            besteden bedrag.
          </p>
        </div>
        <SavingGoalInput savingGoalCents={savingGoalCents} />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="panel">
          <div className="mb-6">
            <span className="eyebrow">INKOMSTEN</span>
            <h2 className="text-2xl">Mijn inkomsten</h2>
          </div>

          {incomes.length === 0 ? (
            <EmptyState
              compact
              title="Nog geen inkomsten"
              description="Voeg bijvoorbeeld je salaris toe."
            />
          ) : (
            <div className="flex flex-col gap-2">
              {incomes.map((income) => (
                <div
                  key={income.id}
                  className="flex items-center justify-between gap-4 rounded-[13px] border border-border bg-white/[0.02] p-4"
                >
                  <div className="flex flex-col gap-1">
                    <strong className="text-[0.85rem] font-medium">
                      {income.name}
                    </strong>
                    <span className="text-[0.72rem] text-muted-foreground">
                      {formatCents(income.amountCents)} ·{" "}
                      {frequencyLabel(income.frequency)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3.5">
                    <strong className="whitespace-nowrap text-accent-light">
                      {formatCents(
                        toMonthlyCents(income.amountCents, income.frequency)
                      )}
                    </strong>
                    <DeleteItemButton url={`/api/budget/incomes/${income.id}`} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="panel">
          <div className="mb-6">
            <span className="eyebrow">UITGAVEN</span>
            <h2 className="text-2xl">Mijn vaste lasten</h2>
          </div>

          {expenses.length === 0 ? (
            <EmptyState
              compact
              title="Nog geen vaste lasten"
              description="Voeg je vaste maandelijkse uitgaven toe."
            />
          ) : (
            <div className="flex flex-col gap-2">
              {expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between gap-4 rounded-[13px] border border-border bg-white/[0.02] p-4"
                >
                  <div className="flex flex-col gap-1">
                    <strong className="text-[0.85rem] font-medium">
                      {expense.name}
                    </strong>
                    <span className="text-[0.72rem] text-muted-foreground">
                      {expense.category} · {frequencyLabel(expense.frequency)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3.5">
                    <strong className="whitespace-nowrap text-accent-light">
                      {formatCents(
                        toMonthlyCents(expense.amountCents, expense.frequency)
                      )}
                    </strong>
                    <DeleteItemButton
                      url={`/api/budget/expenses/${expense.id}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mb-4">
        <div className="panel">
          <SectionHeading eyebrow="ANALYSE" title="Uitgaven per categorie" className="mb-6" />

          {categoryEntries.length === 0 ? (
            <EmptyState
              compact
              title="Nog geen categorieën"
              description="Voeg vaste lasten toe om je uitgaven per categorie te zien."
            />
          ) : (
            <div className="flex flex-col gap-4">
              {categoryEntries.map(([category, amount]) => {
                const percentage =
                  monthlyExpenseCents > 0
                    ? Math.round((amount / monthlyExpenseCents) * 100)
                    : 0;
                return (
                  <div key={category}>
                    <div className="mb-2 flex justify-between text-[0.8rem]">
                      <strong className="font-medium">{category}</strong>
                      <span className="text-muted-foreground">
                        {formatCents(amount)} · {percentage}%
                      </span>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-[18px] border border-accent/15 bg-gradient-to-br from-accent/[0.09] to-white/[0.015] p-9">
        <span className="eyebrow">SAMENVATTING</span>
        <h2 className="mb-2.5 text-2xl">{conclusionTitle}</h2>
        <p className="m-0 max-w-[750px] text-sm leading-relaxed text-muted-foreground">
          {conclusionText}
        </p>
      </div>
    </>
  );
}

function SummaryCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={
        highlight
          ? "rounded-[18px] border border-accent/20 bg-gradient-to-br from-accent/[0.12] to-white/[0.025] p-6"
          : "rounded-[18px] border border-border bg-white/[0.025] p-6"
      }
    >
      <div className="card-label">{label}</div>
      <div className="mt-4 font-serif text-[1.8rem] text-accent-light">
        {formatCents(value)}
      </div>
    </div>
  );
}
