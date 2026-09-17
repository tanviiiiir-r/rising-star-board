import { getBoard } from "./procedures/get-board";
import {
	getBoardStatsProcedure,
	getCategories,
	getCategoriesOverviewProcedure,
} from "./procedures/get-categories";
import { getListing } from "./procedures/get-listing";
import { resolveListingPreviewProcedure } from "./procedures/resolve-listing-preview";
import { trackEvent } from "./procedures/track-event";

export const boardRouter = {
	get: getBoard,
	listing: getListing,
	listingPreview: resolveListingPreviewProcedure,
	categories: getCategories,
	categoriesOverview: getCategoriesOverviewProcedure,
	stats: getBoardStatsProcedure,
	trackEvent,
};
