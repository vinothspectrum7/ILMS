import { create } from 'zustand';

const clampToOpen = (qty, open) => {
  const o = Number(open ?? 0);
  const q = Number(qty ?? 0);
  if (!Number.isFinite(o) || o <= 0) return 0;
  if (!Number.isFinite(q) || q <= 0) return 0;
  return Math.min(q, o);
};

export const useReceivingStore = create((set, get) => ({
  poHeader: null,
  setPoHeader: (header) => set({ poHeader: header }),
  setOrgData: (data) => set({OrgData:data}),

  receiveItems: [],
  initReceiveItems: (items) => set({ receiveItems: items }),
  mergePatchIntoReceiveItems: (patch) => {
    if (!patch || !patch.id) return;
    const next = get().receiveItems.map(it =>
      String(it.id) === String(patch.id)
        ? {
            ...it,
            qtyToReceive: typeof patch.receivingQty === 'number'
              ? clampToOpen(patch.receivingQty, it.openQty)
              : it.qtyToReceive,
            lpn: patch.lpn ?? it.lpn,
            subInventory: patch.subInventory ?? it.subInventory,
            locator: patch.locator ?? it.locator,
          }
        : it
    );
    set({ receiveItems: next });
  },

  summaryItems: [],
  initSummaryItems: (items) => set({ summaryItems: items }),
  mergePatchIntoSummaryItems: (patch) => {
    if (!patch || !patch.id) return;
    const next = get().summaryItems.map(it =>
      String(it.id) === String(patch.id)
        ? {
            ...it,
            qtyToReceive: typeof patch.receivingQty === 'number'
              ? clampToOpen(patch.receivingQty, it.openQty)
              : it.qtyToReceive,
            lpn: patch.lpn ?? it.lpn,
            subInventory: patch.subInventory ?? it.subInventory,
            locator: patch.locator ?? it.locator,
          }
        : it
    );
    set({ summaryItems: next });
  },

  resetReceiving: () =>
    set({
      poHeader: null,
      receiveItems: [],
      summaryItems: [],
    }),
}));
