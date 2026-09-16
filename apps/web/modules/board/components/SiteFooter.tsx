import Link from "next/link";

const linkClass = "text-primary hover:underline";

export function SiteFooter() {
	return (
		<footer className="px-3 pb-16 pt-10 text-center sm:px-4">
			<nav aria-label="Footer" className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm">
				<Link href="/categories" className={linkClass}>
					Categories
				</Link>
				<Link href="/about" className={linkClass}>
					About
				</Link>
				<Link href="/how-ranking-works" className={linkClass}>
					Rules
				</Link>
			</nav>
			<Link href="/" className="mt-8 inline-block text-sm font-medium tracking-[-0.022em] text-foreground">
				Bid Ladder
			</Link>
		</footer>
	);
}
