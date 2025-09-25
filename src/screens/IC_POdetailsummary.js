import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Dimensions, FlatList, Modal, BackHandler } from 'react-native';
import GlobalHeaderComponent from '../components/GlobalHeaderComponent';
import { useNavigation, useFocusEffect, CommonActions } from '@react-navigation/native';
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
import { Submit_Receive_Qty, Save_Receive_Qty, GetASNPoItems } from '../api/ApiServices';
import UpArrowIcon from '../assets/icons/uparrow.svg';
import DownArrowIcon from '../assets/icons/downarrow.svg';

const { width: screenWidth } = Dimensions.get('window');
const baseWidth = 375;
const scale = screenWidth / baseWidth;
const responsiveSize = (size) => Math.round(size * scale);

const dash = '—';

const n = (v) => {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
};

const remainingFor = (li) => {
  const ord = n(li?.ordered_qty);
  const rcv = n(li?.rcvd_qty);
  const rem = ord - rcv;
  return rem > 0 ? rem : 0;
};

const clampQty = (li, requested) => {
  const req = n(requested);
  if (req <= 0) return 0;
  return Math.min(req, remainingFor(li));
};

const formatToday = () => {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).toString().padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${yyyy}-${mm}-${dd}`;
};

const pickQty = (obj) => {
  const a = Number(obj?.receiving_qty ?? 0);
  const b = Number(obj?.qtyToReceive ?? 0);
  const c = Number(obj?.rcvd_qty_delta ?? 0);
  if (Number.isFinite(a) && a > 0) return a;
  if (Number.isFinite(b) && b > 0) return b;
  if (Number.isFinite(c) && c > 0) return c;
  return 0;
};

const IC_PODetailSummary = () => {
  const navigation = useNavigation();

  const {
    OrgData,
    asnHeader,
    asnSelectedLines,
    getAsnEditedLinesForPO,
    setAsnEditedLinesForPO,
    initAsnSelectedLines,
    asnSelectedPOIds,
    setAsnSelectedPOIds,
    removeAsnEditedLinesForPO,
    clearAsnFlow,
  } = useReceivingStore();

  const [expandedId, setExpandedId] = useState(null);
  const [lines, setLines] = useState(asnSelectedLines || []);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [saveModalStatus, setSaveModalStatus] = useState('success');

  const rawItemsByPORef = useRef({});
  const allPoByIdRef = useRef(new Map());
  const deletedSinceOpenRef = useRef(false);

  const resetToAsnFromReceive = useCallback(
    (params = {}) => {
      navigation.dispatch(
        CommonActions.reset({
          index: 1,
          routes: [{ name: 'Receive' }, { name: 'AsnReceiptScreen', params }],
        })
      );
    },
    [navigation]
  );

  useEffect(() => {
    setLines(asnSelectedLines || []);
    const map = {};
    (asnSelectedLines || []).forEach((row) => {
      const poId = row?.po_id;
      const edited = getAsnEditedLinesForPO(poId);
      const src =
        Array.isArray(edited) && edited.length
          ? edited
          : Array.isArray(row?.line?.asn_line_items)
          ? row.line.asn_line_items
          : [];
      map[poId] = JSON.parse(JSON.stringify(src));
    });
    rawItemsByPORef.current = map;
  }, [asnSelectedLines, getAsnEditedLinesForPO]);

  useEffect(() => {
    const loadAll = async () => {
      if (!asnHeader?.asn_id) return;
      try {
        const resp = await GetASNPoItems(asnHeader.asn_id);
        const m = new Map();
        for (const po of Array.isArray(resp) ? resp : []) {
          const poid = String(po?.po_id ?? '');
          if (!poid) continue;
          const arr = Array.isArray(po?.asn_line_items) ? po.asn_line_items : [];
          const prev = m.get(poid) || [];
          m.set(poid, prev.concat(arr));
        }
        allPoByIdRef.current = m;
      } catch {
        allPoByIdRef.current = new Map();
      }
    };
    loadAll();
  }, [asnHeader?.asn_id]);

  const handleBack = useCallback(() => {
    if (deletedSinceOpenRef.current) {
      resetToAsnFromReceive({ fromDeleted: true });
      return true;
    }
    navigation.goBack();
    return true;
  }, [navigation, resetToAsnFromReceive]);

  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', handleBack);
      return () => sub.remove();
    }, [handleBack])
  );

  const toggleExpand = (id) => setExpandedId((prev) => (prev === id ? null : id));

  const openQty = (li) => Math.max(0, n(li?.ordered_qty) - n(li?.rcvd_qty));
  const allZeroInItems = (items) => items.every((li) => n(pickQty(li)) === 0);

  const itemsSrcForRow = (row) => {
    const poId = row?.po_id;
    const frozen = rawItemsByPORef.current[poId];
    return Array.isArray(frozen) ? frozen : [];
  };

  const applyUiRule = (items) => {
    if (!items.length) return [];
    if (allZeroInItems(items)) {
      return items.map((li, idx) => ({
        key: String(li?.item_code ?? li?.item_id ?? idx),
        name: String(li?.item_code ?? li?.item_description ?? `Item ${idx + 1}`),
        ordered: n(li?.ordered_qty ?? 0),
        shipped_qty: n(li?.shipped_qty ?? 0),
        receiving: openQty(li),
        _raw: li,
      }));
    }
    return items
      .filter((li) => n(pickQty(li)) > 0)
      .map((li, idx) => ({
        key: String(li?.item_code ?? li?.item_id ?? idx),
        name: String(li?.item_code ?? li?.item_description ?? `Item ${idx + 1}`),
        ordered: n(li?.ordered_qty ?? 0),
        shipped_qty: n(li?.shipped_qty ?? 0),
        receiving: n(pickQty(li)),
        _raw: li,
      }));
  };

  const filteredLines = useMemo(() => lines, [lines]);

  const unselectedPoIds = useMemo(() => {
    const allIds = Array.from(allPoByIdRef.current.keys());
    const selectedIds = new Set((asnSelectedPOIds || []).map(String));
    const visibleSelected = new Set(filteredLines.map((r) => String(r?.po_id)));
    const selectedUnion = new Set([...selectedIds, ...visibleSelected]);
    return allIds.filter((id) => !selectedUnion.has(String(id)));
  }, [filteredLines, asnSelectedPOIds]);

  const mapRowItemsForPayloadSelected = (row) => {
    const src = itemsSrcForRow(row);
    const uiAllZero = allZeroInItems(src);
    const today = formatToday();
    return src.map((li) => {
      const qty = uiAllZero ? remainingFor(li) : clampQty(li, pickQty(li));
      return {
        po_line_id: li?.po_line_id ?? row?.line?.po_line_id ?? null,
        item_id: li?.item_id ?? null,
        org_id: li?.org_id ?? OrgData?.selectedOrg ?? null,
        sub_inv_id: li?.subInventory ?? li?.sub_inv_id ?? OrgData?.selectedinventory ?? null,
        locator_id: li?.locator ?? li?.locator_id ?? null,
        lot_number: '',
        expiry_date: today,
        received_qty: qty,
        received_type: 'asn',
        asn_header_uuid: asnHeader?.asn_id,
        interface_header_id: asnHeader?.interface_id ?? null,
        is_checked: true,
      };
    });
  };

  const mapRowItemsForPayloadUnselected = (poId) => {
    const src = Array.isArray(allPoByIdRef.current.get(String(poId))) ? allPoByIdRef.current.get(String(poId)) : [];
    const today = formatToday();
    return src.map((li) => ({
      po_line_id: li?.po_line_id ?? null,
      item_id: li?.item_id ?? null,
      org_id: li?.org_id ?? OrgData?.selectedOrg ?? null,
      sub_inv_id: li?.sub_inv_id ?? OrgData?.selectedinventory ?? null,
      locator_id: li?.locator_id ?? null,
      lot_number: '',
      expiry_date: today,
      received_qty: 0,
      received_type: 'asn',
      asn_header_uuid: asnHeader?.asn_id,
      interface_header_id: asnHeader?.interface_id ?? null,
      is_checked: false,
    }));
  };

  const collectAllItemsForSave = useCallback(() => {
    const selectedRows = filteredLines.flatMap((row) => mapRowItemsForPayloadSelected(row));
    const unselectedRows = unselectedPoIds.flatMap((id) => mapRowItemsForPayloadUnselected(id));
    return [...selectedRows, ...unselectedRows].filter((x) => x.item_id || x.po_line_id);
  }, [filteredLines, unselectedPoIds, OrgData, asnHeader]);

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
      const edited = getAsnEditedLinesForPO(poId);
      if (Array.isArray(edited) && edited.length) {
        setAsnEditedLinesForPO(poId, []);
      }
      navigation.navigate('IC_poviewitems', {
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
      const row = (lines || []).find((r) => String(r.id) === String(id));
      if (!row) return;
      const poId = String(row.po_id);
      const nextLines = (lines || []).filter((r) => String(r.id) !== String(id));
      setLines(nextLines);
      const nextSelectedIds = (asnSelectedPOIds || []).map(String).filter((x) => x !== poId);
      setAsnSelectedPOIds(nextSelectedIds);
      removeAsnEditedLinesForPO(poId);
      const nextSummary = (asnSelectedLines || []).filter((r) => String(r.po_id) !== poId);
      initAsnSelectedLines(nextSummary);
      delete rawItemsByPORef.current[poId];
      deletedSinceOpenRef.current = true;
      if (expandedId === id) setExpandedId(null);
      Toast.show({ type: 'success', text1: 'PO removed from selection', position: 'top', visibilityTime: 1200 });
    },
    [lines, asnSelectedPOIds, asnSelectedLines, setAsnSelectedPOIds, removeAsnEditedLinesForPO, initAsnSelectedLines, expandedId]
  );

  const onSave = async () => {
    const selectedCount = filteredLines.length;
    if (!selectedCount && unselectedPoIds.length === 0) {
      Toast.show({ type: 'info', text1: 'No items to save', position: 'top', visibilityTime: 2000 });
      return;
    }
    const all = collectAllItemsForSave();
    if (!all.length) {
      Toast.show({ type: 'info', text1: 'No items to save', position: 'top', visibilityTime: 2000 });
      return;
    }
    if (!filteredLines.length) {
      Toast.show({ type: 'info', text1: 'No items to save', position: 'top', visibilityTime: 2000 });
      return;
    }
    try {
      const payload = mapAsnSaveData(all);
      const res = await Save_Receive_Qty(payload);
      if (isSaveSuccess(res)) {
        setSaveModalStatus('success');
        setSaveModalVisible(true);
        setTimeout(() => {
          setSaveModalVisible(false);
          clearAsnFlow();
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

  const onConfirmOpen = () => {
    if (!filteredLines.length) {
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

  const goToLineItemDetails = (startIdx = 0, sourceList = []) => {
    const items = sourceList.map((it, i) => {
      const raw = it._raw || {};
      const qty = n(it.receiving);
      return {
        id: String(raw.id ?? i),
        poNumber: asnHeader?.asn_num ?? raw.po_number ?? '—',
        lineNumber: i + 1,
        itemName: raw.item_code ?? it.name ?? '',
        itemid: raw.item_id,
        ship_to_location: raw.ship_to_location,
        itemDescription: raw.item_description ?? '',
        item_description: raw.item_description ?? '',
        orderQty: n(raw.ordered_qty ?? it.ordered ?? 0),
        openQty: remainingFor(raw),
        uom: raw.uom,
        receivingQty: qty,
        receivingStatus: raw.line_status ?? '',
        lpn: raw.lpn ?? '',
        subInventory: raw.sub_inv_id ?? '',
        locator: raw.locator_id ?? '',
        max_open_qty: n(raw.max_open_qty ?? 0),
        po_line_id: raw.po_line_id,
      };
    });
    navigation.navigate('IC_ASNPOLineItemDetails', {
      items,
      startIndex: startIdx,
      readonly: false,
      listType: 'line',
      returnTo: 'IC_podetailsummary',
    });
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
              {isExpanded ? <UpArrowIcon style={styles.caretIcon} /> : <DownArrowIcon style={styles.caretIcon} />}
            </TouchableOpacity>
            {isExpanded && (
              <View style={styles.itemsContainer}>
                <View style={styles.itemsHeader}>
                  <Text style={[styles.itemsHeaderText, styles.colItem]}>List of Items</Text>
                  <Text style={[styles.itemsHeaderText, styles.colOrdered]}>Ordered Qty</Text>
                  <Text style={[styles.itemsHeaderText, styles.colOrdered]}>Shipped Qty</Text>
                  <Text style={[styles.itemsHeaderText, styles.colReceiving]}>Receiving Qty</Text>
                </View>
                <FlatList
                  data={uiItems}
                  keyExtractor={(it) => it.key}
                  renderItem={({ item, index }) => (
                    <View style={styles.itemRow}>
                      <TouchableOpacity style={styles.colItem} onPress={() => goToLineItemDetails(index, uiItems)}>
                        <Text style={styles.viewDetails} numberOfLines={1}>
                          {item._raw?.item_code ?? item.name ?? dash}
                        </Text>
                      </TouchableOpacity>
                      <Text style={[styles.itemText, styles.colOrdered]}>
                        {Number.isFinite(item.ordered) ? item.ordered : 0}
                      </Text>
                      <Text style={[styles.itemText, styles.colOrdered]}>
                        {Number.isFinite(item.shipped_qty) ? item.shipped_qty : 0}
                      </Text>
                      <Text style={[styles.itemTextStrong, styles.colReceiving]}>
                        {Number.isFinite(item.receiving) ? item.receiving : 0}
                      </Text>
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
    return [{ type: 'asn' }, { type: 'section-header' }];
  }, []);

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
    if (item.type === 'section-header') {
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
            {filteredLines.length === 0 ? (
              <View style={{ padding: 16 }}>
                <Text style={{ textAlign: 'center', color: '#666' }}>No items selected</Text>
              </View>
            ) : (
              <FlatList
                data={filteredLines}
                keyExtractor={(it) => String(it.id)}
                renderItem={(props) => renderLineCard(props)}
                removeClippedSubviews
                initialNumToRender={6}
                windowSize={7}
                scrollEnabled={false}
              />
            )}
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
          screenTitle="Receiving"
          notificationCount={0}
          onBack={handleBack}
          onMenu={() => {}}
          onNotificationPress={() => navigation.navigate('Home')}
          onProfilePress={() => navigation.navigate('Home')}
        />
        <FlatList
          data={listData}
          renderItem={renderItem}
          keyExtractor={(it) => it.type}
          contentContainerStyle={{ paddingBottom: 120 }}
          removeClippedSubviews
          initialNumToRender={2}
          windowSize={3}
        />
        <FooterButtonsComponent
          leftLabel="Save"
          rightLabel="Confirm"
          onLeftPress={onSave}
          onRightPress={onConfirmOpen}
          leftEnabled
          rightEnabled
        />
      </SafeAreaView>

      <ConfirmModalComponent
        visible={confirmVisible}
        title="Confirmation"
        message="Are you sure want to receive this ASN Order?"
        confirmAction={confirmAction}
        onCancel={() => setConfirmVisible(false)}
        onSuccess={onConfirmSuccess}
        onFailure={onConfirmFailure}
        successMessage="ASN receipt created successfully"
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
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, maxWidth: 350 },
  poNumber: { fontSize: 14, fontWeight: '700', color: '#242424', textAlign: 'center' },
  qtyRow: { flexDirection: 'row', gap: 40 },
  qtyheader: { fontSize: 10, fontWeight: '600', color: '#595A5C', textAlign: 'center' },
  qtyvalue: { fontSize: 10, fontWeight: '600', color: '#242424', textAlign: 'center' },
  viewButton: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#ECF1F7', paddingVertical: 5, paddingHorizontal: 12, alignItems: 'center' },
  viewButtonText: { fontSize: 12, color: '#5D768B' },
  caretIcon: { marginLeft: 6, width: 12, height: 12 },
  itemsContainer: { backgroundColor: '#FBFBFB' },
  itemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    paddingBottom: 6,
    paddingHorizontal: 12,
  },
  itemsHeaderText: { fontWeight: '600', fontStyle: 'italic', fontSize: 12, width: 140, color: '#595A5C' },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#D9E4EE',
  },
  itemRowLast: { borderBottomWidth: 0 },
  colItem: { flex: 1 },
  colOrdered: { flex: 1 },
  colReceiving: { flex: 1 },
  itemText: { fontSize: 12, fontWeight: '400', color: '#242424' },
  itemTextStrong: { fontSize: 12, fontWeight: '700', color: '#242424' },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: '#D9E4EE' },
  viewDetails: { fontSize: 12, fontWeight: '700', color: '#033EFF', textDecorationLine: 'underline' },
  leftActionContainer: { backgroundColor: '#ECF1F7', justifyContent: 'center', alignItems: 'flex-start', width: 40 },
  rightActionContainer: { backgroundColor: '#F8D2D4', justifyContent: 'center', alignItems: 'flex-end', width: 40 },
  actionButton: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 10 },
});

export default IC_PODetailSummary;
