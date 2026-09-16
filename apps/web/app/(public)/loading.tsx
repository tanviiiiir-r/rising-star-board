export default function PublicLoading() {
	return (
		<main className="board-grid-bg">
			<div className="mx-auto max-w-[80rem] px-4 py-16 sm:px-8">
				<div className="mx-auto h-10 w-64 animate-pulse rounded-full bg-muted" />
				<div className="mt-8 space-y-3">
					<div className="h-16 animate-pulse rounded-2xl bg-muted" />
					<div className="h-16 animate-pulse rounded-2xl bg-muted" />
					<div className="h-16 animate-pulse rounded-2xl bg-muted" />
				</div>
			</div>
		</main>
	);
}
