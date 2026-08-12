import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";
import jwt from "jsonwebtoken";

const ADMIN_COOKIE = "alianca155_admin_session";
const JWT_SECRET_KEY = process.env.JWT_SECRET || "alianca155_secret_key";

const adminProcedure = publicProcedure.use(({ ctx, next }) => {
  const cookies = ctx.req.headers.cookie;
  if (!cookies) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Acesso não autorizado. Faça login no painel." });
  }

  const match = cookies.split(";").map(c => c.trim()).find(c => c.startsWith(`${ADMIN_COOKIE}=`));
  if (!match) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Sessão administrativa ausente ou expirada." });
  }

  const token = match.split("=")[1];
  try {
    jwt.verify(token, JWT_SECRET_KEY);
  } catch (err) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Sessão inválida." });
  }

  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  alianca: router({
    // Listar todas as divulgações (público)
    list: publicProcedure.query(async () => {
      return await db.getAllDivulgacoes();
    }),

    // Obter todas as configurações globais do site (público)
    getSettings: publicProcedure.query(async () => {
      return await db.getAllSiteSettings();
    }),

    // Enviar inscrição para recrutamento (público)
    submitRecrutamento: publicProcedure
      .input(z.object({
        nome: z.string().min(2, "Nome é obrigatório"),
        contato: z.string().min(3, "Contato é obrigatório"),
        experiencia: z.string().min(5, "Informe sua experiência"),
        motivacao: z.string().min(5, "Informe sua motivação"),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createRecrutamentoInscricao({
          nome: input.nome,
          contato: input.contato,
          experiencia: input.experiencia,
          motivacao: input.motivacao,
          status: "pendente",
        });
        return { success: true, id };
      }),

    // Listar inscrições de recrutamento (requer admin)
    listRecrutamento: adminProcedure.query(async () => {
      return await db.getAllRecrutamentoInscricoes();
    }),

    // Excluir inscrição de recrutamento (requer admin)
    deleteRecrutamento: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteRecrutamentoInscricao(input.id);
        return { success: true };
      }),

    // Atualizar configurações globais do site (requer admin)
    updateSettings: adminProcedure
      .input(z.record(z.string(), z.string()))
      .mutation(async ({ input }) => {
        await db.updateSiteSettings(input);
        return { success: true };
      }),

    // Estatísticas para o dashboard admin (requer admin)
    stats: adminProcedure.query(async () => {
      const all = await db.getAllDivulgacoes();
      const inscricoes = await db.getAllRecrutamentoInscricoes();
      const total = all.length;
      const grupos = all.filter(x => x.type === "grupo").length;
      const canais = all.filter(x => x.type === "canal").length;
      const sites = all.filter(x => x.type === "site").length;
      const totalInscricoes = inscricoes.length;
      return { total, grupos, canais, sites, totalInscricoes };
    }),

    // Verificar se sessão admin é válida
    checkAdmin: publicProcedure.query(({ ctx }) => {
      const cookies = ctx.req.headers.cookie || "";
      const match = cookies.split(";").map(c => c.trim()).find(c => c.startsWith(`${ADMIN_COOKIE}=`));
      if (!match) return { isAdmin: false };
      const token = match.split("=")[1];
      try {
        jwt.verify(token, JWT_SECRET_KEY);
        return { isAdmin: true };
      } catch (e) {
        return { isAdmin: false };
      }
    }),

    // Login com senha simples definindo cookie HTTP-only
    login: publicProcedure
      .input(z.object({ password: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const adminPass = await db.getConfigValue("admin_password", "155admin");
        if (input.password === adminPass) {
          const token = jwt.sign({ role: "admin" }, JWT_SECRET_KEY, { expiresIn: "7d" });
          const isSecure = ctx.req.protocol === "https";
          const cookieStr = `${ADMIN_COOKIE}=${token}; Path=/; HttpOnly; SameSite=${isSecure ? "none" : "lax"}; Max-Age=${7 * 24 * 3600}${isSecure ? "; Secure" : ""}`;
          ctx.res.setHeader("Set-Cookie", cookieStr);
          return { success: true };
        }
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Senha incorreta." });
      }),

    // Logout do admin limpando cookie
    adminLogout: publicProcedure.mutation(({ ctx }) => {
      const isSecure = ctx.req.protocol === "https";
      const cookieStr = `${ADMIN_COOKIE}=; Path=/; HttpOnly; SameSite=${isSecure ? "none" : "lax"}; Max-Age=0${isSecure ? "; Secure" : ""}`;
      ctx.res.setHeader("Set-Cookie", cookieStr);
      return { success: true };
    }),

    // Alterar senha do admin (requer admin)
    changePassword: adminProcedure
      .input(z.object({ oldPassword: z.string(), newPassword: z.string() }))
      .mutation(async ({ input }) => {
        const adminPass = await db.getConfigValue("admin_password", "155admin");
        if (input.oldPassword !== adminPass) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Senha atual incorreta." });
        }
        if (input.newPassword.length < 6) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "A nova senha precisa ter pelo menos 6 caracteres." });
        }
        await db.setConfigValue("admin_password", input.newPassword);
        return { success: true };
      }),

    // Criar divulgação (requer admin)
    create: adminProcedure
      .input(z.object({
        title: z.string().min(1, "Título é obrigatório"),
        description: z.string().optional().default(""),
        type: z.enum(["grupo", "canal", "site"]),
        link: z.string().min(1, "Link é obrigatório"),
        image: z.string().optional().default(""),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createDivulgacao({
          title: input.title,
          description: input.description || null,
          type: input.type,
          link: input.link,
          image: input.image || null,
        });
        return { success: true, id };
      }),

    // Atualizar divulgação (requer admin)
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().min(1),
        description: z.string().optional().default(""),
        type: z.enum(["grupo", "canal", "site"]),
        link: z.string().min(1),
        image: z.string().optional().default(""),
      }))
      .mutation(async ({ input }) => {
        await db.updateDivulgacao(input.id, {
          title: input.title,
          description: input.description || null,
          type: input.type,
          link: input.link,
          image: input.image || null,
        });
        return { success: true };
      }),

    // Excluir divulgação (requer admin)
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteDivulgacao(input.id);
        return { success: true };
      }),

    // Zona de perigo: limpar todos os dados (requer admin)
    clearAll: adminProcedure.mutation(async () => {
      await db.clearAllData();
      return { success: true };
    }),
  }),
});

export type AppRouter = typeof appRouter;
