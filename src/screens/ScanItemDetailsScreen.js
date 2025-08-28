import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { useNavigation, useRoute, StackActions, useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import GlobalHeaderComponent from '../components/GlobalHeaderComponent';
import FooterButtonsComponent from '../components/FooterButtonsComponent';
import CustomNumericInput from '../components/CustomNumericInput';
import PencilDropdownRow from '../components/PencilDropdownRow';
import SuccessModal from '../components/SuccessModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useReceivingStore } from '../store/receivingStore';
import { GetLocatorsData } from '../api/ApiServices';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CONTROL_WIDTH = 80;
const CONTROL_HEIGHT = 28;
const NUMCONTROL_WIDTH = 80;
const NUMCONTROL_HEIGHT = 28;

const fallbackLineItems = [
  { id: '1', poNumber: 'PO-00002', lineNumber: 1, itemName: 'Lorem Imusum', itemDescription: 'Lorem ipsum dolor sit amet', orderQty: 100, openQty: 0, receivingQty: 100, receivingStatus: 'Received', lpn: 'LPN1', subInventory: 'SUBINV1', locator: 'LOC1' },
];

const InlineFieldRow = ({ label, children }) => (
  <View style={styles.inlineRow}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.inlineRight}>{children}</View>
  </View>
);

const clampToLimit = (qty, limit) => {
  const lim = Number(limit ?? 0);
  const q = Number(qty ?? 0);
  if (!Number.isFinite(lim) || lim <= 0) return 0;
  if (!Number.isFinite(q) || q <= 0) return 0;
  return Math.min(q, lim);
};

const ScanItemDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const readOnly = !!route?.params?.readonly;
  theReturnTo = route?.params?.returnTo || null;
  const listType = route?.params?.listType || 'scan';
  const isEditable = !readOnly;

  const { InventoryList, OrgData, LocatorList, setLocatorList, receiveItems, mergePatchIntoReceiveItems } = useReceivingStore();

  const baseItems = Array.isArray(route?.params?.items) && route.params.items.length > 0
    ? route.params.items
    : fallbackLineItems;

  const mergedItems = useMemo(() => {
    return baseItems.map((it) => {
      const stored = Array.isArray(receiveItems) ? receiveItems.find(r => String(r.id) === String(it.id)) : undefined;
      return {
        ...it,
        receivingQty: Number(stored?.qtyToReceive ?? stored?.receivingQty ?? it.receivingQty ?? it.qtyToReceive ?? 0),
        lpn: stored?.lpn ?? it.lpn ?? '',
        subInventory: stored?.subInventory ?? it.subInventory ?? '',
        locator: stored?.locator ?? it.locator ?? '',
        max_open_qty: Number(it.max_open_qty ?? stored?.max_open_qty ?? it.openQty ?? 0),
      };
    });
  }, [baseItems, receiveItems]);

  const startIndex = Math.max(0, Math.min(Number(route?.params?.startIndex ?? 0), mergedItems.length - 1));

  const [profileName, setProfileName] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [index, setIndex] = useState(startIndex);
  const [edited, setEdited] = useState({});
  const [LpnList, setLpnList] = useState([]);
  const [successVisible, setSuccessVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const listRef = useRef(null);

  const allItems = mergedItems;
  const current = useMemo(() => allItems[index], [allItems, index]);

  useEffect(() => {
    if (readOnly) return;
    const next = { ...edited };
    let changed = false;
    for (const it of allItems) {
      if (next[it.id]) continue;
      const fromStore = Array.isArray(receiveItems) ? receiveItems.find(r => String(r.id) === String(it.id)) : undefined;
      if (fromStore) {
        next[it.id] = {
          receivingQty: Number(fromStore.qtyToReceive ?? fromStore.receivingQty ?? 0),
          lpn: fromStore.lpn ?? it.lpn ?? '',
          subInventory: fromStore.subInventory ?? it.subInventory ?? '',
          locator: fromStore.locator ?? it.locator ?? '',
        };
        changed = true;
      }
    }
    if (changed) setEdited(next);
  }, [allItems, receiveItems, readOnly]);

  const handleSubInventoryChange = async (itemId, sub_id) => {
    setEdited((prev) => ({
      ...prev,
      [itemId]: { ...(prev[itemId] ?? {}), subInventory: sub_id },
    }));
    try {
      const locdata = await GetLocatorsData(sub_id);
      if (locdata) {
        const Locatorsdata = locdata.map((d) => ({ id: d.locator_id, name: d.locator_name, enabled: d.locator_enabled }));
        setLocatorList(Locatorsdata);
      }
    } catch {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load Locators', position: 'top', visibilityTime: 5000 });
    }
  };

  const isSubmitEnabled = true;

  const titlePo = current?.poNumber ? `${String(current.poNumber)}` : 'Receive';

  const scrollToIndex = useCallback((i) => {
    if (i < 0 || i >= allItems.length) return;
    listRef.current?.scrollToIndex({ index: i, animated: true });
    setIndex(i);
  }, [allItems.length]);

  const goPrev = useCallback(() => { if (index > 0) scrollToIndex(index - 1); }, [index, scrollToIndex]);
  const goNext = useCallback(() => { if (index < allItems.length - 1) scrollToIndex(index + 1); }, [index, allItems.length, scrollToIndex]);

  const handleCancelNav = useCallback(() => {
    if (theReturnTo) navigation.navigate(theReturnTo, { selectedTab: 'scanItems' });
    else navigation.goBack();
  }, [navigation, theReturnTo]);

  const buildPatches = useCallback(() => {
    const patches = [];
    for (const it of allItems) {
      const st = edited[it.id];
      if (!st) continue;
      const limit = Number(it.max_open_qty ?? it.openQty ?? 0);
      const clampedQty = clampToLimit(Number(st.receivingQty ?? 0), limit);
      const valid = clampedQty >= 0 && clampedQty <= limit && !!st.subInventory;
      if (!valid) continue;
      patches.push({
        id: String(it.id),
        qtyToReceive: clampedQty,
        receivingQty: clampedQty,   // <-- add this
        lpn: st.lpn ?? '',
        subInventory: st.subInventory ?? '',
        locator: st.locator ?? '',
        });
    }
    return patches;
  }, [allItems, edited]);

  const handleSaveAll = useCallback(async () => {
    const patches = buildPatches();
    if (!patches.length) {
      Toast.show({ type: 'info', text1: 'No changes to save', position: 'top', visibilityTime: 5000 });
      if (theReturnTo) navigation.navigate(theReturnTo, { selectedTab: 'scanItems' });
      return;
    }
    try {
      for (const p of patches) mergePatchIntoReceiveItems(p);
      const label = theReturnTo === 'ReceiveSummaryScreen' ? 'Updated Successfully' : 'Saved Successfully';
      setSuccessMessage(label);
      setSuccessVisible(true);
      setTimeout(() => {
        setSuccessVisible(false);
        if (theReturnTo) navigation.dispatch(StackActions.replace(theReturnTo, { listType, selectedTab: 'scanItems' }));
        else navigation.goBack();
      }, 1200);
    } catch {
      Toast.show({ type: 'error', text1: 'Save failed', text2: 'Please try again.', position: 'top', visibilityTime: 5000 });
    }
  }, [buildPatches, mergePatchIntoReceiveItems, navigation, theReturnTo, listType]);

  const renderPage = ({ item }) => {
    const fromStore = Array.isArray(receiveItems) ? receiveItems.find(r => String(r.id) === String(item.id)) : undefined;
    const storeQty = Number(fromStore?.qtyToReceive ?? fromStore?.receivingQty);
    const mergedQty = Number(item.receivingQty ?? item.qtyToReceive ?? 0);
    const defaultEditableQty = Number.isFinite(storeQty) ? storeQty : mergedQty;

    const readonlyQty = readOnly
      ? (listType === 'scan'
          ? (Number(item.openQty ?? 0) > 0 ? Number(item.openQty ?? 0) : Number(item.orderQty ?? 0))
          : Number(item.orderQty ?? mergedQty ?? 0))
      : defaultEditableQty;

    const pageState = edited[item.id] ?? {
      receivingQty: readonlyQty,
      lpn: fromStore?.lpn ?? item.lpn ?? '',
      subInventory: fromStore?.subInventory ?? item.subInventory ?? '',
      locator: fromStore?.locator ?? item.locator ?? '',
      openQty: fromStore?.openQty ?? item.openQty ?? ''
    };

    const limit = Number(item.max_open_qty ?? item.openQty ?? 0);

    return (
      <View style={{ width: SCREEN_WIDTH }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.card} key={`card-${item.id}`}>
            <View style={styles.row}>
              <Text style={styles.label}>Item Name</Text>
              <Text style={styles.valueBold} numberOfLines={1}>{item.itemName || '—'}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.block}>
              <Text style={styles.label}>Item Description</Text>
              <Text style={styles.descText}>{item.itemDescription || '—'}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.label}>Order Quantity (Each)</Text>
              <Text style={styles.qtyRight}>{String(item.orderQty ?? 0)} Qty</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.label}>Open Quantity</Text>
              <Text style={styles.qtyRight}>{String(item.openQty ?? 0)} Qty</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.label}>Receiving Quantity</Text>
              <View style={styles.numericRight}>
                {readOnly ? (
                  <Text style={styles.qtyRight}>{String(readonlyQty)} <Text style={styles.qtyUnit}>Qty</Text></Text>
                ) : (
                  <CustomNumericInput
                    key={`qty-${String(item.id)}`}
                    value={Number(pageState.receivingQty) || 0}
                    setValue={(v) => {
                      if (readOnly) return;
                      const currentVal = Number(pageState.receivingQty) || 0;
                      const raw = typeof v === 'function' ? v(currentVal) : v;
                      const n = Number(raw);
                      const clamped = clampToLimit(n, limit);
                      setEdited((prev) => ({ ...prev, [item.id]: { ...(prev[item.id] ?? {}), receivingQty: clamped } }));
                    }}
                    max={limit}
                    min={0}
                    step={1}
                    width={NUMCONTROL_WIDTH}
                    height={NUMCONTROL_HEIGHT}
                    isSelected={isEditable}
                    disabledinput={item.openQty == 0}
                  />
                )}
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.label}>Receiving Status</Text>
              <Text style={styles.statusText}>
                {readOnly
                  ? (listType === 'scan' ? `${item.receivingStatus}` : 'Received')
                  : (pageState.receivingQty && pageState.receivingQty > 0 ? 'In Progress' : item.openQty == 0 ? 'CLOSED' : 'OPEN')}
              </Text>
            </View>
            <View style={styles.divider} />
            <InlineFieldRow label="LPN">
              <PencilDropdownRow
                key={`lpn-${String(item.id)}`}
                value={pageState.lpn}
                onChange={isEditable ? (id) => setEdited((prev) => ({ ...prev, [item.id]: { ...(prev[item.id] ?? {}), lpn: id } })) : undefined}
                options={LpnList}
                placeholder="Select LPN"
                disabled={!isEditable || item.openQty == 0}
                width={CONTROL_WIDTH}
                height={CONTROL_HEIGHT}
                compact
              />
            </InlineFieldRow>
            <View style={styles.divider} />
            <InlineFieldRow label="Sub Inventory*">
              <PencilDropdownRow
                key={`subinv-${String(item.id)}`}
                value={pageState.subInventory}
                onChange={isEditable ? (sub_id) => handleSubInventoryChange(item.id, sub_id) : undefined}
                options={InventoryList}
                placeholder="Select Sub Inventory"
                disabled={!isEditable || item.openQty == 0}
                width={CONTROL_WIDTH}
                height={CONTROL_HEIGHT}
                compact
              />
            </InlineFieldRow>
            <View style={styles.divider} />
            <InlineFieldRow label="Locator">
              <PencilDropdownRow
                key={`locator-${String(item.id)}`}
                value={pageState.locator}
                onChange={isEditable ? (id) => setEdited((prev) => ({ ...prev, [item.id]: { ...(prev[item.id] ?? {}), locator: id } })) : undefined}
                options={LocatorList}
                placeholder="Select Locator"
                disabled={!isEditable || item.openQty == 0}
                width={CONTROL_WIDTH}
                height={CONTROL_HEIGHT}
                compact
              />
            </InlineFieldRow>
          </View>
          <View style={{ height: 24 }} />
        </ScrollView>
      </View>
    );
  };

  const leftBtnLabel = 'Cancel';
  const rightBtnLabel = theReturnTo === 'ReceiveSummaryScreen' ? 'Update' : 'Save';

  const loadUserName = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem('user_name');
      if (!raw) { setProfileName(''); return; }
      let name = '';
      try { const parsed = JSON.parse(raw); name = typeof parsed === 'string' ? parsed : parsed?.user_name ?? ''; }
      catch { name = raw; }
      setProfileName(name.trim());
    } catch { setProfileName(''); }
  }, []);

  useEffect(() => { loadUserName(); }, [loadUserName]);
  useFocusEffect(React.useCallback(() => { loadUserName(); }, [loadUserName]));

  return (
    <SafeAreaView style={styles.container}>
      <GlobalHeaderComponent
        organizationName={OrgData?.selectedOrgCode}
        screenTitle="Receive"
        contextInfo={titlePo}
        notificationCount={0}
        profileName={profileName}
        onBack={() => navigation.goBack()}
        onMenu={() => setMenuOpen(true)}
      />
      <View style={styles.navBar}>
        <TouchableOpacity onPress={goPrev} disabled={index === 0} style={styles.navEdge} activeOpacity={0.7}>
          <ChevronLeft size={22} color={index === 0 ? '#C8D0D6' : '#233E55'} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>{`Line Item ${index + 1}`}</Text>
        <TouchableOpacity onPress={goNext} disabled={index === allItems.length - 1} style={styles.navEdge} activeOpacity={0.7}>
          <ChevronRight size={22} color={index === allItems.length - 1 ? '#C8D0D6' : '#233E55'} />
        </TouchableOpacity>
      </View>
      <FlatList
        ref={listRef}
        data={allItems}
        keyExtractor={(it) => String(it.id)}
        renderItem={renderPage}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={startIndex}
        getItemLayout={(_, i) => ({ length: SCREEN_WIDTH, offset: SCREEN_WIDTH * i, index: i })}
        removeClippedSubviews={false}
        windowSize={3}
        onScroll={(e) => {
          const x = e.nativeEvent.contentOffset.x;
          const newIndex = Math.round(x / SCREEN_WIDTH);
          if (newIndex !== index) setIndex(newIndex);
        }}
        scrollEventThrottle={16}
      />
      {!readOnly && (
        <FooterButtonsComponent
          leftLabel={leftBtnLabel}
          rightLabel={rightBtnLabel}
          onLeftPress={handleCancelNav}
          onRightPress={handleSaveAll}
          leftEnabled
          rightEnabled
        />
      )}
      <SuccessModal
        visible={successVisible}
        message={successMessage ?? 'Submitted Successfully'}
        onDismiss={() => setSuccessVisible(false)}
        autoHideMs={1800}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: '#F6F8FA', flex: 1 },
  navBar: {
    marginTop: 14,
    marginBottom: 14,
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
  },
  navEdge: { width: 44, height: 32, alignItems: 'center', justifyContent: 'center' },
  navTitle: { flex: 1, color: '#233E55', textAlign: 'center', fontSize: 12, fontWeight: '600' },
  content: { paddingBottom: 120 },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 80,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 6,
    elevation: 3,
  },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, justifyContent: 'space-between' },
  block: { paddingVertical: 12 },
  inlineRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  inlineRight: { alignItems: 'flex-end', justifyContent: 'center' },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: '#E5E7EB' },
  label: { fontSize: 12, color: '#6C6C6C' },
  valueBold: { fontSize: 12, color: '#000000', fontWeight: '700', maxWidth: '58%', textAlign: 'right' },
  descText: { marginTop: 6, fontSize: 12, fontWeight: '700', color: '#111827', lineHeight: 18 },
  qtyRight: { fontSize: 12, fontWeight: '700', color: '#111827' },
  qtyUnit: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  numericRight: { alignItems: 'flex-end', justifyContent: 'center' },
  statusText: { color: '#F5B429', fontWeight: '700' },
});

export default ScanItemDetailsScreen;
