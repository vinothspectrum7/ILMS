import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Modal, KeyboardAvoidingView, Platform, ScrollView, TextInput, Text, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import Inv_HeaderComponent from '../../../components/inventory/Inv_HeaderComponent';
import Inv_SingleFooterBtnComponent from '../../../components/inventory/Inv_SingleFooterBtnComponent';
import Inv_CustomNumericInput from '../../../components/inventory/Inv_CustomNumericInput';
import Inv_CustomDropdown from '../../../components/inventory/Inv_CustomDropdown';
import BarcodeScanner from '../../../components/inventory/Inv_BarCodeScanner';
import BarcodeScannerIcon from '../../../assets/icons/barcodescanner.svg';
import CalendarIcon from '../../../assets/icons/bx_calendar.svg';
import { useReceivingStore } from '../../../store/receivingStore';
import { GetOrgsData, ItemsList, LocatorList, SubInventoryList } from '../../../api/ApiServices';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import OrglistIcon from '../../../assets/icons/org_group.svg';
import Inv_FooterBtnComponent from '../../../components/inventory/Inv_FooterBtnComponent';

const BG = '#F6F8FA';
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BASE_WIDTH = 375;
const scale = (size) => (SCREEN_WIDTH / BASE_WIDTH) * size;
const ms = (size, factor = 0.35) => size + (scale(size) - size) * factor;

const INVENTORY_MENU_WIDTH = SCREEN_WIDTH;
const H_PADDING = ms(16);
const GAP = ms(12);
const SCAN_W = ms(44);
const QTY_W = scale(110);
const ITEM_FIELD_W = SCREEN_WIDTH - (2 * H_PADDING) - GAP - SCAN_W;
const UOM_FIELD_W = SCREEN_WIDTH - (2 * H_PADDING) - GAP - QTY_W;

// const OPTIONS_UOM = [{ label: 'Each', value: 'EA' }, { label: 'Piece', value: 'PC' }];

