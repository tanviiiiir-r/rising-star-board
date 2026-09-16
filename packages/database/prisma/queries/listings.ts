import { db } from "../client";

function slugify(name: string) {
	const base = name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 40);
	return `${base || "listing"}-${Math.random().toString(36).slice(2, 7)}`;
}

export async function createListing(input: {
	ownerId: string;
	categoryId: string;
	name: string;
	tagline: string;
	url: string;
	description: string;
}) {
	return db.listing.create({
		data: {
			ownerId: input.ownerId,
			categoryId: input.categoryId,
			name: input.name,
			tagline: input.tagline,
			url: input.url,
			description: input.description,
			slug: slugify(input.name),
			status: "pending",
		},
		select: { id: true, slug: true },
	});
}

export async function getListingOwnerAndAllocation(listingId: string) {
	return db.listing.findUnique({
		where: { id: listingId },
		select: { id: true, ownerId: true, allocationCents: true },
	});
}

export async function listListingsForOwner(ownerId: string) {
	return db.listing.findMany({
		where: { ownerId },
		include: {
			category: { select: { name: true } },
			ranking: { select: { rank: true, previousRank: true, uniqueViews: true, shares: true, score: true } },
		},
		orderBy: { createdAt: "desc" },
	});
}

export async function listReviewQueue() {
	return db.listing.findMany({
		include: {
			category: { select: { name: true } },
		},
		orderBy: { createdAt: "desc" },
		take: 100,
	});
}

export async function reviewListing(input: {
	listingId: string;
	action: "approve" | "reject";
	reason?: string;
	adminId: string;
}) {
	const status = input.action === "approve" ? "approved" : "rejected";
	const listing = await db.listing.update({
		where: { id: input.listingId },
		data: {
			status,
			rejectionReason: input.action === "reject" ? input.reason : null,
			approvedAt: input.action === "approve" ? new Date() : null,
		},
	});

	await db.adminAuditLog.create({
		data: {
			adminId: input.adminId,
			listingId: input.listingId,
			action: input.action,
			reason: input.reason,
		},
	});

	return listing;
}

export async function listAuditLog() {
	return db.adminAuditLog.findMany({
		orderBy: { createdAt: "desc" },
		take: 50,
	});
}
