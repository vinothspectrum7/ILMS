import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Modal,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Inv_HeaderComponent from '../../components/inventory/Inv_HeaderComponent';
import FooterButtonsComponent from '../../components/FooterButtonsComponent';
import SingleFooterBtnComponent from '../../components/SingleFooterBtnComponent';
import Inv_Dropdown from '../../components/inventory/Inv_Dropdown';
import Inv_CustomNumericInput from '../../components/inventory/Inv_CustomNumericInput';
import Inv_LotModalPopup from '../../components/inventory/Inv_LotModalPopup';
import BarcodeScanner from '../../screens/BarCodeScanner';
import {
  MOCK_ITEMS,
  MOCK_SUB_INVENTORIES,
  MOCK_LOCATORS,
  MOCK_UOMS,
} from '../../data/inventoryMockData';
import { useReceivingStore } from '../../store/receivingStore';
import ConfirmSubInventoryIcon from '../../assets/icons/confirmsubinventory.svg';
import InventorySuccessIcon from '../../assets/icons/inventorysuccess.svg';
import Inv_SerialModalPopup from '../../components/inventory/Inv_SerialModalPopup';
import Inv_LotSerialModalPopup from '../../components/inventory/Inv_LotSerialModalPopup';
import RadioGlossySelected from "../../assets/icons/RadioGlossySelected.svg";
import RadioGlossyUnselected from "../../assets/icons/RadioGlossyUnselected.svg";
import Toast from 'react-native-toast-message';
import { colors } from '../../theme/colors';
import { GetAvailableItemStockData, GetAvailableLocatorStockData, GetAvailableStockData, GetFromLocatorsData, GetFROMSubInvData, GetOrgsData, GetSubInvItemList, GetTOLocatorData, GetTOSubInvData } from '../../api/ApiServices';

const { width: SCREEN_WIDTH } = require('react-native').Dimensions.get('window');
const BASE_WIDTH = 375;
const rs = v => (SCREEN_WIDTH / BASE_WIDTH) * v;

