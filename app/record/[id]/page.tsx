"use client";
import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { formatThb, formatArea, toSqWah } from "@/lib/calculations";
import { ArrowLeft, Lock, MapPin, CheckCircle, MinusCircle } from "lucide-react";
import clsx from "clsx";

const ZONING_LABEL: Record<string, string> = {
  yellow: "สีเหลือง — ที่อยู่อาศัยหนาแน่นน้อย",
  orange: "สีส้ม — ที่อยู่อาศัยหนาแน่นปานกลาง",
  red: "สีแดง — พาณิชยกรรม",
  purple: "สีม่วง — อุตสาหกรรม",
  green: "สีเขียว — เกษตรกรรม",
  "light-green": "สีเขียวอ่อน — ชนบทและเกษตรกรรม",
};

const SHAPE_LABEL: Record<string, string> = {
  rectangular: "สี่เหลี่ยมผืนผ้า", corner: "มุมถนน",
  irregular: "รูปร่างไม่สม่ำเสมอ", flag: "ที่ดินตาบอด",
};

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={clsx("flex justify-between py-1.5 border-b last:border-0 text-sm", highlight && "font-bold")}>
      <span className="text-gray-600">{label}</span>
      <span className={clsx(highlight && "text-brand-700")}>{value}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 border-b pb-2">{title}</h3>
      {children}
    </div>
  );
}

