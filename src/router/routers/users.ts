import { router, publicProcedure } from "../trpc";
import { db } from "../../database/index";
import { eq } from "drizzle-orm";
import { users } from "../../database/schema";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

dotenv.config();

const generateToken = async (id: string | null) => {
  try {
    if (id) {
      return jwt.sign({ id }, process.env.JWT_SECRET as string, {
        expiresIn: "30d",
      });
    }
  } catch (error) {
    throw new Error("Invalid user ID from token generation");
  }
};

export const getUserProfileRouter = router({
  getUser: publicProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { userId } = input;

      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
        });
      }

      const userProfile = await db
        .select()
        .from(users)
        .where(eq(users.id, userId));

      if (userProfile.length > 0) {
        return userProfile;
      } else {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could not fetch user",
        });
      }
    }),
});

export const registerRouter = router({
  user: publicProcedure
    .input(
      z.object({
        username: z.string(),
        email: z.string(),
        password: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { username, email, password } = input;

      if (!username || !email || !password) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Please enter all fields",
        });
      }

      const userExists = await db
        .select()
        .from(users)
        .where(eq(users.email, email));

      if (userExists.length > 0) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "This user already exists",
        });
      }

      const hashPassword = await bcrypt.hash(password, 10);

      const [user] = await db
        .insert(users)
        .values({ username, email, password: hashPassword })
        .returning();

      const payload = {
        id: user.id,
        username: user.username,
        email: user.email,
        created: user.createdAt,
        token: await generateToken(user.id),
      };

      if (user) {
        return payload;
      } else {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    }),
});

export const authenticateRouter = router({
  user: publicProcedure
    .input(
      z.object({
        email: z.string(),
        password: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { email, password } = input;

      if (!email || !password) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Please enter all fields",
        });
      }

      const result = await db
        .select()
        .from(users)
        .where(eq(users.email, email));
      const user = result[0];

      const hashPassword = await bcrypt.compare(password, user.password);

      const payload = {
        id: user.id,
        username: user.username,
        email: user.email,
        token: await generateToken(user.id),
      };

      if (user && hashPassword) {
        return payload;
      } else {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Invalid credentials",
        });
      }
    }),
});
