export const MOCK_ACTIVE_CYCLE_COUNT_LIST = [
    {
        id: '0001',
        count_name: 'Weekly Aisle 1 Count',
        cc_code: 'CC-AL1-001',
        sub_inventory: 'MAIN_WAREHOUSE',
        schedule_date: '2026-01-21',
        cc_status: 'Open',
        total_item_count: '2',
        completed_item_count: '0',
    },
    {
        id: '0002',
        count_name: 'High Value Items Count',
        cc_code: 'CC-HV-002',
        sub_inventory: 'SECURE_CAGE',
        schedule_date: '2026-01-22',
        cc_status: 'In Progress',
        total_item_count: '4',
        completed_item_count: '0',
    },
    {
        id: '0003',
        count_name: 'Fast Moving SKUs Count',
        cc_code: 'CC-FM-003',
        sub_inventory: 'PICK_FACE',
        schedule_date: '2026-01-23',
        cc_status: 'In Progress',
        total_item_count: '5',
        completed_item_count: '0',
    },
    {
        id: '0004',
        count_name: 'Quarterly Rack Audit',
        cc_code: 'CC-QR-004',
        sub_inventory: 'RACK_STORAGE',
        schedule_date: '2026-01-18',
        cc_status: 'Completed',
        total_item_count: '3',
        completed_item_count: '0',
    },
    {
        id: '0005',
        count_name: 'Receiving Bay Cycle Count',
        cc_code: 'CC-RB-005',
        sub_inventory: 'RECEIVING_BAY',
        schedule_date: '2026-01-20',
        cc_status: 'Open',
        total_item_count: '4',
        completed_item_count: '0',
    },
    {
        id: '0006',
        count_name: 'Damaged Goods Verification',
        cc_code: 'CC-DMG-006',
        sub_inventory: 'DAMAGED_AREA',
        schedule_date: '2026-01-19',
        cc_status: 'In Progress',
        total_item_count: '3',
        completed_item_count: '0',
    },
];

