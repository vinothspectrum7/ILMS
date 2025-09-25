import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Modal, ActivityIndicator, BackHandler } from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import GlobalHeaderComponent from '../components/GlobalHeaderComponent';
import ASNinfoCardComponent from '../components/ASNinfoCardComponent';
import ASNListCardComponent from '../components/Asnlistcardcomponent';
import AsnHeaderComponent from '../components/AsnTableHeader';
import FooterButtonsComponent from '../components/FooterButtonsComponent';
import BarcodeScanner from './BarCodeScanner';
import BarcodeScannerIcon from '../assets/icons/barcodescanner.svg';
import ConfirmSvg from '../assets/icons/success.svg';
import FailureSvg from '../assets/icons/failure.svg';
import { GetASNPoItems, Save_Receive_Qty } from '../api/ApiServices';
import { useReceivingStore } from '../store/receivingStore';

const statusLabelToApi = { 'Yet to Receive': 'OPEN', 'Partly Received': 'PARTIALLY RECEIVED', 'Fully Received': 'FULLY RECEIVED' };

const earliestDateISO = (lineItems) => {
  if (!Array.isArray(lineItems) || lineItems.length === 0) return '-';
  const ts = lineItems
    .map((li) => {
      const v = li?.shipped_date;
      const d = v ? new Date(v) : null;
      return d && !Number.isNaN(d.getTime()) ? d.getTime() : null;
    })
    .filter((t) => t !== null);
  if (ts.length === 0) return '-';
  return new Date(Math.min(...ts)).toISOString();
};

const groupByPO = (arr) => {
  const rank = { 'FULLY RECEIVED': 3, 'PARTLY RECEIVED': 2, 'IN PROGRESS': 1, OPEN: 0 };
  const map = new Map();
  for (const po of Array.isArray(arr) ? arr : []) {
    const key = String(po?.po_id ?? po?.po_number ?? '');
    if (!key) continue;
    const lines = Array.isArray(po?.asn_line_items) ? po.asn_line_items : [];
    const disabled = po?.disabled;
    if (map.has(key)) {
      const ex = map.get(key);
      ex.line_items = ex.line_items.concat(lines);
      const nextRank = rank[String(po.po_status || '').toUpperCase()] ?? -1;
      const curRank = rank[String(ex.po_status || '').toUpperCase()] ?? -1;
      if (nextRank > curRank) ex.po_status = po.po_status || ex.po_status;
      ex.orderedByDate = earliestDateISO(ex.line_items);
    } else {
      map.set(key, { id: String(po.po_id), po_id: po.po_id, po_number: po.po_number ?? '-', po_status: String(po.po_status || 'OPEN').toUpperCase(), orderedByDate: earliestDateISO(lines), line_items: lines.slice(),disabled:disabled });
    }
  }
  return Array.from(map.values());
};

