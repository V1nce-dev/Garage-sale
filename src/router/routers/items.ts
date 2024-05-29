import { router, protectedProcedure, publicProcedure } from "../trpc";
import { db } from "../../database/index";
import { and, eq } from "drizzle-orm";
import { items } from "../../database/schema";
import { users } from "../../database/schema";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const itemRouter = router({
  getAllItems: publicProcedure.query(async () => {
    const products = await db
      .select({
        username: items.username,
        itemName: items.itemName,
        description: items.description,
        price: items.price,
        date: items.date,
        quantity: items.quantity,
        image: items.image,
      })
      .from(items);

    if (products) {
      return products;
    }
  }),
  userProfile: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.userId;

    const products = await db
      .select({
        userId: items.userId,
        itemId: items.itemId,
        username: items.username,
        itemName: items.itemName,
        description: items.description,
        price: items.price,
        date: items.date,
        quantity: items.quantity,
        image: items.image,
      })
      .from(items)
      .where(eq(items.userId, userId));

    if (products) {
      return products;
    }
  }),
  postItem: protectedProcedure
    .input(
      z.object({
        itemName: z.string(),
        description: z.string(),
        price: z.number(),
        quantity: z.number(),
        image: z.string(),
      })
    )
    .mutation(
      async ({
        input: { itemName, description, price, quantity, image },
        ctx,
      }) => {
        if (!itemName || !price) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Please enter all fields",
          });
        }

        const userId = ctx.session.userId;

        const user = await db
          .select({ username: users.username })
          .from(users)
          .where(eq(users.id, userId));

        if (!user) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "User not found",
          });
        }

        const { username } = user[0];

        const [item] = await db
          .insert(items)
          .values({
            username,
            itemName,
            description,
            price,
            quantity,
            image,
            userId,
          })
          .returning();

        const payload = {
          username: item.username,
          itemId: item.itemId,
          userId: item.userId,
          itemName: item.itemName,
          description: item.description,
          itemPrice: item.price,
          date: item.date,
          quantity: item.quantity,
          itemImage: item.image,
        };

        if (payload) {
          return payload;
        } else {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Could not post Items",
          });
        }
      }
    ),
  deleteItem: protectedProcedure
    .input(
      z.object({
        itemId: z.string().uuid(),
      })
    )
    .mutation(async ({ input: { itemId }, ctx }) => {
      const userId = ctx.session.userId;

      const deleteItem = await db
        .delete(items)
        .where(and(eq(items.itemId, itemId), eq(items.userId, userId)))
        .returning();
      if (deleteItem.length > 0) {
        return deleteItem[0];
      } else {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could not delete item",
        });
      }
    }),
});