export default function Inv_Adjustment_Add() {
  const navigation = useNavigation();
  const route = useRoute();
  const editIndex = route.params?.editIndex ?? null;
  const isAddMore = route.params?.isAddMore === true;

  const {
    OrgData,
    InvAdjustmentItems,
    addInvAdjustmentItem,
    editInvAdjustmentItem,
  } = useReceivingStore();

  const [initialStoreCount] = useState(InvAdjustmentItems.length);

  const showCartForHeader = isAddMore || initialStoreCount > 0;
  const useSingleFooter = isAddMore || initialStoreCount > 0;

  const existingItem = editIndex != null ? InvAdjustmentItems[editIndex] : null;

  const [adjustType, setAdjustType] = useState("Issue");
  const [selectedItem, setSelectedItem] = useState(existingItem?.item || null);
  const [fromSub, setFromSub] = useState(existingItem?.fromSub || null);
  const [fromLocator, setFromLocator] = useState(existingItem?.fromLocator || null);
  const [toSub, setToSub] = useState(existingItem?.toSub || null);
  const [toLocator, setToLocator] = useState(existingItem?.toLocator || null);
  const [uom, setUom] = useState(existingItem?.uom || null);
  const [qty, setQty] = useState(existingItem?.qty || 0);
  const [notes, setNotes] = useState(existingItem?.notes || '');
  // const [lotStatus, setLotStatus] = useState(existingItem?.lotStatus || null);
  const [status, setStatus] = useState(
  controlType === 'Lot'
    ? existingItem?.lotStatus || null
    :controlType === 'Serial'
    ? existingItem?.serialStatus || null:existingItem?.lotSerialStatus || null
);

  const [lotModalVisible, setLotModalVisible] = useState(false);
  const [serialModalVisible, setserialModalVisible] = useState(false);
  const [lotserialModalVisible, setLotserialModalVisible] = useState(false);
  const [persistedIndex, setPersistedIndex] = useState(editIndex);
  const [scannerVisible, setScannerVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [controlType,setControlType] = useState(null);
  const [SubInvItemList,setSubInvItemList] = useState([]);
  const [FromSubInvList,setFromSubInvList] = useState([]);
  const [TOSubInvList,setTOSubInvList] = useState([]);
  const [FromLocatorList,setFromLocatorList] = useState([]);
  const [UOMList,setUOMList] = useState([]);
  const [ToLocatorList,setToLocatorList] = useState([]);
  const [StockLoader,setStockLoader] = useState(false);
  const [AvailableData, setAvailableData] = useState(null);


  const itemAvailableQty = AvailableData?.availableStock ?? 0;

  const baseLineLabel = useMemo(() => {
    const idx = persistedIndex != null ? persistedIndex : InvAdjustmentItems.length;
    return `Line ${idx + 1}`;
  }, [persistedIndex, InvAdjustmentItems.length]);

    useEffect(()=>{
      if(!selectedItem) return;
        const loadFromSubInvData = async () => {
          try {
            const fromsubinvdata = await GetFROMSubInvData(useReceivingStore.getState()?.OrgData?.selectedOrgCode || OrgData?.selectedOrgCode,selectedItem?.code);
            if (fromsubinvdata) {
              const fromSubInvList = mapfromsubInvlist(fromsubinvdata);
              setFromSubInvList(fromSubInvList);
            } else {
              setFromSubInvList([]);
            }
          } catch (err) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load FromSubInv. Please try again.', position: 'top', visibilityTime: 5000 });
          }
        };
  
        const loadAvailablestockData = async () => {
          try {
            setStockLoader(true);
            const availableStock = await GetAvailableItemStockData(useReceivingStore.getState()?.OrgData?.selectedOrgCode || OrgData?.selectedOrgCode,selectedItem?.code);
            if (availableStock) {
              console.log(availableStock,"availableStock")
              const availableStockList = mapavailableStockList(availableStock);
              console.log(availableStockList,"availableStockListavailableStockList")
              setControlType(availableStockList?.[0].controlType);
              setAvailableData(availableStockList?.[0]);
              setStockLoader(false);
            } else {
              setAvailableData([]);
              setStockLoader(false);
            }
          } catch (err) {
            setStockLoader(false);
            Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load availableStock. Please try again.', position: 'top', visibilityTime: 5000 });
          }
        };
  
        loadAvailablestockData();
        loadFromSubInvData();
  
    },[selectedItem]);
  
      useEffect(()=>{
      if(!selectedItem || !fromSub) return;
  
        const loadAvailablestockData = async () => {
          try {
            setStockLoader(true);
            const availableStock = await GetAvailableStockData(useReceivingStore.getState()?.OrgData?.selectedOrgCode || OrgData?.selectedOrgCode,selectedItem?.code,fromSub?.code);
            if (availableStock) {
              console.log(availableStock,"availableStock")
              const availableStockList = mapavailableStockList(availableStock);
              console.log(availableStockList,"availableStockListavailableStockList")
              setControlType(availableStockList?.[0].controlType);
              setAvailableData(availableStockList?.[0]);
              setStockLoader(false);
            } else {
              setAvailableData([]);
              setStockLoader(false);
            }
          } catch (err) {
            setStockLoader(false);
            Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load availableStock. Please try again.', position: 'top', visibilityTime: 5000 });
          }
        };
        const loadFromLocatorData = async () => {
          try {
            const fromlocatordata = await GetFromLocatorsData(useReceivingStore.getState()?.OrgData?.selectedOrgCode || OrgData?.selectedOrgCode,selectedItem?.code,fromSub?.code);
            if (fromlocatordata) {
              const fromlocatorList = maptoLocatorlist(fromlocatordata);
              setFromLocatorList(fromlocatorList);
            } else {
              setFromLocatorList([]);
            }
          } catch (err) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load FromLocator. Please try again.', position: 'top', visibilityTime: 5000 });
          }
        };
        loadFromLocatorData();
        loadAvailablestockData();
  
    },[selectedItem,fromSub]);
  
      useEffect(()=>{
      if(!selectedItem || !fromSub || !fromLocator) return;
        const loadAvailablestockData = async () => {
          try {
            console.log(fromLocator,"fromlocaadreref")
            setStockLoader(true);
            const availableStock = await GetAvailableLocatorStockData(useReceivingStore.getState()?.OrgData?.selectedOrgCode || OrgData?.selectedOrgCode,selectedItem?.code,fromSub?.code,fromLocator?.code);
            if (availableStock) {
              console.log(availableStock,"availableStocklocator");
              const availableUOMList = MapUOMList(availableStock);
              setUOMList(availableUOMList);
              setUom(availableUOMList?.[0]);
              setAvailableData(prev => ({
                  ...prev,
                  availableStock: availableStock?.[0]?.locator_total_qty ?? prev?.availableStock,
                  availableUom: availableStock?.[0]?.uom ?? null,
                }));
              setStockLoader(false);
            } else {
              setAvailableData([]);
              setStockLoader(false);
            }
          } catch (err) {
            setStockLoader(false);
            Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load availableStock. Please try again.', position: 'top', visibilityTime: 5000 });
          }
        };
        loadAvailablestockData();
  
    },[selectedItem,fromSub,fromLocator]);
  
      useEffect(()=>{
      if(!toSub) return;
  
        const loadToLocatorData = async () => {
          try {
            const toLocatordata = await GetTOLocatorData(useReceivingStore.getState()?.OrgData?.selectedOrgCode || OrgData?.selectedOrgCode,toSub?.code);
            if (toLocatordata) {
              const toLocatorLists = maptoLocatorlist(toLocatordata);
              setToLocatorList(toLocatorLists);
            } else {
              setToLocatorList([]);
            }
          } catch (err) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load FromSubInv. Please try again.', position: 'top', visibilityTime: 5000 });
          }
        };
        loadToLocatorData();
  
    },[toSub]);
  
    const mapsubInvitemlist = data =>
      data.map(element => ({
      id: element.R_INV_ITEM_CODE,
      name: element.R_INV_ITEM_CODE,
      code: element.R_INV_ITEM_CODE,
      // description:
      //   'Lorem ipsum dolor sit amet.',
      // controlType: 'Lot',
      // availableStock: 120,
      // availableUom: 'Each',
      // openQty: 120,
      }));
  
    const mapfromsubInvlist = data =>
      data.map(element => ({
      id: element.subinv_type,
      name: element.subinv_type,
      code: element.subinv_type,
      }));
  
    const maptoLocatorlist = data =>
      data.map(element => ({
      id: element.locator,
      name: element.locator,
      code: element.locator,
      }));
    const maptosubInvlist = data =>
      data.map(element => ({
      id: element.sub_inv,
      name: element.sub_inv,
      code: element.sub_inv,
      }));
    const mapavailableStockList = data =>
      data.map(element => ({
      availableUom:null,
      availableStock: element?.Total_available_qty??element?.available_qty ?? 0,
      code: element.item_code,
      controlType: element.control_type ?? 'Lot'
      // description:
      //   'Lorem ipsum dolor sit amet.',
      // controlType: 'Lot',
      // availableStock: 120,
      // availableUom: 'Each',
      // openQty: 120,
      }));
  
    const MapUOMList = data =>
      data.map(element => ({
      id: element.uom,
      name: element.uom,
      code: element.uom,
      // description:
      //   'Lorem ipsum dolor sit amet.',
      // controlType: 'Lot',
      // availableStock: 120,
      // availableUom: 'Each',
      // openQty: 120,
      }));
  
    useEffect(() => {
        const loadSubInvItemData = async () => {
          try {
            const subinvdata = await GetSubInvItemList(useReceivingStore.getState()?.OrgData?.selectedOrgCode || OrgData?.selectedOrgCode);
            if (subinvdata) {
              const SubInvItemList = mapsubInvitemlist(subinvdata);
              setSubInvItemList(SubInvItemList);
            } else {
              setSubInvItemList([]);
            }
          } catch (err) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load SubInvItems. Please try again.', position: 'top', visibilityTime: 5000 });
          }
        };
        const loadToSubInvData = async () => {
          try {
            const tosubinvdata = await GetTOSubInvData(useReceivingStore.getState()?.OrgData?.selectedOrgCode || OrgData?.selectedOrgCode);
            if (tosubinvdata) {
              const toSubInvList = maptosubInvlist(tosubinvdata);
              setTOSubInvList(toSubInvList);
            } else {
              setTOSubInvList([]);
            }
          } catch (err) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load FromSubInv. Please try again.', position: 'top', visibilityTime: 5000 });
          }
        };
        loadToSubInvData();
        loadSubInvItemData();
      }, []);

