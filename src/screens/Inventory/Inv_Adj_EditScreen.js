import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, StyleSheet, Dimensions, TouchableOpacity, Modal, KeyboardAvoidingView, Platform, ScrollView, Text } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import Inv_HeaderComponent from "../../components/inventory/Inv_HeaderComponent";
import Inv_FooterBtnComponent from "../../components/inventory/Inv_FooterBtnComponent";
import Inv_CustomNumericInput from "../../components/inventory/Inv_CustomNumericInput";
import Inv_CustomDropdown from "../../components/inventory/Inv_CustomDropdown";
import BarcodeScanner from "../../components/inventory/Inv_BarCodeScanner";
import BarcodeScannerIcon from "../../assets/icons/barcodescanner.svg";
import RadioGlossySelected from "../../assets/icons/RadioGlossySelected.svg";
import RadioGlossyUnselected from "../../assets/icons/RadioGlossyUnselected.svg";
import { useReceivingStore } from "../../store/receivingStore";
import { ItemsList, LocatorList, SubInventoryList } from "../../api/ApiServices";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const BASE_WIDTH = 375;
const scale = (size) => (SCREEN_WIDTH / BASE_WIDTH) * size;
const ms = (size, factor = 0.35) => size + (scale(size) - size) * factor;
const H_PADDING = ms(16);
const INVENTORY_MENU_WIDTH = SCREEN_WIDTH;
const QTY_W = scale(110);
const UOM_FIELD_W = SCREEN_WIDTH - (2 * H_PADDING) - ms(12) - QTY_W;

const mkOpts = (arr, labelKey, idKey) => arr.map((o) => ({ label: o[labelKey], value: o[idKey] }));
const findOption = (options, value) => options.find((o) => String(o.value) === String(value));
const labelOf = (options, value) => findOption(options, value)?.label ?? null;

const DROPDOWN_ID = { ITEM: "item", FROM_SUB: "from_sub", FROM_LOC: "from_loc", TO_SUB: "to_sub", TO_LOC: "to_loc", UOM: "uom" };

