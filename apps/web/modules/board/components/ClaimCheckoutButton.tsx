"use client";

import { orpc } from "@shared/lib/orpc-query-utils";
import { Button } from "@repo/ui";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

export function ClaimCheckoutButton({
	listingId,
	cents,
}: {
	listingId: string;
	cents: number;
}) {
	const [error, setError] = useState<string | null>(null);
	const mutation = useMutation({
		...orpc.payments.createCreditCheckout.mutationOptions(),
		onSuccess: (result) => {
			window.location.href = result.url;
		},
		onError: (cause) => {
			setError(cause instanceof Error ? cause.message : "Checkout failed");
		},
	});

	if (cents <= 0) {
		return null;
	}

	return (
		<div className="space-y-2">
			<Button
				type="button"
				disabled={mutation.isPending}
				onClick={() =>
					mutation.mutate({
						cents,
						method: "credits",
						kind: "rank_claim",
						listingId,
						origin: window.location.origin,
					})
				}
			>
				Pay to claim
			</Button>
			<p className="text-xs text-muted-foreground">
				Guests can buy the rank. Points only apply after you log in.
			</p>
			{error ? <p className="text-sm text-destructive">{error}</p> : null}
		</div>
	);
}
