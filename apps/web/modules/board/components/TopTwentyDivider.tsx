export function TopTwentyDivider() {
	return (
		<div className="flex items-center gap-3 px-3 py-6 sm:px-4" role="separator" aria-label="Top 20">
			<span className="h-px min-w-0 flex-1 bg-primary/40" />
			<span className="rounded-full border border-primary/50 px-3 py-0.5 text-[11px] font-medium uppercase tracking-wide text-primary">
				Top 20
			</span>
			<span className="h-px min-w-0 flex-1 bg-primary/40" />
		</div>
	);
}
