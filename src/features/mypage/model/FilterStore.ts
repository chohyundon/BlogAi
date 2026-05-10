import { create } from "zustand";

export interface FilterStore {
  selectedTemplateType: string;
  setSelectedTemplateType: (templateType: string) => void;
}

export const useFilterStore = create<FilterStore>((set) => ({
  selectedTemplateType: "전체",
  setSelectedTemplateType: (templateType: string) =>
    set({ selectedTemplateType: templateType }),
}));
