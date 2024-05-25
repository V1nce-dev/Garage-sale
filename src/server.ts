import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import Fastify from "fastify";
import { appRouter } from "./router/routers";
import { createContext } from "./router/context";

export interface ServerOptions {
  dev?: boolean;
  port?: number;
  prefix?: string;
}

export function createServer(opts: ServerOptions) {
  const dev = opts.dev ?? true;
  const port = opts.port ?? 8080;
  const prefix = opts.prefix ?? "/trpc";
  const server = Fastify({
    logger: {
      level: "info",
    },
  });

  void server.register(fastifyTRPCPlugin, {
    prefix,
    trpcOptions: { router: appRouter, createContext },
  });

  const stop = async () => {
    await server.close();
  };
  const start = async () => {
    try {
      await server.listen({ port });
      console.log("listening on port", port);
    } catch (err) {
      server.log.error(err);
      process.exit(1);
    }
  };

  return { server, start, stop };
}
