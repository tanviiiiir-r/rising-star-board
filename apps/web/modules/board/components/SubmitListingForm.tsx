"use client";

import { orpc } from "@shared/lib/orpc-query-utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input } from "@repo/ui";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
	name: z.string().trim().min(2).max(60),
	tagline: z.string().trim().min(10).max(120),
	url: z
		.string()
		.trim()
		.max(300)
		.refine((value) => {
			try {
				const parsed = new URL(value);
				return parsed.protocol === "https:" && parsed.hostname.includes(".");
			} catch {
				return false;
			}
		}, "Enter a full https:// URL"),
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

	const onSubmit = form.handleSubmit((values) => {
		mutation.mutate(values);
	});

	return (
		<form className="space-y-4" onSubmit={onSubmit}>
			<Input placeholder="Name" {...form.register("name")} />
			<Input placeholder="Tagline" {...form.register("tagline")} />
			<Input placeholder="https://example.com" {...form.register("url")} />
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
