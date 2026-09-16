import type { PropsWithChildren } from "react";

export default function SettingsLayout({ children }: PropsWithChildren) {
	return <div className="mx-auto w-full max-w-3xl px-4 pb-16 pt-8">{children}</div>;
}
