import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Dimensions, FlatList, SafeAreaView, ScrollView, StyleSheet, View, Text, Modal, BackHandler, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import GlobalHeaderComponent from '../components/GlobalHeaderComponent';
import ASNinfoCardComponent from '../components/ASNinfoCardComponent';
import TableHeaderComponent from '../components/TableHeaderComponent';
import ASNPOlistcardcomponent from '../components/ASNPOlistcardcomponent';
import FooterButtonsComponent from '../components/FooterButtonsComponent';
import BarcodeScanner from './BarCodeScanner';
import { useReceivingStore } from '../store/receivingStore';
import BarcodeScannerIcon from '../assets/icons/barcodescanner.svg';

const { width: screenWidth } = Dimensions.get('window');
const baseWidth = 375;
const scale = screenWidth / baseWidth;
const responsiveSize = (size) => Math.round(size * scale);

const clampToLimit = (qty, limit) => {
  const lim = Number(limit ?? 0);
  const q = Number(qty ?? 0);
  if (!Number.isFinite(lim) || lim <= 0) return 0;
  if (!Number.isFinite(q) || q <= 0) return 0;
  return Math.min(q, lim);
};

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const fmtISO = (d) => {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = MONTHS[d.getMonth()];
  const yy = d.getFullYear();
  return `${dd} ${mm} ${yy}`;
};

const mapLinesToFrontend = (arr, org) => {
  return (Array.isArray(arr) ? arr : [])
  // .filter(li => Number(li?.rcvd_qty ?? 0) < Number(li?.shipped_qty ?? 0))
  .map((li, index) => {
    const ordered = Number(li?.ordered_qty ?? 0);
    const rcvd = Number(li?.rcvd_qty ?? 0);
    const open = Math.max(0, ordered - rcvd);
    const u = String(li?.uom || '').toUpperCase() === 'EA' ? 'Each' : String(li?.uom || '');
    const promised = li?.promised_dlry_dt ? fmtISO(new Date(li.promised_dlry_dt)) : null;
    const needBy = li?.need_by_dt ? fmtISO(new Date(li.need_by_dt)) : null;
    const startQty = Number(li?.receiving_qty ?? 0);
    // const max_shipped = Number(li?.shipped_qty ?? 0) - Number(li?.rcvd_qty);
    const max_open = li?.shipped_qty;
    return {
      id: index + 1,
      po_line_id: li?.po_line_id,
      item_id: li?.item_id,
      purchaseReceipt: '',
      name: li?.item_code || '',
      itemName: li?.item_code || '',
      ship_to_location:li?.ship_to_location,
      item_description: li?.item_description || '',
      itemDescription: li?.item_description || '',
      orderedQty: ordered,
      orderQty: ordered,
      receivedQty: rcvd,
      openQty: open,
      max_open_qty: max_open,
      shipped_qty:li?.shipped_qty,
      lpn: '',
      subInventory: org?.selectedinventory,
      org_id: org?.selectedOrg,
      locator: '',
      status: li?.line_status,
      receivingStatus: li?.line_status,
      uom: u,
      promisedDate: promised,
      needByDate: needBy,
      receivingQty: startQty,
      qtyToReceive: startQty,
    };
  });
};

