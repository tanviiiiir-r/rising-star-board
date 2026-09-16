"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Globe } from "lucide-react";
import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui";
import { costToClaimFirstCents, previewRankForAmount } from "@repo/database/ranking";

import { parseListingTarget } from "../lib/listing-target";
import { AmountStepper, snapAllocationCents } from "./AmountStepper";
import { ConfirmRankDialog } from "./ConfirmRankDialog";

export function ClaimRankControl({
	listings,
	categories,
	archived = false,
	requestedCents = null,
}: {
	listings: Array<{ allocationCents: number }>;
	categories: Array<{ id: string; name: string }>;
	archived?: boolean;
	requestedCents?: number | null;
}) {
	const router = useRouter();
	const defaultCents = costToClaimFirstCents(listings[0]?.allocationCents ?? null, false);
	const [draftCents, setDraftCents] = useState(defaultCents);
	const [raw, setRaw] = useState("");
	const [debounced, setDebounced] = useState("");
	const [categoryId, setCategoryId] = useState("");
	const [logoFailed, setLogoFailed] = useState(false);
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [agreed, setAgreed] = useState(false);

	useEffect(() => {
		setDraftCents(defaultCents);
	}, [defaultCents]);

	useEffect(() => {
		if (requestedCents != null && requestedCents > 0) {
			setDraftCents(requestedCents);
		}
	}, [requestedCents]);

	useEffect(() => {
		const timer = window.setTimeout(() => setDebounced(raw.trim()), 300);
		return () => window.clearTimeout(timer);
	}, [raw]);

	const target = parseListingTarget(debounced);

	useEffect(() => {
		setLogoFailed(false);
	}, [target?.logoUrl]);

	const previewCents = snapAllocationCents(draftCents);
	const previewRank = previewRankForAmount(listings, previewCents) ?? 1;
	const logoUrl = !logoFailed && target?.logoUrl ? target.logoUrl : null;
	const canClaim = Boolean(target && categoryId && !archived);
	const categoryName = categories.find((category) => category.id === categoryId)?.name ?? "Category";

	return (
		<div className="mx-auto max-w-3xl text-center">
			<h1 className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 font-display text-[1.75rem] font-medium leading-none tracking-[-0.03em] sm:text-5xl">
				<span>Claim #{previewRank} for</span>
				<AmountStepper valueCents={draftCents} onChange={setDraftCents} disabled={archived} />
			</h1>

			<form
				className="mt-8 flex flex-col gap-2 sm:flex-row sm:items-center"
				onSubmit={(event) => {
					event.preventDefault();
					if (!canClaim || !target) {
						return;
					}
					setAgreed(false);
					setConfirmOpen(true);
				}}
			>
				<label className="relative min-w-0 flex-1">
					{logoUrl ? (
						<img
							src={logoUrl}
							alt=""
							className="pointer-events-none absolute top-1/2 left-2.5 size-6 -translate-y-1/2 rounded-full bg-muted object-cover"
							onError={() => setLogoFailed(true)}
						/>
					) : (
						<Globe className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
					)}
					<Input
						id="claim-target"
						type="text"
						name="target"
						required
						autoComplete="off"
						spellCheck={false}
						placeholder="Your product URL or @handle"
						value={raw}
						disabled={archived}
						onChange={(event) => setRaw(event.target.value)}
						className="h-11 rounded-full pl-10 shadow-none"
					/>
				</label>
				<Select
					{...(categoryId ? { value: categoryId } : {})}
					onValueChange={setCategoryId}
					disabled={archived}
				>
					<SelectTrigger className="h-11 w-full rounded-full sm:w-[220px]">
						<SelectValue placeholder="Choose a category" />
					</SelectTrigger>
					<SelectContent>
						{categories.map((category) => (
							<SelectItem key={category.id} value={category.id}>
								{category.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<Button type="submit" variant="primary" className="h-11 rounded-full px-6" disabled={!canClaim}>
					Claim rank
				</Button>
			</form>

			<ConfirmRankDialog
				open={confirmOpen}
				onOpenChange={setConfirmOpen}
				rank={previewRank}
				cents={previewCents}
				categoryName={categoryName}
				agreed={agreed}
				onAgreedChange={setAgreed}
				onConfirm={() => {
					if (!target) {
						return;
					}
					setConfirmOpen(false);
					const params = new URLSearchParams({
						cents: String(previewCents),
						method: "credits",
						url: target.canonicalUrl,
						categoryId,
						name: target.label,
					});
					if (target.logoUrl) {
						params.set("logoUrl", target.logoUrl);
					}
					router.push(`/credits?${params.toString()}`);
				}}
			/>
		</div>
	);
}
