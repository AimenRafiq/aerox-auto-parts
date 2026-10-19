import assert from "node:assert/strict";
import test from "node:test";
import { getAbsoluteSiteUrl, getSiteOrigin } from "../src/lib/seo.ts";

test("SEO URLs use the configured public origin", () => {
  const previousSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const previousNodeEnv = process.env.NODE_ENV;
  process.env.NEXT_PUBLIC_SITE_URL = "https://store.example/path";
  process.env.NODE_ENV = "production";
  try {
    assert.equal(getSiteOrigin(), "https://store.example");
    assert.equal(
      getAbsoluteSiteUrl("/products/example-part"),
      "https://store.example/products/example-part"
    );
  } finally {
    if (previousSiteUrl === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
    else process.env.NEXT_PUBLIC_SITE_URL = previousSiteUrl;
    if (previousNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previousNodeEnv;
  }
});

test("SEO URLs use localhost in development and require an explicit production origin", () => {
  const previousSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const previousNodeEnv = process.env.NODE_ENV;
  delete process.env.NEXT_PUBLIC_SITE_URL;
  try {
    process.env.NODE_ENV = "development";
    assert.equal(getSiteOrigin(), "http://localhost:3000");
    process.env.NODE_ENV = "production";
    assert.equal(getSiteOrigin(), null);
    assert.equal(getAbsoluteSiteUrl("/sitemap.xml"), undefined);
  } finally {
    if (previousSiteUrl === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
    else process.env.NEXT_PUBLIC_SITE_URL = previousSiteUrl;
    if (previousNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previousNodeEnv;
  }
});
