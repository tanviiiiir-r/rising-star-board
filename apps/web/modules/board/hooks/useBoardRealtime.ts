"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Refresh the RSC board when rankings move. No extra client SDK. */
export function useBoardRealtime() {
	const router = useRouter();

	useEffect(() => {
		const refresh = () => router.refresh();
		const interval = window.setInterval(refresh, 15_000);
		const onVisible = () => {
			if (document.visibilityState === "visible") {
				refresh();
			}
		};
		document.addEventListener("visibilitychange", onVisible);
		return () => {
			window.clearInterval(interval);
			document.removeEventListener("visibilitychange", onVisible);
		};
	}, [router]);
}
