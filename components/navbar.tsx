import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          Data<span className="text-sky-400">Analyst</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-foreground/70 sm:flex">
          <Link href="/#projects" className="hover:text-foreground">Projects</Link>
          <Link href="/#about" className="hover:text-foreground">About</Link>
        </nav>

        <div className="flex items-center gap-2">
          {/* Заглушка — реальное переключение языка подключим отдельным этапом (i18n) */}
          <div className="hidden items-center gap-1 text-xs text-foreground/50 sm:flex">
            <span>RU</span><span>|</span><span>UZ</span><span>|</span><span>EN</span>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
