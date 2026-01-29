export const Organization_Dropdown_Mock_Data = [
  { id: 1, name: 'Atlanta Distribution Center', code: 'WH001' },
  { id: 2, name: 'East Coast Distribution Center', code: 'WH002' },
  { id: 3, name: 'West Coast Hub', code: 'WH003' },
  { id: 4, name: 'Central Storage', code: 'WH004' },
]


export const Item_Inquiry_Mock_Data = [
  {
    itemHeader: {
      itemCode: 'ITM-2024-001',
      itemName: 'Laptop Dell XPS 15',
      sku: 'SKU #12345',
      status: 'Active',
      attributes: ['Lot', 'Serial', 'Electronic'],
      organizationName: 'Atlanta Distribution Center',
    },

    overview: {
      organizationInfo: {
        organizationName: 'Atlanta Distribution Center',
        desc: 'All attributes shown below are specific to this organization',
      },

      itemInformation: {
        itemClass: 'Finished Goods',
        itemType: 'Standard',
        unitOfMeasure: 'Each',
        secondaryUOM: 'Box (10 EA)',
        revision: 'Rev 3.0',
        createdBy: 'John Smith',
        createdDate: '15 Jan 2024',
      },

      organizationAttributes: {
        purchasable: 'Purchasable',
        stockable: 'Stockable',
        transactable: 'Transactable',
        lotControlled: 'Lot Controlled',
        serialControlled: 'Serial Controlled',
        leadTime: 'Lead Time - 15 Days',
      },

      planningParameters: {
        safetyStock: 10,
        minOrderQuantity: 5,
        maxOrderQuantity: 100,
        selfLife: 730,
      },

      costInformation: {
        averageCost: '$1299.99',
        standardCost: '$1350.0',
        // currency: 'USD',
      },
    },
  },
];
