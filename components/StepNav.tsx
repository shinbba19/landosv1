"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import clsx from "clsx";
import {
  MapPin, BarChart2, Hammer, TrendingUp, GitCompare, FileText, Home, LogOut, User, LayoutDashboard,
} from "lucide-react";

const STEPS = [
  { id: 1, label: "ข้อมูลที่ดิน", sublabel: "Land Input", icon: MapPin },
  { id: 2, label: "วิเคราะห์ที่ดิน", sublabel: "Land Analysis", icon: BarChart2 },
  { id: 3, label: "ต้นทุนพัฒนา", sublabel: "Dev Cost", icon: Hammer },
  { id: 4, label: "การเงิน", sublabel: "Financial", icon: TrendingUp },
  { id: 5, label: "เปรียบเทียบ", sublabel: "Comparison", icon: GitCompare },
  { id: 6, label: "สรุปผล", sublabel: "Summary", icon: FileText },
];

interface Props {
  open?: boolean;
  onClose?: () => void;
}

export default function StepNav({ open = false, onClose }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const { projectName, currentStep, user, logout } = useStore();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <aside
      className={clsx(
        "no-print w-64 min-h-screen bg-brand-900 text-white flex flex-col fixed left-0 top-0 z-40 transition-transform duration-300",
        open ? "translate-x-0" : "-translate-x-full",
        "md:translate-x-0"
      )}
    >
      {/* Logo — links to role home */}
      <Link
        href={user?.role === 'admin' ? '/admin' : '/dashboard'}
        onClick={onClose}
        className="px-6 py-6 border-b border-brand-800 hover:bg-brand-800 transition-colors block"
      >
        <div className="flex items-center gap-2 mb-1">
          <Home size={18} className="text-brand-500" />
          <span className="text-xs font-semibold text-brand-500 uppercase tracking-widest">LANDOS V1</span>
        </div>
        <p className="text-sm font-bold text-white truncate">{projectName}</p>
        <p className="text-xs text-brand-500 mt-0.5">ระบบวิเคราะห์ที่ดิน</p>
      </Link>

      {/* Role dashboard link */}
      {user && (
        <div className="px-3 pt-3">
          <Link
            href={user.role === 'admin' ? '/admin' : '/dashboard'}
            onClick={onClose}
            className={clsx(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-semibold",
              (pathname === '/admin' || pathname === '/dashboard')
                ? "bg-brand-600 text-white"
                : "text-brand-200 hover:bg-brand-800"
            )}
          >
            <div className={clsx(
              "w-7 h-7 rounded-full flex items-center justify-center shrink-0",
              (pathname === '/admin' || pathname === '/dashboard') ? "bg-white text-brand-700" : "bg-brand-800 text-brand-500"
            )}>
              <LayoutDashboard size={14} />
            </div>
            <span>{user.role === 'admin' ? 'Admin Dashboard' : 'My Dashboard'}</span>
          </Link>
        </div>
      )}

      {/* Steps */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {STEPS.map((step) => {
          const active = pathname === `/step/${step.id}`;
          const done = currentStep > step.id;
          const Icon = step.icon;
          return (
            <Link
              key={step.id}
              href={`/step/${step.id}`}
              onClick={onClose}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm",
                active
                  ? "bg-brand-600 text-white font-semibold"
                  : done
                  ? "text-brand-300 hover:bg-brand-800"
                  : "text-brand-500 hover:bg-brand-800"
              )}
            >
              <div
                className={clsx(
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                  active
                    ? "bg-white text-brand-700"
                    : done
                    ? "bg-brand-500 text-white"
                    : "bg-brand-800 text-brand-500"
                )}
              >
                {done ? "✓" : step.id}
              </div>
              <div>
                <div className={clsx("leading-tight", active ? "text-white" : "text-brand-200")}>
                  {step.label}
                </div>
                <div className="text-xs text-brand-500">{step.sublabel}</div>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Progress bar */}
      <div className="px-6 py-4 border-t border-brand-800">
        <div className="flex justify-between text-xs text-brand-500 mb-1.5">
          <span>ความคืบหน้า</span>
          <span>{Math.round(((currentStep - 1) / 5) * 100)}%</span>
        </div>
        <div className="h-1.5 bg-brand-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-500 rounded-full transition-all duration-500"
            style={{ width: `${((currentStep - 1) / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* User info + logout */}
      {user && (
        <div className="px-4 py-3 border-t border-brand-800 flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-800 rounded-full flex items-center justify-center shrink-0">
            <User size={14} className="text-brand-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user.name}</p>
            <p className="text-xs text-brand-500 capitalize">{user.role}</p>
          </div>
          <button
            onClick={handleLogout}
            aria-label="ออกจากระบบ"
            className="text-brand-500 hover:text-white p-1 rounded-lg hover:bg-brand-800 transition-colors"
          >
            <LogOut size={15} />
          </button>
        </div>
      )}
    </aside>
  );
}
