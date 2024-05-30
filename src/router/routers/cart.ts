import { router, protectedProcedure } from "../trpc";
import { db } from "../../database/index";
import { and, eq, sql } from "drizzle-orm";
import { cart, items } from "../../database/schema";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const cartRouter = router({
  addToCart: protectedProcedure
    .input(
      z.object({
        itemId: z.string().uuid(),
      })
    )
    .mutation(async ({ input: { itemId }, ctx }) => {
      const userId = ctx.session.userId;

      const productExists = await db
        .select()
        .from(cart)
        .where(eq(cart.itemId, itemId));

      if (productExists) {
        const updatedCartProduct = await db
          .update(cart)
          .set({ quantity: sql`${cart.quantity} + 1` })
          .where(eq(cart.userId, userId))
          .returning();

        if (updatedCartProduct.length > 0) {
          return updatedCartProduct;
        }
      }

      const products = await db
        .select({
          itemName: items.itemName,
          price: items.price,
          quantity: items.quantity,
          image: items.image,
        })
        .from(items)
        .where(eq(items.itemId, itemId));

      const { itemName, price, quantity, image } = products[0];

      const cartItems = await db
        .insert(cart)
        .values({ userId, itemId, itemName, price, quantity, image })
        .returning();

      if (cartItems) {
        return cartItems;
      } else {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "could not add item to cart",
        });
      }
    }),
  getCartItems: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.userId;

    const products = await db
      .select({
        itemName: cart.itemName,
        price: cart.price,
        quantity: cart.quantity,
        image: cart.image,
      })
      .from(cart)
      .where(eq(cart.userId, userId));

    if (products) {
      return products;
    } else {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "could not get cart items",
      });
    }
  }),
  removeCartItem: protectedProcedure
    .input(
      z.object({
        itemId: z.string().uuid(),
      })
    )
    .mutation(async ({ input: { itemId }, ctx }) => {
      const userId = ctx.session.userId;

      const deleteItem = await db
        .delete(cart)
        .where(and(eq(cart.itemId, itemId), eq(cart.userId, userId)))
        .returning();

      if (deleteItem.length > 0) {
        return deleteItem[0];
      } else {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could not remove from cart",
        });
      }
    }),
});
