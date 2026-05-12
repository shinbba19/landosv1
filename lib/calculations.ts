import type { LandInput, LandAnalysis, DevCost, Financial } from "./types";

export const SQ_WAH_PER_NGAN = 100;
export const NGAN_PER_RAI = 4;
export const SQ_WAH_PER_RAI = 400;
export const SQM_PER_SQ_WAH = 4;

export function toSqWah(rai: number, ngan: number, sqWah: number): number {
  return rai * SQ_WAH_PER_RAI + ngan * SQ_WAH_PER_NGAN + sqWah;
}

export function sqWahToSqm(sqWah: number): number {
  return sqWah * SQM_PER_SQ_WAH;
}

export function sqWahToRaiNganWah(sqWah: number): [number, number, number] {
  const rai = Math.floor(sqWah / SQ_WAH_PER_RAI);
  const rem = sqWah % SQ_WAH_PER_RAI;
  const ngan = Math.floor(rem / SQ_WAH_PER_NGAN);
  const wah = rem % SQ_WAH_PER_NGAN;
  return [rai, ngan, wah];
}

export function formatArea(sqWah: number): string {
  const [rai, ngan, wah] = sqWahToRaiNganWah(sqWah);
  const parts: string[] = [];
  if (rai) parts.push(`${rai} ไร่`);
  if (ngan) parts.push(`${ngan} งาน`);
  if (wah || parts.length === 0) parts.push(`${wah.toFixed(1)} ตร.วา`);
  return parts.join(" ");
}

export function formatThb(value: number): string {
  if (Math.abs(value) >= 1_000_000)
    return `฿${(value / 1_000_000).toFixed(2)}M`;
  return `฿${value.toLocaleString("th-TH", { maximumFractionDigits: 0 })}`;
}

export function calcLandAnalysis(
  input: LandInput,
  roadDeductionPct: number,
  lotSizeSqWah: number
): Omit<LandAnalysis, "roadDeductionPct" | "lotSizeSqWah"> {
  const totalSqWah = toSqWah(input.rai, input.ngan, input.sqWah);
  const roadAreaSqWah = totalSqWah * (roadDeductionPct / 100);
  const usableAreaSqWah = totalSqWah - roadAreaSqWah;
  const lotCount = Math.floor(usableAreaSqWah / lotSizeSqWah);
  const leftoverSqWah = usableAreaSqWah - lotCount * lotSizeSqWah;
  return { totalSqWah, roadAreaSqWah, usableAreaSqWah, lotCount, leftoverSqWah };
}

export function calcDevCost(
  dc: Pick<
    DevCost,
    | "roadLengthM" | "roadWidthM" | "electricityLengthM" | "waterLengthM"
    | "fenceLengthM" | "hasGate" | "hasCommonArea" | "miscPct"
    | "roadCostPerSqm" | "electricityCostPerM" | "waterCostPerM"
    | "fenceCostPerM" | "gateCost" | "commonAreaCost"
  >,
  lotCount: number
): Pick<DevCost, "roadCost" | "electricityCost" | "waterCost" | "fenceCost" | "miscCost" | "totalInfraCost"> {
  const roadCost = dc.roadLengthM * dc.roadWidthM * dc.roadCostPerSqm;
  const electricityCost = dc.electricityLengthM * dc.electricityCostPerM;
  const waterCost = dc.waterLengthM * dc.waterCostPerM;
  const fenceCost = dc.fenceLengthM * dc.fenceCostPerM;
  const gateCostVal = dc.hasGate ? dc.gateCost : 0;
  const commonCostVal = dc.hasCommonArea ? dc.commonAreaCost : 0;
  const subtotal = roadCost + electricityCost + waterCost + fenceCost + gateCostVal + commonCostVal;
  const miscCost = subtotal * (dc.miscPct / 100);
  const totalInfraCost = subtotal + miscCost;
  return { roadCost, electricityCost, waterCost, fenceCost, miscCost, totalInfraCost };
}

export function calcFinancial(
  acquisitionCost: number,
  totalInfraCost: number,
  lotCount: number,
  lotSizeSqWah: number,
  sellingPricePerSqWah: number,
  quickSellTotal: number
): Omit<Financial, "sellingPricePerSqWah" | "quickSellTotal"> {
  const totalProjectCost = acquisitionCost + totalInfraCost;
  const grossRevenue = lotCount * lotSizeSqWah * sellingPricePerSqWah;
  const grossProfit = grossRevenue - totalProjectCost;
  const grossMargin = grossRevenue ? (grossProfit / grossRevenue) * 100 : 0;
  const roi = totalProjectCost ? (grossProfit / totalProjectCost) * 100 : 0;
  const costPerSqWah = lotCount && lotSizeSqWah ? totalProjectCost / (lotCount * lotSizeSqWah) : 0;
  const quickSellProfit = quickSellTotal - acquisitionCost;
  const quickSellRoi = acquisitionCost ? (quickSellProfit / acquisitionCost) * 100 : 0;
  return { totalProjectCost, grossRevenue, grossProfit, grossMargin, roi, costPerSqWah, quickSellProfit, quickSellRoi };
}

export const PRESETS = {
  basic: {
    roadCostPerSqm: 400,
    electricityCostPerM: 1200,
    waterCostPerM: 600,
    fenceCostPerM: 350,
    gateCost: 80000,
    commonAreaCost: 100000,
    miscPct: 5,
  },
  standard: {
    roadCostPerSqm: 600,
    electricityCostPerM: 1500,
    waterCostPerM: 800,
    fenceCostPerM: 500,
    gateCost: 150000,
    commonAreaCost: 200000,
    miscPct: 10,
  },
  premium: {
    roadCostPerSqm: 900,
    electricityCostPerM: 2000,
    waterCostPerM: 1200,
    fenceCostPerM: 800,
    gateCost: 300000,
    commonAreaCost: 500000,
    miscPct: 15,
  },
};
