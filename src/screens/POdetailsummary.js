import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Dimensions, FlatList, Modal } from 'react-native';
import GlobalHeaderComponent from '../components/GlobalHeaderComponent';
import { useNavigation } from '@react-navigation/native';
import ASNinfoCardComponent from '../components/ASNinfoCardComponent';
import { useReceivingStore } from '../store/receivingStore';
import FooterButtonsComponent from '../components/FooterButtonsComponent';
import Toast from 'react-native-toast-message';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import EditIcon from '../assets/icons/edit.svg';
import DeleteIcon from '../assets/icons/delete.svg';
import ConfirmModalComponent from '../components/ConfirmModalComponent';
import ConfirmSvg from '../assets/icons/success.svg';
import FailureSvg from '../assets/icons/failure.svg';
import { Submit_Receive_Qty, Save_Receive_Qty } from '../api/ApiServices';

const { width: screenWidth } = Dimensions.get('window');
const baseWidth = 375;
const scale = screenWidth / baseWidth;
const responsiveSize = (size) => Math.round(size * scale);

const PODetailSummary = () => {
  const navigation = useNavigation();
  const {
    OrgData,
    asnHeader,
    asnSelectedLines,
    getAsnEditedLinesForPO,
    setAsnEditedLinesForPO,
    clearAsnFlow,
    setActiveTab,
  } = useReceivingStore();

  const [expandedId, setExpandedId] = useState(null);
  const [lines, setLines] = useState(asnSelectedLines || []);
  const [deletedIds, setDeletedIds] = useState([]);
  const [openItems, setOpenItems] = useState(new Set());
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [saveModalStatus, setSaveModalStatus] = useState('success');

  const rawItemsByPORef = useRef({});

  useEffect(() => {
    setLines(asnSelectedLines || []);
    const map = {};
    (asnSelectedLines || []).forEach((row) => {
      const poId = row?.po_id;
      const edited = getAsnEditedLinesForPO(poId);
      const src = Array.isArray(edited) && edited.length ? edited : Array.isArray(row?.line?.asn_line_items) ? row.line.asn_line_items : [];
      map[poId] = JSON.parse(JSON.stringify(src));
    });
    rawItemsByPORef.current = map;
    setDeletedIds((prev) => prev.filter((id) => (asnSelectedLines || []).some((r) => r.id === id)));
  }, [asnSelectedLines, getAsnEditedLinesForPO]);

  const n = (v) => {
    const x = Number(v);
    return Number.isFinite(x) ? x : 0;
  };

  const formatToday = () => {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${yyyy}-${mm}-${dd}`;
  };

  const pickQty = (obj) => {
    const a = Number(obj?.receiving_qty ?? 0);
    const b = Number(obj?.qtyToReceive ?? 0);
    const c = Number(obj?.rcvd_qty_delta ?? 0);
    const q = (Number.isFinite(a) && a > 0) ? a : (Number.isFinite(b) && b > 0) ? b : (Number.isFinite(c) && c > 0) ? c : 0;
    return q;
  };

  const itemsSrcForRow = (row) => {
    const poId = row?.po_id;
    const frozen = rawItemsByPORef.current[poId];
    return Array.isArray(frozen) ? frozen : [];
  };

  const allZeroInItems = (items) => items.every((li) => n(pickQty(li)) === 0);

  const applyUiRule = (items) => {
    if (!items.length) return [];
    if (allZeroInItems(items)) {
      return items.map((li, idx) => ({
        key: String(li?.item_code ?? li?.item_id ?? idx),
        name: String(li?.item_code ?? li?.item_description ?? `Item ${idx + 1}`),
        ordered: n(li?.ordered_qty ?? 0),
        receiving: n(li?.ordered_qty ?? 0),
        _raw: li,
      }));
    }
    return items
      .filter((li) => n(pickQty(li)) > 0)
      .map((li, idx) => ({
        key: String(li?.item_code ?? li?.item_id ?? idx),
        name: String(li?.item_code ?? li?.item_description ?? `Item ${idx + 1}`),
        ordered: n(li?.ordered_qty ?? 0),
        receiving: n(pickQty(li)),
        _raw: li,
      }));
  };

  const mapRowItemsForPayload = (row) => {
    const src = itemsSrcForRow(row);
    const uiAllZero = allZeroInItems(src);
    const today = formatToday();
    return src.map((li) => {
      const qty = uiAllZero ? n(li?.ordered_qty ?? 0) : n(pickQty(li));
      return {
        po_line_id: li?.po_line_id ?? row?.line?.po_line_id ?? null,
        item_id: li?.item_id ?? null,
        org_id: li?.org_id ?? OrgData?.selectedOrg ?? null,
        sub_inv_id: li?.subInventory ?? li?.sub_inv_id ?? OrgData?.selectedinventory ?? null,
        locator_id: li?.locator ?? li?.locator_id ?? null,
        lot_number: '',
        expiry_date: today,
        received_qty: qty,
        received_type: "asn",
        asn_header_uuid:asnHeader?.asn_id,
        interface_header_id: asnHeader?.interface_id ?? null,
        is_checked: qty > 0,
      };
    });
  };

  const filteredLines = useMemo(() => lines.filter((item) => !deletedIds.includes(item.id)), [lines, deletedIds]);

  const collectAllItems = useCallback(
    () => filteredLines.flatMap((row) => mapRowItemsForPayload(row)).filter((x) => x.item_id || x.po_line_id),
    [filteredLines, OrgData, asnHeader]
  );

  const mapAsnConfirmData = (items) => items.filter((x) => Number(x.received_qty) > 0).map(({ is_checked, ...rest }) => rest);

  const mapAsnSaveData = (items) => items;

  const isSaveSuccess = (res) => {
    if (!res) return false;
    if (res === true) return true;
    if (typeof res?.results === 'boolean') return res.results === true;
    if (typeof res?.results === 'number') return res.results > 0;
    if (Array.isArray(res?.results)) {
      const okArr = res.results.filter(Boolean);
      if (okArr.length > 0) return true;
      const hasSuccess = res.results.some((r) => String(r?.status).toLowerCase() === 'success');
      if (hasSuccess) return true;
    }
    if (res?.results?.status && String(res.results.status).toLowerCase() === 'success') return true;
    if (res?.status && String(res.status).toLowerCase() === 'success') return true;
    if (typeof res?.message === 'string' && res.message.toLowerCase().includes('success')) return true;
    return false;
  };

  const toggleExpand = (id) => setExpandedId((prev) => (prev === id ? null : id));

  const handleSwipeOpen = useCallback((id) => {
    setOpenItems((prev) => {
      const s = new Set(prev);
      s.add(id);
      return s;
    });
  }, []);

  const handleSwipeClose = useCallback((id) => {
    setOpenItems((prev) => {
      const s = new Set(prev);
      s.delete(id);
      return s;
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

  const handleEdit = useCallback(
    (row) => {
      const poId = row.po_id;
      const raw = rawItemsByPORef.current[poId] || [];
      const deepCopy = JSON.parse(JSON.stringify(raw));
      if (allZeroInItems(raw)) {
        const edited = getAsnEditedLinesForPO(poId);
        if (Array.isArray(edited) && edited.length) {
          setAsnEditedLinesForPO(poId, []);
        }
      }
      navigation.navigate('poviewitems', {
        source: 'asn',
        mode: 'edit',
        selectedPO: { po_id: row.po_id, po_number: row.po_number },
        lines: deepCopy,
      });
    },
    [navigation, getAsnEditedLinesForPO, setAsnEditedLinesForPO]
  );

  const handleDelete = useCallback(
    (id) => {
      setDeletedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
      Toast.show({ type: 'success', text1: 'Item hidden in summary', position: 'top', visibilityTime: 1200 });
    },
    []
  );

  const onSave = async () => {
    const remainingItems = filteredLines;
    if (!remainingItems.length) {
      Toast.show({ type: 'info', text1: 'No items to save', position: 'top', visibilityTime: 2000 });
      return;
    }
    const all = collectAllItems();
    if (!all.length) {
      Toast.show({ type: 'info', text1: 'No items to save', position: 'top', visibilityTime: 2000 });
      return;
    }
    try {
      const payload = mapAsnSaveData(all);
      console.log('Save payload:', payload);
      const res = await Save_Receive_Qty(payload);
      if (isSaveSuccess(res)) {
        setSaveModalStatus('success');
        setSaveModalVisible(true);
        setTimeout(() => {
          setSaveModalVisible(false);
          clearAsnFlow();
          setActiveTab && setActiveTab('asn');
          navigation.navigate('Receive');
        }, 1500);
      } else {
        setSaveModalStatus('failure');
        setSaveModalVisible(true);
        setTimeout(() => {
          setSaveModalVisible(false);
        }, 1500);
      }
    } catch {
      setSaveModalStatus('failure');
      setSaveModalVisible(true);
      setTimeout(() => {
        setSaveModalVisible(false);
      }, 1500);
    }
  };

  const confirmAction = async () => {
    const all = collectAllItems();
    const payload = mapAsnConfirmData(all);
    console.log('Confirm payload:', payload);
    if (!payload.length) {
      return { success: false, message: 'No items with quantity to confirm' };
    }
    try {
      const res = await Submit_Receive_Qty(payload);
      const ok =
        Array.isArray(res?.results)
          ? res.results.some((r) => String(r?.status).toLowerCase() === 'success')
          : String(res?.status || '').toLowerCase() === 'success';
      if (ok) return { success: true, message: 'Received Quantity Updated Successfully!' };
      return { success: false, message: res?.message || 'Failed to receive items' };
    } catch {
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const onConfirmOpen = () => {
    const remainingItems = filteredLines;
    if (!remainingItems.length) {
      Toast.show({ type: 'info', text1: 'No items to confirm', position: 'top', visibilityTime: 2000 });
      return;
    }
    setConfirmVisible(true);
  };

  const onConfirmSuccess = () => {
    setConfirmVisible(false);
    clearAsnFlow();
    navigation.navigate('Receive');
  };

  const onConfirmFailure = () => {
    setConfirmVisible(false);
  };

  const renderLineCard = ({ item: row }) => {
    const isExpanded = expandedId === row.id;
    const l = row?.line ?? {};
    const poNumber = String(row?.po_number ?? '');
    const ordered = n(l?.ordered_qty ?? 0);
    const received = n(l?.rcvd_qty ?? 0);
    const shippedRaw = l?.shipped_qty == null ? null : Number(l?.shipped_qty);
    const shippedQty = shippedRaw == null || !Number.isFinite(Number(shippedRaw)) ? '—' : n(shippedRaw);

    const orderedQty = asnHeader?.total_order_qty != null ? n(asnHeader.total_order_qty) : ordered;
    const receivedQty = asnHeader?.total_rcvd_qty != null ? n(asnHeader.total_rcvd_qty) : received;

    const uiItems = applyUiRule(itemsSrcForRow(row));

    return (
      <View style={styles.cardElevatedContainer}>
        <Swipeable
          renderLeftActions={() => renderLeftActions(() => handleEdit(row))}
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
                  <Text style={styles.qtyvalue}>{orderedQty}</Text>
                </Text>
                <Text style={styles.qtyheader}>
                  Received Qty{'\n'}
                  <Text style={styles.qtyvalue}>{receivedQty}</Text>
                </Text>
                <Text style={styles.qtyheader}>
                  Shipped Qty{'\n'}
                  <Text style={styles.qtyvalue}>{shippedQty}</Text>
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
                  data={uiItems}
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
    if (filteredLines.length > 0) {
      return [...initialData, ...filteredLines];
    }
    return initialData;
  }, [filteredLines]);

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
        <View style={styles.cardsWrap}>{renderLineCard({ item })}</View>
      </View>
    );
  };

  const ListEmptyComponent = () => {
    const hasASNHeader = listData.some((item) => item.type === 'asn');
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
        <FooterButtonsComponent leftLabel="Save" rightLabel="Confirm" onLeftPress={onSave} onRightPress={onConfirmOpen} leftEnabled rightEnabled />
      </SafeAreaView>

      <ConfirmModalComponent
        visible={confirmVisible}
        title="Confirmation"
        message="Are you sure want to receive these ASN items?"
        confirmAction={confirmAction}
        onCancel={() => setConfirmVisible(false)}
        onSuccess={onConfirmSuccess}
        onFailure={onConfirmFailure}
      />

      <Modal visible={saveModalVisible} transparent animationType="fade" onRequestClose={() => {}}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 24, alignItems: 'center', width: '80%' }}>
            {saveModalStatus === 'success' ? <ConfirmSvg width={72} height={72} /> : <FailureSvg width={72} height={72} />}
            <Text style={{ marginTop: 16, textAlign: 'center', fontSize: 16, color: '#333' }}>
              {saveModalStatus === 'success' ? 'Order Saved Successfully. Please continue Receipt.' : 'Save failed. Please try again.'}
            </Text>
          </View>
        </View>
      </Modal>

      <Toast />
    </GestureHandlerRootView>
  );
};

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
    overflow: 'hidden',
  },
  sectionShippingTitle: {
    fontSize: responsiveSize(16),
    fontWeight: '700',
    color: '#1f2937',
    paddingVertical: 16,
    marginHorizontal: responsiveSize(10),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F5F6',
    paddingVertical: 10,
    paddingLeft: 5,
    paddingRight: 5,
    borderRadius: 8,
    marginHorizontal: responsiveSize(10),
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
  card: { borderRadius: 12, overflow: 'hidden', backgroundColor: '#fff' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 10 },
  poNumber: { fontSize: 14, fontWeight: '700', color: '#242424', textAlign: 'center' },
  qtyRow: { flexDirection: 'row', gap: 20 },
  qtyheader: { fontSize: 10, fontWeight: '600', color: '#595A5C', textAlign: 'center' },
  qtyvalue: { fontSize: 10, fontWeight: '600', color: '#242424', textAlign: 'center' },
  viewButton: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#F0F4F7', padding: 8, alignItems: 'center' },
  viewButtonText: { fontSize: 12, color: '#5D768B' },
  caret: { fontSize: 16 },
  itemsContainer: { paddingHorizontal: responsiveSize(10), backgroundColor: '#FAFAFA' },
  itemsHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 6, paddingBottom: 6 },
  itemsHeaderText: { fontWeight: '600', fontStyle: 'italic', fontSize: 12, width: 140 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 6, backgroundColor: '#FAFAFA', borderBottomWidth: 1, borderBottomColor: '#ddd' },
  itemText: { fontSize: 12, fontWeight: '400', color: '#242424', width: 100 },
  itemTextStrong: { fontSize: 12, fontWeight: '700', color: '#242424', width: 140 },
  colItem: { width: 170 },
  colOrdered: { width: 100, textAlign: 'left' },
  colReceiving: { width: 100, textAlign: 'left' },
  leftActionContainer: { backgroundColor: '#ECF1F7', justifyContent: 'center', alignItems: 'flex-start', width: 40 },
  rightActionContainer: { backgroundColor: '#F8D2D4', justifyContent: 'center', alignItems: 'flex-end', width: 40 },
  actionButton: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 10 },
});

export default PODetailSummary;
