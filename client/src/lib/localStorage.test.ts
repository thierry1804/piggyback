import { describe, it, expect, beforeEach } from "vitest";
import { localStorageService } from "./localStorage";

const STORAGE_KEYS = {
  GOALS: "simple-piggy-goals",
  SETTINGS: "simple-piggy-settings",
  NEXT_GOAL_ID: "simple-piggy-next-goal-id",
} as const;

const defaultGoalData = {
  name: "Test goal",
  description: null,
  targetAmount: 100000,
  icon: "🐷",
  color: "blue",
  currencyCode: "MGA",
  currencySymbol: "Ar",
  deadline: null,
};

function setStorage(settings: { plan?: "free" | "premium" }, goalsCount: number) {
  localStorage.setItem(
    STORAGE_KEYS.SETTINGS,
    JSON.stringify({
      currencyCode: "MGA",
      currencySymbol: "Ar",
      language: "en",
      plan: settings.plan ?? "free",
    })
  );
  const goals = Array.from({ length: goalsCount }, (_, i) => ({
    id: i + 1,
    name: `Goal ${i + 1}`,
    description: null,
    targetAmount: 100000,
    currentAmount: 0,
    icon: "🐷",
    color: "blue",
    currencyCode: "MGA",
    currencySymbol: "Ar",
    createdAt: new Date().toISOString(),
    deadline: null,
  }));
  localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  localStorage.setItem(STORAGE_KEYS.NEXT_GOAL_ID, String(goalsCount + 1));
}

describe("LocalStorageService – plan et limites", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("avec plan free et déjà 1 goal, createGoal lève FREE_LIMIT_ONE_GOAL", () => {
    setStorage({ plan: "free" }, 1);
    expect(() => localStorageService.createGoal(defaultGoalData)).toThrow("FREE_LIMIT_ONE_GOAL");
  });

  it("avec plan premium, on peut créer plusieurs goals", () => {
    setStorage({ plan: "premium" }, 2);
    const created = localStorageService.createGoal(defaultGoalData);
    expect(created.id).toBe(3);
    expect(localStorageService.getGoals().length).toBe(3);
  });

  it("avec plan free et 0 goal, on peut créer 1 goal", () => {
    setStorage({ plan: "free" }, 0);
    const created = localStorageService.createGoal(defaultGoalData);
    expect(created.id).toBe(1);
    expect(localStorageService.getGoals().length).toBe(1);
  });

  it("settings accepte et persiste plan", () => {
    localStorage.clear();
    localStorageService.setSettings({
      currencyCode: "MGA",
      currencySymbol: "Ar",
      language: "en",
      plan: "premium",
    });
    const settings = localStorageService.getSettings();
    expect(settings.plan).toBe("premium");
  });
});
