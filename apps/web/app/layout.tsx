import { config } from "@config";
import { cn, Toaster } from "@repo/ui";
import { ApiClientProvider } from "@shared/components/ApiClientProvider";
import { ClientProviders } from "@shared/components/ClientProviders";
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { ThemeProvider } from "next-themes";
import { IBM_Plex_Mono, Inter } from "next/font/google";

import "./globals.css";
import "cropperjs/dist/cropper.css";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import type { PropsWithChildren } from "react";

const sansFont = Inter({
	weight: ["400", "500", "600"],
	subsets: ["latin"],
	variable: "--font-inter",
});

const monoFont = IBM_Plex_Mono({
	weight: ["400", "500"],
	subsets: ["latin"],
	variable: "--font-ibm-plex-mono",
});

export const metadata: Metadata = {
	title: {
		absolute: config.appName,
		default: config.appName,
		template: `%s | ${config.appName}`,
	},
};

export default async function RootLayout({ children }: PropsWithChildren) {
	const locale = await getLocale();
	const messages = await getMessages();

	return (
		<html
			lang={locale}
			suppressHydrationWarning
			className={cn(sansFont.variable, monoFont.variable)}
		>
			<body className={cn("min-h-screen bg-background font-sans text-foreground antialiased")}>
				<NuqsAdapter>
					<NextIntlClientProvider messages={messages}>
						<ThemeProvider
							attribute="class"
							disableTransitionOnChange
							enableSystem={false}
							defaultTheme={config.defaultTheme}
							storageKey="bidladder_theme_v2"
							themes={Array.from(config.enabledThemes)}
						>
							<ApiClientProvider>
								<ClientProviders>
									{children}

									<Toaster position="top-right" />
								</ClientProviders>
							</ApiClientProvider>
						</ThemeProvider>
					</NextIntlClientProvider>
				</NuqsAdapter>
			</body>
		</html>
	);
}
