// @ts-expect-error - PrismaPlugin is not typed
import { PrismaPlugin } from "@prisma/nextjs-monorepo-workaround-plugin";
import { config as loadEnv } from "dotenv";
import { join } from "node:path";
import type { NextConfig } from "next";
import nextIntlPlugin from "next-intl/plugin";

const repoRoot = join(__dirname, "../..");
loadEnv({ path: join(repoRoot, ".env") });
loadEnv({ path: join(repoRoot, ".env.local"), override: true });

if (process.env.VERCEL) {
	process.env.DATABASE_URL ??= "postgresql://postgres:postgres@127.0.0.1:5432/postgres";
	process.env.DIRECT_URL ??= process.env.DATABASE_URL;
	process.env.BETTER_AUTH_SECRET ??= "vercel-build-placeholder";
	process.env.RESEND_API_KEY ??= "re_placeholder";
}

const withNextIntl = nextIntlPlugin("./modules/i18n/request.ts");

const nextConfig: NextConfig = {
	// Build tracing only. Do not set turbopack.root to the monorepo — on an
	// 8GB machine that indexes node_modules and OOMs the laptop.
	outputFileTracingRoot: join(__dirname, "../.."),
	transpilePackages: ["@repo/api", "@repo/auth", "@repo/database", "@repo/ui"],
	images: {
		remotePatterns: [
			{
				// google profile images
				protocol: "https",
				hostname: "lh3.googleusercontent.com",
			},
			{
				// github profile images
				protocol: "https",
				hostname: "avatars.githubusercontent.com",
			},
		],
	},
	async redirects() {
		return [
			{
				source: "/settings",
				destination: "/settings/general",
				permanent: true,
			},
			{
				source: "/:organizationSlug/settings",
				destination: "/:organizationSlug/settings/general",
				permanent: true,
			},
			{
				source: "/admin",
				destination: "/admin/review",
				permanent: false,
			},
			{
				source: "/onboarding",
				destination: "/dashboard",
				permanent: false,
			},
			{
				source: "/choose-plan",
				destination: "/dashboard",
				permanent: false,
			},
			{
				source: "/chatbot",
				destination: "/dashboard",
				permanent: false,
			},
			{
				source: "/new-organization",
				destination: "/dashboard",
				permanent: false,
			},
			{
				source: "/credits/buy",
				destination: "/credits",
				permanent: false,
			},
			{
				source: "/auth",
				destination: "/login",
				permanent: false,
			},
		];
	},
	webpack: (config, { webpack, isServer }) => {
		config.plugins.push(
			new webpack.IgnorePlugin({
				resourceRegExp: /^pg-native$|^cloudflare:sockets$/,
			}),
		);

		if (isServer) {
			config.plugins.push(new PrismaPlugin());
		}

		return config;
	},
};

export default withNextIntl(nextConfig);
