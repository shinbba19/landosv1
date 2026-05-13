"use client";
import { useStore } from "@/lib/store";
import StepHeader from "@/components/StepHeader";
import NavButtons from "@/components/NavButtons";
import { toSqWah, formatThb } from "@/lib/calculations";

const ZONING_OPTIONS = [
  { value: "", label: "เลือกสีผังเมือง" },
  { value: "yellow", label: "สีเหลือง — ที่อยู่อาศัยหนาแน่นน้อย" },
  { value: "orange", label: "สีส้ม — ที่อยู่อาศัยหนาแน่นปานกลาง" },
  { value: "red", label: "สีแดง — พาณิชยกรรม" },
  { value: "purple", label: "สีม่วง — อุตสาหกรรม" },
  { value: "green", label: "สีเขียว — เกษตรกรรม" },
  { value: "light-green", label: "สีเขียวอ่อน — ชนบทและเกษตรกรรม" },
];

const SHAPE_OPTIONS = [
  { value: "rectangular", label: "สี่เหลี่ยมผืนผ้า" },
  { value: "corner", label: "มุมถนน (Corner)" },
  { value: "irregular", label: "รูปร่างไม่สม่ำเสมอ" },
  { value: "flag", label: "ที่ดินตาบอด (Flag Lot)" },
];

export default function Step1() {
  const { landInput, updateLandInput, setStep, projectName, setProjectName } = useStore();
  const totalSqWah = toSqWah(landInput.rai, landInput.ngan, landInput.sqWah);
  const totalSqm = totalSqWah * 4;

  const pricePerSqWah = totalSqWah > 0 ? landInput.landPrice / totalSqWah : 0;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <StepHeader step={1} title="ข้อมูลที่ดิน" subtitle="Land Input — กรอกข้อมูลพื้นฐานของที่ดิน" />

      {/* Project Name */}
      <div className="card mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">ชื่อโปรเจกต์</h2>
        <input
          className="input-field text-base font-medium"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="ระบุชื่อโปรเจกต์..."
        />
      </div>

      {/* Land Size */}
      <div className="card mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">ขนาดที่ดิน</h2>
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4">
          <div>
            <label className="label">ไร่</label>
            <input
              type="number" min={0}
              className="input-field"
              value={landInput.rai || ""}
              onChange={(e) => updateLandInput({ rai: parseFloat(e.target.value) || 0 })}
              placeholder="0"
            />
          </div>
          <div>
            <label className="label">งาน</label>
            <input
              type="number" min={0} max={3}
              className="input-field"
              value={landInput.ngan || ""}
              onChange={(e) => updateLandInput({ ngan: parseFloat(e.target.value) || 0 })}
              placeholder="0"
            />
          </div>
          <div>
            <label className="label">ตารางวา</label>
            <input
              type="number" min={0} max={99}
              className="input-field"
              value={landInput.sqWah || ""}
              onChange={(e) => updateLandInput({ sqWah: parseFloat(e.target.value) || 0 })}
              placeholder="0"
            />
          </div>
        </div>
        {totalSqWah > 0 && (
          <div className="bg-brand-50 rounded-xl p-3 flex gap-6 text-sm">
            <div><span className="text-gray-500">รวม:</span> <span className="font-bold text-brand-700">{totalSqWah.toLocaleString()} ตร.วา</span></div>
            <div><span className="text-gray-500">= </span><span className="font-semibold text-gray-700">{totalSqm.toLocaleString()} ตร.ม.</span></div>
          </div>
        )}
      </div>

      {/* Financial */}
      <div className="card mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">ข้อมูลราคา</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">ราคาซื้อขาย (บาท)</label>
            <input
              type="number" min={0}
              className="input-field"
              value={landInput.landPrice || ""}
              onChange={(e) => updateLandInput({ landPrice: parseFloat(e.target.value) || 0 })}
              placeholder="0"
            />
            {pricePerSqWah > 0 && (
              <p className="text-xs text-gray-500 mt-1">≈ {formatThb(pricePerSqWah)} / ตร.วา</p>
            )}
          </div>
          <div>
            <label className="label">ต้นทุนการถือครอง (บาท)</label>
            <input
              type="number" min={0}
              className="input-field"
              value={landInput.acquisitionCost || ""}
              onChange={(e) => updateLandInput({ acquisitionCost: parseFloat(e.target.value) || 0 })}
              placeholder="รวมค่าโอน ดอกเบี้ย ค่าใช้จ่ายอื่น"
            />
          </div>
          <div>
            <label className="label">ราคาประเมิน (บาท)</label>
            <input
              type="number" min={0}
              className="input-field"
              value={landInput.appraisalValue || ""}
              onChange={(e) => updateLandInput({ appraisalValue: parseFloat(e.target.value) || 0 })}
              placeholder="ราคาประเมินกรมธนารักษ์"
            />
          </div>
          <div>
            <label className="label">ความกว้างถนนหน้าที่ดิน (ม.)</label>
            <input
              type="number" min={0}
              className="input-field"
              value={landInput.frontageWidth || ""}
              onChange={(e) => updateLandInput({ frontageWidth: parseFloat(e.target.value) || 0 })}
              placeholder="0"
            />
          </div>
        </div>
      </div>

      {/* Location & Zoning */}
      <div className="card mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">ที่ตั้งและผังเมือง</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="label">ที่ตั้ง / จังหวัด</label>
            <input
              className="input-field"
              value={landInput.location}
              onChange={(e) => updateLandInput({ location: e.target.value })}
              placeholder="เช่น ต.บางบัวทอง อ.บางบัวทอง จ.นนทบุรี"
            />
          </div>
          <div>
            <label className="label">สีผังเมือง</label>
            <select
              className="input-field"
              value={landInput.zoningCode}
              onChange={(e) => updateLandInput({ zoningCode: e.target.value })}
            >
              {ZONING_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">รูปร่างที่ดิน</label>
            <select
              className="input-field"
              value={landInput.landShape}
              onChange={(e) => updateLandInput({ landShape: e.target.value as "rectangular" | "irregular" | "corner" | "flag" })}
            >
              {SHAPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">ข้อจำกัดทางกฎหมาย</label>
            <input
              className="input-field"
              value={landInput.legalConstraints}
              onChange={(e) => updateLandInput({ legalConstraints: e.target.value })}
              placeholder="เช่น ภาระจำยอม, ที่ดินติดจำนอง"
            />
          </div>
        </div>
      </div>

      <NavButtons nextStep={2} onNext={() => { setStep(2); return true; }} />
    </div>
  );
}
