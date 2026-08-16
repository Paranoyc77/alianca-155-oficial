import { eq, desc, lt, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, divulgacoes, Divulgacao, InsertDivulgacao, appConfig, AppConfig, recrutamentoInscricoes, RecrutamentoInscricao, equipeContatos, EquipeContato, InsertEquipeContato, siteVisitas, usuariosOnline, botPlanos, BotPlano, InsertBotPlano, botAlugueis, BotAluguel, InsertBotAluguel } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ==========================================
// Divulgacoes Database Helpers
// ==========================================

export async function getAllDivulgacoes(): Promise<Divulgacao[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(divulgacoes).orderBy(desc(divulgacoes.id));
}

export async function getDivulgacaoById(id: number): Promise<Divulgacao | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const res = await db.select().from(divulgacoes).where(eq(divulgacoes.id, id)).limit(1);
  return res[0];
}

export async function createDivulgacao(data: InsertDivulgacao): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const res = await db.insert(divulgacoes).values(data);
  return Number(res[0].insertId);
}

export async function updateDivulgacao(id: number, data: Partial<InsertDivulgacao>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(divulgacoes).set(data).where(eq(divulgacoes.id, id));
}

export async function deleteDivulgacao(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(divulgacoes).where(eq(divulgacoes.id, id));
}

// ==========================================
// Recrutamento Database Helpers
// ==========================================

export async function getAllRecrutamento(): Promise<RecrutamentoInscricao[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(recrutamentoInscricoes).orderBy(desc(recrutamentoInscricoes.id));
}

export async function getAllRecrutamentoInscricoes(): Promise<RecrutamentoInscricao[]> {
  return await getAllRecrutamento();
}

export async function createRecrutamento(data: typeof recrutamentoInscricoes.$inferInsert): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const res = await db.insert(recrutamentoInscricoes).values(data);
  return Number(res[0].insertId);
}

export async function createRecrutamentoInscricao(data: typeof recrutamentoInscricoes.$inferInsert): Promise<number> {
  return await createRecrutamento(data);
}

export async function deleteRecrutamento(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(recrutamentoInscricoes).where(eq(recrutamentoInscricoes.id, id));
}

// ==========================================
// Equipe Contatos Database Helpers
// ==========================================

export async function getAllEquipeContatos(): Promise<EquipeContato[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(equipeContatos).orderBy(desc(equipeContatos.id));
}

export async function getAllEquipe(): Promise<EquipeContato[]> {
  return await getAllEquipeContatos();
}

export async function createEquipe(data: InsertEquipeContato): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const res = await db.insert(equipeContatos).values(data);
  return Number(res[0].insertId);
}

export async function createEquipeContato(data: InsertEquipeContato): Promise<number> {
  return await createEquipe(data);
}

export async function updateEquipe(id: number, data: Partial<InsertEquipeContato>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(equipeContatos).set(data).where(eq(equipeContatos.id, id));
}

export async function updateEquipeContato(id: number, data: Partial<InsertEquipeContato>): Promise<void> {
  await updateEquipe(id, data);
}

export async function deleteEquipe(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(equipeContatos).where(eq(equipeContatos.id, id));
}

export async function deleteEquipeContato(id: number): Promise<void> {
  await deleteEquipe(id);
}

// ==========================================
// Bot Rental Database Helpers
// ==========================================

export async function getAllBotPlanos(): Promise<BotPlano[]> {
  const db = await getDb();
  if (!db) {
    // Return default plans if DB is uninitialized
    return [
      { id: 1, nome: "Plano Teste (7 Dias)", descricao: "Ideal para testar todas as funções da bot em seu grupo.", preco: "10.00", duracaoDias: 7, recursos: "Moderação automática,Anti-flood,Boas-vindas personalizadas", ativo: 1, createdAt: new Date() },
      { id: 2, nome: "Plano Mensal VIP", descricao: "Acesso completo por 30 dias com suporte prioritário e comandos avançados.", preco: "29.90", duracaoDias: 30, recursos: "Todos os recursos,Moderação avançada,Sistema de XP e Ranking,Suporte via WhatsApp", ativo: 1, createdAt: new Date() },
      { id: 3, nome: "Plano Trimestral PRO", descricao: "Economize com o plano de 3 meses e tenha atualizações em primeira mão.", preco: "69.90", duracaoDias: 90, recursos: "Todos os recursos do VIP,Backup automático,Customização completa do prefixo", ativo: 1, createdAt: new Date() },
    ];
  }
  const planos = await db.select().from(botPlanos).orderBy(botPlanos.preco);
  if (planos.length === 0) {
    // Seed default plans if empty
    await db.insert(botPlanos).values([
      { nome: "Plano Teste (7 Dias)", descricao: "Ideal para testar todas as funções da bot em seu grupo.", preco: "10.00", duracaoDias: 7, recursos: "Moderação automática,Anti-flood,Boas-vindas personalizadas", ativo: 1 },
      { nome: "Plano Mensal VIP", descricao: "Acesso completo por 30 dias com suporte prioritário e comandos avançados.", preco: "29.90", duracaoDias: 30, recursos: "Todos os recursos,Moderação avançada,Sistema de XP e Ranking,Suporte via WhatsApp", ativo: 1 },
      { nome: "Plano Trimestral PRO", descricao: "Economize com o plano de 3 meses e tenha atualizações em primeira mão.", preco: "69.90", duracaoDias: 90, recursos: "Todos os recursos do VIP,Backup automático,Customização completa do prefixo", ativo: 1 },
    ]);
    return await db.select().from(botPlanos);
  }
  return planos;
}

