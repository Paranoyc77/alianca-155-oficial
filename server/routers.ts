import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";
import jwt from "jsonwebtoken";

const ADMIN_COOKIE = "alianca_admin_session";
const JWT_SECRET_KEY = process.env.JWT_SECRET || "alianca_secret_155_key";

const adminProcedure = publicProcedure.use(({ ctx, next }) => {
  const cookies = ctx.req.headers.cookie || "";
  const match = cookies.split(";").map(c => c.trim()).find(c => c.startsWith(`${ADMIN_COOKIE}=`));
  if (!match) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Acesso não autorizado. Faça login no painel admin." });
  }
  const token = match.split("=")[1];
  try {
    jwt.verify(token, JWT_SECRET_KEY);
    return next({ ctx });
  } catch (e) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Sessão expirada. Faça login novamente." });
  }
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
    // Listar todas as divulgações ordenadas por prioridade (premium, vip, normal) e ID
    list: publicProcedure.query(async () => {
      const items = await db.getAllDivulgacoes();
      const score = (p: string) => (p === "premium" ? 3 : p === "vip" ? 2 : 1);
      return items.sort((a, b) => {
        const pA = score(a.prioridade || "normal");
        const pB = score(b.prioridade || "normal");
        if (pA !== pB) return pB - pA;
        return b.id - a.id;
      });
    }),

    getSettings: publicProcedure.query(async () => {
      return await db.getAllSiteSettings();
    }),

    listRecrutamento: adminProcedure.query(async () => {
      return await db.getAllRecrutamento();
    }),

    submitRecrutamento: publicProcedure
      .input(z.object({
        nome: z.string().min(1),
        contato: z.string().min(1),
        experiencia: z.string().min(1),
        motivacao: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createRecrutamento(input);
        return { success: true, id };
      }),

    deleteRecrutamento: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteRecrutamento(input.id);
        return { success: true };
      }),

    listEquipe: publicProcedure.query(async () => {
      return await db.getAllEquipe();
    }),

    createEquipe: adminProcedure
      .input(z.object({
        nome: z.string().min(1),
        cargo: z.string().min(1),
        foto: z.string().optional().default(""),
        numeroContato: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createEquipe({
          nome: input.nome,
          cargo: input.cargo,
          foto: input.foto || null,
          numeroContato: input.numeroContato,
        });
        return { success: true, id };
      }),

    updateEquipe: adminProcedure
      .input(z.object({
        id: z.number(),
        nome: z.string().min(1),
        cargo: z.string().min(1),
        foto: z.string().optional().default(""),
        numeroContato: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        await db.updateEquipe(input.id, {
          nome: input.nome,
          cargo: input.cargo,
          foto: input.foto || null,
          numeroContato: input.numeroContato,
        });
        return { success: true };
      }),

    deleteEquipe: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteEquipe(input.id);
        return { success: true };
      }),

    // Bot Aluguel & Planos Procedures
    listBotPlanos: publicProcedure.query(async () => {
      return await db.getAllBotPlanos();
    }),

    createBotPlano: adminProcedure
      .input(z.object({
        nome: z.string().min(1),
        descricao: z.string().min(1),
        preco: z.string().min(1),
        duracaoDias: z.number().min(1),
        recursos: z.string().min(1),
        ativo: z.number().optional().default(1),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createBotPlano(input);
        return { success: true, id };
      }),

    updateBotPlano: adminProcedure
      .input(z.object({
        id: z.number(),
        nome: z.string().min(1),
        descricao: z.string().min(1),
        preco: z.string().min(1),
        duracaoDias: z.number().min(1),
        recursos: z.string().min(1),
        ativo: z.number(),
      }))
      .mutation(async ({ input }) => {
        await db.updateBotPlano(input.id, {
          nome: input.nome,
          descricao: input.descricao,
          preco: input.preco,
          duracaoDias: input.duracaoDias,
          recursos: input.recursos,
          ativo: input.ativo,
        });
        return { success: true };
      }),

    deleteBotPlano: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteBotPlano(input.id);
        return { success: true };
      }),

    listBotAlugueis: adminProcedure.query(async () => {
      return await db.getAllBotAlugueis();
    }),

    alugarBot: publicProcedure
      .input(z.object({
        planoId: z.number(),
        compradorNome: z.string().min(1),
        compradorContato: z.string().min(1),
        botTokenOuUser: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        const planos = await db.getAllBotPlanos();
        const plano = planos.find(p => p.id === input.planoId);
        if (!plano) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Plano selecionado não foi encontrado." });
        }

        const expiresAt = new Date(Date.now() + plano.duracaoDias * 24 * 60 * 1000 * 60 * 60); // dias para ms
        // Correção do cálculo de data:
        const realExpiresAt = new Date(Date.now() + plano.duracaoDias * 86400000);

        const id = await db.createBotAluguel({
          planoId: plano.id,
          planoNome: plano.nome,
          compradorNome: input.compradorNome,
          compradorContato: input.compradorContato,
          botTokenOuUser: input.botTokenOuUser,
          statusPagamento: "aprovado", // Simulação de aluguel automático direto
          statusBot: "ativo",
          expiresAt: realExpiresAt,
        });

        return { success: true, id, planoNome: plano.nome, expiresAt: realExpiresAt };
      }),

    updateBotAluguelStatus: adminProcedure
      .input(z.object({
        id: z.number(),
        statusPagamento: z.string(),
        statusBot: z.string(),
      }))
      .mutation(async ({ input }) => {
        await db.updateBotAluguelStatus(input.id, input.statusPagamento, input.statusBot);
        return { success: true };
      }),

    deleteBotAluguel: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteBotAluguel(input.id);
        return { success: true };
      }),

    updateSettings: adminProcedure
      .input(z.record(z.string(), z.string()))
      .mutation(async ({ input }) => {
        await db.updateSiteSettings(input);
        return { success: true };
      }),

    stats: adminProcedure.query(async () => {
      const all = await db.getAllDivulgacoes();
      const inscricoes = await db.getAllRecrutamentoInscricoes();
      const equipe = await db.getAllEquipeContatos();
      const alugueis = await db.getAllBotAlugueis();
      const totalVisitas = await db.getTotalVisitas();
      const usuariosOnline = await db.getOnlineCount();

      const total = all.length;
      const grupos = all.filter(x => x.type === "grupo").length;
      const canais = all.filter(x => x.type === "canal").length;
      const sites = all.filter(x => x.type === "site").length;
      const totalInscricoes = inscricoes.length;
      const totalEquipe = equipe.length;
      const totalAlugueis = alugueis.length;

      return { total, grupos, canais, sites, totalInscricoes, totalEquipe, totalAlugueis, totalVisitas, usuariosOnline };
    }),

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

    login: publicProcedure
      .input(z.object({ password: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const adminPass = await db.getConfigValue("admin_password", "155admin");
        if (input.password !== adminPass) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Senha incorreta." });
        }
        const token = jwt.sign({ role: "admin" }, JWT_SECRET_KEY, { expiresIn: "7d" });
        const isSecure = ctx.req.protocol === "https" || ctx.req.headers["x-forwarded-proto"] === "https";
        
        ctx.res.setHeader("Set-Cookie", `${ADMIN_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 3600}${isSecure ? "; Secure" : ""}`);
        return { success: true };
      }),

    logout: publicProcedure.mutation(({ ctx }) => {
      const isSecure = ctx.req.protocol === "https" || ctx.req.headers["x-forwarded-proto"] === "https";
      ctx.res.setHeader("Set-Cookie", `${ADMIN_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${isSecure ? "; Secure" : ""}`);
      return { success: true };
    }),

    changePassword: adminProcedure
      .input(z.object({
        oldPassword: z.string(),
        newPassword: z.string().min(6),
      }))
      .mutation(async ({ input }) => {
        const currentPass = await db.getConfigValue("admin_password", "155admin");
        if (input.oldPassword !== currentPass) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Senha atual incorreta." });
        }
        await db.setConfigValue("admin_password", input.newPassword);
        return { success: true };
      }),

    pingVisit: publicProcedure
      .input(z.object({ sessionId: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const ip = (ctx.req.headers["x-forwarded-for"] as string) || ctx.req.socket?.remoteAddress || "";
        const ipHash = ip ? Buffer.from(ip).toString("base64").substring(0, 32) : undefined;
        
        await db.recordVisit(ipHash);
        await db.heartbeatOnline(input.sessionId);

        const totalVisitas = await db.getTotalVisitas();
        const usuariosOnline = await db.getOnlineCount();
        return { totalVisitas, usuariosOnline };
      }),

    heartbeat: publicProcedure
      .input(z.object({ sessionId: z.string() }))
      .mutation(async ({ input }) => {
        await db.heartbeatOnline(input.sessionId);
        const usuariosOnline = await db.getOnlineCount();
        return { usuariosOnline };
      }),

    // Criar divulgação (requer admin)
    create: adminProcedure
      .input(z.object({
        title: z.string().min(1, "Título é obrigatório"),
        description: z.string().optional().default(""),
        type: z.enum(["grupo", "canal", "site"]),
        link: z.string().min(1, "Link é obrigatório"),
        image: z.string().optional().default(""),
        prioridade: z.enum(["normal", "vip", "premium"]).optional().default("normal"),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createDivulgacao({
          title: input.title,
          description: input.description || null,
          type: input.type,
          link: input.link,
          image: input.image || null,
          prioridade: input.prioridade,
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
        prioridade: z.enum(["normal", "vip", "premium"]).optional().default("normal"),
      }))
      .mutation(async ({ input }) => {
        await db.updateDivulgacao(input.id, {
          title: input.title,
          description: input.description || null,
          type: input.type,
          link: input.link,
          image: input.image || null,
          prioridade: input.prioridade,
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

    clearAll: adminProcedure.mutation(async () => {
      await db.clearAllData();
      return { success: true };
    }),
  }),
});

export type AppRouter = typeof appRouter;
