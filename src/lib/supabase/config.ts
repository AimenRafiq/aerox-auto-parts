export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !key) return false;

  const placeholders = ["placeholder", "your-project-ref", "your-supabase-anon-key"];
  const configuration = `${url} ${key}`.toLowerCase();
  return !placeholders.some((value) => configuration.includes(value));
}
