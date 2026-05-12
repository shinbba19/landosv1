"use client";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { toSqWah } from "@/lib/calculations";
import { Zap, BarChart2, Target, ArrowRight, Home } from "lucide-react";

const FEATURES = [
  { icon: Zap, label: "รวดเร็ว", sub: "ผลลัพธ์ใน 5 นาที" },
  { icon: BarChart2, label: "ข้อมูลจริง", sub: "ตัวเลขจากสมมติฐานจริง" },
  { icon: Target, label: "ตัดสินใจได้", sub: "เปรียบเทียบชัดเจน" },
];

export default function HomePage() {
  const router = useRouter();
  const { reset, landInput, currentStep } = useStore();

  const hasData = toSqWah(landInput.rai, landInput.ngan, landInput.sqWah) > 0;

  const handleNew = () => {
    reset();
    router.push("/step/1");
  };

  const handleContinue = () => {
    router.push(`/step/${currentStep}`);
  };

  return (
    <div className="min-h-screen bg-brand-900 flex flex-col items-center justify-center px-6 text-white">
      {/* Badge */}
      <div className="mb-8 flex items-center gap-2 bg-brand-800 border border-brand-700 rounded-full px-4 py-1.5 text-xs font-semibold text-brand-300 uppercase tracking-widest">
        <Home size={12} />
        LANDOS V1 · BETA
      </div>

      {/* Headline */}
      <h1 className="text-5xl font-bold text-center mb-4 leading-tight">
        วิเคราะห์ที่ดิน<br />
        <span className="text-brand-400">อย่างมืออาชีพ</span>
      </h1>
      <p className="text-brand-300 text-center text-lg mb-3 max-w-md">
        ระบบวิเคราะห์ความเป็นไปได้ในการพัฒนาที่ดินแบบง่าย
      </p>
      <p className="text-brand-500 text-center text-sm mb-12 max-w-sm">
        Land Development Feasibility System for Thai landowners &amp; investors
      </p>

      {/* Features */}
      <div className="flex gap-4 mb-12">
        {FEATURES.map(({ icon: Icon, label, sub }) => (
          <div key={label} className="flex flex-col items-center gap-2 bg-brand-800 border border-brand-700 rounded-2xl px-6 py-4 text-center w-36">
            <div className="w-10 h-10 bg-brand-700 rounded-xl flex items-center justify-center">
              <Icon size={20} className="text-brand-300" />
            </div>
            <p className="font-bold text-sm">{label}</p>
            <p className="text-xs text-brand-400">{sub}</p>
          </div>
        ))}
      </div>

      {/* CTAs */}
      <div className="flex flex-col items-center gap-3">
        <button
          onClick={handleNew}
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-400 text-white font-bold px-8 py-4 rounded-2xl text-lg transition-all shadow-lg shadow-brand-900/50 hover:shadow-brand-500/30 hover:-translate-y-0.5"
        >
          เริ่มวิเคราะห์ใหม่
          <ArrowRight size={20} />
        </button>

        {hasData && (
          <button
            onClick={handleContinue}
            className="text-brand-400 hover:text-brand-200 text-sm font-medium transition-colors flex items-center gap-1"
          >
            ดำเนินการต่อจากที่ค้างไว้ (Step {currentStep})
            <ArrowRight size={14} />
          </button>
        )}
      </div>

      {/* Steps preview */}
      <div className="mt-16 flex items-center gap-2 text-brand-600 text-xs">
        {["ข้อมูลที่ดิน", "วิเคราะห์", "ต้นทุน", "การเงิน", "เปรียบเทียบ", "สรุปผล"].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <span className="w-4 h-4 rounded-full border border-brand-700 flex items-center justify-center text-[10px]">{i + 1}</span>
              {s}
            </span>
            {i < 5 && <span className="text-brand-700">→</span>}
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <p className="mt-8 text-brand-700 text-xs text-center max-w-sm">
        * ผลการวิเคราะห์เป็นการประมาณการเบื้องต้นเท่านั้น ไม่ใช่คำแนะนำทางกฎหมายหรือวิศวกรรม
      </p>
    </div>
  );
}
