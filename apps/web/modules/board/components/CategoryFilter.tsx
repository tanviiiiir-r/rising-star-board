"use client";

import { cn } from "@repo/ui";

interface CategoryOption {
	id: string;
	slug: string;
	name: string;
}

export function CategoryFilter({
	categories,
	active,
	onChange,
}: {
	categories: CategoryOption[];
	active: string;
	onChange: (slug: string) => void;
}) {
	const options = [{ id: "all", slug: "all", name: "All" }, ...categories];

	return (
		<div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5 no-scrollbar">
			{options.map((option) => (
				<button
					key={option.slug}
					type="button"
					onClick={() => onChange(option.slug)}
					aria-pressed={active === option.slug}
					className={cn(
						"shrink-0 rounded-full border-[0.5px] px-3 py-1 text-xs font-medium tracking-[-0.011em] transition-colors",
						active === option.slug
							? "border-primary bg-primary text-primary-foreground"
							: "border-border bg-transparent text-muted-foreground hover:text-foreground",
					)}
				>
					{option.name}
				</button>
			))}
		</div>
	);
}
