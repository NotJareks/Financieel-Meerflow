import { z } from "zod";

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Vul een geldig e-mailadres in.")
  .max(254);

export const loginSchema = z.object({
  email: z.string().trim().min(1, "Vul je e-mailadres in."),
  password: z.string().min(1, "Vul je wachtwoord in."),
});

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Vul je naam in.").max(100),
  email: emailSchema,
  password: z
    .string()
    .min(8, "Wachtwoord moet minimaal 8 tekens bevatten.")
    .max(100),
  invite: z.string().trim().min(1, "Vul een uitnodigingscode in.").max(64),
});

export const potCreateSchema = z.object({
  name: z.string().trim().min(1, "Vul een naam in voor de spaarpot.").max(80),
  description: z.string().trim().max(500).optional().nullable(),
  goalEnabled: z.boolean().default(false),
  goalAmountCents: z.number().int().nonnegative().optional().nullable(),
});

export const potDepositSchema = z.object({
  amountCents: z.number().int().positive("Vul een geldig bedrag in."),
  description: z.string().trim().max(200).optional().nullable(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Vul een geldige datum in."),
});

export const potWithdrawSchema = z.object({
  amountCents: z.number().int().positive("Vul een geldig bedrag in."),
  description: z.string().trim().max(200).optional().nullable(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Vul een geldige datum in."),
});

export const distributeSchema = z.object({
  totalCents: z.number().int().positive("Vul een geldig totaalbedrag in."),
  allocations: z
    .array(
      z.object({
        potId: z.string().min(1),
        amountCents: z.number().int().positive(),
      })
    )
    .min(1, "Verdeel minimaal een bedrag over een spaarpot."),
});

export const incomeCreateSchema = z.object({
  name: z.string().trim().min(1, "Vul een omschrijving in.").max(100),
  amountCents: z.number().int().positive("Vul een geldig bedrag in."),
  frequency: z.enum(["MONTHLY", "QUARTERLY", "YEARLY"]).default("MONTHLY"),
});

export const expenseCreateSchema = z.object({
  name: z.string().trim().min(1, "Vul een omschrijving in.").max(100),
  category: z.string().trim().min(1, "Kies een categorie.").max(100),
  amountCents: z.number().int().positive("Vul een geldig bedrag in."),
  frequency: z.enum(["MONTHLY", "QUARTERLY", "YEARLY"]).default("MONTHLY"),
});

export const savingGoalSchema = z.object({
  monthlySavingGoalCents: z.number().int().nonnegative(),
});

export const actualSpendingSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, "Ongeldige maand."),
  category: z.string().trim().min(1).max(100),
  amountCents: z.number().int().nonnegative(),
});

export const actualSaveSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, "Ongeldige maand."),
  potId: z.string().min(1, "Kies een spaarpot."),
  amountCents: z.number().int().positive("Vul een geldig bedrag in."),
});

export const inviteCreateSchema = z.object({
  code: z.string().trim().max(64).optional().nullable(),
  role: z.enum(["ADMIN", "USER"]).default("USER"),
  maxUses: z.number().int().min(1, "Minimaal 1 gebruik.").max(1000),
  expiresAt: z.string().trim().max(64).optional().nullable(),
  note: z.string().trim().max(200).optional().nullable(),
});

export const userUpdateSchema = z.object({
  action: z.enum(["toggle-disabled", "set-role"]),
  role: z.enum(["ADMIN", "USER"]).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type PotCreateInput = z.infer<typeof potCreateSchema>;
export type DistributeInput = z.infer<typeof distributeSchema>;
export type IncomeCreateInput = z.infer<typeof incomeCreateSchema>;
export type ExpenseCreateInput = z.infer<typeof expenseCreateSchema>;
export type InviteCreateInput = z.infer<typeof inviteCreateSchema>;
