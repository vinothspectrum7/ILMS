import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Dimensions, FlatList } from 'react-native';
import GlobalHeaderComponent from '../components/GlobalHeaderComponent';
import { useNavigation } from '@react-navigation/native';
import ASNinfoCardComponent from '../components/ASNinfoCardComponent';
import { useReceivingStore } from '../store/receivingStore';
import FooterButtonsComponent from '../components/FooterButtonsComponent';
import Toast from 'react-native-toast-message';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import EditIcon from '../assets/icons/edit.svg';
import DeleteIcon from '../assets/icons/delete.svg';

const { width: screenWidth } = Dimensions.get('window');
const baseWidth = 375;
const scale = screenWidth / baseWidth;
const responsiveSize = (size) => Math.round(size * scale);

const PODetailSummary = () => {
  const [expandedId, setExpandedId] = useState(null);
  const { OrgData, asnHeader, asnSelectedLines } = useReceivingStore();
  const navigation = useNavigation();
  const [lines, setLines] = useState(asnSelectedLines || []);
  const [deletedIds, setDeletedIds] = useState([]);
  const [openItems, setOpenItems] = useState(new Set());

  useEffect(() => {
    setLines(asnSelectedLines || []);
  }, [asnSelectedLines]);

  const toggleExpand = (id) => setExpandedId((prev) => (prev === id ? null : id));

  const onSave = () => {
    const remainingItems = lines.filter(item => !deletedIds.includes(item.id));
    if (!remainingItems.length) {
      Toast.show({ type: 'info', text1: 'No items to save', position: 'top', visibilityTime: 2000 });
      return;
    }
    Toast.show({ type: 'success', text1: 'Saved draft', position: 'top', visibilityTime: 1500 });
  };

  const onConfirm = () => {
    const remainingItems = lines.filter(item => !deletedIds.includes(item.id));
    if (!remainingItems.length) {
      Toast.show({ type: 'info', text1: 'No items to confirm', position: 'top', visibilityTime: 2000 });
      return;
    }
    Toast.show({ type: 'success', text1: 'Confirm initiated', position: 'top', visibilityTime: 1500 });
  };

  const handleEdit = useCallback((id) => {
    Toast.show({ type: 'info', text1: `Edit tapped for ID: ${id}`, position: 'top', visibilityTime: 1500 });
  }, []);

  const handleDelete = useCallback((id) => {
    setDeletedIds((prev) => [...prev, id]);
    Toast.show({ type: 'success', text1: 'Item deleted', position: 'top', visibilityTime: 1200 });
  }, []);

  const handleSwipeOpen = useCallback((id) => {
    setOpenItems(prev => {
      const newSet = new Set(prev);
      newSet.add(id);
      return newSet;
    });
  }, []);

  const handleSwipeClose = useCallback((id) => {
    setOpenItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }, []);

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

  const renderLineCard = ({ item: row }) => {
    const isExpanded = expandedId === row.id;
    const l = row?.line ?? {};
    const poNumber = String(row?.po_number ?? '');
    const ordered = Number(l?.ordered_qty ?? 0);
    const received = Number(l?.rcvd_qty ?? 0);
    const shipped = l?.shipped_qty == null ? null : Number(l?.shipped_qty);
    const receivingQty = Number(l?.receiving_qty ?? 0);

    const itemRows = Array.isArray(l?.asn_line_items)
      ? l.asn_line_items.map((li, idx) => ({
          key: String(li?.item_code ?? li?.item_id ?? idx),
          name: String(li?.item_code ?? li?.item_description ?? `Item ${idx + 1}`),
          ordered: Number(li?.ordered_qty ?? 0),
          receiving: Number(li?.receiving_qty ?? receivingQty)
        }))
      : [
          {
            key: String(l?.item_code ?? l?.item_id ?? row.id),
            name: String(l?.item_code ?? l?.item_description ?? 'Item'),
            ordered: ordered,
            receiving: receivingQty
          }
        ];
    
    return (
      <View style={styles.cardElevatedContainer}>
        <Swipeable
          renderLeftActions={() => renderLeftActions(() => handleEdit(row.id))}
          renderRightActions={() => renderRightActions(() => handleDelete(row.id))}
          onSwipeableWillOpen={() => handleSwipeOpen(row.id)}
          onSwipeableWillClose={() => handleSwipeClose(row.id)}
        >
          <View style={styles.card}>
            <View style={styles.headerRow}>
              <Text style={styles.poNumber}>{poNumber}</Text>
              <View style={styles.qtyRow}>
                <Text style={styles.qtyheader}>
                  Ordered Qty{'\n'}
                  <Text style={styles.qtyvalue}>{Number.isFinite(ordered) ? ordered : 0}</Text>
                </Text>

                <Text style={styles.qtyheader}>
                  Received Qty{'\n'}
                  <Text style={styles.qtyvalue}>{Number.isFinite(received) ? received : 0}</Text>
                </Text>

                <Text style={styles.qtyheader}>
                  Shipped Qty{'\n'}
                  <Text style={styles.qtyvalue}>{shipped == null || !Number.isFinite(shipped) ? '—' : shipped}</Text>
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.viewButton} onPress={() => toggleExpand(row.id)}>
              <Text style={styles.viewButtonText}>View Items</Text>
              <Text style={styles.caret}>{isExpanded ? '▲' : '▼'}</Text>
            </TouchableOpacity>
            {isExpanded && (
              <View style={styles.itemsContainer}>
                <View style={styles.itemsHeader}>
                  <Text style={[styles.itemsHeaderText, styles.colItem]}>List of Items</Text>
                  <Text style={[styles.itemsHeaderText, styles.colOrdered]}>Ordered Qty</Text>
                  <Text style={[styles.itemsHeaderText, styles.colReceiving]}>Receiving Qty</Text>
                </View>
                <FlatList
                  data={itemRows}
                  keyExtractor={(it) => it.key}
                  renderItem={({ item }) => (
                    <View style={styles.itemRow}>
                      <Text style={[styles.itemText, styles.colItem]} numberOfLines={1}>{item.name}</Text>
                      <Text style={[styles.itemText, styles.colOrdered]}>{Number.isFinite(item.ordered) ? item.ordered : 0}</Text>
                      <Text style={[styles.itemTextStrong, styles.colReceiving]}>{Number.isFinite(item.receiving) ? item.receiving : 0}</Text>
                    </View>
                  )}
                  nestedScrollEnabled
                  style={{ maxHeight: 280 }}
                  showsVerticalScrollIndicator
                  removeClippedSubviews
                  initialNumToRender={10}
                  windowSize={7}
                />
              </View>
            )}
          </View>
        </Swipeable>
      </View>
    );
  };

  const listData = useMemo(() => {
    const initialData = [{ type: 'asn' }];
    const filteredLines = lines.filter(item => !deletedIds.includes(item.id));
    if (filteredLines.length > 0) {
      return [...initialData, ...filteredLines];
    }
    return initialData;
  }, [lines, deletedIds]);

  const renderItem = ({ item }) => {
    if (item.type === 'asn') {
      return (
        <ASNinfoCardComponent
          receiptNumber={asnHeader?.receiptNumber}
          supplier={asnHeader?.supplier_name}
          asnnumber={asnHeader?.asn_num}
          shippeddate={asnHeader?.shipped_date}
          exprcteddate={asnHeader?.expected_receipt_date || '-'}
          supplierSite={asnHeader?.supplier_site}
          carrier={asnHeader?.carrier}
          packSlip={asnHeader?.pack_slip}
          bol={asnHeader?.bol}
          waybill={asnHeader?.waybill}
          airbill={asnHeader?.airbill}
        />
      );
    }
    
    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionShippingTitle}>PO Detailed Summary</Text>
        <View style={styles.sectionHeader}>
            <View style={styles.sectionLeft}>
                <Text style={styles.label}>Details</Text>
            </View>
            <View style={styles.sectionRight}>
                <Text style={styles.qtyLabel}>Qty To Receive</Text>
            </View>
        </View>
        <View style={styles.cardsWrap}>
          {renderLineCard({ item })}
        </View>
      </View>
    );
  };
  
  const ListEmptyComponent = () => {
    const hasASNHeader = listData.some(item => item.type === 'asn');
    if (hasASNHeader) {
      return (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionShippingTitle}>PO Detailed Summary</Text>
          <View style={styles.cardsWrap}>
            <View style={{ padding: 16 }}>
              <Text style={{ textAlign: 'center', color: '#666' }}>No items selected</Text>
            </View>
          </View>
        </View>
      );
    }
    return null;
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <GlobalHeaderComponent
          organizationName={OrgData?.selectedOrgCode}
          screenTitle="Receive"
          notificationCount={0}
          onBack={() => navigation.goBack()}
          onMenu={() => {}}
          onNotificationPress={() => navigation.navigate('Home')}
          onProfilePress={() => navigation.navigate('Home')}
        />
        <FlatList
          data={listData}
          renderItem={renderItem}
          keyExtractor={(it) => it.type || it.id}
          contentContainerStyle={{ paddingBottom: 120 }}
          removeClippedSubviews
          initialNumToRender={10}
          windowSize={7}
          ListEmptyComponent={ListEmptyComponent}
        />
        <FooterButtonsComponent
          leftLabel="Save"
          rightLabel="Confirm"
          onLeftPress={onSave}
          onRightPress={onConfirm}
          leftEnabled
          rightEnabled
        />
      </SafeAreaView>
      <Toast />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F8FA' },
  sectionContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 12,
    paddingTop: 8,
    paddingBottom: 6,
    elevation: 2,
    overflow: 'hidden'
  },
  sectionShippingTitle: {
    fontSize: responsiveSize(16),
    fontWeight: '700',
    color: '#1f2937',
    paddingVertical: 16,
    marginHorizontal: responsiveSize(10)
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F5F6',
    paddingVertical: 10,
    paddingLeft: 5,
    paddingRight: 5,
    borderRadius: 8,
    marginHorizontal: responsiveSize(10)
  },
  sectionLeft: { flex: 1, justifyContent: 'center', paddingLeft: 8 },
  sectionRight: { justifyContent: 'center', alignItems: 'flex-end', minWidth: 120 },
  label: { fontSize: 14, fontWeight: '500', color: '#333' },
  qtyLabel: { fontSize: 14, fontWeight: '500', color: '#333', marginRight: 12 },
  cardsWrap: { paddingHorizontal: responsiveSize(10), paddingTop: 10 },
  cardElevatedContainer: {
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff'
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 10 },
  poNumber: { fontSize: 14, fontWeight: '700', color: '#242424', textAlign: 'center' },
  qtyRow: { flexDirection: 'row', gap: 20 },
  qtyheader: { fontSize: 10, fontWeight: '600', color: '#595A5C', textAlign: 'center' },
  qtyvalue: { fontSize: 10, fontWeight: '600', color: '#242424', textAlign: 'center' },
  qtyText: { fontSize: 12, textAlign: 'center' },
  viewButton: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#F0F4F7', padding: 8, alignItems: 'center' },
  viewButtonText: { fontSize: 12, color: '#5D768B', },
  caret: { fontSize: 16 },
  itemsContainer: { paddingHorizontal: responsiveSize(10), backgroundColor: '#FAFAFA' },
  itemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 6,
    paddingBottom: 6,
    borderBottomWidth: 0,
    borderBottomColor: '#ddd'
  },
  itemsHeaderText: { fontWeight: '600', fontStyle:'italic', fontSize: 12, width: 140 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 6, backgroundColor: '#FAFAFA',borderBottomWidth: 1,
    borderBottomColor: '#ddd' },
  itemText: { fontSize: 12, fontWeight: '400', color: '#242424', width: 100 },
  itemTextStrong: { fontSize: 12, fontWeight: '700', color: '#242424', width: 140 },
  colItem: { width: 170 },
  colOrdered: { width: 100, textAlign: 'left' },
  colReceiving: { width: 100, textAlign: 'left' },
  leftActionContainer: {
    backgroundColor: '#ECF1F7',
    justifyContent: 'center',
    alignItems: 'flex-start',
    width: 40,
    borderRadius: 1
  },
  rightActionContainer: {
    backgroundColor: '#F8D2D4',
    justifyContent: 'center',
    alignItems: 'flex-end',
    width: 40,
    borderRadius: 1,
  },
  actionButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10
  },
});

export default PODetailSummary;