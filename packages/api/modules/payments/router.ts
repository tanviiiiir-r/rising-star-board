import { createCheckoutLink } from "./procedures/create-checkout-link";
import { createCreditCheckout } from "./procedures/create-credit-checkout";
import { createCustomerPortalLink } from "./procedures/create-customer-portal-link";
import { listPurchases } from "./procedures/list-purchases";

export const paymentsRouter = {
	createCheckoutLink,
	createCreditCheckout,
	createCustomerPortalLink,
	listPurchases,
};
