import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { getProjectBySlug } from "@/lib/data";
import { localized } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  // Next.js сам покажет app/not-found.tsx (сделаем на этапе 404), если проекта нет —
  // это защита на случай неправильной/устаревшей ссылки, а не только "проект не опубликован"
  if (!project) notFound();

  const locale = "en" as const;
  const title = localized(project, "title", locale);
  const fullDescription = localized(project, "full_description", locale);
  const businessTask = localized(project, "business_task", locale);
  const dataDesc = localized(project, "data_desc", locale);
  const analysis = localized(project, "analysis", locale);
  const conclusions = localized(project, "conclusions", locale);
  const recommendations = localized(project, "recommendations", locale);

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-10">
          <Link href="/#projects" className="text-sm text-primary hover:underline">
            ← Back to Projects
          </Link>

          <h1 className="mt-4 text-3xl font-bold tracking-tight">{title}</h1>

          {project.tools?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {project.tools.map((tool) => (
                <span
                  key={tool}
                  className="rounded-full border border-border bg-accent px-2.5 py-0.5 text-xs text-accent-foreground"
                >
                  {tool}
                </span>
              ))}
            </div>
          )}

          {project.preview_image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={project.preview_image}
              alt={title}
              className="mt-6 w-full rounded-lg border border-border"
            />
          )}

          {fullDescription && (
            <p className="mt-6 text-sm leading-relaxed text-foreground/90">{fullDescription}</p>
          )}

          {/* Power BI embed — показываем блок только если ссылка реально заполнена (п.16 ТЗ) */}
          {project.powerbi_embed_url && (
            <section className="mt-8">
              <h2 className="mb-2 text-sm font-semibold text-muted-foreground">Power BI</h2>
              <iframe
                src={project.powerbi_embed_url}
                className="aspect-video w-full rounded-lg border border-border"
                allowFullScreen
              />
            </section>
          )}

          {project.kpis?.length > 0 && (
            <section className="mt-8">
              <h2 className="mb-3 text-sm font-semibold text-muted-foreground">KPIs</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {project.kpis.map((kpi, i) => (
                  <div key={i} className="rounded-lg border border-border p-3">
                    <div className="text-lg font-semibold text-primary">{kpi.value}</div>
                    <div className="text-xs text-muted-foreground">{kpi.label[locale]}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {[
            ["Business Task", businessTask],
            ["Data", dataDesc],
            ["Analysis", analysis],
            ["Conclusions", conclusions],
            ["Recommendations", recommendations],
          ].map(([label, text]) =>
            text ? (
              <section key={label} className="mt-8">
                <h2 className="mb-2 text-sm font-semibold text-muted-foreground">{label}</h2>
                <p className="text-sm leading-relaxed text-foreground/90">{text}</p>
              </section>
            ) : null
          )}

          {/* Скачивание файлов — заработает, когда подключим project_files (следующий этап) */}
          <section className="mt-10 border-t border-border pt-6">
            <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
              Download Project Materials
            </h2>
            <p className="text-sm text-muted-foreground">Files coming soon.</p>
          </section>
        </div>
      </main>
    </>
  );
}
