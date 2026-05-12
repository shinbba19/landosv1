"use client";
import { usePathname } from "next/navigation";
import StepNav from "@/components/StepNav";
import AiChat from "@/components/AiChat";

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  if (isHome) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      <StepNav />
      <main className="flex-1 ml-64 min-h-screen">
        {children}
        <AiChat />
      </main>
    </div>
  );
}