export async function createBotPlano(data: InsertBotPlano): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const res = await db.insert(botPlanos).values(data);
  return Number(res[0].insertId);
}

export async function updateBotPlano(id: number, data: Partial<InsertBotPlano>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(botPlanos).set(data).where(eq(botPlanos.id, id));
}

export async function deleteBotPlano(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(botPlanos).where(eq(botPlanos.id, id));
}

export async function getAllBotAlugueis(): Promise<BotAluguel[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(botAlugueis).orderBy(desc(botAlugueis.id));
}

export async function createBotAluguel(data: InsertBotAluguel): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const res = await db.insert(botAlugueis).values(data);
  return Number(res[0].insertId);
}

export async function updateBotAluguelStatus(id: number, statusPagamento: string, statusBot: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(botAlugueis).set({ statusPagamento, statusBot }).where(eq(botAlugueis.id, id));
}

export async function deleteBotAluguel(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(botAlugueis).where(eq(botAlugueis.id, id));
}

// ==========================================
// Métricas & Visitas Database Helpers
// ==========================================

export async function recordVisit(ipHash?: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(siteVisitas).values({ ipHash: ipHash || null });
}

export async function getTotalVisitas(): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const res = await db.select({ count: sql<number>`count(*)` }).from(siteVisitas);
  return Number(res[0]?.count || 0);
}

export async function heartbeatOnline(sessionId: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
  try {
    await db.delete(usuariosOnline).where(lt(usuariosOnline.lastSeenAt, twoMinutesAgo));
  } catch (e) {}

  await db.insert(usuariosOnline)
    .values({ sessionId, lastSeenAt: new Date() })
    .onDuplicateKeyUpdate({ set: { lastSeenAt: new Date() } });
}

export async function getOnlineCount(): Promise<number> {
  const db = await getDb();
  if (!db) return 1;
  const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
  const res = await db.select({ count: sql<number>`count(*)` }).from(usuariosOnline).where(sql`lastSeenAt >= ${twoMinutesAgo}`);
  return Number(res[0]?.count || 1);
}

// ==========================================
// Site Config Helpers
// ==========================================

export async function getConfigValue(key: string, defaultValue: string): Promise<string> {
  const db = await getDb();
  if (!db) return defaultValue;
  const res = await db.select().from(appConfig).where(eq(appConfig.key, key)).limit(1);
  return res.length > 0 ? res[0].value : defaultValue;
}

export async function setConfigValue(key: string, value: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(appConfig).values({ key, value }).onDuplicateKeyUpdate({ set: { value } });
}

export async function getAllSiteSettings(): Promise<Record<string, string>> {
  const db = await getDb();
  if (!db) return {};
  const rows = await db.select().from(appConfig);
  const settings: Record<string, string> = {};
  rows.forEach(r => {
    settings[r.key] = r.value;
  });
  return settings;
}

export async function updateSiteSettings(settings: Record<string, string>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  for (const [key, value] of Object.entries(settings)) {
    await db.insert(appConfig).values({ key, value }).onDuplicateKeyUpdate({ set: { value } });
  }
}

export async function clearAllData(): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(divulgacoes);
  await db.delete(recrutamentoInscricoes);
  await db.delete(equipeContatos);
  await db.delete(siteVisitas);
  await db.delete(usuariosOnline);
  await db.delete(botPlanos);
  await db.delete(botAlugueis);
  await db.delete(appConfig);
}