const mkOpts = (arr, labelKey, idKey) => arr.map((o) => ({ label: o[labelKey], value: o[idKey] }));
const findOption = (options, value) => options.find((o) => String(o.value) === String(value));
const labelOf = (options, value) => findOption(options, value)?.label ?? null;
const DROPDOWN_ID = {
    TO_ORG:'org',
    ITEM: 'item',
    FROM_SUB: 'from_sub',
    FROM_LOC: 'from_loc',
    TO_SUB: 'to_sub',
    TO_LOC: 'to_loc',
    UOM: 'uom',
};
export default function Org_AddMoreTransfer_Screen() {
  const navigation = useNavigation();
  const route = useRoute();
  const cartcount = Number(route?.params?.cartcount || 0);

  const [showScanner, setShowScanner] = useState(false);
  const [scannertype, setscannertype] = useState('org');
  const [selectedOrgId, setselectedOrgId] = useState(null);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [fromSubId, setFromSubId] = useState(null);
  const [fromLocId, setFromLocId] = useState(null);
  const [toSubId, setToSubId] = useState(null);
  const [toLocId, setToLocId] = useState(null);
  const [uomId, setUomId] = useState(null);
  const [shipmentNumber, setShipmentNumber] = useState('');
  const [waybill, setWaybill] = useState('');
  const [receiptDate, setReceiptDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [qty, setQty] = useState(0);

  const [itemOptions, SetitemOptions] = useState([]);
  const [OrgOptions, SetOrgOptions] = useState([]);
  const [fromSubOptions, setFromSubOptions] = useState([]);
  const [FromLocatorOption, setfromLocatorOption] = useState([]);
  const [ToLocatorOption, setToLocatorOption] = useState([]);
  const [OPTIONS_UOM,SETOPTIONS_UOM] = useState([]);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [allItemsData, setAllItemsData] = useState([]); // store all items with UOM

  const [maxQty, setMaxQty] = useState(0);

  const { addOrgnaizationTransferItems, OrgData, addOrgTransferDetails, Orgtransferdetails } = useReceivingStore();

const maporgdata = (data) => {
  return data.map((element) => ({
    label: element.org_code,
    value: element.org_uuid,
    org_code:element.org_code,
    is_default: element.is_default,
  }));
};
  // Function to open Android Date Picker
const openDatePicker = () => {
  let initialDate = new Date();
  if (receiptDate) {
    const parsedDate = new Date(receiptDate);
    if (!isNaN(parsedDate.getTime())) {
      initialDate = parsedDate;
    }
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


//   const isAddEnabled = !!selectedItemId && !!fromSubId && !!fromLocId && !!toSubId && !!toLocId && !!uomId && Number(qty) > 0;
  const isAddEnabled = useMemo(() => {
    const fromLocatorRequired = FromLocatorOption.length > 0;
    const toLocatorRequired = ToLocatorOption.length > 0;
  
    const hasFromLoc = fromLocatorRequired ? !!fromLocId : true;
    const hasToLoc = toLocatorRequired ? !!toLocId : true;
  
    return (
      !!selectedItemId &&
      !!fromSubId &&
      hasFromLoc &&
      !!toSubId &&
      hasToLoc &&
      !!uomId &&
      Number(qty) > 0
    );
  }, [
    selectedItemId,
    fromSubId,
    fromLocId,
    toSubId,
    toLocId,
    uomId,
    qty,
    FromLocatorOption,
    ToLocatorOption,
  ]);

    useEffect(() => {
    if (!OrgData?.selectedOrg) return;
    const LoadOrg = async () => {
            try {
              const orgsdata = await GetOrgsData();
              if (orgsdata) {
                console.log(orgsdata,'orgsdataorgsdataorgsdataorgsdataorgsdatas')
                const orgformatdata = maporgdata(orgsdata);
                SetOrgOptions(orgformatdata);
                const today = new Date();
                // const formattedToday = `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`;
                const formattedToday = today.toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                 });
                setReceiptDate(formattedToday);
                setselectedOrgId(null);      
              } else {
                SetOrgOptions([]);
                setselectedOrgId(null);
              }
            } catch (err) {
              console.error("Error loading ORG data:", err);
                      Toast.show({
                        type: 'error',
                        text1: 'Error',
                        text2: 'Failed to load organizations. Please try again.',
                        position: 'top',
                        visibilityTime: 5000
                      });
            }
    };
    LoadOrg();
  }, []);

  useEffect(() => {
    if (!OrgData?.selectedOrg) return;
    const LoadItems = async () => {
      try {
        const data = await ItemsList(OrgData?.selectedOrg);
        setAllItemsData(data);
        const formatteddata = mkOpts(data, 'item_code', 'item_id');
        // const formatuomdata = (data?.UOM || []).map(u => ({ label: u, value: u }));
        console.log(data,"data?.UOMdata?.UOMdata?.UOMdata?.UOM")
        // console.log(formatuomdata,"formatuomdataformatuomdata");
        SetitemOptions(formatteddata);
        // SETOPTIONS_UOM(formatuomdata);
      } catch {
        Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load Purchase Order data. Please try again.', position: 'top', visibilityTime: 5000 });
      }
    };
    LoadItems();
  }, [OrgData?.selectedOrg]);

  useEffect(() => {
  if (!selectedItemId) {
    SETOPTIONS_UOM([]);
    setUomId(null);
    return;
  }

  const selectedItem = allItemsData.find(it => String(it.item_id) === String(selectedItemId));
  const formattedUOM = (selectedItem?.UOM || []).map(u => ({ label: u, value: u }));
  SETOPTIONS_UOM(formattedUOM);
  setUomId(null); // reset UOM selection
}, [selectedItemId, allItemsData]);

  useEffect(() => {
    if (!selectedItemId || !OrgData?.selectedOrg) return;
    const fetchFromSubInventory = async () => {
      try {
        const data = await SubInventoryList(OrgData.selectedOrg, selectedItemId);
        const formatteddata = mkOpts(data, 'subinventory_name', 'subinventory_id');
        setFromSubId(null);
        setFromLocId(null);
        setToSubId(null);
        setToLocId(null);
        setUomId(null);
        setQty(0);
        setMaxQty(0);
        setFromSubOptions(formatteddata);
      } catch {
        Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load From Sub Inventories. Please try again.', position: 'top', visibilityTime: 5000 });
      }
    };
    fetchFromSubInventory();
  }, [selectedItemId, OrgData?.selectedOrg]);

  useEffect(() => {
    if (!selectedItemId || !OrgData?.selectedOrg || !fromSubId) return;
    const fetchLocator = async () => {
      try {
        const data = await LocatorList(OrgData.selectedOrg, selectedItemId, fromSubId);
        const formatted = data.map((d) => ({
          label: d.locator_name,
          value: d.locator_id,
          on_hand_qty: Number(d.on_hand_qty ?? 0),
        }));
        setFromLocId(null);
        setToSubId(null);
        setToLocId(null);
        setUomId(null);
        setQty(0);
        setMaxQty(0);
        setfromLocatorOption(formatted);
      } catch {
        Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load From Locators. Please try again.', position: 'top', visibilityTime: 5000 });
      }
    };
    fetchLocator();
  }, [selectedItemId, OrgData?.selectedOrg, fromSubId]);

  useEffect(() => {
    if (!selectedItemId || !OrgData?.selectedOrg || !toSubId) return;
    const fetchLocator = async () => {
      try {
        const data = await LocatorList(OrgData.selectedOrg, selectedItemId, toSubId);
        const formatted = data.map((d) => ({
          label: d.locator_name,
          value: d.locator_id,
        }));
        setToLocId(null);
        setUomId(null);
        setQty(0);
        setToLocatorOption(formatted);
      } catch {
        Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load To Locators. Please try again.', position: 'top', visibilityTime: 5000 });
      }
    };
    fetchLocator();
  }, [selectedItemId, OrgData?.selectedOrg, toSubId]);

    const handleDropdownToggle = useCallback((id, isOpen) => {
      setOpenDropdownId(isOpen ? id : null);
    }, []);

  const handleScan = useCallback((value) => {
    const code = String(value).trim().toUpperCase();
    if(scannertype=='item'){
    const match = itemOptions.find((p) => String(p.label).toUpperCase() === code);
    if (match) {
      setSelectedItemId(match.value);
      setShowScanner(false);
      Toast.show({ type: 'success', text1: 'Item found', text2: match.label, position: 'top', visibilityTime: 2200 });
    } else {
      Toast.show({ type: 'error', text1: 'Item not found', text2: `Scanned value ${code} not found`, position: 'top' });
      setShowScanner(false);
    }
}else{
       const match = OrgOptions.find((p) => String(p.org_code).toUpperCase() === code);
    if (match) {
      setselectedOrgId(match.value);
      setShowScanner(false);
      Toast.show({ type: 'success', text1: 'Organization found', text2: match.label, position: 'top', visibilityTime: 2200 });
    } else {
      Toast.show({ type: 'error', text1: 'Organization not found', text2: `Scanned value ${code} not found`, position: 'top' });
      setShowScanner(false);
    } 
}
  }, [itemOptions]);

  const onBack = useCallback(() => navigation.goBack(), [navigation]);
  const onMenu = useCallback(() => navigation.toggleDrawer?.(), [navigation]);
  const onCartPress = useCallback(() => navigation.navigate('orgSummary'), [navigation]);

  const onSelectFromLocator = useCallback((id) => {
    setFromLocId(id);
    const opt = findOption(FromLocatorOption, id);
    const nextMax = Number(opt?.on_hand_qty ?? 0);
    setMaxQty(nextMax);
    if (Number(qty) > nextMax) setQty(nextMax);
  }, [FromLocatorOption, qty]);

  const payloadForAdd = useMemo(() => {
    const orglabel = labelOf(OrgOptions, selectedOrgId);
    const itemLabel = labelOf(itemOptions, selectedItemId);
    const fromSubLabel = labelOf(fromSubOptions, fromSubId);
    const fromLocLabel = labelOf(FromLocatorOption, fromLocId);
    const toSubLabel = labelOf(fromSubOptions, toSubId);
    const toLocLabel = labelOf(ToLocatorOption, toLocId);
    const uomLabel = labelOf(OPTIONS_UOM, uomId);

    return {
      org_id: selectedOrgId,
      org_label: orglabel ?? null,
      item_id: selectedItemId,
      item_code: itemLabel ?? null,
      from_sub: fromSubId,
      from_sub_name: fromSubLabel ?? null,
      from_locator: fromLocId,
      from_locator_name: fromLocLabel ?? null,
      to_sub: toSubId,
      to_sub_name: toSubLabel ?? null,
      to_locator: toLocId,
      to_locator_name: toLocLabel ?? null,
      uom: uomId,
      uom_label: uomLabel ?? null,
      qty: Number(qty),
      shipmentNumber: shipmentNumber ?? null,
      waybill: waybill ?? null,
      receiptDate: receiptDate ?? null
    };
  }, [
    selectedItemId,
    fromSubId,
    fromLocId,
    toSubId,
    toLocId,
    uomId,
    qty,
    itemOptions,
    fromSubOptions,
    FromLocatorOption,
    ToLocatorOption,
  ]);

  const onAdd = useCallback(() => {
    console.log('SUB_INV_TRANSFER_ADD', payloadForAdd);
    addOrgnaizationTransferItems(payloadForAdd);
    // const orglabel = labelOf(OrgOptions, selectedOrgId);
    // let orgpayload = {
    //   To_org:selectedOrgId ?? null,
    //   orglabel: orglabel ?? null,
    //   shipmentNumber: shipmentNumber ?? null,
    //   waybill: waybill ?? null,
    //   receiptDate: receiptDate ?? null
    // }
    // console.log(orgpayload,"orgpayload");
    // addOrgTransferDetails(orgpayload);
    navigation.navigate('orgSummary');
  }, [addOrgnaizationTransferItems, payloadForAdd, navigation]);

const OnSummary = () => {
    navigation.navigate("orgSummary");
  };

  return (
    <View style={styles.safe}>
      <Inv_HeaderComponent
        organizationName={OrgData?.selectedOrgCode}
        screenTitle="Organization Transfer"
        notificationCount={0}
        onBack={onBack}
        onMenu={onMenu}
        showCartIcon={cartcount > 0}
        cartCount={cartcount}
        onCartPress={onCartPress}
      />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.select({ ios: 'padding', android: undefined })}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.orgcard}>
        <View style={styles.cardHeader}>
            <View style={styles.itemCol}>
              <OrglistIcon width={20} height={20} />
              <View style={{ alignItems: "flex-start" }}>
                {/* <Text style={styles.label}>Item</Text> */}
                <Text style={styles.orgtext}>{Orgtransferdetails?.orglabel} ORG</Text>
              </View>
            </View>
          </View>
              {/* Shipment Number */}
              <View style={styles.row}>
                <View style={styles.fieldContainer}>
                  <Text style={styles.orglabel}>Shipment Number</Text>
                  <Text style={styles.orgvalue} numberOfLines={1}>{Orgtransferdetails?.shipmentNumber}</Text>
                </View>
                {/* Waybill */}
                <View style={styles.fieldContainer}>
                  <Text style={styles.orglabel}>Waybill</Text>
                  <Text style={styles.orgvalue} numberOfLines={1}>{Orgtransferdetails?.waybill}</Text>
                </View>
        
                {/* Expected Receipt Date */}
                <View style={styles.fieldContainer}>
                  <Text style={styles.orglabel}>Expected Receipt Date</Text>
                        <Text style={styles.orgvalue} numberOfLines={1}>{Orgtransferdetails?.receiptDate}</Text>
                </View>
              </View>
            </View>
          <View style={styles.itemrowSplit}>
            <Inv_CustomDropdown
              dropdownId={DROPDOWN_ID.ITEM}
              openDropdownId={openDropdownId}
              onToggleOpen={handleDropdownToggle}
              label={null}
              placeholder="Select Item*"
              value={selectedItemId}
              onChange={(id) => {
                setSelectedItemId(id);
                setFromSubId(null);
                setFromLocId(null);
                setToSubId(null);
                setToLocId(null);
                setUomId(null);
                setQty(0);
                setMaxQty(0);
              }}
              options={itemOptions}
              idKey="value"
              nameKey="label"
            //   disabled={!selectedOrgId}
              selectedwidth={ITEM_FIELD_W}
              menuWidth={INVENTORY_MENU_WIDTH}
              menuAlign="left"
              autoSelectWhenEmpty={false}
            />
            <TouchableOpacity style={styles.scanBtn} 
            onPress={() => {
                setShowScanner(true);
                setscannertype('item');
            }} 
            accessibilityLabel="Scan barcode">
              <BarcodeScannerIcon width={ms(30)} height={ms(30)} />
            </TouchableOpacity>
          </View>

          <View style={styles.dropdown}>
            <Inv_CustomDropdown
              dropdownId={DROPDOWN_ID.FROM_SUB}
              openDropdownId={openDropdownId}
              onToggleOpen={handleDropdownToggle}
              label={null}
              placeholder="From Sub*"
              value={fromSubId}
              onChange={(id) => { setFromSubId(id); setFromLocId(null); setMaxQty(0); }}
              options={fromSubOptions}
              idKey="value"
              nameKey="label"
              disabled={!selectedItemId}
              selectedwidth={SCREEN_WIDTH - (2 * H_PADDING)}
              menuWidth={INVENTORY_MENU_WIDTH}
              menuAlign="left"
              autoSelectWhenEmpty={false}
            />
          </View>

          <View style={styles.dropdown}>
            {!!fromSubId && (
              <Inv_CustomDropdown
              dropdownId={DROPDOWN_ID.FROM_LOC}
              openDropdownId={openDropdownId}
              onToggleOpen={handleDropdownToggle}
                label={null}
                placeholder="From Locator*"
                value={fromLocId}
                onChange={onSelectFromLocator}
                options={FromLocatorOption}
                idKey="value"
                nameKey="label"
                disabled={!fromSubId}
                selectedwidth={SCREEN_WIDTH - (2 * H_PADDING)}
                menuWidth={INVENTORY_MENU_WIDTH}
                menuAlign="left"
                autoSelectWhenEmpty={false}
              />
            )}
          </View>

          <View style={styles.dropdown}>
            <Inv_CustomDropdown
              dropdownId={DROPDOWN_ID.TO_SUB}
              openDropdownId={openDropdownId}
              onToggleOpen={handleDropdownToggle}
              label={null}
              placeholder="To Sub*"
              value={toSubId}
              onChange={(id) => { setToSubId(id); setToLocId(null); }}
              options={fromSubOptions}
              idKey="value"
              nameKey="label"
              disabled={!fromLocId}
              selectedwidth={SCREEN_WIDTH - (2 * H_PADDING)}
              menuWidth={INVENTORY_MENU_WIDTH}
              menuAlign="left"
              autoSelectWhenEmpty={false}
            />
          </View>

          <View style={styles.dropdown}>
            {(ToLocatorOption.length > 0 && !!toSubId) && (
              <Inv_CustomDropdown
                dropdownId={DROPDOWN_ID.TO_LOC}
                openDropdownId={openDropdownId}
                onToggleOpen={handleDropdownToggle}
                label={null}
                placeholder="To Locator*"
                value={toLocId}
                onChange={setToLocId}
                options={ToLocatorOption}
                idKey="value"
                nameKey="label"
                disabled={!toSubId}
                selectedwidth={SCREEN_WIDTH - (2 * H_PADDING)}
                menuWidth={INVENTORY_MENU_WIDTH}
                menuAlign="left"
                autoSelectWhenEmpty={false}
              />
            )}
          </View>

          <View style={styles.uomrowSplit}>
            <Inv_CustomDropdown
              dropdownId={DROPDOWN_ID.UOM}
              openDropdownId={openDropdownId}
              onToggleOpen={handleDropdownToggle}
              label={null}
              placeholder="Select UOM*"
              value={uomId}
              onChange={setUomId}
              options={OPTIONS_UOM}
              idKey="value"
              nameKey="label"
              disabled={!toLocId}
              selectedwidth={UOM_FIELD_W}
              menuWidth={INVENTORY_MENU_WIDTH}
              menuAlign="left"
              autoSelectWhenEmpty={false}
            />
            <View style={styles.qtyCol}>
              <Inv_CustomNumericInput
                value={qty}
                setValue={setQty}
                width={QTY_W}
                height={ms(40)}
                disabledinput={!uomId}
                min={0}
                max={maxQty}
                step={1}
              />
            </View>
          </View>

          <View style={{ height: ms(24) }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* <Inv_SingleFooterBtnComponent rightLabel="Add" rightEnabled={isAddEnabled} onRightPress={onAdd} /> */}
      <Inv_FooterBtnComponent leftLabel="View Summary" rightLabel="Add" rightEnabled={isAddEnabled} onLeftPress={OnSummary} onRightPress={onAdd} />

      <Modal visible={showScanner} animationType="slide" onRequestClose={() => setShowScanner(false)}>
        <BarcodeScanner onScan={handleScan} onClose={() => setShowScanner(false)} />
      </Modal>

      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  content: { paddingHorizontal: ms(2), paddingTop: ms(12) },
  dropdown: { marginTop: ms(10) },
  itemrowSplit: { flexDirection: 'row', alignItems: 'center', gap: ms(0), paddingHorizontal: 0, marginTop: ms(10) },
  uomrowSplit: { flexDirection: 'row', alignItems: 'center', gap: ms(0), paddingHorizontal: 0, marginTop: ms(20) },
  scanBtn: {
    height: ms(40),
    width: ms(40),
    backgroundColor: '#EFEFF0',
    borderRadius: ms(4),
    borderWidth: 1,
    borderColor: '#EFEFF0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: ms(2),
    marginTop: ms(12)
  },
  qtyCol: { alignItems: 'flex-end', justifyContent: 'flex-end', marginRight: ms(8), marginTop: ms(10) },
   card: {
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 8,
    padding: 12,
    margin: 16,
    backgroundColor: '#ECF1F7',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fieldContainer: {
    flex: 1,
    marginHorizontal: 4,
  },
  label: {
    fontFamily:'Mulish',
    fontWeight:500,
    fontSize: 11,
    color: '#595A5C',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingVertical: 2,
    paddingHorizontal: 6,
    // fontSize: 14,
    paddingRight:25,
    backgroundColor: '#f9f9f9',
  },
  inputWrapper: {
  position: 'relative',
  justifyContent: 'center',
},
inputIcon: {
  position: 'absolute',
  right: 5,
  top: '50%',
  transform: [{ translateY: -10 }],
},
  orgcard: {
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 8,
    padding: 12,
    margin: 16,
    backgroundColor: '#D9E4EE',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  fieldContainer: {
    flex: 1,
    marginHorizontal: 4,
  },
  orglabel: {
    fontFamily:'Mulish',
    fontWeight:500,
    fontSize: 11,
    color: '#595A5C',
    marginBottom: 4,
  },
  orgvalue: { fontSize: 12, color: "rgba(35, 62, 85, 1)", fontWeight: "700" },
cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  itemCol: { flexDirection: "row", alignItems: "center", columnGap: 8 },
    orgtext:{
    fontFamily: 'Mulish',
fontWeight: 'bold',
fontStyle: 'normal',
fontSize: 12,
  },
});
