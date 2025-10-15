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
  setActiveTab: (tab) => set({ActiveTab:tab}),
  setOrgData: (data) => set({OrgData:data}),
  setInventoryList: (data) => set({InventoryList:data}),
    // cache helpers
  getLocatorFromCache: (subInventoryId) => {
    return get().locatorCache[subInventoryId] || null;
  },
  setLocatorInCache: (subInventoryId, locators) => {
    set((state) => ({
      locatorCache: {
        ...state.locatorCache,
        [subInventoryId]: locators,
      },
    }));
  },
    getImageFromCache: (itemid) => {
    return get().imageCache[itemid] || null;
  },
    setImageInCache: (itemid, locators) => {
    set((state) => ({
      imageCache: {
        ...state.imageCache,
        [itemid]: locators,
      },
    }));
  },
  setLocatorList: (data) => set({LocatorList:data}),

  receiveItems: [],
  initReceiveItems: (items) => set({ receiveItems: items }),
  mergePatchIntoReceiveItems: (patch) => {
    if (!patch || !patch.id) return;
    const next = get().receiveItems.map(it =>
      String(it.id) === String(patch.id)
        ? {
            ...it,
            qtyToReceive:
              typeof patch.receivingQty === 'number'
                ? clampToOpen(patch.receivingQty, it.openQty)
                : it.qtyToReceive,
            lpn: patch.lpn ?? it.lpn,
            subInventory: patch.subInventory ?? it.subInventory,
            locator: patch.locator ?? it.locator,
            imageUri: patch.imageUri ?? it.imageUri
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
            qtyToReceive:
              typeof patch.receivingQty === 'number'
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

      resetTab: () =>
    set({
      ActiveTab: null
    }),

  resetLocators: () =>
    set({
      locatorCache: null
    }),

  resetImage: () =>
    set({
      imageCache: null
    }),

  resetReceiving: () =>
    set({
      poHeader: null,
      receiveItems: [],
      summaryItems: [],
    }),
  // Store for Sub Inventory Transfer Payloads
  subInvTransferItems: [],
  addSubInvTransferItem: (item) =>
    set((state) => ({
      subInvTransferItems: [...state.subInvTransferItems, item],
    })),
  // Edit an existing item by index or item_id
editSubInvTransferItem: (updatedItem) =>
  set((state) => ({
    subInvTransferItems: state.subInvTransferItems.map((it) =>
      String(it.item_id) === String(updatedItem.item_id)
        ? { ...it, ...updatedItem }
        : it
    ),
  })),

  removeSubInvTransferItem: (index) =>
    set((state) => ({
      subInvTransferItems: state.subInvTransferItems.filter((_, i) => i !== index),
    })),

  resetSubInvTransfer: () => set({ subInvTransferItems: [] }),
}));
