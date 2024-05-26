import { initTRPC, TRPCError } from "@trpc/server";
import { Context, Session } from "./context";

const t = initTRPC.context<Context>().create();

export const router = t.router;

export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use((opts) => {
  if (!opts.ctx.session || !opts.ctx.session.userId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "User is not authenticated.",
    });
  }

  return opts.next({
    ctx: {
      session: opts.ctx.session as Session,
    },
  });
});
