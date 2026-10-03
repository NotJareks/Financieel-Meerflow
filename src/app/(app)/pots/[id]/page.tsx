import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowDown, ArrowLeft, ArrowUp } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guards";
import { formatCents } from "@/lib/money";
import { formatDate } from "@/lib/dates";
import { EmptyState, GoalProgress } from "@/components/empty-state";
import { DepositDialog } from "@/components/pots/deposit-dialog";
import { WithdrawDialog } from "@/components/pots/withdraw-dialog";
import { DeletePotButton } from "@/components/pots/delete-pot-button";
import { cn } from "@/lib/utils";

export default async function PotDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const pot = await prisma.pot.findFirst({
    where: { id, userId: user.id },
    include: {
      transactions: {
        orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      },
    },
  });

  if (!pot) notFound();

  const hasGoal = pot.goalEnabled && (pot.goalAmountCents ?? 0) > 0;
  const goalCents = pot.goalAmountCents ?? 0;
  const percentage =
    hasGoal && goalCents > 0
      ? Math.min(100, Math.round((pot.amountCents / goalCents) * 100))
      : 0;
  const remaining = Math.max(0, goalCents - pot.amountCents);

  return (
    <>
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Terug naar overzicht
      </Link>

      <div className="mb-9 flex flex-col justify-between gap-8 md:flex-row md:items-end">
        <div>
          <span className="eyebrow">SPAARPOT</span>
          <h1 className="text-[clamp(2.5rem,5vw,4.5rem)] leading-none">
            {pot.name}
          </h1>
          {pot.description && (
            <p className="mt-5 max-w-[620px] text-base text-muted-foreground">
              {pot.description}
            </p>
          )}
        </div>
        <div className="font-serif text-[clamp(2.5rem,6vw,5rem)] leading-none text-accent-light">
          {formatCents(pot.amountCents)}
        </div>
      </div>

      {hasGoal && (
        <div className="mb-5 rounded-[18px] border border-border bg-white/[0.018] p-7">
          <div className="mb-5 flex items-start justify-between">
            <div>
              <span className="eyebrow">SPAARDOEL</span>
              <h2 className="text-2xl">Voortgang</h2>
            </div>
            <strong className="font-serif text-3xl font-medium text-accent">
              {percentage}%
            </strong>
          </div>

          <GoalProgress currentCents={pot.amountCents} goalCents={goalCents} large />

          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div>
              <span className="mb-1 block text-[0.7rem] text-muted-foreground">
                Huidig
              </span>
              <strong className="text-[0.9rem]">{formatCents(pot.amountCents)}</strong>
            </div>
            <div>
              <span className="mb-1 block text-[0.7rem] text-muted-foreground">
                Doel
              </span>
              <strong className="text-[0.9rem]">{formatCents(goalCents)}</strong>
            </div>
            <div>
              <span className="mb-1 block text-[0.7rem] text-muted-foreground">
                {pot.amountCents >= goalCents ? "Doel bereikt" : "Nog nodig"}
              </span>
              <strong className="text-[0.9rem]">
                {pot.amountCents >= goalCents
                  ? formatCents(pot.amountCents - goalCents)
                  : formatCents(remaining)}
              </strong>
            </div>
          </div>
        </div>
      )}

      <div className="mb-10 flex flex-col gap-2.5 sm:flex-row">
        <DepositDialog potId={pot.id} />
        <WithdrawDialog potId={pot.id} availableCents={pot.amountCents} />
        <DeletePotButton
          potId={pot.id}
          potName={pot.name}
          amountCents={pot.amountCents}
        />
      </div>

      <div className="rounded-[18px] border border-border bg-white/[0.015] p-7">
        <div className="mb-6">
          <span className="eyebrow">HISTORIE</span>
          <h2 className="text-2xl">Transacties</h2>
        </div>

        {pot.transactions.length === 0 ? (
          <EmptyState
            compact
            title="Nog geen transacties"
            description="Deze spaarpot heeft nog geen transacties."
          />
        ) : (
          <div className="-mx-7 -mb-7 overflow-hidden">
            {pot.transactions.map((transaction) => {
              const isWithdrawal = transaction.type === "WITHDRAWAL";
              return (
                <div
                  key={transaction.id}
                  className="grid grid-cols-[36px_1fr_auto] items-center gap-4 border-b border-border px-7 py-4 last:border-b-0"
                >
                  <div
                    className={cn(
                      "grid h-[34px] w-[34px] place-items-center rounded-full",
                      isWithdrawal
                        ? "bg-danger/10 text-danger"
                        : "bg-accent/10 text-accent"
                    )}
                  >
                    {isWithdrawal ? (
                      <ArrowDown className="h-4 w-4" />
                    ) : (
                      <ArrowUp className="h-4 w-4" />
                    )}
                  </div>

                  <div className="flex flex-col gap-1">
                    <strong className="text-[0.85rem] font-medium">
                      {transaction.description ||
                        (isWithdrawal ? "Geld opgenomen" : "Geld gestort")}
                    </strong>
                    <span className="text-[0.72rem] text-muted-foreground">
                      {formatDate(transaction.date)}
                    </span>
                  </div>

                  <span
                    className={cn(
                      "whitespace-nowrap font-semibold",
                      isWithdrawal ? "text-[#c88989]" : "text-accent-light"
                    )}
                  >
                    {isWithdrawal ? "−" : "+"}
                    {formatCents(transaction.amountCents)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
