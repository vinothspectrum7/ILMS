import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { FlatList, SafeAreaView, ScrollView, StyleSheet, View, Text, Modal, BackHandler, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import GlobalHeaderComponent from '../components/GlobalHeaderComponent';
import POinfoCardComponent from '../components/POinfoCardComponent';
import ConfirmLineItemComponent from '../components/ConfirmLineItemComponent';
import FooterButtonsComponent from '../components/FooterButtonsComponent';
import SummaryTabHdrComponent from '../components/SummaryTabHdrComponent';
import ConfirmModalComponent from '../components/ConfirmModalComponent';
import Toast from 'react-native-toast-message';
import { createOrderReceipt } from '../api/mockApi';
import { useReceivingStore } from '../store/receivingStore';
import { Submit_Receive_Qty, Save_Receive_Qty } from '../api/ApiServices';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ConfirmSvg from '../assets/icons/success.svg';
import FailureSvg from '../assets/icons/failure.svg';

const receivedData = [
  { id: '1', purchaseReceipt: 'PR-00002', poNumber: 'PO-00002', supplier: '3DIng', receivedDate: '21 Jul 2025', status: 'Fully Received' },
  { id: '2', purchaseReceipt: 'PR-00003', poNumber: 'PO-00003', supplier: 'TechNerds', receivedDate: '22 Jul 2025', status: 'Partially Received' },
  { id: '3', purchaseReceipt: 'PR-00004', poNumber: 'PO-00004', supplier: 'CreativeTools', receivedDate: '23 Jul 2025', status: 'Fully Received' },
  { id: '4', purchaseReceipt: 'PR-00005', poNumber: 'PO-00005', supplier: 'BuildCorp', receivedDate: '24 Jul 2025', status: 'Fully Received' },
];

const defaultReceiptItems = [
  { id: 'a', name: 'Lorem Impusum', description: 'Lorem ipsum dolor sit amet…', orderedQty: 100, receivedQty: 100, openQty: 0, promisedDate: '22/07/2025', needByDate: '24/07/2025', lpn: 'LPN1', subInventory: 'SUBINVENTORY1', locator: 'LOCATOR1' },
  { id: 'b', name: 'Impusum', description: 'Lorem ipsum dolor sit amet…', orderedQty: 150, receivedQty: 150, openQty: 0, promisedDate: '22/07/2025', needByDate: '24/07/2025', lpn: 'LPN2', subInventory: 'SUBINVENTORY2', locator: 'LOCATOR2' },
  { id: 'c', name: 'Des Impusum', description: 'dolor ipsum dolor sit amet…', orderedQty: 200, receivedQty: 200, openQty: 0, promisedDate: '22/07/2025', needByDate: '24/07/2025', lpn: 'LPN3', subInventory: 'SUBINVENTORY3', locator: 'LOCATOR3' },
];

const ReceiveSummaryScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const [profileName, setProfileName] = useState('');
  const readonly = !!route?.params?.readonly;
  const listTypeFromRoute = route?.params?.listType || 'line';
  const headerFromRoute = route?.params?.header || null;
  const purchaseReceipt = route?.params?.purchaseReceipt;
  const sourceId = route?.params?.id ? String(route.params.id) : null;
  const passedItems = Array.isArray(route?.params?.selectedItems) ? route.params.selectedItems : [];

  const {
    poHeader,
    setPoHeader,
    receiveItems,
    summaryItems,
    initSummaryItems,
    mergePatchIntoSummaryItems,
    mergePatchIntoReceiveItems,
    resetReceiving,
    OrgData,
  } = useReceivingStore();

  const [draft, setDraft] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  const didCompleteRef = useRef(false);

  const [saveModalVisible, setSaveModalVisible] = useState(false);
    const [saveModalStatus, setSaveModalStatus] = useState('success');
  
    const didsaveCompleteRef = useRef(false);

  const handledPatchIdsRef = useRef(new Set());
  const initializedRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      didCompleteRef.current = false;
      return () => {};
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (modalVisible) {
          setModalVisible(false);
          return true;
        }
        if (saveModalVisible) {
          setSaveModalVisible(false);
          return true;
        }
        if (listTypeFromRoute === 'Received') {
          navigation.navigate('Receive');
        } else {
          navigation.navigate('NewReceiveScreen');
        }
        return true;
      };
      const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => sub.remove();
    }, [navigation, modalVisible, listTypeFromRoute, saveModalVisible])
  );

  useEffect(() => {
    if (poHeader) return;
    if (headerFromRoute) {
      setPoHeader(headerFromRoute);
      return;
    }
    if (readonly) {
      let rec = null;
      if (sourceId) rec = receivedData.find(r => r.id === sourceId);
      if (!rec) {
        const poNo = route?.params?.header?.poNumber || route?.params?.poNumber || null;
        if (poNo) rec = receivedData.find(r => r.poNumber === poNo);
      }
      if (rec) {
        setPoHeader({ purchaseReceipt: rec.purchaseReceipt, supplier: rec.supplier, poNumber: rec.poNumber, poDate: rec.receivedDate });
      }
    }
  }, [poHeader, headerFromRoute, readonly, sourceId, setPoHeader, route?.params?.header?.poNumber, route?.params?.poNumber]);

  useEffect(() => {
    if (initializedRef.current) return;
    if (readonly) {
      setDraft(passedItems.length ? passedItems : defaultReceiptItems);
    } else if (Array.isArray(receiveItems) && receiveItems.length > 0) {
      setDraft(receiveItems);
    } else if (Array.isArray(passedItems) && passedItems.length > 0) {
      setDraft(passedItems);
      initSummaryItems(passedItems);
    } else if (Array.isArray(summaryItems) && summaryItems.length > 0) {
      setDraft(summaryItems);
    }
    initializedRef.current = true;
  }, [readonly, receiveItems, passedItems, summaryItems, initSummaryItems]);

  const patch = route?.params?.patch;

  useEffect(() => {
    const patchId = patch?.id != null ? String(patch.id) : null;
    if (!patchId || handledPatchIdsRef.current.has(patchId)) return;
    handledPatchIdsRef.current.add(patchId);
    setDraft(prev =>
      prev.map(it =>
        String(it.id) === patchId
          ? {
              ...it,
              qtyToReceive: typeof patch.receivingQty === 'number' ? patch.receivingQty : it.qtyToReceive,
              lpn: patch.lpn ?? it.lpn,
              subInventory: patch.subInventory ?? it.subInventory,
              locator: patch.locator ?? it.locator,
            }
          : it
      )
    );
    mergePatchIntoSummaryItems(patch);
    mergePatchIntoReceiveItems(patch);
    const t = setTimeout(() => navigation.setParams({ patch: undefined }), 0);
    return () => clearTimeout(t);
  }, [patch?.id, patch, mergePatchIntoSummaryItems, mergePatchIntoReceiveItems, navigation]);

  const headerData = useMemo(
    () => poHeader || { purchaseReceipt: '—', supplier: '—', poNumber: '—', poDate: '—' },
    [poHeader]
  );

