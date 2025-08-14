import React, { useEffect, useMemo, useState, useRef } from 'react';
import { FlatList, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
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

  const readonly = !!route?.params?.readonly;
  const listTypeFromRoute = route?.params?.listType || 'line';
  const headerFromRoute = route?.params?.header || null;
  const sourceId = route?.params?.id ? String(route.params.id) : null;
  const passedItems = Array.isArray(route?.params?.selectedItems) ? route.params.selectedItems : [];

  const {
    poHeader, setPoHeader,
    summaryItems, initSummaryItems,
    mergePatchIntoSummaryItems, mergePatchIntoReceiveItems,
    resetReceiving,
  } = useReceivingStore();

  const [draft, setDraft] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  const didCompleteRef = useRef(false);
  useFocusEffect(React.useCallback(() => { didCompleteRef.current = false; return () => {}; }, []));

  useEffect(() => {
    if (!poHeader) {
      if (headerFromRoute) {
        setPoHeader(headerFromRoute);
      } else if (readonly) {
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
    }
  }, [poHeader, headerFromRoute, readonly, sourceId, route?.params, setPoHeader]);

  useEffect(() => {
    if (poHeader && readonly) {
      const needsReceipt = !poHeader.purchaseReceipt || poHeader.purchaseReceipt === '—';
      const needsDate = !poHeader.poDate || poHeader.poDate === '—';
      if (needsReceipt || needsDate) {
        const rec = receivedData.find(r => r.poNumber === poHeader.poNumber) || (sourceId ? receivedData.find(r => r.id === sourceId) : null);
        if (rec) setPoHeader({ purchaseReceipt: rec.purchaseReceipt, supplier: poHeader.supplier || rec.supplier, poNumber: poHeader.poNumber || rec.poNumber, poDate: rec.receivedDate });
      }
    }
  }, [poHeader, readonly, sourceId, setPoHeader]);

  useEffect(() => {
    if (!readonly && summaryItems.length === 0) initSummaryItems(passedItems);
  }, [summaryItems.length, readonly, passedItems, initSummaryItems]);

  useEffect(() => {
    if (readonly) setDraft(passedItems.length ? passedItems : defaultReceiptItems);
    else setDraft(summaryItems);
  }, [summaryItems, passedItems, readonly]);

  useFocusEffect(
    React.useCallback(() => {
      const patch = route?.params?.patch;
      if (patch) {
        setDraft(prev => prev.map(it => String(it.id) === String(patch.id)
          ? { ...it, qtyToReceive: (typeof patch.receivingQty === 'number' ? patch.receivingQty : it.qtyToReceive), lpn: patch.lpn ?? it.lpn, subInventory: patch.subInventory ?? it.subInventory, locator: patch.locator ?? it.locator }
          : it
        ));
        mergePatchIntoSummaryItems(patch);
        mergePatchIntoReceiveItems(patch);
        navigation.setParams({ patch: undefined });
      }
      return () => {};
    }, [route?.params?.patch, mergePatchIntoSummaryItems, mergePatchIntoReceiveItems, navigation])
  );

  const headerData = useMemo(() => poHeader || { purchaseReceipt: '—', supplier: '—', poNumber: '—', poDate: '—' }, [poHeader]);

  const confirmAction = async () => {
    try {
      const response = await createOrderReceipt(draft, true);
      if (response?.ok) return { success: true, message: response?.message || 'Order receipt created successfully' };
      return { success: false, message: response?.message || 'Failed to create order receipt' };
    } catch (error) {
      return { success: false, message: error?.message || 'Network error. Please try again.' };
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
      receivingQty: Number(readonly ? readonlyReceivingQty : (it.qtyToReceive ?? 0)),
      receivingStatus: readonly ? 'Received' : 'In-progress',
      lpn: it.lpn ?? '',
      subInventory: it.subInventory ?? '',
      locator: it.locator ?? '',
    };
  };

  const openLineDetailsFromSummary = (item) => {
    const source = draft;
    const idx = Math.max(source.findIndex(x => String(x.id) === String(item.id)), 0);
    const mapped = source.map(toDetailItemFromSummary);
    navigation.navigate({
      name: 'LineItemDetails',
      params: { items: mapped, startIndex: idx, readonly, returnTo: 'ReceiveSummaryScreen', listType: listTypeFromRoute },
      merge: true,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <GlobalHeaderComponent title="Receive" greetingName="Robert" dateText="06-08-2025" onBack={() => navigation.goBack()} onMenu={() => {}} />

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <POinfoCardComponent
          receiptNumber={headerData.purchaseReceipt}
          supplier={headerData.supplier}
          poNumber={headerData.poNumber}
          receiptDate={headerData.poDate}
        />

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
                qtyLabel="Qty"
                qtyValue={readonly ? Number(item.orderedQty ?? item.receivedQty ?? item.qtyToReceive ?? 0) : Number(item.qtyToReceive ?? 0)}
                readOnly
                onViewDetails={() => openLineDetailsFromSummary(item)}
              />
            </View>
          )}
          scrollEnabled={false}
          ListEmptyComponent={<View style={{ height: 16 }} />}
        />
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
});

export default ReceiveSummaryScreen;
