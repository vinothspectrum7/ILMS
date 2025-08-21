import React, { useMemo, useState } from 'react';
import { FlatList, SafeAreaView, ScrollView, StyleSheet, View, Modal, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import GlobalHeaderComponent from '../../components/GlobalHeaderComponent';
// import POinfoCardComponent from '../components/POinfoCardComponent';
import ToggleTabsComponent from '../../components/ToggleTabsComponent';
import LineItemListCardComponent from '../../components/LineItemListCardComponent';
import FooterButtonsComponent from '../../components/FooterButtonsComponent';
import TableHeaderComponent from '../../components/TableHeaderComponent';
import ScanItemListCardComponent from '../../components/ScanItemListCardComponent';
import SummaryTabHdrComponent from '../../components/SummaryTabHdrComponent';
import BarcodeScanner from '../BarCodeScanner';
import ASNinfoCardComponent from '../../components/ASNinfoCardComponent';

const dummyItems = [
  { id: '01', purchaseReceipt: 'PR-00002', name: 'Lorem Ipsumum', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...', orderedQty: 10, receivedQty: 5, openQty: 5, uom: 'Each', promisedDate: '22 Jul 2025', needByDate: '24 Jul 2025' },
  { id: '02', purchaseReceipt: 'PR-00002', name: 'Dolor Sit Item', description: 'High quality item with standard packaging.', orderedQty: 14, receivedQty: 1, openQty: 3, uom: 'Each', promisedDate: '23 Jul 2025', needByDate: '25 Jul 2025' },
  { id: '03', purchaseReceipt: 'PR-00002', name: 'Dolor Item', description: 'Secondary component used in assembly.', orderedQty: 12, receivedQty: 1, openQty: 7, uom: 'Each', promisedDate: '23 Jul 2025', needByDate: '25 Jul 2025' },
];

const stripForPayload = ({
  id, purchaseReceipt, name, description, orderedQty, receivedQty, openQty, uom,
  promisedDate, needByDate, qtyToReceive, lpn, subInventory, locator,
}) => ({
  id, purchaseReceipt, name, description, orderedQty, receivedQty, openQty, uom,
  promisedDate, needByDate, qtyToReceive, lpn, subInventory, locator,
});

const PovViewItems = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const selectedPO = route?.params?.selectedPO || null;

  const fromScan = !!route?.params?.fromScan;
const scannedPoNumber = route?.params?.scannedPoNumber ?? null;

React.useEffect(() => {
  if (fromScan && scannedPoNumber) {
    Toast.show({
      type: 'success',              
      text1: `Scanned PO/IR numeber is ${scannedPoNumber}`,
      position: 'top',
      visibilityTime: 1500,
    });
  }
}, [fromScan, scannedPoNumber]);

  const [selectedTab, setSelectedTab] = useState('lineItems');
  const [items, setItems] = useState(dummyItems.map(i => ({ ...i, qtyToReceive: 0 })));
  const [selectedItems, setSelectedItems] = useState([]);
  const [scannedItems, setScannedItems] = useState([]);
  const [showScanner, setShowScanner] = useState(false);

  const handleCheckToggle = (item) => {
    const isChecked = selectedItems.includes(item.id);
    const nextSelected = isChecked ? selectedItems.filter(id => id !== item.id) : [...selectedItems, item.id];
    setSelectedItems(nextSelected);
    setItems(prev => prev.map(it => (it.id === item.id ? { ...it, qtyToReceive: isChecked ? 0 : it.openQty } : it)));
  };

  const handleQtyChange = (id, newQty) => {
    setItems(prev => prev.map(item => (item.id === id ? { ...item, qtyToReceive: newQty } : item)));
  };

  const handleSave = () => {};

  const handleReceive = () => {
    const payload =
      selectedTab === 'lineItems'
        ? items.filter(i => selectedItems.includes(i.id) && (i.qtyToReceive ?? 0) > 0).map(stripForPayload)
        : scannedItems.filter(i => (i.qtyToReceive ?? 0) > 0).map(stripForPayload);

    navigation.navigate('ReceiveSummaryScreen', {
      id: selectedPO?.id ?? null,
      selectedItems: payload,
      readonly: false,
    });
  };

  const toDetailItem = (it, i) => ({
    id: String(it.id),
    poNumber: selectedPO?.poNumber ?? '—',
    lineNumber: i + 1,
    itemName: it.name,
    itemDescription: it.itemDescription ?? it.description ?? '—',
    orderQty: Number(it.orderedQty ?? it.orderQty ?? 0),
    receivingQty: Number(it.qtyToReceive ?? 0),
    receivingStatus: 'In-progress',
    lpn: it.lpn ?? '',
    subInventory: it.subInventory ?? '',
    locator: it.locator ?? '',
  });

  const goToLineItemDetails = (startIdx = 0, source = items, readonly = false) => {
    Alert.alert("cominginsde","ser");
    console.log(source,"Lineitemsource");
    const mapped = source.map(toDetailItem);
    navigation.navigate('LineItemDetails', { items: mapped, startIndex: startIdx, readonly });
  };

  const handleScan = (value) => {
  const id = String(value).trim();
  const source = dummyItems.find(x => String(x.id) === id);

  if (!source) {
    Toast.show({
      type: 'error',
      text1: 'Unknown barcode',
      text2: `No item with id ${id}`,
      position: 'top',
    });
    setShowScanner(false);
    return;
  }

  const alreadyExists = scannedItems.some(x => String(x.id) === id);
  if (alreadyExists) {
    Toast.show({
      type: 'orange',
      text1: 'Scanned item already added to the list',
      text2: `${source.name} (ID: ${id})`,
      position: 'top',
      visibilityTime: 1500,
    });
    setShowScanner(false);
    return;
  }

  const fullReceiving = Math.max(0, source.openQty ?? 0);
  setScannedItems(prev => [...prev, { ...source, qtyToReceive: fullReceiving }]);

  setSelectedTab('scanItems');
  setShowScanner(false);

  Toast.show({
    type: 'success',
    text1: 'Item added from scan',
    text2: `${source.name} (ID: ${id})`,
    position: 'top',
    visibilityTime: 1200,
  });
};


  const hasAnyItems = useMemo(
    () => (selectedTab === 'lineItems' ? selectedItems.length > 0 : scannedItems.length > 0),
    [selectedTab, selectedItems.length, scannedItems.length]
  );

  return (
    <SafeAreaView style={styles.container}>
        <GlobalHeaderComponent
          organizationName="EnnVee"
          screenTitle="Receive"
          contextInfo={selectedPO}
          notificationCount={0}
          profileName="Vinoth Umasankar"
          onBack={() => navigation.goBack()}
          onMenu={() => setMenuOpen(true)}
          onNotificationPress={() => navigation.navigate('Home')}
          onProfilePress={() => navigation.navigate('Home')}
        />

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <ASNinfoCardComponent
          receiptNumber={selectedPO?.purchaseReceipt || '—'}
          supplier={selectedPO?.supplier || '—'}
          asnnumber={selectedPO?.asnnumber || '—'}
          shippeddate={selectedPO?.shippeddate || '—'}
        />

        <ToggleTabsComponent selectedTab={selectedTab} onSelectTab={setSelectedTab} />

        {selectedTab === 'lineItems' ? (
          <>
            <View style={styles.tableHeader}>
              <TableHeaderComponent
                allSelected={selectedItems.length === items.length}
                onToggleAll={() => {
                  const allIds = items.map(i => i.id);
                  const shouldSelectAll = selectedItems.length !== items.length;
                  setSelectedItems(shouldSelectAll ? allIds : []);
                  setItems(prev => prev.map(it => ({ ...it, qtyToReceive: shouldSelectAll ? it.openQty : 0 })));
                }}
              />
            </View>

            <FlatList
              data={items}
              keyExtractor={item => item.id}
              renderItem={({ item, index }) => (
                <View style={styles.lineItemWrapper}>
                  <LineItemListCardComponent
                    item={item}
                    index={index}
                    isSelected={selectedItems.includes(item.id)}
                    onCheckToggle={handleCheckToggle}
                    onQtyChange={handleQtyChange}
                    onViewDetails={() => goToLineItemDetails(index, items, false)}
                  />
                </View>
              )}
              scrollEnabled={false}
            />
          </>
        ) : (
          <ScanItemListCardComponent
            dummyItems={dummyItems}
            scannedItems={scannedItems}
            onChange={setScannedItems}
            onRequestScan={() => setShowScanner(true)}
            onFirstFilled={() => setSelectedTab('scanItems')}
            onViewDetails={(item) => {
              const source = scannedItems.length ? scannedItems : dummyItems;
              const idx = Math.max(source.findIndex(x => String(x.id) === String(item.id)), 0);
              goToLineItemDetails(idx, source, true);
            }}
            header={
              <View style={styles.tableHeader}>
                <SummaryTabHdrComponent allSelected={false} onToggleAll={() => {}} />
              </View>
            }
          />
        )}
      </ScrollView>

      <FooterButtonsComponent
        leftLabel="Save"
        rightLabel="Receive"
        onLeftPress={hasAnyItems ? handleSave : undefined}
        onRightPress={hasAnyItems ? handleReceive : undefined}
        leftEnabled={hasAnyItems}
        rightEnabled={hasAnyItems}
      />

      <Modal visible={showScanner} animationType="slide">
        <BarcodeScanner onScan={handleScan} onClose={() => setShowScanner(false)} />
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: '#F6F8FA', flex: 1 },
  contentContainer: { paddingBottom: 120 },
  tableHeader: { marginBottom: 10, marginTop: 8 },
  lineItemWrapper: { marginBottom: 12 },
});

export default PovViewItems;
