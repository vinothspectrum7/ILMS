import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { FlatList, SafeAreaView, ScrollView, StyleSheet, View, Modal, BackHandler, ActivityIndicator, Alert } from 'react-native';
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
import { createOrderReceipt } from '../api/mockApi';
import ConfirmModalComponent from '../components/ConfirmModalComponent';
import { GetSinglePO, Submit_Receive_Qty } from '../api/ApiServices';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

  const [selectedTab, setSelectedTab] = React.useState('lineItems');
  const [draftItems, setDraftItems] = React.useState([]);
  const [phase, setPhase] = useState('idle');
  const [PoListItems,setPoListItems] = useState([]);
  const [PurchaseReceipt,SetPurchaseReceipt] = useState(null);
  const [selectedItems, setSelectedItems] = React.useState([]);
  const [scannedItems, setScannedItems] = React.useState([]);
  const [showScanner, setShowScanner] = React.useState(false);

  useFocusEffect(
      React.useCallback(() => {
        didCompleteRef.current = false;
        return () => {};
      }, [])
    );

    useFocusEffect(
      React.useCallback(() => {
        const onBackPress = () => {
          if (showScanner) {
            setShowScanner(false);
            return true;
          }
          if (modalVisible) {
            setModalVisible(false);
            return true;
          }
          navigation.navigate('Receive');
          return true;
        };

        const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
        return () => sub.remove();
      }, [navigation, showScanner, modalVisible])
    );

  useEffect(() => {
    if (!selectedPO) return;
    setPoHeader(null);
    setPoHeader(mapHeader(selectedPO))
    console.log(selectedPO,"selectedPOselectedPO");
        console.log(poHeader,"POHEARDDD")
  }, [selectedPO]);

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
    max_open_qty:backend.max_open_qty,
    lpn: '',
    subInventory: OrgData?.selectedinventory,
    org_id:OrgData?.selectedOrg,
    locator: '',
    status:backend.line_status,
    uom: backend.item?.uom === "EA" ? "Each" : backend.uom, // convert if needed
    promisedDate: backend.promised_dlry_dt 
      ? new Date(backend.promised_dlry_dt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
      : null,
    needByDate: backend.need_by_dt 
      ? new Date(backend.need_by_dt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
      : null
  }));
}

// First effect: load PO data
useEffect(() => {
  if (!selectedPO?.po_id) return;
  setPhase('loading');
  const loadPoData = async () => {
    // Alert.alert(selectedPO?.po_id)
    try {
      const posingledata = await GetSinglePO(selectedPO.po_id);
      console.log(posingledata,"TESTESTETSTETSTETTET");
      if (posingledata?.purchase_order_lines) {
        SetPurchaseReceipt(posingledata?.next_receipt_num);
        const frontendArray = mapBackendArrayToFrontend(posingledata.purchase_order_lines,posingledata);
        console.log(frontendArray,"frontendArrayfrontendArrayfrontendArrayfrontendArray")
        setPoListItems(frontendArray); // ✅ only set once
      } else {
        setPoListItems([]);
      }
      setPhase('success');
    } catch (err) {
      console.error("Error loading PO data:", err);
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to load PO Items. Please try again.',
                position: 'top',
                visibilityTime: 5000
              });
              setPhase('error');
    }
  };

  loadPoData();
}, [selectedPO?.po_id]); // ✅ depend only on PO id

