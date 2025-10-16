import React, { useCallback, useMemo, useRef, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { GestureHandlerRootView, Swipeable } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import GlobalHeaderComponent from "../../components/GlobalHeaderComponent";
import FooterButtonsComponent from "../../components/FooterButtonsComponent";
import ConfirmModalComponent from "../../components/ConfirmModalComponent";
import ConfirmSvg from "../../assets/icons/success.svg";
import FailureSvg from "../../assets/icons/failure.svg";
import EditIcon from "../../assets/icons/edit.svg";
import DeleteIcon from "../../assets/icons/delete.svg";
import Inv_Summary_Item_icon from "../../assets/icons/Inv_Summary_Item_icon.svg";
import Inv_Summary_Gradiant_bg from "../../assets/icons/Inv_Summary_Gradiant_bg.svg";
import CenterDivider from "../../assets/icons/inv_summary_divider_icon.svg";
import { useReceivingStore } from "../../store/receivingStore";

export default function Inv_TransferSummaryScreen() {
  const navigation = useNavigation();
  const {
    OrgData,
    subInvTransferItems,
    editSubInvTransferItem,
    removeSubInvTransferItem,
    resetSubInvTransfer,
  } = useReceivingStore();

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [saveModalStatus, setSaveModalStatus] = useState("success");
  const swipeRefs = useRef({});
  const [rowHeights, setRowHeights] = useState({});
  const items = useMemo(() => Array.isArray(subInvTransferItems) ? subInvTransferItems : [], [subInvTransferItems]);
  const cartCount = items.length;
  const PILL_HEIGHT = 56;

  const onConfirmOpen = () => {
    if (!items.length) {
      Toast.show({ type: "info", text1: "No items to confirm", position: "top", visibilityTime: 2000 });
      return;
    }
    setConfirmVisible(true);
  };

  const AddMore = () => {
    navigation.navigate("Sub_Inv_Addmore", { cartcount: cartCount });
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

  const handleEdit = useCallback((item) => {
    editSubInvTransferItem({ item_id: item.item_id });
    Toast.show({ type: "success", text1: "Edit ready", position: "top", visibilityTime: 1200 });
  }, [editSubInvTransferItem]);

  const handleDelete = useCallback((index) => {
    removeSubInvTransferItem(index);
    Toast.show({ type: "success", text1: "Removed from summary", position: "top", visibilityTime: 1200 });
  }, [removeSubInvTransferItem]);

  const confirmAction = async () => {
    if (!items.length) return { success: false, message: "No items to confirm" };
    return { success: true, message: "Sub Inventory Transfer created successfully" };
  };

  const onConfirmSuccess = () => {
    setConfirmVisible(false);
    setSaveModalStatus("success");
    setSaveModalVisible(true);
    resetSubInvTransfer();
  };

  const onConfirmFailure = () => {
    setConfirmVisible(false);
    setSaveModalStatus("failure");
    setSaveModalVisible(true);
  };

  const clearAll = () => {
    if (!items.length) return;
    resetSubInvTransfer();
    Toast.show({ type: "success", text1: "Cleared all", position: "top", visibilityTime: 1200 });
  };

  const renderItemCard = (item, index) => {
    const id = String(item.item_id ?? item.id ?? index);
    const qtyText = [item.qty, item.uom].filter(Boolean).join(" ");
    const fromSub = item.from_sub ?? item.fromSub ?? "-";
    const fromLoc = item.from_locator ?? item.fromLocator ?? "-";
    const toSub = item.to_sub ?? item.toSub ?? "-";
    const toLoc = item.to_locator ?? item.toLocator ?? "-";
    const itemCode = item.item_code ?? item.item ?? "-";

    return (
      <Swipeable
        ref={(r) => (swipeRefs.current[id] = r)}
        key={id}
        renderLeftActions={() => renderLeftActions(() => handleEdit(item), id)}
        renderRightActions={() => renderRightActions(() => handleDelete(index), id)}
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

          <View style={[styles.gradientBox, { height: PILL_HEIGHT }]}>
            <Inv_Summary_Gradiant_bg
              width="100%"
              height="100%"
              preserveAspectRatio="none"
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.detailsRow}>
              <View style={styles.detailsHalf}>
                <View style={styles.col}>
                  <Text style={styles.label}>From Sub</Text>
                  <Text style={styles.value} numberOfLines={1}>{fromSub}</Text>
                </View>
                <View style={styles.col}>
                  <Text style={styles.label}>From Locator</Text>
                  <Text style={styles.value} numberOfLines={1}>{fromLoc}</Text>
                </View>
              </View>

              <View style={styles.centerIcon}>
                <CenterDivider width={24} height={24} />
              </View>

              <View style={styles.detailsHalf}>
                <View style={styles.col}>
                  <Text style={styles.label}>To Sub</Text>
                  <Text style={styles.value} numberOfLines={1}>{toSub}</Text>
                </View>
                <View style={styles.col}>
                  <Text style={styles.label}>To Locator</Text>
                  <Text style={styles.value} numberOfLines={1}>{toLoc}</Text>
                </View>
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
        screenTitle="Inventory"
        notificationCount={0}
        onBack={() => navigation.navigate("Inventory")}
      />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Summary</Text>
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
        message="Are you sure want to transfer this Inventory"
        confirmAction={confirmAction}
        onCancel={() => setConfirmVisible(false)}
        onSuccess={onConfirmSuccess}
        onFailure={onConfirmFailure}
        successMessage="Sub Inventory Transfer created successfully"
      />

      <Modal visible={saveModalVisible} transparent animationType="fade" onRequestClose={() => {}}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            {saveModalStatus === "success" ? <ConfirmSvg width={72} height={72} /> : <FailureSvg width={72} height={72} />}
            <Text style={styles.modalText}>
              {saveModalStatus === "success"
                ? "Sub Inventory Transfer created successfully"
                : "Save failed. Please try again."}
            </Text>
            <TouchableOpacity style={styles.modalBtn} onPress={() => setSaveModalVisible(false)}>
              <Text style={styles.modalBtnText}>OK</Text>
            </TouchableOpacity>
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
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  itemCol: { flexDirection: "row", alignItems: "center", columnGap: 8 },
  itemText: { fontSize: 16, fontWeight: "700", color: "#233E55" },
  qtyText: { fontSize: 15, fontWeight: "700", color: "#233E55" },
  gradientBox: { borderRadius: 12, overflow: "hidden" },
  detailsRow: {
    height: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  detailsHalf: { flex: 1, flexDirection: "row", alignItems: "center" },
  col: { flex: 1, alignItems: "flex-start", marginRight: 8 },
  label: { fontSize: 12, color: "rgba(35, 62, 85, 1)", marginBottom: 2, fontWeight: "400" },
  value: { fontSize: 14, color: "rgba(35, 62, 85, 1)", fontWeight: "700" },
  centerIcon: { justifyContent: "center", alignItems: "center", paddingHorizontal: 8 },
  leftActionContainer: {
    backgroundColor: "#ECF1F7",
    justifyContent: "center",
    alignItems: "flex-start",
    width: 46,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  rightActionContainer: {
    backgroundColor: "#F8D2D4",
    justifyContent: "center",
    alignItems: "flex-end",
    width: 46,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  actionButton: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 10 },
  emptyWrap: { paddingVertical: 48, justifyContent: "center", alignItems: "center" },
  emptyText: { fontSize: 16, color: "#6B7280" },
  modalBackdrop: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.4)" },
  modalCard: { backgroundColor: "white", borderRadius: 12, padding: 24, alignItems: "center", width: "80%" },
  modalText: { marginTop: 16, textAlign: "center", fontSize: 16, color: "#333" },
  modalBtn: { marginTop: 16, paddingVertical: 10, paddingHorizontal: 24, backgroundColor: "#233E55", borderRadius: 10 },
  modalBtnText: { color: "#fff", fontWeight: "700" },
});
