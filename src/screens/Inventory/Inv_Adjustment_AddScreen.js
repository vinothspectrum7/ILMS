import React, { useState, useCallback, useEffect, useMemo } from "react";
import { View, StyleSheet, Dimensions, TouchableOpacity, Modal, KeyboardAvoidingView, Platform, ScrollView, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import Inv_HeaderComponent from "../../components/inventory/Inv_HeaderComponent";
import Inv_SingleFooterBtnComponent from "../../components/inventory/Inv_SingleFooterBtnComponent";
import Inv_CustomNumericInput from "../../components/inventory/Inv_CustomNumericInput";
import Inv_CustomDropdown from "../../components/inventory/Inv_CustomDropdown";
import BarcodeScanner from "../../components/inventory/Inv_BarCodeScanner";
import RadioGlossySelected from "../../assets/icons/RadioGlossySelected.svg";
import RadioGlossyUnselected from "../../assets/icons/RadioGlossyUnselected.svg";
import BarcodeScannerIcon from "../../assets/icons/barcodescanner.svg";
import { useReceivingStore } from "../../store/receivingStore";
import { ItemsList, LocatorList, SubInventoryList } from "../../api/ApiServices";

const BG = "#F6F8FA";
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const BASE_WIDTH = 375;
const scale = (size) => (SCREEN_WIDTH / BASE_WIDTH) * size;
const ms = (size, factor = 0.35) => size + (scale(size) - size) * factor;
const H_PADDING = ms(16);
const INVENTORY_MENU_WIDTH = SCREEN_WIDTH;
const QTY_W = scale(110);
const UOM_FIELD_W = SCREEN_WIDTH - 2 * H_PADDING - ms(12) - QTY_W;

const mkOpts = (arr, labelKey, idKey) => arr.map((o) => ({ label: o[labelKey], value: o[idKey] }));
const findOption = (options, value) => options.find((o) => String(o.value) === String(value));
const labelOf = (options, value) => findOption(options, value)?.label ?? null;

const DROPDOWN_ID = { ITEM: "item", FROM_SUB: "from_sub", FROM_LOC: "from_loc", TO_SUB: "to_sub", TO_LOC: "to_loc", UOM: "uom" };

export default function Inv_Adjustment_Add() {
  const navigation = useNavigation();
  const [adjustType, setAdjustType] = useState("Issue");
  const [showScanner, setShowScanner] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const { addSubInvTransferItem, OrgData, resetSubInvTransfer } = useReceivingStore();

  const [itemOptions, setItemOptions] = useState([]);
  const [allItemsData, setAllItemsData] = useState([]);

  const [fromSubOptions, setFromSubOptions] = useState([]);
  const [toSubOptions, setToSubOptions] = useState([]);
  const [fromLocatorOptions, setFromLocatorOptions] = useState([]);
  const [toLocatorOptions, setToLocatorOptions] = useState([]);
  const [UOMOptions, setUOMOptions] = useState([]);

  const [issueFields, setIssueFields] = useState({ itemId: null, fromSubId: null, fromLocId: null, uomId: null, qty: 0, maxQty: 0 });
  const [receiptFields, setReceiptFields] = useState({ itemId: null, toSubId: null, toLocId: null, uomId: null, qty: 0, maxQty: 0 });

  const isIssue = adjustType === "Issue";
  const activeFields = isIssue ? issueFields : receiptFields;

  const handleDropdownToggle = useCallback((id, isOpen) => setOpenDropdownId(isOpen ? id : null), []);
  const resetIssue = () => setIssueFields({ itemId: null, fromSubId: null, fromLocId: null, uomId: null, qty: 0, maxQty: 0 });
  const resetReceipt = () => setReceiptFields({ itemId: null, toSubId: null, toLocId: null, uomId: null, qty: 0, maxQty: 0 });

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
    const selectedItem = allItemsData.find((it) => String(it.item_id) === String(activeFields.itemId));
    const formattedUOM = (selectedItem?.UOM || []).map((u) => ({ label: u, value: u }));
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
    if (isIssue) {
      if (!issueFields.itemId || !issueFields.fromSubId) return;
      const fetchLocator = async () => {
        try {
          const data = await LocatorList(OrgData.selectedOrg, issueFields.itemId, issueFields.fromSubId);
          const formatted = data.map((d) => ({ label: d.locator_name, value: d.locator_id, on_hand_qty: Number(d.on_hand_qty ?? 0) }));
          setFromLocatorOptions(formatted);
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
          const formatted = data.map((d) => ({ label: d.locator_name, value: d.locator_id }));
          setToLocatorOptions(formatted);
        } catch {
          Toast.show({ type: "error", text1: "Error", text2: "Failed to load To Locators.", position: "top" });
        }
      };
      fetchLocator();
    }
  }, [issueFields.itemId, issueFields.fromSubId, receiptFields.itemId, receiptFields.toSubId, isIssue, OrgData?.selectedOrg]);

  const handleScan = useCallback(
    (value) => {
      const code = String(value).trim().toUpperCase();
      const match = itemOptions.find((p) => String(p.label).toUpperCase() === code);
      if (match) {
        if (isIssue) resetReceipt();
        else resetIssue();
        setShowScanner(false);
        if (isIssue) setIssueFields((prev) => ({ ...prev, itemId: match.value }));
        else setReceiptFields((prev) => ({ ...prev, itemId: match.value }));
        Toast.show({ type: "success", text1: "Item found", text2: match.label, position: "top" });
      } else {
        Toast.show({ type: "error", text1: "Item not found", text2: `Scanned value ${code} not found`, position: "top" });
        setShowScanner(false);
      }
    },
    [itemOptions, isIssue]
  );

  const onSelectFromLocator = (id) => {
    const opt = findOption(fromLocatorOptions, id);
    const nextMax = Number(opt?.on_hand_qty ?? 0);
    setIssueFields((prev) => ({ ...prev, fromLocId: id, maxQty: nextMax, qty: Math.min(prev.qty, nextMax) }));
  };

  const isAddEnabled = useMemo(() => {
    if (isIssue) {
      const f = issueFields;
      return !!(f.itemId && f.fromSubId && f.fromLocId && f.uomId && f.qty > 0);
    } else {
      const f = receiptFields;
      return !!(f.itemId && f.toSubId && f.toLocId && f.uomId && f.qty > 0);
    }
  }, [issueFields, receiptFields, isIssue]);

  const payloadForAdd = useMemo(() => {
    const selectedItemId = isIssue ? issueFields.itemId : receiptFields.itemId;
    const fromSubId = isIssue ? issueFields.fromSubId : null;
    const fromLocId = isIssue ? issueFields.fromLocId : null;
    const toSubId = isIssue ? null : receiptFields.toSubId;
    const toLocId = isIssue ? null : receiptFields.toLocId;
    const uomId = isIssue ? issueFields.uomId : receiptFields.uomId;
    const qty = isIssue ? issueFields.qty : receiptFields.qty;

    const itemLabel = labelOf(itemOptions, selectedItemId);
    const fromSubLabel = labelOf(fromSubOptions, fromSubId);
    const fromLocLabel = labelOf(fromLocatorOptions, fromLocId);
    const toSubLabel = labelOf(toSubOptions, toSubId);
    const toLocLabel = labelOf(toLocatorOptions, toLocId);
    const uomLabel = labelOf(UOMOptions, uomId);

    return {
      item_id: selectedItemId,
      item_code: itemLabel ?? null,
      from_sub: isIssue ? fromSubId : null,
      from_sub_name: isIssue ? fromSubLabel ?? null : null,
      from_locator: isIssue ? fromLocId : null,
      from_locator_name: isIssue ? fromLocLabel ?? null : null,
      to_sub: !isIssue ? toSubId : null,
      to_sub_name: !isIssue ? toSubLabel ?? null : null,
      to_locator: !isIssue ? toLocId : null,
      to_locator_name: !isIssue ? toLocLabel ?? null : null,
      uom: uomId,
      uom_label: uomLabel ?? null,
      qty: Number(qty),
      adjustmentType: adjustType,
    };
  }, [
    isIssue,
    issueFields,
    receiptFields,
    itemOptions,
    fromSubOptions,
    fromLocatorOptions,
    toSubOptions,
    toLocatorOptions,
    UOMOptions,
    adjustType,
  ]);

  const onAdd = useCallback(() => {
    addSubInvTransferItem(payloadForAdd);
    navigation.navigate("Inv_Adj_SummaryScreen", { adjustmentType: adjustType });
  }, [addSubInvTransferItem, payloadForAdd, navigation, adjustType]);

  const renderRadio = (label) => {
    const selected = adjustType === label;
    const Icon = selected ? RadioGlossySelected : RadioGlossyUnselected;
    return (
      <TouchableOpacity
        style={styles.radioRow}
        onPress={() => {
          setAdjustType(label);
          if (label === "Issue") resetReceipt();
          else resetIssue();

          resetSubInvTransfer();
        }}
      >
        <Icon width={ms(20)} height={ms(20)} />
        <Text style={styles.radioText}>{label}</Text>
      </TouchableOpacity>
    );
  };

  const renderLayout = () => {
    const f = activeFields;
    return (
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.itemRow}>
          <Inv_CustomDropdown
            dropdownId={DROPDOWN_ID.ITEM}
            openDropdownId={openDropdownId}
            onToggleOpen={handleDropdownToggle}
            placeholder="Select Item*"
            value={f.itemId}
            onChange={(id) => {
              if (isIssue) setIssueFields({ itemId: id, fromSubId: null, fromLocId: null, uomId: null, qty: 0, maxQty: 0 });
              else setReceiptFields({ itemId: id, toSubId: null, toLocId: null, uomId: null, qty: 0, maxQty: 0 });
            }}
            options={itemOptions}
            idKey="value"
            nameKey="label"
            disabled={false}
            selectedwidth={SCREEN_WIDTH - 2 * H_PADDING - ms(44)}
            menuWidth={INVENTORY_MENU_WIDTH}
          />
          <TouchableOpacity style={styles.scanBtn} onPress={() => setShowScanner(true)}>
            <BarcodeScannerIcon width={ms(30)} height={ms(30)} />
          </TouchableOpacity>
        </View>

        {isIssue ? (
          <>
            <View style={styles.dropdown}>
              <Inv_CustomDropdown
                dropdownId={DROPDOWN_ID.FROM_SUB}
                openDropdownId={openDropdownId}
                onToggleOpen={handleDropdownToggle}
                placeholder="From Sub*"
                value={f.fromSubId}
                onChange={(id) => setIssueFields((prev) => ({ ...prev, fromSubId: id, fromLocId: null, maxQty: 0 }))}
                options={fromSubOptions}
                idKey="value"
                nameKey="label"
                disabled={!f.itemId}
                selectedwidth={SCREEN_WIDTH - 2 * H_PADDING}
                menuWidth={INVENTORY_MENU_WIDTH}
              />
            </View>
            <View style={styles.dropdown}>
              {!!f.fromSubId && (
                <Inv_CustomDropdown
                  dropdownId={DROPDOWN_ID.FROM_LOC}
                  openDropdownId={openDropdownId}
                  onToggleOpen={handleDropdownToggle}
                  placeholder="From Locator*"
                  value={f.fromLocId}
                  onChange={onSelectFromLocator}
                  options={fromLocatorOptions}
                  idKey="value"
                  nameKey="label"
                  disabled={!f.fromSubId}
                  selectedwidth={SCREEN_WIDTH - 2 * H_PADDING}
                  menuWidth={INVENTORY_MENU_WIDTH}
                />
              )}
            </View>
          </>
        ) : (
          <>
            <View style={styles.dropdown}>
              <Inv_CustomDropdown
                dropdownId={DROPDOWN_ID.TO_SUB}
                openDropdownId={openDropdownId}
                onToggleOpen={handleDropdownToggle}
                placeholder="To Sub*"
                value={f.toSubId}
                onChange={(id) => setReceiptFields((prev) => ({ ...prev, toSubId: id, toLocId: null }))}
                options={toSubOptions}
                idKey="value"
                nameKey="label"
                disabled={!f.itemId}
                selectedwidth={SCREEN_WIDTH - 2 * H_PADDING}
                menuWidth={INVENTORY_MENU_WIDTH}
              />
            </View>
            <View style={styles.dropdown}>
              {!!f.toSubId && (
                <Inv_CustomDropdown
                  dropdownId={DROPDOWN_ID.TO_LOC}
                  openDropdownId={openDropdownId}
                  onToggleOpen={handleDropdownToggle}
                  placeholder="To Locator*"
                  value={f.toLocId}
                  onChange={(id) => setReceiptFields((prev) => ({ ...prev, toLocId: id }))}
                  options={toLocatorOptions}
                  idKey="value"
                  nameKey="label"
                  disabled={!f.toSubId}
                  selectedwidth={SCREEN_WIDTH - 2 * H_PADDING}
                  menuWidth={INVENTORY_MENU_WIDTH}
                />
              )}
            </View>
          </>
        )}

        <View style={styles.uomRow}>
          <Inv_CustomDropdown
            dropdownId={DROPDOWN_ID.UOM}
            openDropdownId={openDropdownId}
            onToggleOpen={handleDropdownToggle}
            placeholder="Select UOM*"
            value={f.uomId}
            onChange={(id) => {
              if (isIssue) setIssueFields((prev) => ({ ...prev, uomId: id }));
              else setReceiptFields((prev) => ({ ...prev, uomId: id }));
            }}
            options={UOMOptions}
            idKey="value"
            nameKey="label"
            disabled={isIssue ? !f.fromLocId : !f.toLocId}
            selectedwidth={UOM_FIELD_W}
            menuWidth={INVENTORY_MENU_WIDTH}
          />
          <View style={styles.qtyCol}>
            <Inv_CustomNumericInput
              value={f.qty}
              setValue={(v) => {
                if (isIssue) setIssueFields((prev) => ({ ...prev, qty: v }));
                else setReceiptFields((prev) => ({ ...prev, qty: v }));
              }}
              width={QTY_W}
              height={ms(40)}
              disabledinput={!f.uomId}
              min={0}
              max={f.maxQty || 999999}
              step={1}
            />
          </View>
        </View>

        <View style={{ height: ms(24) }} />
      </ScrollView>
    );
  };

  return (
    <View style={styles.safe}>
      <Inv_HeaderComponent organizationName={OrgData?.selectedOrgCode} screenTitle="Inventory Adjustments" notificationCount={0} onBack={() => navigation.goBack()} onMenu={() => navigation.toggleDrawer?.()} />
      <View style={styles.adjustTypeRow}>
        <Text style={styles.adjustLabel}>Select Adjustment Type</Text>
        <View style={styles.radioGroup}>
          {renderRadio("Issue")}
          {renderRadio("Receipt")}
        </View>
      </View>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.select({ ios: "padding", android: undefined })}>
        {renderLayout()}
      </KeyboardAvoidingView>
      <Inv_SingleFooterBtnComponent rightLabel="Add" enabled={isAddEnabled} onRightPress={onAdd} />
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
  itemRow: { flexDirection: "row", alignItems: "center", marginTop: ms(10) },
  scanBtn: { height: ms(40), width: ms(40), backgroundColor: "#EFEFF0", borderRadius: ms(4), alignItems: "center", justifyContent: "center", marginLeft: ms(-10), marginTop: ms(12) },
  uomRow: { flexDirection: "row", alignItems: "center", marginTop: ms(20) },
  qtyCol: { alignItems: "flex-end", justifyContent: "flex-end", marginRight: ms(8), marginTop: ms(10) },
  adjustTypeRow: { backgroundColor: "#E4E9EF", paddingVertical: ms(12), paddingHorizontal: ms(16), flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  adjustLabel: { fontSize: ms(14), color: "#233E55", fontWeight: "600" },
  radioGroup: { flexDirection: "row", gap: ms(20), alignItems: "center" },
  radioRow: { flexDirection: "row", alignItems: "center", gap: ms(6) },
  radioText: { fontSize: ms(14), color: "#233E55" },
});
