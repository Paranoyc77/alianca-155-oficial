import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";

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
    // Listar todas as divulgações
    list: publicProcedure.query(async () => {
      return await db.getAllDivulgacoes();
    }),

    // Estatísticas para o dashboard admin
    stats: publicProcedure.query(async () => {
      const all = await db.getAllDivulgacoes();
      const total = all.length;
      const grupos = all.filter(x => x.type === "grupo").length;
      const canais = all.filter(x => x.type === "canal").length;
      const sites = all.filter(x => x.type === "site").length;
      return { total, grupos, canais, sites };
    }),

    // Login com senha simples
    login: publicProcedure
      .input(z.object({ password: z.string() }))
      .mutation(async ({ input }) => {
        const adminPass = await db.getConfigValue("admin_password", "155admin");
        if (input.password === adminPass) {
          return { success: true };
        }
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Senha incorreta." });
      }),

    // Alterar senha do admin
    changePassword: publicProcedure
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

    // Criar divulgação
    create: publicProcedure
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

    // Atualizar divulgação
    update: publicProcedure
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

    // Excluir divulgação
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteDivulgacao(input.id);
        return { success: true };
      }),

    // Zona de perigo: limpar todos os dados
    clearAll: publicProcedure.mutation(async () => {
      await db.clearAllData();
      return { success: true };
    }),
  }),
});

export type AppRouter = typeof appRouter;
