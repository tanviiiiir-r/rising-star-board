import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { AmountStepper, snapAllocationCents } from "@/components/board/AmountStepper";
import { Button } from "@/components/ui/button";
import { setListingAllocation } from "@/lib/allocation.functions";
import { formatCents } from "@/lib/format";
import { RANKING, assertAllocationAmount } from "@/lib/ranking";

export function AllocationControl({
  listingId,
  allocationCents,
  availableCents,
}: {
  listingId: string;
  allocationCents: number;
  availableCents: number;
}) {
  const [draftCents, setDraftCents] = useState(Math.max(allocationCents, RANKING.minVisibleCents));
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (newCents: number) => setListingAllocation({ data: { listingId, newCents } }),
    onSuccess: async () => {
      toast.success("Allocation updated");
      await queryClient.invalidateQueries();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const delta = draftCents - allocationCents;
  const check = assertAllocationAmount(draftCents);
  const shortfallCents = Math.max(0, delta - availableCents);
  const overBudget = shortfallCents > 0;
  const canSave = check.ok && delta !== 0 && !overBudget && !mutation.isPending;
  const buyCents = snapAllocationCents(Math.max(RANKING.minVisibleCents, shortfallCents));

  return (
    <div className="flex shrink-0 flex-col items-end gap-1">
      <div className="flex items-center gap-1">
        <AmountStepper size="row" valueCents={draftCents} onChange={setDraftCents} />
        <Button type="button" size="sm" disabled={!canSave} onClick={() => mutation.mutate(draftCents)}>
          {mutation.isPending ? "Saving" : "Set"}
        </Button>
        {allocationCents > 0 ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate(0)}
          >
            Release
          </Button>
        ) : null}
      </div>
      {!check.ok ? <p className="text-[11px] text-fall">{check.reason}</p> : null}
      {overBudget ? (
        <p className="text-[11px] text-fall">
          {formatCents(shortfallCents)} short ·{" "}
          <Link
            to="/credits/buy"
            search={{ cents: buyCents, method: "credits" }}
            className="underline-offset-2 hover:underline"
          >
            Buy
          </Link>
        </p>
      ) : null}
    </div>
  );
}
