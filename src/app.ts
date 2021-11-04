import express from "express";
import { ApolloServer } from "apollo-server-express";
import { AuthResolver } from "./resolvers/AuthResolver";
import jwt from "jsonwebtoken";
import { buildSchema } from "type-graphql";

export async function startServer() {
  const app = express();
  const server = new ApolloServer({
    schema: await buildSchema({
      resolvers: [AuthResolver],
    }),
    context: ({ req, res }) => {
      const token = req.headers.authorization;

      if (token) {
        try {
          const user = jwt.verify(
            token,
            process.env.TOKEN_SECRET || "tokentest"
          );
          return {
            user,
          };
        } catch (error) {
          console.log("#### ERROR ####");
          console.log(error);
          throw new Error("Token invalido");
        }
      }
    },
  });
  await server.start();
  server.applyMiddleware({ app, path: "/graphql" });
  return app;
}
