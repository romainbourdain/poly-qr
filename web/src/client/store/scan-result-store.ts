"use client";

import { create } from "zustand";
import type { ResultatScan } from "@/shared/lib/types";

interface ScanResultState {
  resultat: ResultatScan | null;
  setResultat(resultat: ResultatScan): void;
}

export const useScanResultStore = create<ScanResultState>()((set) => ({
  resultat: null,
  setResultat(resultat) {
    set({ resultat });
  },
}));
