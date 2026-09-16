import { cn } from "@repo/ui";
import { getMovement } from "@repo/database/ranking";
import { ArrowDown, ArrowUp, Minus, Sparkles } from "lucide-react";

interface MovementBadgeProps {
	rank: number | null;
	previousRank: number | null;
	className?: string;
	compact?: boolean;
}

const neutral =
	"inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground";

export function MovementBadge({ rank, previousRank, className, compact: _compact }: MovementBadgeProps) {
	const movement = getMovement(rank, previousRank);

	if (movement.kind === "none") {
		return null;
	}

	if (movement.kind === "new") {
		return (
			<span className={cn(neutral, className)}>
				<Sparkles className="size-3" />
				New
			</span>
		);
	}

	if (movement.kind === "flat") {
		return (
			<span className={cn(neutral, className)}>
				<Minus className="size-3" />
				Flat
			</span>
		);
	}

	const up = movement.kind === "up";

	return (
		<span
			className={cn(
				"inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium",
				up ? "text-foreground" : "text-muted-foreground",
				className,
			)}
			title={
				up
					? `Up ${movement.delta} since the previous recompute`
					: `Down ${movement.delta} since the previous recompute`
			}
		>
			{up ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
			{movement.delta}
		</span>
	);
}
