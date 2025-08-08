import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import GlobalHeaderComponent from '../components/GlobalHeaderComponent';
import POinfoCardComponent from '../components/POinfoCardComponent';
import ConfirmLineItemComponent from '../components/ConfirmLineItemComponent';
import FooterButtonsComponent from '../components/FooterButtonsComponent';
import SummaryTabHdrComponent from '../components/SummaryTabHdrComponent';

const dummyItems = [
  { id: '1', name: 'Lorem Ipsumum', orderedQty: 10, receivedQty: 5, openQty: 5, uom: 'Each', promisedDate: '22 Jul 2025', needByDate: '24 Jul 2025' },
  { id: '2', name: 'Dolor Sit Item', orderedQty: 14, receivedQty: 1, openQty: 3, uom: 'Each', promisedDate: '23 Jul 2025', needByDate: '25 Jul 2025' },
  { id: '3', name: 'Dolor Item', orderedQty: 12, receivedQty: 1, openQty: 7, uom: 'Each', promisedDate: '23 Jul 2025', needByDate: '25 Jul 2025' },
];

const ReceiveSummaryScreen = () => {
  const navigation = useNavigation();
  const [items, setItems] = useState(
    dummyItems.map(item => ({ ...item, qtyToReceive: item.qtyToReceive ?? 0 }))
  );

  const handleQtyChange = (id, newQty) => {
    setItems(prev =>
      prev.map(item => (item.id === id ? { ...item, qtyToReceive: newQty } : item))
    );
  };

  const goToReceive = () => navigation.navigate('receive');

  return (
    <SafeAreaView style={styles.container}>
      <GlobalHeaderComponent
        title="Receive Summary"
        greetingName="Robert"
        dateText="06-08-2025"
        onBack={() => navigation.goBack()}
        onMenu={() => {}}
      />
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <POinfoCardComponent
          receiptNumber="12300002"
          supplier="3DIng"
          poNumber="PO-00002"
          receiptDate="21 Jul 2025"
        />
        <View style={styles.tableHeader}>
          <SummaryTabHdrComponent />
        </View>
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.lineItemWrapper}>
              <ConfirmLineItemComponent
                item={item}
                isSelected={false}
                onCheckToggle={() => {}}
                onQtyChange={handleQtyChange}
              />
            </View>
          )}
          scrollEnabled={false}
        />
      </ScrollView>
      <FooterButtonsComponent
        leftLabel="Save"
        rightLabel="Confirm"
        onLeftPress={goToReceive}
        onRightPress={goToReceive}
        leftEnabled={true}
        rightEnabled={true}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  contentContainer: { paddingBottom: 120 },
  tableHeader: { marginTop: 8, marginBottom: 10 },
  lineItemWrapper: { marginBottom: 12 },
});

export default ReceiveSummaryScreen;
