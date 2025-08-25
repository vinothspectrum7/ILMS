import React, { useEffect, useMemo, useState, useRef } from 'react';
import { FlatList, SafeAreaView, ScrollView, StyleSheet, View, Text, BackHandler } from 'react-native';
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
import { Submit_Receive_Qty } from '../api/ApiServices';

const receivedData = [
  { id: '1', purchaseReceipt: 'PR-00002', poNumber: 'PO-00002', supplier: '3DIng', receivedDate: '21 Jul 2025', status: 'Fully Received' },
  { id: '2', purchaseReceipt: 'PR-00003', poNumber: 'PO-00003', supplier: 'TechNerds', receivedDate: '22 Jul 2025', status: 'Partially Received' },
  { id: '3', purchaseReceipt: 'PR-00004', poNumber: 'PO-00004', supplier: 'CreativeTools', receivedDate: '23 Jul 2025', status: 'Fully Received' },
  { id: '4', purchaseReceipt: 'PR-00005', poNumber: 'PO-00005', supplier: 'BuildCorp', receivedDate: '24 Jul 2025', status: 'Fully Received' },
];

// const defaultReceiptItems = [
//   { id: 'a', name: 'Lorem Impusum', description: 'Lorem ipsum dolor sit amet…', orderedQty: 100, receivedQty: 100, openQty: 0, promisedDate: '22/07/2025', needByDate: '24/07/2025', lpn: 'LPN1', subInventory: 'SUBINVENTORY1', locator: 'LOCATOR1' },
//   { id: 'b', name: 'Impusum', description: 'Lorem ipsum dolor sit amet…', orderedQty: 150, receivedQty: 150, openQty: 0, promisedDate: '22/07/2025', needByDate: '24/07/2025', lpn: 'LPN2', subInventory: 'SUBINVENTORY2', locator: 'LOCATOR2' },
//   { id: 'c', name: 'Des Impusum', description: 'dolor ipsum dolor sit amet…', orderedQty: 200, receivedQty: 200, openQty: 0, promisedDate: '22/07/2025', needByDate: '24/07/2025', lpn: 'LPN3', subInventory: 'SUBINVENTORY3', locator: 'LOCATOR3' },
// ];

const ReceiveSummaryScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const readonly = !!route?.params?.readonly;
  const selectedPO = route?.params?.header?.poNumber;
  const listTypeFromRoute = route?.params?.listType || 'line';
  const headerFromRoute = route?.params?.header || null;
  const purchaseReceipt = route?.params?.purchaseReceipt;
  const sourceId = route?.params?.id ? String(route.params.id) : null;
  const passedItems = Array.isArray(route?.params?.selectedItems) ? route.params.selectedItems : [];

  const {
    poHeader, setPoHeader,
    summaryItems, initSummaryItems,
    mergePatchIntoSummaryItems, mergePatchIntoReceiveItems,
    resetReceiving,OrgData
  } = useReceivingStore();

  const [draft, setDraft] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  const didCompleteRef = useRef(false);
  const handledPatchIdsRef = useRef(new Set());
  const initializedRef = useRef(false);

  useFocusEffect(
    React.useCallback(() => {
      didCompleteRef.current = false;
      return () => {};
    }, [])
  );

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (modalVisible) {
          setModalVisible(false);
          return true;
        }
        navigation.navigate('NewReceiveScreen');
        return true;
      };
      const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => sub.remove();
    }, [navigation, modalVisible])
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
      setDraft(passedItems.length ? passedItems : []);
    } else if (Array.isArray(passedItems) && passedItems.length > 0) {
      setDraft(passedItems);
      initSummaryItems(passedItems);
    } else if (Array.isArray(summaryItems) && summaryItems.length > 0) {
      setDraft(summaryItems);
    }
    initializedRef.current = true;
  }, [readonly, passedItems, summaryItems, initSummaryItems]);

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
    locator_id: backend?.locator,
    lot_number: "",
    expiry_date: formatToday(),
    received_qty: Number(backend?.qtyToReceive)
  }));
}

  const confirmAction = async () => {
    const formatdata = mapConfirmData(draft);
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

  const handleCancel = () => setModalVisible(false);

  const handleSuccess = () => {
    if (didCompleteRef.current) return;
    didCompleteRef.current = true;
    Toast.hide();
    Toast.show({ type: 'success', text1: 'Order receipt created successfully', position: 'top', visibilityTime: 1500 });
    setModalVisible(false);
    resetReceiving();
    navigation.navigate('Receive');
  };

  const handleFailure = () => {
    Toast.hide();
    Toast.show({ type: 'error', text1: 'Failed to create receipt', position: 'top', visibilityTime: 1500 });
    setModalVisible(false);
  };

  const toDetailItemFromSummary = (it, i) => {
    const readonlyReceivingQty =
      listTypeFromRoute === 'scan'
        ? (Number(it.openQty ?? 0) > 0 ? Number(it.openQty ?? 0) : Number(it.orderedQty ?? it.orderQty ?? 0))
        : Number(it.orderedQty ?? it.orderQty ?? 0);

    return {
      id: String(it.id),
      poNumber: headerData.poNumber ?? '—',
      lineNumber: i + 1,
      itemName: it.name,
      itemDescription: it.itemDescription ?? it.description ?? '—',
      orderQty: Number(it.orderedQty ?? it.orderQty ?? 0),
      openQty: Number(it.openQty ?? 0),
      receivingStatus:readonly ? 'Received' :it.status,
      receivingQty: Number(readonly ? readonlyReceivingQty : (it.qtyToReceive ?? 0)),
      // receivingStatus: readonly ? 'Received' : it.line_status,
      lpn: it.lpn ?? '',
      subInventory: it.subInventory ?? '',
      locator: it.locator ?? '',
    };
  };

  const openLineDetailsFromSummary = (item) => {
    const source = draft;
    console.log()
    const idx = Math.max(source.findIndex(x => String(x.id) === String(item.id)), 0);
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
          organizationName={OrgData?.selectedOrgCode}
          screenTitle="Receiving"
          // contextInfo={selectedPO}
          notificationCount={0}
          profileName="Vinoth Umasankar"
          onBack={() => navigation.navigate('NewReceiveScreen')}
          onMenu={() => setMenuOpen(true)}
          onNotificationPress={() => navigation.navigate('Home')}
          onProfilePress={() => navigation.navigate('Home')}
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
            data={draft}
            keyExtractor={item => String(item.id)}
            renderItem={({ item }) => (
              <View style={styles.lineItemWrapper}>
                <ConfirmLineItemComponent
                  item={item}
                  qtyLabel="Each"
                  qtyValue={readonly ? Number(item.orderedQty ?? item.receivedQty ?? item.qtyToReceive ?? 0) : Number(item.qtyToReceive ?? 0)}
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
            onLeftPress={() => setModalVisible(true)}
            onRightPress={() => setModalVisible(true)}
            leftEnabled
            rightEnabled
          />
          <ConfirmModalComponent
            visible={modalVisible}
            title="Confirmation"
            message="Are you sure want to confirm this order?"
            confirmAction={confirmAction}
            onCancel={handleCancel}
            onSuccess={handleSuccess}
            onFailure={handleFailure}
          />
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
