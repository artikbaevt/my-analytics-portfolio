import Link from "next/link";
import type { Project, Locale } from "@/lib/types";
import { localized } from "@/lib/types";

export function ProjectCard({ project, locale = "en" }: { project: Project; locale?: Locale }) {
  const title = localized(project, "title", locale);
  const description = localized(project, "short_description", locale);

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex h-40 items-center justify-center bg-muted text-xs text-muted-foreground">
        {/* Реальное изображение подключим, когда появится Supabase Storage —
            project.preview_image сейчас может быть null, поэтому пока заглушка */}
        {project.preview_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={project.preview_image} alt={title} className="h-full w-full object-cover" />
        ) : (
          "No preview"
        )}
      </div>

      <div className="p-5">
        <h3 className="text-base font-semibold">{title}</h3>
        {description && (
          <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{description}</p>
        )}

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

        <div className="mt-4 flex gap-2">
          <Link
            href={`/projects/${project.slug}`}
            className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90"
          >
            View Project
          </Link>
          {/* Кнопка "Скачать" — заработает, когда появятся project_files из Supabase (следующий этап) */}
          <span className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground">
            Download
          </span>
        </div>
      </div>
    </div>
  );
}
