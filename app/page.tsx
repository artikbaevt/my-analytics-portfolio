import { Navbar } from "@/components/navbar";
import { ProjectCard } from "@/components/project-card";
import { getPublishedProjects } from "@/lib/data";

// force-dynamic: данные приходят из Supabase и меняются через /admin,
// статическая сборка (SSG) закэшировала бы список проектов на момент билда
export const dynamic = "force-dynamic";

export default async function Home() {
  const projects = await getPublishedProjects();

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-4 py-24 text-center">
          <p className="text-sm font-medium tracking-widest text-primary">
            DATA ANALYST
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Turning data into
            <br />
            clear business insights.
          </h1>
          <p className="mt-4 text-sm text-muted-foreground">
            Excel &middot; SQL &middot; Power BI &middot; Power Query &middot; DAX
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <a
              href="#projects"
              className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              View Projects
            </a>
            <a
              href="#"
              className="rounded-md border border-border px-5 py-2.5 text-sm font-medium hover:bg-accent"
            >
              Download CV
            </a>
          </div>
        </section>

        <section id="projects" className="mx-auto max-w-6xl px-4 pb-24">
          <h2 className="mb-6 text-xl font-semibold">Projects</h2>

          {projects.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-16 text-center text-sm text-muted-foreground">
              Projects coming soon.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {projects.map((p) => (
                <ProjectCard key={p.id} project={p} locale="en" />
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
