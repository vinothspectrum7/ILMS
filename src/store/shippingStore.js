import { create } from 'zustand';

export const useShippingStore = create(set => ({
  selectedTransaction: null,
  pickItemsData: null,
  transactionStatusMap: {},
  shipConfirmPayload: null,

  setSelectedTransaction: payload => set({ selectedTransaction: payload }),

  setPickItemsData: payload => set({ pickItemsData: payload }),

  setTransactionStatus: (deliveryId, status) =>
    set(state => ({
      transactionStatusMap: {
        ...(state.transactionStatusMap || {}),
        [String(deliveryId)]: status,
      },
    })),

  setShipConfirmPayload: payload => set({ shipConfirmPayload: payload }),

  clearSelectedTransaction: () =>
    set({
      selectedTransaction: null,
      shipConfirmPayload: null,
    }),

  resetShippingStore: () =>
    set({
      selectedTransaction: null,
      pickItemsData: null,
      transactionStatusMap: {},
      shipConfirmPayload: null,
    }),
}));
