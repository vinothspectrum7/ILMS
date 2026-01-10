import { create } from 'zustand';

export const useShippingStore = create(set => ({
  selectedTransaction: null,

  setSelectedTransaction: payload => set({ selectedTransaction: payload }),

  clearSelectedTransaction: () => set({ selectedTransaction: null }),
}));
