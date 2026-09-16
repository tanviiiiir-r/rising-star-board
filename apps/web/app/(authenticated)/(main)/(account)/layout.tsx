import { PublicShell } from "@board/components/SiteChrome";
import type { PropsWithChildren } from "react";

export default function UserLayout({ children }: PropsWithChildren) {
	return <PublicShell>{children}</PublicShell>;
}
