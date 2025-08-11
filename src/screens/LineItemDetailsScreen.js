import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import GlobalHeaderComponent from '../components/GlobalHeaderComponent';
import FooterButtonsComponent from '../components/FooterButtonsComponent';
import CustomNumericInput from '../components/CustomNumericInput';
import PencilDropdownRow from '../components/PencilDropdownRow';
import ConfirmModalComponent from '../components/ConfirmModalComponent';
import PenIcon from '../assets/icons/penicon.svg';

const CONTROL_WIDTH = 130;
const CONTROL_HEIGHT = 44;

const fallbackLineItems = [
  {
    id: '1',
    poNumber: 'PO-00002',
    lineNumber: 1,
    itemName: 'Lorem Imusum',
    itemDescription: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua',
    orderQty: 100,
    receivingQty: 0,
    receivingStatus: 'In-progress',
    lpn: '',
    subInventory: '',
    locator: '',
  },
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

const LineItemDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const scrollRef = useRef(null);

  const readOnly = !!route?.params?.readonly;
  const isEditable = !readOnly;

  const allItems =
    Array.isArray(route?.params?.items) && route.params.items.length > 0
      ? route.params.items
      : fallbackLineItems;

  const startIndex = Math.max(0, Math.min(Number(route?.params?.startIndex ?? 0), allItems.length - 1));

  const [index, setIndex] = useState(startIndex);
  const [edited, setEdited] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);

  const current = useMemo(() => allItems[index], [allItems, index]);

  const state = edited[current.id] ?? {
    receivingQty: Number(current.receivingQty ?? 0),
    lpn: current.lpn ?? '',
    subInventory: current.subInventory ?? '',
    locator: current.locator ?? '',
  };

  const updateField = useCallback((patch) => {
    setEdited((prev) => ({
      ...prev,
      [current.id]: { ...(prev[current.id] ?? {}), ...patch },
    }));
  }, [current.id]);

  const isEdited = useMemo(() => !readOnly && !!edited[current.id], [edited, current.id, readOnly]);

  const isSubmitEnabled = useMemo(() => {
    if (readOnly) return false;
    const q = Number(state.receivingQty ?? 0);
    const qtyOk = q > 0 && q <= Number(current.orderQty ?? 0);
    const lpnOk = !!state.lpn;
    const subInvOk = !!state.subInventory;
    const locOk = !!state.locator;
    return qtyOk && lpnOk && subInvOk && locOk;
  }, [state, readOnly, current.orderQty]);

  const scrollToTop = useCallback(() => {
    if (scrollRef.current) scrollRef.current.scrollTo({ y: 0, animated: false });
  }, []);

  useEffect(() => {
    scrollToTop();
  }, [current.id, scrollToTop]);

  const goPrev = useCallback(() => {
    setIndex((i) => Math.max(0, i - 1));
  }, []);

  const goNext = useCallback(() => {
    setIndex((i) => Math.min(allItems.length - 1, i + 1));
  }, [allItems.length]);

  const handleSave = useCallback(async () => {
    Toast.show({ type: 'info', text1: 'Saving line item…', position: 'top', visibilityTime: 800 });
    await new Promise((r) => setTimeout(r, 600));
    Toast.show({ type: 'success', text1: 'Line item saved', position: 'top', visibilityTime: 1200 });
  }, []);

  const titlePo = current?.poNumber ? `Receive - ${String(current.poNumber).replace('-', '')}` : 'Receive';

  const openSubmitConfirm = useCallback(() => setShowConfirm(true), []);
  const closeSubmitConfirm = useCallback(() => setShowConfirm(false), []);

  const mockSubmitAction = useCallback(async () => {
    await new Promise((r) => setTimeout(r, 900));
    return { success: true };
  }, []);

  const afterSubmitSuccess = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <GlobalHeaderComponent
        title={titlePo}
        greetingName="Hello Robert"
        dateText="06-08-2025"
        onBack={() => navigation.goBack()}
        onMenu={() => {}}
      />

      <View style={styles.navBar}>
        <TouchableOpacity onPress={goPrev} disabled={index === 0} style={styles.navEdge} activeOpacity={0.7}>
          <ChevronLeft size={22} color={index === 0 ? '#C8D0D6' : '#1F3B55'} />
        </TouchableOpacity>

        <Text style={styles.navTitle}>{`Line Item ${index + 1}`}</Text>

        <TouchableOpacity onPress={goNext} disabled={index === allItems.length - 1} style={styles.navEdge} activeOpacity={0.7}>
          <ChevronRight size={22} color={index === allItems.length - 1 ? '#C8D0D6' : '#1F3B55'} />
        </TouchableOpacity>
      </View>

      <ScrollView ref={scrollRef} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.card} key={`card-${current.id}`}>
          <View style={styles.row}>
            <Text style={styles.label}>Item Name</Text>
            <Text style={styles.valueBold} numberOfLines={1}>{current.itemName || '—'}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.block}>
            <Text style={styles.label}>Item Description</Text>
            <Text style={styles.descText}>{current.itemDescription || '—'}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.label}>Order Quantity</Text>
            <Text style={styles.qtyRight}>{String(current.orderQty ?? 0)} <Text style={styles.qtyUnit}>Qty</Text></Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.label}>Receiving Quantity</Text>
            <View style={styles.numericRight}>
              <CustomNumericInput
                key={`qty-${String(current.id)}`}
                value={Number(state.receivingQty) || 0}
                setValue={(v) => {
                  if (readOnly) return;
                  const currentVal = Number(state.receivingQty) || 0;
                  const raw = typeof v === 'function' ? v(currentVal) : v;
                  const n = Number(raw);
                  const clamped = Number.isFinite(n) ? Math.max(0, Math.min(n, Number(current.orderQty ?? 0))) : currentVal;
                  updateField({ receivingQty: clamped });
                }}
                max={Number(current.orderQty ?? 0)}
                min={0}
                step={1}
                width={CONTROL_WIDTH}
                isSelected={isEditable}
              />
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.label}>Receiving Status</Text>
            <Text style={styles.statusText}>{current.receivingStatus || 'In-progress'}</Text>
          </View>

          <View style={styles.divider} />

          <InlineFieldRow label="LPN">
            <PencilDropdownRow
              key={`lpn-${String(current.id)}`}
              value={state.lpn}
              onChange={isEditable ? (v) => updateField({ lpn: v }) : undefined}
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

          <InlineFieldRow label="Sub Inventory">
            <PencilDropdownRow
              key={`subinv-${String(current.id)}`}
              value={state.subInventory}
              onChange={isEditable ? (v) => updateField({ subInventory: v }) : undefined}
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

          <InlineFieldRow label="Locator*">
            <PencilDropdownRow
              key={`locator-${String(current.id)}`}
              value={state.locator}
              onChange={isEditable ? (v) => updateField({ locator: v }) : undefined}
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

      {!readOnly && (
        <FooterButtonsComponent
          leftLabel="Save"
          rightLabel="Submit"
          onLeftPress={isEdited ? handleSave : undefined}
          onRightPress={isSubmitEnabled ? openSubmitConfirm : undefined}
          leftEnabled={isEdited}
          rightEnabled={isSubmitEnabled}
        />
      )}

      <ConfirmModalComponent
        visible={showConfirm}
        title="Confirmation"
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
    marginTop: 8,
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  navEdge: { width: 44, height: 32, alignItems: 'center', justifyContent: 'center' },
  navTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '600', color: '#6B7785' },
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
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, justifyContent: 'space-between' },
  block: { paddingVertical: 12 },
  inlineRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  inlineRight: { alignItems: 'flex-end', justifyContent: 'center' },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: '#E5E7EB' },
  label: { fontSize: 12, color: '#6B7280' },
  valueBold: { fontSize: 14, color: '#0A395D', fontWeight: '700', maxWidth: '58%', textAlign: 'right' },
  descText: { marginTop: 6, fontSize: 12, color: '#111827', lineHeight: 18 },
  qtyRight: { fontSize: 16, fontWeight: '700', color: '#111827' },
  qtyUnit: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  numericRight: { alignItems: 'flex-end', justifyContent: 'center' },
  statusText: { color: '#F5B429', fontWeight: '700' },
});

export default LineItemDetailsScreen;
