import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Goals
  app.get(api.goals.list.path, async (req, res) => {
    const goals = await storage.getGoals();
    res.json(goals);
  });

  app.post(api.goals.create.path, async (req, res) => {
    try {
      const input = api.goals.create.input.parse(req.body);
      const goal = await storage.createGoal(input);
      res.status(201).json(goal);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.get(api.goals.get.path, async (req, res) => {
    const goal = await storage.getGoal(Number(req.params.id));
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    res.json(goal);
  });

  app.delete(api.goals.delete.path, async (req, res) => {
    const goal = await storage.getGoal(Number(req.params.id));
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    await storage.deleteGoal(Number(req.params.id));
    res.status(204).send();
  });

  // Transactions
  app.post(api.transactions.create.path, async (req, res) => {
    try {
      const input = api.transactions.create.input.parse(req.body);
      
      // Verify goal exists
      const goal = await storage.getGoal(input.goalId);
      if (!goal) {
        return res.status(404).json({ message: 'Goal not found' });
      }

      const txn = await storage.createTransaction(input);
      res.status(201).json(txn);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Seed Data (if empty)
  const existingGoals = await storage.getGoals();
  if (existingGoals.length === 0) {
    await storage.createGoal({
      name: "New Bike 🚲",
      description: "Saving up for a mountain bike",
      targetAmount: 50000, // $500.00
      currentAmount: 0,
      icon: "🚲",
      color: "emerald"
    });
    await storage.createGoal({
      name: "Vacation 🏖️",
      description: "Trip to Hawaii",
      targetAmount: 200000, // $2000.00
      currentAmount: 0,
      icon: "🏖️",
      color: "blue"
    });
     await storage.createGoal({
      name: "Emergency Fund 🚑",
      description: "Rainy day savings",
      targetAmount: 100000, // $1000.00
      currentAmount: 0,
      icon: "🚑",
      color: "red"
    });
  }

  return httpServer;
}
