import React, { useMemo, useState } from 'react';
import { FlatList, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import GlobalHeaderComponent from '../components/GlobalHeaderComponent';
import POinfoCardComponent from '../components/POinfoCardComponent';
import ToggleTabsComponent from '../components/ToggleTabsComponent';
import LineItemListCardComponent from '../components/LineItemListCardComponent';
import FooterButtonsComponent from '../components/FooterButtonsComponent';
import TableHeaderComponent from '../components/TableHeaderComponent';
import ScanItemListCardComponent from '../components/ScanItemListCardComponent';
import SummaryTabHdrComponent from '../components/SummaryTabHdrComponent';

const dummyItems = [
  { id: '1', name: 'Lorem Ipsumum', orderedQty: 10, receivedQty: 5, openQty: 5, uom: 'Each', promisedDate: '22 Jul 2025', needByDate: '24 Jul 2025' },
  { id: '2', name: 'Dolor Sit Item', orderedQty: 14, receivedQty: 1, openQty: 3, uom: 'Each', promisedDate: '23 Jul 2025', needByDate: '25 Jul 2025' },
  { id: '3', name: 'Dolor Item', orderedQty: 12, receivedQty: 1, openQty: 7, uom: 'Each', promisedDate: '23 Jul 2025', needByDate: '25 Jul 2025' },
];

const stripForPayload = ({ id, name, orderedQty, receivedQty, openQty, uom, promisedDate, needByDate, qtyToReceive }) => ({
  id, name, orderedQty, receivedQty, openQty, uom, promisedDate, needByDate, qtyToReceive,
});

const NewReceiveScreen = () => {
  const navigation = useNavigation();
  const [selectedTab, setSelectedTab] = useState('lineItems');
  const [items, setItems] = useState(dummyItems.map((i) => ({ ...i, qtyToReceive: 0 })));
  const [selectedItems, setSelectedItems] = useState([]);
  const [scannedItems, setScannedItems] = useState([]);

  const handleCheckToggle = (item) => {
    const isChecked = selectedItems.includes(item.id);
    const nextSelected = isChecked ? selectedItems.filter((id) => id !== item.id) : [...selectedItems, item.id];
    setSelectedItems(nextSelected);
    setItems((prev) => prev.map((it) => (it.id === item.id ? { ...it, qtyToReceive: isChecked ? 0 : it.openQty } : it)));
  };

  const handleQtyChange = (id, newQty) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, qtyToReceive: newQty } : item)));
  };

  const handleSave = () => {};

  const handleReceive = () => {
    const payload =
      selectedTab === 'lineItems'
        ? items.filter((i) => selectedItems.includes(i.id) && (i.qtyToReceive ?? 0) > 0).map(stripForPayload)
        : scannedItems.filter((i) => (i.qtyToReceive ?? 0) > 0).map(stripForPayload);

    navigation.navigate('ReceiveSummaryScreen', { selectedItems: payload });
  };

  const hasAnyItems = useMemo(() => {
    return selectedTab === 'lineItems' ? selectedItems.length > 0 : scannedItems.length > 0;
  }, [selectedTab, selectedItems.length, scannedItems.length]);

  return (
    <SafeAreaView style={styles.container}>
      <GlobalHeaderComponent
        title="Receive"
        greetingName="Robert"
        dateText="06-08-2025"
        onBack={() => navigation.goBack()}
        onMenu={() => {}}
      />

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <POinfoCardComponent receiptNumber="12300002" supplier="3DIng" poNumber="PO-00002" receiptDate="21 Jul 2025" />

        <ToggleTabsComponent selectedTab={selectedTab} onSelectTab={setSelectedTab} />

        {selectedTab === 'lineItems' ? (
          <>
            <View style={styles.tableHeader}>
              <TableHeaderComponent
                allSelected={selectedItems.length === items.length}
                onToggleAll={() => {
                  const allIds = items.map((i) => i.id);
                  const shouldSelectAll = selectedItems.length !== items.length;
                  setSelectedItems(shouldSelectAll ? allIds : []);
                  setItems((prev) => prev.map((it) => ({ ...it, qtyToReceive: shouldSelectAll ? it.openQty : 0 })));
                }}
              />
            </View>

            <FlatList
              data={items}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.lineItemWrapper}>
                  <LineItemListCardComponent
                    item={item}
                    isSelected={selectedItems.includes(item.id)}
                    onCheckToggle={handleCheckToggle}
                    onQtyChange={handleQtyChange}
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
            header={
              <View style={styles.tableHeader}>
                <SummaryTabHdrComponent allSelected={false} onToggleAll={() => {}} />
              </View>
            }
          />
        )}
      </ScrollView>

      <FooterButtonsComponent
        leftLabel="Draft"
        rightLabel="Receive"
        onLeftPress={hasAnyItems ? handleSave : undefined}
        onRightPress={hasAnyItems ? handleReceive : undefined}
        leftEnabled={hasAnyItems}
        rightEnabled={hasAnyItems}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: '#FFFFFF', flex: 1 },
  contentContainer: { paddingBottom: 120 },
  tableHeader: { marginBottom: 10, marginTop: 8 },
  lineItemWrapper: { marginBottom: 12 },
});

export default NewReceiveScreen;
