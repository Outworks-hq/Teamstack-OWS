import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/app/unit/$unitId/systems")({
  component: () => <Outlet />,
});
