import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/admin/logout-button";

// (dashboard) — route group: не влияет на URL, /admin остаётся /admin.
// Нужен, чтобы этот layout НЕ применялся к /admin/login (у неё нет общей навигации).
export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // middleware уже должен был отредиректить, это второй, дублирующий слой защиты —
  // на случай прямого захода мимо middleware (например, при будущих изменениях конфигурации)
  if (!user) redirect("/admin/login");

  const links = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/projects", label: "Projects" },
    { href: "/admin/about", label: "About" },
    { href: "/admin/skills", label: "Skills" },
    { href: "/admin/courses", label: "Courses" },
    { href: "/admin/social", label: "Social Links" },
  ];

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 border-r border-border bg-card p-4">
        <p className="mb-4 text-xs font-medium text-muted-foreground">{user.email}</p>
        <nav className="space-y-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="block rounded-md px-3 py-2 text-sm text-foreground/80 hover:bg-accent hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="mt-6 border-t border-border pt-4">
          <LogoutButton />
        </div>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
