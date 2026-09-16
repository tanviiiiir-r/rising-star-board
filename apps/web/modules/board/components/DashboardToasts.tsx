"use client";

import { toastSuccess } from "@repo/ui";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export function DashboardToasts() {
	const searchParams = useSearchParams();
	const router = useRouter();

	useEffect(() => {
		const topup = searchParams.get("topup") === "1";
		const claimed = searchParams.get("claimed") === "1";
		const converted = searchParams.get("converted") === "1";
		if (!topup && !claimed && !converted) {
			return;
		}
		toastSuccess(
			topup || claimed
				? "Credits added. Allocate them on an approved listing to take a rank."
				: "Points converted to credits. Allocate them on an approved listing.",
		);
		router.replace("/dashboard");
	}, [searchParams, router]);

	return null;
}
