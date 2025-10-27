import React, { useCallback, useMemo, useRef, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { GestureHandlerRootView, Swipeable } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import GlobalHeaderComponent from "../../../components/GlobalHeaderComponent";
import FooterButtonsComponent from "../../../components/FooterButtonsComponent";
import ConfirmModalComponent from "../../../components/ConfirmModalComponent";
import TransferConfirm from "../../../assets/icons/org_success.svg";
import FailureSvg from "../../../assets/icons/failure.svg";
import EditIcon from "../../../assets/icons/edit.svg";
import DeleteIcon from "../../../assets/icons/delete.svg";
import Inv_Summary_Item_icon from "../../../assets/icons/Inv_Summary_Item_icon.svg";
import Inv_Summary_Gradiant_bg from "../../../assets/icons/Inv_Summary_Gradiant_bg.svg";
import CenterDivider from "../../../assets/icons/inv_summary_divider_icon.svg";
import { useReceivingStore } from "../../../store/receivingStore";
import { SubInventoryTransferSubmit } from "../../../api/ApiServices";
import OrglistIcon from "../../../assets/icons/org_group.svg";

export default function Org_TransferSummaryScreen() {
  const navigation = useNavigation();
  const {
    OrgData,
    OrgnaizationTransferItems,
    removeOrgnaizationTransferItems,
    resetOrgnaizationTransferItems,
    Orgtransferdetails,
  } = useReceivingStore();

  const monthMap = { Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06", Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12" };

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [saveModalStatus, setSaveModalStatus] = useState("success");
  const [ErrorMessage, setErrorMessage] = useState("");
  const swipeRefs = useRef({});
  const [rowHeights, setRowHeights] = useState({});
  const [expandedCards, setExpandedCards] = useState({});
  const items = useMemo(() => (Array.isArray(OrgnaizationTransferItems) ? OrgnaizationTransferItems : []), [OrgnaizationTransferItems]);
  const OrgnaizationDetails = useMemo(() => (Orgtransferdetails ? Orgtransferdetails : {}), [Orgtransferdetails]);
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
    navigation.navigate("Org_Transfer_Addmore", { cartcount: cartCount });
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
    (item, index) => {
      navigation.navigate("Org_Edit_TransferScreen", { itemToEdit: item, EditIndex: index, OrgnaizationDetails: OrgnaizationDetails });
    },
    [navigation, OrgnaizationDetails]
  );

  const handleDelete = useCallback(
    (index) => {
      removeOrgnaizationTransferItems(index);
      Toast.show({ type: "success", text1: "Removed from summary", position: "top", visibilityTime: 1200 });
    },
    [removeOrgnaizationTransferItems]
  );

  const Mapconfirmdata = (data) => {
    let formattedDate = null;
    if (OrgnaizationDetails?.receiptDate) {
      const [day, monthStr, year] = OrgnaizationDetails.receiptDate.split(" ");
      const month = monthMap[monthStr];
      formattedDate = `${year}-${month}-${String(day).padStart(2, "0")}`;
    }
    return data.map((backend) => ({
      item_id: backend.item_id ?? null,
      from_sub_inv_id: backend.from_sub ?? null,
      to_sub_inv_id: backend.to_sub ?? null,
      from_org_id: OrgData?.selectedOrg ?? null,
      to_org_id: OrgnaizationDetails?.To_org ?? null,
      from_loc_id: backend.from_locator ?? null,
      to_loc_id: backend.to_locator ?? null,
      lot_number: "",
      type: "org_inv_transfer",
      qty: backend.qty ?? 0,
      uom: backend.uom ?? "",
      shipment_number: OrgnaizationDetails?.shipmentNumber,
      waybill: OrgnaizationDetails?.waybill,
      expected_rcpt_dt: formattedDate,
    }));
  };

  const confirmAction = async () => {
    if (!items.length) return { success: false, message: "No items to confirm" };
    const payload = { transactions: Mapconfirmdata(items) };
    try {
      const response = await SubInventoryTransferSubmit(payload);
      if (response == "Inventory transfer successful.") {
        onConfirmSuccess();
      } else {
        onConfirmFailure();
        setErrorMessage("ORG Transfer failed. Please try again.");
      }
    } catch (err) {
      onConfirmFailure();
      setErrorMessage(err?.detail);
      setTimeout(() => {
        setSaveModalVisible(false);
      }, 5000);
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
    resetOrgnaizationTransferItems();
  };

  const onConfirmFailure = () => {
    setConfirmVisible(false);
    setSaveModalStatus("failure");
    setSaveModalVisible(true);
  };

  const clearAll = () => {
    if (!items.length) return;
    resetOrgnaizationTransferItems();
    Toast.show({ type: "success", text1: "Cleared all", position: "top", visibilityTime: 1200 });
  };

  const toggleCard = (id) => {
    setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderItemCard = (item, index) => {
    const id = String(item.item_id ?? item.id ?? index);
    const isExpanded = !!expandedCards[id];
    const qtyText = [item.qty, item.uom_label].filter(Boolean).join(" ");
    const fromSub = item.from_sub_name ?? item.fromSub ?? "-";
    const fromLoc = item.from_locator_name ?? item.fromLocator ?? "-";
    const toSub = item.to_sub_name ?? item.toSub ?? "-";
    const toLoc = item.to_locator_name ?? item.toLocator ?? "-";
    const itemCode = item.item_code ?? item.item ?? "-";
    const gradBoxHeight = isExpanded ? EXPANDED_PILL_HEIGHT : PILL_HEIGHT;
    const lines = isExpanded ? 2 : 1;

    return (
      <Swipeable
        ref={(r) => (swipeRefs.current[id] = r)}
        key={id}
        renderLeftActions={() => renderLeftActions(() => handleEdit(item, index), id)}
        renderRightActions={() => renderRightActions(() => handleDelete(index), id)}
        onSwipeableOpen={() => closeOthers(id)}
      >
        <Pressable onPress={() => toggleCard(id)} android_ripple={null} style={{ width: "100%" }}>
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
              <View style={styles.detailsRow}>
                <View style={styles.detailsHalf}>
                  <View style={styles.col}>
                    <View style={{ flexDirection: "column", width: "100%" }}>
                      <View style={styles.topcol}>
                        <Text style={styles.label}>From Sub</Text>
                      </View>
                      <View style={styles.bottomcol}>
                        <Text style={[styles.value, { width: "100%" }]} numberOfLines={lines} ellipsizeMode="tail">
                          {fromSub}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.col}>
                    <View style={{ flexDirection: "column", width: "100%" }}>
                      <View style={styles.topcol}>
                        <Text style={styles.label}>From Locator</Text>
                      </View>
                      <View style={styles.bottomcol}>
                        <Text style={[styles.value, { width: "100%" }]} numberOfLines={lines} ellipsizeMode="tail">
                          {fromLoc}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                <View style={styles.centerIcon}>
                  <CenterDivider width={20} height={20} />
                </View>

                <View style={styles.detailsHalf}>
                  <View style={styles.col}>
                    <View style={{ flexDirection: "column", width: "100%" }}>
                      <View style={styles.topcol}>
                        <Text style={styles.label}>To Sub</Text>
                      </View>
                      <View style={styles.bottomcol}>
                        <Text style={[styles.value, { width: "100%" }]} numberOfLines={lines} ellipsizeMode="tail">
                          {toSub}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.col}>
                    <View style={{ flexDirection: "column", width: "100%" }}>
                      <View style={styles.topcol}>
                        <Text style={styles.label}>To Locator</Text>
                      </View>
                      <View style={styles.bottomcol}>
                        <Text style={[styles.value, { width: "100%" }]} numberOfLines={lines} ellipsizeMode="tail">
                          {toLoc}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </Pressable>
      </Swipeable>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <GlobalHeaderComponent
        organizationName={OrgData?.selectedOrgCode}
        screenTitle="Organization Transfer"
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

        <View className="orgcard" style={styles.orgcard}>
          <View style={styles.cardHeader}>
            <View style={styles.itemCol}>
              <OrglistIcon width={20} height={20} />
              <View style={{ alignItems: "flex-start" }}>
                <Text style={styles.orgtext}>{OrgnaizationDetails?.orglabel} ORG</Text>
              </View>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.fieldContainer}>
              <Text style={styles.orglabel}>Shipment Number</Text>
              <Text style={styles.orgvalue} numberOfLines={1}>{OrgnaizationDetails?.shipmentNumber}</Text>
            </View>
            <View style={styles.fieldContainer}>
              <Text style={styles.orglabel}>Waybill</Text>
              <Text style={styles.orgvalue} numberOfLines={1}>{OrgnaizationDetails?.waybill}</Text>
            </View>
            <View style={styles.fieldContainer}>
              <Text style={styles.orglabel}>Expected Receipt Date</Text>
              <Text style={styles.orgvalue} numberOfLines={1}>{OrgnaizationDetails?.receiptDate}</Text>
            </View>
          </View>
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
        successMessage="ORG Transfer created successfully"
      />

      <Modal visible={saveModalVisible} transparent animationType="fade" onRequestClose={() => {}}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            {saveModalStatus === "success" ? <TransferConfirm width={72} height={72} /> : <FailureSvg width={72} height={72} />}
            <Text style={styles.modalText}>
              {saveModalStatus === "success" ? "ORG Transfer created successfully" : ErrorMessage}
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
  orgtext: { fontFamily: "Mulish", fontWeight: "bold", fontStyle: "normal", fontSize: 12 },
  qtyText: { fontSize: 12, fontWeight: "700", color: "#233E55" },
  gradientBox: { borderRadius: 12, overflow: "hidden" },
  detailsRow: { height: "100%", flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 8 },
  detailsHalf: { flex: 1, flexDirection: "row" },
  col: { flex: 1, alignItems: "flex-start", marginRight: 8 },
  label: { fontSize: 10, color: "rgba(35, 62, 85, 1)", marginBottom: 2, fontWeight: "400" },
  value: { fontSize: 12, color: "rgba(35, 62, 85, 1)", fontWeight: "700" },
  centerIcon: { justifyContent: "center", alignItems: "center", paddingHorizontal: 8 },
  leftActionContainer: { backgroundColor: "#ECF1F7", justifyContent: "center", alignItems: "flex-start", width: 46, borderTopLeftRadius: 12, borderBottomLeftRadius: 12 },
  rightActionContainer: { backgroundColor: "#F8D2D4", justifyContent: "center", alignItems: "flex-end", width: 46, borderTopRightRadius: 12, borderBottomRightRadius: 12 },
  actionButton: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 10 },
  emptyWrap: { paddingVertical: 48, justifyContent: "center", alignItems: "center" },
  emptyText: { fontSize: 16, color: "#6B7280" },
  modalBackdrop: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.4)" },
  modalCard: { backgroundColor: "white", borderRadius: 12, padding: 24, alignItems: "center", width: "80%" },
  modalText: { marginTop: 16, textAlign: "center", fontSize: 16, color: "#333" },
  modalBtn: { marginTop: 16, paddingVertical: 10, paddingHorizontal: 24, backgroundColor: "#233E55", borderRadius: 10 },
  modalBtnText: { color: "#fff", fontWeight: "700" },
  orgcard: { borderWidth: 1, borderColor: "#d0d0d0", borderRadius: 8, padding: 12, marginBottom: 16, backgroundColor: "#D9E4EE", shadowColor: "#000", shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 2 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  fieldContainer: { flex: 1, marginHorizontal: 4 },
  orglabel: { fontFamily: "Mulish", fontWeight: "500", fontSize: 11, color: "#595A5C", marginBottom: 4 },
  orgvalue: { fontSize: 12, color: "rgba(35, 62, 85, 1)", fontWeight: "700" },
  topcol: { justifyContent: "flex-start", alignItems: "flex-start", width: "100%" },
  bottomcol: { justifyContent: "flex-end", alignItems: "flex-start", width: "100%" },
});
