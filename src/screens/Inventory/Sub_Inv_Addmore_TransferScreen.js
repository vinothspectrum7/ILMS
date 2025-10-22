import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Modal, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import Inv_HeaderComponent from '../../components/inventory/Inv_HeaderComponent';
import Inv_FooterBtnComponent from '../../components/inventory/Inv_FooterBtnComponent';
import Inv_CustomNumericInput from '../../components/inventory/Inv_CustomNumericInput';
import Inv_CustomDropdown from '../../components/inventory/Inv_CustomDropdown';
import BarcodeScanner from '../../components/inventory/Inv_BarCodeScanner';
import BarcodeScannerIcon from '../../assets/icons/barcodescanner.svg';
import { useReceivingStore } from '../../store/receivingStore';
import { ItemsList, LocatorList, SubInventoryList } from '../../api/ApiServices';

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

const OPTIONS_UOM = [{ label: 'Each', value: 'EA' }, { label: 'Piece', value: 'PC' }];

const mkOpts = (arr, labelKey, idKey) => arr.map((o) => ({ label: o[labelKey], value: o[idKey] }));
const findOption = (options, value) => options.find((o) => String(o.value) === String(value));
const labelOf = (options, value) => findOption(options, value)?.label ?? null;

export default function Sub_Inv_Addmore_TransferScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const cartcount = Number(route?.params?.cartcount || 0);

  const [showScanner, setShowScanner] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [fromSubId, setFromSubId] = useState(null);
  const [fromLocId, setFromLocId] = useState(null);
  const [toSubId, setToSubId] = useState(null);
  const [toLocId, setToLocId] = useState(null);
  const [uomId, setUomId] = useState(null);
  const [qty, setQty] = useState(0);

  const [itemOptions, SetitemOptions] = useState([]);
  const [fromSubOptions, setFromSubOptions] = useState([]);
  const [FromLocatorOption, setfromLocatorOption] = useState([]);
  const [ToLocatorOption, setToLocatorOption] = useState([]);
  const [maxQty, setMaxQty] = useState(0);

  const { addSubInvTransferItem, OrgData } = useReceivingStore();

  const isAddEnabled = !!selectedItemId && !!fromSubId && !!fromLocId && !!toSubId && !!toLocId && !!uomId && Number(qty) > 0;

  useEffect(() => {
    if (!OrgData?.selectedOrg) return;
    const LoadItems = async () => {
      try {
        const data = await ItemsList(OrgData?.selectedOrg);
        const formatteddata = mkOpts(data, 'item_code', 'item_id');
        SetitemOptions(formatteddata);
      } catch {
        Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load Purchase Order data. Please try again.', position: 'top', visibilityTime: 5000 });
      }
    };
    LoadItems();
  }, [OrgData?.selectedOrg]);

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

  const handleScan = useCallback((value) => {
    const code = String(value).trim().toUpperCase();
    const match = itemOptions.find((p) => String(p.label).toUpperCase() === code);
    if (match) {
      setSelectedItemId(match.value);
      setShowScanner(false);
      Toast.show({ type: 'success', text1: 'Item found', text2: match.label, position: 'top', visibilityTime: 2200 });
    } else {
      Toast.show({ type: 'error', text1: 'Item not found', text2: `Scanned value ${code} not found`, position: 'top' });
      setShowScanner(false);
    }
  }, [itemOptions]);

  const onBack = useCallback(() => navigation.goBack(), [navigation]);
  const onMenu = useCallback(() => navigation.toggleDrawer?.(), [navigation]);
  const onCartPress = useCallback(() => navigation.navigate('SubInvTransfer_summary'), [navigation]);

  const onSelectFromLocator = useCallback((id) => {
    setFromLocId(id);
    const opt = findOption(FromLocatorOption, id);
    const nextMax = Number(opt?.on_hand_qty ?? 0);
    setMaxQty(nextMax);
    if (Number(qty) > nextMax) setQty(nextMax);
  }, [FromLocatorOption, qty]);

  const payloadForAdd = useMemo(() => {
    const itemLabel = labelOf(itemOptions, selectedItemId);
    const fromSubLabel = labelOf(fromSubOptions, fromSubId);
    const fromLocLabel = labelOf(FromLocatorOption, fromLocId);
    const toSubLabel = labelOf(fromSubOptions, toSubId);
    const toLocLabel = labelOf(ToLocatorOption, toLocId);
    const uomLabel = labelOf(OPTIONS_UOM, uomId);

    return {
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
    addSubInvTransferItem(payloadForAdd);
    navigation.navigate("SubInvTransfer_summary");
  }, [addSubInvTransferItem, payloadForAdd, navigation]);

  const OnSummary = () => {
    navigation.navigate("SubInvTransfer_summary");
  };

  return (
    <View style={styles.safe}>
      <Inv_HeaderComponent
        organizationName={OrgData?.selectedOrgCode}
        screenTitle="Sub Inventory Transfer"
        notificationCount={0}
        onBack={onBack}
        onMenu={onMenu}
        showCartIcon={cartcount > 0}
        cartCount={cartcount}
        onCartPress={onCartPress}
      />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.select({ ios: 'padding', android: undefined })}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.itemrowSplit}>
            <Inv_CustomDropdown
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
              disabled={false}
              selectedwidth={ITEM_FIELD_W}
              menuWidth={INVENTORY_MENU_WIDTH}
              menuAlign="left"
              autoSelectWhenEmpty={false}
            />
            <TouchableOpacity style={styles.scanBtn} onPress={() => setShowScanner(true)} accessibilityLabel="Scan barcode">
              <BarcodeScannerIcon width={ms(30)} height={ms(30)} />
            </TouchableOpacity>
          </View>

          <View style={styles.dropdown}>
            <Inv_CustomDropdown
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
            {!!toSubId && (
              <Inv_CustomDropdown
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
  qtyCol: { alignItems: 'flex-end', justifyContent: 'flex-end', marginRight: ms(8), marginTop: ms(10) }
});
