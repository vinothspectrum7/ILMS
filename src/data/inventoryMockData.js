export const MOCK_ITEMS = [
  {
    id: 'ITEM001',
    name: 'Item1',
    code: 'ITM001',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    controlType: 'None',
    availableStock: 120,
    availableUom: 'Each',
    openQty: 120,
  },
  {
    id: 'ITEM002',
    name: 'Item2',
    code: 'ITM002',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    controlType: 'None',
    availableStock: 80,
    availableUom: 'Each',
    openQty: 80,
  },
  {
    id: 'ITEM003',
    name: 'Item3',
    code: 'ITM908',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    controlType: 'Lot',
    availableStock: 56,
    availableUom: 'Each',
    openQty: 56,
  },
  {
    id: 'ITEM004',
    name: 'Item4',
    code: 'ITM004',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    controlType: 'Serial',
    availableStock: 30,
    availableUom: 'Each',
    openQty: 30,
  },
  {
    id: 'ITEM005',
    name: 'Item5',
    code: 'ITM005',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    controlType: 'Lot',
    availableStock: 200,
    availableUom: 'Each',
    openQty: 200,
  },
];

export const MOCK_SUB_INVENTORIES = [
  {
    id: 'SUB0001',
    name: 'FGI 1',
    code: 'SUB0001',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  },
  {
    id: 'SUB0002',
    name: 'FGI 2',
    code: 'SUB0002',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  },
  {
    id: 'SUB0003',
    name: 'FGI 3',
    code: 'SUB0003',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  },
  {
    id: 'SUB0004',
    name: 'FGI 4',
    code: 'SUB0004',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  },
  {
    id: 'SUB0005',
    name: 'FGI 5',
    code: 'SUB0005',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  },
];

export const MOCK_FROM_SUB_LIST = MOCK_SUB_INVENTORIES;
export const MOCK_TO_SUB_LIST = MOCK_SUB_INVENTORIES;

export const MOCK_LOCATORS = [
  {
    id: 'LOC0001',
    name: 'FGI 1',
    code: 'LOC0001',
    subInventoryId: 'SUB0001',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  },
  {
    id: 'LOC0002',
    name: 'FGI 2',
    code: 'LOC0002',
    subInventoryId: 'SUB0002',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  },
  {
    id: 'LOC0003',
    name: 'FGI 3',
    code: 'LOC0003',
    subInventoryId: 'SUB0003',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  },
  {
    id: 'LOC0004',
    name: 'FGI 4',
    code: 'LOC0004',
    subInventoryId: 'SUB0004',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  },
  {
    id: 'LOC0005',
    name: 'FGI 5',
    code: 'LOC0005',
    subInventoryId: 'SUB0005',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  },
];

export const MOCK_FROM_LOCATOR_LIST = MOCK_LOCATORS;
export const MOCK_TO_LOCATOR_LIST = MOCK_LOCATORS;

export const MOCK_UOMS = [
  {
    id: 'UOM001',
    name: 'Each',
    code: 'EA',
  },
  {
    id: 'UOM002',
    name: 'Piece',
    code: 'PC',
  },
  {
    id: 'UOM003',
    name: 'Box',
    code: 'BOX',
  },
];

export const MOCK_LOTS = [
  {
    id: 'LOT251113-528',
    name: 'LOT251113-528',
    code: 'LOT251113-528',
  },
  {
    id: 'LOT176356-379',
    name: 'LOT176356-379',
    code: 'LOT176356-379',
  },
  {
    id: 'LOT365807-977',
    name: 'LOT365807-977',
    code: 'LOT365807-977',
  },
];

export const MOCK_INVENTORY_DATA = {
  items: MOCK_ITEMS,
  fromSubs: MOCK_FROM_SUB_LIST,
  toSubs: MOCK_TO_SUB_LIST,
  fromLocators: MOCK_FROM_LOCATOR_LIST,
  toLocators: MOCK_TO_LOCATOR_LIST,
  uoms: MOCK_UOMS,
  lots: MOCK_LOTS,
};