const PovViewItems = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {
    OrgData,
    asnHeader,
    initAsnSelectedLines,
    updateAsnLine,
    receiveItems,
    initReceiveItems,
    mergePatchIntoReceiveItems,
    setAsnEditedLinesForPO,
    getAsnEditedLinesForPO,
    selectAsnPOId,
  } = useReceivingStore();

  const mode = route?.params?.mode || 'create';
  const source = route?.params?.source;
  const selectedPO = route?.params?.selectedPO || null;
  const incomingLines = Array.isArray(route?.params?.lines) ? route.params.lines : [];

  const [phase, setPhase] = useState('idle');
  const [draftItems, setDraftItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [scannedItems, setScannedItems] = useState([]);
  const [showScanner, setShowScanner] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (source !== 'asn') return;
    setPhase('loading');
    const edited = getAsnEditedLinesForPO(selectedPO?.po_id);
    const seed = edited?.length ? edited : incomingLines;
    const frontend = mapLinesToFrontend(seed, OrgData);
    initReceiveItems(frontend);
    setDraftItems(frontend);
    setSelectedItems(frontend.filter((x) => Number(x.qtyToReceive ?? 0) > 0).map((x) => x.id));
    setPhase('success');
  }, [source, incomingLines, OrgData, initReceiveItems, getAsnEditedLinesForPO, selectedPO?.po_id]);

  useEffect(() => {
    if (!receiveItems || receiveItems.length === 0) return;
    const withStored = receiveItems.map((src) => {
      const qty = Number(src?.qtyToReceive ?? src?.receivingQty ?? 0);
      return { ...src, qtyToReceive: qty };
    });
    setDraftItems(withStored);
    setSelectedItems(withStored.filter((x) => Number(x.qtyToReceive ?? 0) > 0).map((x) => x.id));
  }, [receiveItems]);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (showScanner) {
          setShowScanner(false);
          return true;
        }
        if (mode === 'edit') {
          persistAndReturnToSummary();
        } else {
          persistAndReturnToASN();
        }
        return true;
      };
      const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => sub.remove();
    }, [mode, showScanner, draftItems])
  );

  const persistQty = (id, qty, fields = {}) => {
    const n = Number(qty ?? 0);
    mergePatchIntoReceiveItems({
      id: String(id),
      qtyToReceive: n,
      receivingQty: n,
      lpn: fields.lpn ?? '',
      subInventory: fields.subInventory ?? '',
      locator: fields.locator ?? '',
    });
  };

  const handleCheckToggle = (item) => {
    const isChecked = selectedItems.includes(item.id);
    if (isChecked) {
      setSelectedItems((prev) => prev.filter((id) => id !== item.id));
      setDraftItems((prev) => prev.map((it) => (it.id === item.id ? { ...it, qtyToReceive: 0 } : it)));
      persistQty(item.id, 0, item);
      return;
    }
    const autoQty = clampToLimit(item.openQty, item.max_open_qty);
    setDraftItems((prev) => prev.map((it) => (it.id === item.id ? { ...it, qtyToReceive: autoQty } : it)));
    setSelectedItems((prev) => [...prev, item.id]);
    persistQty(item.id, autoQty, item);
  };

  const handleQtyChange = (id, newQty) => {
    setDraftItems((prev) => {
      const next = prev.map((item) =>
        item.id === id ? { ...item, qtyToReceive: clampToLimit(newQty, item.max_open_qty) } : item
      );
      const changed = next.find((x) => x.id === id);
      const clamped = Number(changed?.qtyToReceive ?? 0);
      setSelectedItems((curr) => {
        const has = curr.includes(id);
        if (clamped > 0 && !has) return [...curr, id];
        if (clamped === 0 && has) return curr.filter((x) => x !== id);
        return curr;
      });
      persistQty(id, clamped, changed || {});
      return next;
    });
  };

  const commitDraftToStore = () => {
    draftItems.forEach((it) => {
      const limit = it.max_open_qty;
      const clamped = clampToLimit(it.qtyToReceive, limit);
      persistQty(it.id, clamped, it);
    });
  };

  const sum = (arr, key) =>
    arr.reduce((acc, x) => {
      const v = Number(x?.[key]);
      return acc + (Number.isFinite(v) ? v : 0);
    }, 0);

  const buildEnrichedLines = () => {
    const base = Array.isArray(incomingLines) ? incomingLines : [];
    const selectedSet = new Set(selectedItems.map(String));
    return base.map((li, idx) => {
      const front = draftItems[idx];
      console.log(front,"buildEnrichedLinesdraftItemsdraftItemsdraftItems")
      const rawQty = Number(front?.qtyToReceive ?? 0);
      const limit = Number(front?.max_open_qty ?? li?.max_open_qty ?? front?.openQty ?? 0);
      const clamped = Math.max(0, Math.min(rawQty, Number.isFinite(limit) ? limit : 0));
      console.log(clamped,"clampedclampedclampedclamped")
      const isSelected = selectedSet.has(String(front?.id));
      return {
        ...li,
        subInventory: front?.subInventory ?? null,
        locator: front?.locator ?? null,
        receiving_qty: isSelected ? clamped : 0,
      };
    });
  };

  const finalizeLinesWithAutoFill = (lines) => {
    const allZero = lines.every(li => Number(li?.receiving_qty ?? 0) <= 0);
    if (!allZero) return lines;
    return lines.map(li => {
      const ord = Number(li?.ordered_qty ?? 0);
      const maxOpen = Number(li?.max_open_qty ?? ord);
      const cap = Number.isFinite(maxOpen) ? maxOpen : 0;
      return { ...li, receiving_qty: Math.min(ord, cap) };
    });
  };

  const persistAndReturnToASN = () => {
    commitDraftToStore();
    const enrichedLines = buildEnrichedLines();
        console.log(enrichedLines,"enrichedLines");

    const finalizedLines = finalizeLinesWithAutoFill(enrichedLines);
            console.log(finalizedLines,"finalizedLines");
    if (selectedPO?.po_id) {
      setAsnEditedLinesForPO(selectedPO.po_id, finalizedLines);
      selectAsnPOId(selectedPO.po_id);
      const ordered_qty = sum(finalizedLines, 'ordered_qty');
      const rcvd_qty = sum(finalizedLines, 'rcvd_qty');
      const receiving_qty = sum(finalizedLines, 'receiving_qty');
      const shippedVals = finalizedLines.map((x) => Number(x?.shipped_qty)).filter((v) => Number.isFinite(v));
      const shipped_qty = shippedVals.length ? shippedVals.reduce((a, b) => a + b, 0) : null;
      const line = { ordered_qty, rcvd_qty, shipped_qty, receiving_qty, asn_line_items: finalizedLines };
      updateAsnLine({ id: String(selectedPO.po_id), line });
    }
    navigation.goBack();
  };

  const CancelpersistAndReturnToASN = () => {
    // commitDraftToStore();
    const enrichedLines = buildEnrichedLines();
    const finalizedLines = finalizeLinesWithAutoFill(enrichedLines);
    if (selectedPO?.po_id) {
      // setAsnEditedLinesForPO(selectedPO.po_id, finalizedLines);
      // selectAsnPOId(selectedPO.po_id);
      const ordered_qty = sum(finalizedLines, 'ordered_qty');
      const rcvd_qty = sum(finalizedLines, 'rcvd_qty');
      const receiving_qty = sum(finalizedLines, 'receiving_qty');
      const shippedVals = finalizedLines.map((x) => Number(x?.shipped_qty)).filter((v) => Number.isFinite(v));
      const shipped_qty = shippedVals.length ? shippedVals.reduce((a, b) => a + b, 0) : null;
      const line = { ordered_qty, rcvd_qty, shipped_qty, receiving_qty, asn_line_items: finalizedLines };
      // updateAsnLine({ id: String(selectedPO.po_id), line });
    }
    navigation.goBack();
  };

  const persistAndReturnToSummary = () => {
    commitDraftToStore();
    const enrichedLines = buildEnrichedLines();
    const finalizedLines = finalizeLinesWithAutoFill(enrichedLines);
    const ordered_qty = sum(finalizedLines, 'ordered_qty');
    const rcvd_qty = sum(finalizedLines, 'rcvd_qty');
    const receiving_qty = sum(finalizedLines, 'receiving_qty');
    const shippedVals = finalizedLines.map((x) => Number(x?.shipped_qty)).filter((v) => Number.isFinite(v));
    const shipped_qty = shippedVals.length ? shippedVals.reduce((a, b) => a + b, 0) : null;
    const poEntry = {
      id: String(selectedPO?.po_id || '0'),
      po_id: selectedPO?.po_id ?? '',
      po_number: selectedPO?.po_number ?? '—',
      line: {
        ordered_qty,
        rcvd_qty,
        shipped_qty,
        receiving_qty,
        asn_line_items: finalizedLines,
      },
    };
    if (selectedPO?.po_id) {
      setAsnEditedLinesForPO(selectedPO.po_id, finalizedLines);
    }
    if (mode === 'edit') {
      updateAsnLine({ id: String(poEntry.id), line: poEntry.line });
    } else {
      initAsnSelectedLines([poEntry]);
    }
    navigation.navigate('podetailsummary', { readonly: false });
  };

  const CancelpersistAndReturnToSummary = () => {
    // commitDraftToStore();
    const enrichedLines = buildEnrichedLines();
    const finalizedLines = finalizeLinesWithAutoFill(enrichedLines);
    const ordered_qty = sum(finalizedLines, 'ordered_qty');
    const rcvd_qty = sum(finalizedLines, 'rcvd_qty');
    const receiving_qty = sum(finalizedLines, 'receiving_qty');
    const shippedVals = finalizedLines.map((x) => Number(x?.shipped_qty)).filter((v) => Number.isFinite(v));
    const shipped_qty = shippedVals.length ? shippedVals.reduce((a, b) => a + b, 0) : null;
    const poEntry = {
      id: String(selectedPO?.po_id || '0'),
      po_id: selectedPO?.po_id ?? '',
      po_number: selectedPO?.po_number ?? '—',
      line: {
        ordered_qty,
        rcvd_qty,
        shipped_qty,
        receiving_qty,
        asn_line_items: finalizedLines,
      },
    };
    if (selectedPO?.po_id) {
      // setAsnEditedLinesForPO(selectedPO.po_id, finalizedLines);
    }
    if (mode === 'edit') {
      // updateAsnLine({ id: String(poEntry.id), line: poEntry.line });
    } else {
      // initAsnSelectedLines([poEntry]);
    }
    navigation.navigate('podetailsummary', { readonly: false });
  };

  const handleReceive = () => {
    if (mode === 'edit') {
      persistAndReturnToSummary();
    } else {
      persistAndReturnToASN();
    }
  };

  const visibleItems = useMemo(() => {
    if (!Array.isArray(draftItems) || !draftItems.length) return [];
    if (filter === 'all') return draftItems;
    if (filter === 'received') {
      return draftItems.filter((it) => {
        const r = Number(it?.receivedQty ?? 0);
        const o = Number(it?.orderedQty ?? 0);
        return r >= o && o > 0;
      });
    }
    if (filter === 'pending') {
      return draftItems.filter((it) => {
        const r = Number(it?.receivedQty ?? 0);
        const o = Number(it?.orderedQty ?? 0);
        return r > 0 && r < o;
      });
    }
    return draftItems;
  }, [draftItems, filter]);

  const handleScan = (value) => {
    const id = String(value).trim();
    const sourceItem = draftItems.find((x) => String(x.name) === id);
    if (!sourceItem) {
      Toast.show({ type: 'error', text1: 'Unknown barcode', text2: `No item with id ${id}`, position: 'top', visibilityTime: 5000 });
      setShowScanner(false);
      return;
    }
    if (sourceItem?.openQty === 0) {
      Toast.show({ type: 'error', text1: 'Received', text2: 'Received item cannot be scanned', position: 'top', visibilityTime: 5000 });
      setShowScanner(false);
      return;
    }
    if (scannedItems.some((x) => String(x.name) === id)) {
      Alert.alert('Failure', 'Scanned item already added to the list');
      setShowScanner(false);
      return;
    }
    const fullReceiving = Math.max(0, sourceItem.openQty ?? 0);
    const scanned = { ...sourceItem, qtyToReceive: fullReceiving };
    setScannedItems((prev) => [...prev, scanned]);
    persistQty(sourceItem.id, fullReceiving, sourceItem);
    setShowScanner(false);
    Toast.show({ type: 'success', text1: 'Item added from scan', text2: `${sourceItem.name} (ID: ${id})`, position: 'top', visibilityTime: 5000 });
  };

  const goToLineItemDetails = (startIdx = 0, sourceList = draftItems) => {
    const items = sourceList.map((it, i) => {
      const s = receiveItems.find((r) => String(r.id) === String(it.id));
      const qty = Number(s?.qtyToReceive ?? s?.receivingQty ?? it.qtyToReceive ?? 0);
      console.log('item pov:', it);

      const itemDesc =
        (it.itemDescription && String(it.itemDescription).trim()) ||
        (it.item_description && String(it.item_description).trim()) ||
        (it.description && String(it.description).trim()) ||
        (it.desc && String(it.desc).trim()) ||
        (it.item_desc && String(it.item_desc).trim()) ||
        '';

      return {
        id: String(it.id),
        poNumber: asnHeader?.asn_num ?? selectedPO?.po_number ?? '—',
        lineNumber: i + 1,
        itemName: it.itemName ?? it.name,
        itemid:it.item_id,
        shipped_qty:it.shipped_qty,
        receivedQty:it.receivedQty,
        ship_to_location:it.ship_to_location,
        itemDescription: itemDesc,
        item_description: itemDesc,
        orderQty: Number(it.orderedQty ?? it.orderQty ?? 0),
        openQty: Number(it.openQty ?? 0),
        uom: it.uom,
        receivingQty: qty,
        receivingStatus: it.status,
        lpn: s?.lpn ?? it.lpn ?? '',
        subInventory: s?.subInventory ?? it.subInventory ?? '',
        locator: s?.locator ?? it.locator ?? '',
        max_open_qty: Number(it.max_open_qty ?? it.openQty ?? 0),
      };
    });
    navigation.navigate('ASNPOLineItemDetails', {
      items,
      startIndex: startIdx,
      readonly: false,
      listType: 'line',
      returnTo: 'poviewitems',
    });
  };
  const hasAnyItems = useMemo(
    () => (selectedItems.length > 0? selectedItems.length>0 : scannedItems.length > 0),
    [selectedItems&&selectedItems.length, scannedItems&&scannedItems.length]
  );
  return (
    <SafeAreaView style={styles.container}>
      <GlobalHeaderComponent
        organizationName={OrgData?.selectedOrgCode}
        screenTitle="Receiving"
        notificationCount={0}
        onBack={() => navigation.goBack()}
      />
      {phase === 'loading' && (
        <View style={styles.loaderWrapper}>
          <ActivityIndicator size="large" color="#233E55" />
        </View>
      )}
      {phase !== 'loading' && (
        <>
          <ScrollView contentContainerStyle={styles.contentContainer}>
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
            <View style={styles.itemcontainer}>
              <Text style={styles.sectionPOTitle}>Purchase Order - {selectedPO?.po_number || '-'}</Text>
              <TouchableOpacity style={styles.scanRow} onPress={() => setShowScanner(true)} activeOpacity={0.8}>
                <Text style={styles.scanText}>Scan your item</Text>
                <BarcodeScannerIcon width={20} height={20} fill="#7A7A7A" />
              </TouchableOpacity>
              <View style={styles.tableHeader}>
                <TableHeaderComponent
                  allSelected={selectedItems.length === draftItems.length && draftItems.every((d) => Number(d.qtyToReceive ?? 0) > 0)}
                  onToggleAll={() => {
                    const selecting = !(selectedItems.length === draftItems.length && draftItems.every((d) => Number(d.qtyToReceive ?? 0) > 0));
                    if (!selecting) {
                      setSelectedItems([]);
                      setDraftItems((prev) => prev.map((it) => ({ ...it, qtyToReceive: 0 })));
                      draftItems.forEach((it) => persistQty(it.id, 0, it));
                      return;
                    }
                    const next = draftItems.map((it) => {
                      const useQty = clampToLimit(it.openQty, it.max_open_qty);
                      return { ...it, qtyToReceive: useQty };
                    });
                    setDraftItems(next);
                    setSelectedItems(next.filter((x) => Number(x.qtyToReceive ?? 0) > 0).map((x) => x.id));
                    next.forEach((it) => persistQty(it.id, it.qtyToReceive, it));
                  }}
                  activeFilter={filter}
                  onChangeFilter={setFilter}
                />
              </View>
              <FlatList
                data={visibleItems}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item, index }) => (
                  <View style={styles.lineItemWrapper}>
                    <ASNPOlistcardcomponent
                      item={item}
                      index={index}
                      isSelected={selectedItems.includes(item.id)}
                      onCheckToggle={handleCheckToggle}
                      onQtyChange={handleQtyChange}
                      onViewDetails={() => goToLineItemDetails(index, draftItems)}
                    />
                  </View>
                )}
                scrollEnabled={false}
              />
            </View>
          </ScrollView>
          <FooterButtonsComponent
            leftLabel="Cancel"
            rightLabel="Receive"
            onLeftPress={mode === 'edit' ? CancelpersistAndReturnToSummary : CancelpersistAndReturnToASN}
            onRightPress={handleReceive}
            leftEnabled={hasAnyItems}
            rightEnabled={hasAnyItems}
          />
          <Modal visible={showScanner} animationType="slide">
            <BarcodeScanner onScan={handleScan} onClose={() => setShowScanner(false)} />
          </Modal>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: '#F6F8FA', flex: 1 },
  loaderWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  contentContainer: { paddingBottom: 120 },
  itemcontainer: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 12,
    paddingTop: 8,
    paddingBottom: 6,
    elevation: 2,
  },
  tableHeader: { marginBottom: 10, marginTop: 8 },
  lineItemWrapper: { marginBottom: 12 },
  scanRow: {
    backgroundColor: '#FFFFFF',
    borderColor: '#00000040',
    borderWidth: 1,
    borderRadius: 10,
    height: 40,
    marginHorizontal: 15,
    marginTop: 6,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scanText: { color: '#777' },
  sectionPOTitle: {
    fontSize: responsiveSize(16),
    fontWeight: '700',
    color: '#1f2937',
    paddingVertical: 8,
    marginHorizontal: responsiveSize(15),
  },
});

export default PovViewItems;
