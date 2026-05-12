"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ProjectState, StepId, LandInput, LandAnalysis, DevCost, Financial } from "./types";
import { PRESETS } from "./calculations";

const DEFAULT_LAND_INPUT: LandInput = {
  rai: 0, ngan: 0, sqWah: 0,
  landPrice: 0, acquisitionCost: 0, appraisalValue: 0,
  location: "", zoningCode: "", frontageWidth: 0,
  landShape: "rectangular", legalConstraints: "",
};

const DEFAULT_LAND_ANALYSIS: LandAnalysis = {
  roadDeductionPct: 15, lotSizeSqWah: 50,
  totalSqWah: 0, roadAreaSqWah: 0, usableAreaSqWah: 0,
  lotCount: 0, leftoverSqWah: 0,
};

const DEFAULT_DEV_COST: DevCost = {
  roadLengthM: 0, roadWidthM: 6,
  electricityLengthM: 0, waterLengthM: 0, fenceLengthM: 0,
  hasGate: true, hasCommonArea: false,
  preset: "standard",
  ...PRESETS.standard,
  roadCost: 0, electricityCost: 0, waterCost: 0,
  fenceCost: 0, miscCost: 0, totalInfraCost: 0,
};

const DEFAULT_FINANCIAL: Financial = {
  sellingPricePerSqWah: 0, quickSellTotal: 0,
  totalProjectCost: 0, grossRevenue: 0, grossProfit: 0,
  grossMargin: 0, roi: 0, costPerSqWah: 0,
  quickSellProfit: 0, quickSellRoi: 0,
};

interface Store extends ProjectState {
  setStep: (step: StepId) => void;
  setProjectName: (name: string) => void;
  updateLandInput: (data: Partial<LandInput>) => void;
  updateLandAnalysis: (data: Partial<LandAnalysis>) => void;
  updateDevCost: (data: Partial<DevCost>) => void;
  updateFinancial: (data: Partial<Financial>) => void;
  reset: () => void;
}

export const useStore = create<Store>()(
  persist(
    (set) => ({
      projectName: "โปรเจกต์ที่ดิน",
      currentStep: 1,
      landInput: DEFAULT_LAND_INPUT,
      landAnalysis: DEFAULT_LAND_ANALYSIS,
      devCost: DEFAULT_DEV_COST,
      financial: DEFAULT_FINANCIAL,

      setStep: (step) => set({ currentStep: step }),
      setProjectName: (name) => set({ projectName: name }),
      updateLandInput: (data) =>
        set((s) => ({ landInput: { ...s.landInput, ...data } })),
      updateLandAnalysis: (data) =>
        set((s) => ({ landAnalysis: { ...s.landAnalysis, ...data } })),
      updateDevCost: (data) =>
        set((s) => ({ devCost: { ...s.devCost, ...data } })),
      updateFinancial: (data) =>
        set((s) => ({ financial: { ...s.financial, ...data } })),
      reset: () =>
        set({
          projectName: "โปรเจกต์ที่ดิน",
          currentStep: 1,
          landInput: DEFAULT_LAND_INPUT,
          landAnalysis: DEFAULT_LAND_ANALYSIS,
          devCost: DEFAULT_DEV_COST,
          financial: DEFAULT_FINANCIAL,
        }),
    }),
    { name: "landos-project" }
  )
);
