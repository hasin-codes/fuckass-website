import { supabase } from "@/integrations/supabase/client";

export type SiteContentMap = Record<string, Record<string, string>>;

export async function fetchSiteContent(): Promise<SiteContentMap> {
  const { data, error } = await supabase.from("site_content").select("*");
  if (error) throw error;
  const map: SiteContentMap = {};
  for (const row of data ?? []) {
    map[row.section] = map[row.section] || {};
    map[row.section][row.field_key] = row.field_value ?? "";
  }
  return map;
}

export function c(map: SiteContentMap, section: string, key: string, fallback = ""): string {
  return map[section]?.[key] ?? fallback;
}

export async function fetchProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("visible", true)
    .order("order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function fetchGallery() {
  const { data, error } = await supabase
    .from("gallery_items")
    .select("*")
    .eq("visible", true)
    .order("order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}
