"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { formatArea, toSqWah } from "@/lib/calculations";
import { BarChart2, ArrowRight, FolderOpen, FileText, Lock } from "lucide-react";
import Link from "next/link";

export default function AdminPage() {
  const router = useRouter();
  const { user, savedProjects } = useStore();

  useEffect(() => {
    if (user && user.role !== 'admin') router.replace('/dashboard');
    if (!user) router.replace('/login');
  }, [user, router]);

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-semibold text-brand-500 uppercase tracking-widest mb-2">
          <BarChart2 size={14} />
          Admin Dashboard
        </div>
        <h1 className="text-2xl font-bold text-gray-900">โปรเจกต์ที่ส่งมา</h1>
        <p className="text-gray-500 text-sm mt-1">สวัสดี, {user.name}</p>
      </div>

      {/* Saved records */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <FolderOpen size={15} className="text-brand-500" />
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            โปรเจกต์ที่บันทึกไว้
            {savedProjects.length > 0 && ` (${savedProjects.length})`}
          </h3>
        </div>

        {savedProjects.length === 0 ? (
          <div className="text-center py-10">
            <FileText size={36} className="mx-auto mb-3 text-gray-200" />
            <p className="text-sm font-medium text-gray-400">ยังไม่มีโปรเจกต์ที่บันทึกไว้</p>
            <p className="text-xs text-gray-400 mt-1">รอให้ Landowner บันทึกโปรเจกต์ก่อน</p>
          </div>
        ) : (
          <div>
            {savedProjects.map((p) => {
              const sqWah = toSqWah(p.landInput.rai, p.landInput.ngan, p.landInput.sqWah);
              return (
                <div key={p.id} className="flex items-center gap-3 py-3 border-b last:border-0">
                  <Lock size={13} className="text-gray-300 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{p.projectName}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(p.savedAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {sqWah > 0 && ` · ${formatArea(sqWah)}`}
                      {p.landAnalysis.lotCount > 0 && ` · ${p.landAnalysis.lotCount} แปลง`}
                      {p.financial.roi > 0 && ` · ROI ${p.financial.roi.toFixed(1)}%`}
                    </p>
                  </div>
                  <Link
                    href={`/record/${p.id}`}
                    className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 shrink-0 border border-brand-200 hover:border-brand-300 rounded-lg px-3 py-1.5 transition-colors"
                  >
                    ดูข้อมูล <ArrowRight size={12} />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
