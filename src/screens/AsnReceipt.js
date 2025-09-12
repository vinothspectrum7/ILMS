import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Modal } from 'react-native';
import GlobalHeaderComponent from '../components/GlobalHeaderComponent';
import FooterButtonsComponent from '../components/FooterButtonsComponent';
import ASNinfoCardComponent from '../components/ASNinfoCardComponent';
import ASNListCardComponent from '../components/Asnlistcardcomponent';
import AsnHeaderComponent from '../components/AsnTableHeader';
import { useNavigation, useRoute } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { GetASNPoItems } from '../api/ApiServices';
import { useReceivingStore } from '../store/receivingStore';
import BarcodeScannerIcon from '../assets/icons/barcodescanner.svg';
import BarcodeScanner from './BarCodeScanner';

const statusLabelToApi = {
  'Yet to Receive': 'OPEN',
  'Partly Received': 'PARTLY RECEIVED',
  'Fully Received': 'FULLY RECEIVED',
};

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
    if (map.has(key)) {
      const ex = map.get(key);
      ex.line_items = ex.line_items.concat(lines);
      const nextRank = rank[String(po.po_status || '').toUpperCase()] ?? -1;
      const curRank = rank[String(ex.po_status || '').toUpperCase()] ?? -1;
      if (nextRank > curRank) ex.po_status = po.po_status || ex.po_status;
      ex.orderedByDate = earliestDateISO(ex.line_items);
    } else {
      map.set(key, {
        id: String(po.po_id),
        po_id: po.po_id,
        po_number: po.po_number ?? '-',
        po_status: String(po.po_status || 'OPEN').toUpperCase(),
        orderedByDate: earliestDateISO(lines),
        line_items: lines.slice(),
      });
    }
  }
  return Array.from(map.values());
};

const AsnReceiptScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [selectedItems, setSelectedItems] = useState([]);
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const fromScan = !!route?.params?.fromScan;
  const scannedAsnNumber = route?.params?.scannedAsnNumber ?? null;
  const selectedASN = route?.params?.selectedASN;
  const scannedAsnId = route?.params?.scannedAsnId;
  const { OrgData, setAsnHeader, initAsnSelectedLines } = useReceivingStore();
  const listRef = useRef(null);

  useEffect(() => {
    if (fromScan && scannedAsnNumber) {
      Toast.show({ type: 'success', text1: `Scanned ASN number is ${scannedAsnNumber}`, position: 'top', visibilityTime: 1500 });
    }
    const loadData = async () => {
      try {
        const resp = await GetASNPoItems(selectedASN.asn_id);
        const grouped = groupByPO(resp || []);
        setItems(grouped);
      } catch {
        setItems([]);
      }
    };
    loadData();
  }, [fromScan, scannedAsnNumber, selectedASN?.asn_id]);

  const visibleItems = useMemo(() => {
    if (!Array.isArray(items) || !items.length) return [];
    if (filter == null) return items;
    if (filter === 'Receive In progress') {
      return items.filter((it) => selectedItems.includes(it.id) && it.po_status !== 'FULLY RECEIVED');
    }
    const apiStatus = statusLabelToApi[filter] ?? null;
    if (!apiStatus) return [];
    return items.filter(
      (it) => String(it.po_status).toUpperCase() === apiStatus.toUpperCase() && !selectedItems.includes(it.id)
    );
  }, [items, filter, selectedItems]);

  const allSelectedVisible = useMemo(() => {
    if (visibleItems.length === 0) return false;
    return visibleItems.every((i) => selectedItems.includes(i.id));
  }, [visibleItems, selectedItems]);

  const handleCheckToggle = (item) => {
    if (String(item.po_status).toUpperCase() === 'FULLY RECEIVED') return;
    const isChecked = selectedItems.includes(item.id);
    const next = isChecked ? selectedItems.filter((id) => id !== item.id) : [...selectedItems, item.id];
    setSelectedItems(next);
  };

  const handleSave = () => {
    console.log('Saved:', items);
  };

  const handleReceive = () => {
    const selectedPOs = items.filter((it) => selectedItems.includes(it.id));
    if (selectedPOs.length === 0) {
      Toast.show({ type: 'info', text1: 'No items selected', position: 'top', visibilityTime: 2000 });
      return;
    }

    const perPO = selectedPOs.map((po) => {
      const rawItems = Array.isArray(po.line_items) ? po.line_items : [];
      const enriched = rawItems.map((li) => {
        const rq = Number(li?.receiving_qty);
        const oq = Number(li?.ordered_qty);
        const receiving_qty = Number.isFinite(rq) && rq > 0 ? rq : Number.isFinite(oq) ? oq : 0;
        return { ...li, receiving_qty };
      });

      const sum = (arr, key) =>
        arr.reduce((acc, x) => {
          const v = Number(x?.[key]);
          return acc + (Number.isFinite(v) ? v : 0);
        }, 0);

      const ordered_qty = sum(enriched, 'ordered_qty');
      const rcvd_qty = sum(enriched, 'rcvd_qty');
      const receiving_qty = sum(enriched, 'receiving_qty');

      const shippedVals = enriched.map((x) => Number(x?.shipped_qty)).filter((v) => Number.isFinite(v));
      const shipped_qty = shippedVals.length ? shippedVals.reduce((a, b) => a + b, 0) : null;

      return {
        id: String(po.po_id),
        po_id: po.po_id ?? '',
        po_number: po.po_number ?? '',
        line: {
          ordered_qty,
          rcvd_qty,
          shipped_qty,
          receiving_qty,
          asn_line_items: enriched,
        },
      };
    });

    setAsnHeader(selectedASN);
    initAsnSelectedLines(perPO);
    navigation.navigate('podetailsummary', {
      selectedASN: selectedItems,
      fromScan: false,
      scannedAsnId,
      scannedAsnNumber,
    });
  };

  const isReceiveEnabled = selectedItems.length > 0;

  const toggleAllVisible = () => {
    const visIds = visibleItems.map((i) => i.id);
    const shouldSelectAll = !allSelectedVisible;
    if (shouldSelectAll) {
      const addable = visibleItems.filter((i) => i.po_status !== 'FULLY RECEIVED').map((i) => i.id);
      const merged = Array.from(new Set([...selectedItems, ...addable]));
      setSelectedItems(merged);
    } else {
      const remaining = selectedItems.filter((id) => !visIds.includes(id));
      setSelectedItems(remaining);
    }
  };

  const handleScanRowPress = () => {
    setShowScanner(true);
  };

  const handleScan = (value) => {
    const code = String(value).trim().toUpperCase();
    const matches = items.filter((p) => String(p.po_number ?? '').toUpperCase() === code);
    if (matches.length > 0) {
      const selectable = matches.filter((m) => m.po_status !== 'FULLY RECEIVED');
      const skipped = matches.length - selectable.length;
      if (selectable.length > 0) {
        setSelectedItems((prev) => {
          const ids = new Set(prev);
          selectable.forEach((m) => ids.add(m.id));
          return Array.from(ids);
        });
      }
      setShowScanner(false);
      Toast.show({
        type: selectable.length > 0 ? 'success' : 'info',
        text1: selectable.length > 0 ? 'Scanned PO' : 'PO already fully received',
        text2: selectable.length > 0 ? `${code} • ${selectable.length} selected${skipped > 0 ? ` • ${skipped} skipped` : ''}` : `${code}`,
        position: 'top',
        visibilityTime: 4000,
      });
      const firstIdx = visibleItems.findIndex((vi) => vi.id === (selectable[0]?.id || matches[0]?.id));
      if (firstIdx >= 0 && listRef.current) {
        try {
          listRef.current.scrollToIndex({ index: firstIdx, animated: true });
        } catch {}
      }
    } else {
      setShowScanner(false);
      Toast.show({
        type: 'error',
        text1: 'PO/IR number not found',
        text2: `Scanned PO number ${code} not found`,
        position: 'top',
        visibilityTime: 5000,
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <GlobalHeaderComponent
        organizationName={OrgData?.selectedOrgCode}
        screenTitle="Receiving"
        notificationCount={0}
        onBack={() => navigation.goBack()}
        onMenu={() => {}}
        onNotificationPress={() => navigation.navigate('Home')}
        onProfilePress={() => navigation.navigate('Home')}
      />

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <ASNinfoCardComponent
          receiptNumber={selectedASN?.receiptNumber || '-'}
          supplier={selectedASN?.supplier_name || '-'}
          asnnumber={selectedASN?.asn_num || '-'}
          shippeddate={selectedASN?.shipped_date || '-'}
          exprcteddate={selectedASN?.expected_receipt_date || '-'}
          supplierSite={selectedASN?.supplier_site || '-'}
          carrier={selectedASN?.carrier || '-'}
          packSlip={selectedASN?.pack_slip || '-'}
          bol={selectedASN?.bol || '-'}
          waybill={selectedASN?.waybill || '-'}
          airbill={selectedASN?.airbill || '-'}
        />

        <View style={styles.itemcontainer}>
          <TouchableOpacity style={styles.scanRow} onPress={handleScanRowPress} activeOpacity={0.8}>
            <Text style={styles.scanText}>Scan your item</Text>
            <BarcodeScannerIcon width={20} height={20} fill="#7A7A7A" />
          </TouchableOpacity>

          <View style={styles.tableHeader}>
            <AsnHeaderComponent
              allSelected={allSelectedVisible}
              onToggleAll={toggleAllVisible}
              activeFilter={filter}
              onChangeFilter={setFilter}
            />
          </View>

          <FlatList
            data={visibleItems}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.lineItemWrapper}>
                <ASNListCardComponent
                  item={{
                    Poid: item.po_number,
                    orderedByDate: item.orderedByDate,
                    po_status: item.po_status,
                    line_items: item.line_items,
                  }}
                  isSelected={selectedItems.includes(item.id)}
                  onCheckToggle={() => handleCheckToggle(item)}
                />
              </View>
            )}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>

      <FooterButtonsComponent onSave={handleSave} onReceive={handleReceive} isReceiveEnabled={isReceiveEnabled} />

      <Modal visible={showScanner} animationType="slide" onRequestClose={() => setShowScanner(false)}>
        <BarcodeScanner onScan={handleScan} onClose={() => setShowScanner(false)} />
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F8FA' },
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
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 12,
    paddingTop: 8,
    paddingBottom: 6,
    elevation: 2,
    overflow: 'visible',
  },
});

export default AsnReceiptScreen;
