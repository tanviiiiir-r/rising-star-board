import { Link } from "@tanstack/react-router";

import { Checkbox } from "@/components/ui/checkbox";
import { LEGAL } from "@/lib/legal";
import { cn } from "@/lib/utils";

export function TermsAgreeBox({
  checked,
  onCheckedChange,
  id = "agree-terms",
}: {
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  id?: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className={cn(
          "flex cursor-pointer items-start gap-3 rounded-xl border px-3.5 py-3 text-sm leading-relaxed",
          checked ? "border-primary bg-primary/8" : "border-border bg-card",
        )}
      >
        <Checkbox
          id={id}
          className="mt-0.5 size-5 rounded-md"
          checked={checked}
          onCheckedChange={(value) => onCheckedChange(value === true)}
        />
        <span className="text-left text-foreground">
          I have read and agree to the{" "}
          <Link to="/terms" className="text-primary underline underline-offset-2" onClick={(event) => event.stopPropagation()}>
            Terms of Service
          </Link>{" "}
          of {LEGAL.brand}
        </span>
      </label>
      <p className="mt-2 px-1 text-sm text-muted-foreground">
        <Link to="/privacy" className="underline underline-offset-2 hover:text-foreground">
          Privacy
        </Link>
        <span className="mx-1.5">·</span>
        <Link to="/how-ranking-works" className="underline underline-offset-2 hover:text-foreground">
          Rules
        </Link>
      </p>
    </div>
  );
}
