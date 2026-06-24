"use client";
import { useStore } from "@/lib/store";
import { formatThb, formatArea } from "@/lib/calculations";
import StepHeader from "@/components/StepHeader";
import NavButtons from "@/components/NavButtons";
import { Check, X, TrendingUp, Clock, AlertTriangle, Banknote } from "lucide-react";
import clsx from "clsx";

function RiskBadge({ level }: { level: "low" | "medium" | "high" }) {
  return (
    <span className={clsx(
      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold",
      level === "low" && "bg-green-100 text-green-700",
      level === "medium" && "bg-amber-100 text-amber-700",
      level === "high" && "bg-red-100 text-red-700",
    )}>
      {level === "low" ? "ต่ำ" : level === "medium" ? "ปานกลาง" : "สูง"}
    </span>
  );
}

function CompareRow({ label, qsValue, dsValue, highlight }: {
  label: string; qsValue: React.ReactNode; dsValue: React.ReactNode; highlight?: boolean;
}) {
  return (
    <div className={clsx("grid grid-cols-3 py-3 border-b last:border-0", highlight && "bg-brand-50 -mx-4 px-4 rounded")}>
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-sm font-medium text-center">{qsValue}</div>
      <div className="text-sm font-medium text-center">{dsValue}</div>
    </div>
  );
}

