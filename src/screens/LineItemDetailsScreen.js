import React, { useMemo, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { useNavigation, useRoute, StackActions } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import GlobalHeaderComponent from '../components/GlobalHeaderComponent';
import FooterButtonsComponent from '../components/FooterButtonsComponent';
import CustomNumericInput from '../components/CustomNumericInput';
import PencilDropdownRow from '../components/PencilDropdownRow';
import ConfirmModalComponent from '../components/ConfirmModalComponent';
import PenIcon from '../assets/icons/penicon.svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CONTROL_WIDTH = 130;
const CONTROL_HEIGHT = 44;

const fallbackLineItems = [
  { id: '1', poNumber: 'PO-00002', lineNumber: 1, itemName: 'Lorem Imusum', itemDescription: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua', orderQty: 100, openQty: 0, receivingQty: 100, receivingStatus: 'Received', lpn: 'LPN1', subInventory: 'SUBINVENTORY1', locator: 'LOCATOR1' },
];

const LPN_OPTIONS = ['LPN1', 'LPN2', 'LPN3', 'LPN4'];
const SUBINVENTORY_OPTIONS = ['SUBINVENTORY1', 'SUBINVENTORY2', 'SUBINVENTORY3', 'SUBINVENTORY4'];
const LOCATOR_OPTIONS = ['LOCATOR1', 'LOCATOR2', 'LOCATOR3', 'LOCATOR4'];

const InlineFieldRow = ({ label, children }) => (
  <View style={styles.inlineRow}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.inlineRight}>{children}</View>
  </View>
);

const clampToOpen = (qty, open) => {
  const o = Number(open ?? 0);
  const q = Number(qty ?? 0);
  if (!Number.isFinite(o) || o <= 0) return 0;
  if (!Number.isFinite(q) || q <= 0) return 0;
  return Math.min(q, o);
};

const LineItemDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const readOnly = !!route?.params?.readonly;
  const returnTo = route?.params?.returnTo || null;
  const listType = route?.params?.listType || 'line';
  const isEditable = !readOnly;

  const allItems =
    Array.isArray(route?.params?.items) && route.params.items.length > 0
      ? route.params.items
      : fallbackLineItems;

  const startIndex = Math.max(0, Math.min(Number(route?.params?.startIndex ?? 0), allItems.length - 1));

  const [index, setIndex] = useState(startIndex);
  const [edited, setEdited] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);
  const listRef = useRef(null);

  const current = useMemo(() => allItems[index], [allItems, index]);

  const readonlyScanQty = (() => {
    if (!readOnly || listType !== 'scan') return null;
    const open = Number(current.openQty ?? 0);
    const ord = Number(current.orderQty ?? 0);
    return open > 0 ? open : ord;
  })();

  const initialReceivingQty = readOnly
    ? (listType === 'scan' ? Number(readonlyScanQty ?? 0) : Number(current.orderQty ?? current.receivingQty ?? 0))
    : Number(current.receivingQty ?? 0);

  const state = edited[current.id] ?? {
    receivingQty: initialReceivingQty,
    lpn: current.lpn ?? '',
    subInventory: current.subInventory ?? '',
    locator: current.locator ?? '',
  };

  const isEdited = useMemo(() => !readOnly && !!edited[current.id], [edited, current.id, readOnly]);

  const isSubmitEnabled = useMemo(() => {
    if (readOnly) return false;
    const q = Number(state.receivingQty ?? 0);
    const qtyOk = q > 0 && q <= Number(current.openQty ?? 0);
    const subInvOk = !!state.subInventory;
    return qtyOk && subInvOk;
  }, [state, readOnly, current.openQty]);

  const titlePo = current?.poNumber ? `Receive - ${String(current.poNumber)}` : 'Receive';

  const scrollToIndex = useCallback((i) => {
    if (i < 0 || i >= allItems.length) return;
    listRef.current?.scrollToIndex({ index: i, animated: true });
    setIndex(i);
  }, [allItems.length]);

  const goPrev = useCallback(() => { if (index > 0) scrollToIndex(index - 1); }, [index, scrollToIndex]);
  const goNext = useCallback(() => { if (index < allItems.length - 1) scrollToIndex(index + 1); }, [index, allItems.length, scrollToIndex]);
  const onMomentumEnd = useCallback((e) => { const x = e.nativeEvent.contentOffset.x; const newIndex = Math.round(x / SCREEN_WIDTH); if (newIndex !== index) setIndex(newIndex); }, [index]);

  const handleSave = useCallback(async () => {
    Toast.show({ type: 'info', text1: 'Saving line item…', position: 'top', visibilityTime: 800 });
    await new Promise((r) => setTimeout(r, 600));
    Toast.show({ type: 'success', text1: 'Line item saved', position: 'top', visibilityTime: 1200 });
  }, []);

  const handleCancelNav = useCallback(() => {
    if (returnTo) navigation.navigate(returnTo);
    else navigation.goBack();
  }, [navigation, returnTo]);

  const openSubmitConfirm = useCallback(() => setShowConfirm(true), []);
  const closeSubmitConfirm = useCallback(() => setShowConfirm(false), []);
  const mockSubmitAction = useCallback(async () => { await new Promise((r) => setTimeout(r, 900)); return { success: true }; }, []);

  const afterSubmitSuccess = useCallback(() => {
    const patch = {
      id: String(current.id),
      receivingQty: clampToOpen(
        Number((edited[current.id]?.receivingQty ?? state.receivingQty) || 0),
        current.openQty
      ),
      lpn: (edited[current.id]?.lpn ?? state.lpn) || '',
      subInventory: (edited[current.id]?.subInventory ?? state.subInventory) || '',
      locator: (edited[current.id]?.locator ?? state.locator) || '',
    };

    if (returnTo) {
      navigation.dispatch(
        StackActions.replace(returnTo, { patch, listType })
      );
    } else {
      navigation.goBack();
    }
  }, [navigation, returnTo, current.id, current.openQty, state, edited, listType]);

  const renderPage = ({ item }) => {
    const readonlyQty = readOnly
      ? (listType === 'scan'
          ? (Number(item.openQty ?? 0) > 0 ? Number(item.openQty ?? 0) : Number(item.orderQty ?? 0))
          : Number(item.orderQty ?? item.receivingQty ?? 0))
      : Number(item.receivingQty ?? 0);

    const pageState = edited[item.id] ?? {
      receivingQty: readonlyQty,
      lpn: item.lpn ?? '',
      subInventory: item.subInventory ?? '',
      locator: item.locator ?? '',
    };

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
              <Text style={styles.label}>Order Quantity</Text>
              <Text style={styles.qtyRight}>{String(item.orderQty ?? 0)} <Text style={styles.qtyUnit}>Qty</Text></Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
              <Text style={styles.label}>Open Quantity</Text>
              <Text style={styles.qtyRight}>{String(item.openQty ?? 0)} <Text style={styles.qtyUnit}>Qty</Text></Text>
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
                      const clamped = clampToOpen(n, Number(item.openQty ?? 0));
                      setEdited((prev) => ({ ...prev, [item.id]: { ...(prev[item.id] ?? {}), receivingQty: clamped } }));
                    }}
                    max={Number(item.openQty ?? 0)}
                    min={0}
                    step={1}
                    width={CONTROL_WIDTH}
                    isSelected={isEditable}
                  />
                )}
              </View>
            </View>

            <View style={styles.divider} />

            {/* <View style={styles.row}>
              <Text style={styles.label}>Receiving Status</Text>
              <Text style={styles.statusText}>
                {readOnly
                    ? (listType === 'scan' ? 'In-Progress' : 'Received')
                    : (item.receivingStatus || 'In-Progress')}
                </Text>
            </View>

            <View style={styles.divider} /> */}

            <InlineFieldRow label="LPN">
              <PencilDropdownRow
                key={`lpn-${String(item.id)}`}
                value={pageState.lpn}
                onChange={isEditable ? (v) => setEdited((prev) => ({ ...prev, [item.id]: { ...(prev[item.id] ?? {}), lpn: v } })) : undefined}
                options={LPN_OPTIONS}
                placeholder="Select"
                LeftIcon={PenIcon}
                disabled={!isEditable}
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
                onChange={isEditable ? (v) => setEdited((prev) => ({ ...prev, [item.id]: { ...(prev[item.id] ?? {}), subInventory: v } })) : undefined}
                options={SUBINVENTORY_OPTIONS}
                placeholder="Select"
                LeftIcon={PenIcon}
                disabled={!isEditable}
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
                onChange={isEditable ? (v) => setEdited((prev) => ({ ...prev, [item.id]: { ...(prev[item.id] ?? {}), locator: v } })) : undefined}
                options={LOCATOR_OPTIONS}
                placeholder="Select"
                LeftIcon={PenIcon}
                disabled={!isEditable}
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

  const formatToday = () => {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

  const leftBtnLabel = 'Cancel';
  const rightBtnLabel = returnTo === 'ReceiveSummaryScreen' ? 'Update' : 'Submit';

  return (
    <SafeAreaView style={styles.container}>
      <GlobalHeaderComponent
        title={titlePo}
        greetingName="Robert"
        dateText={formatToday()}
        onBack={() => navigation.goBack()}
        onMenu={() => {}}
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
        onMomentumScrollEnd={onMomentumEnd}
        initialScrollIndex={startIndex}
        getItemLayout={(_, i) => ({ length: SCREEN_WIDTH, offset: SCREEN_WIDTH * i, index: i })}
        removeClippedSubviews={false}
        windowSize={3}
      />

      {!readOnly && (
        <FooterButtonsComponent
          leftLabel={leftBtnLabel}
          rightLabel={rightBtnLabel}
          onLeftPress={handleCancelNav}
          onRightPress={isSubmitEnabled ? openSubmitConfirm : undefined}
          leftEnabled={true}
          rightEnabled={isSubmitEnabled}
        />
      )}

      <ConfirmModalComponent
        visible={showConfirm}
        title="Confimation"
        message="Are you sure you want to submit this line item?"
        confirmColor="#1B6CC6"
        cancelColor="#CC3344"
        headerBg="#5D768B1A"
        successMessage="Line item submitted successfully"
        failureMessage="Submission failed. Please try again."
        confirmAction={mockSubmitAction}
        onCancel={closeSubmitConfirm}
        onSuccess={afterSubmitSuccess}
        onFailure={closeSubmitConfirm}
        autoDismissMsSuccess={1200}
        autoDismissMsFailure={1500}
        widthRatio={0.85}
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
  navTitle: { flex: 1, color:"#233E55", textAlign: 'center', fontSize: 18, fontWeight: '600' },
  content: { paddingBottom: 120 },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 8,
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
  label: { fontSize: 12, color: '#6B7280' },
  valueBold: { fontSize: 14, color: '#0A395D', fontWeight: '700', maxWidth: '58%', textAlign: 'right' },
  descText: { marginTop: 6, fontSize: 14, fontWeight: '700', color: '#111827', lineHeight: 18 },
  qtyRight: { fontSize: 16, fontWeight: '700', color: '#111827' },
  qtyUnit: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  numericRight: { alignItems: 'flex-end', justifyContent: 'center' },
  statusText: { color: '#F5B429', fontWeight: '700' },
});

export default LineItemDetailsScreen;
