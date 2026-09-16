import { getSession } from "@auth/lib/server";
import { redirect } from "next/navigation";
import type { PropsWithChildren } from "react";

export default async function AdminLayout({ children }: PropsWithChildren) {
	const session = await getSession();

	if (!session) {
		redirect("/login");
	}

	if (session.user?.role !== "admin") {
		redirect("/");
	}

	return <div className="mx-auto w-full max-w-3xl px-4 pb-16 pt-8">{children}</div>;
}
