import React, { useEffect, useMemo, useState, useCallback, memo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import GlobalHeaderComponent from '../components/GlobalHeaderComponent';
import ASNinfoCardComponent from '../components/ASNinfoCardComponent';
import { useReceivingStore } from '../store/receivingStore';
import { GetReceivedASNPoItems } from '../api/ApiServices';
import UpArrowIcon from '../assets/icons/uparrow.svg';
import DownArrowIcon from '../assets/icons/downarrow.svg';

const dash = '—';
const n = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);
const sumBy = (arr, key) => arr.reduce((a, x) => a + n(x?.[key]), 0);
const hasAny = (arr, key) => arr.some((x) => x?.[key] != null && Number.isFinite(Number(x?.[key])));

const HeaderBlock = memo(({ header }) => (
  <ASNinfoCardComponent
    receiptNumber={header?.receipt_num || dash}
    supplier={header?.supplier_name || dash}
    asnnumber={header?.asn_num || dash}
    shippeddate={header?.shipped_date || dash}
    exprcteddate={header?.expected_receipt_date || dash}
    supplierSite={header?.supplier_site || dash}
    carrier={header?.carrier}
    packSlip={header?.pack_slip}
    bol={header?.bol}
    waybill={header?.waybill}
    airbill={header?.airbill}
  />
));

