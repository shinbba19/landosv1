"use client";
import { useEffect } from "react";
import { useStore } from "@/lib/store";
import { calcDevCost, formatThb, PRESETS } from "@/lib/calculations";
import StepHeader from "@/components/StepHeader";
import NavButtons from "@/components/NavButtons";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import clsx from "clsx";

const PRESET_LABELS = {
  basic: { label: "Basic", desc: "ถนน + ไฟฟ้า + น้ำ เท่านั้น", color: "bg-gray-100 text-gray-700 border-gray-200" },
  standard: { label: "Standard", desc: "มาตรฐานทั่วไป + รั้ว + ประตู", color: "bg-brand-100 text-brand-700 border-brand-200" },
  premium: { label: "Premium", desc: "คุณภาพสูง + พื้นที่ส่วนกลาง", color: "bg-amber-100 text-amber-700 border-amber-200" },
};

export default function Step3() {
  const { devCost, landAnalysis, updateDevCost, setStep } = useStore();
  const lotCount = landAnalysis.lotCount;

  const applyPreset = (preset: "basic" | "standard" | "premium") => {
    updateDevCost({ preset, ...PRESETS[preset] });
  };

  useEffect(() => {
    const computed = calcDevCost(devCost, lotCount);
    updateDevCost(computed);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    devCost.roadLengthM, devCost.roadWidthM, devCost.electricityLengthM,
    devCost.waterLengthM, devCost.fenceLengthM, devCost.hasGate,
    devCost.hasCommonArea, devCost.miscPct, devCost.roadCostPerSqm,
    devCost.electricityCostPerM, devCost.waterCostPerM, devCost.fenceCostPerM,
    devCost.gateCost, devCost.commonAreaCost, lotCount,
  ]);

  const chartData = [
    { name: "ถนน", value: devCost.roadCost, color: "#16a34a" },
    { name: "ไฟฟ้า", value: devCost.electricityCost, color: "#22c55e" },
    { name: "ประปา", value: devCost.waterCost, color: "#4ade80" },
    { name: "รั้ว", value: devCost.fenceCost, color: "#86efac" },
    { name: "ประตู", value: devCost.hasGate ? devCost.gateCost : 0, color: "#bbf7d0" },
    { name: "ส่วนกลาง", value: devCost.hasCommonArea ? devCost.commonAreaCost : 0, color: "#dcfce7" },
    { name: "เบ็ดเตล็ด", value: devCost.miscCost, color: "#d1d5db" },
  ].filter((d) => d.value > 0);

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <StepHeader step={3} title="ต้นทุนพัฒนา" subtitle="Development Cost — ประมาณการค่าก่อสร้างโครงสร้างพื้นฐาน" />

      {/* Presets */}
      <div className="card mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">เลือก Preset</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(Object.keys(PRESET_LABELS) as Array<keyof typeof PRESET_LABELS>).map((key) => {
            const p = PRESET_LABELS[key];
            return (
              <button
                key={key}
                onClick={() => applyPreset(key)}
                className={clsx(
                  "border-2 rounded-xl px-4 py-3 text-left transition-all",
                  devCost.preset === key ? p.color + " border-current" : "border-gray-200 hover:border-gray-300"
                )}
              >
                <div className="font-bold text-sm">{p.label}</div>
                <div className="text-xs mt-0.5 opacity-70">{p.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quantities */}
      <div className="card mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">ปริมาณงาน</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">ความยาวถนนภายใน (ม.)</label>
            <input type="number" min={0} className="input-field"
              value={devCost.roadLengthM || ""}
              onChange={(e) => updateDevCost({ roadLengthM: parseFloat(e.target.value) || 0 })} />
          </div>
          <div>
            <label className="label">ความกว้างถนน (ม.)</label>
            <input type="number" min={4} max={12} className="input-field"
              value={devCost.roadWidthM || ""}
              onChange={(e) => updateDevCost({ roadWidthM: parseFloat(e.target.value) || 6 })} />
          </div>
          <div>
            <label className="label">ความยาวสายไฟฟ้า (ม.)</label>
            <input type="number" min={0} className="input-field"
              value={devCost.electricityLengthM || ""}
              onChange={(e) => updateDevCost({ electricityLengthM: parseFloat(e.target.value) || 0 })} />
          </div>
          <div>
            <label className="label">ความยาวท่อน้ำประปา (ม.)</label>
            <input type="number" min={0} className="input-field"
              value={devCost.waterLengthM || ""}
              onChange={(e) => updateDevCost({ waterLengthM: parseFloat(e.target.value) || 0 })} />
          </div>
          <div>
            <label className="label">ความยาวรั้ว (ม.)</label>
            <input type="number" min={0} className="input-field"
              value={devCost.fenceLengthM || ""}
              onChange={(e) => updateDevCost({ fenceLengthM: parseFloat(e.target.value) || 0 })} />
          </div>
          <div className="flex flex-col gap-3 pt-5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="accent-brand-600 w-4 h-4"
                checked={devCost.hasGate}
                onChange={(e) => updateDevCost({ hasGate: e.target.checked })} />
              <span className="text-sm">มีประตูทางเข้า ({formatThb(devCost.gateCost)})</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="accent-brand-600 w-4 h-4"
                checked={devCost.hasCommonArea}
                onChange={(e) => updateDevCost({ hasCommonArea: e.target.checked })} />
              <span className="text-sm">มีพื้นที่ส่วนกลาง ({formatThb(devCost.commonAreaCost)})</span>
            </label>
          </div>
        </div>

        <div className="mt-4">
          <label className="label">ค่าใช้จ่ายเบ็ดเตล็ด: <span className="font-bold text-brand-600">{devCost.miscPct}%</span></label>
          <input type="range" min={0} max={20} step={1} className="w-full accent-brand-600"
            value={devCost.miscPct}
            onChange={(e) => updateDevCost({ miscPct: parseInt(e.target.value) })} />
        </div>
      </div>

      {/* Unit Rates (collapsible-style) */}
      <details className="card mb-6">
        <summary className="text-sm font-semibold text-gray-500 uppercase tracking-wider cursor-pointer">
          ราคาต่อหน่วย (แก้ไขได้)
        </summary>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          {[
            { label: "ถนน (บาท/ตร.ม.)", key: "roadCostPerSqm" as const },
            { label: "ไฟฟ้า (บาท/ม.)", key: "electricityCostPerM" as const },
            { label: "ประปา (บาท/ม.)", key: "waterCostPerM" as const },
            { label: "รั้ว (บาท/ม.)", key: "fenceCostPerM" as const },
          ].map(({ label, key }) => (
            <div key={key}>
              <label className="label">{label}</label>
              <input type="number" min={0} className="input-field"
                value={devCost[key] || ""}
                onChange={(e) => updateDevCost({ [key]: parseFloat(e.target.value) || 0 })} />
            </div>
          ))}
        </div>
      </details>

      {/* Cost Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-500 mb-3">สรุปค่าใช้จ่าย</h3>
          <div className="space-y-2">
            {chartData.map((d) => (
              <div key={d.name} className="flex justify-between text-sm">
                <span className="text-gray-600">{d.name}</span>
                <span className="font-medium">{formatThb(d.value)}</span>
              </div>
            ))}
            <div className="border-t pt-2 flex justify-between font-bold">
              <span>รวมทั้งสิ้น</span>
              <span className="text-brand-700 text-lg">{formatThb(devCost.totalInfraCost)}</span>
            </div>
            {lotCount > 0 && (
              <div className="flex justify-between text-sm text-gray-500">
                <span>เฉลี่ยต่อแปลง</span>
                <span>{formatThb(devCost.totalInfraCost / lotCount)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="text-sm font-semibold text-gray-500 mb-3">สัดส่วนค่าใช้จ่าย</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} layout="vertical" margin={{ left: 30, right: 20 }}>
                <XAxis type="number" tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} fontSize={11} />
                <YAxis type="category" dataKey="name" width={50} fontSize={11} />
                <Tooltip formatter={(v: number) => [formatThb(v)]} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {chartData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-gray-300 text-sm">กรอกปริมาณงานก่อน</div>
          )}
        </div>
      </div>

      <NavButtons prevStep={2} nextStep={4} onNext={() => { setStep(4); return true; }} />
    </div>
  );
}
