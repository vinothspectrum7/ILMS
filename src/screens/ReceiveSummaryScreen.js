import React, { useMemo, useState } from 'react';
import { FlatList, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import GlobalHeaderComponent from '../components/GlobalHeaderComponent';
import POinfoCardComponent from '../components/POinfoCardComponent';
import ConfirmLineItemComponent from '../components/ConfirmLineItemComponent';
import FooterButtonsComponent from '../components/FooterButtonsComponent';
import SummaryTabHdrComponent from '../components/SummaryTabHdrComponent';
import ConfirmModalComponent from '../components/ConfirmModalComponent';
import Toast from 'react-native-toast-message';
import { createOrderReceipt } from '../api/mockApi';

const poData = [
  { id: '1', purchaseReceipt: 'PR-00002', poNumber: 'PO-00002', supplier: '3DIng', poDate: '21 JUL 2025', status: 'OPEN' },
  { id: '2', purchaseReceipt: 'PR-00003', poNumber: 'PO-00003', supplier: 'TechCo', poDate: '22 JUL 2025', status: 'OPEN' },
  { id: '3', purchaseReceipt: 'PR-00004', poNumber: 'PO-00004', supplier: 'DesignHub', poDate: '23 JUL 2025', status: 'OPEN' },
  { id: '4', purchaseReceipt: 'PR-00005', poNumber: 'PO-00005', supplier: 'BuildCorp', poDate: '24 JUL 2025', status: 'OPEN' },
];

const receivedData = [
  { id: '1', purchaseReceipt: 'PR-00002', poNumber: 'PO-00002', supplier: '3DIng', receivedDate: '21 Jul 2025', status: 'Fully Received' },
  { id: '2', purchaseReceipt: 'PR-00003', poNumber: 'PO-00003', supplier: 'TechNerds', receivedDate: '22 Jul 2025', status: 'Partially Received' },
  { id: '3', purchaseReceipt: 'PR-00004', poNumber: 'PO-00004', supplier: 'CreativeTools', receivedDate: '23 Jul 2025', status: 'Fully Received' },
  { id: '4', purchaseReceipt: 'PR-00005', poNumber: 'PO-00005', supplier: 'BuildCorp', receivedDate: '24 Jul 2025', status: 'Fully Received' },
];

const defaultReceiptItems = [
  {
    id: 'a',
    name: 'Lorem Impusum',
    description: 'Lorem ipsum dolor sit amet…',   
    orderedQty: 100,
    receivedQty: 100,
    openQty: 0,
    promisedDate: '22/07/2025',
    needByDate: '24/07/2025',
    lpn: 'LPN1',                                   
    subInventory: 'SUBINVENTORY1',
    locator: 'LOCATOR1',
  },
  {
    id: 'b',
    name: 'Impusum',
    description: 'Lorem ipsum dolor sit amet…',   
    orderedQty: 150,
    receivedQty: 150,
    openQty: 0,
    promisedDate: '22/07/2025',
    needByDate: '24/07/2025',
    lpn: 'LPN2',                                   
    subInventory: 'SUBINVENTORY2',
    locator: 'LOCATOR2',
  },
  {
    id: 'c',
    name: 'Des Impusum',
    description: 'dolor ipsum dolor sit amet…',   
    orderedQty: 200,
    receivedQty: 200,
    openQty: 0,
    promisedDate: '22/07/2025',
    needByDate: '24/07/2025',
    lpn: 'LPN3',                                   
    subInventory: 'SUBINVENTORY3',
    locator: 'LOCATOR3',
  },
  
];

const ReceiveSummaryScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const readonly = !!route?.params?.readonly;
  const headerFromRoute = route?.params?.header;
  const passedItems = Array.isArray(route?.params?.selectedItems) ? route.params.selectedItems : [];
  const sourceId = route?.params?.id ? String(route.params.id) : null;

  const headerData = useMemo(() => {
    if (headerFromRoute) return headerFromRoute;

    if (readonly && sourceId) {
      const rec = receivedData.find(r => r.id === sourceId);
      if (rec) {
        return {
          receiptNumber: rec.purchaseReceipt,
          supplier: rec.supplier,
          poNumber: rec.poNumber,
          receiptDate: rec.receivedDate,
        };
      }
    }

    if (!readonly && sourceId) {
      const po = poData.find(p => p.id === sourceId);
      if (po) {
        return {
          receiptNumber: po.purchaseReceipt,
          supplier: po.supplier,
          poNumber: po.poNumber,
          receiptDate: po.poDate,
        };
      }
    }

    return {
      receiptNumber: 'PR-00002',
      supplier: '3DIng',
      poNumber: 'PO-00002',
      receiptDate: '21 Jul 2025',
    };
  }, [headerFromRoute, readonly, sourceId]);

  const [items] = useState(readonly ? (passedItems.length ? passedItems : defaultReceiptItems) : passedItems);
  const [modalVisible, setModalVisible] = useState(false);

  const confirmAction = async () => {
    try {
      const response = await createOrderReceipt(items, true);
      if (response?.ok) {
        navigation.navigate('Receive');
        return { success: true, message: response?.message || 'Order receipt created successfully' };
      } else {
        navigation.navigate('Receive');
        return { success: false, message: response?.message || 'Failed to create order receipt' };
      }
    } catch (error) {
      navigation.navigate('Receive');
      return { success: false, message: error?.message || 'Network error. Please try again.' };
    }
  };

  const handleCancel = () => setModalVisible(false);

  const handleSuccess = () => {
    Toast.show({ type: 'success', text1: 'Order receipt created successfully', position: 'top', visibilityTime: 1500 });
    setModalVisible(false);
  };

  const handleFailure = () => {
    Toast.show({ type: 'error', text1: 'Failed to create receipt', position: 'top', visibilityTime: 1500 });
    setModalVisible(false);
  };

  const toDetailItemFromSummary = (it, i) => ({
    id: String(it.id),
    poNumber: headerData.poNumber ?? '—',
    lineNumber: i + 1,
    itemName: it.name,
    itemDescription: it.itemDescription ?? it.description ?? '—',
    orderQty: Number(it.orderedQty ?? it.orderQty ?? 0),
    receivingQty: Number(readonly ? (it.receivedQty ?? 0) : (it.qtyToReceive ?? 0)),
    receivingStatus: readonly ? 'Received' : 'In-progress',
    lpn: it.lpn ?? '',
    subInventory: it.subInventory ?? '',
    locator: it.locator ?? '',
  });

  const openLineDetailsFromSummary = (item, readonly = true) => {
    const source = items;
    const idx = Math.max(source.findIndex(x => String(x.id) === String(item.id)), 0);
    const mapped = source.map(toDetailItemFromSummary);
    console.log('readonly==',readonly);
    navigation.navigate('LineItemDetails', {
      items: mapped,
      startIndex: idx,
      readonly,            
    });
  };

  const openConfirmModal = () => setModalVisible(true);

  return (
    <SafeAreaView style={styles.container}>
      <GlobalHeaderComponent title="Receive" greetingName="Robert" dateText="06-08-2025" onBack={() => navigation.goBack()} onMenu={() => {}} />

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <POinfoCardComponent
          receiptNumber={headerData.receiptNumber}
          supplier={headerData.supplier}
          poNumber={headerData.poNumber}
          receiptDate={headerData.receiptDate}
        />

        <View style={styles.tableHeader}>
          <SummaryTabHdrComponent />
        </View>

        <FlatList
          data={items}
          keyExtractor={item => String(item.id)}
          renderItem={({ item }) => (
            <View style={styles.lineItemWrapper}>
              <ConfirmLineItemComponent
                item={item}
                qtyLabel="Qty"
                qtyValue={readonly ? Number(item.receivedQty ?? item.qtyToReceive ?? 0) : Number(item.qtyToReceive ?? 0)}
                readOnly
                onViewDetails={() => openLineDetailsFromSummary(item, true)}
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
            onLeftPress={openConfirmModal}
            onRightPress={openConfirmModal}
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
  container: { backgroundColor: '#FFFFFF', flex: 1 },
  contentContainer: { paddingBottom: 120 },
  tableHeader: { marginTop: 8, marginBottom: 10 },
  lineItemWrapper: { marginBottom: 12 },
});

export default ReceiveSummaryScreen;