const handlePersistMainLine = () => {
  let existingLots = [];
  let existingSerials = [];
  let existingLotSerials = [];

  if (controlType === 'Lot') {
    existingLots =
      persistedIndex != null
        ? InvAdjustmentItems[persistedIndex]?.lots || []
        : existingItem?.lots || [];
  }

  if (controlType === 'Serial') {
    existingSerials =
      persistedIndex != null
        ? InvAdjustmentItems[persistedIndex]?.serials || []
        : existingItem?.serials || [];
  }

  if (controlType === 'Lot+Serial') {
    existingLotSerials =
      persistedIndex != null
        ? InvAdjustmentItems[persistedIndex]?.lotSerials || []
        : existingItem?.lotSerials || [];
  }

  const payload = {
    item: selectedItem,
    fromSub,
    fromLocator,
    toSub,
    toLocator,
    uom,
    qty,
    notes,
    status,
    adjustType,
    ...(controlType === 'Lot' && { lots: existingLots }),
    ...(controlType === 'Serial' && { serials: existingSerials }),
    ...(controlType === 'Lot+Serial' && { lotSerials: existingLotSerials }),
  };
  if (persistedIndex != null) {
    editInvAdjustmentItem(payload, persistedIndex);
    return persistedIndex;
  }

  addInvAdjustmentItem(payload);
  const newIndex = InvAdjustmentItems.length;
  setPersistedIndex(newIndex);
  return newIndex;
};



