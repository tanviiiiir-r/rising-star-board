import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/daily")({
  component: DailyLayout,
});

function DailyLayout() {
  return <Outlet />;
}
