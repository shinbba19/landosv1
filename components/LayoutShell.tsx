"use client";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu } from "lucide-react";
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
  const router = useRouter();
  const isLogin = pathname === "/login";
  const isHome = pathname === "/";
  const isAdminPage = pathname === "/admin";
  const isDashboardPage = pathname === "/dashboard";
  const isStepPage = pathname.startsWith("/step/");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentStep, projectName, user } = useStore();

  useEffect(() => {
    if (isLogin) return;
    if (!user) { router.replace("/login"); return; }
    if (isAdminPage && user.role !== 'admin') router.replace('/dashboard');
    if (isDashboardPage && user.role !== 'landowner') router.replace('/admin');
  }, [isLogin, user, router, isAdminPage, isDashboardPage]);

  if (isLogin) return <>{children}</>;
  if (!user) return null;
  if (isAdminPage && user.role !== 'admin') return null;
  if (isDashboardPage && user.role !== 'landowner') return null;

  // Home: no sidebar
  if (isHome) return <>{children}</>;

  const mobileTitle = isAdminPage
    ? "Admin Dashboard"
    : isDashboardPage
    ? "My Dashboard"
    : (STEP_LABELS[currentStep] ?? "LANDOS V1");

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
            className="text-brand-500 hover:text-white p-1 rounded-lg hover:bg-brand-800 transition-colors"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate">{mobileTitle}</p>
            <p className="text-brand-500 text-xs truncate">{projectName}</p>
          </div>
          {user && (
            <span className="shrink-0 text-xs font-semibold bg-brand-800 border border-brand-700 text-brand-500 rounded-full px-2.5 py-1 capitalize">
              {user.role}
            </span>
          )}
        </header>

        <main className="flex-1">
          {user?.role === 'admin' && isStepPage && (
            <div className="bg-brand-800 border-b border-brand-700 px-4 py-2 text-xs text-brand-500 text-center font-medium">
              👁 โหมดดูอย่างเดียว — คุณกำลังดูข้อมูลของ Landowner
            </div>
          )}
          {children}
          <AiChat />
        </main>
      </div>
    </div>
  );
}