const lineValid =
  !!selectedItem &&
  !!uom &&
  qty > 0 &&
  (adjustType === 'Issue'
    ? !!fromSub && !!fromLocator
    : !!toSub && !!toLocator);


  const qtyExceeds = !!selectedItem && qty > itemAvailableQty;


  const canUseFooterButtons = lineValid;

  const currentLots =
    persistedIndex != null
      ? InvAdjustmentItems[persistedIndex]?.lots || []
      : [];
  const currentSerials =
    persistedIndex != null
      ? InvAdjustmentItems[persistedIndex]?.serials || []
      : [];
    const currentLotSerials =
    persistedIndex != null
      ? InvAdjustmentItems[persistedIndex]?.lotSerials || []
      : [];

  const handleOpenLotModal = () => {
    const idx = handlePersistMainLine();
    setPersistedIndex(idx);
    setLotModalVisible(true);
  };

  const handleOpenSerialModal = () => {
    const idx = handlePersistMainLine();
    setPersistedIndex(idx);
    setserialModalVisible(true);
  };

  const handleOpenLotSerialModal = () => {
    const idx = handlePersistMainLine();
    setPersistedIndex(idx);
    setLotserialModalVisible(true);
  };

  const handleSaveLots = (lots, totalQty) => {
    if (persistedIndex == null) return;
    const updated = {
      item: selectedItem,
      fromSub,
      fromLocator,
      toSub,
      toLocator,
      uom,
      qty,
      notes,
      lots,
      controlType,
      lotStatus: {
        count: lots.length,
        totalQty,
      },
    };
    editInvAdjustmentItem(updated, persistedIndex);
    setStatus({ count: lots.length, totalQty });
  };

  const handleSaveSerials = (serials, totalQty) => {
    if (persistedIndex == null) return;
    const updated = {
      item: selectedItem,
      fromSub,
      fromLocator,
      toSub,
      toLocator,
      uom,
      qty,
      notes,
      serials,
      controlType,
      serialStatus: {
        count: serials.length,
        totalQty,
      },
    };
    editInvAdjustmentItem(updated, persistedIndex);
    setStatus({ count: serials.length, totalQty });
    setserialModalVisible(false);
  };

  const handleSaveLotSerials = (lotSerials, totalQty,meta) => {
    if (persistedIndex == null) return;
    const updated = {
      item: selectedItem,
      fromSub,
      fromLocator,
      toSub,
      toLocator,
      uom,
      qty,
      notes,
      lotSerials,
      controlType,
      lotSerialStatus: {
        count: lotSerials.length,
        totalQty,
      },
    };
    editInvAdjustmentItem(updated, persistedIndex);
    setStatus({ count: lotSerials.length, totalQty });
    setLotserialModalVisible(false);
  };

  const handleAdd = () => {
    if (!canUseFooterButtons) return;
    handlePersistMainLine();
    navigation.navigate('Inv_Adj_SummaryScreen');
  };

    const renderRadio = (label) => {
    const selected = adjustType === label;
    const Icon = selected ? RadioGlossySelected : RadioGlossyUnselected;
    return (
      <TouchableOpacity
          style={[
    styles.radioRow,
    isAddMore && styles.disabledRow
  ]}
        onPress={() => {
          setAdjustType(label);
          // if (label === "Issue") resetReceipt();
          // else resetIssue();

          // resetSubInvTransfer();
        }}
        disabled={isAddMore}
      >
        <Icon width={rs(20)} height={rs(20)} />
        <Text     
        style={[
      styles.radioText,
      isAddMore && styles.disabledText
    ]}>{label}</Text>
      </TouchableOpacity>
    );
  };

  const handleTransfer = () => {
    if (!canUseFooterButtons) return;
    handlePersistMainLine();
    setConfirmVisible(true);
  };

  const handleConfirmTransfer = () => {
    setConfirmVisible(false);
    setSuccessVisible(true);
    setTimeout(() => {
      setSuccessVisible(false);
      navigation.navigate('Inventory');
    }, 1500);
  };

  const handleBarcodePress = () => {
    setScannerVisible(true);
  };

  const handleBarcodeScanned = codeString => {
    const scanned = String(codeString || '').trim().toLowerCase();
    if (!scanned) {
      setScannerVisible(false);
      return;
    }

    const matchedItem =
      SubInvItemList.find(
        it => String(it.code || '').trim().toLowerCase() === scanned,
      ) || null;

    if (!matchedItem) {
      setScannerVisible(false);
      return;
    }

    setSelectedItem(matchedItem);
    const maxQty = AvailableData?.availableStock ?? 0;
    if (qty > maxQty) {
      setQty(maxQty);
    }
    setScannerVisible(false);
  };

  if (scannerVisible) {
    return (
      <BarcodeScanner
        onScan={handleBarcodeScanned}
        onClose={() => setScannerVisible(false)}
      />
    );
  }

  return (
    <View style={styles.root}>
      <Inv_HeaderComponent
        organizationName={OrgData?.selectedOrgCode || 'EnnVee'}
        screenTitle="Inventory Adjustments"
        onBack={() => navigation.goBack()}
        showCartIcon={showCartForHeader}
        cartCount={InvAdjustmentItems.length}
        onCartPress={() => navigation.navigate('Inv_Adj_SummaryScreen')}
      />
      <View style={styles.adjustTypeRow}>
        <Text style={styles.adjustLabel}>Select Adjustment Type</Text>
      <View style={styles.radioGroup}>
          {renderRadio("Issue")}
          {renderRadio("Receipt")}
        </View>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: rs(120) }}
        keyboardShouldPersistTaps="handled"
      >
        {qtyExceeds && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>
              Insufficient Stock: Quantity exceeds available stock
            </Text>
          </View>
        )}

        <View style={styles.cardWrapper}>
          <View style={styles.lineBadgeFloating}>
            <View style={styles.lineBadge}>
              <Text style={styles.lineBadgeText}>{baseLineLabel}</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Inv_Dropdown
              label="Select Item"
              required
              value={selectedItem}
              onChange={item => {
                setSelectedItem(item);
                // if (item && qty > item.openQty) {
                //   setQty(item.openQty);
                // }
                // setControlType(item.controlType);
              }}
              items={SubInvItemList}
              displayValue={it => it.name}
              renderCode={it => it.code}
              showBarcodeIcon
              onBarcodePress={handleBarcodePress}
            />

          {StockLoader ? (
            <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 30 }}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
           ) :( 
            AvailableData ? (
              <View style={styles.itemInfoStrip}>
                <View style={styles.infoCol}>
                  <Text style={styles.infoLabel}>Available Stock</Text>
                  <Text style={styles.infoValue}>
                    {AvailableData.availableStock} {AvailableData.availableUom}
                  </Text>
                </View>
                <View style={styles.infoCol}>
                  <Text style={styles.infoLabel}>Item Code</Text>
                  <Text style={styles.infoValue}>{AvailableData.code}</Text>
                </View>
                <View style={styles.infoCol}>
                  <Text style={styles.infoLabel}>Control Type</Text>
                  <Text style={styles.infoValue}>{AvailableData.controlType}</Text>
                </View>
              </View>
            ) : null
           )}

            {adjustType =="Issue" && (<View style={styles.rowSplit}>
              <View style={styles.colHalf}>
                <Inv_Dropdown
                  label="From Sub"
                  required
                  value={fromSub}
                  onChange={it => {
                    setFromSub(it);
                    setFromLocator(null);
                  }}
                  items={FromSubInvList}
                  displayValue={it => it.name}
                  renderCode={it => it.code}
                />
              </View>
              {fromSub ? (
                <View style={styles.colHalf}>
                  <Inv_Dropdown
                    label="From Locator"
                    required
                    value={fromLocator}
                    onChange={setFromLocator}
                    items={FromLocatorList}
                    displayValue={it => it.name}
                    renderCode={it => it.code}
                  />
                </View>
              ) : null}
            </View>)}

            {adjustType =="Receipt"&&(<View style={styles.rowSplit}>
              <View style={styles.colHalf}>
                <Inv_Dropdown
                  label="To Sub"
                  required
                  value={toSub}
                  onChange={it => {
                    setToSub(it);
                    setToLocator(null);
                  }}
                  items={TOSubInvList}
                  displayValue={it => it.name}
                  renderCode={it => it.code}
                />
              </View>
              {toSub ? (
                <View style={styles.colHalf}>
                  <Inv_Dropdown
                    label="To Locator"
                    required
                    value={toLocator}
                    onChange={setToLocator}
                    items={ToLocatorList}
                    displayValue={it => it.name}
                    renderCode={it => it.code}
                  />
                </View>
              ) : null}
            </View>)}

            <View style={styles.rowSplit}>
              <View style={styles.colHalf}>
                <Inv_Dropdown
                  label="Select UOM"
                  required
                  value={uom}
                  onChange={setUom}
                  items={UOMList}
                  displayValue={it => it.name}
                  renderCode={it => it.code}
                />
              </View>
              <View style={styles.colHalf}>
                <Text style={styles.fieldLabel}>
                  Select QTY<Text style={styles.required}>*</Text>
                </Text>
                <Inv_CustomNumericInput
                  value={qty}
                  setValue={setQty}
                  min={0}
                  max={itemAvailableQty}
                  disabledinput={!selectedItem}
                  width="100%"
                  height={rs(44)}
                />
              </View>
            </View>

            {controlType=='Lot' && (
              <View style={styles.lotRow}>
                <Text style={styles.fieldLabel}>
                  Lot/Serial Number<Text style={styles.required}>*</Text>{' '}
                  <Text style={styles.linkText}>(Lot Controlled)</Text>
                </Text>

                <TouchableAddLot
                  enabled={lineValid}
                  lotStatus={status}
                  onPress={handleOpenLotModal}
                />
              </View>
            )}

            {controlType=='Serial' && (
              <View style={styles.lotRow}>
                <Text style={styles.fieldLabel}>
                  Lot/Serial Number<Text style={styles.required}>*</Text>{' '}
                  <Text style={styles.linkText}>(Serial Controlled)</Text>
                </Text>

                <TouchableAddSerial
                  enabled={lineValid}
                  SerialStatus={status}
                  onPress={handleOpenSerialModal}
                />
              </View>
            )}

            {controlType=='Lot+Serial' && (
              <View style={styles.lotRow}>
                <Text style={styles.fieldLabel}>
                  Lot/Serial Number<Text style={styles.required}>*</Text>{' '}
                  <Text style={styles.linkText}>(Lot+Serial Controlled)</Text>
                </Text>

                <TouchableAddLotSerial
                  enabled={lineValid}
                  lotSerialStatus={status}
                  onPress={handleOpenLotSerialModal}
                />
              </View>
            )}

            <View style={styles.notesWrapper}>
              <Text style={styles.fieldLabel}>
                Notes <Text style={styles.optional}>(Optional)</Text>
              </Text>
              <TextInput
                style={styles.notesInput}
                placeholder="Maximum 100 characters"
                multiline
                maxLength={100}
                value={notes}
                onChangeText={setNotes}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {useSingleFooter ? (
        <SingleFooterBtnComponent
          label="Add"
          onPress={handleAdd}
          enabled={canUseFooterButtons}
        />
      ) : (
        <FooterButtonsComponent
          leftLabel="Add"
          rightLabel="Transfer"
          onLeftPress={handleAdd}
          onRightPress={handleTransfer}
          leftEnabled={!!canUseFooterButtons}
          rightEnabled={!!canUseFooterButtons}
        />
      )}

      <Inv_LotModalPopup
        visible={lotModalVisible}
        onClose={() => setLotModalVisible(false)}
        lineQty={qty}
        itemName={selectedItem?.name}
        initialLots={currentLots}
        onSave={handleSaveLots}
        lineLabel={baseLineLabel}
        selectedItem={selectedItem}
        fromSub={fromSub}
      />

      <Inv_SerialModalPopup
        visible={serialModalVisible}
        onClose={() => setserialModalVisible(false)}
        onSave={handleSaveSerials}
        itemName={selectedItem?.name}
        itemCode={selectedItem?.itemid}
        lineQty={qty}
        lineLabel={baseLineLabel}
        initialSerials={currentSerials}
        // initialMode={serialMode}
      />

      <Inv_LotSerialModalPopup
        visible={lotserialModalVisible}
        onClose={() => setLotserialModalVisible(false)}
        onSave={handleSaveLotSerials}
        itemName={selectedItem?.name}
        itemCode={selectedItem?.itemid}
        lineQty={qty}
        lineLabel={baseLineLabel}
        initialLots={currentLotSerials}
        selectedItem={selectedItem}
        fromSub={fromSub}
      />


      <ConfirmModal
        visible={confirmVisible}
        onCancel={() => setConfirmVisible(false)}
        onConfirm={handleConfirmTransfer}
      />

      <SuccessModal
        visible={successVisible}
        onClose={() => setSuccessVisible(false)}
      />
    </View>
  );
}

