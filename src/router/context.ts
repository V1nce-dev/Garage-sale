import { TRPCError } from "@trpc/server";
import type { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

interface JWTToken {
  id: string;
}

export interface Session {
  userId: string;
  jwtToken: string;
}

export const createContext = async (opts: CreateFastifyContextOptions) => {
  let session: Session | null = null;

  const authorizationHeader = opts.req.headers.authorization;

  if (authorizationHeader && authorizationHeader.startsWith("Bearer ")) {
    const token = authorizationHeader.substring(7);

    try {
      const decodedToken = await new Promise<JWTToken>((resolve, reject) => {
        jwt.verify(
          token,
          process.env.JWT_SECRET as string,
          (error, decoded) => {
            if (error) {
              reject(
                new TRPCError({
                  code: "UNAUTHORIZED",
                  message: "Invalid token",
                })
              );
            } else {
              resolve(decoded as JWTToken);
            }
          }
        );
      });

      session = {
        userId: decodedToken.id,
        jwtToken: token,
      };
    } catch (error) {
      console.error("JWT verification failed:", error);
    }
  }

  return {
    session,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;
