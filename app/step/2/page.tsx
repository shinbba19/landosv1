"use client";
import { useEffect } from "react";
import { useStore } from "@/lib/store";
import { calcLandAnalysis, formatArea, formatThb, toSqWah } from "@/lib/calculations";
import StepHeader from "@/components/StepHeader";
import NavButtons from "@/components/NavButtons";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS = ["#16a34a", "#86efac", "#dcfce7"];

export default function Step2() {
  const { landInput, landAnalysis, updateLandAnalysis, setStep } = useStore();
  const totalSqWah = toSqWah(landInput.rai, landInput.ngan, landInput.sqWah);

  useEffect(() => {
    if (totalSqWah === 0) return;
    const result = calcLandAnalysis(landInput, landAnalysis.roadDeductionPct, landAnalysis.lotSizeSqWah);
    updateLandAnalysis({ ...result });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [landInput, landAnalysis.roadDeductionPct, landAnalysis.lotSizeSqWah]);

  const pieData = [
    { name: "พื้นที่จัดสรร", value: landAnalysis.lotCount * landAnalysis.lotSizeSqWah },
    { name: "ถนน / โครงสร้างพื้นฐาน", value: landAnalysis.roadAreaSqWah },
    { name: "เศษที่เหลือ", value: landAnalysis.leftoverSqWah },
  ].filter((d) => d.value > 0);

  const pricePerSqWah = totalSqWah > 0 ? landInput.landPrice / totalSqWah : 0;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <StepHeader step={2} title="วิเคราะห์ที่ดิน" subtitle="Land Analysis — คำนวณพื้นที่ใช้งานและจำนวนแปลง" />

      {totalSqWah === 0 && (
        <div className="card mb-6 bg-amber-50 border-amber-200 text-amber-800 text-sm">
          กรุณากลับไปกรอกข้อมูลขนาดที่ดินในขั้นตอนที่ 1 ก่อน
        </div>
      )}

      {/* Parameters */}
      <div className="card mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">ตัวแปรการวิเคราะห์</h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="label">
              สัดส่วนหักถนน / โครงสร้างพื้นฐาน: <span className="font-bold text-brand-600">{landAnalysis.roadDeductionPct}%</span>
            </label>
            <input
              type="range" min={5} max={30} step={1}
              className="w-full accent-brand-600"
              value={landAnalysis.roadDeductionPct}
              onChange={(e) => updateLandAnalysis({ roadDeductionPct: parseInt(e.target.value) })}
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>5% (ต่ำมาก)</span><span>15% (มาตรฐาน)</span><span>30% (สูง)</span>
            </div>
          </div>
          <div>
            <label className="label">ขนาดแปลงมาตรฐาน (ตร.วา)</label>
            <input
              type="number" min={20} max={500}
              className="input-field"
              value={landAnalysis.lotSizeSqWah}
              onChange={(e) => updateLandAnalysis({ lotSizeSqWah: parseFloat(e.target.value) || 50 })}
            />
            <p className="text-xs text-gray-400 mt-1">= {(landAnalysis.lotSizeSqWah * 4).toLocaleString()} ตร.ม.</p>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "พื้นที่ทั้งหมด", value: formatArea(totalSqWah), sub: `${totalSqWah.toLocaleString()} ตร.วา` },
          { label: "หักถนน / สาธารณูปโภค", value: formatArea(landAnalysis.roadAreaSqWah), sub: `${landAnalysis.roadDeductionPct}%` },
          { label: "พื้นที่ขายได้", value: formatArea(landAnalysis.usableAreaSqWah), sub: "✓ Saleable Area" },
          { label: "จำนวนแปลงโดยประมาณ", value: `${landAnalysis.lotCount} แปลง`, sub: `แปลงละ ${landAnalysis.lotSizeSqWah} ตร.วา` },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className="text-lg font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-brand-600 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Pie chart + cost per lot */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-500 mb-3">การใช้พื้นที่</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => [`${v.toLocaleString()} ตร.วา`]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-gray-300 text-sm">ยังไม่มีข้อมูล</div>
          )}
        </div>

        <div className="card">
          <h3 className="text-sm font-semibold text-gray-500 mb-3">ต้นทุนที่ดินต่อแปลง</h3>
          {landAnalysis.lotCount > 0 && landInput.landPrice > 0 ? (
            <div className="space-y-4 mt-2">
              <div>
                <p className="text-xs text-gray-500">ราคาที่ดินต่อ ตร.วา</p>
                <p className="text-2xl font-bold text-brand-700">{formatThb(pricePerSqWah)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">ต้นทุนที่ดินต่อแปลง</p>
                <p className="text-2xl font-bold text-gray-800">{formatThb(landInput.landPrice / landAnalysis.lotCount)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">ต้นทุนรวมต่อแปลง (incl. acquisition)</p>
                <p className="text-xl font-semibold text-gray-700">
                  {formatThb((landInput.landPrice + landInput.acquisitionCost) / landAnalysis.lotCount)}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-gray-300 text-sm mt-4">กรอกราคาที่ดินในขั้นตอน 1</p>
          )}
        </div>
      </div>

      <NavButtons prevStep={1} nextStep={3} onNext={() => { setStep(3); return true; }} />
    </div>
  );
}