export const MOCK_ACTIVE_CYCLE_COUNT_DETAILS = [
    {
        id: '0001',
        count_name: 'Weekly Aisle 1 Count',
        cc_code: 'CC-AL1-001',
        sub_inventory: 'MAIN_WAREHOUSE',
        schedule_date: '2026-01-21',
        cc_status: 'Open',
        total_item_count: '2',
        completed_item_count: '0',
        items: [
            {
                item_id: 'ITEM-A1-001',
                item_code: 'ITM-100201',
                desc: 'Hex Bolt M8 x 30',
                expected_quantity: '120',
                counted_quantity: '',
                variance_detected: '',
                condition: '',
                photos: [],
                notes: '',
            },
            {
                item_id: 'ITEM-A1-002',
                item_code: 'ITM-100345',
                desc: 'Flat Washer M8',
                expected_quantity: '300',
                counted_quantity: '',
                variance_detected: '',
                condition: '',
                photos: [],
                notes: '',
            },
        ],
    },
    {
        id: '0002',
        count_name: 'High Value Items Count',
        cc_code: 'CC-HV-002',
        sub_inventory: 'SECURE_CAGE',
        schedule_date: '2026-01-22',
        cc_status: 'In Progress',
        total_item_count: '4',
        completed_item_count: '0',
        items: [
            {
                item_id: 'ITEM-HV-001',
                item_code: 'ITM-900011',
                desc: 'Industrial Sensor Module',
                expected_quantity: '14',
                counted_quantity: '',
                variance_detected: '',
                condition: '',
                photos: [],
                notes: '',
            },
            {
                item_id: 'ITEM-HV-002',
                item_code: 'ITM-900024',
                desc: 'Precision Encoder',
                expected_quantity: '8',
                counted_quantity: '',
                variance_detected: '',
                condition: '',
                photos: [],
                notes: '',
            },
            {
                item_id: 'ITEM-HV-003',
                item_code: 'ITM-900037',
                desc: 'Controller Board Assembly',
                expected_quantity: '5',
                counted_quantity: '',
                variance_detected: '',
                condition: '',
                photos: [],
                notes: '',
            },
            {
                item_id: 'ITEM-HV-004',
                item_code: 'ITM-900052',
                desc: 'Laser Range Module',
                expected_quantity: '3',
                counted_quantity: '',
                variance_detected: '',
                condition: '',
                photos: [],
                notes: '',
            },
        ],
    },
    {
        id: '0003',
        count_name: 'Fast Moving SKUs Count',
        cc_code: 'CC-FM-003',
        sub_inventory: 'PICK_FACE',
        schedule_date: '2026-01-23',
        cc_status: 'In Progress',
        total_item_count: '5',
        completed_item_count: '0',
        items: [
            {
                item_id: 'ITEM-FM-001',
                item_code: 'ITM-200101',
                desc: 'Packing Tape 48mm',
                expected_quantity: '75',
                counted_quantity: '',
                variance_detected: '',
                condition: '',
                photos: [],
                notes: '',
            },
            {
                item_id: 'ITEM-FM-002',
                item_code: 'ITM-200118',
                desc: 'Bubble Wrap Roll',
                expected_quantity: '22',
                counted_quantity: '',
                variance_detected: '',
                condition: '',
                photos: [],
                notes: '',
            },
            {
                item_id: 'ITEM-FM-003',
                item_code: 'ITM-200133',
                desc: 'Shipping Label 4x6',
                expected_quantity: '500',
                counted_quantity: '',
                variance_detected: '',
                condition: '',
                photos: [],
                notes: '',
            },
            {
                item_id: 'ITEM-FM-004',
                item_code: 'ITM-200149',
                desc: 'Carton Box Medium',
                expected_quantity: '60',
                counted_quantity: '',
                variance_detected: '',
                condition: '',
                photos: [],
                notes: '',
            },
            {
                item_id: 'ITEM-FM-005',
                item_code: 'ITM-200155',
                desc: 'Stretch Film 500mm',
                expected_quantity: '18',
                counted_quantity: '',
                variance_detected: '',
                condition: '',
                photos: [],
                notes: '',
            },
        ],
    },
    {
        id: '0004',
        count_name: 'Quarterly Rack Audit',
        cc_code: 'CC-QR-004',
        sub_inventory: 'RACK_STORAGE',
        schedule_date: '2026-01-18',
        cc_status: 'Completed',
        total_item_count: '3',
        completed_item_count: '0',
        items: [
            {
                item_id: 'ITEM-RK-001',
                item_code: 'ITM-300401',
                desc: 'Steel Bracket Set',
                expected_quantity: '48',
                counted_quantity: '',
                variance_detected: '',
                condition: '',
                photos: [],
                notes: '',
            },
            {
                item_id: 'ITEM-RK-002',
                item_code: 'ITM-300418',
                desc: 'Aluminium Profile 2m',
                expected_quantity: '16',
                counted_quantity: '',
                variance_detected: '',
                condition: '',
                photos: [],
                notes: '',
            },
            {
                item_id: 'ITEM-RK-003',
                item_code: 'ITM-300427',
                desc: 'Bearing Kit (Set of 4)',
                expected_quantity: '10',
                counted_quantity: '',
                variance_detected: '',
                condition: '',
                photos: [],
                notes: '',
            },
        ],
    },
    {
        id: '0005',
        count_name: 'Receiving Bay Cycle Count',
        cc_code: 'CC-RB-005',
        sub_inventory: 'RECEIVING_BAY',
        schedule_date: '2026-01-20',
        cc_status: 'Open',
        total_item_count: '4',
        completed_item_count: '0',
        items: [
            {
                item_id: 'ITEM-RB-001',
                item_code: 'ITM-410010',
                desc: 'Pallet Wrap Clear',
                expected_quantity: '25',
                counted_quantity: '',
                variance_detected: '',
                condition: '',
                photos: [],
                notes: '',
            },
            {
                item_id: 'ITEM-RB-002',
                item_code: 'ITM-410022',
                desc: 'Dock Plate Rubber',
                expected_quantity: '4',
                counted_quantity: '',
                variance_detected: '',
                condition: '',
                photos: [],
                notes: '',
            },
            {
                item_id: 'ITEM-RB-003',
                item_code: 'ITM-410031',
                desc: 'Pallet Wooden Standard',
                expected_quantity: '32',
                counted_quantity: '',
                variance_detected: '',
                condition: '',
                photos: [],
                notes: '',
            },
            {
                item_id: 'ITEM-RB-004',
                item_code: 'ITM-410047',
                desc: 'Corner Protector (Pack)',
                expected_quantity: '40',
                counted_quantity: '',
                variance_detected: '',
                condition: '',
                photos: [],
                notes: '',
            },
        ],
    },
    {
        id: '0006',
        count_name: 'Damaged Goods Verification',
        cc_code: 'CC-DMG-006',
        sub_inventory: 'DAMAGED_AREA',
        schedule_date: '2026-01-19',
        cc_status: 'In Progress',
        total_item_count: '3',
        completed_item_count: '0',
        items: [
            {
                item_id: 'ITEM-DM-001',
                item_code: 'ITM-510110',
                desc: 'Return Box Large',
                expected_quantity: '12',
                counted_quantity: '',
                variance_detected: '',
                condition: '',
                photos: [],
                notes: '',
            },
            {
                item_id: 'ITEM-DM-002',
                item_code: 'ITM-510128',
                desc: 'Damaged Label Sticker',
                expected_quantity: '200',
                counted_quantity: '',
                variance_detected: '',
                condition: '',
                photos: [],
                notes: '',
            },
            {
                item_id: 'ITEM-DM-003',
                item_code: 'ITM-510139',
                desc: 'Seal Bag (Pack of 50)',
                expected_quantity: '9',
                counted_quantity: '',
                variance_detected: '',
                condition: '',
                photos: [],
                notes: '',
            },
        ],
    },
];



