import { type ReactNode } from "react";
import { Navbar } from "./navbar";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
