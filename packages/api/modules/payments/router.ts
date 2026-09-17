import { createCheckoutLink } from "./procedures/create-checkout-link";
import { createClaimCheckout } from "./procedures/create-claim-checkout";
import { createCreditCheckout } from "./procedures/create-credit-checkout";
import { createCustomerPortalLink } from "./procedures/create-customer-portal-link";
import { listPurchases } from "./procedures/list-purchases";

export const paymentsRouter = {
	createCheckoutLink,
	createClaimCheckout,
	createCreditCheckout,
	createCustomerPortalLink,
	listPurchases,
};
