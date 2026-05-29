"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { toSqWah, formatThb, formatArea } from "@/lib/calculations";
import { Zap, BarChart2, Target, ArrowRight, Home, MapPin, DollarSign, TrendingUp, FolderOpen, Trash2 } from "lucide-react";
import Link from "next/link";

const FEATURES = [
  { icon: Zap, label: "รวดเร็ว", sub: "ผลลัพธ์ใน 5 นาที" },
  { icon: BarChart2, label: "ข้อมูลจริง", sub: "ตัวเลขจากสมมติฐานจริง" },
  { icon: Target, label: "ตัดสินใจได้", sub: "เปรียบเทียบชัดเจน" },
];

const STEP_LABELS = ["ข้อมูลที่ดิน", "วิเคราะห์", "ต้นทุน", "การเงิน", "เปรียบเทียบ", "สรุปผล"];

export default function HomePage() {
  const router = useRouter();
  const { reset, landInput, landAnalysis, financial, currentStep, user, projectName, savedProjects, loadProject, deleteProject } = useStore();

  useEffect(() => {
    if (!user) router.replace("/login");
  }, [user, router]);

  const totalSqWah = toSqWah(landInput.rai, landInput.ngan, landInput.sqWah);
  const hasData = totalSqWah > 0;

  if (!user) return null;

  const handleNew = () => {
    reset();
    router.push("/step/1");
  };

  // Reusable saved projects list shown in both states
  const SavedList = savedProjects.length > 0 ? (
    <div className="w-full max-w-lg mt-10">
      <div className="flex items-center gap-2 mb-4">
        <FolderOpen size={14} className="text-brand-500" />
        <span className="text-xs font-bold text-brand-500 uppercase tracking-widest">
          โปรเจกต์ที่บันทึกไว้ ({savedProjects.length})
        </span>
      </div>
      <div className="space-y-3">
        {savedProjects.map((p) => {
          const sqWah = toSqWah(p.landInput.rai, p.landInput.ngan, p.landInput.sqWah);
          return (
            <div key={p.id} className="bg-brand-800 border border-brand-700 rounded-2xl px-4 py-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-sm truncate">{p.projectName}</p>
                <p className="text-xs text-brand-500 mt-0.5">
                  {new Date(p.savedAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                  {sqWah > 0 && ` · ${formatArea(sqWah)}`}
                  {p.financial.roi > 0 && ` · ROI ${p.financial.roi.toFixed(1)}%`}
                </p>
              </div>
              <button
                onClick={() => loadProject(p.id)}
                className="flex items-center gap-1.5 text-xs font-semibold text-brand-500 hover:text-white bg-brand-900 hover:bg-brand-700 border border-brand-700 rounded-lg px-3 py-1.5 transition-colors shrink-0"
              >
                <ArrowRight size={12} />
                โหลด
              </button>
              <button
                onClick={() => { if (confirm(`ลบ "${p.projectName}"?`)) deleteProject(p.id); }}
                className="text-brand-700 hover:text-red-400 p-1.5 rounded-lg hover:bg-brand-900 transition-colors shrink-0"
                aria-label="ลบ"
              >
                <Trash2 size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  ) : null;

  // Has current project — show summary
  if (hasData) {
    const progressPct = Math.round(((currentStep - 1) / 5) * 100);

    return (
      <div className="min-h-screen bg-brand-900 flex flex-col items-center justify-center px-6 py-12 text-white">
        <div className="mb-6 flex items-center gap-2 bg-brand-800 border border-brand-700 rounded-full px-4 py-1.5 text-xs font-semibold text-brand-500 uppercase tracking-widest">
          <Home size={12} />
          LANDOS V1
        </div>

        <p className="text-brand-500 text-sm mb-2">สวัสดี, {user.name}</p>
        <h1 className="text-3xl font-bold text-center mb-8">โปรเจกต์ของคุณ</h1>

        {/* Project card */}
        <div className="w-full max-w-lg bg-brand-800 border border-brand-700 rounded-2xl p-6 mb-6">
          <div className="mb-4">
            <p className="text-xs text-brand-500 uppercase tracking-wider mb-1">โปรเจกต์</p>
            <h2 className="text-xl font-bold text-white">{projectName}</h2>
            {landInput.location && (
              <div className="flex items-center gap-1.5 mt-1 text-sm text-brand-500">
                <MapPin size={12} />
                {landInput.location}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {[
              { label: "พื้นที่", value: formatArea(totalSqWah) },
              { label: "จำนวนแปลง", value: landAnalysis.lotCount > 0 ? `${landAnalysis.lotCount} แปลง` : "—" },
              { label: "ต้นทุนรวม", value: financial.totalProjectCost > 0 ? formatThb(financial.totalProjectCost) : "—" },
              { label: "ROI", value: financial.roi > 0 ? `${financial.roi.toFixed(1)}%` : "—" },
            ].map(({ label, value }) => (
              <div key={label} className="bg-brand-900 border border-brand-700 rounded-xl p-3 text-center">
                <p className="text-xs text-brand-500 mb-1">{label}</p>
                <p className="font-bold text-white text-sm">{value}</p>
              </div>
            ))}
          </div>

          <div>
            <div className="flex justify-between text-xs text-brand-500 mb-1.5">
              <span>Step {currentStep}: {STEP_LABELS[currentStep - 1]}</span>
              <span>{progressPct}%</span>
            </div>
            <div className="h-1.5 bg-brand-900 rounded-full overflow-hidden">
              <div className="h-full bg-brand-500 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-lg">
          <button
            onClick={() => router.push(`/step/${currentStep}`)}
            className="w-full sm:flex-1 flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold px-6 py-3.5 rounded-2xl transition-all hover:-translate-y-0.5"
          >
            ดำเนินการต่อ (Step {currentStep})
            <ArrowRight size={18} />
          </button>
          <Link
            href="/step/6"
            className="w-full sm:flex-1 flex items-center justify-center gap-2 bg-brand-800 hover:bg-brand-700 border border-brand-700 text-white font-semibold px-6 py-3.5 rounded-2xl transition-all text-sm"
          >
            ดูสรุปผล
            <ArrowRight size={16} />
          </Link>
        </div>

        <button onClick={handleNew} className="mt-4 text-brand-500 hover:text-brand-300 text-sm font-medium transition-colors">
          + เริ่มวิเคราะห์โปรเจกต์ใหม่
        </button>

        {SavedList}
      </div>
    );
  }

  // No current project — show onboarding hero + saved projects
  return (
    <div className="min-h-screen bg-brand-900 flex flex-col items-center justify-center px-6 py-12 text-white">
      <div className="mb-8 flex items-center gap-2 bg-brand-800 border border-brand-700 rounded-full px-4 py-1.5 text-xs font-semibold text-brand-500 uppercase tracking-widest">
        <Home size={12} />
        LANDOS V1 · BETA
      </div>

      <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 leading-tight">
        วิเคราะห์ที่ดิน<br />
        <span className="text-brand-500">อย่างมืออาชีพ</span>
      </h1>
      <p className="text-brand-500 text-center text-lg mb-3 max-w-md">
        ระบบวิเคราะห์ความเป็นไปได้ในการพัฒนาที่ดินแบบง่าย
      </p>
      <p className="text-brand-500 text-center text-sm mb-12 max-w-sm opacity-60">
        Land Development Feasibility System for Thai landowners &amp; investors
      </p>

      <div className="flex flex-col sm:flex-row gap-4 mb-12">
        {FEATURES.map(({ icon: Icon, label, sub }) => (
          <div key={label} className="flex flex-col items-center gap-2 bg-brand-800 border border-brand-700 rounded-2xl px-6 py-4 text-center w-36">
            <div className="w-10 h-10 bg-brand-700 rounded-xl flex items-center justify-center">
              <Icon size={20} className="text-brand-500" />
            </div>
            <p className="font-bold text-sm">{label}</p>
            <p className="text-xs text-brand-500">{sub}</p>
          </div>
        ))}
      </div>

      <button
        onClick={handleNew}
        className="flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold px-8 py-4 rounded-2xl text-lg transition-all shadow-lg hover:-translate-y-0.5"
      >
        เริ่มวิเคราะห์
        <ArrowRight size={20} />
      </button>

      <div className="mt-12 hidden sm:flex items-center gap-2 text-brand-500 text-xs opacity-50">
        {STEP_LABELS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <span className="w-4 h-4 rounded-full border border-brand-700 flex items-center justify-center text-[10px]">{i + 1}</span>
              {s}
            </span>
            {i < 5 && <span className="text-brand-700">→</span>}
          </div>
        ))}
      </div>

      {/* Saved projects — always visible even when no current project */}
      {SavedList}

      <p className="mt-8 text-brand-700 text-xs text-center max-w-sm">
        * ผลการวิเคราะห์เป็นการประมาณการเบื้องต้นเท่านั้น ไม่ใช่คำแนะนำทางกฎหมายหรือวิศวกรรม
      </p>
    </div>
  );
}
