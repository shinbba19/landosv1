"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useStore } from "@/lib/store";
import StepNav from "@/components/StepNav";
import AiChat from "@/components/AiChat";

const STEP_LABELS: Record<number, string> = {
  1: "ข้อมูลที่ดิน",
  2: "วิเคราะห์ที่ดิน",
  3: "ต้นทุนพัฒนา",
  4: "การเงิน",
  5: "เปรียบเทียบ",
  6: "สรุปผล",
};

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentStep, projectName } = useStore();

  if (isHome) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <StepNav open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 md:ml-64 min-h-screen flex flex-col">
        {/* Mobile top header */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-brand-900 border-b border-brand-800 sticky top-0 z-20">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-brand-300 hover:text-white p-1 rounded-lg hover:bg-brand-800 transition-colors"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate">
              {STEP_LABELS[currentStep] ?? "LANDOS V1"}
            </p>
            <p className="text-brand-500 text-xs truncate">{projectName}</p>
          </div>
        </header>

        <main className="flex-1">
          {children}
          <AiChat />
        </main>
      </div>
    </div>
  );
}
