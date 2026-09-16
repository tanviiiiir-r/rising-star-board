import type { RouterClient } from "@orpc/server";

import { adminRouter } from "../modules/admin/router";
import { aiRouter } from "../modules/ai/router";
import { boardRouter } from "../modules/board/router";
import { listingsRouter } from "../modules/listings/router";
import { notificationsRouter } from "../modules/notifications/router";
import { organizationsRouter } from "../modules/organizations/router";
import { paymentsRouter } from "../modules/payments/router";
import { usersRouter } from "../modules/users/router";
import { walletRouter } from "../modules/wallet/router";
import { publicProcedure } from "./procedures";

export const router = publicProcedure.router({
	admin: adminRouter,
	board: boardRouter,
	listings: listingsRouter,
	wallet: walletRouter,
	organizations: organizationsRouter,
	users: usersRouter,
	payments: paymentsRouter,
	ai: aiRouter,
	notifications: notificationsRouter,
});

export type ApiRouterClient = RouterClient<typeof router>;
