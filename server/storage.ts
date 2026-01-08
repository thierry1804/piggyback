import { db } from "./db";
import {
  goals,
  transactions,
  type Goal,
  type InsertGoal,
  type Transaction,
  type InsertTransaction,
} from "@shared/schema";
import { eq, desc, sql } from "drizzle-orm";

export interface IStorage {
  // Settings
  getSettings(): Promise<{ currencyCode: string; currencySymbol: string }>;
  updateSettings(settings: { currencyCode: string; currencySymbol: string }): Promise<{ currencyCode: string; currencySymbol: string }>;

  // Goals
  getGoals(): Promise<Goal[]>;
  getGoal(id: number): Promise<(Goal & { transactions: Transaction[] }) | undefined>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  deleteGoal(id: number): Promise<void>;
  updateGoalAmount(id: number, amountDelta: number): Promise<void>;

  // Transactions
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
}

export class DatabaseStorage implements IStorage {
  async getSettings(): Promise<{ currencyCode: string; currencySymbol: string }> {
    const [row] = await db.select().from(settings).limit(1);
    if (!row) {
      const [newRow] = await db
        .insert(settings)
        .values({ currencyCode: "USD", currencySymbol: "$" })
        .returning();
      return newRow;
    }
    return row;
  }

  async updateSettings(updates: { currencyCode: string; currencySymbol: string }): Promise<{ currencyCode: string; currencySymbol: string }> {
    const [existing] = await db.select().from(settings).limit(1);
    if (!existing) {
      const [newRow] = await db.insert(settings).values(updates).returning();
      return newRow;
    }
    const [updated] = await db
      .update(settings)
      .set(updates)
      .where(eq(settings.id, existing.id))
      .returning();
    return updated;
  }

  async getGoals(): Promise<Goal[]> {
    return await db.select().from(goals).orderBy(desc(goals.createdAt));
  }

  async getGoal(id: number): Promise<(Goal & { transactions: Transaction[] }) | undefined> {
    const goal = await db.select().from(goals).where(eq(goals.id, id));
    if (!goal.length) return undefined;

    const history = await db
      .select()
      .from(transactions)
      .where(eq(transactions.goalId, id))
      .orderBy(desc(transactions.createdAt));

    return { ...goal[0], transactions: history };
  }

  async createGoal(insertGoal: InsertGoal): Promise<Goal> {
    const [newGoal] = await db.insert(goals).values(insertGoal).returning();
    return newGoal;
  }

  async deleteGoal(id: number): Promise<void> {
    await db.delete(transactions).where(eq(transactions.goalId, id));
    await db.delete(goals).where(eq(goals.id, id));
  }

  async updateGoalAmount(id: number, amountDelta: number): Promise<void> {
    await db
      .update(goals)
      .set({
        currentAmount: sql`${goals.currentAmount} + ${amountDelta}`,
      })
      .where(eq(goals.id, id));
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const [txn] = await db.insert(transactions).values(insertTransaction).returning();
    // Update the goal's current amount
    await this.updateGoalAmount(txn.goalId, txn.amount);
    return txn;
  }
}

export const storage = new DatabaseStorage();
