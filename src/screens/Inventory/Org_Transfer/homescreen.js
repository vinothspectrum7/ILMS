import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Modal,
  TouchableOpacity,
  BackHandler,
} from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import Inv_HeaderComponent from '../../../components/inventory/Inv_HeaderComponent';
import FooterButtonsComponent from '../../../components/FooterButtonsComponent';
import SingleFooterBtnComponent from '../../../components/SingleFooterBtnComponent';
import Inv_Dropdown from '../../../components/inventory/Inv_Dropdown';
import Inv_CustomNumericInput from '../../../components/inventory/Inv_CustomNumericInput';
import Inv_LotModalPopup from '../../../components/inventory/Inv_LotModalPopup';
import BarcodeScanner from '../../../screens/BarCodeScanner';
import BarcodeScannerIcon from '../../../assets/icons/barcodescanner.svg';
import CalendarIcon from '../../../assets/icons/bx_calendar.svg';
import {
  MOCK_ITEMS,
  MOCK_SUB_INVENTORIES,
  MOCK_LOCATORS,
  MOCK_UOMS,
} from '../../../data/inventoryMockData';
import { useReceivingStore } from '../../../store/receivingStore';
import ConfirmSubInventoryIcon from '../../../assets/icons/confirmsubinventory.svg';
import InventorySuccessIcon from '../../../assets/icons/inventorysuccess.svg';
import Inv_SerialModalPopup from '../../../components/inventory/Inv_SerialModalPopup';
import Inv_LotSerialModalPopup from '../../../components/inventory/Inv_LotSerialModalPopup';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import Inv_CustomDropdown from '../../../components/inventory/Inv_CustomDropdown';
import { GetOrgsData } from '../../../api/ApiServices';
import OrglistIcon from "../../../assets/icons/org_group.svg";


const { width: SCREEN_WIDTH } = require('react-native').Dimensions.get('window');
const BASE_WIDTH = 375;
const rs = v => (SCREEN_WIDTH / BASE_WIDTH) * v;

export default function Org_Transfer_Screen() {
  const navigation = useNavigation();
  const route = useRoute();
  const editIndex = route.params?.editIndex ?? null;
  const isAddMore = route.params?.isAddMore === true;
  const findOption = (options, value) => options.find((o) => String(o.id) === String(value));
  const labelOf = (options, value) => findOption(options, value)?.code ?? null;

  const {
    OrgData,
    OrgnaizationTransferItems,
    addOrgnaizationTransferItems,
    editOrgnaizationTransferItems,
    addOrgTransferDetails,
    Orgtransferdetails,
    resetOrgnaizationTransferItems
  } = useReceivingStore();

  const [initialStoreCount] = useState(OrgnaizationTransferItems.length);

  const showCartForHeader = isAddMore || initialStoreCount > 0;
  const useSingleFooter = isAddMore || initialStoreCount > 0;

  const existingItem = editIndex != null ? OrgnaizationTransferItems[editIndex] : null;
  const [selectedOrgId, setselectedOrgId] = useState(null);
  const [selectedItem, setSelectedItem] = useState(existingItem?.item || null);
  const [fromSub, setFromSub] = useState(existingItem?.fromSub || null);
  const [fromLocator, setFromLocator] = useState(existingItem?.fromLocator || null);
  const [toSub, setToSub] = useState(existingItem?.toSub || null);
  const [toLocator, setToLocator] = useState(existingItem?.toLocator || null);
  const [uom, setUom] = useState(existingItem?.uom || null);
  const [shipmentNumber, setShipmentNumber] = useState('');
  const [waybill, setWaybill] = useState('');
  const [receiptDate, setReceiptDate] = useState(null);
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
  const [OrgOptions, SetOrgOptions] = useState([]);
  const [scannerVisible, setScannerVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [controlType,setControlType] = useState(null);

  const availableLocatorsFrom = useMemo(() => {
    if (!fromSub) return [];
    return MOCK_LOCATORS.filter(l => l.subInventoryId === fromSub.id);
  }, [fromSub]);

  const availableLocatorsTo = useMemo(() => {
    if (!toSub) return [];
    return MOCK_LOCATORS.filter(l => l.subInventoryId === toSub.id);
  }, [toSub]);

  const itemAvailableQty = selectedItem?.openQty ?? 0;

  const maporgdata = (data) => {
    return data.map((element) => ({
      id: element.org_uuid,
      name: element.org_code,
      code: element.org_code,
      is_default: element.is_default,
    }));
  }
  
  const baseLineLabel = useMemo(() => {
    const idx = persistedIndex != null ? persistedIndex : OrgnaizationTransferItems.length;
    return `Line ${idx + 1}`;
  }, [persistedIndex, OrgnaizationTransferItems.length]);

  const OrgnaizationDetails = useMemo(() => (Orgtransferdetails ? Orgtransferdetails : {}), [Orgtransferdetails]);

  useEffect(() => {
    if (!OrgData?.selectedOrg) return;
    const LoadOrg = async () => {
      try {
        const orgsdata = await GetOrgsData();
        const orgformatdata = maporgdata(orgsdata || []);
        const filtered = orgformatdata.filter(
          (o) => String(o.value) !== String(OrgData.selectedOrg)
        );
        SetOrgOptions(filtered);
        const today = new Date();
        const formattedToday = today.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
        setReceiptDate(formattedToday);
        if (selectedOrgId && String(selectedOrgId) === String(OrgData.selectedOrg)) {
          setselectedOrgId(null);
        }
      } catch (err) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to load organizations. Please try again.',
          position: 'top',
          visibilityTime: 5000,
        });
      }
    };
    LoadOrg();
  }, [OrgData?.selectedOrg]);

  // useEffect(()=>{
  //   if (!isAddMore) return;
  //   set
  // },[isAddMore])

