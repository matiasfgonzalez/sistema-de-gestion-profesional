import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export const metadata: Metadata = {
  title: "Dashboard - FisioGestiona",
  description: "Panel de control para gestión de centro de kinesiología",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[100dvh] bg-background">
      <DashboardShell>{children}</DashboardShell>
    </div>
  );
}
