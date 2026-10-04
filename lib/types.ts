export type Lang = 'en' | 'ru' | 'uz';
export type I18n = { en: string; ru?: string; uz?: string };

export type Project = {
  id: string; title: I18n; summary: I18n; problem?: I18n; approach?: I18n;
  tools: string[]; domain: string; featured: boolean; published: boolean;
  order?: number; impact: number; created_at: string; gallery?: string[];
  embed_url?: string | null; github_url?: string | null; demo_url?: string | null; file_url?: string | null;
  chart_data?: { data: Record<string, string | number>[]; series: string[] };
  metrics?: { label: string; value: string }[];
};

export type ContentRow = Record<string, unknown> & { id: string; published?: boolean; order?: number };

export const localized = (value: unknown, language: Lang): string => {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object') {
    const text = value as I18n;
    return text[language] || text.en || '';
  }
  return '';
};
