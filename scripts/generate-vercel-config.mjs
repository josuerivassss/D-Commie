#!/usr/bin/env node
// Generates vercel.json from vercel.template.json, injecting the real API
// origin from VITE_API_BASE_URL so `connect-src` in the CSP header always
// matches the environment being deployed.
//
// IMPORTANT: vercel.json is a committed file, not a build artifact. Vercel
// resolves rewrites/headers from the Git-tracked vercel.json as part of
// deployment configuration, independent of whether the Build Command has
// finished -- generating it only during `vite build` and gitignoring it
// leaves Vercel with NO rewrite rule at all, breaking every client-side
// route (e.g. /dash) with a platform-level 404.
//
// Run this manually (or as a CI step BEFORE committing) whenever
// VITE_API_BASE_URL changes, then commit the resulting vercel.json:
//
//   VITE_API_BASE_URL=https://api.commie.bot node scripts/generate-vercel-config.mjs
//   git add vercel.json && git commit -m "chore: update CSP connect-src for production API"
//
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATE_PATH = join(__dirname, "..", "vercel.template.json");
const OUTPUT_PATH = join(__dirname, "..", "vercel.json");
const PLACEHOLDER = "__API_ORIGIN__";

const apiBaseUrl = process.env.VITE_API_BASE_URL;

if (!apiBaseUrl) {
  console.error(
    "[generate-vercel-config] VITE_API_BASE_URL is not set. Pass it explicitly, " +
    "e.g.: VITE_API_BASE_URL=https://api.commie.bot node scripts/generate-vercel-config.mjs"
  );
  process.exit(1);
}

let apiOrigin;
try {
  apiOrigin = new URL(apiBaseUrl).origin;
} catch {
  console.error(`[generate-vercel-config] VITE_API_BASE_URL is not a valid URL: "${apiBaseUrl}"`);
  process.exit(1);
}

const template = readFileSync(TEMPLATE_PATH, "utf-8");
const output = template.split(PLACEHOLDER).join(apiOrigin);

writeFileSync(OUTPUT_PATH, output);
console.log(`[generate-vercel-config] vercel.json written with connect-src origin: ${apiOrigin}`);
console.log("[generate-vercel-config] Remember to commit vercel.json before deploying.");