const POCard = memo(({ item, expanded, onToggle, header }) => {
  const poNumber = String(item?.po_number ?? dash);
  const lines = Array.isArray(item?.asn_line_items) ? item.asn_line_items : [];
  const orderedTot = sumBy(lines, 'ordered_qty') || sumBy(lines, 'ord_qty');
  const receivedTot = sumBy(lines, 'rcvd_qty');
  const shippedTot = item?.total_shipped_qty ?? dash;
  const isOpen = !!expanded;
  const navigation = useNavigation();

  const mapLine = (li, i) => ({
    id: String(li?.po_line_id ?? li?.id ?? i),
    poNumber: poNumber,
    lineNumber: i + 1,
    itemName: li?.item?.item_code ?? li?.item_name ?? li?.item_code ?? '—',
    itemid: String(li?.item_id ?? li?.item?.item_id ?? ''),
    itemDescription: li?.item_description ?? li?.item?.description ?? '—',
    orderQty: n(li?.ordered_qty ?? li?.ord_qty),
    openQty: Math.max(n(li?.max_open_qty ?? li?.open_qty), 0),
    ship_to_location: li?.ship_to_location ?? '—',
    receivingQty: n(li?.rcvd_qty),      // Received view -> read-only qty
    receivedQty: n(li?.rcvd_qty),
    receivingStatus: li?.line_status ?? li?.status ?? '',
    lpn: li?.lpn ?? '',
    uom: li?.item?.uom,
    sub_inv_name: li?.sub_inv_name ?? li?.subInventory ?? '',
    locator_name: li?.locator_name ?? li?.locator ?? '',
    subInventory: li?.subInventory ?? '',
    locator: li?.locator ?? '',
  });

  const openLineDetailsFromSummary = (startIndex) => {
    const mapped = lines.map(mapLine);
    console.log(mapped,"mapped data")
    navigation.navigate('ASNPOLineItemDetails', {
      items: mapped,
      startIndex,
      readonly: true,
      returnTo: 'AsnReceivedScreen',
      listType: 'received',
      receiptNumber: header?.receipt_num ?? '',
    });
  };

  return (
    <View style={styles.cardElevatedContainer}>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.poNumber}>{poNumber}</Text>
          <View style={styles.qtyRow}>
            <Text style={styles.qtyHeader}>
              Ordered Qty{'\n'}
              <Text style={styles.qtyValue}>{orderedTot}</Text>
            </Text>
            <Text style={styles.qtyHeader}>
              Received Qty{'\n'}
              <Text style={styles.qtyValue}>{receivedTot}</Text>
            </Text>
            <Text style={styles.qtyHeader}>
              Shipped Qty{'\n'}
              <Text style={styles.qtyValue}>{shippedTot == null ? dash : shippedTot}</Text>
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.viewButton} onPress={() => onToggle(poNumber)} activeOpacity={0.8}>
          <Text style={styles.viewButtonText}>View Items</Text>
          {isOpen ? <UpArrowIcon style={styles.caretIcon} /> : <DownArrowIcon style={styles.caretIcon} />}
        </TouchableOpacity>

        {isOpen && (
          <View style={styles.itemsContainer}>
            <View style={styles.itemsHeader}>
              <Text style={[styles.itemsHeaderText, styles.colItem]}>List of Items</Text>
              <Text style={[styles.itemsHeaderText, styles.colOrdered]}>Ordered Qty</Text>
              <Text style={[styles.itemsHeaderText, styles.colReceiving]}>Receiving Qty</Text>
            </View>

            {lines.map((li, idx) => (
              <View key={`${poNumber}-${idx}`} style={[styles.itemRow, idx === lines.length - 1 && styles.itemRowLast]}>
                <TouchableOpacity style={styles.colItem} onPress={() => openLineDetailsFromSummary(idx)}>
                  <Text style={styles.viewDetails} numberOfLines={1}>
                    {li?.item?.item_code ?? li?.item_code ?? dash}
                  </Text>
                </TouchableOpacity>

                <Text style={[styles.itemText, styles.colOrdered]}>{n(li?.ordered_qty ?? li?.ord_qty)}</Text>
                <Text style={[styles.itemTextStrong, styles.colReceiving]}>{n(li?.rcvd_qty)}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
});

const AsnReceivedScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { OrgData } = useReceivingStore();

  const asn_id = route?.params?.asn_id;
  const header = route?.params?.header || {};

  const [phase, setPhase] = useState('loading');
  const [poGroups, setPoGroups] = useState([]);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    const load = async () => {
      try {
        const data = await GetReceivedASNPoItems(header.receipt_id,asn_id);
        setPoGroups(Array.isArray(data) ? data : []);
        setPhase('success');
      } catch {
        setPhase('error');
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to load ASN receipt details',
          position: 'top',
          visibilityTime: 4000,
        });
      }
    };
    if (asn_id) load();
  }, [asn_id, header?.receipt_id]);

  const onToggle = useCallback((poNumber) => {
    setExpanded((prev) => ({ ...prev, [poNumber]: !prev[poNumber] }));
  }, []);

  const sectionData = useMemo(() => ['section'], []);
  const listHeader = useMemo(() => <HeaderBlock header={header} />, [header]);

  const renderSection = useCallback(
    () => (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>PO Detailed Summary</Text>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionLeft}>
            <Text style={styles.label}>Details</Text>
          </View>
          <View style={styles.sectionRight}>
            <Text style={styles.qtyLabel}>Qty To Receive</Text>
          </View>
        </View>
        <View style={styles.cardsWrap}>
          {poGroups.map((po, idx) => (
            <POCard
              key={String(po?.po_id || po?.po_number || idx)}
              item={po}
              expanded={!!expanded[po?.po_number]}
              onToggle={onToggle}
              header={header}
            />
          ))}
          {poGroups.length === 0 && (
            <View style={{ padding: 16 }}>
              <Text style={{ textAlign: 'center', color: '#666' }}>No PO details available</Text>
            </View>
          )}
        </View>
      </View>
    ),
    [poGroups, expanded, onToggle]
  );

  return (
    <SafeAreaView style={styles.container}>
      <GlobalHeaderComponent
        organizationName={OrgData?.selectedOrgCode}
        screenTitle="Receiving"
        notificationCount={0}
        onBack={() => navigation.goBack()}
      />

      {phase === 'loading' && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#233E55" />
          <Text style={styles.loaderText}>Loading...</Text>
        </View>
      )}

      {phase !== 'loading' && (
        <FlatList
          data={sectionData}
          keyExtractor={(x, i) => String(i)}
          renderItem={renderSection}
          ListHeaderComponent={listHeader}
          contentContainerStyle={{ paddingBottom: 24 }}
          initialNumToRender={1}
          windowSize={3}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F8FA' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loaderText: { marginTop: 12, color: '#333' },

  sectionContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 12,
    paddingTop: 8,
    paddingBottom: 6,
    elevation: 2,
    overflow: 'hidden',
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1f2937', paddingVertical: 16, marginHorizontal: 12 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F5F6',
    paddingVertical: 10,
    paddingLeft: 8,
    paddingRight: 8,
    borderRadius: 8,
    marginHorizontal: 12,
  },
  sectionLeft: { flex: 1, justifyContent: 'center' },
  sectionRight: { justifyContent: 'center', alignItems: 'flex-end', minWidth: 120 },
  styleslabel: { fontSize: 14, fontWeight: '500', color: '#333' },
  qtyLabel: { fontSize: 14, fontWeight: '500', color: '#333', marginRight: 8 },
  label: { fontSize: 14, fontWeight: '500', color: '#333' },

  cardsWrap: { paddingHorizontal: 12, paddingTop: 10 },

  cardElevatedContainer: {
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  card: { borderRadius: 12, overflow: 'hidden', backgroundColor: '#fff' },

  headerRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 15 },
  poNumber: { fontSize: 14, fontWeight: '700', color: '#242424', textAlign: 'center' },
  qtyRow: { flexDirection: 'row', gap: 20 },
  qtyHeader: { fontSize: 10, fontWeight: '600', color: '#595A5C', textAlign: 'center' },
  qtyValue: { fontSize: 10, fontWeight: '600', color: '#242424', textAlign: 'center' },

  viewButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#ECF1F7',
    paddingVertical: 5,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  viewButtonText: { fontSize: 12, color: '#5D768B' },
  caretIcon: { marginLeft: 6, width: 12, height: 12 },

  itemsContainer: { backgroundColor: '#FBFBFB' },
  itemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    paddingBottom: 6,
    paddingHorizontal: 12,
  },
  itemsHeaderText: { fontWeight: '600', fontStyle: 'italic', fontSize: 12, width: 140, color: '#595A5C' },

  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#D9E4EE',
  },
  itemRowLast: {
    borderBottomWidth: 0,
  },

  colItem: { flex: 2, paddingLeft: 8 },
  colOrdered: { flex: 1 },
  colReceiving: { flex: 1 },

  itemText: { fontSize: 12, fontWeight: '400', color: '#242424' },
  itemTextStrong: { fontSize: 12, fontWeight: '700', color: '#242424' },

  viewDetails: { fontSize: 12, fontWeight: '700', color: '#033EFF', textDecorationLine: 'underline' },
});

export default AsnReceivedScreen;
