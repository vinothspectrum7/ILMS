import React, { useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useShippingStore } from '../../store/shippingStore';

const { width, height } = Dimensions.get('window');

const Ship_ViewDetails = ({ visible, onClose }) => {
  const selectedTransaction = useShippingStore(s => s.selectedTransaction);

  const items = useMemo(() => {
    const list = selectedTransaction?.items;
    return Array.isArray(list) ? list : [];
  }, [selectedTransaction]);

  const rows = useMemo(() => {
    return items.map((it, idx) => ({
      key: `${it?.itemId || it?.itemCode || it?.code || 'ITEM'}-${idx}`,
      itemId: it?.itemId || it?.itemCode || it?.code || '-',
      description: it?.description || '-',
      salesOrderNo: it?.salesOrderNo || '-',
      quantity: it?.quantity ?? '-',
      unitNumber: it?.unitNumber || '-',
    }));
  }, [items]);

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
              {rows.map(row => (
                <View key={row.key} style={styles.itemBlock}>
                  <View style={styles.tableRow}>
                    <View style={styles.cell}>
                      <Text style={styles.itemIdText}>{row.itemId}</Text>
                    </View>
                    <View style={styles.cell}>
                      <Text style={styles.cellText}>{row.description}</Text>
                    </View>
                    <View style={styles.cell}>
                      <Text style={styles.cellText}>{row.salesOrderNo}</Text>
                    </View>
                    <View style={styles.cell}>
                      <Text style={styles.quantityText}>{row.quantity}</Text>
                    </View>
                  </View>

                  <View style={styles.unitRow}>
                    <View style={styles.cell}>
                      <Text style={styles.unitText}>{row.unitNumber}</Text>
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
