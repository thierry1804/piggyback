import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  currencyCode: text("currency_code").default("USD").notNull(),
  currencySymbol: text("currency_symbol").default("$").notNull(),
});

export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  targetAmount: integer("target_amount").notNull(), // stored in cents/smallest unit
  currentAmount: integer("current_amount").default(0).notNull(), // stored in cents/smallest unit
  icon: text("icon").default("🐷"),
  color: text("color").default("blue"), // for UI theming
  currencyCode: text("currency_code").default("USD").notNull(),
  currencySymbol: text("currency_symbol").default("$").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  goalId: integer("goal_id").notNull(),
  amount: integer("amount").notNull(), // positive for deposit, negative for withdraw
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const goalsRelations = relations(goals, ({ many }) => ({
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  goal: one(goals, {
    fields: [transactions.goalId],
    references: [goals.id],
  }),
}));

export const insertGoalSchema = createInsertSchema(goals).pick({
  name: true,
  description: true,
  targetAmount: true,
  icon: true,
  color: true,
  currencyCode: true,
  currencySymbol: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  goalId: true,
  amount: true,
  note: true,
});

export type Goal = typeof goals.$inferSelect;
export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
