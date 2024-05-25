import { router, protectedProcedure, publicProcedure } from "../trpc";
import { db } from "../../database/index";
import { eq } from "drizzle-orm";
import { items } from "../../database/schema";
import { z } from "zod";

export const postItemRouter = router({
  item: protectedProcedure
    .input(
      z.object({
        itemName: z.string(),
        description: z.string(),
        price: z.number(),
        quantity: z.number(),
        image: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { itemName, description, price, quantity, image } = input;
    }),
});