export const MOCK_CYCLE_COUNT_HISTORY = [
  {
    id: 'HIS-0001',
    count_name: 'Q3 2024 - Full Count',
    sub_inventory: 'ALL_ZONES',
    location: 'Warehouse - Zone 1',
    completed_date: '2024-10-15',

    summary: {
      total_items: '458',
      items_matched: '446',
      total_variances: '12',
      accuracy_percentage: '97.4%',
      value_variance: '-$3,250',
      duration: '4.5 hrs'
    },

    variance_breakdown: {
      data_entry_error: '6',
      physical_count_error: '4',
      damaged_spoiled: '2'
    },

    top_total_variances: [
      { item_code: 'Item-045', variance: '-25 Units' },
      { item_code: 'Item-046', variance: '-30 Units' },
      { item_code: 'Item-047', variance: '-10 Units' },
      { item_code: 'Item-048', variance: '-15 Units' },
      { item_code: 'Item-049', variance: '-50 Units' },
      { item_code: 'Item-050', variance: '-5 Units' },
      { item_code: 'Item-051', variance: '-20 Units' },
      { item_code: 'Item-052', variance: '-15 Units' },
      { item_code: 'Item-053', variance: '-35 Units' },
      { item_code: 'Item-054', variance: '-10 Units' }
    ],

    cc_status: 'Completed',

    actions: {
      can_export: true,
      can_view_report: true,
    },
  },
  {
    id: 'HIS-0002',
    count_name: 'Q2 2024 - Full Count',
    sub_inventory: 'ALL_ZONES',
    location: 'Warehouse - Zone 2',
    completed_date: '2024-07-14',

    summary: {
      total_items: '612',
      items_matched: '603',
      total_variances: '9',
      accuracy_percentage: '98.5%',
      value_variance: '+$1,890',
      duration: '5.2 hrs'
    },

    variance_breakdown: {
      data_entry_error: '5',
      physical_count_error: '3',
      damaged_spoiled: '1'
    },

    top_total_variances: [
      { item_code: 'Item-101', variance: '-18 Units' },
      { item_code: 'Item-102', variance: '-22 Units' },
      { item_code: 'Item-103', variance: '-8 Units' },
      { item_code: 'Item-104', variance: '-12 Units' },
      { item_code: 'Item-105', variance: '+15 Units' },
      { item_code: 'Item-106', variance: '-5 Units' },
      { item_code: 'Item-107', variance: '-16 Units' },
      { item_code: 'Item-108', variance: '-10 Units' },
      { item_code: 'Item-109', variance: '-25 Units' },
      { item_code: 'Item-110', variance: '-7 Units' }
    ],

    cc_status: 'InProgress',

    actions: {
      can_export: true,
      can_view_report: true,
    },
  },
  {
    id: 'HIS-0003',
    count_name: 'Q1 2024 - Full Count',
    sub_inventory: 'ALL_ZONES',
    location: 'Warehouse - Zone 3',
    completed_date: '2024-04-12',

    summary: {
      total_items: '590',
      items_matched: '572',
      total_variances: '18',
      accuracy_percentage: '96.9%',
      value_variance: '-$4,820',
      duration: '6.1 hrs'
    },

    variance_breakdown: {
      data_entry_error: '9',
      physical_count_error: '6',
      damaged_spoiled: '3'
    },

    top_total_variances: [
      { item_code: 'Item-201', variance: '-35 Units' },
      { item_code: 'Item-202', variance: '-42 Units' },
      { item_code: 'Item-203', variance: '-15 Units' },
      { item_code: 'Item-204', variance: '-28 Units' },
      { item_code: 'Item-205', variance: '-60 Units' },
      { item_code: 'Item-206', variance: '-8 Units' },
      { item_code: 'Item-207', variance: '-32 Units' },
      { item_code: 'Item-208', variance: '-22 Units' },
      { item_code: 'Item-209', variance: '-45 Units' },
      { item_code: 'Item-210', variance: '-18 Units' }
    ],

    cc_status: 'Pending',

    actions: {
      can_export: true,
      can_view_report: true,
    },
  },
  {
    id: 'HIS-0004',
    count_name: 'December 2024 - Spot Check',
    sub_inventory: 'Main Storage',
    location: 'Warehouse - Zone 4',
    completed_date: '2024-12-05',

    summary: {
      total_items: '245',
      items_matched: '241',
      total_variances: '4',
      accuracy_percentage: '98.4%',
      value_variance: '-$1,250',
      duration: '2.3 hrs'
    },

    variance_breakdown: {
      data_entry_error: '2',
      physical_count_error: '1',
      damaged_spoiled: '1'
    },

    top_total_variances: [
      { item_code: 'Item-301', variance: '-12 Units' },
      { item_code: 'Item-302', variance: '-8 Units' },
      { item_code: 'Item-303', variance: '-5 Units' },
      { item_code: 'Item-304', variance: '+6 Units' },
      { item_code: 'Item-305', variance: '-3 Units' },
      { item_code: 'Item-306', variance: '-9 Units' },
      { item_code: 'Item-307', variance: '-7 Units' },
      { item_code: 'Item-308', variance: '-4 Units' },
      { item_code: 'Item-309', variance: '-10 Units' },
      { item_code: 'Item-310', variance: '-2 Units' }
    ],

    cc_status: 'Completed',

    actions: {
      can_export: true,
      can_view_report: true,
    },
  },
  {
    id: 'HIS-0005',
    count_name: 'November 2024 - Random Audit',
    sub_inventory: 'Fast-Moving Items',
    location: 'Warehouse - Zone A',
    completed_date: '2024-11-22',

    summary: {
      total_items: '189',
      items_matched: '183',
      total_variances: '6',
      accuracy_percentage: '96.8%',
      value_variance: '+$890',
      duration: '3.8 hrs'
    },

    variance_breakdown: {
      data_entry_error: '3',
      physical_count_error: '2',
      damaged_spoiled: '1'
    },

    top_total_variances: [
      { item_code: 'Item-401', variance: '+25 Units' },
      { item_code: 'Item-402', variance: '-18 Units' },
      { item_code: 'Item-403', variance: '+12 Units' },
      { item_code: 'Item-404', variance: '-15 Units' },
      { item_code: 'Item-405', variance: '-22 Units' },
      { item_code: 'Item-406', variance: '+8 Units' },
      { item_code: 'Item-407', variance: '-10 Units' },
      { item_code: 'Item-408', variance: '-14 Units' },
      { item_code: 'Item-409', variance: '+18 Units' },
      { item_code: 'Item-410', variance: '-9 Units' }
    ],

    cc_status: 'Completed',

    actions: {
      can_export: true,
      can_view_report: true,
    },
  },
  {
    id: 'HIS-0006',
    count_name: 'October 2024 - Category Count',
    sub_inventory: 'Electronics',
    location: 'Warehouse - Zone B',
    completed_date: '2024-10-30',

    summary: {
      total_items: '321',
      items_matched: '306',
      total_variances: '15',
      accuracy_percentage: '95.3%',
      value_variance: '-$5,640',
      duration: '5.7 hrs'
    },

    variance_breakdown: {
      data_entry_error: '8',
      physical_count_error: '5',
      damaged_spoiled: '2'
    },

    top_total_variances: [
      { item_code: 'Item-501', variance: '-45 Units' },
      { item_code: 'Item-502', variance: '-38 Units' },
      { item_code: 'Item-503', variance: '-52 Units' },
      { item_code: 'Item-504', variance: '-28 Units' },
      { item_code: 'Item-505', variance: '-65 Units' },
      { item_code: 'Item-506', variance: '-12 Units' },
      { item_code: 'Item-507', variance: '-42 Units' },
      { item_code: 'Item-508', variance: '-30 Units' },
      { item_code: 'Item-509', variance: '-55 Units' },
      { item_code: 'Item-510', variance: '-20 Units' }
    ],

    cc_status: 'InProgress',

    actions: {
      can_export: true,
      can_view_report: true,
    },
  },
];