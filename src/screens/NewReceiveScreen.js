import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { FlatList, SafeAreaView, ScrollView, StyleSheet, View, Text, Modal, BackHandler, ActivityIndicator, Alert,TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import GlobalHeaderComponent from '../components/GlobalHeaderComponent';
import POinfoCardComponent from '../components/POinfoCardComponent';
import ToggleTabsComponent from '../components/ToggleTabsComponent';
import LineItemListCardComponent from '../components/LineItemListCardComponent';
import FooterButtonsComponent from '../components/FooterButtonsComponent';
import TableHeaderComponent from '../components/TableHeaderComponent';
import ScanItemListCardComponent from '../components/ScanItemListCardComponent';
import SummaryTabHdrComponent from '../components/SummaryTabHdrComponent';
import BarcodeScanner from './BarCodeScanner';
import { useReceivingStore } from '../store/receivingStore';
import ConfirmModalComponent from '../components/ConfirmModalComponent';
import { GetSinglePO, Submit_Receive_Qty, Save_Receive_Qty } from '../api/ApiServices';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ConfirmSvg from '../assets/icons/success.svg';
import FailureSvg from '../assets/icons/failure.svg';
import BarcodeScannerIcon from '../assets/icons/barcodescanner.svg';


const clampToLimit = (qty, limit) => {
  const lim = Number(limit ?? 0);
  const q = Number(qty ?? 0);
  if (!Number.isFinite(lim) || lim <= 0) return 0;
  if (!Number.isFinite(q) || q <= 0) return 0;
  return Math.min(q, lim);
};

const mapHeader = (po) => ({
  purchaseReceipt: po?.next_receipt_num ?? '—',
  supplier: po?.supplier_name ?? '',
  poNumber: po?.po_number ?? '—',
  poDate: po?.order_date ?? '—',
});

const sameScanList = (a, b) => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const x = a[i], y = b[i];
    if (String(x.id) !== String(y.id)) return false;
    if (Number(x.qtyToReceive ?? 0) !== Number(y.qtyToReceive ?? 0)) return false;
    if ((x.lpn ?? '') !== (y.lpn ?? '')) return false;
    if (String(x.subInventory ?? '') !== String(y.subInventory ?? '')) return false;
    if (String(x.locator ?? '') !== String(y.locator ?? '')) return false;
  }
  return true;
};

const NewReceiveScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const [profileName, setProfileName] = useState('');
  const {
    poHeader, setPoHeader,
    receiveItems, initReceiveItems, mergePatchIntoReceiveItems,
    resetReceiving, OrgData
  } = useReceivingStore();

  const selectedPO = route?.params?.selectedPO || null;

  const [modalVisible, setModalVisible] = useState(false);
  const didCompleteRef = useRef(false);

  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [saveModalStatus, setSaveModalStatus] = useState('success');

  const didsaveCompleteRef = useRef(false);

  const [draftItems, setDraftItems] = useState([]);
  const [phase, setPhase] = useState('idle');
  const [PoListItems, setPoListItems] = useState([]);
  const [PurchaseReceipt, setPurchaseReceipt] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [scannedItems, setScannedItems] = useState([]);
  const [showScanner, setShowScanner] = useState(false);
  const [filter, setFilter] = useState('all');

  useFocusEffect(
    useCallback(() => {
      didCompleteRef.current = false;
      return () => {};
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (showScanner) {
          setShowScanner(false);
          return true;
        }
        if (modalVisible) {
          setModalVisible(false);
          return true;
        }

        if (saveModalVisible) {
          setSaveModalVisible(false);
          return true;
        }
        navigation.navigate('Receive');
        return true;
      };
      const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => sub.remove();
    }, [navigation, showScanner, modalVisible, saveModalVisible])
  );


  useEffect(() => {
    if (!selectedPO) return;
    setPoHeader(mapHeader(selectedPO));
  }, [selectedPO, setPoHeader]);