function TouchableAddLot({enabled,lotStatus, onPress }) {
  const hasLots = !!(lotStatus && lotStatus.count > 0);

  if (!enabled) {
    return (
      <View style={[styles.addLotBase, styles.addLotDisabled]}>
        <Text style={[styles.addLotText, styles.addLotTextDisabled]}>
          {hasLots && lotStatus
            ? `${lotStatus.count}LOTS - ${lotStatus.totalQty} QTY`
            : 'Add Lot'}
        </Text>
      </View>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={hasLots ? styles.addLotStatusWrapper : styles.addLotGradientWrapper}
    >
      <View style={hasLots ? styles.addLotStatusInner : styles.addLotGradientInner}>
        <Text style={hasLots ? styles.addLotStatusText : styles.addLotText}>
          {hasLots && lotStatus
            ? `${lotStatus.count}LOTS - ${lotStatus.totalQty} QTY`
            : 'Add Lot'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function TouchableAddSerial({ enabled, SerialStatus, onPress }) {
  const hasSerials = !!(SerialStatus && SerialStatus.count > 0);

  if (!enabled) {
    return (
      <View style={[styles.addLotBase, styles.addLotDisabled]}>
        <Text style={[styles.addLotText, styles.addLotTextDisabled]}>
          {hasSerials && SerialStatus
            ? `${SerialStatus.count}Serials Added - ${SerialStatus.totalQty} QTY`
            : 'Add Serial'}
        </Text>
      </View>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={hasSerials ? styles.addLotStatusWrapper : styles.addLotGradientWrapper}
    >
      <View style={hasSerials ? styles.addLotStatusInner : styles.addLotGradientInner}>
        <Text style={hasSerials ? styles.addLotStatusText : styles.addLotText}>
          {hasSerials && SerialStatus
            ? `${SerialStatus.count}Serials Added - ${SerialStatus.totalQty} QTY`
            : 'Add Serial'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function TouchableAddLotSerial({ enabled, lotSerialStatus, onPress }) {
  const hasSerials = !!(lotSerialStatus && lotSerialStatus.count > 0);

  if (!enabled) {
    return (
      <View style={[styles.addLotBase, styles.addLotDisabled]}>
        <Text style={[styles.addLotText, styles.addLotTextDisabled]}>
          {hasSerials && lotSerialStatus
            ? `${lotSerialStatus.count}Serials Added - ${lotSerialStatus.totalQty} QTY`
            : 'Add Lot+Serial'}
        </Text>
      </View>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={hasSerials ? styles.addLotStatusWrapper : styles.addLotGradientWrapper}
    >
      <View style={hasSerials ? styles.addLotStatusInner : styles.addLotGradientInner}>
        <Text style={hasSerials ? styles.addLotStatusText : styles.addLotText}>
          {hasSerials && lotSerialStatus
            ? `${lotSerialStatus.count} Lots + ${lotSerialStatus.totalQty} Serials Added - ${lotSerialStatus.totalQty} QTY`
            : 'Add Lot + Serial'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function ConfirmModal({ visible, onCancel, onConfirm }) {
  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <View style={styles.modalTop}>
            <ConfirmSubInventoryIcon width={rs(80)} height={rs(80)} />
          </View>
          <View style={styles.modalBody}>
            <Text style={styles.modalTitle}>Confirmation</Text>
            <Text style={styles.modalText}>
              Are you sure want to transfer this Inventory
            </Text>
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancel]}
                onPress={onCancel}
              >
                <Text style={[styles.modalButtonText, styles.modalCancelText]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalConfirm]}
                onPress={onConfirm}
              >
                <Text style={[styles.modalButtonText, styles.modalConfirmText]}>
                  Confirm
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function SuccessModal({ visible, onClose }) {
  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <View style={styles.modalTop}>
            <InventorySuccessIcon width={rs(80)} height={rs(80)} />
          </View>
          <View style={styles.modalBody}>
            <Text style={styles.modalTitle}>
              Sub Inventory Transfer created successfully
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F5F6F8' },
  scroll: { flex: 1 },

  errorBanner: {
    marginHorizontal: rs(16),
    marginTop: rs(12),
    marginBottom: rs(4),
    paddingVertical: rs(10),
    paddingHorizontal: rs(12),
    borderRadius: rs(24),
    backgroundColor: '#FDE3E3',
  },
  errorBannerText: {
    color: '#D32F2F',
    fontSize: rs(13),
    fontWeight: '600',
  },

  cardWrapper: {
    marginHorizontal: rs(16),
    marginTop: rs(30),
    marginBottom: rs(16),
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: rs(0),
    padding: rs(16),
    paddingTop: rs(10),
    marginTop: rs(10),
  },
  lineBadgeFloating: {
    position: 'absolute',
    top: -15,
    left: rs(0),
    zIndex: 2,
  },
  lineBadge: {
    backgroundColor: '#5D768B',
    borderTopLeftRadius: rs(6),
    borderTopRightRadius: rs(6),
    borderBottomRightRadius: rs(0),
    paddingVertical: rs(4),
    paddingHorizontal: rs(16),
  },
  lineBadgeText: {
    color: '#FFFFFF',
    fontSize: rs(13),
    fontWeight: '600',
  },

  itemInfoStrip: {
    flexDirection: 'row',
    backgroundColor: '#E6EEF7',
    borderRadius: rs(8),
    paddingVertical: rs(10),
    paddingHorizontal: rs(12),
    marginBottom: rs(16),
    marginTop: rs(8),
  },
  infoCol: { flex: 1 },
  infoLabel: { fontSize: rs(11), color: '#555555' },
  infoValue: {
    fontSize: rs(13),
    color: '#233E55',
    fontWeight: '600',
    marginTop: rs(2),
  },
  rowSplit: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    columnGap: rs(12),
  },
  colHalf: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: rs(12),
    color: '#555555',
    marginBottom: rs(4),
  },
  required: { color: '#E53935' },
  lotRow: {
    marginTop: rs(16),
  },
  linkText: {
    color: '#1E88E5',
    fontSize: rs(12),
  },
  notesWrapper: {
    marginTop: rs(16),
  },
  optional: { color: '#888888' },
  notesInput: {
    marginTop: rs(4),
    minHeight: rs(80),
    borderRadius: rs(8),
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: rs(10),
    fontSize: rs(13),
    textAlignVertical: 'top',
  },

  addLotBase: {
    marginTop: rs(8),
    alignSelf: 'stretch',
    borderRadius: rs(4),
    paddingVertical: rs(8),
    justifyContent: 'center',
    alignItems: 'center',
  },
  addLotGradientWrapper: {
    marginTop: rs(8),
    alignSelf: 'stretch',
  },
  addLotGradientInner: {
    borderRadius: rs(8),
    paddingVertical: rs(8),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#7392AA',
  },
  addLotStatusWrapper: {
    marginTop: rs(8),
    alignSelf: 'stretch',
  },
  addLotStatusInner: {
    borderRadius: rs(4),
    paddingVertical: rs(8),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#73B386',
  },
  addLotText: {
    color: '#FFFFFF',
    fontSize: rs(13),
    fontWeight: '500',
  },
  addLotStatusText: {
    color: '#FFFFFF',
    fontSize: rs(13),
    fontWeight: '500',
  },
  addLotDisabled: {
    backgroundColor: '#CCCCCC',
  },
  addLotTextDisabled: {
    color: '#777777',
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: rs(24),
  },
  modalCard: {
    width: '100%',
    borderRadius: rs(16),
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  modalTop: {
    backgroundColor: '#ECF1F7',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: rs(24),
  },
  modalBody: {
    paddingHorizontal: rs(20),
    paddingVertical: rs(20),
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: rs(16),
    fontWeight: '700',
    color: '#233E55',
    textAlign: 'center',
  },
  modalText: {
    marginTop: rs(8),
    fontSize: rs(14),
    color: '#555555',
    textAlign: 'center',
  },
  modalButtonsRow: {
    marginTop: rs(20),
    flexDirection: 'row',
    columnGap: rs(12),
    width: '100%',
  },
  modalButton: {
    flex: 1,
    height: rs(44),
    borderRadius: rs(30),
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancel: {
    borderWidth: 1,
    borderColor: '#233E55',
    backgroundColor: '#FFFFFF',
  },
  modalConfirm: {
    backgroundColor: '#233E55',
  },
  modalButtonText: {
    fontSize: rs(14),
    fontWeight: '600',
  },
  modalCancelText: {
    color: '#233E55',
  },
  modalConfirmText: {
    color: '#FFFFFF',
  },
  radioGroup: { flexDirection: "row", gap: rs(20), alignItems: "center" },
  radioRow: { flexDirection: "row", alignItems: "center", gap: rs(6) },
  disabledRow: {
    opacity: 0.5,
  },
  disabledText: {
    color: '#515050ff',
  },
  radioText: { fontSize: rs(14), color: "#233E55" },
  adjustTypeRow: { backgroundColor: "#E4E9EF", paddingVertical: rs(12), paddingHorizontal: rs(16), flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  adjustLabel: { fontSize: rs(14), color: "#233E55", fontWeight: "600" },
});
