import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Globe } from "lucide-react";

import { AmountStepper, snapAllocationCents } from "@/components/board/AmountStepper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { costToClaimFirstCents, previewRankForAmount } from "@/lib/ranking";

export function ClaimRankControl({
  listings,
  categories,
  archived = false,
}: {
  listings: Array<{ allocationCents: number }>;
  categories: Array<{ id: string; name: string }>;
  archived?: boolean;
}) {
  const navigate = useNavigate();
  const defaultCents = costToClaimFirstCents(listings[0]?.allocationCents ?? null, false);
  const [draftCents, setDraftCents] = useState(defaultCents);
  const [url, setUrl] = useState("");
  const [categoryId, setCategoryId] = useState("");

  useEffect(() => {
    setDraftCents(defaultCents);
  }, [defaultCents]);

  const previewCents = snapAllocationCents(draftCents);
  const previewRank = previewRankForAmount(listings, previewCents) ?? 1;

  return (
    <div className="mx-auto max-w-3xl text-center">
      <h1 className="flex flex-wrap items-center justify-center gap-x-2 gap-y-3 text-[2rem] font-medium leading-none tracking-[-0.022em] sm:text-5xl">
        <span>Claim #{previewRank} for</span>
        <AmountStepper
          valueCents={draftCents}
          onChange={setDraftCents}
          disabled={archived}
        />
      </h1>

      <form
        className="mt-8 flex flex-col gap-2 sm:flex-row sm:items-center"
        onSubmit={(event) => {
          event.preventDefault();
          if (archived || !url.trim() || !categoryId) return;
          void navigate({
            to: "/submit",
            search: {
              url: url.trim(),
              categoryId,
              cents: previewCents,
            },
          });
        }}
      >
        <label className="relative min-w-0 flex-1">
          <Globe className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="url"
            name="url"
            required
            placeholder="Your product URL"
            value={url}
            disabled={archived}
            onChange={(event) => setUrl(event.target.value)}
            className="h-11 rounded-full pl-9"
          />
        </label>
        <Select value={categoryId || undefined} onValueChange={setCategoryId} disabled={archived}>
          <SelectTrigger className="h-11 w-full rounded-full sm:w-[220px]">
            <SelectValue placeholder="Choose a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="submit" className="h-11 rounded-full px-6" disabled={archived || !categoryId}>
          Claim rank
        </Button>
      </form>
    </div>
  );
}
