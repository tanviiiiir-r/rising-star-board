import { getBoardListingBySlug } from "@repo/database";
import { ImageResponse } from "next/og";

export const runtime = "nodejs";

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ slug: string }> },
) {
	const { slug } = await params;
	const listing = await getBoardListingBySlug(slug);

	return new ImageResponse(
		(
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					justifyContent: "center",
					width: "100%",
					height: "100%",
					padding: 64,
					background: "#111111",
					color: "#e4f222",
					fontSize: 48,
				}}
			>
				<div style={{ fontSize: 24, color: "#f5f5f5" }}>Bid Ladder</div>
				<div>{listing ? `#${listing.rank ?? "—"} ${listing.name}` : "Listing"}</div>
			</div>
		),
		{ width: 1200, height: 630 },
	);
}
