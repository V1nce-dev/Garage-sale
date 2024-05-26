import { userRouter } from "./users";
import { itemRouter } from "./items";
import { router } from "../trpc";

export const appRouter = router({
  users: userRouter,
  items: itemRouter,
});

export type AppRouter = typeof appRouter;
