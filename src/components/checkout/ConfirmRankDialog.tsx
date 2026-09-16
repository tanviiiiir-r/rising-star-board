import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { TermsAgreeBox } from "@/components/checkout/TermsAgreeBox";
import { formatCents } from "@/lib/format";

export function ConfirmRankDialog({
  open,
  onOpenChange,
  rank,
  cents,
  categoryName,
  agreed,
  onAgreedChange,
  onConfirm,
  confirming = false,
  confirmLabel = "Continue to checkout",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rank: number;
  cents: number;
  categoryName: string;
  agreed: boolean;
  onAgreedChange: (next: boolean) => void;
  onConfirm: () => void;
  confirming?: boolean;
  confirmLabel?: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[32rem] gap-0 rounded-2xl border-border bg-card p-0 sm:rounded-2xl">
        <div className="px-6 pb-5 pt-6">
          <DialogTitle className="font-display text-xl tracking-[-0.02em]">
            Confirm this rank
          </DialogTitle>
          <DialogDescription className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Check the rank and price, then agree to the Terms of Service to continue.
          </DialogDescription>

          <div className="mt-5 grid grid-cols-2 gap-6 rounded-xl border border-border bg-muted/40 px-4 py-4">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Rank
              </p>
              <p className="mt-1 font-display text-3xl leading-none tracking-[-0.03em]">#{rank}</p>
              <p className="mt-2 text-sm text-muted-foreground">{categoryName}</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Price
              </p>
              <p className="allocation-price mt-1 text-3xl leading-none">{formatCents(cents)}</p>
              <p className="mt-2 text-sm text-muted-foreground">Due now</p>
            </div>
          </div>

          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
            A listing at that rank on the public board. It goes live when payment confirms. Someone
            else can claim a higher rank.
          </p>

          <div className="mt-5">
            <TermsAgreeBox checked={agreed} onCheckedChange={onAgreedChange} />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border px-6 py-4">
          <Button
            type="button"
            variant="outline"
            className="rounded-full px-5"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="rounded-full px-5"
            disabled={!agreed || confirming}
            onClick={onConfirm}
          >
            {confirming ? "Working…" : confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
