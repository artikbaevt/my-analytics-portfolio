// Соответствует supabase_schema.sql — при изменении схемы синхронизировать здесь.

export type Locale = "ru" | "uz" | "en";

export interface Kpi {
  label: Record<Locale, string>;
  value: string;
}

export interface Project {
  id: string;
  slug: string;

  title_ru: string;
  title_uz: string;
  title_en: string;

  short_description_ru: string | null;
  short_description_uz: string | null;
  short_description_en: string | null;

  full_description_ru: string | null;
  full_description_uz: string | null;
  full_description_en: string | null;

  business_task_ru: string | null;
  business_task_uz: string | null;
  business_task_en: string | null;

  data_desc_ru: string | null;
  data_desc_uz: string | null;
  data_desc_en: string | null;

  analysis_ru: string | null;
  analysis_uz: string | null;
  analysis_en: string | null;

  conclusions_ru: string | null;
  conclusions_uz: string | null;
  conclusions_en: string | null;

  recommendations_ru: string | null;
  recommendations_uz: string | null;
  recommendations_en: string | null;

  tools: string[];
  kpis: Kpi[];
  metrics: Kpi[];

  preview_image: string | null;
  powerbi_embed_url: string | null;

  status: "draft" | "published";
  sort_order: number;

  created_at: string;
  updated_at: string;
}

export interface ProjectImage {
  id: string;
  project_id: string;
  image_path: string;
  sort_order: number;
}

export interface ProjectFile {
  id: string;
  project_id: string;
  file_path: string;
  file_type: "xlsx" | "pbix" | "pdf" | "csv" | "sql" | "other";
  label: string | null;
  sort_order: number;
}

export interface About {
  id: 1;
  photo_path: string | null;
  name_ru: string | null; name_uz: string | null; name_en: string | null;
  university_ru: string | null; university_uz: string | null; university_en: string | null;
  experience_ru: string | null; experience_uz: string | null; experience_en: string | null;
  bio_ru: string | null; bio_uz: string | null; bio_en: string | null;
  cv_file_path: string | null;
}

export interface Skill {
  id: string;
  name: string;
  percent: number;
  sort_order: number;
}

export interface Course {
  id: string;
  title_ru: string | null; title_uz: string | null; title_en: string | null;
  organization: string | null;
  date: string | null;
  description_ru: string | null; description_uz: string | null; description_en: string | null;
  certificate_path: string | null;
  sort_order: number;
}

export interface SocialLink {
  id: string;
  platform: "telegram" | "hh" | "github";
  url: string;
}

// Хелпер: достать локализованное поле без "title_" + locale конкатенации в каждом компоненте
export function localized<T extends object>(
  obj: T,
  field: string,
  locale: Locale
): string {
  const value = (obj as Record<string, unknown>)[`${field}_${locale}`];
  return typeof value === "string" ? value : "";
}
