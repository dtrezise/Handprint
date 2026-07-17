const configuredBasePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");
const configuredSiteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");

export function runtimePath(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${configuredBasePath}${normalizedPath}`;
}

export function publicSiteUrl(path: string) {
  return `${configuredSiteUrl || "http://localhost:3000"}${runtimePath(path)}`;
}
