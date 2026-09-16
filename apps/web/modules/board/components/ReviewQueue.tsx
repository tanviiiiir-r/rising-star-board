"use client";

import { orpc } from "@shared/lib/orpc-query-utils";
import { Button } from "@repo/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function ReviewQueue() {
	const queryClient = useQueryClient();
	const queue = useQuery(orpc.admin.listings.queue.queryOptions());
	const review = useMutation({
		...orpc.admin.listings.review.mutationOptions(),
		onSuccess: () => {
			void queryClient.invalidateQueries();
		},
	});

	if (queue.isLoading) {
		return <p className="text-muted-foreground">Loading queue…</p>;
	}

	return (
		<ul className="divide-y rounded-2xl border bg-card">
			{(queue.data ?? []).map((listing) => (
				<li key={listing.id} className="space-y-2 px-5 py-4">
					<p className="font-medium">{listing.name}</p>
					<p className="text-sm text-muted-foreground">
						{listing.status} · {listing.url}
					</p>
					<div className="flex gap-2">
						<Button
							size="sm"
							onClick={() => review.mutate({ listingId: listing.id, action: "approve" })}
						>
							Approve
						</Button>
						<Button
							size="sm"
							variant="outline"
							onClick={() =>
								review.mutate({
									listingId: listing.id,
									action: "reject",
									reason: "Does not meet the board rules.",
								})
							}
						>
							Reject
						</Button>
					</div>
				</li>
			))}
		</ul>
	);
}
