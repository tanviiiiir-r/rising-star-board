"use client";

import { orpc } from "@shared/lib/orpc-query-utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input } from "@repo/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";

const grantSchema = z.object({
	userId: z.string().uuid(),
	amount: z.coerce.number().int().positive(),
	reason: z.string().optional(),
	kind: z.enum(["credits", "points"]),
});

const allocationSchema = z.object({
	listingId: z.string().uuid(),
	cents: z.coerce.number().int(),
});

export function AdminBoardControls() {
	const queryClient = useQueryClient();
	const audit = useQuery(orpc.admin.audit.queryOptions());
	const grantForm = useForm({
		resolver: zodResolver(grantSchema),
		defaultValues: { userId: "", amount: 1000, reason: "", kind: "credits" as const },
	});
	const allocationForm = useForm({
		resolver: zodResolver(allocationSchema),
		defaultValues: { listingId: "", cents: 1000 },
	});

	const recompute = useMutation({
		...orpc.admin.recompute.mutationOptions(),
		onSuccess: () => {
			void queryClient.invalidateQueries();
		},
	});
	const grantCredits = useMutation({
		...orpc.admin.grantCredits.mutationOptions(),
		onSuccess: () => {
			void queryClient.invalidateQueries();
		},
	});
	const grantPoints = useMutation({
		...orpc.admin.grantPoints.mutationOptions(),
		onSuccess: () => {
			void queryClient.invalidateQueries();
		},
	});
	const setAllocation = useMutation({
		...orpc.admin.setAllocation.mutationOptions(),
		onSuccess: () => {
			void queryClient.invalidateQueries();
		},
	});

	return (
		<div className="space-y-8">
			<div className="flex flex-wrap gap-2">
				<Button type="button" variant="outline" onClick={() => recompute.mutate({})} disabled={recompute.isPending}>
					Recompute rankings
				</Button>
				{recompute.error ? (
					<p className="text-sm text-destructive">
						{recompute.error instanceof Error ? recompute.error.message : "Recompute failed"}
					</p>
				) : null}
			</div>

			<form
				className="grid gap-3 rounded-2xl border bg-card p-5 md:grid-cols-2"
				onSubmit={grantForm.handleSubmit((values) => {
					const payload = {
						userId: values.userId,
						reason: values.reason,
					};
					if (values.kind === "credits") {
						grantCredits.mutate({ ...payload, cents: values.amount });
						return;
					}
					grantPoints.mutate({ ...payload, points: values.amount });
				})}
			>
				<p className="md:col-span-2 font-medium">Grant wallet</p>
				<Input placeholder="User UUID" {...grantForm.register("userId")} />
				<Input type="number" min={1} {...grantForm.register("amount")} />
				<Input placeholder="Reason" {...grantForm.register("reason")} />
				<select className="rounded-xl border bg-background px-3 py-2 text-sm" {...grantForm.register("kind")}>
					<option value="credits">Credits (cents)</option>
					<option value="points">Points</option>
				</select>
				<Button type="submit" disabled={grantCredits.isPending || grantPoints.isPending}>
					Grant
				</Button>
			</form>

			<form
				className="grid gap-3 rounded-2xl border bg-card p-5 md:grid-cols-2"
				onSubmit={allocationForm.handleSubmit((values) => {
					setAllocation.mutate(values);
				})}
			>
				<p className="md:col-span-2 font-medium">Set allocation</p>
				<Input placeholder="Listing UUID" {...allocationForm.register("listingId")} />
				<Input type="number" {...allocationForm.register("cents")} />
				<Button type="submit" disabled={setAllocation.isPending}>
					Call set_allocation
				</Button>
			</form>

			<section className="space-y-3">
				<h2 className="text-lg font-medium">Audit log</h2>
				<ul className="divide-y rounded-2xl border bg-card">
					{(audit.data ?? []).length === 0 ? (
						<li className="px-5 py-6 text-sm text-muted-foreground">No audit rows yet.</li>
					) : (
						(audit.data ?? []).map((row) => (
							<li key={row.id} className="px-5 py-3 text-sm">
								<p className="font-medium">{row.action}</p>
								<p className="text-muted-foreground">
									{row.listingId ?? "—"} · {row.reason ?? "no reason"} ·{" "}
									{new Date(row.createdAt).toISOString()}
								</p>
							</li>
						))
					)}
				</ul>
			</section>
		</div>
	);
}
