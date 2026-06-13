import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/store";

export const Route = createFileRoute("/builder")({
  component: BuilderLayout,
});

function BuilderLayout() {
  const navigate = useNavigate();
  const user = useAuth((s) => s.user);
  useEffect(() => {
    if (typeof window !== "undefined" && !user) navigate({ to: "/auth" });
  }, [user, navigate]);
  if (!user) return <div className="min-h-screen grid place-items-center text-text-secondary">Loading...</div>;
  return <Outlet />;
}
