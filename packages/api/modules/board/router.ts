import { getBoard } from "./procedures/get-board";
import {
	getBoardStatsProcedure,
	getCategories,
	getCategoriesOverviewProcedure,
} from "./procedures/get-categories";
import { getListing } from "./procedures/get-listing";
import { trackEvent } from "./procedures/track-event";

export const boardRouter = {
	get: getBoard,
	listing: getListing,
	categories: getCategories,
	categoriesOverview: getCategoriesOverviewProcedure,
	stats: getBoardStatsProcedure,
	trackEvent,
};
