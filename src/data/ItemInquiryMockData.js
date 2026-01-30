export const Organization_Dropdown_Mock_Data = [
  { id: 1, name: 'Atlanta Distribution Center', code: 'WH001' },
  { id: 2, name: 'East Coast Distribution Center', code: 'WH002' },
  { id: 3, name: 'West Coast Hub', code: 'WH003' },
  { id: 4, name: 'Central Storage', code: 'WH004' },
]


export const Item_Inquiry_Mock_Data = [
  {
    itemHeader: {
      itemCode: 'ITEM-2024-001',
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

      stockSummary: {
        totalOnHand: 45,
        available: 38,
        reserved: 5,
        allocated: 7,
        inTransit: 12,
        onOrder: 20,
        viewDetailedLocationBreakdown: true,
      },

      stockStatus: {
        currentStock: 90,
        maxStock: 100,
        minStock: 10,
        reorderPoint: 20,
        inTransit: 12,
        onOrder: 20,
      },
    },

    organization: {
      desc: 'This item is assigned to 4 organization(s)',
      organizations: [
        {
          id: 1,
          organizationName: 'Atlanta Distribution Center',
          orgCode: 'ORG-001',
          status: 'Active',
          attributes: ['Purchasable', 'Stockable', 'Transactable'],
          leadTime: '15d',
          safetyStock: 10,
          minQuantity: 5,
          maxQuantity: 100,
          viewDetails: true,
        },
        {
          id: 2,
          organizationName: 'Atlanta Distribution Center',
          orgCode: 'ORG-001',
          status: ['Primary', 'Active'],
          attributes: ['Purchasable', 'Stockable', 'Transactable'],
          leadTime: '15d',
          safetyStock: 10,
          minQuantity: 5,
          maxQuantity: 100,
          viewDetails: true,
        },
        {
          id: 3,
          organizationName: 'Atlanta Distribution Center',
          orgCode: 'ORG-001',
          status: 'Active',
          attributes: ['Purchasable', 'Stockable', 'Transactable'],
          leadTime: '15d',
          safetyStock: 10,
          minQuantity: 5,
          maxQuantity: 100,
          viewDetails: true,
        },
        {
          id: 4,
          organizationName: 'Atlanta Distribution Center',
          orgCode: 'ORG-001',
          status: 'Active',
          attributes: ['Purchasable', 'Stockable', 'Transactable'],
          leadTime: '15d',
          safetyStock: 10,
          minQuantity: 5,
          maxQuantity: 100,
          viewDetails: true,
        },
      ],
    },

    transactions: {
      recentTransactions: [
        {
          id: 1,
          transactionType: 'PO Receipt',
          organizationCode: 'ORG-001',
          quantity: +10,
          transactionDate: '23 Dec 2025',
          location: 'A-01-01',
          status: 'Receipt',
        },
        {
          id: 2,
          transactionType: 'Sales Order Issue',
          organizationCode: 'ORG-001',
          quantity: -5,
          transactionDate: '23 Dec 2025',
          location: 'A-01-01',
          status: 'Issue',
        },
        {
          id: 3,
          transactionType: 'Sub-Inventory Transfer',
          organizationCode: 'ORG-001',
          quantity: +8,
          transactionDate: '23 Dec 2025',
          location: 'A-01-01',
          status: 'Transfer',
        },
        {
          id: 4,
          transactionType: 'Cycle Count Adjustment',
          organizationCode: 'ORG-001',
          quantity: +2,
          transactionDate: '23 Dec 2025',
          location: 'A-01-01',   
          status: 'Adjustment',
        },
      ],
    },

    itemdetails:{
      itemCode: '001',
      uom: 'Each',
      category: 'Electronics',
      description: 'Dell XPS 15 9530, Intel Core i7',
      Status: 'Active',
      lastUpdated: '23 Dec 2025, 14:30' 
    }
  },


   {
    itemHeader: {
      itemCode: 'ITEM-2024-002',
      itemName: 'Laptop Dell XPS 14',
      sku: 'SKU #12222',
      status: 'Active',
      attributes: ['Lot', 'Serial', 'Electronic'],
      organizationName: 'MiddleEast Distribution Center',
    },

    overview: {
      organizationInfo: {
        organizationName: 'MiddleEast Distribution Center',
        desc: 'All attributes shown below are specific to this organization',
      },

      itemInformation: {
        itemClass: 'Finished Super Goods',
        itemType: 'Standard',
        unitOfMeasure: 'Each',
        secondaryUOM: 'Box (9 EA)',
        revision: 'Rev 4.0',
        createdBy: 'Johnny',
        createdDate: '30 Jan 2024',
      },

      organizationAttributes: {
        purchasable: 'Purchasable',
        stockable: 'Stockable',
        transactable: 'Transactable',
        lotControlled: 'Lot Controlled',
        serialControlled: 'Serial Controlled',
        leadTime: 'Lead Time - 20 Days',
      },

      planningParameters: {
        safetyStock: 8,
        minOrderQuantity: 10,
        maxOrderQuantity: 100,
        selfLife: 850,
      },

      costInformation: {
        averageCost: '$1999.99',
        standardCost: '$1500.0',
        // currency: 'USD',
      },

      stockSummary: {
        totalOnHand: 50,
        available: 40,
        reserved: 8,
        allocated: 9,
        inTransit: 15,
        onOrder: 40,
        viewDetailedLocationBreakdown: true,
      },

      stockStatus: {
        currentStock: 100,
        maxStock: 100,
        minStock: 10,
        reorderPoint: 20,
        inTransit: 15,
        onOrder: 40,
      },
    },

    organization: {
      desc: 'This item is assigned to 2 organization(s)',
      organizations: [
        {
          id: 1,
          organizationName: 'MiddleEast Distribution Center',
          orgCode: 'ORG-002',
          status: 'Active',
          attributes: ['Purchasable', 'Stockable', 'Transactable'],
          leadTime: '15d',
          safetyStock: 10,
          minQuantity: 5,
          maxQuantity: 100,
          viewDetails: true,
        },
        {
          id: 2,
          organizationName: 'MiddleEast Distribution Center Distribution Center',
          orgCode: 'ORG-002',
          status: ['Primary', 'Active'],
          attributes: ['Purchasable', 'Stockable', 'Transactable'],
          leadTime: '15d',
          safetyStock: 10,
          minQuantity: 5,
          maxQuantity: 100,
          viewDetails: true,
        },
       
      ],
    },

    transactions: {
      recentTransactions: [
        {
          id: 1,
          transactionType: 'PO Receipt',
          organizationCode: 'ORG-001',
          quantity: +20,
          transactionDate: '23 Dec 2025',
          location: 'A-01-01',
          status: 'Receipt',
        },
        {
          id: 2,
          transactionType: 'Sales Order Issue',
          organizationCode: 'ORG-001',
          quantity: -10,
          transactionDate: '23 Dec 2025',
          location: 'A-01-01',
          status: 'Issue',
        },
        {
          id: 3,
          transactionType: 'Sub-Inventory Transfer',
          organizationCode: 'ORG-001',
          quantity: +6,
          transactionDate: '23 Dec 2025',
          location: 'A-01-01',
          status: 'Transfer',
        },
        {
          id: 4,
          transactionType: 'Cycle Count Adjustment',
          organizationCode: 'ORG-001',
          quantity: +7,
          transactionDate: '23 Dec 2025',
          location: 'A-01-01',   
          status: 'Adjustment',
        },
      ],
    },

    itemdetails:{
      itemCode: '002',
      uom: 'Each',
      category: 'Electronics',
      description: 'Dell XPS 15 9530, Intel Core i7',
      Status: 'Active',
      lastUpdated: '23 Dec 2025, 14:30' 
    }
  },
];


Item_OnHand_Mock_Data = {
  "Item": "Laptop Dell XPS 15",
  "ItemCode": "ITM-2024-001",
  "TotalOnHand": 45,
  "Organization": "Atlanta Distribution Center",
  "OrgCode": "ORG-001",
  "SummaryMetrics": {
    "TotalAvailable": 38,
    "TotalReserved": 5,
    "TotalAvailableToTransit": 40,
    "TotalAvailableToReserve": 38
  },
  "Locations": [
    {
      "Location": "Main Warehouse",
      "LocationCode": "LOC-001",
      "Available": 12,
      "Reserved": 5,
      "AvailableToTransit": 11,
      "AvailableToReserve": 12
    },
    {
      "Location": "Main Warehouse",
      "LocationCode": "LOC-001",
      "Available": 12,
      "Reserved": 5,
      "AvailableToTransit": 11,
      "AvailableToReserve": 12
    },
    {
      "Location": "Main Warehouse",
      "LocationCode": "LOC-001",
      "Available": 15,
      "Reserved": 0,
      "AvailableToTransit": 11,
      "AvailableToReserve": 12
    }
  ]
}