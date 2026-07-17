import { spawn } from "node:child_process";
import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const outputDir = path.resolve("pages-dist");
const port = Number(process.env.HANDPRINT_PAGES_PORT ?? 43000 + (process.pid % 1000));
const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");
const origin = `http://127.0.0.1:${port}`;
const nextBin = path.resolve("node_modules/next/dist/bin/next");

const routes = [
  "/",
  "/profile",
  "/u/dan",
  "/badges/badge-pantry-builder",
  "/badges/badge-neighbor-advocate",
  "/badges/badge-civic-voice",
  "/badges/badge-community-maker",
  "/badges/badge-welcome-signal",
  "/organizations/northside-pantry",
  "/organizations/civic-help-desk",
  "/organizations/northside-pantry/grant-report",
  "/organizations/civic-help-desk/grant-report",
  "/organizations/northside-pantry/accolades/accolade-pantry-mobilizer",
  "/organizations/civic-help-desk/accolades/accolade-neighbor-trust",
  "/impact-receipts/receipt-pantry-boxes-june",
  "/impact-receipts/receipt-classroom-kits-pilot",
  "/impact-receipts/receipt-neighbor-intake-june"
];

function routeOutputPath(route) {
  return route === "/" ? path.join(outputDir, "index.html") : path.join(outputDir, route.slice(1), "index.html");
}

async function waitForServer() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(`${origin}${basePath}/`);
      if (response.ok) return;
    } catch {
      // The production server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error("Timed out waiting for the Handprint production server.");
}

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });

const server = spawn(process.execPath, [nextBin, "start", "--hostname", "127.0.0.1", "--port", String(port)], {
  env: process.env,
  stdio: "inherit"
});
const serverExit = new Promise((resolve) => server.once("exit", resolve));

try {
  await waitForServer();

  for (const route of routes) {
    const response = await fetch(`${origin}${basePath}${route}`, { redirect: "follow" });
    if (!response.ok) throw new Error(`Unable to render ${route}: ${response.status}`);
    const destination = routeOutputPath(route);
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, await response.text());
  }

  const qrRedirectPath = routeOutputPath("/h/hp-dan");
  const qrDestination = `${basePath}/u/dan/`;
  await mkdir(path.dirname(qrRedirectPath), { recursive: true });
  await writeFile(
    qrRedirectPath,
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Opening Handprint</title><meta http-equiv="refresh" content="0;url=${qrDestination}"><link rel="canonical" href="${qrDestination}"></head><body><p><a href="${qrDestination}">Open this Handprint</a></p><script>location.replace(${JSON.stringify(qrDestination)});</script></body></html>`
  );

  await cp(path.resolve(".next/static"), path.join(outputDir, "_next/static"), { recursive: true });
  await cp(path.resolve("public"), outputDir, { recursive: true, force: true });
  await cp(path.join(outputDir, "index.html"), path.join(outputDir, "404.html"));
  await writeFile(path.join(outputDir, ".nojekyll"), "");
} finally {
  if (server.exitCode === null) server.kill("SIGTERM");
  await serverExit;
}
