import { createRequestHandler } from "@react-router/express";
import compression from "compression";
import express from "express";
import morgan from "morgan";

const isProduction = process.env.NODE_ENV === "production";

const app = express();
app.use(compression());
app.disable("x-powered-by");

let viteDevServer;
if (!isProduction) {
  const vite = await import("vite");
  viteDevServer = await vite.createServer({
    server: { middlewareMode: true },
  });
  app.use(viteDevServer.middlewares);
} else {
  app.use(
    "/assets",
    express.static("build/client/assets", { immutable: true, maxAge: "1y" })
  );
  app.use(express.static("build/client", { maxAge: "1h" }));
}

app.use(morgan("tiny"));

const build = viteDevServer
  ? () => viteDevServer.ssrLoadModule("virtual:react-router/server-build")
  : await import("./build/server/index.js");

app.all(
  "*splat",
  createRequestHandler({
    build,
  })
);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
