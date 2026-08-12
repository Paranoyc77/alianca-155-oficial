import { eq, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, divulgacoes, appConfig, recrutamentoInscricoes, equipeContatos, Divulgacao, InsertDivulgacao, RecrutamentoInscricao, InsertRecrutamentoInscricao, EquipeContato, InsertEquipeContato } from "../drizzle/schema";
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

export async function createRecrutamentoInscricao(data: InsertRecrutamentoInscricao): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const res = await db.insert(recrutamentoInscricoes).values(data);
  return Number(res[0].insertId);
}

export async function getAllRecrutamentoInscricoes(): Promise<RecrutamentoInscricao[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(recrutamentoInscricoes).orderBy(desc(recrutamentoInscricoes.id));
}

export async function deleteRecrutamentoInscricao(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(recrutamentoInscricoes).where(eq(recrutamentoInscricoes.id, id));
}

// ==========================================
// Equipe / Contatos Database Helpers
// ==========================================

export async function getAllEquipeContatos(): Promise<EquipeContato[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(equipeContatos).orderBy(desc(equipeContatos.id));
}

export async function createEquipeContato(data: InsertEquipeContato): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const res = await db.insert(equipeContatos).values(data);
  return Number(res[0].insertId);
}

export async function updateEquipeContato(id: number, data: Partial<InsertEquipeContato>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(equipeContatos).set(data).where(eq(equipeContatos.id, id));
}

export async function deleteEquipeContato(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(equipeContatos).where(eq(equipeContatos.id, id));
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
  };

  if (!db) return defaults;
  try {
    const res = await db.select().from(appConfig);
    const settings: Record<string, string> = { ...defaults };
    for (const row of res) {
      settings[row.key] = row.value;
    }
    return settings;
  } catch (err) {
    return defaults;
  }
}

export async function updateSiteSettings(settings: Record<string, string>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  for (const [key, value] of Object.entries(settings)) {
    if (value !== undefined) {
      await db.insert(appConfig).values({ key, value: String(value) }).onDuplicateKeyUpdate({ set: { value: String(value) } });
    }
  }
}

export async function clearAllData(): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(divulgacoes);
  await db.delete(recrutamentoInscricoes);
  await db.delete(equipeContatos);
}
