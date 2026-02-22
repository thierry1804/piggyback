import { describe, it, expect } from "vitest";
import { exportGoalToPdf, exportGoalToExcel } from "./exportGoal";
import type { Goal, Transaction } from "./localStorage";

const mockGoal: Goal & { transactions?: Transaction[] } = {
  id: 1,
  name: "Test Goal",
  description: null,
  targetAmount: 100000,
  currentAmount: 25000,
  icon: "🐷",
  color: "blue",
  currencyCode: "MGA",
  currencySymbol: "Ar",
  createdAt: new Date().toISOString(),
  deadline: "2025-12-31",
  transactions: [
    {
      id: 1,
      goalId: 1,
      amount: 25000,
      note: "First deposit",
      createdAt: new Date().toISOString(),
    },
  ],
};

describe("exportGoal", () => {
  it("exportGoalToPdf returns buffer when returnBuffer true and contains goal name", () => {
    const buf = exportGoalToPdf(mockGoal, "Ar", { returnBuffer: true });
    const arr = buf instanceof Uint8Array ? buf : new Uint8Array(buf as ArrayBuffer);
    expect(arr.length).toBeGreaterThan(100);
    const str = new TextDecoder().decode(arr);
    expect(str).toContain("%PDF");
    expect(str).toContain("Test Goal");
    expect(str).toContain("Ar");
  });

  it("exportGoalToExcel runs without throwing", () => {
    expect(() => exportGoalToExcel(mockGoal, "Ar")).not.toThrow();
  });
});
