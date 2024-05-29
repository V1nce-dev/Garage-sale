import { router, protectedProcedure } from "../trpc";
import { db } from "../../database/index";
import { and, eq } from "drizzle-orm";
import { cart, items } from "../../database/schema";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const cartRouter = router({
  addToCart: protectedProcedure
    .input(
      z.object({
        itemId: z.string().uuid(),
        quantity: z.number().min(1),
      })
    )
    .mutation(async ({ input: { itemId }, ctx }) => {
      const userId = ctx.session.userId;

      const item = await db.insert(cart).values({ userId, itemId }).returning();

      if (item) {
        return item;
      } else {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could not add item to cart",
        });
      }
    }),
});
