import { PublicShell } from "@board/components/SiteChrome";
import type { PropsWithChildren } from "react";

export default async function PublicLayout({ children }: PropsWithChildren) {
	return <PublicShell>{children}</PublicShell>;
}
