import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const divulgacoes = mysqlTable("divulgacoes", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  type: mysqlEnum("type", ["grupo", "canal", "site"]).notNull(),
  link: text("link").notNull(),
  image: text("image"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const appConfig = mysqlTable("app_config", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 64 }).notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const recrutamentoInscricoes = mysqlTable("recrutamento_inscricoes", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  contato: varchar("contato", { length: 255 }).notNull(),
  experiencia: text("experiencia").notNull(),
  motivacao: text("motivacao").notNull(),
  status: varchar("status", { length: 50 }).default("pendente").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const equipeContatos = mysqlTable("equipe_contatos", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  cargo: varchar("cargo", { length: 100 }).notNull(), // 'Dono', 'Administrador', etc.
  foto: text("foto"),
  numeroContato: varchar("numeroContato", { length: 100 }).notNull(), // Ex: +55 11 99999-9999 ou @usuario
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const siteVisitas = mysqlTable("site_visitas", {
  id: int("id").autoincrement().primaryKey(),
  ipHash: varchar("ipHash", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const usuariosOnline = mysqlTable("usuarios_online", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("sessionId", { length: 128 }).notNull().unique(),
  lastSeenAt: timestamp("lastSeenAt").defaultNow().notNull(),
});

export type Divulgacao = typeof divulgacoes.$inferSelect;
export type InsertDivulgacao = typeof divulgacoes.$inferInsert;
export type AppConfig = typeof appConfig.$inferSelect;
export type RecrutamentoInscricao = typeof recrutamentoInscricoes.$inferSelect;
export type InsertRecrutamentoInscricao = typeof recrutamentoInscricoes.$inferInsert;
export type EquipeContato = typeof equipeContatos.$inferSelect;
export type InsertEquipeContato = typeof equipeContatos.$inferInsert;
