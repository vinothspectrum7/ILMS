import React, { useCallback, useMemo, useRef, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { GestureHandlerRootView, Swipeable } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import GlobalHeaderComponent from "../../components/GlobalHeaderComponent";
import FooterButtonsComponent from "../../components/FooterButtonsComponent";
import ConfirmModalComponent from "../../components/ConfirmModalComponent";
import FailureSvg from "../../assets/icons/failure.svg";
import TransferConfirm from "../../assets/icons/Transfer_success.svg";
import EditIcon from "../../assets/icons/edit.svg";
import DeleteIcon from "../../assets/icons/delete.svg";
import Inv_Summary_Item_icon from "../../assets/icons/Inv_Summary_Item_icon.svg";
import Inv_Summary_Gradiant_bg from "../../assets/icons/Inv_Summary_Gradiant_bg.svg";
import { useReceivingStore } from "../../store/receivingStore";
import { SubInventoryTransferSubmit } from "../../api/ApiServices";

export default function Inv_Adj_SummaryScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const { OrgData, subInvTransferItems, removeSubInvTransferItem, resetSubInvTransfer } = useReceivingStore();

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [saveModalStatus, setSaveModalStatus] = useState("success");
  const swipeRefs = useRef({});
  const [rowHeights, setRowHeights] = useState({});
  const [expandedLoc, setExpandedLoc] = useState({});

  const itemsAll = Array.isArray(subInvTransferItems) ? subInvTransferItems : [];
  const routeType = route?.params?.adjustmentType;
  const preferredType = useMemo(
    () => routeType ?? (itemsAll[0]?.adjustmentType ?? "Issue"),
    [routeType, itemsAll]
  );

  const items = useMemo(
    () => itemsAll.filter((i) => (i.adjustmentType || "Issue") === preferredType),
    [itemsAll, preferredType]
  );

  const cartCount = items.length;
  const PILL_HEIGHT = 56;
  const EXPANDED_PILL_HEIGHT = 80;

  const onConfirmOpen = () => {
    if (!items.length) {
      Toast.show({ type: "info", text1: "No items to confirm", position: "top", visibilityTime: 2000 });
      return;
    }
    setConfirmVisible(true);
  };

  const AddMore = () => {
    navigation.navigate("Inv_Adj_AddmoreScreen", { cartcount: cartCount, adjustmentType: preferredType });
  };

  const closeOthers = (id) => {
    Object.entries(swipeRefs.current).forEach(([key, ref]) => {
      if (key !== String(id) && ref?.close) ref.close();
    });
  };

  const onRowLayout = (id, e) => {
    const h = e.nativeEvent.layout.height || 0;
    setRowHeights((prev) => (prev[id] === h ? prev : { ...prev, [id]: h }));
  };

  const renderLeftActions = (onEdit, id) => {
    const h = rowHeights[id] || "100%";
    return (
      <View style={[styles.leftActionContainer, { height: h }]}>
        <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
          <EditIcon width={22} height={22} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderRightActions = (onDelete, id) => {
    const h = rowHeights[id] || "100%";
    return (
      <View style={[styles.rightActionContainer, { height: h }]}>
        <TouchableOpacity onPress={onDelete} style={styles.actionButton}>
          <DeleteIcon width={22} height={22} />
        </TouchableOpacity>
      </View>
    );
  };

  const handleEdit = useCallback(
    (indexInFiltered) => {
      const absoluteIndex = itemsAll.findIndex((x) => x === items[indexInFiltered]);
      navigation.navigate("Inv_Adj_EditScreen", {
        itemToEdit: items[indexInFiltered],
        EditIndex: absoluteIndex,
        adjustmentType: preferredType,
        cartcount: cartCount,
      });
    },
    [navigation, items, itemsAll, preferredType, cartCount]
  );

  const handleDelete = useCallback(
    (indexInFiltered) => {
      const absoluteIndex = itemsAll.findIndex((x) => x === items[indexInFiltered]);
      if (absoluteIndex >= 0) {
        removeSubInvTransferItem(absoluteIndex);
        Toast.show({ type: "success", text1: "Removed from summary", position: "top", visibilityTime: 1200 });
      }
    },
    [removeSubInvTransferItem, items, itemsAll]
  );

  const mapPayload = (data) =>
    data.map((backend) => ({
      item_id: backend.item_id ?? null,
      from_sub_inv_id: backend.from_sub ?? null,
      to_sub_inv_id: backend.to_sub ?? null,
      from_org_id: OrgData?.selectedOrg ?? null,
      to_org_id: OrgData?.selectedOrg ?? null,
      from_loc_id: backend.from_locator ?? null,
      to_loc_id: backend.to_locator ?? null,
      lot_number: "",
      type: "inventory_adjustment",
      adjustment_type: backend.adjustmentType || preferredType,
      qty: backend.qty ?? 0,
      uom: backend.uom ?? "",
    }));

  const confirmAction = async () => {
    if (!items.length) return { success: false, message: "No items to confirm" };
    const payload = { transactions: mapPayload(items) };
    try {
      const response = await SubInventoryTransferSubmit(payload);
      if (response == "Inventory transfer successful.") {
        onConfirmSuccess();
      } else {
        onConfirmFailure();
      }
    } catch {
      onConfirmFailure();
      setTimeout(() => setSaveModalVisible(false), 1500);
    }
  };

  const onConfirmSuccess = () => {
    setConfirmVisible(false);
    setSaveModalStatus("success");
    setSaveModalVisible(true);
    setTimeout(() => {
      setSaveModalVisible(false);
      navigation.navigate("Inventory");
    }, 5000);
    resetSubInvTransfer();
  };

  const onConfirmFailure = () => {
    setConfirmVisible(false);
    setSaveModalStatus("failure");
    setSaveModalVisible(true);
  };

  const clearAll = () => {
    if (!itemsAll.length) return;
    resetSubInvTransfer();
    Toast.show({ type: "success", text1: "Cleared all", position: "top", visibilityTime: 1200 });
  };

  const renderItemCard = (item, indexInFiltered) => {
    const id = String(item.item_id ?? item.id ?? indexInFiltered);
    const qtyText = [item.qty, item.uom_label || item.uom].filter(Boolean).join(" ");
    const fromSub = item.from_sub_name ?? item.fromSub ?? "-";
    const fromLoc = item.from_locator_name ?? item.fromLocator ?? "-";
    const toSub = item.to_sub_name ?? item.toSub ?? "-";
    const toLoc = item.to_locator_name ?? item.toLocator ?? "-";
    const itemCode = item.item_code ?? item.item ?? "-";
    const isLocExpanded = expandedLoc[id] || false;
    const gradBoxHeight = isLocExpanded ? EXPANDED_PILL_HEIGHT : PILL_HEIGHT;

    const leftLabel = preferredType === "Issue" ? "From Sub" : "To Sub";
    const rightLabel = preferredType === "Issue" ? "From Locator" : "To Locator";
    const leftValue = preferredType === "Issue" ? fromSub : toSub;
    const rightValue = preferredType === "Issue" ? fromLoc : toLoc;

    return (
      <Swipeable
        ref={(r) => (swipeRefs.current[id] = r)}
        key={id}
        renderLeftActions={() => renderLeftActions(() => handleEdit(indexInFiltered), id)}
        renderRightActions={() => renderRightActions(() => handleDelete(indexInFiltered), id)}
        onSwipeableOpen={() => closeOthers(id)}
      >
        <View style={styles.card} onLayout={(e) => onRowLayout(id, e)}>
          <View style={styles.cardHeader}>
            <View style={styles.itemCol}>
              <Inv_Summary_Item_icon width={20} height={20} />
              <View style={{ alignItems: "flex-start" }}>
                <Text style={styles.label}>Item</Text>
                <Text style={styles.itemText}>{itemCode}</Text>
              </View>
            </View>
            <Text style={styles.qtyText}>{qtyText}</Text>
          </View>

          <View style={[styles.gradientBox, { height: gradBoxHeight }]}>
            <Inv_Summary_Gradiant_bg width="100%" height="100%" preserveAspectRatio="none" style={StyleSheet.absoluteFill} />
            <View style={styles.singleRow}>
              <View style={styles.col}>
                <Text style={styles.label}>{leftLabel}</Text>
                <Text style={styles.value} numberOfLines={1}>{leftValue}</Text>
              </View>
              <View style={styles.col}>
                <Text style={styles.label}>{rightLabel}</Text>
                <TouchableOpacity style={{ width: "100%" }} onPress={() => setExpandedLoc((pre) => ({ ...pre, [id]: !isLocExpanded }))}>
                  <Text style={[styles.value, { width: "100%" }]} numberOfLines={isLocExpanded ? 2 : 1} ellipsizeMode="tail">
                    {rightValue}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Swipeable>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <GlobalHeaderComponent
        organizationName={OrgData?.selectedOrgCode}
        screenTitle="Inventory Adjustments"
        notificationCount={0}
        onBack={() => navigation.goBack()}
      />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{`Summary - ${preferredType}`}</Text>
          <TouchableOpacity onPress={clearAll}>
            <Text style={styles.clearAll}>Clear All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          {items.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>No Data Available</Text>
            </View>
          ) : (
            items.map((it, idx) => renderItemCard(it, idx))
          )}
        </ScrollView>
      </View>

      <FooterButtonsComponent
        leftLabel="Add More"
        rightLabel="Confirm"
        onLeftPress={AddMore}
        onRightPress={onConfirmOpen}
        leftEnabled
        rightEnabled
      />

      <ConfirmModalComponent
        visible={confirmVisible}
        title="Confirmation"
        message={`Are you sure want to ${preferredType === "Issue" ? "issue" : "receive"} this Inventory`}
        confirmAction={confirmAction}
        onCancel={() => setConfirmVisible(false)}
        successMessage={`Inventory ${preferredType} created successfully`}
      />

      <Modal visible={saveModalVisible} transparent animationType="fade" onRequestClose={() => {}}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            {saveModalStatus === "success" ? <TransferConfirm width={72} height={72} /> : <FailureSvg width={72} height={72} />}
            <Text style={styles.modalText}>
              {saveModalStatus === "success"
                ? `Inventory ${preferredType} created successfully`
                : "Save failed. Please try again."}
            </Text>
          </View>
        </View>
      </Modal>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F8FB", paddingHorizontal: 16, paddingTop: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  title: { fontSize: 18, fontWeight: "600", color: "#3A3A3C" },
  clearAll: { fontSize: 14, color: "#5D768B", fontWeight: "600", textDecorationLine: "underline" },
  card: { backgroundColor: "#FFFFFF", borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "#E5E7EB", shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  itemCol: { flexDirection: "row", alignItems: "center", columnGap: 8 },
  itemText: { fontSize: 12, fontWeight: "700", color: "#233E55" },
  qtyText: { fontSize: 12, fontWeight: "700", color: "#233E55" },
  gradientBox: { borderRadius: 12, overflow: "hidden" },
  singleRow: { height: "100%", flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16 },
  col: { flex: 1, alignItems: "flex-start", marginRight: 8 },
  label: { fontSize: 10, color: "rgba(35, 62, 85, 1)", marginBottom: 2, fontWeight: "400" },
  value: { fontSize: 12, color: "rgba(35, 62, 85, 1)", fontWeight: "700" },
  leftActionContainer: { backgroundColor: "#ECF1F7", justifyContent: "center", alignItems: "flex-start", width: 46, borderTopLeftRadius: 12, borderBottomLeftRadius: 12 },
  rightActionContainer: { backgroundColor: "#F8D2D4", justifyContent: "center", alignItems: "flex-end", width: 46, borderTopRightRadius: 12, borderBottomRightRadius: 12 },
  actionButton: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 10 },
  emptyWrap: { paddingVertical: 48, justifyContent: "center", alignItems: "center" },
  emptyText: { fontSize: 16, color: "#6B7280" },
  modalBackdrop: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.4)" },
  modalCard: { backgroundColor: "white", borderRadius: 12, padding: 24, alignItems: "center", width: "80%" },
  modalText: { marginTop: 16, textAlign: "center", fontSize: 16, color: "#333" },
});
