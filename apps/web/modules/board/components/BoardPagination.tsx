import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@repo/ui";

import { homeHref } from "../lib/board-href";
import { formatCount } from "../lib/format";

function pageItems(current: number, total: number): Array<number | "ellipsis"> {
	if (total <= 1) {
		return [1];
	}
	if (total <= 7) {
		return Array.from({ length: total }, (_, i) => i + 1);
	}
	if (current <= 4) {
		return [1, 2, 3, 4, "ellipsis", total];
	}
	if (current >= total - 3) {
		return [1, "ellipsis", total - 3, total - 2, total - 1, total];
	}
	return [1, "ellipsis", current - 1, current, current + 1, "ellipsis", total];
}

export function BoardPagination({
	page,
	pageSize,
	total,
	search,
}: {
	page: number;
	pageSize: number;
	total: number;
	search: { category?: string; board?: string; page?: number };
}) {
	if (total === 0) {
		return null;
	}

	const pageCount = Math.max(1, Math.ceil(total / pageSize));
	const current = Math.min(Math.max(page, 1), pageCount);
	const from = (current - 1) * pageSize + 1;
	const to = Math.min(current * pageSize, total);
	const { page: _ignored, ...base } = search;

	function href(next: number) {
		return homeHref({ ...base, ...(next > 1 ? { page: next } : {}) });
	}

	return (
		<nav aria-label="Board pages" className="px-3 py-10 sm:px-4">
			<div className="flex items-center justify-center gap-2 text-sm">
				{current > 1 ? (
					<Link
						href={href(current - 1)}
						aria-label="Previous page"
						className="flex size-8 items-center justify-center text-muted-foreground hover:text-foreground"
					>
						<ChevronLeft className="size-4" />
					</Link>
				) : (
					<span className="flex size-8 items-center justify-center text-muted-foreground/30" aria-hidden>
						<ChevronLeft className="size-4" />
					</span>
				)}

				{pageItems(current, pageCount).map((item, index) =>
					item === "ellipsis" ? (
						<span
							key={`e-${index}`}
							className="flex size-8 items-center justify-center text-muted-foreground"
							aria-hidden
						>
							…
						</span>
					) : (
						<Link
							key={item}
							href={href(item)}
							aria-label={`Page ${item}`}
							aria-current={item === current ? "page" : undefined}
							className={cn(
								"flex size-8 items-center justify-center rounded-full text-sm font-medium transition-colors",
								item === current
									? "bg-primary text-primary-foreground"
									: "text-primary hover:bg-primary/10",
							)}
						>
							{item}
						</Link>
					),
				)}

				{current < pageCount ? (
					<Link
						href={href(current + 1)}
						aria-label="Next page"
						className="flex size-8 items-center justify-center text-muted-foreground hover:text-foreground"
					>
						<ChevronRight className="size-4" />
					</Link>
				) : (
					<span className="flex size-8 items-center justify-center text-muted-foreground/30" aria-hidden>
						<ChevronRight className="size-4" />
					</span>
				)}
			</div>
			<p className="mt-3 text-center text-sm text-muted-foreground">
				{from} – {to} of {formatCount(total)}
			</p>
		</nav>
	);
}
