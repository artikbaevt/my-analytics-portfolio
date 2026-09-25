import { getAllProjectsAdmin } from "@/lib/data";

export default async function AdminDashboardPage() {
  const projects = await getAllProjectsAdmin();
  const published = projects.filter((p) => p.status === "published").length;
  const drafts = projects.filter((p) => p.status === "draft").length;

  return (
    <div>
      <h1 className="text-lg font-semibold">Dashboard</h1>
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border p-4">
          <div className="text-2xl font-semibold">{projects.length}</div>
          <div className="text-xs text-muted-foreground">Total Projects</div>
        </div>
        <div className="rounded-lg border border-border p-4">
          <div className="text-2xl font-semibold text-primary">{published}</div>
          <div className="text-xs text-muted-foreground">Published</div>
        </div>
        <div className="rounded-lg border border-border p-4">
          <div className="text-2xl font-semibold text-muted-foreground">{drafts}</div>
          <div className="text-xs text-muted-foreground">Drafts</div>
        </div>
      </div>
    </div>
  );
}
