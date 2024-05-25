import {
  getUserProfileRouter,
  registerRouter,
  authenticateRouter,
} from "./users";
import { postItemRouter } from "./items";
import { router } from "../trpc";

export const appRouter = router({
  getProfile: getUserProfileRouter,
  register: registerRouter,
  authenticate: authenticateRouter,

  postItem: postItemRouter,
});

export type AppRouter = typeof appRouter;
