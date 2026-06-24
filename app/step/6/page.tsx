"use client";
import React, { useState } from "react";
import { useStore } from "@/lib/store";
import { formatThb, formatArea, toSqWah } from "@/lib/calculations";
import StepHeader from "@/components/StepHeader";
import { Printer, RotateCcw, Save, CheckCircle } from "lucide-react";
import clsx from "clsx";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 border-b pb-2">{title}</h3>
      {children}
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className={clsx("flex justify-between py-1.5 border-b last:border-0 text-sm", highlight && "font-bold")}>
      <span className="text-gray-600">{label}</span>
      <span className={clsx(highlight && "text-brand-700")}>{value}</span>
    </div>
  );
}

export default function Step6() {
  const { projectName, landInput, landAnalysis, devCost, financial, reset, saveProject } = useStore();
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    saveProject();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };
  const totalSqWah = toSqWah(landInput.rai, landInput.ngan, landInput.sqWah);
  const acquisitionCost = landInput.acquisitionCost || landInput.landPrice;
  const leftoverRevenue = financial.sellingPricePerSqWah * landAnalysis.leftoverSqWah;
  const totalRevenue = financial.grossRevenue + leftoverRevenue;

  const ZONING_LABEL: Record<string, string> = {
    yellow: "สีเหลือง", orange: "สีส้ม", red: "สีแดง",
    purple: "สีม่วง", green: "สีเขียว", "light-green": "สีเขียวอ่อน",
  };
  const SHAPE_LABEL: Record<string, string> = {
    rectangular: "สี่เหลี่ยมผืนผ้า", corner: "มุมถนน", irregular: "รูปร่างไม่สม่ำเสมอ", flag: "ที่ดินตาบอด",
  };

  const recommendation = (() => {
    if (!financial.sellingPricePerSqWah && !financial.quickSellTotal) return "ยังไม่มีข้อมูลเพียงพอ";
    if (financial.grossProfit > financial.quickSellProfit * 1.5 && financial.roi > 20)
      return "แนะนำ Develop & Sell — ศักยภาพกำไรสูงกว่า Quick Sell อย่างมีนัยสำคัญ";
    if (financial.quickSellProfit >= financial.grossProfit * 0.8)
      return "แนะนำ Quick Sell — ผลตอบแทนใกล้เคียงกัน ความเสี่ยงน้อยกว่ามาก";
    return "ควรวิเคราะห์เพิ่มเติมก่อนตัดสินใจ";
  })();

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <StepHeader step={6} title="สรุปผลการวิเคราะห์" subtitle="Executive Summary Report" className="mb-0" />
        <div className="flex gap-2 no-print flex-wrap">
          <button
            onClick={handleSave}
            disabled={saved}
            className={clsx(
              "flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl transition-all border",
              saved
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-brand-600 hover:bg-brand-700 text-white border-transparent"
            )}
          >
            {saved ? <CheckCircle size={15} /> : <Save size={15} />}
            {saved ? "บันทึกแล้ว!" : "บันทึกโปรเจกต์"}
          </button>
          <button onClick={() => window.print()} className="btn-secondary flex items-center gap-2 text-sm">
            <Printer size={15} />พิมพ์ / PDF
          </button>
          <button
            onClick={() => { if (confirm("ล้างข้อมูลทั้งหมด?")) reset(); }}
            className="btn-secondary flex items-center gap-2 text-sm text-red-600 border-red-200 hover:bg-red-50"
          >
            <RotateCcw size={15} />เริ่มใหม่
          </button>
        </div>
      </div>

      {/* Print header */}
      <div className="hidden print:block mb-6">
        <h1 className="text-2xl font-bold">LANDOS V1 — รายงานวิเคราะห์ความเป็นไปได้</h1>
        <p className="text-gray-500">วันที่: {new Date().toLocaleDateString("th-TH", { dateStyle: "long" })}</p>
      </div>

      <div className="card mb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider">โปรเจกต์</p>
            <h2 className="text-2xl font-bold text-gray-900">{projectName}</h2>
            <p className="text-sm text-gray-500">{landInput.location || "ไม่ระบุที่ตั้ง"}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">ผังเมือง</p>
            <p className="font-semibold">{ZONING_LABEL[landInput.zoningCode] || "ไม่ระบุ"}</p>
            <p className="text-xs text-gray-400 mt-1">รูปร่างที่ดิน</p>
            <p className="font-semibold">{SHAPE_LABEL[landInput.landShape]}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Land & Analysis */}
        <div className="card">
          <Section title="ข้อมูลที่ดิน">
            <Row label="พื้นที่ทั้งหมด" value={formatArea(totalSqWah)} />
            <Row label="พื้นที่ (ตร.วา)" value={`${totalSqWah.toLocaleString()} ตร.วา`} />
            <Row label="ราคาซื้อขาย" value={formatThb(landInput.landPrice)} />
            <Row label="ราคาประเมิน" value={formatThb(landInput.appraisalValue)} />
            <Row label="ถนนหน้าที่ดิน" value={`${landInput.frontageWidth} ม.`} />
          </Section>
          <Section title="การวิเคราะห์ที่ดิน">
            <Row label="หักถนน/สาธารณูปโภค" value={`${landAnalysis.roadDeductionPct}% (${formatArea(landAnalysis.roadAreaSqWah)})`} />
            <Row label="พื้นที่ขายได้" value={formatArea(landAnalysis.usableAreaSqWah)} />
            <Row label="จำนวนแปลง" value={`${landAnalysis.lotCount} แปลง`} highlight />
            <Row label="ขนาดต่อแปลง" value={`${landAnalysis.lotSizeSqWah} ตร.วา`} />
          </Section>
        </div>

        {/* Cost & Financial */}
        <div className="card">
          <Section title="ต้นทุนพัฒนา">
            <Row label="ต้นทุนที่ดิน" value={formatThb(acquisitionCost)} />
            <Row label="ค่าก่อสร้างถนน" value={formatThb(devCost.roadCost)} />
            <Row label="ค่าสาธารณูปโภค" value={formatThb(devCost.electricityCost + devCost.waterCost)} />
            <Row label="ค่ารั้ว + ประตู" value={formatThb(devCost.fenceCost + (devCost.hasGate ? devCost.gateCost : 0))} />
            <Row label="ค่าใช้จ่ายเบ็ดเตล็ด" value={formatThb(devCost.miscCost)} />
            <Row label="รวมต้นทุนโครงสร้างพื้นฐาน" value={formatThb(devCost.totalInfraCost)} />
            <Row label="รวมต้นทุนโครงการทั้งสิ้น" value={formatThb(financial.totalProjectCost)} highlight />
          </Section>
          <Section title="การวิเคราะห์การเงิน (Develop & Sell)">
            <Row label="ราคาขายต่อ ตร.วา" value={formatThb(financial.sellingPricePerSqWah)} />
            <Row label="รายได้รวมโดยประมาณ" value={formatThb(totalRevenue)} />
            <Row label="ภาษี 5% (ราคาขายจริง)" value={`−${formatThb(financial.developTax)}`} />
            <Row label="ค่านายหน้า 3%" value={`−${formatThb(financial.developCommission)}`} />
            <Row label="กำไรสุทธิ" value={formatThb(financial.grossProfit)} />
            <Row label="Gross Margin" value={`${financial.grossMargin.toFixed(1)}%`} />
            <Row label="ROI" value={`${financial.roi.toFixed(1)}%`} highlight />
          </Section>
          <Section title="Quick Sell">
            <Row label="ราคาขายยก" value={formatThb(financial.quickSellTotal)} />
            <Row label="ภาษี 5% (ราคาประเมิน)" value={`−${formatThb(financial.quickSellTax)}`} />
            <Row label="ค่านายหน้า 3%" value={`−${formatThb(financial.quickSellCommission)}`} />
            <Row label="กำไรสุทธิ" value={formatThb(financial.quickSellProfit)} highlight />
          </Section>
        </div>
      </div>

      {/* Lot Listing */}
      <div className="card mb-6">
        <Section title="รายละเอียดการแบ่งแปลง">
          {landAnalysis.lotCount > 0 ? (
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
                  {Array.from({ length: landAnalysis.lotCount }, (_, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-1.5 text-gray-600">{i + 1}</td>
                      <td className="py-1.5 text-right">{landAnalysis.lotSizeSqWah.toLocaleString()}</td>
                      <td className="py-1.5 text-right">{formatThb(financial.sellingPricePerSqWah * landAnalysis.lotSizeSqWah)}</td>
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
                    <td className="py-2">รวม {landAnalysis.lotCount} แปลง{landAnalysis.leftoverSqWah > 0 ? " + เศษ" : ""}</td>
                    <td className="py-2 text-right">{(landAnalysis.lotCount * landAnalysis.lotSizeSqWah + landAnalysis.leftoverSqWah).toLocaleString()}</td>
                    <td className="py-2 text-right text-brand-700">{formatThb(financial.grossRevenue + financial.sellingPricePerSqWah * landAnalysis.leftoverSqWah)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-400">ยังไม่มีข้อมูลการแบ่งแปลง</p>
          )}
        </Section>
      </div>

      {/* Comparison Summary */}
      <div className="card mb-6">
        <Section title="เปรียบเทียบกลยุทธ์">
          <div className="overflow-x-auto">
          <div className="grid grid-cols-3 gap-4 min-w-[320px]">
            <div className="text-sm font-bold text-gray-400 uppercase">ตัวชี้วัด</div>
            <div className="text-sm font-bold text-blue-600 text-center">Quick Sell</div>
            <div className="text-sm font-bold text-brand-600 text-center">Develop & Sell</div>
            {[
              ["รายได้", formatThb(financial.quickSellTotal || 0), formatThb(totalRevenue)],
              ["กำไร", formatThb(financial.quickSellProfit), formatThb(financial.grossProfit)],
              ["ROI", `${financial.quickSellRoi.toFixed(1)}%`, `${financial.roi.toFixed(1)}%`],
              ["ระยะเวลา", "1–3 เดือน", "12–36 เดือน"],
              ["ความเสี่ยง", "ต่ำ", "ปานกลาง–สูง"],
            ].map(([label, qs, ds]) => (
              <React.Fragment key={label}>
                <div className="text-sm text-gray-600 py-2 border-t">{label}</div>
                <div className="text-sm text-center py-2 border-t font-medium">{qs}</div>
                <div className="text-sm text-center py-2 border-t font-medium text-brand-700">{ds}</div>
              </React.Fragment>
            ))}
          </div>
          </div>
        </Section>

        {/* Recommendation */}
        <div className="bg-brand-50 border border-brand-200 rounded-xl p-4">
          <p className="text-xs text-brand-500 uppercase font-bold tracking-wider mb-1">คำแนะนำเบื้องต้น (LANDOS)</p>
          <p className="text-brand-800 font-semibold">{recommendation}</p>
          <p className="text-xs text-gray-500 mt-2">
            * ผลการวิเคราะห์นี้เป็นการประมาณการเบื้องต้นเท่านั้น ไม่ใช่คำแนะนำทางกฎหมายหรือวิศวกรรม
            ควรศึกษาข้อมูลตลาดจริงและปรึกษาผู้เชี่ยวชาญก่อนตัดสินใจลงทุน
          </p>
        </div>
      </div>

      {/* Assumptions */}
      <div className="card mb-6 bg-gray-50">
        <Section title="สมมติฐานที่ใช้ในการวิเคราะห์">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <Row label="Preset ต้นทุน" value={devCost.preset.charAt(0).toUpperCase() + devCost.preset.slice(1)} />
            <Row label="ค่าก่อสร้างถนน" value={`${devCost.roadCostPerSqm.toLocaleString()} บาท/ตร.ม.`} />
            <Row label="หักถนน/สาธารณูปโภค" value={`${landAnalysis.roadDeductionPct}%`} />
            <Row label="ค่าเบ็ดเตล็ด" value={`${devCost.miscPct}%`} />
            <Row label="จำนวนแปลง" value={`${landAnalysis.lotCount} แปลง`} />
            <Row label="ค่าไฟฟ้า" value={`${devCost.electricityCostPerM.toLocaleString()} บาท/ม.`} />
          </div>
        </Section>
      </div>

      <div className="flex justify-center no-print">
        <button onClick={() => window.print()} className="btn-primary flex items-center gap-2">
          <Printer size={16} />
          พิมพ์ / บันทึกเป็น PDF
        </button>
      </div>
    </div>
  );
}
