import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { FlatList, SafeAreaView, ScrollView, StyleSheet, View, Text, BackHandler,ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import GlobalHeaderComponent from '../components/GlobalHeaderComponent';
import POinfoCardComponent from '../components/POinfoCardComponent';
// import ConfirmLineItemComponent from '../components/ConfirmLineItemComponent';
import ReceivedLineitemComponent from '../components/ReceivedLineitemComponent';
import FooterButtonsComponent from '../components/FooterButtonsComponent';
import SummaryTabHdrComponent from '../components/SummaryTabHdrComponent';
import ConfirmModalComponent from '../components/ConfirmModalComponent';
import Toast from 'react-native-toast-message';
import { createOrderReceipt } from '../api/mockApi';
import { useReceivingStore } from '../store/receivingStore';
import { GetSinglePO, GetSingleReceipt, Submit_Receive_Qty } from '../api/ApiServices';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SummaryTabHdrsComponent from '../components/ReceivedSummaryheader';

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

const ReceivedSummaryScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const [profileName, setProfileName] = useState('');
  const readonly = !!route?.params?.readonly;
  const listTypeFromRoute = route?.params?.listType || 'line';
  const headerFromRoute = route?.params?.header || null;
  // const purchaseReceipt = route?.params?.purchaseReceipt;
  const PONUMBER = route?.params?.poNumber;
  const [receivedData,SetReceivedData] = useState([]);
  const [phase, setPhase] = useState('idle');
  const sourceId = route?.params?.id ? String(route.params.id) : null;

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
        if (listTypeFromRoute === 'Received') {
          navigation.navigate('Receive');
        } else {
          navigation.navigate('NewReceiveScreen');
        }
        return true;
      };
      const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => sub.remove();
    }, [navigation, modalVisible, listTypeFromRoute])
  );

  const  mapBackendArrayToFrontend = (data)=> {
  return data.map((backend,index) => ({
    id: index+1,
    po_line_id:backend?.po_line_id,
    item_id:backend?.item_id,
    // purchaseReceipt:posingledata?.next_receipt_num || "", // placeholder (if needed)
    name: backend.item?.item_code || "",
    description: backend.item?.description || "",
    orderedQty: backend.ord_qty,
    receivedQty: backend.rcvd_qty,
    openQty: backend.open_qty,
    ship_to_location:backend.ship_to_location,
    max_open_qty:backend.max_open_qty,
    lpn: '',
    deliverytype:index==0?'Direct delivery':'Inspection required',
    deliverystatus:index==0?'Pending':'Done',
    deliverystatusdesc:index==0?'Inspection Pending':'PutAway Pending',
    sub_inv_name: backend.sub_inv_name,
    org_id:OrgData?.selectedOrg,
    locator_name: backend.locator_name,
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
    if (!sourceId&&!PONUMBER) return;
      setPhase('loading');
    const loadPoData = async () => {
      // Alert.alert(selectedPO?.po_id)
      try {
        const posingledata = await GetSingleReceipt(sourceId,PONUMBER);
        console.log(posingledata,"TESTESTETSTETSTETTET");
        if (posingledata) {
        //   SetPurchaseReceipt(posingledata?.next_receipt_num);
          const frontendArray = mapBackendArrayToFrontend(posingledata);
          console.log(frontendArray,"frontendArrayfrontendArrayfrontendArrayfrontendArray")
          SetReceivedData(frontendArray); // ✅ only set once
        } else {
          SetReceivedData([]);
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
  }, [sourceId,PONUMBER]);

  useEffect(() => {
    if (headerFromRoute) {
      setPoHeader(null);
      setPoHeader(headerFromRoute);
      return;
    }

  }, [headerFromRoute]);

  useEffect(() => {
      setDraft(receivedData);
  }, [receivedData]);

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

  const renderItems = useMemo(() => {
  if (Array.isArray(draft) && draft.length > 0) return draft;
  return [];
}, [draft]);

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

//   useFocusEffect(
//     useCallback(() => {
//       const hasLive = Array.isArray(receiveItems) && receiveItems.length > 0;
//       const nonePassed = !Array.isArray(passedItems) || passedItems.length === 0;
//       const noneSummary = !Array.isArray(summaryItems) || summaryItems.length === 0;
//       if (!readonly && !hasLive && nonePassed && noneSummary) {
//         if (listTypeFromRoute === 'Received') {
//           navigation.replace('Receive');
//         } else {
//           navigation.replace('NewReceiveScreen', { listType: listTypeFromRoute || 'line' });
//         }
//       }
//     }, [readonly, receiveItems, passedItems, summaryItems, listTypeFromRoute, navigation])
//   );

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
    console.log(it.receivedQty,"ITRECEITCEFIIENFINEFIIFE")
    const readonlyReceivingQty =
      listTypeFromRoute === 'scan'
        ? Number(it.openQty ?? 0) > 0
          ? Number(it.openQty ?? 0)
          : Number(it.orderedQty ?? it.orderQty ?? 0)
        : Number(it.orderedQty ?? it.orderQty ?? 0);
    return {
      id: String(it.id),
      poNumber: headerData.poNumber ?? '—',
      lineNumber: i + 1,
      itemName: it.name,
      itemid:it.item_id,
      itemDescription: it.itemDescription ?? it.description ?? '—',
      orderQty: Number(it.orderedQty ?? it.orderQty ?? 0),
      openQty: Number(it.openQty ?? 0),
      ship_to_location:it.ship_to_location??'—',
      receivingQty: readonlyReceivingQty,
      receivedQty:Number(it.receivedQty ?? 0),
      receivingStatus: it.status,
      lpn: it.lpn ?? '',
      uom:it.uom,
      sub_inv_name: it.sub_inv_name,
      locator_name: it.locator_name,
      subInventory: it.subInventory ?? '',
      locator: it.locator ?? '',
    };
  };

  const openLineDetailsFromSummary = item => {
    const source = renderItems;
    const idx = Math.max(source.findIndex(x => String(x.id) === String(item.id)), 0);
    const mapped = source.map(toDetailItemFromSummary);
    console.log(headerData?.receiptNumber,"headerData?.receiptNumberheaderData?.receiptNumber")
    navigation.navigate({
      name: 'LineItemDetails',
      params: { items: mapped, startIndex: idx, readonly, returnTo: 'ReceivedSummaryScreen', listType: listTypeFromRoute,receiptNumber:headerData?.receiptNumber },
      merge: true,
    });
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
            {phase === 'loading' && (
              <View style={styles.loaderWrapper}>
                <ActivityIndicator size="large" color="#233E55" />
                <Text style={styles.statusText}>Loading data…</Text>
              </View>
            )}
          {phase !== 'loading' && (
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <POinfoCardComponent
          receiptNumber={headerData.receiptNumber}
          supplier={headerData.supplier}
          poNumber={headerData.poNumber}
          receiptDate={headerData.poDate}
        />

        <View style={styles.itemcontainer}>
          <Text style={styles.itemName}>Item Summary</Text>

          <View style={styles.tableHeader}>
            <SummaryTabHdrsComponent />
          </View>

          <FlatList
            data={renderItems}
            keyExtractor={item => String(item.id)}
            renderItem={({ item }) => (
              <View style={styles.lineItemWrapper}>
                <ReceivedLineitemComponent
                  item={item}
                  qtyLabel={item.uom}
                  qtyValue={item.receivedQty}
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
        )}

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: '#F6F8FA', flex: 1 },
  loaderWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  statusText: { marginTop: 12, color: '#333', fontSize: 14 },
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

export default ReceivedSummaryScreen;