const  mapBackendArrayToFrontend = (data,posingledata)=> {
  return data.map((backend,index) => ({
    id: index+1,
    po_line_id:backend?.po_line_id,
    item_id:backend?.item_id,
    purchaseReceipt:posingledata?.next_receipt_num || "", // placeholder (if needed)
    name: backend.item?.item_code || "",
    description: backend.item?.description || "",
    orderedQty: backend.ord_qty,
    receivedQty: backend.rcvd_qty,
    openQty: backend.rcvd_qty>backend.ord_qty?0:Number(backend.ord_qty) - Number(backend.rcvd_qty),
    max_open_qty: Math.floor(backend.max_open_qty ?? 0),
    lpn: '',
    subInventory: OrgData?.selectedinventory,
    imageUri:backend?.image_uri || null,
    org_id:OrgData?.selectedOrg,
    locator: '',
    status:backend.line_status,
    uom: backend.item?.uom === "EA" ? "Each" : backend.item?.uom, // convert if needed
    promisedDate: backend.promised_dlry_dt 
      ? new Date(backend.promised_dlry_dt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
      : null,
    needByDate: backend.need_by_dt 
      ? new Date(backend.need_by_dt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
      : null
  }));
}
  useEffect(() => {
    if (!selectedPO?.po_id) return;
    setPhase('loading');
    const loadPoData = async () => {
      try {
        const posingledata = await GetSinglePO(selectedPO.po_id);
        if (posingledata?.purchase_order_lines) {
          setPurchaseReceipt(posingledata?.next_receipt_num);
          const frontendArray = mapBackendArrayToFrontend(posingledata.purchase_order_lines, posingledata);
          setPoListItems(frontendArray);
        } else {
          setPoListItems([]);
        }
        setPhase('success');
      } catch {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to load PO Items. Please try again.',
          position: 'top',
          visibilityTime: 5000,
        });
        setPhase('error');
      }
    };
    loadPoData();
  }, [selectedPO?.po_id]);

  useEffect(() => {
    if (PoListItems.length > 0) {
      const seeded = PoListItems.map(i => ({ ...i, qtyToReceive: 0 }));
      initReceiveItems(seeded);
    }
  }, [PoListItems, initReceiveItems]);

  useFocusEffect(
    useCallback(() => {
      const withStored = receiveItems.map(src => {
        const qty = Number(src?.qtyToReceive ?? src?.receivingQty ?? 0);
        return { ...src, qtyToReceive: qty };
      });
      setDraftItems(withStored);
      setSelectedItems(withStored.filter(x => Number(x.qtyToReceive ?? 0) > 0).map(x => x.id));
      return () => {};
    }, [receiveItems])
  );

  const rebuildScannedFromStore = useCallback(() => {
    const scannedIds = new Set(scannedItems.map(i => String(i.id)));
    const next = receiveItems
      .filter(r => scannedIds.has(String(r.id)) || Number(r?.qtyToReceive ?? r?.receivingQty ?? 0) > 0)
      .map(r => {
        const base = PoListItems.find(p => String(p.id) === String(r.id)) || r;
        const qty = Number(r?.qtyToReceive ?? r?.receivingQty ?? 0);
        return {
          ...base,
          qtyToReceive: qty,
          lpn: r.lpn ?? base.lpn ?? '',
          subInventory: r.subInventory ?? base.subInventory ?? '',
          locator: r.locator ?? base.locator ?? '',
        };
      });
    if (!sameScanList(next, scannedItems)) setScannedItems(next);
  }, [receiveItems, PoListItems, scannedItems]);

  useEffect(() => {
    rebuildScannedFromStore();
  }, [rebuildScannedFromStore]);

  useFocusEffect(
    useCallback(() => {
      rebuildScannedFromStore();
      return () => {};
    }, [rebuildScannedFromStore])
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
      setSelectedItems(prev => prev.filter(id => id !== item.id));
      setDraftItems(prev => prev.map(it => (it.id === item.id ? { ...it, qtyToReceive: 0 } : it)));
      persistQty(item.id, 0, item);
      return;
    }
    const autoQty = clampToLimit(item.openQty, item.max_open_qty);
    setDraftItems(prev => prev.map(it => (it.id === item.id ? { ...it, qtyToReceive: autoQty } : it)));
    setSelectedItems(prev => [...prev, item.id]);
    persistQty(item.id, autoQty, item);
  };

  const handleQtyChange = (id, newQty) => {
    setDraftItems(prev => {
      const next = prev.map(item =>
        item.id === id ? { ...item, qtyToReceive: clampToLimit(newQty, item.max_open_qty) } : item
      );
      const changed = next.find(x => x.id === id);
      const clamped = Number(changed?.qtyToReceive ?? 0);
      setSelectedItems(curr => {
        const has = curr.includes(id);
        if (clamped > 0 && !has) return [...curr, id];
        if (clamped === 0 && has) return curr.filter(x => x !== id);
        return curr;
      });
      persistQty(id, clamped, changed || {});
      return next;
    });
  };

  const commitDraftToStore = () => {
    draftItems.forEach(it => {
      const limit = it.max_open_qty;
      const clamped = clampToLimit(it.qtyToReceive, limit);
      persistQty(it.id, clamped, it);
    });
  };

  const handleReceive = () => {
    commitDraftToStore();
    // const isScan = selectedTab === 'scanItems';
    // if (isScan) {
    //   setModalVisible(true);
    //   return;
    // }
    // Alert.alert("COMING")
    const source = draftItems;
    const payload = source
      .filter(i => Number(i.qtyToReceive ?? 0) > 0)
      .map(i => ({
        id: i.id,
        purchaseReceipt: i.purchaseReceipt,
        name: i.name,
        description: i.description,
        orderedQty: i.orderedQty,
        receivedQty: i.receivedQty,
        openQty: i.openQty,
        uom: i.uom,
        promisedDate: i.promisedDate,
        needByDate: i.needByDate,
        qtyToReceive: i.qtyToReceive,
        po_line_id:i.po_line_id,
        item_id:i.item_id,
        lpn: i.lpn?i.lpn:null,
        subInventory: i.subInventory?i.subInventory:OrgData?.selectedinventory,
        org_id:OrgData?.selectedOrg,
        locator: i.locator?i.locator:null,
        status:i.status
      }));
      console.log(payload,"AFTERCLICKRECECIEJCIEC")
    navigation.push('ReceiveSummaryScreen', {
      id: selectedPO?.id ?? null,
      selectedItems: payload,
      readonly: false,
      purchaseReceipt: PurchaseReceipt,
      header: mapHeader(selectedPO),
      listType: 'line',
      interface_id: null
    });
  };

  const formatToday = () => {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).toString().padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${yyyy}-${mm}-${dd}`;
  };

  const mapConfirmSaveData = (data) => {
  const FILTER_ZERO_QTY = false; // set to true if backend rejects zero-qty rows

  const rows = data.map((backend) => {
    const qty = Number(backend?.qtyToReceive ?? 0);
    return {
      po_line_id: backend?.po_line_id,
      item_id: backend?.item_id,
      org_id: backend?.org_id,
      sub_inv_id: backend?.subInventory,
      locator_id: backend?.locator?backend?.locator:null,
      lot_number: '',
      expiry_date: formatToday(),
      received_qty: qty,
      is_checked: qty > 0 ? true : false,
    };
  });

  return FILTER_ZERO_QTY ? rows.filter(r => r.received_qty > 0) : rows;
};

  const isSaveSuccess = (res) => {
  if (!res) return false;
  if (res?.results[0].status=='success') return true;
  if (res?.results[0].status=='error') return false;
  if (res === true) return true;
  if (typeof res?.results === 'boolean') return res.results === true;
  if (typeof res?.results === 'number') return res.results > 0;
  if (Array.isArray(res?.results)) return res.results.length > 0;
  if (res?.status === 'success' || res?.status === 'ok') return true;
  if (typeof res?.message === 'string' && res.message.toLowerCase().includes('success')) return true;
  return false;
};

const handlesave = async () => {
  didCompleteRef.current = false;
  try {
    const payload = mapConfirmSaveData(draftItems);
    console.log('Save payload:', payload);
    const response = await Save_Receive_Qty(payload);
    console.log('Save response:', response);
      console.log('isSaveSuccess(response)isSaveSuccess(response):', isSaveSuccess(response));
    if (isSaveSuccess(response)) {
      setSaveModalStatus('success');
      setSaveModalVisible(true);
      setTimeout(() => handlesaveSuccess(), 3500);
    } else {
      setSaveModalStatus('failure');
      setSaveModalVisible(true);
      setTimeout(() => handlesaveFailure(), 3500);
    }
  } catch (e) {
    console.log('Save error:', e);
    setSaveModalStatus('failure');
    setSaveModalVisible(true);
    setTimeout(() => handlesaveFailure(), 3500);
  }
};

const handlesaveSuccess = () => {
  if (didCompleteRef.current) return;
  didCompleteRef.current = true;
  setSaveModalVisible(false);
  // resetReceiving();
  // navigation.navigate('Receive');
};

const handlesaveFailure = () => {
  if (didCompleteRef.current) return;
  didCompleteRef.current = true;
  setSaveModalVisible(false);
};



  const handleCancel = () => setModalVisible(false);

  // const handleSuccess = () => {
  //   if (didCompleteRef.current) return;
  //   didCompleteRef.current = true;
  //   // Toast.hide();
  //   // Toast.show({ type: 'success', text1: 'Order receipt created successfully', position: 'top', visibilityTime: 5000 });
  //   setModalVisible(false);
  //   resetReceiving();
  //   navigation.navigate('Receive');
  // };

  const handleFailure = () => {
    Toast.hide();
    setModalVisible(false);
  };


  const goToLineItemDetails = (startIdx = 0, source = draftItems, readonly = false, listType = 'line') => {
    const withLatestFromStore = source.map((it, i) => {
      const s = receiveItems.find(r => String(r.id) === String(it.id));
      const qty = Number(s?.qtyToReceive ?? s?.receivingQty ?? it.qtyToReceive ?? 0);
      return {
        id: String(it.id),
        poNumber: poHeader?.poNumber ?? '—',
        lineNumber: i + 1,
        itemName: it.name,
        itemDescription: it.itemDescription ?? it.description ?? '—',
        orderQty: Number(it.orderedQty ?? it.orderQty ?? 0),
        openQty: Number(it.openQty ?? 0),
        uom:it.uom,
        receivingQty: qty,
        receivingStatus: it.status,
        lpn: s?.lpn ?? it.lpn ?? '',
        subInventory: s?.subInventory ?? it.subInventory ?? '',
        locator: s?.locator?? null,
        max_open_qty: Number(it.max_open_qty ?? it.openQty ?? 0),
        imageUri: s?.imageUri ?? it.imageUri ?? null
      };
    });
    console.log(withLatestFromStore,"withLatestFromStorewithLatestFromStore")
    navigation.navigate({
      name: 'LineItemDetails',
      params: {
        items: withLatestFromStore,
        startIndex: startIdx,
        readonly,
        returnTo: 'NewReceiveScreen',
        listType,
      },
      merge: true,
    });
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
    const source = draftItems.find(x => String(x.name) === id)
    if (!source) {
      Toast.show({ type: 'error', text1: 'Unknown barcode', text2: `No item with id ${id}`, position: 'top', visibilityTime: 5000 });
      setShowScanner(false);
      return;
    }
    if (source?.openQty === 0) {
      Toast.show({ type: 'error', text1: 'Received', text2: 'Received item cannot be scanned', position: 'top', visibilityTime: 5000 });
      setShowScanner(false);
      return;
    }
    if (scannedItems.some(x => String(x.name) === id)) {
      Alert.alert("Failure","Scanned item already added to the list");
      // Toast.show({ type: 'orange', text1: 'Scanned item already added to the list', text2: `${source.name} (ID: ${id})`, position: 'top', visibilityTime: 5000 });
      setShowScanner(false);
      return;
    }
    const fullReceiving = Math.max(0, source.openQty ?? 0);
    const scanned = { ...source, qtyToReceive: fullReceiving };
    setScannedItems(prev => [...prev, scanned]);
    persistQty(source.id, fullReceiving, source);
    // setSelectedTab('scanItems');
    setShowScanner(false);
    Toast.show({ type: 'success', text1: 'Item added from scan', text2: `${source.name} (ID: ${id})`, position: 'top', visibilityTime: 5000 });
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
            // profileName={profileName}
            onBack={() => navigation.navigate('Receive')}
          />
                      {phase === 'loading' && (
        <View style={styles.loaderWrapper}>
          <ActivityIndicator size="large" color="#233E55" />
          {/* <Text style={styles.statusText}>Loading...</Text> */}
        </View>
      )}
            {phase !== 'loading' && (
        <>
          <ScrollView contentContainerStyle={styles.contentContainer}>
            <POinfoCardComponent
              receiptNumber={poHeader?.purchaseReceipt || '—'}
              supplier={poHeader?.supplier || '—'}
              poNumber={poHeader?.poNumber || '—'}
              receiptDate={poHeader?.poDate || '—'}
            />
            <View style={styles.itemcontainer}>
                      <TouchableOpacity style={styles.scanRow} onPress={()=>setShowScanner(true)} activeOpacity={0.8}>
                        <Text style={styles.scanText}>Scan your item</Text>
                        <BarcodeScannerIcon width={20} height={20} fill="#7A7A7A" />
                      </TouchableOpacity>
                  <View style={styles.tableHeader}>
                    <TableHeaderComponent
                      allSelected={selectedItems.length === draftItems.length && draftItems.every(d => Number(d.qtyToReceive ?? 0) > 0)}
                      onToggleAll={() => {
                        const selecting = !(selectedItems.length === draftItems.length && draftItems.every(d => Number(d.qtyToReceive ?? 0) > 0));
                        if (!selecting) {
                          setSelectedItems([]);
                          setDraftItems(prev => prev.map(it => ({ ...it, qtyToReceive: 0 })));
                          draftItems.forEach(it => persistQty(it.id, 0, it));
                          return;
                        }
                        const next = draftItems.map(it => {
                          const limit = it.max_open_qty;
                          const useQty = clampToLimit(it.openQty, limit);
                          return { ...it, qtyToReceive: useQty };
                        });
                        setDraftItems(next);
                        setSelectedItems(next.filter(x => Number(x.qtyToReceive ?? 0) > 0).map(x => x.id));
                        next.forEach(it => persistQty(it.id, it.qtyToReceive, it));
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
                        <LineItemListCardComponent
                          item={item}
                          index={index}
                          isSelected={selectedItems.includes(item.id)}
                          onCheckToggle={handleCheckToggle}
                          onQtyChange={handleQtyChange}
                          onViewDetails={() => goToLineItemDetails(index, draftItems, false, 'line')}
                        />
                      </View>
                    )}
                    scrollEnabled={false}
                  />
            </View>
          </ScrollView>
          <FooterButtonsComponent
            leftLabel="Save"
            rightLabel="Receive"
            onLeftPress={hasAnyItems ? () => { commitDraftToStore(); handlesave(); } : undefined}
            onRightPress={hasAnyItems ? handleReceive : undefined}
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
    // marginBottom:420,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scanText: { color: '#777' },
});

export default NewReceiveScreen;