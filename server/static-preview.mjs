import { createServer } from "node:http";
import { appendFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const root = join(process.cwd(), "dist");
const port = Number(process.env.PORT || 4173);
const logPath = join(process.cwd(), "static-preview.log");

function log(message) {
  appendFileSync(logPath, `${new Date().toISOString()} ${message}\n`);
}

process.on("uncaughtException", (error) => {
  log(`uncaught ${error.stack || error.message}`);
  process.exit(1);
});

process.on("unhandledRejection", (error) => {
  log(`unhandled ${error instanceof Error ? error.stack : String(error)}`);
  process.exit(1);
});

log(`starting cwd=${process.cwd()} root=${root} port=${port}`);

const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8"
};

createServer(async (request, response) => {
  const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);
  const requested = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, "");
  const filePath = join(root, requested === "/" ? "index.html" : requested);

  try {
    const data = await readFile(filePath);
    response.writeHead(200, {
      "Content-Type": mime[extname(filePath)] || "application/octet-stream",
      "Cache-Control": filePath.includes("assets") ? "public, max-age=31536000, immutable" : "no-cache"
    });
    response.end(data);
  } catch {
    const data = await readFile(join(root, "index.html"));
    response.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache" });
    response.end(data);
  }
}).listen(port, () => {
  log(`listening http://localhost:${port}`);
  console.log(`tapyfi static preview available at http://localhost:${port}`);
}).on("error", (error) => {
  log(`listen error ${error.stack || error.message}`);
});