// Second effect: seed receiveItems whenever PoListItems changes
useEffect(() => {
  if (PoListItems.length > 0) {
    const seeded = PoListItems.map(i => ({ ...i, qtyToReceive: 0 }));
    initReceiveItems(seeded); // ✅ reset each time new PO data is loaded
  }
}, [PoListItems, initReceiveItems]); // ✅ depend on new PoListItems

  useFocusEffect(
    React.useCallback(() => {
      const withStored = receiveItems.map(src => {
        const qty = Number(src?.qtyToReceive ?? 0);
        return { ...src, qtyToReceive: qty };
      });
      setDraftItems(withStored);
      setSelectedItems(withStored.filter(x => Number(x.qtyToReceive ?? 0) > 0).map(x => x.id));
      return () => {};
    }, [receiveItems])
  );

  const fromScan = !!route?.params?.fromScan;
  const scannedPoNumber = route?.params?.scannedPoNumber ?? null;

  useEffect(() => {
    if (fromScan && scannedPoNumber) {
      Toast.show({ type: 'success', text1: `Scanned PO/IR number is ${scannedPoNumber}`, position: 'top', visibilityTime: 5000 });
    }
  }, [fromScan, scannedPoNumber]);

  const persistQty = (id, qty, fields = {}) => {
    console.log(fields,"fileedfefeeefefef")
    mergePatchIntoReceiveItems({
      id: String(id),
      receivingQty: Number(qty ?? 0),
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
    const isScan = selectedTab === 'scanItems';
    if (isScan) {
      setModalVisible(true);
      return;
    }
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
        lpn: i.lpn?i.lpn:'',
        subInventory: i.subInventory?i.subInventory:OrgData?.selectedinventory,
        org_id:OrgData?.selectedOrg,
        locator: i.locator?i.locator:'',
        status:i.status
      }));
    console.log(source,"sourcesourcesourcesourcesourcesourcesourcesourcesource")
    console.log(payload,"payloadpayloadpayloadpayloadpayloadpayloadpayloadpayloadpayload")
    navigation.navigate('ReceiveSummaryScreen', {
      id: selectedPO?.id ?? null,
      selectedItems: payload,
      readonly: false,
      purchaseReceipt:PurchaseReceipt,
      header: mapHeader(selectedPO),
      listType: 'line',
    });
  };

  const  mapConfirmData = (data)=> {
  return data.map((backend) => ({
    po_line_id:backend?.po_line_id,
    item_id:backend?.item_id,
    org_id:backend?.org_id, // placeholder (if needed)
    sub_inv_id: backend?.subInventory,
    locator_id: backend?.subInventory,
    lot_number: "",
    expiry_date: formatToday(),
    received_qty: Number(backend?.qtyToReceive)
  }));
}
  const confirmAction = async () => {
    try {
      console.log(scannedItems,"scannedItemsconfirm")

      const payload = mapConfirmData(scannedItems);
        try {
              const response = await Submit_Receive_Qty(payload);
              console.log(response,"posingledataposingledata");
          if (response?.results) return { success: true, message:'Received Quantity Updated Successfully!' };
          return { success: false, message: response?.message || 'Failed to create order receipt' };
            } catch (err) {
              return { success: false, message: err.detail?.[0].msg || 'Network error. Please try again.' };
            }
    } catch (error) {
      return { success: false, message: error?.message || 'Network error. Please try again.' };
    }
  };
  
    const handleCancel = () => setModalVisible(false);
  
    const handleSuccess = () => {
      if (didCompleteRef.current) return;
      didCompleteRef.current = true;
      Toast.hide();
      Toast.show({ type: 'success', text1: 'Order receipt created successfully', position: 'top', visibilityTime: 5000 });
      setModalVisible(false);
      resetReceiving();
      navigation.navigate('Receive');
    };
  
    const handleFailure = () => {
      Toast.hide();
      // Toast.show({ type: 'error', text1: 'Failed to create receipt', position: 'top', visibilityTime: 1500 });
      setModalVisible(false);
    };

  const toDetailItem = (it, i) => ({
    id: String(it.id),
    poNumber: poHeader?.poNumber ?? '—',
    lineNumber: i + 1,
    itemName: it.name,
    itemDescription: it.itemDescription ?? it.description ?? '—',
    orderQty: Number(it.orderedQty ?? it.orderQty ?? 0),
    openQty: Number(it.openQty ?? 0),
    receivingQty: Number(it.qtyToReceive ?? 0),
    max_open_qty: Number(it.max_open_qty ?? 0),
    receivingStatus: it.status,
    lpn: it.lpn ?? '',
    subInventory: it.subInventory ?? '',
    locator: it.locator ?? '',
    max_open_qty: Number(it.max_open_qty ?? it.openQty ?? 0),
  });

  const goToLineItemDetails = (
      startIdx = 0,
      source = draftItems,
      readonly = false,
      listType = 'line'
    ) => {
      const withLatestFromStore = source.map((it, i) => {
        const s = receiveItems.find(r => String(r.id) === String(it.id));
        const qty = Number(s?.qtyToReceive ?? it.qtyToReceive ?? 0);
        return {
          id: String(it.id),
          poNumber: poHeader?.poNumber ?? '—',
          lineNumber: i + 1,
          itemName: it.name,
          itemDescription: it.itemDescription ?? it.description ?? '—',
          orderQty: Number(it.orderedQty ?? it.orderQty ?? 0),
          openQty: Number(it.openQty ?? 0),
          receivingQty: qty,
          receivingStatus: 'In-progress',
          lpn: s?.lpn ?? it.lpn ?? '',
          subInventory: s?.subInventory ?? it.subInventory ?? '',
          locator: s?.locator ?? it.locator ?? '',
          max_open_qty: Number(it.max_open_qty ?? it.openQty ?? 0),
        };
      });

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

  const handleScan = (value) => {
    const id = String(value).trim();
        console.log(PoListItems,"sourcesourcesourcesourcesourcesourcesourcesource")
    const source = PoListItems.find(x => String(x.name) === id);
    console.log(source,"sourcesourcesourcesourcesourcesourcesourcesource")
    if (!source) {
      Toast.show({ type: 'error', text1: 'Unknown barcode', text2: `No item with id ${id}`, position: 'top',visibilityTime: 5000 });
      setShowScanner(false);
      return;
    }
    if(source?.openQty==0){
      Toast.show({ type: 'error', text1: 'Received', text2: `Received item cannot be scanned`, position: 'top',visibilityTime: 5000 });
      setShowScanner(false);
      return; 
    }
    const alreadyExists = scannedItems.some(x => String(x.name) === id);
    if (alreadyExists) {
      Toast.show({ type: 'orange', text1: 'Scanned item already added to the list', text2: `${source.name} (ID: ${id})`, position: 'top', visibilityTime: 5000 });
      setShowScanner(false);
      return;
    }
    const fullReceiving = Math.max(0, source.openQty ?? 0);
    setScannedItems(prev => [...prev, { ...source, qtyToReceive: fullReceiving }]);
    setSelectedTab('scanItems');
    setShowScanner(false);
    Toast.show({ type: 'success', text1: 'Item added from scan', text2: `${source.name} (ID: ${id})`, position: 'top', visibilityTime: 5000 });
  };

  const hasAnyItems = useMemo(
    () => (selectedTab === 'lineItems' ? selectedItems.length > 0 : scannedItems.length > 0),
    [selectedTab, selectedItems.length, scannedItems.length]
  );

   const formatToday = () => {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${yyyy}-${mm}-${dd}`;
  };

  const loadUserName = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem('user_name');
      if (!raw) {
        setProfileName('');
        return;
      }
      let name = '';
      try {
        const parsed = JSON.parse(raw);
        name = typeof parsed === 'string' ? parsed : parsed?.user_name ?? '';
      } catch {
        name = raw;
      }
      setProfileName(name.trim());
    } catch (e) {
      setProfileName('');
    }
  }, []);

  useEffect(() => {
    loadUserName();
  }, [loadUserName]);

  useFocusEffect(
    React.useCallback(() => {
      loadUserName();
    }, [loadUserName])
  );

  return (
    <SafeAreaView style={styles.container}>
      {phase === 'loading' && (
        <View style={styles.loaderWrapper}>
          <ActivityIndicator size="large" color="#233E55" />
        </View>
      )}
      {phase !== 'loading' && (
        <>
          <GlobalHeaderComponent
            organizationName={OrgData?.selectedOrgCode}
            screenTitle="Receiving"
            notificationCount={0}
            profileName={profileName}
            onBack={() => navigation.navigate('Receive')}
            // onNotificationPress={() => navigation.navigate('Home')}
            // onProfilePress={() => navigation.navigate('Home')}
          />

          <ScrollView contentContainerStyle={styles.contentContainer}>
            <POinfoCardComponent
              receiptNumber={poHeader?.purchaseReceipt || '—'}
              supplier={poHeader?.supplier || '—'}
              poNumber={poHeader?.poNumber || '—'}
              receiptDate={poHeader?.poDate || '—'}
            />

            <View style={styles.itemcontainer}>
              <ToggleTabsComponent selectedTab={selectedTab} onSelectTab={setSelectedTab} />

              {selectedTab === 'lineItems' ? (
                <>
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
                    />
                  </View>

                  <FlatList
                    data={draftItems}
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
                </>
              ) : (
                <ScanItemListCardComponent
                  dummyItems={PoListItems}
                  scannedItems={scannedItems}
                  onChange={setScannedItems}
                  onRequestScan={() => setShowScanner(true)}
                  onFirstFilled={() => setSelectedTab('scanItems')}
                  onViewDetails={(item) => {
                    const source = scannedItems.length ? scannedItems : PoListItems;
                    const idx = Math.max(source.findIndex(x => String(x.id) === String(item.id)), 0);
                    goToLineItemDetails(idx, source, true, 'scan');
                  }}
                  header={
                    <View style={styles.tableHeader}>
                      <SummaryTabHdrComponent allSelected={false} onToggleAll={() => {}} />
                    </View>
                  }
                />
              )}
            </View>
          </ScrollView>

          <FooterButtonsComponent
            leftLabel="Save"
            rightLabel="Receive"
            onLeftPress={hasAnyItems ? () => { commitDraftToStore(); Toast.show({ type: 'success', text1: 'Draft saved' }); } : undefined}
            onRightPress={hasAnyItems ? handleReceive : undefined}
            leftEnabled={hasAnyItems}
            rightEnabled={hasAnyItems}
          />

          <ConfirmModalComponent
            visible={modalVisible}
            title="Confirmation"
            message="Are you sure want to receive this Purchase Order?"
            confirmAction={confirmAction}
            onCancel={handleCancel}
            onSuccess={handleSuccess}
            onFailure={handleFailure}
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
  statusText: { marginTop: 12, color: '#333', fontSize: 14 },
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
});

export default NewReceiveScreen;
