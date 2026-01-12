import { create } from 'zustand';

export const useShippingStore = create(set => ({
  selectedTransaction: null,
  pickItemsData: null,
  transactionStatusMap: {},

  setSelectedTransaction: payload => set({ selectedTransaction: payload }),

  setPickItemsData: payload => set({ pickItemsData: payload }),

  setTransactionStatus: (deliveryId, status) =>
    set(state => ({
      transactionStatusMap: {
        ...(state.transactionStatusMap || {}),
        [String(deliveryId)]: status,
      },
    })),

  clearSelectedTransaction: () => set({ selectedTransaction: null }),

  resetShippingStore: () =>
    set({
      selectedTransaction: null,
      pickItemsData: null,
      transactionStatusMap: {},
    }),
}));
