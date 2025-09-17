import React, { useEffect, useMemo, useState, useCallback, memo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import GlobalHeaderComponent from '../components/GlobalHeaderComponent';
import ASNinfoCardComponent from '../components/ASNinfoCardComponent';
import { useReceivingStore } from '../store/receivingStore';
import { GetASNPoItems } from '../api/ApiServices';

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

const POCard = memo(({ item, expanded, onToggle }) => {
  const poNumber = String(item?.po_number || dash);
  const lines = Array.isArray(item?.asn_line_items) ? item.asn_line_items : [];
  const orderedTot = sumBy(lines, 'ordered_qty');
  const receivedTot = sumBy(lines, 'rcvd_qty');
  const shippedTot = hasAny(lines, 'shipped_qty') ? sumBy(lines, 'shipped_qty') : null;
  const isOpen = !!expanded;

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
          <Text style={styles.caret}>{isOpen ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {isOpen && (
          <View style={styles.itemsContainer}>
            <View style={styles.itemsHeader}>
              <Text style={[styles.itemsHeaderText, styles.colItem]}>List of Items</Text>
              <Text style={[styles.itemsHeaderText, styles.colOrdered]}>Ordered Qty</Text>
              <Text style={[styles.itemsHeaderText, styles.colReceiving]}>Receiving Qty</Text>
            </View>
            {lines.map((li, idx) => (
              <View key={`${poNumber}-${idx}`} style={styles.itemRow}>
                <Text style={[styles.itemTextStrong, styles.colItem]} numberOfLines={1}>{li?.item_code || dash}</Text>
                <Text style={[styles.itemText, styles.colOrdered]}>{n(li?.ordered_qty)}</Text>
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
        const data = await GetASNPoItems(asn_id);
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
  }, [asn_id]);

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
  styleslabel: { fontSize: 14, fontWeight: '500', color: '#333' }, // named as styleslabel to avoid clash with "label" globals
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

  headerRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 12 },
  poNumber: { fontSize: 14, fontWeight: '700', color: '#242424', textAlign: 'center' },
  qtyRow: { flexDirection: 'row', gap: 20 },
  qtyHeader: { fontSize: 10, fontWeight: '600', color: '#595A5C', textAlign: 'center' },
  qtyValue: { fontSize: 10, fontWeight: '600', color: '#242424', textAlign: 'center' },

  viewButton: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#ECF2F7', paddingVertical: 10, paddingHorizontal: 12, alignItems: 'center' },
  viewButtonText: { fontSize: 12, color: '#5D768B' },
  caret: { fontSize: 16 },

  itemsContainer: { backgroundColor: '#FAFAFA' },
  itemsHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10, paddingBottom: 6, paddingHorizontal: 12 },
  itemsHeaderText: { fontWeight: '600', fontStyle: 'italic', fontSize: 12 },
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#EAECEF' },

  colItem: { flex: 2, paddingRight: 8 },
  colOrdered: { flex: 1 },
  colReceiving: { flex: 1 },

  itemText: { fontSize: 12, fontWeight: '400', color: '#242424' },
  itemTextStrong: { fontSize: 12, fontWeight: '700', color: '#242424' },
});

export default AsnReceivedScreen;
