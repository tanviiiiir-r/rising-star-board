import { getSession } from "@auth/lib/server";
import type { PropsWithChildren } from "react";

import { SiteFooter } from "./SiteFooter";
import { SiteHeaderNav } from "./SiteHeaderNav";

export async function SiteHeader() {
	const session = await getSession().catch(() => null);

	return (
		<SiteHeaderNav
			signedIn={Boolean(session?.user)}
			isAdmin={session?.user?.role === "admin"}
		/>
	);
}

export { SiteFooter };

export async function PublicShell({ children }: PropsWithChildren) {
	return (
		<div className="flex min-h-screen flex-col">
			<SiteHeader />
			<div className="flex-1">{children}</div>
			<SiteFooter />
		</div>
	);
}
