import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, FlatList, SafeAreaView, Alert } from 'react-native';
import NavHeaderComponent from '../components/NavHeaderComponent';
import FooterButtonsComponent from '../components/FooterButtonsComponent';
import AsnToggleComponent from '../components/AsnTogglecomponent';
import ASNinfoCardComponent from '../components/ASNinfoCardComponent';
import ASNListCardComponent from '../components/Asnlistcardcomponent';
import AsnHeaderComponent from '../components/AsnTableHeader';
import { useNavigation, useRoute } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { GetASNPoItems } from '../api/ApiServices';
const dummyItems = [
  {
    id: '1',
    Poid: 'PO - 001',
    status: 'Yet to Receive',
    orderedByDate: '20 Jul 2025',
  },
   {
    id: '2',
    Poid: 'PO - 002',
    status: 'Yet to Receive',
    orderedByDate: '22 Jul 2025',
  },
  {
    id: '3',
    Poid: 'PO - 003',
    status: 'Yet to Receive',
    orderedByDate: '24 Jul 2025',
  },
];

const AsnReceiptScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [selectedTab, setSelectedTab] = useState('podetails');
  const [selectedItems, setSelectedItems] = useState([]);
  const [items, setItems] = useState([]);

    const fromScan = !!route?.params?.fromScan;
    const scannedAsnNumber = route?.params?.scannedAsnNumber ?? null;
    const selectedASN = route?.params?.selectedASN;
    const scannedAsnId = route?.params?.scannedAsnId;
  
    useEffect(() => {
      if (fromScan && scannedAsnNumber) {
        Toast.show({ type: 'success', text1: `Scanned ASN number is ${scannedAsnNumber}`, position: 'top', visibilityTime: 1500 });
      }
        const loadData = async () => {
              try {
                const asn_data = await GetASNPoItems(scannedAsnId);
                console.log(asn_data,"asn_data")
                if(asn_data!=undefined&&asn_data.length!=0){
                asn_data.forEach((element,index) => {
                  element["id"] = index+1;
                  element["Poid"] = element.po_number;
                  element["status"] = "Yet to Receive";
                  element["orderedByDate"] = "2025-06-10";
                });
                setItems(asn_data.map(item => ({ ...item })));
              }
                // setAsnData(userdata);
                // setAsnIntialData(userdata);
                console.log(userdata, "usereejebu");
              } catch (err) {
                console.error("Error loading user data:", err);
              }
            };  
            loadData();
    }, [fromScan, scannedAsnNumber]);

  const handleCheckToggle = (item) => {
    console.log(item,"coming insideeee")
    const isChecked = selectedItems.includes(item.id);
    const newSelected = isChecked
      ? selectedItems.filter(id => id !== item.id)
      : [...selectedItems, item.id];

    setSelectedItems(newSelected);

    setItems(prev =>
      prev.map(it =>
        it.id === item.id
          ?!isChecked? {
              ...it,
              status: 'Receive In progress', // ✅ use openQty here
            }
          : {
              ...it,
              status: 'Yet to Receive', // ✅ use openQty here
            }
            :{
              ...it
            }
          )
    );
    console.log(items,"Itemsafterchanged");
  };

  const handleSave = () => {
    console.log('Saved:', items);
  };

  const handleReceive = () => {
    // console.log('Received:', items.filter(i => selectedItems.includes(i.id)));
    navigation.navigate('podetailsummary');
  };

  const isReceiveEnabled = selectedItems.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <NavHeaderComponent />

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <ASNinfoCardComponent
          receiptNumber={selectedASN?.asn_num || '-'}
          supplier={selectedASN?.supplier_name || '-'}
          asnnumber={selectedASN?.asn_num || '-'}
          shippeddate={selectedASN?.shipped_date || '-'}
        />

        <AsnToggleComponent
          selectedTab={selectedTab}
          onSelectTab={setSelectedTab}
        />

        <View style={styles.tableHeader}>
          <AsnHeaderComponent
            allSelected={selectedItems.length === items.length}
            onToggleAll={() => {
              const allIds = items.map(i => i.id);
              const shouldSelectAll = selectedItems.length !== items.length;
              setSelectedItems(shouldSelectAll ? allIds : []);
                  setItems(prev =>
      prev.map(it =>
          shouldSelectAll? {
              ...it,
              status: 'Receive In progress', // ✅ use openQty here
            }
          : {
              ...it,
              status: 'Yet to Receive', // ✅ use openQty here
            }
          )
    );
            }}
          />
        </View>

        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.lineItemWrapper}>
              <ASNListCardComponent
                item={item}
                isSelected={selectedItems.includes(item.id)}
                onCheckToggle={handleCheckToggle}
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

export default AsnReceiptScreen;
