import { useEffect, useState } from "react";

import { formatUtcCountdown, msUntilUtcMidnight } from "@/lib/format";

export function UtcCountdown() {
  const [label, setLabel] = useState(() => formatUtcCountdown(msUntilUtcMidnight()));

  useEffect(() => {
    const tick = () => setLabel(formatUtcCountdown(msUntilUtcMidnight()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return <span className="tabular-nums">{label}</span>;
}
