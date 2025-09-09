import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import GlobalHeaderComponent from '../components/GlobalHeaderComponent';
import FooterButtonsComponent from '../components/FooterButtonsComponent';
import ASNinfoCardComponent from '../components/ASNinfoCardComponent';
import ASNListCardComponent from '../components/Asnlistcardcomponent';
import AsnHeaderComponent from '../components/AsnTableHeader';
import { useNavigation, useRoute } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { GetASNPoItems } from '../api/ApiServices';
import { useReceivingStore } from '../store/receivingStore';
import BarcodeScannerIcon from '../assets/icons/barcodescanner.svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BASE_WIDTH = 375;
const s = (n) => (SCREEN_WIDTH / BASE_WIDTH) * n;
const fs = (n, f = 0.35) => n + (s(n) - n) * f;

const AsnReceiptScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [selectedTab] = useState('podetails');
  const [selectedItems, setSelectedItems] = useState([]);
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('all');

  const fromScan = !!route?.params?.fromScan;
  const scannedAsnNumber = route?.params?.scannedAsnNumber ?? null;
  const selectedASN = route?.params?.selectedASN;
  const scannedAsnId = route?.params?.scannedAsnId;

  const [forceScanRow, setForceScanRow] = useState(false);
  const selectedPO = route?.params?.selectedPO || null;
  const { OrgData } = useReceivingStore();

  useEffect(() => {
    if (fromScan && scannedAsnNumber) {
      Toast.show({ type: 'success', text1: `Scanned ASN number is ${scannedAsnNumber}`, position: 'top', visibilityTime: 1500 });
    }
    const loadData = async () => {
      try {
        const asn_data = await GetASNPoItems(selectedASN.asn_id);
        if (Array.isArray(asn_data) && asn_data.length) {
          const normalized = asn_data.map((el, idx) => {
            const li = Array.isArray(el.asn_line_items) ? el.asn_line_items[0] : el.asn_line_items;
            return {
              id: String(el.asn_ln_id ?? idx + 1),
              Poid: li?.item_code ?? '-',
              status: 'Yet to Receive',
              orderedByDate: li?.shipped_date ?? '-',
              asn_ln_id: el.asn_ln_id,
              asn_ln_num: el.asn_ln_num,
              po_id: el.po_id,
              po_number: el.po_number,
              next_receipt_num: el.next_receipt_num,
              line_item: li
            };
          });
          setItems(normalized);
        }
      } catch (err) {
        console.error('Error loading user data:', err);
      }
    };
    loadData();
  }, [fromScan, scannedAsnNumber, selectedASN?.asn_id]);

  const visibleItems = useMemo(() => {
    if (!Array.isArray(items) || !items.length) return [];
    if (filter === 'all') return items;
    if (filter === 'received') {
      return items.filter((it) => {
        const r = Number(it?.line_item?.rcvd_qty ?? 0);
        const o = Number(it?.line_item?.ordered_qty ?? 0);
        return r >= o && o > 0;
      });
    }
    if (filter === 'pending') {
      return items.filter((it) => {
        const r = Number(it?.line_item?.rcvd_qty ?? 0);
        const o = Number(it?.line_item?.ordered_qty ?? 0);
        return r > 0 && r < o;
      });
    }
    return items;
  }, [items, filter]);

  const allSelectedVisible = useMemo(() => {
    if (visibleItems.length === 0) return false;
    return visibleItems.every((i) => selectedItems.includes(i.id));
  }, [visibleItems, selectedItems]);

  const handleCheckToggle = (item) => {
    const isChecked = selectedItems.includes(item.id);
    const newSelected = isChecked ? selectedItems.filter((id) => id !== item.id) : [...selectedItems, item.id];
    setSelectedItems(newSelected);
    setItems((prev) =>
      prev.map((it) =>
        it.id === item.id
          ? !isChecked
            ? { ...it, status: 'Receive In progress' }
            : { ...it, status: 'Yet to Receive' }
          : { ...it }
      )
    );
  };

  const handleSave = () => {
    console.log('Saved:', items);
  };

  const handleReceive = (items) => {
    navigation.navigate('podetailsummary', {selectedASN: selectedItems,
        fromScan: false,
        scannedAsnId:items.asn_id,
        scannedAsnNumber: items.asn_num, });
  };

  const isReceiveEnabled = selectedItems.length > 0;

  const handleScanRowPress = () => {
    setForceScanRow(false);
  };

  const toggleAllVisible = () => {
    const visIds = visibleItems.map((i) => i.id);
    const shouldSelectAll = !allSelectedVisible;
    if (shouldSelectAll) {
      const merged = Array.from(new Set([...selectedItems, ...visIds]));
      setSelectedItems(merged);
      setItems((prev) => prev.map((it) => (visIds.includes(it.id) ? { ...it, status: 'Receive In progress' } : it)));
    } else {
      const remaining = selectedItems.filter((id) => !visIds.includes(id));
      setSelectedItems(remaining);
      setItems((prev) => prev.map((it) => (visIds.includes(it.id) ? { ...it, status: 'Yet to Receive' } : it)));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <GlobalHeaderComponent
        organizationName={OrgData?.selectedOrgCode}
        screenTitle="Receive"
        contextInfo={selectedASN.asn_num}
        notificationCount={0}
        onBack={() => navigation.goBack()}
        onMenu={() => {}}
        onNotificationPress={() => navigation.navigate('Home')}
        onProfilePress={() => navigation.navigate('Home')}
      />

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <ASNinfoCardComponent
          receiptNumber={selectedASN?.receiptNumber || '-'}
          supplier={selectedASN?.supplier_name || '-'}
          asnnumber={selectedASN?.asn_num || '-'}
          shippeddate={selectedASN?.shipped_date || '-'}
        />

        <View style={styles.itemcontainer}>
          <TouchableOpacity style={styles.scanRow} onPress={handleScanRowPress} activeOpacity={0.8}>
            <Text style={styles.scanText}>Scan your item</Text>
            <BarcodeScannerIcon width={20} height={20} fill="#7A7A7A" />
          </TouchableOpacity>

          <View style={styles.tableHeader}>
            <AsnHeaderComponent
              allSelected={allSelectedVisible}
              onToggleAll={toggleAllVisible}
              activeFilter={filter}
              onChangeFilter={setFilter}
            />
          </View>

          <FlatList
            data={visibleItems}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.lineItemWrapper}>
                <ASNListCardComponent item={item} isSelected={selectedItems.includes(item.id)} onCheckToggle={handleCheckToggle} />
              </View>
            )}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>

      <FooterButtonsComponent onSave={handleSave} onReceive={handleReceive} isReceiveEnabled={isReceiveEnabled} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  contentContainer: { paddingBottom: 120 },
  tableHeader: { marginTop: 8, marginBottom: 10, zIndex: 5 },
  lineItemWrapper: { marginBottom: 12, zIndex: 1, elevation: 1 },
  scanRow: {
    backgroundColor: '#FFFFFF',
    borderColor: '#00000040',
    borderWidth: 1,
    borderRadius: 10,
    height: 40,
    marginHorizontal: 15,
    marginTop: 5,
    marginBottom: 5,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  scanText: { color: '#777' },
  itemcontainer: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 12,
    paddingTop: 8,
    paddingBottom: 6,
    elevation: 2,
    overflow: 'visible'
  }
});

export default AsnReceiptScreen;
