export interface LandInput {
  rai: number;
  ngan: number;
  sqWah: number;
  landPrice: number;
  acquisitionCost: number;
  appraisalValue: number;
  location: string;
  zoningCode: string;
  frontageWidth: number;
  landShape: "rectangular" | "irregular" | "corner" | "flag";
  legalConstraints: string;
}

export interface LandAnalysis {
  roadDeductionPct: number;
  lotSizeSqWah: number;
  // computed
  totalSqWah: number;
  roadAreaSqWah: number;
  usableAreaSqWah: number;
  lotCount: number;
  leftoverSqWah: number;
}

export interface DevCost {
  roadLengthM: number;
  roadWidthM: number;
  electricityLengthM: number;
  waterLengthM: number;
  fenceLengthM: number;
  hasGate: boolean;
  hasCommonArea: boolean;
  miscPct: number;
  preset: "basic" | "standard" | "premium";
  // unit rates
  roadCostPerSqm: number;
  electricityCostPerM: number;
  waterCostPerM: number;
  fenceCostPerM: number;
  gateCost: number;
  commonAreaCost: number;
  // computed
  roadCost: number;
  electricityCost: number;
  waterCost: number;
  fenceCost: number;
  miscCost: number;
  totalInfraCost: number;
}

export interface Financial {
  sellingPricePerSqWah: number;
  quickSellTotal: number;
  // computed
  totalProjectCost: number;
  grossRevenue: number;
  grossProfit: number;
  grossMargin: number;
  roi: number;
  costPerSqWah: number;
  quickSellProfit: number;
  quickSellRoi: number;
}

export type StepId = 1 | 2 | 3 | 4 | 5 | 6;

export interface User {
  role: 'admin' | 'landowner';
  name: string;
}

export interface SavedProject {
  id: string;
  savedAt: string;
  projectName: string;
  landInput: LandInput;
  landAnalysis: LandAnalysis;
  devCost: DevCost;
  financial: Financial;
}

export interface ProjectState {
  projectName: string;
  currentStep: StepId;
  landInput: LandInput;
  landAnalysis: LandAnalysis;
  devCost: DevCost;
  financial: Financial;
  user: User | null;
  savedProjects: SavedProject[];
}
