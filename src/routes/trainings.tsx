import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/trainings")({
  head: () => ({
    meta: [
      { title: "Allenamenti — Team Manager" },
      {
        name: "description",
        content: "Pianifica e traccia gli allenamenti della squadra.",
      },
    ],
  }),
  component: () => <Outlet />,
});
