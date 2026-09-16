import type { SaasConfig } from "./types";

export const config = {
	appName: "Bid Ladder",
	docsUrl: process.env.NEXT_PUBLIC_DOCS_URL as string | undefined,
	marketingUrl: process.env.NEXT_PUBLIC_MARKETING_URL as string | undefined,
	enabledThemes: ["light", "dark"],
	defaultTheme: "dark",
	redirectAfterSignIn: "/dashboard",
	redirectAfterLogout: "/login",
} as const satisfies SaasConfig;
