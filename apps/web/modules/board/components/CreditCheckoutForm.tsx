"use client";

import { orpc } from "@shared/lib/orpc-query-utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input } from "@repo/ui";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";

/** Matches RANKING.incrementCents in @repo/database. */
const incrementCents = 100;
const incrementDollars = incrementCents / 100;

const formSchema = z.object({
	dollars: z.coerce
		.number()
		.positive()
		.refine((value) => Number.isInteger(value * 100) && (value * 100) % incrementCents === 0, {
			message: `Amount must be in $${incrementDollars} increments.`,
		}),
});

export function CreditCheckoutForm({
	initialCents = 1000,
	method = "credits",
}: {
	initialCents?: number;
	method?: "credits" | "points";
}) {
	const form = useForm({
		resolver: zodResolver(formSchema),
		defaultValues: {
			dollars: Math.max(incrementDollars, Math.round(initialCents / 100)),
		},
	});
	const mutation = useMutation({
		...orpc.payments.createCreditCheckout.mutationOptions(),
		onSuccess: (result) => {
			window.location.href = result.url;
		},
	});

	const onSubmit = form.handleSubmit((values) => {
		mutation.mutate({
			cents: Math.round(values.dollars * 100),
			method,
			kind: "credit_topup",
			origin: window.location.origin,
		});
	});

	return (
		<form className="space-y-4" onSubmit={onSubmit}>
			<label className="block text-sm text-muted-foreground">
				Amount (USD, ${incrementDollars} steps)
				<Input
					className="mt-1"
					type="number"
					min={incrementDollars}
					step={incrementDollars}
					{...form.register("dollars")}
				/>
			</label>
			{form.formState.errors.dollars ? (
				<p className="text-sm text-destructive">{form.formState.errors.dollars.message}</p>
			) : null}
			{mutation.error ? (
				<p className="text-sm text-destructive">
					{mutation.error instanceof Error ? mutation.error.message : "Checkout failed"}
				</p>
			) : null}
			<Button type="submit" variant="primary" disabled={mutation.isPending || form.formState.isSubmitting}>
				{mutation.isPending ? "Opening Stripe…" : "Continue to Stripe"}
			</Button>
			<p className="text-xs text-muted-foreground">
				{method === "points"
					? "Points apply on a signed-in account after checkout."
					: "After payment, allocate on the dashboard to take a rank."}
			</p>
		</form>
	);
}