const deepClone = (obj) => JSON.parse(JSON.stringify(obj ?? {}));
const remainingForASN = (li) => {
  const ord = Number(li?.ordered_qty ?? 0);
  const rcvd = Number(li?.rcvd_qty ?? 0);
  const rem = ord - rcvd;
  const open = rem>li?.shipped_qty?Number(li?.shipped_qty ?? 0) - Number(li?.rcvd_qty):rem;
  return Number.isFinite(open) && open > 0 ? open : 0;
};
const clampASN = (li, requested) => {
  const req = Number(requested ?? 0);
  if (!Number.isFinite(req) || req <= 0) return 0;
  const rem = remainingForASN(li);
  return rem;
};
const formatToday = () => {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).toString().padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${yyyy}-${mm}-${dd}`;
};

const AsnReceiptScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [phase, setPhase] = useState('idle');
  const fromScan = !!route?.params?.fromScan;
  const scannedAsnNumber = route?.params?.scannedAsnNumber ?? null;
  const scannedAsnId = route?.params?.scannedAsnId;
  const listRef = useRef(null);

  const {
    OrgData,
    setAsnHeader,
    initAsnSelectedLines,
    asnSelectedPOIds,
    setAsnSelectedPOIds,
    selectAsnPOId,
    unselectAsnPOId,
    setAsnEditedLinesForPO,
    removeAsnEditedLinesForPO,
    getAsnEditedLinesForPO,
    asnHeader,
  } = useReceivingStore();

  const activeASN = route?.params?.selectedASN || asnHeader;

  useEffect(() => {
    if (fromScan && scannedAsnNumber) {
      Toast.show({ type: 'success', text1: `Scanned ASN number is ${scannedAsnNumber}`, position: 'top', visibilityTime: 1500 });
    }
  }, [fromScan, scannedAsnNumber]);

  const loadData = useCallback(async () => {
    if (!activeASN?.asn_id) {
      setItems([]);
      return;
    }
    try {
      setPhase('loading');
      const resp = await GetASNPoItems(activeASN.asn_id);
        const asns = Array.isArray(resp) ? resp : resp ? [resp] : [];
        console.log(asns,"GetASNPoItems GetASNPoItems");
        const filteredAsns = asns.filter(asn => asn.po_status !== "FULLY RECEIVED");
const updatedAsns = filteredAsns.map((asn) => {
  const asn_line_items = (asn.asn_line_items || []).map((li) => ({
    ...li,
    max_open_qty: Number(li?.shipped_qty ?? 0) - Number(li?.rcvd_qty ?? 0),
  }));
  const disabled = asn_line_items.every(
    (li) => (Number(li?.shipped_qty ?? 0) - Number(li?.rcvd_qty ?? 0)) <= 0
  );
  console.log(disabled,"asn_line_itemsdisabled")
  return {
    ...asn,
    asn_line_items,
    disabled,
  };
});
      const grouped = groupByPO(updatedAsns || []);
      setItems(grouped);
      setAsnHeader(activeASN);
      setPhase('success');
    } catch {
      setItems([]);
      setPhase('error');
    }
  }, [activeASN?.asn_id, setAsnHeader]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const selectedIdsSet = useMemo(() => new Set((asnSelectedPOIds || []).map(String)), [asnSelectedPOIds]);

  const visibleItems = useMemo(() => {
    if (!Array.isArray(items) || !items.length) return [];
    console.log(items,"visibleItemsvisibleItemsvisibleItems")
    if (filter == null) return items;
    if (filter === 'Receive In progress') {
      return items.filter((it) => selectedIdsSet.has(String(it.po_id)) && it.po_status !== 'FULLY RECEIVED');
    }
    const apiStatus = statusLabelToApi[filter] ?? null;
    if (!apiStatus) return [];
    return items.filter((it) => String(it.po_status).toUpperCase() === apiStatus.toUpperCase() && !selectedIdsSet.has(String(it.po_id)));
  }, [items, filter, selectedIdsSet]);

  const allSelectedVisible = useMemo(() => {
    if (visibleItems.length === 0) return false;
    return visibleItems.every((i) => selectedIdsSet.has(String(i.po_id)));
  }, [visibleItems, selectedIdsSet]);

  const mergeLines = useCallback((poId, sourceLines) => {
    const edited = getAsnEditedLinesForPO(poId);
    if (!Array.isArray(edited) || edited.length === 0) return sourceLines || [];
    const byId = new Map();
    (sourceLines || []).forEach((li) => byId.set(String(li.po_line_id ?? li.item_id ?? Math.random()), li));
    return edited.map((e) => {
      const key = String(e.po_line_id ?? e.item_id ?? Math.random());
      const base = byId.get(key) || {};
      return { ...deepClone(base), ...deepClone(e) };
    });
  }, [getAsnEditedLinesForPO]);

  const ensureAutoFillIfAllZero = (lines) => {
    const merged = Array.isArray(lines) ? lines.map((x) => deepClone(x)) : [];
    const allZero = merged.every((li) => Number(li?.receiving_qty ?? 0) <= 0);
    if (!allZero) {
      return merged.map((li) => ({ ...li, receiving_qty: clampASN(li, Number(li?.receiving_qty ?? 0)) }));
    }
    return merged.map((li) => ({ ...li, receiving_qty: remainingForASN(li) }));
  };

    const ensureAutoFillforSave = (lines) => {
    const merged = Array.isArray(lines) ? lines.map((x) => deepClone(x)) : [];
    const allZero = merged.every((li) => Number(li?.receiving_qty ?? 0) <= 0);
    if (!allZero) {
      return merged.map((li) => ({ ...li, receiving_qty: li?.receiving_qty ?? 0 }));
    }
    return merged.map((li) => ({ ...li, receiving_qty: remainingForASN(li) }));
  };

  const rebuildSelectedSummaryToStore = useCallback(() => {
    const results = [];
    const selectedPOs = items.filter((it) => selectedIdsSet.has(String(it.po_id)));
    for (const po of selectedPOs) {
      const merged = mergeLines(po.po_id, po.line_items).map((li) => ({ ...li, receiving_qty: clampASN(li, Number(li?.receiving_qty ?? 0)) }));
      const sum = (arr, key) => arr.reduce((acc, x) => acc + (Number.isFinite(Number(x?.[key])) ? Number(x[key]) : 0), 0);
      const ordered_qty = sum(merged, 'ordered_qty');
      const rcvd_qty = sum(merged, 'rcvd_qty');
      const receiving_qty = sum(merged, 'receiving_qty');
      const shippedVals = merged.map((x) => Number(x?.shipped_qty)).filter((v) => Number.isFinite(v));
      const shipped_qty = shippedVals.length ? shippedVals.reduce((a, b) => a + b, 0) : null;
      results.push({ id: String(po.po_id), po_id: po.po_id ?? '', po_number: po.po_number ?? '', line: { ordered_qty, rcvd_qty, shipped_qty, receiving_qty, asn_line_items: merged } });
    }
    initAsnSelectedLines(results);
  }, [items, selectedIdsSet, mergeLines, initAsnSelectedLines]);

  const handleCheckToggle = (item) => {
    if (String(item.po_status).toUpperCase() === 'FULLY RECEIVED') return;
    const isSelected = selectedIdsSet.has(String(item.po_id));
    if (isSelected) {
      unselectAsnPOId(item.po_id);
      removeAsnEditedLinesForPO(item.po_id);
      rebuildSelectedSummaryToStore();
      return;
    }
    selectAsnPOId(item.po_id);
    const existing = getAsnEditedLinesForPO(item.po_id);
    if (!Array.isArray(existing) || existing.length === 0) {
      const seeded = (item.line_items || []).map((li) => {
        const base = deepClone(li);
        const rx = Number(base?.receiving_qty ?? 0);
        return { ...base, receiving_qty: Number.isFinite(rx) ? rx : 0 };
      });
      const withRule = ensureAutoFillIfAllZero(seeded);
      setAsnEditedLinesForPO(item.po_id, withRule);
    } else {
      const normalized = existing.map((li) => ({ ...li, receiving_qty: clampASN(li, Number(li?.receiving_qty ?? 0)) }));
      setAsnEditedLinesForPO(item.po_id, normalized);
    }
    rebuildSelectedSummaryToStore();
  };

  const toggleAllVisible = () => {
    const idsOnScreen = visibleItems.map((i) => String(i.po_id));
    if (!allSelectedVisible) {
      const addable = visibleItems.filter((i) => i.po_status !== 'FULLY RECEIVED');
      const merged = Array.from(new Set([...(asnSelectedPOIds || []).map(String), ...addable.map((i) => String(i.po_id))]));
      setAsnSelectedPOIds(merged);
      addable.forEach((po) => {
        const existing = getAsnEditedLinesForPO(po.po_id);
        if (!Array.isArray(existing) || existing.length === 0) {
          const seeded = (po.line_items || []).map((li) => {
            const base = deepClone(li);
            const rx = Number(base?.receiving_qty ?? 0);
            return { ...base, receiving_qty: Number.isFinite(rx) ? rx : 0 };
          });
          const withRule = ensureAutoFillIfAllZero(seeded);
          setAsnEditedLinesForPO(po.po_id, withRule);
        } else {
          const normalized = existing.map((li) => ({ ...li, receiving_qty: clampASN(li, Number(li?.receiving_qty ?? 0)) }));
          setAsnEditedLinesForPO(po.po_id, normalized);
        }
      });
    } else {
      const remaining = (asnSelectedPOIds || []).map(String).filter((id) => !idsOnScreen.includes(id));
      setAsnSelectedPOIds(remaining);
      visibleItems.forEach((po) => removeAsnEditedLinesForPO(po.po_id));
    }
    rebuildSelectedSummaryToStore();
  };

  const handleScanRowPress = () => setShowScanner(true);

  const handleScan = (value) => {
    const code = String(value).trim().toUpperCase();
    const matches = items.filter((p) => String(p.po_number ?? '').toUpperCase() === code);
    if (matches.length > 0) {
      const selectable = matches.filter((m) => m.po_status !== 'FULLY RECEIVED');
      const skipped = matches.length - selectable.length;
      if (selectable.length > 0) {
        const ids = new Set((asnSelectedPOIds || []).map(String));
        selectable.forEach((m) => {
          ids.add(String(m.po_id));
          const existing = getAsnEditedLinesForPO(m.po_id);
          if (!Array.isArray(existing) || existing.length === 0) {
            const seeded = (m.line_items || []).map((li) => {
              const base = deepClone(li);
              const rx = Number(base?.receiving_qty ?? 0);
              return { ...base, receiving_qty: Number.isFinite(rx) ? rx : 0 };
            });
            const withRule = ensureAutoFillIfAllZero(seeded);
            setAsnEditedLinesForPO(m.po_id, withRule);
          } else {
            const normalized = existing.map((li) => ({ ...li, receiving_qty: clampASN(li, Number(li?.receiving_qty ?? 0)) }));
            setAsnEditedLinesForPO(m.po_id, normalized);
          }
        });
        setAsnSelectedPOIds(Array.from(ids));
        rebuildSelectedSummaryToStore();
      }
      setShowScanner(false);
      Toast.show({ type: selectable.length > 0 ? 'success' : 'info', text1: selectable.length > 0 ? 'Scanned PO' : 'PO already fully received', text2: selectable.length > 0 ? `${code} • ${selectable.length} selected${skipped > 0 ? ` • ${skipped} skipped` : ''}` : `${code}`, position: 'top', visibilityTime: 4000 });
      const firstIdx = visibleItems.findIndex((vi) => String(vi.po_id) === String(selectable[0]?.po_id || matches[0]?.po_id));
      if (firstIdx >= 0 && listRef.current) {
        try { listRef.current.scrollToIndex({ index: firstIdx, animated: true }); } catch {}
      }
    } else {
      setShowScanner(false);
      Toast.show({ type: 'error', text1: 'PO/IR number not found', text2: `Scanned PO number ${code} not found`, position: 'top', visibilityTime: 5000 });
    }
  };

  const buildAllRowsForSave = () => {
    const byId = new Map();
    items.forEach((po) => {
      const merged = mergeLines(po.po_id, po.line_items);
      byId.set(String(po.po_id), merged);
    });
    const rows = [];
    items.forEach((po) => {
      const isChecked = selectedIdsSet.has(String(po.po_id));
      const merged = byId.get(String(po.po_id)) || [];
          console.log(merged,"buildAllRowsForSave")
      let finalLines = merged.map((li) => ({ ...li }));
      if (isChecked) finalLines = ensureAutoFillforSave(finalLines);
                console.log(finalLines,"finalLines")
      finalLines.forEach((li) => {
        const rx = Number(li?.receiving_qty ?? 0);
        const received_qty = rx;
        rows.push({
          po_line_id: li?.po_line_id,
          item_id: li?.item_id,
          org_id: OrgData?.selectedOrg,
          sub_inv_id: li?.sub_inv_id ?? OrgData?.selectedinventory ?? null,
          locator_id: li?.locator_id ?? null,
          is_checked: !!isChecked,
          lot_number: '',
          expiry_date: formatToday(),
          received_qty,
          interface_header_id: activeASN?.interface_header_id ?? null,
          received_type: 'asn',
          asn_header_uuid: activeASN?.asn_id ?? null,
        });
      });
    });
    return rows;
  };

  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [saveModalStatus, setSaveModalStatus] = useState('success');
  const didCompleteRef = useRef(false);

  const isSaveSuccess = (res) => {
    if (!res) return false;
    if (res?.results?.[0]?.status === 'success') return true;
    if (res?.results?.[0]?.status === 'error') return false;
    if (res === true) return true;
    if (typeof res?.results === 'boolean') return res.results === true;
    if (typeof res?.results === 'number') return res.results > 0;
    if (Array.isArray(res?.results)) return res.results.length > 0;
    if (res?.status === 'success' || res?.status === 'ok') return true;
    if (typeof res?.message === 'string' && res.message.toLowerCase().includes('success')) return true;
    return false;
  };

  const handleSave = async () => {
    const payload = buildAllRowsForSave();
    try {
      const response = await Save_Receive_Qty(payload);
      if (isSaveSuccess(response)) {
        setSaveModalStatus('success');
        setSaveModalVisible(true);
        setTimeout(() => {
          if (didCompleteRef.current) return;
          didCompleteRef.current = true;
          setSaveModalVisible(false);
        }, 3500);
      } else {
        setSaveModalStatus('failure');
        setSaveModalVisible(true);
        setTimeout(() => {
          if (didCompleteRef.current) return;
          didCompleteRef.current = true;
          setSaveModalVisible(false);
        }, 3500);
      }
    } catch {
      setSaveModalStatus('failure');
      setSaveModalVisible(true);
      setTimeout(() => {
        if (didCompleteRef.current) return;
        didCompleteRef.current = true;
        setSaveModalVisible(false);
      }, 3500);
    }
  };

  const handleReceive = () => {
    const selectedPOs = items.filter((it) => selectedIdsSet.has(String(it.po_id)));
    if (selectedPOs.length === 0) {
      Toast.show({ type: 'info', text1: 'No items selected', position: 'top', visibilityTime: 2000 });
      return;
    }
    rebuildSelectedSummaryToStore();
    navigation.navigate('podetailsummary', { fromScan: false, scannedAsnId, scannedAsnNumber });
  };

  const unselectAllLikeCheckbox = useCallback(() => {
    const ids = (asnSelectedPOIds || []).map(String);
    if (ids.length === 0) {
      initAsnSelectedLines([]);
      return;
    }
    ids.forEach((id) => removeAsnEditedLinesForPO(id));
    setAsnSelectedPOIds([]);
    initAsnSelectedLines([]);
  }, [asnSelectedPOIds, removeAsnEditedLinesForPO, setAsnSelectedPOIds, initAsnSelectedLines]);

  const goBackToReceive = useCallback(() => {
    if (showScanner) {
      setShowScanner(false);
      return true;
    }
    unselectAllLikeCheckbox();
    navigation.navigate('Receive');
    return true;
  }, [showScanner, unselectAllLikeCheckbox, navigation]);

  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', goBackToReceive);
      return () => sub.remove();
    }, [goBackToReceive])
  );

  return (
    <SafeAreaView style={styles.container}>
      <GlobalHeaderComponent
        organizationName={OrgData?.selectedOrgCode}
        screenTitle="Receiving"
        notificationCount={0}
        onBack={goBackToReceive}
        onMenu={() => {}}
        onNotificationPress={() => navigation.navigate('Home')}
        onProfilePress={() => navigation.navigate('Home')}
      />
      {phase === 'loading' && (
        <View style={styles.loaderWrapper}>
          <ActivityIndicator size="large" color="#233E55" />
        </View>
      )}
      {phase !== 'loading' && (
        <>
          <ScrollView
            contentContainerStyle={styles.contentContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <ASNinfoCardComponent
              receiptNumber={activeASN?.receiptNumber || '-'}
              supplier={activeASN?.supplier_name || '-'}
              asnnumber={activeASN?.asn_num || '-'}
              shippeddate={activeASN?.shipped_date || '-'}
              exprcteddate={activeASN?.expected_receipt_date || '-'}
              supplierSite={activeASN?.supplier_site || '-'}
              carrier={activeASN?.carrier || '-'}
              packSlip={activeASN?.pack_slip || '-'}
              bol={activeASN?.bol || '-'}
              waybill={activeASN?.waybill || '-'}
              airbill={activeASN?.airbill || '-'}
            />
            <View style={styles.itemcontainer}>
              <TouchableOpacity style={styles.scanRow} onPress={handleScanRowPress} activeOpacity={0.8}>
                <Text style={styles.scanText}>Scan your PO</Text>
                <BarcodeScannerIcon width={20} height={20} fill="#7A7A7A" />
              </TouchableOpacity>
              <View style={styles.tableHeader}>
                <AsnHeaderComponent allSelected={allSelectedVisible} onToggleAll={toggleAllVisible} activeFilter={filter} onChangeFilter={setFilter} />
              </View>
              <FlatList
                ref={listRef}
                data={visibleItems}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                  const mergedLines = mergeLines(item.po_id, item.line_items);
                  return (
                    <View style={styles.lineItemWrapper}>
                      <ASNListCardComponent
                        item={{ po_id: item.po_id, po_number: item.po_number, Poid: item.po_number, orderedByDate: item.orderedByDate, po_status: item.po_status,disabled:item.disabled, line_items: mergedLines }}
                        isSelected={selectedIdsSet.has(String(item.po_id))}
                        onCheckToggle={() => handleCheckToggle(item)}
                      />
                    </View>
                  );
                }}
                scrollEnabled={false}
              />
            </View>
          </ScrollView>

          <FooterButtonsComponent
            leftLabel="Save"
            rightLabel="Receive"
            onLeftPress={handleSave}
            onRightPress={handleReceive}
            leftEnabled={(asnSelectedPOIds || []).length > 0}
            rightEnabled={(asnSelectedPOIds || []).length > 0}
          />

          <Modal visible={showScanner} animationType="slide" onRequestClose={() => setShowScanner(false)}>
            <BarcodeScanner onScan={handleScan} onClose={() => setShowScanner(false)} />
          </Modal>

          <Modal
            visible={saveModalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => {}}
          >
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' }}>
              <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 24, alignItems: 'center', width: '80%' }}>
                {saveModalStatus === 'success' ? (
                  <ConfirmSvg width={72} height={72} />
                ) : (
                  <FailureSvg width={72} height={72} />
                )}
                <Text style={{ marginTop: 16, textAlign:'center', fontSize: 16, color: '#333' }}>
                  {saveModalStatus === 'success'
                    ? 'Order Saved Successfully. Please continue Receipt.'
                    : 'Save failed. Please try again.'}
                </Text>
              </View>
            </View>
          </Modal>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F8FA' },
  loaderWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  contentContainer: { paddingBottom: 120 },
  tableHeader: { marginTop: 8, marginBottom: 10, zIndex: 5 },
  lineItemWrapper: { marginBottom: 12, zIndex: 1, elevation: 1 },
  scanRow: {
    backgroundColor: '#FFFFFF',
    borderColor: '#00000040',
    borderWidth: 1,
    borderRadius: 10,
    height: 40,
    marginHorizontal: 15,
    marginTop: 5,
    marginBottom: 5,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scanText: { color: '#777' },
  itemcontainer: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginTop: 10,
    marginBottom: 8,
    borderRadius: 12,
    paddingTop: 8,
    paddingBottom: 6,
    elevation: 2,
    overflow: 'visible',
  },
});

export default AsnReceiptScreen;
