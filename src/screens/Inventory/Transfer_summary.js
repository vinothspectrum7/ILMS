import React, { useCallback, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Item_icon from "../../assets/images/Item_icon.svg";
import Inv_summary_divider_icon from "../../assets/icons/inv_summary_divider_icon.svg";
import { useNavigation } from "@react-navigation/native";
import { useReceivingStore } from "../../store/receivingStore";
import GlobalHeaderComponent from "../../components/GlobalHeaderComponent";
import { GestureHandlerRootView, Swipeable } from "react-native-gesture-handler";
import FooterButtonsComponent from "../../components/FooterButtonsComponent";
import Toast from "react-native-toast-message";
import ConfirmModalComponent from "../../components/ConfirmModalComponent";
import ConfirmSvg from '../../assets/icons/success.svg';
import FailureSvg from '../../assets/icons/failure.svg';
import EditIcon from '../../assets/icons/edit.svg';
import DeleteIcon from '../../assets/icons/delete.svg';

export default function SummaryScreen() {
    const summaryData = [
        { id: "1", item: "ID0034", qty: "12 Qty", fromSub: 'fromsub1', toSub: 'tosub1', fromLocater: 'fromloc1', toLocater: 'toloc1' },
        { id: "2", item: "ID0034", qty: "24 Piece", fromSub: 'fromsub2', toSub: 'tosub2', fromLocater: 'fromloc2', toLocater: 'toloc2' },
        { id: "3", item: "ID0034", qty: "36 Each", fromSub: 'fromsub1', toSub: 'tosub1', fromLocater: 'fromloc3', toLocater: 'toloc3' },
    ];
    const { resetReceiving, OrgData, ActiveTab, setActiveTab } = useReceivingStore();
    const navigation = useNavigation();
    const [confirmVisible, setConfirmVisible] = useState(false);
    const [saveModalVisible, setSaveModalVisible] = useState(false);
    const [saveModalStatus, setSaveModalStatus] = useState('success');
    const onConfirmOpen = () => {
        if (!summaryData.length) {
            Toast.show({ type: 'info', text1: 'No items to confirm', position: 'top', visibilityTime: 2000 });
            return;
        }
        setConfirmVisible(true);
    };

    const AddMore = () => {
        navigation.navigate('Sub_Inv_Addmore',{cartcount:summaryData.length});
    }

    const confirmAction = async () => {
        const selectedRows = filteredLines.flatMap((row) => mapRowItemsForPayloadSelected(row));
        const payload = mapAsnConfirmData(selectedRows);
        if (!payload.length) {
            return { success: false, message: 'No items with quantity to confirm' };
        }
        try {
            const res = await Submit_Receive_Qty(payload);
            const ok = Array.isArray(res?.results)
                ? res.results.some((r) => String(r?.status).toLowerCase() === 'success')
                : String(res?.status || '').toLowerCase() === 'success';
            if (ok) return { success: true, message: 'Received Quantity Updated Successfully!' };
            return { success: false, message: res?.message || 'Failed to receive items' };
        } catch {
            return { success: false, message: 'Network error. Please try again.' };
        }
    };

    const onConfirmSuccess = () => {
        setConfirmVisible(false);
        navigation.navigate('Receive');
    };

    const onConfirmFailure = () => {
        setConfirmVisible(false);
    };

    const renderLeftActions = (onEdit) => (
        <View style={styles.leftActionContainer}>
            <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
                <EditIcon width={22} height={22} />
            </TouchableOpacity>
        </View>
    );

    const renderRightActions = (onDelete) => (
        <View style={styles.rightActionContainer}>
            <TouchableOpacity onPress={onDelete} style={styles.actionButton}>
                <DeleteIcon width={22} height={22} />
            </TouchableOpacity>
        </View>
    );

    const handleEdit = useCallback(
        (row) => {

        },
        []
    );

    const handleDelete = useCallback(
        (id) => {
            //   const row = (lines || []).find((r) => String(r.id) === String(id));
            //   if (!row) return;
            //   Toast.show({ type: 'success', text1: 'PO removed from selection', position: 'top', visibilityTime: 1200 });
        },
        [summaryData]
    );

    return (
        <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
            <GlobalHeaderComponent organizationName={OrgData?.selectedOrgCode} screenTitle="Inventory" notificationCount={0} onBack={() => navigation.navigate('Inventory')} />
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Summary</Text>
                    <TouchableOpacity>
                        <Text style={styles.clearAll}>Clear All</Text>
                    </TouchableOpacity>
                </View>

                {/* Scrollable Cards */}
                <ScrollView showsVerticalScrollIndicator={false}>
                    {summaryData.map((item) => (
                        <Swipeable
                            renderLeftActions={() => renderLeftActions(() => handleEdit(row))}
                            renderRightActions={() => renderRightActions(() => handleDelete(row.id))}
                        >
                            <View key={item.id} style={styles.card}>
                                {/* Card Header */}
                                <View style={styles.cardHeader}>
                                    <View style={styles.itemCol}>
                                        <Item_icon width={20} height={20} />
                                        <View style={{ alignItems: "flex-start" }}>
                                            <Text style={styles.label}>Item</Text>
                                            <Text style={styles.itemText}>{item.item}</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.qtyText}>{item.qty}</Text>
                                </View>

                                <LinearGradient
                                    colors={["#D9E4EE", "#FCDFCC"]}
                                    start={{ x: 0.5, y: 0 }}
                                    end={{ x: 0.5, y: 1 }}
                                    style={styles.gradientBox}
                                >
                                    <View style={styles.detailsRow}>
                                        {/* From Section */}
                                        <View style={styles.detailsGroup}>
                                            <View style={styles.col}>
                                                <Text style={styles.label}>From Sub</Text>
                                                <Text style={styles.value} numberOfLines={1} ellipsizeMode="tail">
                                                    {item.fromSub}
                                                </Text>
                                            </View>
                                            <View style={styles.col}>
                                                <Text style={styles.label}>From Locator</Text>
                                                <Text style={styles.value} numberOfLines={1} ellipsizeMode="tail">
                                                    {item.fromLocater}
                                                </Text>
                                            </View>
                                        </View>

                                        {/* Center Icon */}
                                        <View style={styles.centerIcon}>
                                            <Inv_summary_divider_icon width={20} height={20} />
                                        </View>

                                        {/* To Section */}
                                        <View style={styles.detailsGroup}>
                                            <View style={styles.col}>
                                                <Text style={styles.label}>To Sub</Text>
                                                <Text style={styles.value} numberOfLines={1} ellipsizeMode="tail">
                                                    {item.toSub}
                                                </Text>
                                            </View>
                                            <View style={styles.col}>
                                                <Text style={styles.label}>To Locator</Text>
                                                <Text style={styles.value} numberOfLines={1} ellipsizeMode="tail">
                                                    {item.toLocater}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                </LinearGradient>

                            </View>
                        </Swipeable>
                    ))}
                </ScrollView>
            </View>
            {/* Bottom Buttons */}
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

            <Modal visible={saveModalVisible} transparent animationType="fade" onRequestClose={() => { }}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' }}>
                    <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 24, alignItems: 'center', width: '80%' }}>
                        {saveModalStatus === 'success' ? <ConfirmSvg width={72} height={72} /> : <FailureSvg width={72} height={72} />}
                        <Text style={{ marginTop: 16, textAlign: 'center', fontSize: 16, color: '#333' }}>
                            {saveModalStatus === 'success' ? 'Order Saved Successfully. Please continue Receipt.' : 'Save failed. Please try again.'}
                        </Text>
                    </View>
                </View>
            </Modal>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F7F8FB",
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: "600",
        color: "#3A3A3C",
    },
    clearAll: {
        fontSize: 14,
        color: "#6B7280",
        fontWeight: "500",
    },
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    itemCol: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8, // spacing between icon and text
    },
    itemText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#3A3A3C",
    },
    qtyText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#3A3A3C",
    },
    gradientBox: {
        padding: 12,
        borderRadius: 8,
        opacity: 30,
    },
    detailsRow: {
        flexDirection: "row",
        alignItems: 'center',
        justifyContent: "space-between",
        // flexWrap:'wrap'
    },
    col: {
        alignItems: "flex-start",
        marginRight: 12,
    },
    label: {
        fontSize: 12,
        color: "rgba(35, 62, 85, 1)",
        marginBottom: 2,
        fontWeight: "300",
    },
    value: {
        fontSize: 14,
        color: "rgba(35, 62, 85, 1)",
        fontWeight: "700",
    },
    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 16,
        marginBottom: 24,
    },
    addButton: {
        width: "48%",
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 16,
        paddingVertical: 12,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    addButtonText: {
        textAlign: "center",
        fontWeight: "600",
        color: "#3A3A3C",
    },
    confirmButton: {
        width: "48%",
        backgroundColor: "#1B4EFF",
        borderRadius: 16,
        paddingVertical: 12,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    confirmButtonText: {
        textAlign: "center",
        fontWeight: "600",
        color: "#FFFFFF",
    },
    leftActionContainer: { backgroundColor: '#ECF1F7', justifyContent: 'center', alignItems: 'flex-start', width: 40 },
    rightActionContainer: { backgroundColor: '#F8D2D4', justifyContent: 'center', alignItems: 'flex-end', width: 40 },
    actionButton: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 10 },
    centerIcon: {
        justifyContent: "center",
        alignItems: "center",
        marginHorizontal: 4, // space around icon
    },
    detailsGroup: {
        flexDirection: "row",
        alignItems: 'center',
    },
});
