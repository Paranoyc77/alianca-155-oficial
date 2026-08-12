import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createTestContext(): TrpcContext {
  return {
    user: undefined,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("Aliança 155 tRPC Router", () => {
  it("should list divulgacoes and stats without error", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const list = await caller.alianca.list();
    expect(Array.isArray(list)).toBe(true);

    const stats = await caller.alianca.stats();
    expect(stats).toHaveProperty("total");
    expect(stats).toHaveProperty("grupos");
    expect(stats).toHaveProperty("canais");
    expect(stats).toHaveProperty("sites");
  });

  it("should fail login with incorrect password", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.alianca.login({ password: "wrongpassword" })
    ).rejects.toThrow();
  });
});
