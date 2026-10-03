import Link from "next/link";
import { ArrowDown, ArrowUp, Plus, Wallet } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guards";
import { formatCents } from "@/lib/money";
import { formatDate } from "@/lib/dates";
import { PageHero, SectionHeading } from "@/components/page-hero";
import { EmptyState, GoalProgress } from "@/components/empty-state";
import { CreatePotDialog } from "@/components/pots/create-pot-dialog";
import { DistributeDialog } from "@/components/distribute/distribute-dialog";
import { cn } from "@/lib/utils";

export default async function DashboardPage() {
  const user = await requireUser();

  const [dbUser, pots, recentTransactions] = await Promise.all([
    prisma.user.findUnique({
      where: { id: user.id },
      select: { unallocatedCents: true },
    }),
    prisma.pot.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
    }),
    prisma.transaction.findMany({
      where: { userId: user.id },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      take: 8,
      include: { pot: { select: { id: true, name: true } } },
    }),
  ]);

  const unallocatedCents = dbUser?.unallocatedCents ?? 0;

  const totalCents =
    unallocatedCents + pots.reduce((sum, pot) => sum + pot.amountCents, 0);

  return (
    <>
      <PageHero
        eyebrow="FINANCIËLE ADMINISTRATIE"
        title="Overzicht"
        description="Een rustig en helder overzicht van je geld, spaarpotten en recente transacties."
        actions={
          <>
            <DistributeDialog
              pots={pots.map((pot) => ({
                id: pot.id,
                name: pot.name,
                amountCents: pot.amountCents,
              }))}
              unallocatedCents={unallocatedCents}
            />
            <CreatePotDialog />
          </>
        }
      />

      <div className="mb-16 grid grid-cols-1 gap-4 md:grid-cols-[2fr_1fr]">
        <div className="luxury-card-gold min-h-[180px] p-7">
          <div className="card-label">Totaal vermogen</div>
          <div className="mt-5 font-serif text-[clamp(2.2rem,5vw,4rem)] text-accent-light">
            {formatCents(totalCents)}
          </div>
          <p className="mt-3 max-w-[500px] text-[0.8rem] leading-relaxed text-muted-foreground">
            Totaal van je spaarpotten en nog niet verdeelde bedragen.
          </p>
        </div>

        <div className="luxury-card min-h-[180px] p-7">
          <div className="card-label">Niet verdeeld</div>
          <div className="mt-5 font-serif text-[clamp(2.2rem,5vw,4rem)] text-accent-light">
            {formatCents(unallocatedCents)}
          </div>
          <p className="mt-3 max-w-[500px] text-[0.8rem] leading-relaxed text-muted-foreground">
            Geld dat nog niet aan een spaarpot is toegewezen.
          </p>
        </div>
      </div>

      <SectionHeading eyebrow="JE GELD" title="Spaarpotten" />

      {pots.length === 0 ? (
        <EmptyState
          icon={<Plus />}
          title="Nog geen spaarpotten"
          description="Maak je eerste spaarpot aan om je geld overzichtelijk te verdelen."
        >
          <CreatePotDialog />
        </EmptyState>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
          {pots.map((pot) => {
            const hasGoal =
              pot.goalEnabled && (pot.goalAmountCents ?? 0) > 0;
            const percentage =
              hasGoal && pot.goalAmountCents
                ? Math.min(
                    100,
                    Math.round((pot.amountCents / pot.goalAmountCents) * 100)
                  )
                : 0;

            return (
              <Link
                key={pot.id}
                href={`/pots/${pot.id}`}
                className="group rounded-[18px] border border-border p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:border-accent/30 hover:bg-gradient-to-br hover:from-accent/[0.08] hover:to-white/[0.02]"
                style={{
                  background:
                    "linear-gradient(145deg, rgba(255,255,255,0.045), rgba(255,255,255,0.012))",
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="grid h-[42px] w-[42px] place-items-center rounded-full border border-accent/20 bg-accent/10 font-serif text-lg text-accent">
                    {pot.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xl text-muted-foreground transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </div>

                <div className="mt-7">
                  <h3 className="text-xl">{pot.name}</h3>
                  <p className="mb-5 mt-2 min-h-[24px] text-[0.78rem] text-muted-foreground">
                    {pot.description || "Geen omschrijving"}
                  </p>
                  <strong className="block font-serif text-[1.75rem] font-medium text-accent-light">
                    {formatCents(pot.amountCents)}
                  </strong>
                </div>

                {hasGoal && pot.goalAmountCents && (
                  <div className="mt-6">
                    <div className="mb-2 flex justify-between gap-2 text-[0.7rem] text-muted-foreground">
                      <span>{percentage}% van doel</span>
                      <span>{formatCents(pot.goalAmountCents)}</span>
                    </div>
                    <GoalProgress
                      currentCents={pot.amountCents}
                      goalCents={pot.goalAmountCents}
                    />
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}

      <SectionHeading eyebrow="ACTIVITEIT" title="Recente transacties" className="mt-16" />

      <div className="overflow-hidden rounded-[18px] border border-border bg-white/[0.015]">
        {recentTransactions.length === 0 ? (
          <EmptyState
            compact
            title="Nog geen transacties"
            description="Je recente stortingen en opnames verschijnen hier."
          />
        ) : (
          recentTransactions.map((transaction) => {
            const isWithdrawal = transaction.type === "WITHDRAWAL";
            return (
              <Link
                key={transaction.id}
                href={`/pots/${transaction.potId}`}
                className="grid grid-cols-[36px_1fr_auto] items-center gap-4 border-b border-border px-5 py-4 transition-colors last:border-b-0 hover:bg-white/[0.035] md:grid-cols-[42px_1fr_auto_auto]"
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
                    {transaction.pot.name}
                  </span>
                </div>

                <span className="hidden text-[0.72rem] text-muted-foreground md:block">
                  {formatDate(transaction.date)}
                </span>

                <span
                  className={cn(
                    "whitespace-nowrap font-semibold",
                    isWithdrawal ? "text-[#c88989]" : "text-accent-light"
                  )}
                >
                  {isWithdrawal ? "−" : "+"}
                  {formatCents(transaction.amountCents)}
                </span>
              </Link>
            );
          })
        )}
      </div>

      <div className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Wallet className="h-3.5 w-3.5" />
        Jouw gegevens zijn alleen zichtbaar voor jou.
      </div>
    </>
  );
}
