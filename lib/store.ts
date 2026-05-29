"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ProjectState, StepId, LandInput, LandAnalysis, DevCost, Financial, User, SavedProject } from "./types";
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
  login: (role: User['role'], name: string) => void;
  logout: () => void;
  saveProject: () => string;
  loadProject: (id: string) => void;
  deleteProject: (id: string) => void;
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      projectName: "โปรเจกต์ที่ดิน",
      currentStep: 1,
      landInput: DEFAULT_LAND_INPUT,
      landAnalysis: DEFAULT_LAND_ANALYSIS,
      devCost: DEFAULT_DEV_COST,
      financial: DEFAULT_FINANCIAL,
      user: null,
      savedProjects: [],

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
      login: (role, name) => set({ user: { role, name } }),
      logout: () => set({ user: null }),

      saveProject: () => {
        const s = get();
        const id = Date.now().toString();
        const entry: SavedProject = {
          id,
          savedAt: new Date().toISOString(),
          projectName: s.projectName,
          landInput: s.landInput,
          landAnalysis: s.landAnalysis,
          devCost: s.devCost,
          financial: s.financial,
        };
        set((s) => ({ savedProjects: [entry, ...s.savedProjects] }));
        return id;
      },

      loadProject: (id) => {
        const s = get();
        const p = s.savedProjects.find((p) => p.id === id);
        if (!p) return;
        set({
          projectName: p.projectName,
          landInput: p.landInput,
          landAnalysis: p.landAnalysis,
          devCost: p.devCost,
          financial: p.financial,
          currentStep: 1,
        });
      },

      deleteProject: (id) =>
        set((s) => ({ savedProjects: s.savedProjects.filter((p) => p.id !== id) })),
    }),
    { name: "landos-project" }
  )
);
