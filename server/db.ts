import { eq, desc, lt, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, divulgacoes, Divulgacao, InsertDivulgacao, recrutamentoInscricoes, RecrutamentoInscricao, equipeContatos, EquipeContato, InsertEquipeContato, siteVisitas, usuariosOnline, appConfig } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

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

export async function deleteRecrutamentoInscricao(id: number): Promise<void> {
  await deleteRecrutamento(id);
}

// ==========================================
// Equipe Contatos Database Helpers
// ==========================================

export async function getAllEquipe(): Promise<EquipeContato[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(equipeContatos).orderBy(desc(equipeContatos.id));
}

export async function getAllEquipeContatos(): Promise<EquipeContato[]> {
  return await getAllEquipe();
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
  try {
    await db.delete(usuariosOnline).where(lt(usuariosOnline.lastSeenAt, twoMinutesAgo));
    const res = await db.select({ count: sql<number>`count(*)` }).from(usuariosOnline);
    return Number(res[0]?.count || 1);
  } catch (e) {
    return 1;
  }
}

export async function getConfigValue(key: string, defaultValue: string): Promise<string> {
  const db = await getDb();
  if (!db) return defaultValue;
  const res = await db.select().from(appConfig).where(eq(appConfig.key, key)).limit(1);
  if (res.length > 0) {
    return res[0].value;
  }
  return defaultValue;
}

export async function setConfigValue(key: string, value: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(appConfig).values({ key, value }).onDuplicateKeyUpdate({ set: { value } });
}

export async function updateSiteSettings(settings: Record<string, string>): Promise<void> {
  for (const [key, value] of Object.entries(settings)) {
    await setConfigValue(key, value);
  }
}

export async function clearAllData(): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(divulgacoes);
  await db.delete(recrutamentoInscricoes);
  await db.delete(equipeContatos);
  await db.delete(siteVisitas);
  await db.delete(usuariosOnline);
  await db.delete(appConfig);
}

export async function getAllSiteSettings(): Promise<Record<string, string>> {
  const db = await getDb();
  const defaults = {
    site_title: "Aliança 155",
    site_subtitle: "Central de Divulgações",
    hero_badge: "ALIANÇA 155",
    hero_title_main: "Central de Divulgações",
    hero_title_accent: "Oficial",
    hero_description: "Encontre os melhores grupos, canais e sites recomendados pela nossa comunidade.",
    footer_text: "Aliança 155 — Todos os direitos reservados.",
    admin_btn_text: "Painel Admin",
    site_logo: "",
    site_bg_image: "",
    site_music_url: "",
    site_music_title: "Trilha Sonora Oficial",
    // Color tokens
    color_bg: "#050505",
    color_card_bg: "#0d0d0d",
    color_card_border: "#222222",
    color_text_main: "#ffffff",
    color_text_muted: "#969696",
    color_primary: "#8b5cf6",
    color_primary_hover: "#7c3aed",
    color_accent: "#c4b5fd",
    color_button_bg: "#171717",
  };

  if (!db) return defaults;
  try {
    const res = await db.select().from(appConfig);
    const settings: Record<string, string> = { ...defaults };
    for (const row of res) {
      settings[row.key] = row.value;
    }
    return settings;
  } catch (error) {
    return defaults;
  }
}
