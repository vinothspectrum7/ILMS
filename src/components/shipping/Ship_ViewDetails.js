import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';

const ITEM_TABLE_DATA = [
  {
    itemId: 'ITM-001',
    description: 'Widget A',
    salesOrderNo: 'SO8400',
    quantity: 100,
    unitNumber: 'LN1293',
  },
  {
    itemId: 'ITM-002',
    description: 'Widget A',
    salesOrderNo: 'SO8400',
    quantity: 100,
    unitNumber: 'LN1294',
  },
  {
    itemId: 'ITM-003',
    description: 'Widget A',
    salesOrderNo: 'SO8400',
    quantity: 100,
    unitNumber: 'LN1295',
  },
  {
    itemId: 'ITM-004',
    description: 'Widget A',
    salesOrderNo: 'SO8400',
    quantity: 100,
    unitNumber: 'LN1296',
  },
  {
    itemId: 'ITM-005',
    description: 'Widget A',
    salesOrderNo: 'SO8400',
    quantity: 100,
    unitNumber: 'LN1297',
  },
  {
    itemId: 'ITM-006',
    description: 'Widget A',
    salesOrderNo: 'SO8400',
    quantity: 100,
    unitNumber: 'LN1298',
  },
  {
    itemId: 'ITM-007',
    description: 'Widget A',
    salesOrderNo: 'SO8400',
    quantity: 100,
    unitNumber: 'LN1299',
  },
  {
    itemId: 'ITM-008',
    description: 'Widget A',
    salesOrderNo: 'SO8400',
    quantity: 100,
    unitNumber: 'LN1300',
  },
  {
    itemId: 'ITM-009',
    description: 'Widget A',
    salesOrderNo: 'SO8400',
    quantity: 100,
    unitNumber: 'LN1301',
  },
  {
    itemId: 'ITM-010',
    description: 'Widget A',
    salesOrderNo: 'SO8400',
    quantity: 100,
    unitNumber: 'LN1302',
  },
  {
    itemId: 'ITM-011',
    description: 'Widget A',
    salesOrderNo: 'SO8400',
    quantity: 100,
    unitNumber: 'LN1303',
  },
  {
    itemId: 'ITM-012',
    description: 'Widget A',
    salesOrderNo: 'SO8400',
    quantity: 100,
    unitNumber: 'LN1304',
  },
  {
    itemId: 'ITM-013',
    description: 'Widget A',
    salesOrderNo: 'SO8400',
    quantity: 100,
    unitNumber: 'LN1305',
  },
  {
    itemId: 'ITM-014',
    description: 'Widget A',
    salesOrderNo: 'SO8400',
    quantity: 100,
    unitNumber: 'LN1306',
  },
];

const { width, height } = Dimensions.get('window');

const Ship_ViewDetails = ({ visible, onClose }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.popupContainer}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>View Items</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <View style={styles.headerCell}>
                <Text style={styles.headerText}>Items</Text>
              </View>
              <View style={styles.headerCell}>
                <Text style={styles.headerText}>Description</Text>
              </View>
              <View style={styles.headerCell}>
                <Text style={styles.headerText}>Sales Order No.</Text>
              </View>
              <View style={styles.headerCell}>
                <Text style={styles.headerText}>Qty</Text>
              </View>
            </View>

            <ScrollView style={styles.tableBody} showsVerticalScrollIndicator={false}>
              {ITEM_TABLE_DATA.map(item => (
                <View key={item.itemId} style={styles.itemBlock}>

                  <View style={styles.tableRow}>
                    <View style={styles.cell}>
                      <Text style={styles.itemIdText}>{item.itemId}</Text>
                    </View>
                    <View style={styles.cell}>
                      <Text style={styles.cellText}>{item.description}</Text>
                    </View>
                    <View style={styles.cell}>
                      <Text style={styles.cellText}>{item.salesOrderNo}</Text>
                    </View>
                    <View style={styles.cell}>
                      <Text style={styles.quantityText}>{item.quantity}</Text>
                    </View>
                  </View>

                  <View style={styles.unitRow}>
                    <View style={styles.cell}>
                      <Text style={styles.unitText}>{item.unitNumber}</Text>
                    </View>
                    <View style={styles.cell} />
                    <View style={styles.cell} />
                    <View style={styles.cell} />
                  </View>

                  <View style={styles.rowDivider} />
                </View>
              ))}

            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupContainer: {
    width: 349,
    height: 679,
    backgroundColor: 'white',
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },
  header: {
    width: 349,
    height: 41,
    backgroundColor: '#D9E4EE',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerTitle: {
    width: 73,
    height: 12.21,
    fontFamily: 'Mulish',
    fontWeight: '600',
    fontSize: 14,
    lineHeight: 14,
    color: '#242424',
    letterSpacing: 0,
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },

  closeButtonText: {
    fontSize: 16,
    lineHeight: 16,
    color: '#242424',
    fontWeight: '600',
  },

  tableContainer: {
    flex: 1,
    marginHorizontal: 16,
    marginTop: 16,
  },
  tableHeader: {
    flexDirection: 'row',

    backgroundColor: 'rgba(93, 118, 139, 0.05)',
    paddingVertical: 10,
  },
  headerCell: {
    flex: 1,
    justifyContent: 'center',
  },
  headerText: {
    fontFamily: 'Mulish',
    fontWeight: '600',
    fontSize: 12,
    color: '#333333',
    textAlign: 'center',
  },
  tableBody: {
    flex: 1,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  unitRow: {
    flexDirection: 'row',
    marginTop: 2,
    alignItems: 'center',
  },
  cell: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellText: {
    fontFamily: 'Mulish',
    fontSize: 12,
    color: '#333333',
    textAlign: 'center',
  },
  itemIdText: {
    fontFamily: 'Mulish',
    fontWeight: '700',
    fontSize: 12,
    color: '#333333',
    textAlign: 'center',
  },
  quantityText: {
    fontFamily: 'Mulish',
    fontWeight: '700',
    fontSize: 12,
    color: '#333333',
    textAlign: 'center',
  },
  unitText: {
    fontFamily: 'Mulish',
    fontSize: 11,
    color: '#666666',
    textAlign: 'center',
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#E6E6E6',
    marginBottom: 8,
  },
  itemBlock: {
    minHeight: 52,
    justifyContent: 'center',
  },


});

export default Ship_ViewDetails;