export default function RecordPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, savedProjects } = useStore();

  useEffect(() => {
    if (!user) router.replace('/login');
  }, [user, router]);

  if (!user) return null;

  const record = savedProjects.find((p) => p.id === id);

  if (!record) {
    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-8">
          <ArrowLeft size={16} /> กลับ
        </button>
        <div className="card text-center py-12 text-gray-400">
          <p className="font-medium">ไม่พบข้อมูลโปรเจกต์นี้</p>
        </div>
      </div>
    );
  }

  const { projectName, landInput, landAnalysis, devCost, financial, savedAt } = record;
  const totalSqWah = toSqWah(landInput.rai, landInput.ngan, landInput.sqWah);
  const acquisitionCost = landInput.acquisitionCost || landInput.landPrice;

  const recommendation = (() => {
    if (!financial.sellingPricePerSqWah && !financial.quickSellTotal) return null;
    if (financial.grossProfit > financial.quickSellProfit * 1.5 && financial.roi > 20) return "develop";
    if (financial.quickSellProfit >= financial.grossProfit * 0.8) return "quicksell";
    return "neutral";
  })();

  const backHref = user.role === 'admin' ? '/admin' : '/dashboard';

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      {/* Back + locked notice */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.push(backHref)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft size={16} /> กลับ
        </button>
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-3 py-1.5">
          <Lock size={12} />
          ข้อมูลที่บันทึกไว้ — ดูอย่างเดียว
        </div>
      </div>

      {/* Header */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">โปรเจกต์ที่บันทึกไว้</p>
            <h1 className="text-2xl font-bold text-gray-900">{projectName}</h1>
            {landInput.location && (
              <div className="flex items-center gap-1.5 mt-2 text-sm text-gray-500">
                <MapPin size={14} className="text-brand-500 shrink-0" />
                {landInput.location}
              </div>
            )}
            <p className="text-xs text-gray-400 mt-2">
              บันทึกเมื่อ {new Date(savedAt).toLocaleDateString('th-TH', { dateStyle: 'long' })}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {landInput.zoningCode && (
              <span className="text-xs bg-gray-100 text-gray-700 rounded-full px-3 py-1 font-medium">
                {ZONING_LABEL[landInput.zoningCode] ?? landInput.zoningCode}
              </span>
            )}
            {landInput.landShape && (
              <span className="text-xs bg-gray-100 text-gray-700 rounded-full px-3 py-1 font-medium">
                {SHAPE_LABEL[landInput.landShape]}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "พื้นที่ทั้งหมด", value: formatArea(totalSqWah), sub: `${totalSqWah.toLocaleString()} ตร.วา` },
          { label: "จำนวนแปลง", value: `${landAnalysis.lotCount} แปลง`, sub: `แปลงละ ${landAnalysis.lotSizeSqWah} ตร.วา` },
          { label: "ต้นทุนโครงการรวม", value: formatThb(financial.totalProjectCost), sub: "Land + Infrastructure", highlight: true },
          { label: "ROI", value: `${financial.roi.toFixed(1)}%`, sub: `Gross Margin ${financial.grossMargin.toFixed(1)}%`, highlight: true },
        ].map((s) => (
          <div key={s.label} className={clsx("stat-card", s.highlight && "bg-brand-50 border-brand-200")}>
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className={clsx("text-lg font-bold", s.highlight ? "text-brand-700" : "text-gray-900")}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="card border-l-4 border-blue-400">
          <p className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-3">Option A — Quick Sell</p>
          <div className="space-y-2 text-sm">
            {[["ราคาขาย", formatThb(financial.quickSellTotal)],
              ["กำไร", formatThb(financial.quickSellProfit)],
              ["ROI", `${financial.quickSellRoi.toFixed(1)}%`],
              ["ระยะเวลา", "1–3 เดือน"]].map(([l, v]) => (
              <div key={l} className="flex justify-between">
                <span className="text-gray-500">{l}</span>
                <span className={clsx("font-semibold", l === "กำไร" && (financial.quickSellProfit < 0 ? "text-red-600" : "text-green-600"))}>{v}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card border-l-4 border-brand-500">
          <p className="text-xs font-bold text-brand-600 uppercase tracking-wider mb-3">Option B — Develop & Sell</p>
          <div className="space-y-2 text-sm">
            {[["รายได้รวม", formatThb(financial.grossRevenue)],
              ["กำไร", formatThb(financial.grossProfit)],
              ["ROI", `${financial.roi.toFixed(1)}%`],
              ["ระยะเวลา", "12–36 เดือน"]].map(([l, v]) => (
              <div key={l} className="flex justify-between">
                <span className="text-gray-500">{l}</span>
                <span className={clsx("font-semibold", l === "กำไร" && (financial.grossProfit < 0 ? "text-red-600" : "text-green-600"))}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendation */}
      {recommendation && (
        <div className={clsx("card mb-6 flex items-start gap-4",
          recommendation === "develop" && "bg-brand-50 border-brand-200",
          recommendation === "quicksell" && "bg-blue-50 border-blue-200",
          recommendation === "neutral" && "bg-gray-50 border-gray-200")}>
          {recommendation === "develop" && <CheckCircle size={20} className="text-brand-600 shrink-0 mt-0.5" />}
          {recommendation === "quicksell" && <CheckCircle size={20} className="text-blue-500 shrink-0 mt-0.5" />}
          {recommendation === "neutral" && <MinusCircle size={20} className="text-gray-400 shrink-0 mt-0.5" />}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">คำแนะนำเบื้องต้น</p>
            <p className="font-semibold text-gray-800 text-sm">
              {recommendation === "develop" && "แนะนำ Develop & Sell — ROI สูงกว่า Quick Sell อย่างมีนัยสำคัญ"}
              {recommendation === "quicksell" && "แนะนำ Quick Sell — ผลตอบแทนใกล้เคียงกัน ความเสี่ยงน้อยกว่า"}
              {recommendation === "neutral" && "ควรวิเคราะห์เพิ่มเติมก่อนตัดสินใจ"}
            </p>
          </div>
        </div>
      )}

      {/* Full data */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <Section title="ข้อมูลที่ดิน">
            <Row label="พื้นที่ทั้งหมด" value={formatArea(totalSqWah)} />
            <Row label="ราคาซื้อขาย" value={formatThb(landInput.landPrice)} />
            <Row label="ราคาประเมิน" value={formatThb(landInput.appraisalValue)} />
            <Row label="ถนนหน้าที่ดิน" value={`${landInput.frontageWidth} ม.`} />
          </Section>
          <Section title="การวิเคราะห์ที่ดิน">
            <Row label="หักถนน/สาธารณูปโภค" value={`${landAnalysis.roadDeductionPct}%`} />
            <Row label="พื้นที่ขายได้" value={formatArea(landAnalysis.usableAreaSqWah)} />
            <Row label="จำนวนแปลง" value={`${landAnalysis.lotCount} แปลง`} highlight />
          </Section>
        </div>
        <div className="card">
          <Section title="ต้นทุนพัฒนา">
            <Row label="ต้นทุนที่ดิน" value={formatThb(acquisitionCost)} />
            <Row label="ค่าก่อสร้างถนน" value={formatThb(devCost.roadCost)} />
            <Row label="ค่าสาธารณูปโภค" value={formatThb(devCost.electricityCost + devCost.waterCost)} />
            <Row label="ค่ารั้ว + ประตู" value={formatThb(devCost.fenceCost + (devCost.hasGate ? devCost.gateCost : 0))} />
            <Row label="ค่าเบ็ดเตล็ด" value={formatThb(devCost.miscCost)} />
            <Row label="รวมต้นทุนโครงสร้างพื้นฐาน" value={formatThb(devCost.totalInfraCost)} highlight />
          </Section>
          <Section title="การวิเคราะห์การเงิน">
            <Row label="ราคาขายต่อ ตร.วา" value={formatThb(financial.sellingPricePerSqWah)} />
            <Row label="รายได้รวม" value={formatThb(financial.grossRevenue)} />
            <Row label="กำไรขั้นต้น" value={formatThb(financial.grossProfit)} />
            <Row label="ROI" value={`${financial.roi.toFixed(1)}%`} highlight />
          </Section>
        </div>
      </div>
    </div>
  );
}