export default function Inv_Adj_EditScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const itemToEdit = route?.params?.itemToEdit || null;
  const EditIndex = route?.params?.EditIndex ?? null;
  const initialType = route?.params?.adjustmentType || itemToEdit?.adjustmentType || "Issue";
  const cartcount = Number(route?.params?.cartcount || 0);
  const { OrgData, editSubInvTransferItem } = useReceivingStore();

  const [adjustType] = useState(initialType);
  const [showScanner, setShowScanner] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState(null);

  const [itemOptions, setItemOptions] = useState([]);
  const [allItemsData, setAllItemsData] = useState([]);

  const [fromSubOptions, setFromSubOptions] = useState([]);
  const [toSubOptions, setToSubOptions] = useState([]);
  const [fromLocatorOptions, setFromLocatorOptions] = useState([]);
  const [toLocatorOptions, setToLocatorOptions] = useState([]);
  const [UOMOptions, setUOMOptions] = useState([]);

  const [issueFields, setIssueFields] = useState({
    itemId: itemToEdit?.item_id ?? null,
    fromSubId: itemToEdit?.from_sub ?? null,
    fromLocId: itemToEdit?.from_locator ?? null,
    uomId: itemToEdit?.uom ?? null,
    qty: Number(itemToEdit?.qty ?? 0),
    maxQty: 0,
  });
  const [receiptFields, setReceiptFields] = useState({
    itemId: itemToEdit?.item_id ?? null,
    toSubId: itemToEdit?.to_sub ?? null,
    toLocId: itemToEdit?.to_locator ?? null,
    uomId: itemToEdit?.uom ?? null,
    qty: Number(itemToEdit?.qty ?? 0),
    maxQty: 999999,
  });

  const activeFields = adjustType === "Issue" ? issueFields : receiptFields;

  const handleDropdownToggle = useCallback((id, isOpen) => setOpenDropdownId(isOpen ? id : null), []);

  useEffect(() => {
    if (!OrgData?.selectedOrg) return;
    const loadItems = async () => {
      try {
        const data = await ItemsList(OrgData.selectedOrg);
        setAllItemsData(data);
        setItemOptions(mkOpts(data, "item_code", "item_id"));
      } catch {
        Toast.show({ type: "error", text1: "Error", text2: "Failed to load Items.", position: "top" });
      }
    };
    loadItems();
  }, [OrgData?.selectedOrg]);

  useEffect(() => {
    const selectedItem = allItemsData.find(it => String(it.item_id) === String(activeFields.itemId));
    const formattedUOM = (selectedItem?.UOM || []).map(u => ({ label: u, value: u }));
    setUOMOptions(formattedUOM);
  }, [activeFields.itemId, allItemsData, adjustType]);

  useEffect(() => {
    if (!activeFields.itemId || !OrgData?.selectedOrg) return;
    const fetchSubInv = async () => {
      try {
        const data = await SubInventoryList(OrgData.selectedOrg, activeFields.itemId);
        const formatted = mkOpts(data, "subinventory_name", "subinventory_id");
        setFromSubOptions(formatted);
        setToSubOptions(formatted);
      } catch {
        Toast.show({ type: "error", text1: "Error", text2: "Failed to load Sub Inventories.", position: "top" });
      }
    };
    fetchSubInv();
  }, [activeFields.itemId, OrgData?.selectedOrg]);

  useEffect(() => {
    if (adjustType === "Issue") {
      if (!issueFields.itemId || !issueFields.fromSubId) return;
      const fetchLocator = async () => {
        try {
          const data = await LocatorList(OrgData.selectedOrg, issueFields.itemId, issueFields.fromSubId);
          const formatted = data.map(d => ({ label: d.locator_name, value: d.locator_id, on_hand_qty: Number(d.on_hand_qty ?? 0) }));
          setFromLocatorOptions(formatted);
          if (issueFields.fromLocId) {
            const opt = findOption(formatted, issueFields.fromLocId);
            const nextMax = Number(opt?.on_hand_qty ?? 0);
            setIssueFields(prev => ({ ...prev, maxQty: nextMax, qty: Math.min(prev.qty, nextMax) }));
          }
        } catch {
          Toast.show({ type: "error", text1: "Error", text2: "Failed to load From Locators.", position: "top" });
        }
      };
      fetchLocator();
    } else {
      if (!receiptFields.itemId || !receiptFields.toSubId) return;
      const fetchLocator = async () => {
        try {
          const data = await LocatorList(OrgData.selectedOrg, receiptFields.itemId, receiptFields.toSubId);
          const formatted = data.map(d => ({ label: d.locator_name, value: d.locator_id }));
          setToLocatorOptions(formatted);
        } catch {
          Toast.show({ type: "error", text1: "Error", text2: "Failed to load To Locators.", position: "top" });
        }
      };
      fetchLocator();
    }
  }, [issueFields.itemId, issueFields.fromSubId, issueFields.fromLocId, receiptFields.itemId, receiptFields.toSubId, adjustType, OrgData?.selectedOrg]);

  const handleScan = useCallback((value) => {
    const code = String(value).trim().toUpperCase();
    const match = itemOptions.find(p => String(p.label).toUpperCase() === code);
    if (match) {
      setShowScanner(false);
      if (adjustType === "Issue") setIssueFields(prev => ({ ...prev, itemId: match.value }));
      else setReceiptFields(prev => ({ ...prev, itemId: match.value }));
      Toast.show({ type: "success", text1: "Item found", text2: match.label, position: "top" });
    } else {
      Toast.show({ type: "error", text1: "Item not found", text2: `Scanned value ${code} not found`, position: "top" });
      setShowScanner(false);
    }
  }, [itemOptions, adjustType]);

  const isUpdateEnabled = useMemo(() => {
    if (adjustType === "Issue") {
      const f = issueFields;
      return !!(f.itemId && f.fromSubId && f.fromLocId && f.uomId && f.qty > 0);
    } else {
      const f = receiptFields;
      return !!(f.itemId && f.toSubId && f.toLocId && f.uomId && f.qty > 0);
    }
  }, [issueFields, receiptFields, adjustType]);

  const onUpdate = useCallback(() => {
    const f = adjustType === "Issue" ? issueFields : receiptFields;
    const payload = {
      adjustmentType: adjustType,
      item_id: f.itemId,
      from_sub: f.fromSubId ?? null,
      from_locator: f.fromLocId ?? null,
      to_sub: f.toSubId ?? null,
      to_locator: f.toLocId ?? null,
      uom: f.uomId,
      qty: Number(f.qty)
    };
    if (EditIndex !== null && EditIndex >= 0) {
      editSubInvTransferItem(payload, EditIndex);
    } else {
      Toast.show({ type: "error", text1: "Error", text2: "Item not found to update", position: "top", visibilityTime: 5000 });
    }
    navigation.navigate("Inv_Adj_SummaryScreen", { adjustmentType: adjustType });
  }, [adjustType, issueFields, receiptFields, EditIndex, editSubInvTransferItem, navigation]);

  return (
    <View style={styles.safe}>
      <Inv_HeaderComponent
        organizationName={OrgData?.selectedOrgCode}
        screenTitle="Inventory Adjustments"
        notificationCount={0}
        onBack={() => navigation.goBack()}
        onMenu={() => navigation.toggleDrawer?.()}
        showCartIcon={cartcount > 0}
        cartCount={cartcount}
        onCartPress={() => navigation.navigate("Inv_Adj_SummaryScreen", { adjustmentType: adjustType })}
      />

      <View style={styles.adjustTypeRow}>
        <Text style={styles.adjustLabel}>Select Adjustment Type</Text>
        <View style={styles.radioGroup}>
          <View style={styles.radioRow}>
            {(adjustType === "Issue" ? <RadioGlossySelected /> : <RadioGlossyUnselected />)}
            <Text style={styles.radioText}>Issue</Text>
          </View>
          <View style={styles.radioRow}>
            {(adjustType === "Receipt" ? <RadioGlossySelected /> : <RadioGlossyUnselected />)}
            <Text style={styles.radioText}>Receipt</Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.select({ ios: "padding", android: undefined })}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.itemRow}>
            <Inv_CustomDropdown
              dropdownId="item"
              openDropdownId={openDropdownId}
              onToggleOpen={(id, isOpen) => setOpenDropdownId(isOpen ? id : null)}
              placeholder="Select Item*"
              value={activeFields.itemId}
              onChange={(id) => {
                if (adjustType === "Issue") setIssueFields({ itemId: id, fromSubId: null, fromLocId: null, uomId: null, qty: 0, maxQty: 0 });
                else setReceiptFields({ itemId: id, toSubId: null, toLocId: null, uomId: null, qty: 0, maxQty: 999999 });
              }}
              options={itemOptions}
              idKey="value"
              nameKey="label"
              disabled={false}
              selectedwidth={SCREEN_WIDTH - (2 * H_PADDING) - ms(44)}
              menuWidth={INVENTORY_MENU_WIDTH}
            />
            <TouchableOpacity style={styles.scanBtn} onPress={() => setShowScanner(true)}>
              <BarcodeScannerIcon width={ms(30)} height={ms(30)} />
            </TouchableOpacity>
          </View>

          {adjustType === "Issue" ? (
            <>
              <View style={styles.dropdown}>
                <Inv_CustomDropdown
                  dropdownId="from_sub"
                  openDropdownId={openDropdownId}
                  onToggleOpen={(id, isOpen) => setOpenDropdownId(isOpen ? id : null)}
                  placeholder="From Sub*"
                  value={issueFields.fromSubId}
                  onChange={(id) => setIssueFields(prev => ({ ...prev, fromSubId: id, fromLocId: null, maxQty: 0 }))}
                  options={fromSubOptions}
                  idKey="value"
                  nameKey="label"
                  disabled={!issueFields.itemId}
                  selectedwidth={SCREEN_WIDTH - (2 * H_PADDING)}
                  menuWidth={INVENTORY_MENU_WIDTH}
                />
              </View>
              <View style={styles.dropdown}>
                {!!issueFields.fromSubId && (
                  <Inv_CustomDropdown
                    dropdownId="from_loc"
                    openDropdownId={openDropdownId}
                    onToggleOpen={(id, isOpen) => setOpenDropdownId(isOpen ? id : null)}
                    placeholder="From Locator*"
                    value={issueFields.fromLocId}
                    onChange={(id) => {
                      const opt = findOption(fromLocatorOptions, id);
                      const nextMax = Number(opt?.on_hand_qty ?? 0);
                      setIssueFields(prev => ({ ...prev, fromLocId: id, maxQty: nextMax, qty: Math.min(prev.qty, nextMax) }));
                    }}
                    options={fromLocatorOptions}
                    idKey="value"
                    nameKey="label"
                    disabled={!issueFields.fromSubId}
                    selectedwidth={SCREEN_WIDTH - (2 * H_PADDING)}
                    menuWidth={INVENTORY_MENU_WIDTH}
                  />
                )}
              </View>
            </>
          ) : (
            <>
              <View style={styles.dropdown}>
                <Inv_CustomDropdown
                  dropdownId="to_sub"
                  openDropdownId={openDropdownId}
                  onToggleOpen={(id, isOpen) => setOpenDropdownId(isOpen ? id : null)}
                  placeholder="To Sub*"
                  value={receiptFields.toSubId}
                  onChange={(id) => setReceiptFields(prev => ({ ...prev, toSubId: id, toLocId: null }))}
                  options={toSubOptions}
                  idKey="value"
                  nameKey="label"
                  disabled={!receiptFields.itemId}
                  selectedwidth={SCREEN_WIDTH - (2 * H_PADDING)}
                  menuWidth={INVENTORY_MENU_WIDTH}
                />
              </View>
              <View style={styles.dropdown}>
                {!!receiptFields.toSubId && (
                  <Inv_CustomDropdown
                    dropdownId="to_loc"
                    openDropdownId={openDropdownId}
                    onToggleOpen={(id, isOpen) => setOpenDropdownId(isOpen ? id : null)}
                    placeholder="To Locator*"
                    value={receiptFields.toLocId}
                    onChange={(id) => setReceiptFields(prev => ({ ...prev, toLocId: id }))}
                    options={toLocatorOptions}
                    idKey="value"
                    nameKey="label"
                    disabled={!receiptFields.toSubId}
                    selectedwidth={SCREEN_WIDTH - (2 * H_PADDING)}
                    menuWidth={INVENTORY_MENU_WIDTH}
                  />
                )}
              </View>
            </>
          )}

          <View style={styles.uomRow}>
            <Inv_CustomDropdown
              dropdownId="uom"
              openDropdownId={openDropdownId}
              onToggleOpen={(id, isOpen) => setOpenDropdownId(isOpen ? id : null)}
              placeholder="Select UOM*"
              value={activeFields.uomId}
              onChange={(id) => {
                if (adjustType === "Issue") setIssueFields(prev => ({ ...prev, uomId: id }));
                else setReceiptFields(prev => ({ ...prev, uomId: id }));
              }}
              options={UOMOptions}
              idKey="value"
              nameKey="label"
              disabled={adjustType === "Issue" ? !issueFields.fromLocId : !receiptFields.toLocId}
              selectedwidth={UOM_FIELD_W}
              menuWidth={INVENTORY_MENU_WIDTH}
            />
            <View style={styles.qtyCol}>
              <Inv_CustomNumericInput
                value={activeFields.qty}
                setValue={(v) => {
                  if (adjustType === "Issue") setIssueFields(prev => ({ ...prev, qty: v }));
                  else setReceiptFields(prev => ({ ...prev, qty: v }));
                }}
                width={QTY_W}
                height={ms(40)}
                disabledinput={!activeFields.uomId}
                min={0}
                max={activeFields.maxQty || 999999}
                step={1}
              />
            </View>
          </View>

          <View style={{ height: ms(24) }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <Inv_FooterBtnComponent leftLabel="Cancel" rightLabel="Update" rightEnabled={isUpdateEnabled} onLeftPress={() => navigation.navigate("Inv_Adj_SummaryScreen", { adjustmentType: adjustType })} onRightPress={onUpdate} />

      <Modal visible={showScanner} animationType="slide" onRequestClose={() => setShowScanner(false)}>
        <BarcodeScanner onScan={handleScan} onClose={() => setShowScanner(false)} />
      </Modal>

      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F6F8FA" },
  content: { paddingHorizontal: ms(2), paddingTop: ms(12) },
  dropdown: { marginTop: ms(10) },
  itemRow: { flexDirection: "row", alignItems: "center", marginTop: ms(10) },
  scanBtn: { height: ms(40), width: ms(40), backgroundColor: "#EFEFF0", borderRadius: ms(4), alignItems: "center", justifyContent: "center", marginLeft: ms(-10), marginTop: ms(12) },
  uomRow: { flexDirection: "row", alignItems: "center", marginTop: ms(20) },
  qtyCol: { alignItems: "flex-end", justifyContent: "flex-end", marginRight: ms(8), marginTop: ms(10) },
  adjustTypeRow: { backgroundColor: "#E4E9EF", paddingVertical: ms(12), paddingHorizontal: ms(16), flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  adjustLabel: { fontSize: ms(14), color: "#233E55", fontWeight: "600" },
  radioGroup: { flexDirection: "row", gap: ms(20), alignItems: "center" },
  radioRow: { flexDirection: "row", alignItems: "center", gap: ms(6) },
  radioText: { fontSize: ms(14), color: "#233E55" }
});
