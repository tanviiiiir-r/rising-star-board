import { getOrCreateWallet, listCreditLedger } from "@repo/database";

import { protectedProcedure } from "../../../orpc/procedures";

export const getWallet = protectedProcedure
	.route({
		method: "GET",
		path: "/wallet",
		tags: ["Wallet"],
		summary: "Current user wallet and recent ledger",
	})
	.handler(async ({ context }) => {
		const wallet = await getOrCreateWallet(context.user.id);
		const ledger = await listCreditLedger(context.user.id);
		return { wallet, ledger };
	});
