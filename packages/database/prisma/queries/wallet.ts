import { db } from "../client";

export async function getWallet(userId: string) {
	return db.wallet.findUnique({
		where: { userId },
	});
}

export async function getOrCreateWallet(userId: string) {
	return db.wallet.upsert({
		where: { userId },
		create: { userId, availableCents: 0, availablePoints: 0 },
		update: {},
	});
}

export async function listCreditLedger(userId: string) {
	return db.creditLedger.findMany({
		where: { userId },
		orderBy: { createdAt: "desc" },
		take: 50,
	});
}
