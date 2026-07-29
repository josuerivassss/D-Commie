#!/usr/bin/env node
// Generates vercel.json from vercel.template.json, injecting the real API
// origin from VITE_API_BASE_URL so `connect-src` in the CSP header always
// matches the environment being deployed. Runs automatically before every
// build -- no more manually editing vercel.json on domain changes.
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
    "[generate-vercel-config] VITE_API_BASE_URL is not set. Refusing to generate " +
    "vercel.json with a missing connect-src origin -- this would silently break " +
    "every API call in production. Set VITE_API_BASE_URL in your environment " +
    "(or Vercel project settings) and rebuild."
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
console.log(`[generate-vercel-config] vercel.json generated with connect-src origin: ${apiOrigin}`);