import { AdminBoardControls } from "@board/components/AdminBoardControls";
import { ReviewQueue } from "@board/components/ReviewQueue";

export default function AdminReviewPage() {
	return (
		<div className="space-y-10">
			<div>
				<h1 className="font-display text-[2rem] leading-tight">Review listings</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Approve or reject submissions. Recompute rankings after grants.
				</p>
			</div>
			<div className="surface-card p-5">
				<ReviewQueue />
			</div>
			<div className="surface-card p-5">
				<h2 className="font-display text-xl">Board controls</h2>
				<div className="mt-4">
					<AdminBoardControls />
				</div>
			</div>
		</div>
	);
}
