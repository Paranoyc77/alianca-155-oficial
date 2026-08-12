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

  it("should login successfully and perform CRUD operations", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    await caller.alianca.login({ password: "155admin" });
    const check = await caller.alianca.checkAdmin();
    expect(check.isAdmin).toBe(true);

    // Create
    const createRes = await caller.alianca.create({
      title: "Grupo de Teste",
      description: "Descrição de teste",
      type: "grupo",
      link: "https://t.me/teste",
      image: "",
    });
    expect(createRes.success).toBe(true);
    expect(createRes.id).toBeTypeOf("number");

    // List & check
    const list = await caller.alianca.list();
    const created = list.find(x => x.id === createRes.id);
    expect(created).toBeDefined();
    expect(created?.title).toBe("Grupo de Teste");

    // Update
    const updateRes = await caller.alianca.update({
      id: createRes.id,
      title: "Grupo Atualizado",
      description: "Nova descrição",
      type: "grupo",
      link: "https://t.me/atualizado",
      image: "",
    });
    expect(updateRes.success).toBe(true);

    // Delete
    const deleteRes = await caller.alianca.delete({ id: createRes.id });
    expect(deleteRes.success).toBe(true);
  });

  it("should manage team members with name, role, photo and contact", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    await caller.alianca.login({ password: "155admin" });

    const createRes = await caller.alianca.createEquipe({
      nome: "Administrador de Teste",
      cargo: "Administrador",
      foto: "https://example.com/admin.jpg",
      numeroContato: "+55 11 99999-0000",
    });
    expect(createRes.success).toBe(true);
    expect(createRes.id).toBeTypeOf("number");

    const equipe = await caller.alianca.listEquipe();
    const created = equipe.find(item => item.id === createRes.id);
    expect(created?.nome).toBe("Administrador de Teste");
    expect(created?.numeroContato).toBe("+55 11 99999-0000");

    const updateRes = await caller.alianca.updateEquipe({
      id: createRes.id,
      nome: "Dono Atualizado",
      cargo: "Dono",
      foto: "https://example.com/dono.jpg",
      numeroContato: "+55 11 98888-0000",
    });
    expect(updateRes.success).toBe(true);

    const updated = (await caller.alianca.listEquipe()).find(item => item.id === createRes.id);
    expect(updated?.nome).toBe("Dono Atualizado");
    expect(updated?.cargo).toBe("Dono");

    const deleteRes = await caller.alianca.deleteEquipe({ id: createRes.id });
    expect(deleteRes.success).toBe(true);
  });

  it("should change password successfully and reject incorrect old password", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    await db.setConfigValue("admin_password", "155admin");
    await caller.alianca.login({ password: "155admin" });

    // Fail with wrong old password
    await expect(
      caller.alianca.changePassword({ oldPassword: "wrong", newPassword: "newpassword123" })
    ).rejects.toThrow();

    // Success with correct old password
    const res = await caller.alianca.changePassword({ oldPassword: "155admin", newPassword: "newpassword123" });
    expect(res.success).toBe(true);

    // Revert password back
    await db.setConfigValue("admin_password", "155admin");
  });
});
