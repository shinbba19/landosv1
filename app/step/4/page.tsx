"use client";
import { useEffect } from "react";
import { useStore } from "@/lib/store";
import { calcFinancial, formatThb } from "@/lib/calculations";
import StepHeader from "@/components/StepHeader";
import NavButtons from "@/components/NavButtons";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ReferenceLine, Cell,
} from "recharts";
import clsx from "clsx";

function StatCard({ label, value, sub, highlight = false }: { label: string; value: string; sub?: string; highlight?: boolean }) {
  return (
    <div className={clsx("stat-card", highlight && "bg-brand-50 border-brand-200")}>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={clsx("text-xl font-bold", highlight ? "text-brand-700" : "text-gray-900")}>{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function Step4() {
  const { landInput, landAnalysis, devCost, financial, updateFinancial, setStep } = useStore();
  const { lotCount, lotSizeSqWah } = landAnalysis;
  const acquisitionCost = landInput.acquisitionCost || landInput.landPrice;

  useEffect(() => {
    if (!financial.sellingPricePerSqWah) return;
    const result = calcFinancial(
      acquisitionCost,
      devCost.totalInfraCost,
      lotCount,
      lotSizeSqWah,
      financial.sellingPricePerSqWah,
      financial.quickSellTotal,
      landInput.appraisalValue,
    );
    updateFinancial(result);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [financial.sellingPricePerSqWah, financial.quickSellTotal, devCost.totalInfraCost, lotCount, lotSizeSqWah, acquisitionCost, landInput.appraisalValue]);

  // Waterfall chart data
  const waterfallData = [
    { name: "ต้นทุนที่ดิน", value: -acquisitionCost, fill: "#ef4444" },
    { name: "ค่าพัฒนา", value: -devCost.totalInfraCost, fill: "#f97316" },
    { name: "รายได้รวม", value: financial.grossRevenue, fill: "#22c55e" },
    { name: "กำไรสุทธิ", value: financial.grossProfit, fill: financial.grossProfit >= 0 ? "#16a34a" : "#dc2626" },
  ];

  // Sensitivity: selling price ±20%
  const sensitivityData = [-20, -10, 0, 10, 20].map((pct) => {
    const adjPrice = financial.sellingPricePerSqWah * (1 + pct / 100);
    const revenue = lotCount * lotSizeSqWah * adjPrice;
    const profit = revenue - (acquisitionCost + devCost.totalInfraCost);
    const roi = (acquisitionCost + devCost.totalInfraCost) > 0 ? (profit / (acquisitionCost + devCost.totalInfraCost)) * 100 : 0;
    return { name: `${pct > 0 ? "+" : ""}${pct}%`, profit, roi };
  });

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <StepHeader step={4} title="การวิเคราะห์การเงิน" subtitle="Financial Analysis — ผลตอบแทนและความเป็นไปได้" />

      {/* Input */}
      <div>
      <div className="card mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">ราคาขาย</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="label">ราคาขายต่อ ตร.วา (บาท)</label>
            <input
              type="number" min={0}
              className="input-field text-base"
              value={financial.sellingPricePerSqWah || ""}
              onChange={(e) => updateFinancial({ sellingPricePerSqWah: parseFloat(e.target.value) || 0 })}
              placeholder="เช่น 15000"
            />
            {financial.sellingPricePerSqWah > 0 && lotSizeSqWah > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                ≈ {formatThb(financial.sellingPricePerSqWah * lotSizeSqWah)} / แปลง ({lotSizeSqWah} ตร.วา)
              </p>
            )}
          </div>
          <div>
            <label className="label">ราคาขายยกทั้งแปลง "Quick Sell" (บาท)</label>
            <input
              type="number" min={0}
              className="input-field text-base"
              value={financial.quickSellTotal || ""}
              onChange={(e) => updateFinancial({ quickSellTotal: parseFloat(e.target.value) || 0 })}
              placeholder="ราคาถ้าขายทั้งผืนทันที"
            />
          </div>
        </div>
      </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="ต้นทุนโครงการรวม" value={formatThb(financial.totalProjectCost)} sub="Land + Infrastructure" />
        <StatCard label="รายได้รวมโดยประมาณ" value={formatThb(financial.grossRevenue)} sub={`${lotCount} แปลง × ${lotSizeSqWah} ตร.วา`} />
        <StatCard label="กำไรสุทธิ (หลังภาษี+นายหน้า)" value={formatThb(financial.grossProfit)}
          sub={`Gross Margin ${financial.grossMargin.toFixed(1)}%`}
          highlight={financial.grossProfit > 0} />
        <StatCard label="ROI" value={`${financial.roi.toFixed(1)}%`}
          sub="Return on Investment"
          highlight={financial.roi > 0} />
      </div>

      {/* Tax & commission breakdown */}
      {(financial.grossRevenue > 0 || financial.quickSellTotal > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-500 mb-3">สรุป Quick Sell</h3>
            <div className="space-y-1.5 text-sm">
              {[
                ["ราคาขายยก", formatThb(financial.quickSellTotal)],
                ["หัก ต้นทุนที่ดิน", `−${formatThb(acquisitionCost)}`],
                ["หัก ภาษี 5% (ราคาประเมิน)", `−${formatThb(financial.quickSellTax)}`],
                ["หัก ค่านายหน้า 3%", `−${formatThb(financial.quickSellCommission)}`],
              ].map(([l, v]) => (
                <div key={l} className="flex justify-between text-gray-600">
                  <span>{l}</span><span className="font-medium">{v}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold pt-2 border-t text-brand-700">
                <span>กำไรสุทธิ</span><span>{formatThb(financial.quickSellProfit)}</span>
              </div>
            </div>
          </div>
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-500 mb-3">สรุป Develop &amp; Sell</h3>
            <div className="space-y-1.5 text-sm">
              {[
                ["รายได้รวม", formatThb(financial.grossRevenue)],
                ["หัก ต้นทุนโครงการ", `−${formatThb(financial.totalProjectCost)}`],
                ["หัก ภาษี 5% (ราคาขายจริง)", `−${formatThb(financial.developTax)}`],
                ["หัก ค่านายหน้า 3%", `−${formatThb(financial.developCommission)}`],
              ].map(([l, v]) => (
                <div key={l} className="flex justify-between text-gray-600">
                  <span>{l}</span><span className="font-medium">{v}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold pt-2 border-t text-brand-700">
                <span>กำไรสุทธิ</span><span>{formatThb(financial.grossProfit)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Waterfall */}
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-500 mb-3">โครงสร้างกำไร-ขาดทุน</h3>
          {financial.grossRevenue > 0 ? (
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={waterfallData} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
                <XAxis dataKey="name" fontSize={11} />
                <YAxis tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}M`} fontSize={11} />
                <Tooltip formatter={(v: number) => [formatThb(v)]} />
                <ReferenceLine y={0} stroke="#d1d5db" />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {waterfallData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[230px] flex items-center justify-center text-gray-300 text-sm">กรอกราคาขายก่อน</div>
          )}
        </div>

        {/* Sensitivity */}
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-500 mb-3">Sensitivity Analysis (±20% ราคาขาย)</h3>
          {financial.sellingPricePerSqWah > 0 ? (
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={sensitivityData} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
                <XAxis dataKey="name" fontSize={11} />
                <YAxis tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}M`} fontSize={11} />
                <Tooltip formatter={(v: number, name: string) =>
                  name === "roi" ? [`${v.toFixed(1)}%`, "ROI"] : [formatThb(v), "กำไร"]}
                />
                <ReferenceLine y={0} stroke="#d1d5db" />
                <Bar dataKey="profit" name="กำไร" radius={[4, 4, 0, 0]}>
                  {sensitivityData.map((d, i) => <Cell key={i} fill={d.profit >= 0 ? "#22c55e" : "#ef4444"} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[230px] flex items-center justify-center text-gray-300 text-sm">กรอกราคาขายก่อน</div>
          )}
        </div>
      </div>

      {/* Sensitivity Table */}
      {financial.sellingPricePerSqWah > 0 && (
        <div className="card mb-6">
          <h3 className="text-sm font-semibold text-gray-500 mb-3">ตารางวิเคราะห์ความอ่อนไหว</h3>
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[480px]">
            <thead>
              <tr className="text-xs text-gray-500 border-b">
                <th className="text-left py-2">การเปลี่ยนแปลงราคาขาย</th>
                <th className="text-right">ราคาต่อ ตร.วา</th>
                <th className="text-right">รายได้รวม</th>
                <th className="text-right">กำไร</th>
                <th className="text-right">ROI</th>
              </tr>
            </thead>
            <tbody>
              {sensitivityData.map((row) => (
                <tr key={row.name} className={clsx("border-b last:border-0", row.name === "+0%" && "bg-brand-50")}>
                  <td className="py-2 font-medium">{row.name}</td>
                  <td className="text-right">
                    {formatThb(financial.sellingPricePerSqWah * (1 + parseFloat(row.name) / 100))}
                  </td>
                  <td className="text-right">{formatThb(row.profit + financial.totalProjectCost)}</td>
                  <td className={clsx("text-right font-semibold", row.profit >= 0 ? "text-green-600" : "text-red-600")}>
                    {formatThb(row.profit)}
                  </td>
                  <td className={clsx("text-right font-semibold", row.roi >= 0 ? "text-green-600" : "text-red-600")}>
                    {row.roi.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      <NavButtons prevStep={3} nextStep={5} onNext={() => { setStep(5); return true; }} />
    </div>
  );
}
