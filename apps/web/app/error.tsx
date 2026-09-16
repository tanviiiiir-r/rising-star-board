"use client";

import { Button } from "@repo/ui";

export default function ErrorPage({
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<main className="board-grid-bg">
			<div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
				<h1 className="font-display text-4xl tracking-[-0.03em]">Something broke</h1>
				<p className="mt-3 text-sm text-muted-foreground">
					The board hit an unexpected error. Retry, or go back to the homepage.
				</p>
				<Button type="button" variant="primary" className="mt-6" onClick={() => reset()}>
					Retry
				</Button>
			</div>
		</main>
	);
}
