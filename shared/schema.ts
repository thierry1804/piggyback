import { z } from "zod";

// Schéma pour la création d'un objectif
export const insertGoalSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().nullable().optional(),
  targetAmount: z.number().int().positive("Target amount must be positive"),
  currentAmount: z.number().int().default(0),
  icon: z.string().default("🐷"),
  color: z.string().default("blue"),
  currencyCode: z.string().default("MGA"),
  currencySymbol: z.string().default("Ar"),
  deadline: z.string().nullable().optional(),
});

// Schéma pour la création d'une transaction
export const insertTransactionSchema = z.object({
  goalId: z.number().int().positive(),
  amount: z.number().int(), // positif pour dépôt, négatif pour retrait
  note: z.string().nullable().optional(),
});

// Types exportés
export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
