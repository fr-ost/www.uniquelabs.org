// Copies static assets next to the standalone server so `npm start`
// (node .next/standalone/server.js) serves CSS/JS/images correctly.
import { cp, access } from "node:fs/promises";

const standalone = ".next/standalone";
try {
  await access(standalone);
} catch {
  console.log("[postbuild] No standalone output found — skipping.");
  process.exit(0);
}
await cp("public", `${standalone}/public`, { recursive: true });
await cp(".next/static", `${standalone}/.next/static`, { recursive: true });
console.log("[postbuild] Standalone server prepared (public/ and .next/static copied).");
