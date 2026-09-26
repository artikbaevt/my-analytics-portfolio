"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Project } from "@/lib/types";

type Locale = "ru" | "uz" | "en";
const LOCALES: Locale[] = ["ru", "uz", "en"];

type LocaleFields = {
  title: string;
  short_description: string;
  business_task: string;
  data_desc: string;
  analysis: string;
  conclusions: string;
  recommendations: string;
};

const emptyLocale: LocaleFields = {
  title: "",
  short_description: "",
  business_task: "",
  data_desc: "",
  analysis: "",
  conclusions: "",
  recommendations: "",
};

type Kpi = { label: Record<Locale, string>; value: string };

function fieldsFromProject(project?: Project): Record<Locale, LocaleFields> {
  if (!project) {
    return { ru: { ...emptyLocale }, uz: { ...emptyLocale }, en: { ...emptyLocale } };
  }
  const pick = (locale: Locale): LocaleFields => ({
    title: project[`title_${locale}`] ?? "",
    short_description: project[`short_description_${locale}`] ?? "",
    business_task: project[`business_task_${locale}`] ?? "",
    data_desc: project[`data_desc_${locale}`] ?? "",
    analysis: project[`analysis_${locale}`] ?? "",
    conclusions: project[`conclusions_${locale}`] ?? "",
    recommendations: project[`recommendations_${locale}`] ?? "",
  });
  return { ru: pick("ru"), uz: pick("uz"), en: pick("en") };
}

export function ProjectForm({
  initialData,
  action,
}: {
  initialData?: Project;
  action: (formData: FormData) => Promise<{ success: true }>;
}) {
  const router = useRouter();
  const isEdit = !!initialData;

  const [activeLocale, setActiveLocale] = useState<Locale>("ru");
  const [fields, setFields] = useState<Record<Locale, LocaleFields>>(
    fieldsFromProject(initialData)
  );
  const [kpis, setKpis] = useState<Kpi[]>(initialData?.kpis ?? []);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateField(locale: Locale, key: keyof LocaleFields, value: string) {
    setFields((prev) => ({ ...prev, [locale]: { ...prev[locale], [key]: value } }));
  }
  function addKpi() {
    setKpis((prev) => [...prev, { label: { ru: "", uz: "", en: "" }, value: "" }]);
  }
  function updateKpi(index: number, patch: Partial<Kpi>) {
    setKpis((prev) => prev.map((k, i) => (i === index ? { ...k, ...patch } : k)));
  }
  function removeKpi(index: number) {
    setKpis((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(formData: FormData) {
    setSubmitting(true);
    setError(null);

    for (const locale of LOCALES) {
      for (const key of Object.keys(fields[locale]) as (keyof LocaleFields)[]) {
        formData.set(`${key}_${locale}`, fields[locale][key]);
      }
    }
    formData.set("kpis_json", JSON.stringify(kpis.filter((k) => k.value)));

    try {
      await action(formData);
      router.push("/admin/projects");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  const inputClass =
    "mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary";
  const labelClass = "text-xs text-muted-foreground";

  return (
    <div className="max-w-2xl">
      <h1 className="text-lg font-semibold">{isEdit ? "Edit Project" : "Add Project"}</h1>

      <form action={handleSubmit} className="mt-5 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Slug</label>
            <input
              name="slug"
              required
              defaultValue={initialData?.slug}
              placeholder="sales-dashboard"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Tools (comma-separated)</label>
            <input
              name="tools"
              defaultValue={initialData?.tools?.join(", ")}
              placeholder="Excel, Power BI, DAX"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Status</label>
            <select name="status" defaultValue={initialData?.status ?? "draft"} className={inputClass}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Order</label>
            <input
              name="sort_order"
              type="number"
              defaultValue={initialData?.sort_order ?? 0}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>
              Preview Image {isEdit && "(leave empty to keep current)"}
            </label>
            <input name="preview_image" type="file" accept="image/*" className={inputClass} />
            {isEdit && initialData?.preview_image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={initialData.preview_image}
                alt=""
                className="mt-2 h-16 rounded border border-border object-cover"
              />
            )}
          </div>
          <div>
            <label className={labelClass}>Power BI Embed URL (optional)</label>
            <input
              name="powerbi_embed_url"
              defaultValue={initialData?.powerbi_embed_url ?? ""}
              placeholder="https://..."
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <div className="flex gap-1 border-b border-border">
            {LOCALES.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setActiveLocale(l)}
                className={`px-3 py-2 text-sm ${
                  activeLocale === l
                    ? "border-b-2 border-primary text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <label className={labelClass}>Title ({activeLocale.toUpperCase()})</label>
              <input
                value={fields[activeLocale].title}
                onChange={(e) => updateField(activeLocale, "title", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Short Description</label>
              <textarea
                rows={2}
                value={fields[activeLocale].short_description}
                onChange={(e) => updateField(activeLocale, "short_description", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Business Task</label>
              <textarea
                rows={2}
                value={fields[activeLocale].business_task}
                onChange={(e) => updateField(activeLocale, "business_task", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Data</label>
              <textarea
                rows={2}
                value={fields[activeLocale].data_desc}
                onChange={(e) => updateField(activeLocale, "data_desc", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Analysis</label>
              <textarea
                rows={3}
                value={fields[activeLocale].analysis}
                onChange={(e) => updateField(activeLocale, "analysis", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Conclusions</label>
              <textarea
                rows={3}
                value={fields[activeLocale].conclusions}
                onChange={(e) => updateField(activeLocale, "conclusions", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Recommendations</label>
              <textarea
                rows={2}
                value={fields[activeLocale].recommendations}
                onChange={(e) => updateField(activeLocale, "recommendations", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Заполни поля на всех трёх вкладках (RU/UZ/EN) — переключение выше не стирает то, что уже
            ввёл на другой вкладке.
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className={labelClass}>KPIs</label>
            <button type="button" onClick={addKpi} className="text-xs text-primary hover:underline">
              + Add KPI
            </button>
          </div>
          <div className="mt-2 space-y-2">
            {kpis.map((kpi, i) => (
              <div key={i} className="flex gap-2 rounded-md border border-border p-2">
                <input
                  placeholder="Value, e.g. 25.5%"
                  value={kpi.value}
                  onChange={(e) => updateKpi(i, { value: e.target.value })}
                  className={inputClass + " flex-1"}
                />
                <input
                  placeholder={`Label (${activeLocale.toUpperCase()})`}
                  value={kpi.label[activeLocale]}
                  onChange={(e) =>
                    updateKpi(i, { label: { ...kpi.label, [activeLocale]: e.target.value } })
                  }
                  className={inputClass + " flex-1"}
                />
                <button type="button" onClick={() => removeKpi(i)} className="px-2 text-xs text-red-400">
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? "Saving..." : isEdit ? "Save Changes" : "Save Project"}
        </button>
      </form>
    </div>
  );
}
