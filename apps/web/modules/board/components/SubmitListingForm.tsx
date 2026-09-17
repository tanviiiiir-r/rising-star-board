"use client";

import { orpc } from "@shared/lib/orpc-query-utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input } from "@repo/ui";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { isListingTargetInput, LISTING_TARGET_ERROR, parseListingTarget } from "../lib/listing-target";

const formSchema = z.object({
	name: z.string().trim().min(2).max(60),
	tagline: z.string().trim().min(10).max(120),
	url: z.string().trim().min(1).max(300).refine(isListingTargetInput, LISTING_TARGET_ERROR),
	description: z.string().trim().min(20).max(1200),
	categoryId: z.string().uuid(),
});

interface CategoryOption {
	id: string;
	name: string;
}

export function SubmitListingForm({ categories }: { categories: CategoryOption[] }) {
	const router = useRouter();
	const form = useForm({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			tagline: "",
			url: "",
			description: "",
			categoryId: categories[0]?.id ?? "",
		},
	});
	const mutation = useMutation({
		...orpc.listings.submit.mutationOptions(),
		onSuccess: () => {
			router.push("/dashboard");
		},
	});
	const url = form.watch("url");
	const [debounced, setDebounced] = useState("");
	const [logoFailed, setLogoFailed] = useState(false);
	useEffect(() => {
		const timer = window.setTimeout(() => setDebounced((url ?? "").trim()), 300);
		return () => window.clearTimeout(timer);
	}, [url]);
	const target = parseListingTarget(debounced);
	const previewQuery = useQuery({
		...orpc.board.listingPreview.queryOptions({ input: { raw: debounced } }),
		enabled: Boolean(target),
		staleTime: 60_000,
	});
	const preview = previewQuery.data ?? null;

	useEffect(() => {
		if (!preview) {
			return;
		}
		if (!form.getValues("name") && preview.name) {
			form.setValue("name", preview.name, { shouldValidate: true });
		}
		if (!form.getValues("description") && preview.description.length >= 20) {
			form.setValue("description", preview.description, { shouldValidate: true });
		}
	}, [form, preview]);

	const onSubmit = form.handleSubmit((values) => {
		mutation.mutate(values);
	});
	const resolvedLogo = preview?.logoUrl ?? target?.logoUrl ?? null;
	const logoUrl = !logoFailed && resolvedLogo ? resolvedLogo : null;

	useEffect(() => {
		setLogoFailed(false);
	}, [resolvedLogo]);

	return (
		<form className="space-y-4" onSubmit={onSubmit}>
			<Input placeholder="Name" {...form.register("name")} />
			<Input placeholder="Tagline" {...form.register("tagline")} />
			<label className="relative block">
				{logoUrl ? (
					<img
						src={logoUrl}
						alt=""
						className="pointer-events-none absolute top-1/2 left-2.5 size-6 -translate-y-1/2 rounded-full bg-muted object-cover"
						onError={() => setLogoFailed(true)}
					/>
				) : null}
				<Input
					placeholder="https://example.com or @handle"
					className={logoUrl ? "pl-10" : undefined}
					{...form.register("url")}
				/>
			</label>
			<textarea
				className="min-h-32 w-full rounded-xl border bg-background px-3 py-2 text-sm"
				placeholder="What is it?"
				{...form.register("description")}
			/>
			<select
				className="w-full rounded-xl border bg-background px-3 py-2 text-sm"
				{...form.register("categoryId")}
			>
				{categories.map((category) => (
					<option key={category.id} value={category.id}>
						{category.name}
					</option>
				))}
			</select>
			{form.formState.errors.name ? (
				<p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
			) : null}
			{form.formState.errors.tagline ? (
				<p className="text-sm text-destructive">{form.formState.errors.tagline.message}</p>
			) : null}
			{form.formState.errors.url ? (
				<p className="text-sm text-destructive">{form.formState.errors.url.message}</p>
			) : null}
			{form.formState.errors.description ? (
				<p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
			) : null}
			{mutation.error ? (
				<p className="text-sm text-destructive">
					{mutation.error instanceof Error ? mutation.error.message : "Submit failed"}
				</p>
			) : null}
			<Button type="submit" disabled={mutation.isPending || form.formState.isSubmitting}>
				Submit for review
			</Button>
		</form>
	);
}
