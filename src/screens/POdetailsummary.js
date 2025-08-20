import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions
} from "react-native";
import NavHeaderComponent from "../components/NavHeaderComponent";
import ASNinfoCardComponent from "../components/ASNinfoCardComponent";

const data = [
  {
    id: "1",
    poNumber: "PO - 001",
    orderedQty: 1500,
    receivedQty: 1500,
    shippedQty: 1500,
    items: [
      { name: "Item 1", ordered: 100, receiving: 80 },
      { name: "Item 2", ordered: 200, receiving: 81 },
    ],
  },
  {
    id: "2",
    poNumber: "PO - 002",
    orderedQty: 1000,
    receivedQty: 950,
    shippedQty: 900,
    items: [
      { name: "Item 3", ordered: 150, receiving: 82 },
      { name: "Item 4", ordered: 250, receiving: 83 },
    ],
  },
  {
    id: "3",
    poNumber: "PO - 003",
    orderedQty: 2000,
    receivedQty: 2000,
    shippedQty: 1800,
    items: [],
  },
  {
    id: "4",
    poNumber: "PO - 004",
    orderedQty: 500,
    receivedQty: 500,
    shippedQty: 480,
    items: [],
  },
];
const { width: screenWidth } = Dimensions.get('window');
const baseWidth = 375;
const scale = screenWidth / baseWidth;
const responsiveSize = (size) => Math.round(size * scale);
export default function PODetailSummary() {
  const [expandedPO, setExpandedPO] = useState(null);

  const toggleExpand = (id) => {
    setExpandedPO((prev) => (prev === id ? null : id));
  };
    const confirmAction = async () => {
      try {
        const response = await createOrderReceipt(items, true);
        if (response?.ok) {
          navigation.navigate('Receive');
          return { success: true, message: response?.message || 'Order receipt created successfully' };
        } else {
          navigation.navigate('Receive');
          return { success: false, message: response?.message || 'Failed to create order receipt' };
        }
      } catch (error) {
        navigation.navigate('Receive');
        return { success: false, message: error?.message || 'Network error. Please try again.' };
      }
    };
    const handleCancel = () => setModalVisible(false);
  
    const handleSuccess = () => {
      Toast.show({ type: 'success', text1: 'Order receipt created successfully', position: 'top', visibilityTime: 1500 });
      setModalVisible(false);
    };
  
    const handleFailure = () => {
      Toast.show({ type: 'error', text1: 'Failed to create receipt', position: 'top', visibilityTime: 1500 });
      setModalVisible(false);
    };
  const openConfirmModal = () => setModalVisible(true);
  const renderItem = ({ item }) => {
    const isExpanded = expandedPO === item.id;

    return (
      <View style={styles.card}>
        {/* Top Row */}
        <View style={styles.headerRow}>
          <Text style={styles.poNumber}>{item.poNumber}</Text>
          <View style={styles.qtyRow}>
            <Text style={styles.qtyText}>Ordered Qty{"\n"}{item.orderedQty}</Text>
            <Text style={styles.qtyText}>Received Qty{"\n"}{item.receivedQty}</Text>
            <Text style={styles.qtyText}>Shipped Qty{"\n"}{item.shippedQty}</Text>
          </View>
        </View>

        {/* View Items Button */}
        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => toggleExpand(item.id)}
        >
          <Text style={styles.viewButtonText}>View Items</Text>
          <Text style={{ fontSize: 16 }}>{isExpanded ? "▲" : "▼"}</Text>
        </TouchableOpacity>

        {/* Expanded Section */}
        {isExpanded && (
          <View style={styles.itemsContainer}>
            <View style={styles.itemsHeader}>
              <Text style={styles.itemsHeaderText}>List of Items</Text>
              <Text style={styles.itemsHeaderText}>Ordered Qty</Text>
              <Text style={styles.itemsHeaderText}>Receiving Qty</Text>
            </View>
            {item.items.map((i, idx) => (
              <View style={styles.itemRow} key={idx}>
                <Text style={styles.itemText}>{i.name}</Text>
                <Text style={styles.itemText}>{i.ordered}</Text>
                <Text style={styles.itemText}>{i.receiving}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
<SafeAreaView style={styles.container}>
    <NavHeaderComponent />
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <ASNinfoCardComponent
          receiptNumber="12300002"
          supplier="3DIng"
          asnnumber="PO-00002"
          shippeddate="21 Jul 2025"
        />
          <Text style={styles.sectionShippingTitle}>PO Detailed Summary</Text>
            <View style={styles.container1} pointerEvents="box-none">
              <View style={styles.section2}>
                <Text style={styles.label}>Details</Text>
              </View>
              <View style={styles.section3}>
                <Text style={styles.qtyLabel}>Qty To Receive</Text>
              </View>
            </View>
            <View style={styles.flatlists}>
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 10 }}
    />
    </View>
    </ScrollView>
          {/* {!readonly && (
        <>
          <FooterButtonsComponent
            leftLabel="Save"
            rightLabel="Confirm"
            onLeftPress={openConfirmModal}
            onRightPress={openConfirmModal}
            leftEnabled
            rightEnabled
          />
          <ConfirmModalComponent
            visible={modalVisible}
            title="Confirmation"
            message="Are you sure want to confirm this order?"
            confirmAction={confirmAction}
            onCancel={handleCancel}
            onSuccess={handleSuccess}
            onFailure={handleFailure}
          />
        </>
      )} */}
</SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container1: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F5F6',
    paddingVertical: 10,
    paddingLeft: 5,
    paddingRight: 5,
    borderRadius: 8,
    marginHorizontal: 16,
    // marginTop: 12,
    elevation: 3,
  },
  sectionShippingTitle: {
    fontSize: responsiveSize(16),
    fontWeight: '700',
    color: '#1f2937',
    paddingVertical: 16,
    // marginBottom: responsiveSize(5),
    // marginTop: responsiveSize(10),
    marginHorizontal: responsiveSize(16),
  },
  flatlists:{
    paddingLeft: 5,
    paddingRight: 5,
    paddingVertical: 10,
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 12,
    overflow: "hidden",
    elevation: 2,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
  },
  poNumber: { fontWeight: "bold", fontSize: 14 },
  qtyRow: { flexDirection: "row", gap: 20 },
  qtyText: { fontSize: 12, textAlign: "center" },
  viewButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#F0F4F7",
    padding: 8,
    alignItems: "center",
  },
  viewButtonText: {
    fontSize: 12,
    color: "#0A395D",
    textDecorationLine: "underline",
  },
  itemsContainer: {
    padding: 10,
    backgroundColor: "#FAFAFA",
  },
  itemsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  itemsHeaderText: { fontWeight: "bold", fontSize: 12 },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  itemText: { fontSize: 12 },
  section2: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: 8,
  },
  section3: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    minWidth: 120,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  qtyLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginRight: 12,
  }
});
