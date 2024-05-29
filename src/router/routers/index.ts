import { userRouter } from "./users";
import { itemRouter } from "./items";
import { cartRouter } from "./cart";
import { router } from "../trpc";

export const appRouter = router({
  users: userRouter,
  items: itemRouter,
  cart: cartRouter,
});

export type AppRouter = typeof appRouter;
