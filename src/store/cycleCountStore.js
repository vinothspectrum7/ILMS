import { create } from 'zustand';

export const useCycleCountStore = create((set, get) => ({
  selectedList: null,

  cycleCount: {
    selectedListItemDetails: [],
    countProgressMap: {},
    createdSchedules: [], 
  },

  setSelectedList: (payload) => {
    set({ selectedList: payload });
  },

  setSelectedListItemDetails: (items) => {
    set(state => ({
      cycleCount: {
        ...state.cycleCount,
        selectedListItemDetails: Array.isArray(items) ? items : [items],
      },
    }));
  },

  mergeSelectedListItemDetails: (payload) =>
    set(state => {
      const existingItems = state.cycleCount.selectedListItemDetails || [];
      const idx = existingItems.findIndex(i => i.itemId === payload.itemId);

      const updatedItems =
        idx >= 0
          ? existingItems.map((i, index) =>
              index === idx ? { ...i, ...payload } : i
            )
          : [...existingItems, payload];

      return {
        cycleCount: {
          ...state.cycleCount,
          selectedListItemDetails: updatedItems,
        },
      };
    }),

  addCreatedSchedule: (payload) => {
    console.log('Schedule Payload (Store):', payload);

    set(state => ({
      cycleCount: {
        ...state.cycleCount,
        createdSchedules: [
          ...state.cycleCount.createdSchedules,
          payload,
        ],
      },
    }));
  },

  saveCountProgress: (countId, totalItems) => {
    const items = get().cycleCount.selectedListItemDetails;

    const completedItems = items.filter(
      i => (i.countedQty > 0 || i.counted_quantity > 0) && i.selectedCondition
    ).length;

    const percent = totalItems
      ? Math.round((completedItems / totalItems) * 100)
      : 0;

    set(state => ({
      cycleCount: {
        ...state.cycleCount,
        countProgressMap: {
          ...state.cycleCount.countProgressMap,
          [countId]: {
            completed: completedItems,
            total: totalItems,
            percent,
            status:
              completedItems === totalItems
                ? 'Completed'
                : completedItems > 0
                ? 'In Progress'
                : 'Open',
          },
        },
      },
    }));
  },

  resetStore: () => {
    set({
      selectedList: null,
      cycleCount: {
        selectedListItemDetails: [],
        countProgressMap: {},
        createdSchedules: [],
      },
    });
  },

  clearCycleCountData: () => {
    set(state => ({
      cycleCount: {
        selectedListItemDetails: [],
        countProgressMap: {},
        createdSchedules: [],
      },
    }));
  },
}));
