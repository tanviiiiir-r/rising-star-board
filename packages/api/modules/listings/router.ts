import { myListings } from "./procedures/my-listings";
import { setListingAllocation } from "./procedures/set-allocation";
import { submitListing } from "./procedures/submit-listing";

export const listingsRouter = {
	submit: submitListing,
	mine: myListings,
	setAllocation: setListingAllocation,
};