export default function Step5() {
  const { landInput, landAnalysis, devCost, financial, setStep } = useStore();
  const { lotCount, lotSizeSqWah, usableAreaSqWah, totalSqWah } = landAnalysis;
  const leftoverRevenue = financial.sellingPricePerSqWah * landAnalysis.leftoverSqWah;
  const totalRevenue = financial.grossRevenue + leftoverRevenue;

  const qs = {
    capital: landInput.acquisitionCost || landInput.landPrice,
    profit: financial.quickSellProfit,
    roi: financial.quickSellRoi,
    timeline: "1–3 เดือน",
    risk: "low" as const,
  };

  const ds = {
    capital: financial.totalProjectCost,
    profit: financial.grossProfit,
    roi: financial.roi,
    timeline: "12–36 เดือน",
    risk: financial.roi > 30 ? ("medium" as const) : ("high" as const),
  };

  const recommendation = (() => {
    if (!financial.sellingPricePerSqWah && !financial.quickSellTotal) return null;
    if (ds.profit > qs.profit * 1.5 && ds.roi > 20) return "develop";
    if (qs.profit >= ds.profit * 0.8) return "quicksell";
    return "neutral";
  })();

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <StepHeader step={5} title="เปรียบเทียบกลยุทธ์" subtitle="Decision Comparison — Quick Sell vs Develop & Sell" />

      {/* Recommendation Banner */}
      {recommendation && (
        <div className={clsx(
          "card mb-6 border-2",
          recommendation === "develop" ? "border-brand-400 bg-brand-50" :
          recommendation === "quicksell" ? "border-blue-400 bg-blue-50" :
          "border-gray-300 bg-gray-50"
        )}>
          <div className="flex items-center gap-3">
            <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center text-white",
              recommendation === "develop" ? "bg-brand-600" :
              recommendation === "quicksell" ? "bg-blue-500" : "bg-gray-500"
            )}>
              <TrendingUp size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">คำแนะนำเบื้องต้น</p>
              <p className="font-bold text-gray-800">
                {recommendation === "develop" && "แนะนำ: พัฒนาแล้วขายแปลงย่อย (Develop & Sell) — ROI สูงกว่าอย่างมีนัยสำคัญ"}
                {recommendation === "quicksell" && "แนะนำ: ขายยกแปลง (Quick Sell) — ผลตอบแทนใกล้เคียงกัน ความเสี่ยงน้อยกว่า"}
                {recommendation === "neutral" && "พิจารณาตามสถานการณ์ — ทั้งสองตัวเลือกมีข้อดีข้อเสีย"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Option Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
        {/* Quick Sell */}
        <div className="card border-2 border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-blue-700">Option A</h3>
              <p className="text-lg font-bold">ขายยก (Quick Sell)</p>
              <p className="text-xs text-gray-500">ขายทั้งผืนทันที ไม่ต้องพัฒนา</p>
            </div>
            <Banknote size={32} className="text-blue-400" />
          </div>
          <div className="space-y-3">
            <div className="bg-blue-50 rounded-xl p-3">
              <p className="text-xs text-gray-500">รายได้</p>
              <p className="text-2xl font-bold text-blue-700">{formatThb(financial.quickSellTotal || 0)}</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-3">
              <p className="text-xs text-gray-500">กำไร</p>
              <p className="text-xl font-bold text-blue-600">{formatThb(qs.profit)}</p>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 bg-blue-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500">ROI</p>
                <p className="font-bold text-blue-600">{qs.roi.toFixed(1)}%</p>
              </div>
              <div className="flex-1 bg-blue-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500">ความเสี่ยง</p>
                <RiskBadge level={qs.risk} />
              </div>
            </div>
          </div>
          <div className="mt-4 space-y-1.5">
            {["ไม่ต้องใช้เวลาพัฒนา", "กระแสเงินสดทันที", "ความเสี่ยงต่ำมาก"].map((p) => (
              <div key={p} className="flex items-center gap-2 text-sm text-green-700">
                <Check size={14} className="shrink-0" />{p}
              </div>
            ))}
            {["ได้กำไรน้อยกว่าศักยภาพ", "ไม่มีอำนาจต่อรองในระยะยาว"].map((c) => (
              <div key={c} className="flex items-center gap-2 text-sm text-red-600">
                <X size={14} className="shrink-0" />{c}
              </div>
            ))}
          </div>
        </div>

        {/* Develop & Sell */}
        <div className="card border-2 border-brand-300">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-brand-700">Option B</h3>
              <p className="text-lg font-bold">แบ่งขายเอง (Develop & Sell)</p>
              <p className="text-xs text-gray-500">พัฒนาโครงสร้างพื้นฐาน แล้วขายแปลงย่อย</p>
            </div>
            <TrendingUp size={32} className="text-brand-400" />
          </div>
          <div className="space-y-3">
            <div className="bg-brand-50 rounded-xl p-3">
              <p className="text-xs text-gray-500">รายได้รวมโดยประมาณ</p>
              <p className="text-2xl font-bold text-brand-700">{formatThb(totalRevenue)}</p>
            </div>
            <div className="bg-brand-50 rounded-xl p-3">
              <p className="text-xs text-gray-500">กำไรโดยประมาณ</p>
              <p className={clsx("text-xl font-bold", financial.grossProfit >= 0 ? "text-brand-600" : "text-red-600")}>
                {formatThb(financial.grossProfit)}
              </p>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 bg-brand-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500">ROI</p>
                <p className={clsx("font-bold", ds.roi >= 0 ? "text-brand-600" : "text-red-600")}>{ds.roi.toFixed(1)}%</p>
              </div>
              <div className="flex-1 bg-brand-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500">ความเสี่ยง</p>
                <RiskBadge level={ds.risk} />
              </div>
            </div>
          </div>
          <div className="mt-4 space-y-1.5">
            {["ศักยภาพกำไรสูงกว่า", `${lotCount} แปลง × ราคาตลาด`, "เพิ่มมูลค่าที่ดิน"].map((p) => (
              <div key={p} className="flex items-center gap-2 text-sm text-green-700">
                <Check size={14} className="shrink-0" />{p}
              </div>
            ))}
            {["ต้องใช้เงินทุนสูง", "ใช้เวลา 1–3 ปี", "ความเสี่ยงด้านตลาด"].map((c) => (
              <div key={c} className="flex items-center gap-2 text-sm text-red-600">
                <X size={14} className="shrink-0" />{c}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lot Listing */}
      {lotCount > 0 && (
        <div className="card mb-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">รายละเอียดการแบ่งแปลง</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-gray-400 uppercase text-xs">
                  <th className="py-2 text-left font-bold">แปลง</th>
                  <th className="py-2 text-right font-bold">ขนาด (ตร.วา)</th>
                  <th className="py-2 text-right font-bold">ราคาต่อแปลง</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: lotCount }, (_, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-1.5 text-gray-600">{i + 1}</td>
                    <td className="py-1.5 text-right">{lotSizeSqWah.toLocaleString()}</td>
                    <td className="py-1.5 text-right">{formatThb(financial.sellingPricePerSqWah * lotSizeSqWah)}</td>
                  </tr>
                ))}
                {landAnalysis.leftoverSqWah > 0 && (
                  <tr className="border-b text-gray-400 italic">
                    <td className="py-1.5">เศษที่ดินเหลือ</td>
                    <td className="py-1.5 text-right">{landAnalysis.leftoverSqWah.toFixed(1)}</td>
                    <td className="py-1.5 text-right">{formatThb(financial.sellingPricePerSqWah * landAnalysis.leftoverSqWah)}</td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="border-t-2 font-bold">
                  <td className="py-2">รวม {lotCount} แปลง{landAnalysis.leftoverSqWah > 0 ? " + เศษ" : ""}</td>
                  <td className="py-2 text-right">{(lotCount * lotSizeSqWah + landAnalysis.leftoverSqWah).toLocaleString()}</td>
                  <td className="py-2 text-right text-brand-700">{formatThb(financial.grossRevenue + financial.sellingPricePerSqWah * landAnalysis.leftoverSqWah)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Detail Comparison Table */}
      <div className="card mb-6">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">ตารางเปรียบเทียบ</h3>
        <div className="grid grid-cols-3 mb-2 text-xs font-bold text-gray-400 uppercase">
          <div>ตัวชี้วัด</div>
          <div className="text-center text-blue-500">Quick Sell</div>
          <div className="text-center text-brand-600">Develop & Sell</div>
        </div>
        <CompareRow label="เงินลงทุนที่ต้องการ" qsValue={formatThb(qs.capital)} dsValue={formatThb(ds.capital)} />
        <CompareRow label="รายได้รวม" qsValue={formatThb(financial.quickSellTotal || 0)} dsValue={formatThb(totalRevenue)} />
        <CompareRow label="ต้นทุนที่ดิน / โครงการ" qsValue={`−${formatThb(qs.capital)}`} dsValue={`−${formatThb(ds.capital)}`} />
        <CompareRow label="ภาษี 5%" qsValue={`−${formatThb(financial.quickSellTax)}`} dsValue={`−${formatThb(financial.developTax)}`} />
        <CompareRow label="ค่านายหน้า 3%" qsValue={`−${formatThb(financial.quickSellCommission)}`} dsValue={`−${formatThb(financial.developCommission)}`} />
        <CompareRow label="กำไรสุทธิ" qsValue={formatThb(qs.profit)} dsValue={formatThb(ds.profit)} highlight />
        <CompareRow label="ROI" qsValue={`${qs.roi.toFixed(1)}%`} dsValue={`${ds.roi.toFixed(1)}%`} highlight />
        <CompareRow label="ระยะเวลา" qsValue={qs.timeline} dsValue={ds.timeline} />
        <CompareRow label="ระดับความเสี่ยง" qsValue={<RiskBadge level={qs.risk} />} dsValue={<RiskBadge level={ds.risk} />} />
        <CompareRow label="จำนวนแปลง" qsValue="—" dsValue={`${lotCount} แปลง`} />
        <CompareRow label="พื้นที่ขายได้" qsValue={formatArea(totalSqWah)} dsValue={formatArea(lotCount * lotSizeSqWah)} />
      </div>

      {/* Risk Warning */}
      <div className="card mb-6 border-amber-200 bg-amber-50">
        <div className="flex gap-3">
          <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-semibold mb-1">ข้อควรระวัง</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>ผลการวิเคราะห์นี้เป็นการประมาณการเบื้องต้นเท่านั้น</li>
              <li>ราคาตลาดจริงอาจแตกต่างจากสมมติฐาน</li>
              <li>ค่าใช้จ่ายจริงในการพัฒนาอาจสูงหรือต่ำกว่าประมาณการ</li>
              <li>ควรปรึกษาผู้เชี่ยวชาญด้านกฎหมายและวิศวกรรมก่อนตัดสินใจ</li>
            </ul>
          </div>
        </div>
      </div>

      <NavButtons prevStep={4} nextStep={6} onNext={() => { setStep(6); return true; }} nextLabel="ดูสรุปผล" />
    </div>
  );
}
