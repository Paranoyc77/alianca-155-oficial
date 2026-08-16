import { describe, expect, it, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as db from "./db";

function createTestContext(): TrpcContext {
  const headers: Record<string, string> = {};
  return {
    user: undefined,
    req: {
      protocol: "https",
      headers,
    } as any,
    res: {
      clearCookie: () => {},
      setHeader: (name: string, val: string) => {
        headers[name.toLowerCase()] = val;
        if (name.toLowerCase() === "set-cookie") {
          const cookiePart = val.split(";")[0];
          headers["cookie"] = cookiePart;
        }
      },
    } as any,
  };
}

describe("Aliança 155 tRPC Router", () => {
  beforeAll(async () => {
    await db.setConfigValue("admin_password", "155admin");
  });

  it("should list divulgacoes and stats (public vs admin)", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const list = await caller.alianca.list();
    expect(Array.isArray(list)).toBe(true);

    const check = await caller.alianca.checkAdmin();
    expect(check.isAdmin).toBe(false);

    await expect(caller.alianca.stats()).rejects.toThrow();
  });

  it("should login successfully and perform CRUD operations with priority sorting", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    await caller.alianca.login({ password: "155admin" });
    const check = await caller.alianca.checkAdmin();
    expect(check.isAdmin).toBe(true);

    // Create normal priority
    const itemNormal = await caller.alianca.create({
      title: "Grupo Normal",
      description: "Normal",
      type: "grupo",
      link: "https://t.me/normal",
      image: "",
      prioridade: "normal",
    });

    // Create premium priority
    const itemPremium = await caller.alianca.create({
      title: "Grupo Premium",
      description: "Premium",
      type: "grupo",
      link: "https://t.me/premium",
      image: "",
      prioridade: "premium",
    });

    // Create VIP priority
    const itemVip = await caller.alianca.create({
      title: "Grupo VIP",
      description: "VIP",
      type: "grupo",
      link: "https://t.me/vip",
      image: "",
      prioridade: "vip",
    });

    // List & check sorting: premium should come before vip, which comes before normal
    const list = await caller.alianca.list();
    const pIdx = list.findIndex(x => x.id === itemPremium.id);
    const vIdx = list.findIndex(x => x.id === itemVip.id);
    const nIdx = list.findIndex(x => x.id === itemNormal.id);

    expect(pIdx).toBeLessThan(vIdx);
    expect(vIdx).toBeLessThan(nIdx);

    // Cleanup
    await caller.alianca.delete({ id: itemNormal.id });
    await caller.alianca.delete({ id: itemVip.id });
    await caller.alianca.delete({ id: itemPremium.id });
  });

  it("should manage team members with name, role, photo and contact", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    await caller.alianca.login({ password: "155admin" });

    const createRes = await caller.alianca.createEquipe({
      nome: "Admin Teste",
      cargo: "Dono",
      foto: "",
      numeroContato: "5511999999999",
    });
    expect(createRes.success).toBe(true);

    const equipeList = await caller.alianca.listEquipe();
    const member = equipeList.find(x => x.id === createRes.id);
    expect(member?.nome).toBe("Admin Teste");

    await caller.alianca.deleteEquipe({ id: createRes.id });
  });

  it("should change admin password successfully", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    await caller.alianca.login({ password: "155admin" });
    const res = await caller.alianca.changePassword({ oldPassword: "155admin", newPassword: "newsecurepass" });
    expect(res.success).toBe(true);

    // revert back
    await caller.alianca.changePassword({ oldPassword: "newsecurepass", newPassword: "155admin" });
  });
});
