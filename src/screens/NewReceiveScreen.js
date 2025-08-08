import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import GlobalHeaderComponent from '../components/GlobalHeaderComponent';
import POinfoCardComponent from '../components/POinfoCardComponent';
import ToggleTabsComponent from '../components/ToggleTabsComponent';
import LineItemListCardComponent from '../components/LineItemListCardComponent';
import FooterButtonsComponent from '../components/FooterButtonsComponent';
import TableHeaderComponent from '../components/TableHeaderComponent';
import { useNavigation } from '@react-navigation/native';

const dummyItems = [
  {
    id: '1',
    name: 'Lorem Ipsumum',
    orderedQty: 10,
    receivedQty: 5,
    openQty: 5,
    uom: 'Each',
    promisedDate: '22 Jul 2025',
    needByDate: '24 Jul 2025',
  },
  {
    id: '2',
    name: 'Dolor Sit Item',
    orderedQty: 14,
    receivedQty: 1,
    openQty: 3,
    uom: 'Each',
    promisedDate: '23 Jul 2025',
    needByDate: '25 Jul 2025',
  },
  {
    id: '3',
    name: 'Dolor Item',
    orderedQty: 12,
    receivedQty: 1,
    openQty: 7,
    uom: 'Each',
    promisedDate: '23 Jul 2025',
    needByDate: '25 Jul 2025',
  },
];

const NewReceiveScreen = () => {
  const navigation = useNavigation();
  const [selectedTab, setSelectedTab] = useState('lineItems');
  const [selectedItems, setSelectedItems] = useState([]);
  const [items, setItems] = useState(dummyItems.map(item => ({ ...item, qtyToReceive: 0 })));

  const handleCheckToggle = (item) => {
    const isChecked = selectedItems.includes(item.id);
    const newSelected = isChecked
      ? selectedItems.filter(id => id !== item.id)
      : [...selectedItems, item.id];

    setSelectedItems(newSelected);

    setItems(prev =>
      prev.map(it =>
        it.id === item.id
          ? {
              ...it,
              qtyToReceive: isChecked ? 0 : item.openQty, // ✅ use openQty here
            }
          : it
      )
    );
  };

  const handleQtyChange = (id, newQty) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, qtyToReceive: newQty } : item
      )
    );
  };

  const handleSave = () => {
    console.log('Saved:', items);
  };

  const handleReceive = () => {
    console.log('Received:', items.filter(i => selectedItems.includes(i.id)));
  };

  const isReceiveEnabled = selectedItems.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <GlobalHeaderComponent
       title="Receive"
       greetingName="Robert"
       dateText="06-08-2025"
       onBack={() => navigation.goBack()}
       onMenu={() => console.log('Menu pressed')}
     />

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <POinfoCardComponent
          receiptNumber="12300002"
          supplier="3DIng"
          poNumber="PO-00002"
          receiptDate="21 Jul 2025"
        />

        <ToggleTabsComponent
          selectedTab={selectedTab}
          onSelectTab={setSelectedTab}
        />

        <View style={styles.tableHeader}>
          <TableHeaderComponent
            allSelected={selectedItems.length === items.length}
            onToggleAll={() => {
              const allIds = items.map(i => i.id);
              const shouldSelectAll = selectedItems.length !== items.length;
              setSelectedItems(shouldSelectAll ? allIds : []);
              setItems(prev =>
                prev.map(it => ({
                  ...it,
                  qtyToReceive: shouldSelectAll ? it.openQty : 0, // ✅ also fixed here
                }))
              );
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
      </ScrollView>

      <FooterButtonsComponent
        onSave={handleSave}
        onReceive={handleReceive}
        isReceiveEnabled={isReceiveEnabled}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    paddingBottom: 120,
  },
  tableHeader: {
    marginTop: 8,
    marginBottom:10,
  },
  lineItemWrapper: {
    marginBottom: 12,
  },
});

export default NewReceiveScreen;
