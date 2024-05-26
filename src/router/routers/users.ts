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

export const userRouter = router({
  getUser: publicProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
      })
    )
    .mutation(async ({ input: { userId } }) => {
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
  registerUser: publicProcedure
    .input(
      z.object({
        username: z.string(),
        email: z.string(),
        password: z.string(),
      })
    )
    .mutation(async ({ input: { username, email, password } }) => {
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
  authenticateUser: publicProcedure
    .input(
      z.object({
        email: z.string(),
        password: z.string(),
      })
    )
    .mutation(async ({ input: { email, password } }) => {
      if (!email || !password) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Please enter all fields",
        });
      }

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email));

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
