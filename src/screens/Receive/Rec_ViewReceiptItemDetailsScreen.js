import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

import GlobalHeaderComponent from '../../components/GlobalHeaderComponent';
import FooterButtonsComponent from '../../components/FooterButtonsComponent';
import PencilDropdownRow from '../../components/PencilDropdownRow';
import SuccessModal from '../../components/SuccessModal';

import { useReceivingStore } from '../../store/receivingStore';

// Import tab icons
import ReceiveTabIcon from '../../assets/icons/receivetabicon.svg';
import InspectTabIcon from '../../assets/icons/inspecttabicon.svg';
import PutAwayTabIcon from '../../assets/icons/putawaytabicon.svg';
import SelectedReceiveTabIcon from '../../assets/icons/selectedreceivetabicon.svg';
import ReceiveQtyIcon from '../../assets/icons/receiveqtyicon.svg';
import ReceiveLocationIcon from '../../assets/icons/receivelocationicon.svg';
import ReceiveItemBoxIcon from '../../assets/icons/receiveitemboxicon.svg';
import ReceiveDetailsIcon from '../../assets/icons/receivedetailsicon.svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const Rec_ViewReceiptItemDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const readOnly = true;
  const receiptNumber = route?.params?.receiptNumber || null;
  const items = route?.params?.items || [];
  const startIndex = route?.params?.startIndex || 0;

  const { InventoryList, OrgData, receiveItems } = useReceivingStore();

  const [index, setIndex] = useState(startIndex);
  const [activeTab, setActiveTab] = useState('Receive');
  const [edited, setEdited] = useState({});
  const [successVisible, setSuccessVisible] = useState(false);

  const listRef = useRef(null);

  const currentItem = items[index];

  useEffect(() => {
    if (!currentItem) return;

    const storedItem = Array.isArray(receiveItems)
      ? receiveItems.find(r =>
        String(r.id) === String(currentItem.id) ||
        String(r.po_line_id) === String(currentItem.po_line_id) ||
        String(r.item_id) === String(currentItem.itemid)
      )
      : undefined;

    const routeItem = items.find(item =>
      String(item.id) === String(currentItem.id) ||
      String(item.po_line_id) === String(currentItem.po_line_id) ||
      String(item.item_id) === String(currentItem.itemid)
    );

    setEdited((prev) => {
      const existing = prev[currentItem.id];
      if (existing) return prev;

      return {
        ...prev,
        [currentItem.id]: {
          receivingQty: storedItem?.qtyToReceive || storedItem?.receivingQty || routeItem?.receivingQty || 0,
          lpn: storedItem?.lpn || routeItem?.lpn || '',
          subInventory: storedItem?.subInventory || routeItem?.subInventory || OrgData?.selectedinventory || '',
          locator: storedItem?.locator || routeItem?.locator || '',
          po_line_id: storedItem?.po_line_id || routeItem?.po_line_id || currentItem.po_line_id,
          item_id: storedItem?.item_id || routeItem?.item_id || currentItem.itemid,
        },
      };
    });
  }, [currentItem, receiveItems, items, OrgData]);

  const renderPage = ({ item }) => {
    const state = edited[item.id] || {};

    const openQty = item.openQty || item.max_open_qty || item.orderQty || 100;
    const orderQty = item.orderQty || item.orderqty || 100;
    const receivingQty = state.receivingQty || item.receivingQty || 0;
    const lpn = state.lpn || item.lpn || '';
    const subInventory = state.subInventory || item.subInventory || OrgData?.selectedinventory || '';
    const locator = state.locator || item.locator || '';

    return (
      <ScrollView style={{ width: SCREEN_WIDTH }} contentContainerStyle={styles.page}>
        <View style={styles.whiteCard}>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'Receive' && styles.activeTab]}
              onPress={() => setActiveTab('Receive')}
            >
              {activeTab === 'Receive' ? (
                <SelectedReceiveTabIcon width={18} height={18} />
              ) : (
                <ReceiveTabIcon width={18} height={18} />
              )}
              <Text style={[styles.tabText, activeTab === 'Receive' && styles.activeTabText]}>
                Receive
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, styles.disabledTab]}
              disabled
            >
              <InspectTabIcon width={18} height={18} />
              <Text style={[styles.tabText, styles.disabledTabText]}>
                Inspect
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, styles.disabledTab]}
              disabled
            >
              <PutAwayTabIcon width={18} height={18} />
              <Text style={[styles.tabText, styles.disabledTabText]}>
                Put Away
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.itemHeader}>
            <View style={styles.iconCircle}>
              <ReceiveItemBoxIcon width={20} height={20} />
            </View>
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.itemTitle}>Item {index + 1}</Text>
              <Text style={styles.sku}>{item.itemid || item.item_id || '—'}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {activeTab === 'Receive' && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <ReceiveQtyIcon width={18} height={18} />
                <Text style={styles.sectionTitle}>Quantity Overview</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Order Quantity</Text>
                <Text style={styles.value}>
                  {orderQty} <Text style={styles.uom}>/ Each</Text>
                </Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Receiving Quantity</Text>
                <Text style={styles.value}>
                  {receivingQty} <Text style={styles.uom}>Each</Text>
                </Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.shipLocationRow}>
            <View style={styles.shipLocationLeft}>
              <ReceiveLocationIcon width={18} height={18} />
              <Text style={styles.shipLocationLabel}>Ship-To Location</Text>
            </View>
            <Text style={styles.shipLocationValue}>
              {item.ship_to_location || '—'}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <ReceiveDetailsIcon width={18} height={18} />
            <Text style={styles.cardTitle}>Receiving Details</Text>
          </View>

          <View style={styles.formRow}>
            <Text style={styles.formLabel}>LPN*</Text>
            <View style={styles.readOnlyField}>
              <Text style={styles.readOnlyText}>{lpn || '—'}</Text>
            </View>
          </View>

          <View style={styles.halfHalfRow}>
            <View style={styles.halfColumn}>
              <Text style={styles.formLabel}>Sub Inventory*</Text>
              <View style={styles.readOnlyField}>
                <Text style={styles.readOnlyText}>{subInventory || '—'}</Text>
              </View>
            </View>

            <View style={styles.halfColumn}>
              <Text style={styles.formLabel}>Locator*</Text>
              <View style={styles.readOnlyField}>
                <Text style={styles.readOnlyText}>{locator || '—'}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <GlobalHeaderComponent
        organizationName={OrgData?.selectedOrgCode}
        screenTitle="Receiving"
        contextInfo={receiptNumber}
        onBack={() => navigation.goBack()}
      />

      <View style={styles.navBar}>
        <TouchableOpacity
          disabled={index === 0}
          onPress={() => setIndex(index - 1)}
          style={styles.navButton}
        >
          <ChevronLeft size={22} color={index === 0 ? '#C8D0D6' : '#233E55'} />
        </TouchableOpacity>

        <Text style={styles.navText}>Line Item {index + 1}</Text>

        <TouchableOpacity
          disabled={index === items.length - 1}
          onPress={() => setIndex(index + 1)}
          style={styles.navButton}
        >
          <ChevronRight size={22} color={index === items.length - 1 ? '#C8D0D6' : '#233E55'} />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={listRef}
        data={items}
        horizontal
        pagingEnabled
        renderItem={renderPage}
        keyExtractor={(i, idx) => String(i.id || idx)}
        showsHorizontalScrollIndicator={false}
      />

      {readOnly && (
        <FooterButtonsComponent
          leftLabel="Back"
          onLeftPress={() => navigation.goBack()}
          rightLabel=""
          onRightPress={() => { }}
          rightEnabled={false}
        />
      )}

      <SuccessModal
        visible={successVisible}
        message="Saved Successfully"
        onDismiss={() => setSuccessVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F8FA',
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 18,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  navButton: {
    padding: 8,
  },
  navText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#233E55',
  },
  page: {
    paddingBottom: 100,
    paddingHorizontal: 16,
  },
  whiteCard: {
    width: 378,
    minHeight: 312,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 4,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#233E55',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  disabledTab: {
    opacity: 0.5,
  },
  disabledTabText: {
    color: '#9CA3AF',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF3FF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  iconCircle: {
    width: 44,
    height: 36,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#233E55',
    marginBottom: 2,
  },
  sku: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  section: {
    marginBottom: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#242424',
    marginLeft: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E7EB',
  },
  label: {
    fontSize: 12,
    color: '#6C6C6C',
    flex: 1,
  },
  value: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'right',
  },
  uom: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
  },
  card: {
    width: 378,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginTop: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#242424',
    marginLeft: 8,
  },
  shipLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  shipLocationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shipLocationLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6C6C6C',
    marginLeft: 8,
  },
  shipLocationValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  formRow: {
    marginBottom: 16,
  },
  halfHalfRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfColumn: {
    width: '48%',
  },
  formLabel: {
    fontSize: 12,
    color: '#6C6C6C',
    marginBottom: 8,
    fontWeight: '600',
  },
  readOnlyField: {
    height: 38,
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  readOnlyText: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
});

export default Rec_ViewReceiptItemDetailsScreen;