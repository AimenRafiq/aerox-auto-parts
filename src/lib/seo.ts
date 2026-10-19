export function getSiteOrigin(): string | null {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!configuredUrl) {
    return process.env.NODE_ENV === "development" ? "http://localhost:3000" : null;
  }

  let siteUrl: URL;
  try {
    siteUrl = new URL(configuredUrl);
  } catch {
    throw new Error("NEXT_PUBLIC_SITE_URL must be a valid absolute URL.");
  }

  if (siteUrl.protocol !== "https:" && siteUrl.protocol !== "http:") {
    throw new Error("NEXT_PUBLIC_SITE_URL must use HTTP or HTTPS.");
  }
  return siteUrl.origin;
}

export function getAbsoluteSiteUrl(path: string): string | undefined {
  const origin = getSiteOrigin();
  return origin ? new URL(path, origin).toString() : undefined;
}
