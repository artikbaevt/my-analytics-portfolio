import { createClient } from "@/lib/supabase/server";
import type { Project } from "@/lib/types";

// Пока Supabase-проект не создан, NEXT_PUBLIC_SUPABASE_URL — плейсхолдер,
// и реальный fetch к нему обрушит страницу. Эта проверка даёт сайту
// собираться и открываться уже сейчас, с пустым списком проектов,
// вместо белого экрана с ошибкой.
function supabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return !!url && !url.includes("your-project");
}

export async function getPublishedProjects(): Promise<Project[]> {
  if (!supabaseConfigured()) return [];

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("status", "published")
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("getPublishedProjects:", error.message);
      return [];
    }
    return data ?? [];
  } catch (e) {
    console.error("getPublishedProjects failed:", e);
    return [];
  }
}

export async function getAllProjectsAdmin(): Promise<Project[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("getAllProjectsAdmin:", error.message);
    return [];
  }
  return data ?? [];
}
export async function getProjectById(id: string): Promise<Project | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("projects").select("*").eq("id", id).single();
  if (error) return null;
  return data;
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  if (!supabaseConfigured()) return null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .single();

    if (error) return null;
    return data;
  } catch (e) {
    console.error("getProjectBySlug failed:", e);
    return null;
  }
}