const  mapConfirmData = (data)=> {
  return data.map((backend) => ({
    po_line_id:backend?.po_line_id,
    item_id:backend?.item_id,
    org_id:backend?.org_id, // placeholder (if needed)
    sub_inv_id: backend?.subInventory,
    locator_id: backend.locator?backend?.locator:null,
    lot_number: "",
    expiry_date: formatToday(),
    received_qty: Number(backend?.qtyToReceive)
  }));
}

  const confirmAction = async () => {
    console.log(renderItems,"draftdraftdraftdraftdraft")
    const formatdata = mapConfirmData(renderItems);
    console.log(formatdata,"formatdataformatdata");
        try {
          const response = await Submit_Receive_Qty(formatdata);
          console.log(response,"posingledataposingledata");
      if (response?.results) return { success: true, message:'Received Quantity Updated Successfully!' };
      return { success: false, message: response?.message || 'Failed to create order receipt' };
        } catch (err) {
          return { success: false, message: err.detail?.[0].msg || 'Network error. Please try again.' };
        }
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
      const payload = mapConfirmSaveData(renderItems);
      console.log('Save payload:', payload);
      const response = await Save_Receive_Qty(payload);
      console.log('Save response:', response);
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
    resetReceiving();
    navigation.navigate('Receive');
  };
  
  const handlesaveFailure = () => {
    if (didCompleteRef.current) return;
    didCompleteRef.current = true;
    setSaveModalVisible(false);
  };
  

  const renderItems = useMemo(() => {
  if (!readonly && Array.isArray(receiveItems) && receiveItems.length > 0) {
    return receiveItems.filter(
      it => Number(it?.qtyToReceive ?? it?.receivingQty ?? 0) > 0
    );
  }
  if (Array.isArray(summaryItems) && summaryItems.length > 0) return summaryItems;
  if (Array.isArray(draft) && draft.length > 0) return draft;
  return [];
}, [readonly, receiveItems, summaryItems, draft]);

  const qtyFor = useCallback(
    it => {
      const inReceive = Array.isArray(receiveItems) ? receiveItems.find(x => String(x.id) === String(it.id)) : null;
      const inSummary = Array.isArray(summaryItems) ? summaryItems.find(x => String(x.id) === String(it.id)) : null;
      const q =
        inReceive?.qtyToReceive ??
        inReceive?.receivingQty ??
        inSummary?.qtyToReceive ??
        inSummary?.receivingQty ??
        it?.qtyToReceive ??
        0;
      return Number(q);
    },
    [receiveItems, summaryItems]
  );

  useFocusEffect(
    useCallback(() => {
      const hasLive = Array.isArray(receiveItems) && receiveItems.length > 0;
      const nonePassed = !Array.isArray(passedItems) || passedItems.length === 0;
      const noneSummary = !Array.isArray(summaryItems) || summaryItems.length === 0;
      if (!readonly && !hasLive && nonePassed && noneSummary) {
        if (listTypeFromRoute === 'Received') {
          navigation.replace('Receive');
        } else {
          navigation.replace('NewReceiveScreen', { listType: listTypeFromRoute || 'line' });
        }
      }
    }, [readonly, receiveItems, passedItems, summaryItems, listTypeFromRoute, navigation])
  );

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
    Toast.show({ type: 'error', text1: 'Failed to create receipt', position: 'top', visibilityTime: 5000 });
    setModalVisible(false);
  };

  const toDetailItemFromSummary = (it, i) => {
      const qty = Number(it.qtyToReceive ?? 0);
    return {
      id: String(it.id),
      poNumber: headerData.poNumber ?? '—',
      lineNumber: i + 1,
      itemName: it.name,
      itemDescription: it.itemDescription ?? it.description ?? '—',
      orderQty: Number(it.orderedQty ?? it.orderQty ?? 0),
      openQty: Number(it.openQty ?? 0),
      uom:it.uom,
      receivingQty: qty,
      receivingStatus: it.status,
      lpn: it.lpn ?? '',
      subInventory: it.subInventory ?? '',
      locator: it.locator ?? '',
      max_open_qty: Number(it.max_open_qty ?? it.openQty ?? 0),
    };
  };

  const openLineDetailsFromSummary = item => {
    const source = renderItems;
    const idx = Math.max(source.findIndex(x => String(x.id) === String(item.id)), 0);
    console.log(source,"VIEWDETAILSsourceSUMMARY")
    const mapped = source.map(toDetailItemFromSummary);
    navigation.navigate({
      name: 'LineItemDetails',
      params: { items: mapped, startIndex: idx, readonly, returnTo: 'ReceiveSummaryScreen', listType: listTypeFromRoute },
      merge: true,
    });
  };

  const formatToday = () => {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${yyyy}-${mm}-${dd}`;
  };


  return (
    <SafeAreaView style={styles.container}>
      <GlobalHeaderComponent
        organizationName={useReceivingStore.getState()?.OrgData?.selectedOrgCode || OrgData?.selectedOrgCode}
        screenTitle="Receiving"
        notificationCount={0}
        // profileName={profileName}
        onBack={() => {
          if (listTypeFromRoute === 'Received') {
            navigation.navigate('Receive');
          } else {
            navigation.navigate('NewReceiveScreen');
          }
        }}
        // onNotificationPress={() => navigation.navigate('Home')}
        // onProfilePress={() => navigation.navigate('Home')}
      />

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <POinfoCardComponent
          receiptNumber={purchaseReceipt}
          supplier={headerData.supplier}
          poNumber={headerData.poNumber}
          receiptDate={headerData.poDate}
        />

        <View style={styles.itemcontainer}>
          <Text style={styles.itemName}>Item Summary</Text>

          <View style={styles.tableHeader}>
            <SummaryTabHdrComponent />
          </View>

          <FlatList
            data={renderItems}
            keyExtractor={item => String(item.id)}
            renderItem={({ item }) => (
              <View style={styles.lineItemWrapper}>
                <ConfirmLineItemComponent
                  item={item}
                  qtyLabel={item.uom}
                  qtyValue={readonly ? Number(item.orderedQty ?? item.receivedQty ?? qtyFor(item)) : qtyFor(item)}
                  readOnly
                  onViewDetails={() => openLineDetailsFromSummary(item)}
                />
              </View>
            )}
            scrollEnabled={false}
            ListEmptyComponent={<View style={{ height: 16 }} />}
          />
        </View>
      </ScrollView>

      {!readonly && (
        <>
          <FooterButtonsComponent
            leftLabel="Save"
            rightLabel="Confirm"
            onLeftPress={() => {handlesave();}}
            onRightPress={() => setModalVisible(true)}
            leftEnabled
            rightEnabled
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
  container: { backgroundColor: '#F6F8FA', flex: 1 },
  contentContainer: { paddingBottom: 120 },
  tableHeader: { marginTop: 8, marginBottom: 10 },
  lineItemWrapper: { marginBottom: 12 },
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
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginHorizontal: 12,
    marginStart: 18,
    marginTop: 3,
    paddingTop: 3,
  },
});

export default ReceiveSummaryScreen;
