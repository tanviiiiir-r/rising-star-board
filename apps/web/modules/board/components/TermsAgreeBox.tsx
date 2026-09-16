"use client";

import Link from "next/link";
import { cn } from "@repo/ui";

export function TermsAgreeBox({
	checked,
	onCheckedChange,
	id = "agree-terms",
}: {
	checked: boolean;
	onCheckedChange: (next: boolean) => void;
	id?: string;
}) {
	return (
		<div>
			<label
				htmlFor={id}
				className={cn(
					"flex cursor-pointer items-start gap-3 rounded-xl border px-3.5 py-3 text-sm leading-relaxed",
					checked ? "border-primary bg-primary/8" : "border-border bg-card",
				)}
			>
				<input
					id={id}
					type="checkbox"
					className="mt-0.5 size-5 rounded-md border-border"
					checked={checked}
					onChange={(event) => onCheckedChange(event.target.checked)}
				/>
				<span className="text-left text-foreground">
					I have read and agree to the{" "}
					<Link
						href="/how-ranking-works"
						className="text-primary underline underline-offset-2"
						onClick={(event) => event.stopPropagation()}
					>
						ranking rules
					</Link>{" "}
					of Bid Ladder
				</span>
			</label>
			<p className="mt-2 px-1 text-sm text-muted-foreground">
				<Link href="/about" className="underline underline-offset-2 hover:text-foreground">
					About
				</Link>
				<span className="mx-1.5">·</span>
				<Link href="/how-ranking-works" className="underline underline-offset-2 hover:text-foreground">
					Rules
				</Link>
			</p>
		</div>
	);
}
