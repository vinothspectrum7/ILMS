import { create } from 'zustand';

export const useShippingStore = create((set, get) => ({

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




    shippingTable: [],
    lotData: LOT_DATA,
    selectedItemForLotPopup: null,

    initShippingTable: () => {
        const existing = get().shippingTable;
        if (existing && existing.length > 0) return;

        set({
            shippingTable: SHIPPING_TABLE_DATA,
            lotData: LOT_DATA,
        });
    },

    setSelectedItemForLotPopup: (item) => {
        set({ selectedItemForLotPopup: item });
    },

    clearSelectedItemForLotPopup: () => {
        set({ selectedItemForLotPopup: null });
    },

    getLotsForItem: (itemCode) => {
        const { lotData } = get();
        return lotData.filter(lot => lot.itemCode === itemCode);
    },

    updateLotQuantity: (itemCode, lotNumber, newQuantity) => {
        set(state => ({
            lotData: state.lotData.map(lot =>
                lot.itemCode === itemCode && lot.lotNumber === lotNumber
                    ? { ...lot, qty: newQuantity }
                    : lot
            )
        }));
    },

    updatePickedLots: (deliveryId, itemCode, lotsPicked) => {
        const totalPicked = lotsPicked.reduce((sum, lot) => sum + (lot.pickedQty || 0), 0);

        set(state => ({
            shippingTable: state.shippingTable.map(row =>
                row.deliveryId === deliveryId
                    ? {
                        ...row,
                        pickedQuantity: totalPicked,
                        lotDetails: {
                            ...row.lotDetails,
                            [itemCode]: {
                                lots: lotsPicked,
                                totalPicked: totalPicked,
                                timestamp: new Date().toISOString()
                            }
                        }
                    }
                    : row
            )
        }));
    },


    mergePatchIntoShippingTable: patch => {
        if (!patch || !patch.deliveryId) return;

        const next = get().shippingTable.map(row =>
            String(row.deliveryId) === String(patch.deliveryId)
                ? {
                    ...row,
                    status: patch.status ?? row.status,
                    quantity: typeof patch.quantity === 'number'
                        ? patch.quantity
                        : row.quantity,
                    carrier: patch.carrier ?? row.carrier,
                    exception: patch.exception ?? row.exception,
                    organization: patch.organization ?? row.organization,
                    items: patch.items ?? row.items,
                    itemType: patch.itemType ?? row.itemType,
                    lotDetails: patch.lotDetails ?? row.lotDetails,
                    pickedQuantity: patch.pickedQuantity ?? row.pickedQuantity,
                }
                : row,
        );

        set({ shippingTable: next });
    },

    getShippingByDeliveryId: deliveryId =>
        get().shippingTable.find(
            row => String(row.deliveryId) === String(deliveryId),
        ),

    getTotalPickedQuantityForItem: (deliveryId, itemCode) => {
        const row = get().getShippingByDeliveryId(deliveryId);
        if (row && row.lotDetails && row.lotDetails[itemCode]) {
            return row.lotDetails[itemCode].totalPicked || 0;
        }
        return 0;
    },

    selectedLine: null,

    setSelectedLine: line =>
        set({
            selectedLine: line,
        }),

    updateLotDetailsForLine: (deliveryId, lotLines) =>
        set(state => ({
            shippingTable: state.shippingTable.map(row =>
                row.deliveryId === deliveryId
                    ? {
                        ...row,
                        lotLines,
                        pickedQuantity: lotLines.reduce(
                            (sum, l) => sum + Number(l.quantity || 0),
                            0,
                        ),
                    }
                    : row,
            ),
        })),

    resetShipping: () =>
        set({
            shippingTable: [],
            lotData: LOT_DATA,
            selectedItemForLotPopup: null,
        }),
}));