const handlePersistMainLine = () => {
  let existingLots = [];
  let existingSerials = [];
  let existingLotSerials = [];

  if (controlType === 'Lot') {
    existingLots =
      persistedIndex != null
        ? OrgnaizationTransferItems[persistedIndex]?.lots || []
        : existingItem?.lots || [];
  }

  if (controlType === 'Serial') {
    existingSerials =
      persistedIndex != null
        ? OrgnaizationTransferItems[persistedIndex]?.serials || []
        : existingItem?.serials || [];
  }

  if (controlType === 'Lot+Serial') {
    existingLotSerials =
      persistedIndex != null
        ? OrgnaizationTransferItems[persistedIndex]?.lotSerials || []
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
    ...(controlType === 'Lot' && { lots: existingLots }),
    ...(controlType === 'Serial' && { serials: existingSerials }),
    ...(controlType === 'Lot+Serial' && { lotSerials: existingLotSerials }),
  };

  if (persistedIndex != null) {
    editOrgnaizationTransferItems(payload, persistedIndex);
    return persistedIndex;
  }

  addOrgnaizationTransferItems(payload);
  const newIndex = OrgnaizationTransferItems.length;
  setPersistedIndex(newIndex);
  return newIndex;
};



  const lineValid =
    !!selectedItem &&
    !!fromSub &&
    !!fromLocator &&
    !!toSub &&
    !!toLocator &&
    !!uom &&
    qty > 0;

  const qtyExceeds = !!selectedItem && qty > itemAvailableQty;


  const canUseFooterButtons = lineValid;

  const currentLots =
    persistedIndex != null
      ? OrgnaizationTransferItems[persistedIndex]?.lots || []
      : [];
  const currentSerials =
    persistedIndex != null
      ? OrgnaizationTransferItems[persistedIndex]?.serials || []
      : [];
    const currentLotSerials =
    persistedIndex != null
      ? OrgnaizationTransferItems[persistedIndex]?.lotSerials || []
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
    editOrgnaizationTransferItems(updated, persistedIndex);
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
    editOrgnaizationTransferItems(updated, persistedIndex);
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
    editOrgnaizationTransferItems(updated, persistedIndex);
    setStatus({ count: lotSerials.length, totalQty });
    setLotserialModalVisible(false);
  };

  const handleAdd = () => {
   const orglabel = labelOf(OrgOptions, selectedOrgId?.id);
   if(!isAddMore){
    const orgpayload = {
      To_org: selectedOrgId ?? null,
      orglabel: String(orglabel).trim().slice(0, 3).toUpperCase() ?? null,
      shipmentNumber: shipmentNumber ?? 908865,
      waybill: waybill ?? 56788,
      receiptDate: receiptDate ?? null,
    };
    addOrgTransferDetails(orgpayload);
  }
    if (!canUseFooterButtons) return;
    handlePersistMainLine();
    navigation.navigate('orgSummary');
  };

  const handleTransfer = () => {
    if (!canUseFooterButtons) return;
    handlePersistMainLine();
    setConfirmVisible(true);
  };
  
  const handleBack = () => {
    setTimeout(() => {
      resetOrgnaizationTransferItems();
      navigation.navigate('Inventory');
    }, 1500);
  }
    useFocusEffect(
      useCallback(() => {
        const sub = BackHandler.addEventListener('hardwareBackPress', handleBack);
        return () => sub.remove();
      }, [handleBack])
    );

  const openDatePicker = () => {
    let initialDate = new Date();
    if (receiptDate) {
      const parsedDate = new Date(receiptDate);
      if (!isNaN(parsedDate.getTime())) initialDate = parsedDate;
    }
    DateTimePickerAndroid.open({
      value: initialDate,
      onChange: (event, selectedDate) => {
        if (event.type === 'set' && selectedDate) {
          const formattedDate = selectedDate.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          });
          setReceiptDate(formattedDate);
        }
      },
      mode: 'date',
      is24Hour: true,
    });
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
      MOCK_ITEMS.find(
        it => String(it.code || '').trim().toLowerCase() === scanned,
      ) || null;

    if (!matchedItem) {
      setScannerVisible(false);
      return;
    }

    setSelectedItem(matchedItem);
    const maxQty = matchedItem.openQty ?? 0;
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
        screenTitle="Organization Transfer"
        onBack={() => navigation.goBack()}
        showCartIcon={showCartForHeader}
        cartCount={OrgnaizationTransferItems.length}
        onCartPress={() => navigation.navigate('orgSummary')}
      />

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
            {!isAddMore?(
              <>
              <Inv_Dropdown
              label="To Organization"
              required
              value={selectedOrgId}
              onChange={org_code => {
                console.log(org_code,"setselectedOrgIdsetselectedOrgId")
                setselectedOrgId(org_code);
              }}
              items={OrgOptions}
              displayValue={it => it.name}
              renderCode={it => it.code}
              showBarcodeIcon
              onBarcodePress={handleBarcodePress}
            />
        {(selectedOrgId!=''&&selectedOrgId!=null)&&(<View style={styles.orgcard}>
          <View style={styles.row}>
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Shipment Number</Text>
              <TextInput style={styles.input} value={shipmentNumber} onChangeText={setShipmentNumber} numberOfLines={1} ellipsizeMode="tail" />
            </View>
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Waybill</Text>
              <TextInput style={styles.input} value={waybill} onChangeText={setWaybill} numberOfLines={1} ellipsizeMode="tail" />
            </View>
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Expected Receipt Date</Text>
              <TouchableOpacity onPress={openDatePicker}>
                <View pointerEvents="none">
                  <TextInput style={styles.input} value={receiptDate} numberOfLines={1} ellipsizeMode="tail" />
                  <CalendarIcon width={rs(16)} height={rs(16)} style={styles.inputIcon} onPress={openDatePicker} />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>)}
        </>):(
        <View className="orgcard" style={styles.selectorgcard}>   
          <View style={styles.row}>
            <View style={styles.selectfieldContainer}>
              <OrglistIcon width={20} height={20} />
              <View style={{ alignItems: "flex-start" }}>
                <Text style={styles.selectorgvalue}>{OrgnaizationDetails?.orglabel} ORG</Text>
              </View>
            </View>
            <View style={styles.selectfieldContainer}>
              <Text style={styles.selectorglabel}>Shipment Number</Text>
              <Text style={styles.selectorgvalue} numberOfLines={1}>{OrgnaizationDetails?.shipmentNumber}</Text>
            </View>
            <View style={styles.selectfieldContainer}>
              <Text style={styles.selectorglabel}>Waybill</Text>
              <Text style={styles.selectorgvalue} numberOfLines={1}>{OrgnaizationDetails?.waybill}</Text>
            </View>
            <View style={styles.selectfieldContainer}>
              <Text style={styles.selectorglabel}>Exp Receipt Date</Text>
              <Text style={styles.selectorgvalue} numberOfLines={1}>{OrgnaizationDetails?.receiptDate}</Text>
            </View>
          </View>
        </View>
        )}
            <Inv_Dropdown
              label="Select Item"
              required
              value={selectedItem}
              onChange={item => {
                setSelectedItem(item);
                if (item && qty > item.openQty) {
                  setQty(item.openQty);
                }
                setControlType(item.controlType);
              }}
              items={MOCK_ITEMS}
              displayValue={it => it.name}
              renderCode={it => it.code}
              showBarcodeIcon
              onBarcodePress={handleBarcodePress}
              // disabled={!selectedOrgId}
            />

            {selectedItem ? (
              <View style={styles.itemInfoStrip}>
                <View style={styles.infoCol}>
                  <Text style={styles.infoLabel}>Available Stock</Text>
                  <Text style={styles.infoValue}>
                    {selectedItem.availableStock} {selectedItem.availableUom}
                  </Text>
                </View>
                <View style={styles.infoCol}>
                  <Text style={styles.infoLabel}>Item Code</Text>
                  <Text style={styles.infoValue}>{selectedItem.code}</Text>
                </View>
                <View style={styles.infoCol}>
                  <Text style={styles.infoLabel}>Control Type</Text>
                  <Text style={styles.infoValue}>{selectedItem.controlType}</Text>
                </View>
              </View>
            ) : null}

            <View style={styles.rowSplit}>
              <View style={styles.colHalf}>
                <Inv_Dropdown
                  label="From Sub"
                  required
                  value={fromSub}
                  onChange={it => {
                    setFromSub(it);
                    setFromLocator(null);
                  }}
                  items={MOCK_SUB_INVENTORIES}
                  displayValue={it => it.name}
                  renderCode={it => it.code}
                  // disabled={!selectedOrgId}
                />
              </View>
              {fromSub ? (
                <View style={styles.colHalf}>
                  <Inv_Dropdown
                    label="From Locator"
                    required
                    value={fromLocator}
                    onChange={setFromLocator}
                    items={availableLocatorsFrom}
                    displayValue={it => it.name}
                    renderCode={it => it.code}
                    // disabled={!selectedOrgId}
                  />
                </View>
              ) : null}
            </View>

            <View style={styles.rowSplit}>
              <View style={styles.colHalf}>
                <Inv_Dropdown
                  label="To Sub"
                  required
                  value={toSub}
                  onChange={it => {
                    setToSub(it);
                    setToLocator(null);
                  }}
                  items={MOCK_SUB_INVENTORIES}
                  displayValue={it => it.name}
                  renderCode={it => it.code}
                  // disabled={!selectedOrgId}
                />
              </View>
              {toSub ? (
                <View style={styles.colHalf}>
                  <Inv_Dropdown
                    label="To Locator"
                    required
                    value={toLocator}
                    onChange={setToLocator}
                    items={availableLocatorsTo}
                    displayValue={it => it.name}
                    renderCode={it => it.code}
                    // disabled={!selectedOrgId}
                  />
                </View>
              ) : null}
            </View>

            <View style={styles.rowSplit}>
              <View style={styles.colHalf}>
                <Inv_Dropdown
                  label="Select UOM"
                  required
                  value={uom}
                  onChange={setUom}
                  items={MOCK_UOMS}
                  displayValue={it => it.name}
                  renderCode={it => it.code}
                  // disabled={!selectedOrgId}
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
                // editable={!selectedOrgId?false:true}              
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
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'stretch',marginBottom:5 },
  fieldContainer: { flex: 1, marginHorizontal: 4, flexDirection: 'column', justifyContent: 'space-between' },
  label: { fontFamily: 'Mulish', fontWeight: 500, fontSize: 9, color: '#595A5C', marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingVertical: 2,
    paddingHorizontal: 6,
    color: '#242424',
    // paddingRight: 25,
    fontSize:12,
    backgroundColor: '#FFFFFF',
  },
  orgcard: {
    borderWidth: 1,
    borderColor: '#ECF1F7',
    borderRadius: 8,
    padding: 8,
    marginBottom: rs(8),
    backgroundColor: '#ECF1F7',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 1,
  },
  inputIcon: { position: 'absolute', right: 2, top: '50%', transform: [{ translateY: -10 }] },
  itemrowSplit: { flexDirection: 'row', alignItems: 'center', gap: rs(0), paddingHorizontal: 0, marginTop: rs(10) },
  selectorgcard: { borderWidth: 1, borderColor: "#d0d0d0", borderRadius: 8, padding: 12, marginBottom: 16, backgroundColor: "#233E55", shadowColor: "#000", shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 2 },
  selectrow: { flexDirection: "row", justifyContent: "space-between" },
  selectfieldContainer: { flex: 1, marginHorizontal: 2 },
  selectorglabel: { fontFamily: "Mulish", fontWeight: "500", fontSize: 10, color: "#FFFFFF", marginBottom: 4 },
  selectorgvalue: { fontSize: 12, color: "#FFFFFF", fontWeight: "700" },
});
