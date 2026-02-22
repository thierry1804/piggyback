import { describe, it, expect, beforeEach } from "vitest";
import { syncSupabaseToLocal } from "./supabase";
import { localStorageService } from "./localStorage";

const groupId = "group-1";

function createMockClient(planId: "free" | "premium") {
  return {
    auth: {
      getUser: () => Promise.resolve({ data: { user: { id: "user-1" } } }),
    },
    from: (table: string) => {
      if (table === "user_groups") {
        return {
          select: () => ({
            eq: () => ({
              limit: () => Promise.resolve({ data: [{ group_id: groupId }], error: null }),
            }),
          }),
        };
      }
      if (table === "abonnements") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: () => Promise.resolve({ data: { plan_id: planId }, error: null }),
            }),
          }),
        };
      }
      if (table === "goals") {
        return {
          select: () => ({
            eq: () => ({
              order: () => Promise.resolve({ data: [], error: null }),
            }),
          }),
        };
      }
      if (table === "transactions") {
        return {
          select: () => ({
            in: () => Promise.resolve({ data: [], error: null }),
          }),
        };
      }
      if (table === "settings") {
        return {
          select: () => ({
            eq: () => ({
              single: () =>
                Promise.resolve({
                  data: { currencyCode: "MGA", currencySymbol: "Ar" },
                  error: null,
                }),
            }),
          }),
        };
      }
      return {};
    },
  } as any;
}

describe("syncSupabaseToLocal – plan appliqué aux settings", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("après sync avec abonnements plan_id premium, les settings locaux ont plan premium", async () => {
    await syncSupabaseToLocal(createMockClient("premium"));
    const settings = localStorageService.getSettings();
    expect(settings.plan).toBe("premium");
  });

  it("après sync avec abonnements plan_id free, les settings locaux ont plan free", async () => {
    await syncSupabaseToLocal(createMockClient("free"));
    const settings = localStorageService.getSettings();
    expect(settings.plan).toBe("free");
  });
});
