import React, { useMemo, useState } from 'react';
import { useNavigation, useRoute, StackActions, useFocusEffect } from '@react-navigation/native';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, SafeAreaView, ScrollView, Dimensions } from 'react-native';
import Toast from 'react-native-toast-message';
import GlobalHeaderComponent from '../../components/GlobalHeaderComponent';
import SearchIcon from '../../assets/icons/search_receivelist.svg';
import { MOCK_SHIPPING_DATA } from '../../data/shippingMockData';
import Ship_ConfirmModalComponent from '../../components/shipping/Ship_ConfirmModalComponent';

const BRAND_BG = '#233E55';
const NAV_BG = '#5D768B';
const LABEL_COLOR = '#9D9FA3';
const VALUE_COLOR = '#595A5C';
const CARD_BG = '#FFFFFF';
const COPIES_BG = '#ECF1F7';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BASE_WIDTH = 375;
const scale = size => (SCREEN_WIDTH / BASE_WIDTH) * size;
const ms = (size, factor = 0.35) => size + (scale(size) - size) * factor;
 

export default function Ship_LabelPrintListScreen() {
    const navigation = useNavigation();
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const data = MOCK_SHIPPING_DATA?.labelPrintList || [];

  const filteredData = useMemo(() => {
    const q = String(searchText || '').trim().toLowerCase();
    if (!q) return data;

    return data.filter(it => {
      const hay = [
        it.deliveryId,
        it.salesOrderNo,
        it.pickSlipNo,
        it.customerName,
        it.carrier,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return hay.includes(q);
    });
  }, [data, searchText]);

  const handleBack = () => {navigation.goBack()};

  const handleLabelPrint = () => {
    setModalVisible(true);
    Toast.show({
      type: 'success',
      text1: 'Label printing',
    });
  };

  const handleCancel = () => {
    setModalVisible(false);
  };

  const renderCard = ({ item }) => {
    return (
      <View style={styles.card}>
        <View style={styles.gridRow}>
          <View style={styles.col}>
            <Text style={styles.label}>Delivery ID</Text>
            <Text style={styles.value}>{item.deliveryId}</Text>
          </View>

          <View style={styles.col}>
            <Text style={styles.label}>Sales Order NO</Text>
            <Text style={styles.value}>{item.salesOrderNo}</Text>
          </View>

          <View style={styles.col}>
            <Text style={styles.label}>Pick Slip No</Text>
            <Text style={styles.value}>{item.pickSlipNo}</Text>
          </View>
        </View>

        <View style={[styles.gridRow, { marginTop: ms(14) }]}>
          <View style={styles.col}>
            <Text style={styles.label}>Customer Name</Text>
            <Text style={styles.value}>{item.customerName}</Text>
          </View>

          <View style={styles.col}>
            <Text style={styles.label}>Carrier</Text>
            <Text style={styles.value}>{item.carrier}</Text>
          </View>

          <View style={styles.col}>
            <Text style={styles.label}>Total Lines/Qty</Text>
            <Text style={styles.value}>{item.totalLinesQty}</Text>
          </View>
        </View>

        <View style={styles.copiesRow}>
          <Text style={styles.copiesLabel}>No. Of Copies</Text>
          <Text style={styles.copiesValue}>{String(item.noOfCopies ?? 0)}</Text>
        </View>

        <TouchableOpacity activeOpacity={0.9} onPress={handleLabelPrint} style={styles.printBtn}>
          <Text style={styles.printBtnText}>Label Print</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <GlobalHeaderComponent screenTitle="Label Printing" onBack={handleBack} />

      <ScrollView contentContainerStyle={styles.contentContainer}>
      <View style={styles.searchWrap}>
        <TextInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search"
          placeholderTextColor="#9AA3AB"
          style={styles.searchInput}
          returnKeyType="search"
        />
        <View style={styles.searchIconWrap}>
          <SearchIcon width={ms(18)} height={ms(18)} />
        </View>
      </View>

      <FlatList
        data={filteredData}
        keyExtractor={item => String(item.id)}
        renderItem={renderCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />
      </ScrollView>
      <Ship_ConfirmModalComponent
            visible={modalVisible}
            title=""
            message="Are you sure want to Print this Label?"
            confirmAction={handleLabelPrint}
            onCancel={handleCancel}            
          />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F8FA' },

  searchWrap: {
    marginTop: ms(16),
    marginHorizontal: ms(16),
    height: ms(40),
    borderRadius: ms(8),
    borderWidth: 1,
    borderColor: '#D9E4EE',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: ms(14),
    paddingRight: ms(10),
  },
  searchInput: {
    flex: 1,
    fontSize: ms(14),
    color: '#2B2B2B',
    paddingVertical: 0,
  },
  searchIconWrap: {
    width: ms(28),
    alignItems: 'flex-end',
    justifyContent: 'center',
  },

  listContent: {
    paddingHorizontal: ms(16),
    paddingTop: ms(14),
    paddingBottom: ms(22),
  },

  card: {
    backgroundColor: CARD_BG,
    borderRadius: ms(12),
    paddingTop: ms(16),
    paddingHorizontal: ms(14),
    paddingBottom: ms(0),
    marginBottom: ms(18),
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },

  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    columnGap: ms(10),
  },
  col: {
    flex: 1,
  },
  label: {
    color: LABEL_COLOR,
    fontSize: ms(12),
    fontWeight: '500',
  },
  value: {
    marginTop: ms(4),
    color: VALUE_COLOR,
    fontSize: ms(16),
    fontWeight: '700',
  },

  copiesRow: {
    marginTop: ms(16),
    backgroundColor: COPIES_BG,
    borderRadius: ms(8),
    paddingVertical: ms(10),
    paddingHorizontal: ms(10),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  copiesLabel: {
    color: VALUE_COLOR,
    fontSize: ms(14),
    fontWeight: '700',
  },
  copiesValue: {
    color: VALUE_COLOR,
    fontSize: ms(14),
    fontWeight: '700',
  },

  printBtn: {
    marginTop: ms(14),
    marginRight: ms(-14),
    marginLeft: ms(-14),
    backgroundColor: BRAND_BG,
    borderBottomLeftRadius: ms(12),
    borderBottomRightRadius: ms(12),
    paddingVertical: ms(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  printBtnText: {
    color: '#FFFFFF',
    fontSize: ms(16),
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});
