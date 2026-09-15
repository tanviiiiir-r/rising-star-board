import { cn } from "@/lib/utils";
import { BOARDS, type BoardKind } from "@/lib/ranking";

const LABELS: Record<BoardKind, string> = {
  all_time: "All-time",
  today: "Today",
  daily: "Daily",
};

export function BoardTabs({
  active,
  onChange,
}: {
  active: BoardKind;
  onChange: (board: BoardKind) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Board"
      className="inline-flex items-center gap-1 rounded-full border-[0.5px] border-border p-1"
    >
      {BOARDS.map((board) => {
        const isActive = board === active;
        return (
          <button
            key={board}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(board)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {LABELS[board]}
          </button>
        );
      })}
    </div>
  );
}
