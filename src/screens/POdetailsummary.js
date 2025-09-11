import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Dimensions, FlatList, ScrollView } from 'react-native';
import GlobalHeaderComponent from '../components/GlobalHeaderComponent';
import { useNavigation } from '@react-navigation/native';
import ASNinfoCardComponent from '../components/ASNinfoCardComponent';
import { useReceivingStore } from '../store/receivingStore';
import FooterButtonsComponent from '../components/FooterButtonsComponent';
import Toast from 'react-native-toast-message';

const { width: screenWidth } = Dimensions.get('window');
const baseWidth = 375;
const scale = screenWidth / baseWidth;
const responsiveSize = (size) => Math.round(size * scale);

export default function PODetailSummary() {
  const [expandedId, setExpandedId] = useState(null);
  const { OrgData, asnHeader, asnSelectedLines } = useReceivingStore();
  const navigation = useNavigation();

  const toggleExpand = (id) => setExpandedId((prev) => (prev === id ? null : id));

  const onSave = () => {
    if (!asnSelectedLines?.length) {
      Toast.show({ type: 'info', text1: 'No items selected', position: 'top', visibilityTime: 2000 });
      return;
    }
    Toast.show({ type: 'success', text1: 'Saved draft', position: 'top', visibilityTime: 1500 });
  };

  const onConfirm = () => {
    if (!asnSelectedLines?.length) {
      Toast.show({ type: 'info', text1: 'No items selected', position: 'top', visibilityTime: 2000 });
      return;
    }
    Toast.show({ type: 'success', text1: 'Confirm initiated', position: 'top', visibilityTime: 1500 });
  };

  const renderLineCard = (row) => {
    const isExpanded = expandedId === row.id;
    const l = row?.line ?? {};
    const poNumber = String(row?.po_number ?? '');
    const ordered = Number(l?.ordered_qty ?? 0);
    const received = Number(l?.rcvd_qty ?? 0);
    const shipped = l?.shipped_qty == null ? null : Number(l?.shipped_qty);
    const receivingQty = Number(l?.receiving_qty ?? 0);

    const itemRows = Array.isArray(l?.asn_line_items)
      ? l.asn_line_items.map((li, idx) => ({
          key: String(li?.item_code ?? li?.item_id ?? idx),
          name: String(li?.item_code ?? li?.item_description ?? `Item ${idx + 1}`),
          ordered: Number(li?.ordered_qty ?? 0),
          receiving: Number(li?.receiving_qty ?? receivingQty)
        }))
      : [
          {
            key: String(l?.item_code ?? l?.item_id ?? row.id),
            name: String(l?.item_code ?? l?.item_description ?? 'Item'),
            ordered: ordered,
            receiving: receivingQty
          }
        ];

    return (
      <View key={String(row.id)} style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.poNumber}>{poNumber}</Text>
          <View style={styles.qtyRow}>
            <Text style={styles.qtyText}>Ordered Qty{'\n'}{Number.isFinite(ordered) ? ordered : 0}</Text>
            <Text style={styles.qtyText}>Received Qty{'\n'}{Number.isFinite(received) ? received : 0}</Text>
            <Text style={styles.qtyText}>Shipped Qty{'\n'}{shipped == null || !Number.isFinite(shipped) ? '—' : shipped}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.viewButton} onPress={() => toggleExpand(row.id)}>
          <Text style={styles.viewButtonText}>View Items</Text>
          <Text style={styles.caret}>{isExpanded ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {isExpanded && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.itemsContainer}>
              <View style={styles.itemsHeader}>
                <Text style={[styles.itemsHeaderText, styles.colItem]}>List of Items</Text>
                <Text style={[styles.itemsHeaderText, styles.colOrdered]}>Ordered Qty</Text>
                <Text style={[styles.itemsHeaderText, styles.colReceiving]}>Receiving Qty</Text>
              </View>
              <FlatList
                data={itemRows}
                keyExtractor={(it) => it.key}
                renderItem={({ item }) => (
                  <View style={styles.itemRow}>
                    <Text style={[styles.itemText, styles.colItem]} numberOfLines={1}>{item.name}</Text>
                    <Text style={[styles.itemText, styles.colOrdered]}>{Number.isFinite(item.ordered) ? item.ordered : 0}</Text>
                    <Text style={[styles.itemTextStrong, styles.colReceiving]}>{Number.isFinite(item.receiving) ? item.receiving : 0}</Text>
                  </View>
                )}
                nestedScrollEnabled
                style={{ maxHeight: 280 }}
                showsVerticalScrollIndicator={true}
                removeClippedSubviews
                initialNumToRender={10}
                windowSize={7}
              />
            </View>
          </ScrollView>
        )}
      </View>
    );
  };

  const listData = useMemo(() => [{ type: 'asn' }, { type: 'summary' }], []);

  const renderItem = ({ item }) => {
    if (item.type === 'asn') {
      return (
        <ASNinfoCardComponent
          receiptNumber={asnHeader?.receiptNumber}
          supplier={asnHeader?.supplier_name}
          asnnumber={asnHeader?.asn_num}
          shippeddate={asnHeader?.shipped_date}
          supplierSite={asnHeader?.supplier_site}
          carrier={asnHeader?.carrier}
          packSlip={asnHeader?.pack_slip}
          bol={asnHeader?.bol}
          waybill={asnHeader?.waybill}
          airbill={asnHeader?.airbill}
        />
      );
    }
    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionShippingTitle}>PO Detailed Summary</Text>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionLeft}>
            <Text style={styles.label}>Details</Text>
          </View>
          <View style={styles.sectionRight}>
            <Text style={styles.qtyLabel}>Qty To Receive</Text>
          </View>
        </View>
        <View style={styles.cardsWrap}>
          {asnSelectedLines?.length ? (
            asnSelectedLines.map(renderLineCard)
          ) : (
            <View style={{ padding: 16 }}>
              <Text style={{ textAlign: 'center', color: '#666' }}>No items selected</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <GlobalHeaderComponent
        organizationName={OrgData?.selectedOrgCode}
        screenTitle="Receive"
        // contextInfo={asnHeader?.asn_num ? `(${asnHeader.asn_num})` : undefined}
        notificationCount={0}
        onBack={() => navigation.goBack()}
        onMenu={() => {}}
        onNotificationPress={() => navigation.navigate('Home')}
        onProfilePress={() => navigation.navigate('Home')}
      />
      <FlatList
        data={listData}
        renderItem={renderItem}
        keyExtractor={(it) => it.type}
        contentContainerStyle={{ paddingBottom: 120 }}
        removeClippedSubviews
        initialNumToRender={3}
        windowSize={5}
      />
      <FooterButtonsComponent
        leftLabel="Save"
        rightLabel="Confirm"
        onLeftPress={onSave}
        onRightPress={onConfirm}
        leftEnabled
        rightEnabled
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F8FA' },
  sectionContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 12,
    paddingTop: 8,
    paddingBottom: 6,
    elevation: 2,
    overflow: 'visible'
  },
  sectionShippingTitle: {
    fontSize: responsiveSize(16),
    fontWeight: '700',
    color: '#1f2937',
    paddingVertical: 16,
    marginHorizontal: responsiveSize(10)
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F5F6',
    paddingVertical: 10,
    paddingLeft: 5,
    paddingRight: 5,
    borderRadius: 8,
    marginHorizontal: responsiveSize(10),
  },
  sectionLeft: { flex: 1, justifyContent: 'center', paddingLeft: 8 },
  sectionRight: { justifyContent: 'center', alignItems: 'flex-end', minWidth: 120 },
  label: { fontSize: 14, fontWeight: '500', color: '#333' },
  qtyLabel: { fontSize: 14, fontWeight: '500', color: '#333', marginRight: 12 },
  cardsWrap: { paddingHorizontal: responsiveSize(10), paddingTop: 10 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 10 },
  poNumber: { fontWeight: 'bold', fontSize: 14 },
  qtyRow: { flexDirection: 'row', gap: 20 },
  qtyText: { fontSize: 12, textAlign: 'center' },
  viewButton: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#F0F4F7', padding: 8, alignItems: 'center' },
  viewButtonText: { fontSize: 12, color: '#0A395D', textDecorationLine: 'underline' },
  caret: { fontSize: 16 },
  itemsContainer: { paddingHorizontal: responsiveSize(10), backgroundColor: '#FAFAFA'},
  itemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd'
  },
  itemsHeaderText: { fontWeight: 'bold', fontSize: 12, width: 140 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  itemText: { fontSize: 12, width: 100 },
  itemTextStrong: { fontSize: 12, fontWeight: '700', color: '#0A395D', width: 140 },
  colItem: { width: 170 },
  colOrdered: { width: 100, textAlign: 'left' },
  colReceiving: { width: 100, textAlign: 'left' }
});
