"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createProject(formData: FormData) {
  const supabase = await createClient();

  // ---- обязательные текстовые поля ----
  const slug = String(formData.get("slug") || "").trim();
  if (!slug) throw new Error("Slug is required");

  const get = (name: string) => String(formData.get(name) || "").trim() || null;

  // ---- инструменты: строка через запятую -> массив, без перевода (п.8 ТЗ) ----
  const toolsRaw = String(formData.get("tools") || "");
  const tools = toolsRaw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  // ---- KPI: пришли с клиента уже собранные в JSON (см. форму) ----
  let kpis = [];
  try {
    kpis = JSON.parse(String(formData.get("kpis_json") || "[]"));
  } catch {
    kpis = [];
  }

  // ---- превью-картинка: если выбрана, грузим в Storage до записи в БД ----
  let previewImagePath: string | null = null;
  const previewFile = formData.get("preview_image") as File | null;
  if (previewFile && previewFile.size > 0) {
    const ext = previewFile.name.split(".").pop();
    const path = `${slug}-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("project-images")
      .upload(path, previewFile, { upsert: true });

    if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

    const { data: publicUrl } = supabase.storage.from("project-images").getPublicUrl(path);
    previewImagePath = publicUrl.publicUrl;
  }

  const { error } = await supabase.from("projects").insert({
    slug,
    title_ru: get("title_ru"),
    title_uz: get("title_uz"),
    title_en: get("title_en"),
    short_description_ru: get("short_description_ru"),
    short_description_uz: get("short_description_uz"),
    short_description_en: get("short_description_en"),
    business_task_ru: get("business_task_ru"),
    business_task_uz: get("business_task_uz"),
    business_task_en: get("business_task_en"),
    data_desc_ru: get("data_desc_ru"),
    data_desc_uz: get("data_desc_uz"),
    data_desc_en: get("data_desc_en"),
    analysis_ru: get("analysis_ru"),
    analysis_uz: get("analysis_uz"),
    analysis_en: get("analysis_en"),
    conclusions_ru: get("conclusions_ru"),
    conclusions_uz: get("conclusions_uz"),
    conclusions_en: get("conclusions_en"),
    recommendations_ru: get("recommendations_ru"),
    recommendations_uz: get("recommendations_uz"),
    recommendations_en: get("recommendations_en"),
    tools,
    kpis,
    preview_image: previewImagePath,
    powerbi_embed_url: get("powerbi_embed_url"),
    status: get("status") || "draft",
    sort_order: Number(formData.get("sort_order")) || 0,
  });

  if (error) throw new Error(`Insert failed: ${error.message}`);

  // Обновляем кэш главной и списка в админке, чтобы новый проект появился сразу,
  // без ручной пересборки — это и есть "automatic update" из п.35 ТЗ
  revalidatePath("/");
  revalidatePath("/admin/projects");
  return { success: true as const };
}

export async function updateProject(id: string, formData: FormData) {
  const supabase = await createClient();
  const get = (name: string) => String(formData.get(name) || "").trim() || null;

  const toolsRaw = String(formData.get("tools") || "");
  const tools = toolsRaw.split(",").map((t) => t.trim()).filter(Boolean);

  let kpis = [];
  try {
    kpis = JSON.parse(String(formData.get("kpis_json") || "[]"));
  } catch {
    kpis = [];
  }

  // Картинку трогаем, только если реально выбрали новый файл —
  // иначе затёрли бы существующий preview_image пустым значением
  const updateData: Record<string, unknown> = {
    slug: String(formData.get("slug") || "").trim(),
    title_ru: get("title_ru"), title_uz: get("title_uz"), title_en: get("title_en"),
    short_description_ru: get("short_description_ru"),
    short_description_uz: get("short_description_uz"),
    short_description_en: get("short_description_en"),
    business_task_ru: get("business_task_ru"), business_task_uz: get("business_task_uz"), business_task_en: get("business_task_en"),
    data_desc_ru: get("data_desc_ru"), data_desc_uz: get("data_desc_uz"), data_desc_en: get("data_desc_en"),
    analysis_ru: get("analysis_ru"), analysis_uz: get("analysis_uz"), analysis_en: get("analysis_en"),
    conclusions_ru: get("conclusions_ru"), conclusions_uz: get("conclusions_uz"), conclusions_en: get("conclusions_en"),
    recommendations_ru: get("recommendations_ru"), recommendations_uz: get("recommendations_uz"), recommendations_en: get("recommendations_en"),
    tools,
    kpis,
    powerbi_embed_url: get("powerbi_embed_url"),
    status: get("status") || "draft",
    sort_order: Number(formData.get("sort_order")) || 0,
  };

  const previewFile = formData.get("preview_image") as File | null;
  if (previewFile && previewFile.size > 0) {
    const ext = previewFile.name.split(".").pop();
    const path = `${updateData.slug}-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("project-images")
      .upload(path, previewFile, { upsert: true });
    if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);
    const { data: publicUrl } = supabase.storage.from("project-images").getPublicUrl(path);
    updateData.preview_image = publicUrl.publicUrl;
  }

  const { error } = await supabase.from("projects").update(updateData).eq("id", id);
  if (error) throw new Error(`Update failed: ${error.message}`);

  revalidatePath("/");
  revalidatePath("/admin/projects");
  revalidatePath(`/projects/${updateData.slug}`);
  return { success: true as const };
}

export async function deleteProject(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw new Error(`Delete failed: ${error.message}`);

  revalidatePath("/");
  revalidatePath("/admin/projects");
  return { success: true as const };
}
