import { Link } from "@tanstack/react-router";

const linkClass = "text-primary hover:underline";

export function SiteFooter() {
  return (
    <footer className="px-3 pb-16 pt-10 text-center sm:px-4">
      <nav aria-label="Footer" className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm">
        <Link to="/categories" className={linkClass}>
          Categories
        </Link>
        <Link to="/about" className={linkClass}>
          About
        </Link>
        <Link to="/how-ranking-works" className={linkClass}>
          Rules
        </Link>
      </nav>
      <Link to="/" className="mt-8 inline-block text-sm font-medium tracking-[-0.022em] text-foreground">
        Bid Ladder
      </Link>
    </footer>
  );
}
