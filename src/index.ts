import "reflect-metadata";
import { startServer } from "./app";
import dotenv from "dotenv";
import "./database";
dotenv.config();
async function main() {
  const app = await startServer();
  app.listen(3000);
  console.log("Server on port: " + 3000);
}
main();
