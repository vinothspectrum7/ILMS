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
  setActiveTab: (tab) => set({ ActiveTab: tab }),
  setOrgData: (data) => set({ OrgData: data }),
  setInventoryList: (data) => set({ InventoryList: data }),
  getLocatorFromCache: (subInventoryId) => {
    return get().locatorCache[subInventoryId] || null;
  },
  getImageFromCache: (itemid) => {
    return get().imageCache[itemid] || null;
  },
    setImageInCache: (itemid, image) => {
    set((state) => ({
      imageCache: {
        ...state.imageCache,
        [itemid]: image,
      },
    }));
  },
  setLocatorInCache: (subInventoryId, locators) => {
    set((state) => ({
      locatorCache: {
        ...state.locatorCache,
        [subInventoryId]: locators,
      },
    }));
  },
  setLocatorList: (data) => set({ LocatorList: data }),

  receiveItems: [],
  initReceiveItems: (items) => set({ receiveItems: items }),
  mergePatchIntoReceiveItems: (patch) => {
    if (!patch || !patch.id) return;
    const next = get().receiveItems.map((it) =>
      String(it.id) === String(patch.id)
        ? {
            ...it,
            qtyToReceive:
              typeof patch.receivingQty === 'number'
                ? clampToOpen(patch.receivingQty, it.max_open_qty)
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
    const next = get().summaryItems.map((it) =>
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

  resetTab: () => set({ ActiveTab: null }),
    resetLocators: () =>
    set({
      locatorCache: null
    }),
  resetImage: () =>
    set({
      imageCache: null
    }),
  resetReceiving: () => set({ poHeader: null, receiveItems: [], summaryItems: [] }),

  asnHeader: null,
  setAsnHeader: (header) => set({ asnHeader: header }),
  asnSelectedLines: [],
  initAsnSelectedLines: (lines) => set({ asnSelectedLines: Array.isArray(lines) ? lines : [] }),
  updateAsnLine: (patch) => {
    if (!patch || !patch.id) return;
    const next = get().asnSelectedLines.map((it) =>
      String(it.id) === String(patch.id)
        ? { ...it, line: { ...it.line, ...patch.line } }
        : it
    );
    set({ asnSelectedLines: next });
  },

  asnSelectedPOIds: [],
  setAsnSelectedPOIds: (ids) =>
    set({ asnSelectedPOIds: Array.from(new Set((ids || []).map((x) => String(x)))) }),
  selectAsnPOId: (id) => {
    const cur = (get().asnSelectedPOIds || []).map(String);
    const nid = String(id);
    if (!cur.includes(nid)) set({ asnSelectedPOIds: [...cur, nid] });
  },
  unselectAsnPOId: (id) => {
    set({
      asnSelectedPOIds: (get().asnSelectedPOIds || []).map(String).filter((x) => x !== String(id)),
    });
  },

  asnPoEdits: {},
  setAsnEditedLinesForPO: (poId, lines) =>
    set((state) => ({
      asnPoEdits: { ...(state.asnPoEdits || {}), [String(poId)]: Array.isArray(lines) ? lines : [] },
    })),
  getAsnEditedLinesForPO: (poId) => {
    const map = get().asnPoEdits || {};
    return map[String(poId)] || [];
  },
  removeAsnEditedLinesForPO: (poId) =>
    set((state) => {
      const next = { ...(state.asnPoEdits || {}) };
      delete next[String(poId)];
      return { asnPoEdits: next };
    }),

  clearAsnFlow: () =>
    set({
      asnHeader: null,
      asnSelectedLines: [],
      asnSelectedPOIds: [],
      asnPoEdits: {},
    }),
}));
