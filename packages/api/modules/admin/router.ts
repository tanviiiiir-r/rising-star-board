import { findOrganization } from "./procedures/find-organization";
import { listOrganizations } from "./procedures/list-organizations";
import { listUsers } from "./procedures/list-users";
import {
	adminSetAllocation,
	freezeDaily,
	getAuditLog,
	getReviewQueue,
	grantCredits,
	grantPoints,
	recomputeRankingsProcedure,
	reviewListingProcedure,
} from "./procedures/review-listing";

export const adminRouter = {
	users: {
		list: listUsers,
	},
	organizations: {
		list: listOrganizations,
		find: findOrganization,
	},
	listings: {
		queue: getReviewQueue,
		review: reviewListingProcedure,
	},
	audit: getAuditLog,
	recompute: recomputeRankingsProcedure,
	grantCredits,
	grantPoints,
	setAllocation: adminSetAllocation,
	freezeDaily,
};
