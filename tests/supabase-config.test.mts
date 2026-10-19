import assert from "node:assert/strict";
import { test } from "node:test";
import {
  getSupabaseAnonKey,
  getSupabaseUrl,
  isSupabaseConfigured,
} from "../src/lib/supabase/config.ts";

test("recognizes Supabase integration environment variables", () => {
  const names = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_URL",
    "SUPABASE_ANON_KEY",
    "SUPABASE_PUBLISHABLE_KEY",
  ] as const;
  const originalValues = new Map(
    names.map((name) => [name, process.env[name]])
  );

  try {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_ANON_KEY = "integration-anon-key";
    delete process.env.SUPABASE_PUBLISHABLE_KEY;

    assert.equal(getSupabaseUrl(), "https://example.supabase.co");
    assert.equal(getSupabaseAnonKey(), "integration-anon-key");
    assert.equal(isSupabaseConfigured(), true);
  } finally {
    for (const name of names) {
      const value = originalValues.get(name);
      if (value === undefined) {
        delete process.env[name];
      } else {
        process.env[name] = value;
      }
    }
  }
});
