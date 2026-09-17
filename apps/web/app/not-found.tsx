import { Button } from "@repo/ui";
import Link from "next/link";

export default function NotFoundPage() {
	return (
		<main className="board-grid-bg">
			<div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
				<p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">404</p>
				<h1 className="mt-3 font-display text-4xl tracking-[-0.03em]">Page not found</h1>
				<p className="mt-3 text-sm text-muted-foreground">
					That route is not on the board. The listing may have been removed, or the link is stale.
				</p>
				<Button asChild variant="primary" className="mt-6">
					<Link href="/">Back to the board</Link>
				</Button>
			</div>
		</main>
	);
}
