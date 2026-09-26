import Link from "next/link";
import { getAllProjectsAdmin } from "@/lib/data";
import { DeleteProjectButton } from "@/components/admin/delete-project-button";

export default async function AdminProjectsPage() {
  const projects = await getAllProjectsAdmin();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Projects</h1>
        <Link
          href="/admin/projects/new"
          className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          + Add Project
        </Link>
      </div>

      {projects.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">No projects yet.</p>
      ) : (
        <div className="mt-4 divide-y divide-border rounded-lg border border-border">
          {projects.map((p) => (
            <div key={p.id} className="flex items-center justify-between p-3">
              <div>
                <p className="text-sm font-medium">{p.title_en || p.title_ru}</p>
                <p className="text-xs text-muted-foreground">/{p.slug}</p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    p.status === "published"
                      ? "bg-primary/15 text-primary"
                      : "bg-accent text-muted-foreground"
                  }`}
                >
                  {p.status}
                </span>
                {/* Edit/Delete — теперь оба реально работают (Update и Delete из CRUD) */}
                <Link
                  href={`/admin/projects/${p.id}/edit`}
                  className="text-xs text-primary hover:underline"
                >
                  Edit
                </Link>
                <DeleteProjectButton id={p.id} title={p.title_en || p.title_ru} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
