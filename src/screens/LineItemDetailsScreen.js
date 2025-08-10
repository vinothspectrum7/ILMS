import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import GlobalHeaderComponent from '../components/GlobalHeaderComponent';
import FooterButtonsComponent from '../components/FooterButtonsComponent';
import CustomNumericInput from '../components/CustomNumericInput';
import PencilDropdownRow from '../components/PencilDropdownRow';
import PenIcon from '../assets/icons/penicon.svg';

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

const LineItemDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const readOnly = !!route?.params?.readonly; 
  const isEditable = !readOnly;

  const allItems = Array.isArray(route?.params?.items) && route.params.items.length > 0 ? route.params.items : fallbackLineItems;
  const startIndex = Math.max(0, Math.min(Number(route?.params?.startIndex ?? 0), allItems.length - 1));

  const [index, setIndex] = useState(startIndex);
  const [edited, setEdited] = useState({});

  const current = useMemo(() => allItems[index], [allItems, index]);

  const state = edited[current.id] ?? {
    receivingQty: Number(current.receivingQty ?? 0),
    lpn: current.lpn ?? '',
    subInventory: current.subInventory ?? '',
    locator: current.locator ?? '',
  };

  const updateField = (patch) => {
    setEdited((prev) => ({
      ...prev,
      [current.id]: { ...(prev[current.id] ?? {}), ...patch },
    }));
  };

  const maxQty = Number(current.orderQty ?? 0);
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

  const goPrev = () => setIndex((i) => Math.max(0, i - 1));
  const goNext = () => setIndex((i) => Math.min(allItems.length - 1, i + 1));

  const handleSave = async () => {
    Toast.show({ type: 'info', text1: 'Saving line item…', position: 'top', visibilityTime: 800 });
    await new Promise((r) => setTimeout(r, 600));
    Toast.show({ type: 'success', text1: 'Line item saved', position: 'top', visibilityTime: 1200 });
  };

  const handleSubmit = async () => {
    Toast.show({ type: 'info', text1: 'Submitting line item…', position: 'top', visibilityTime: 800 });
    await new Promise((r) => setTimeout(r, 800));
    Toast.show({ type: 'success', text1: 'Line item submitted', position: 'top', visibilityTime: 1500 });
    navigation.goBack();
  };

  const titlePo = current?.poNumber ? `Receive - ${current.poNumber}` : 'Receive';

  return (
    <SafeAreaView style={styles.container}>
      <GlobalHeaderComponent
        title={titlePo}
        greetingName="Hello Robert"
        dateText="06-08-2025"
        onBack={() => navigation.goBack()}
        onMenu={() => {}}
      />

      <View style={styles.navWrap}>
        <TouchableOpacity onPress={goPrev} disabled={index === 0} style={[styles.navBtn, index === 0 && styles.navBtnDisabled]} activeOpacity={0.8}>
          <ChevronLeft size={18} color="#0A395D" />
        </TouchableOpacity>
        <Text style={styles.navLabel}>{`Line Item ${index + 1}`}</Text>
        <TouchableOpacity
          onPress={goNext}
          disabled={index === allItems.length - 1}
          style={[styles.navBtn, index === allItems.length - 1 && styles.navBtnDisabled]}
          activeOpacity={0.8}
        >
          <ChevronRight size={18} color="#0A395D" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
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
                value={Number(state.receivingQty) || 0}
                setValue={(v) => {
                    if (readOnly) return;
                    const currentVal = Number(state.receivingQty) || 0;
                    const raw = typeof v === 'function' ? v(currentVal) : v;
                    const n = Number(raw);
                    const clamped = Number.isFinite(n)
                    ? Math.max(0, Math.min(n, Number(current.orderQty ?? 0)))
                    : currentVal;
                    updateField({ receivingQty: clamped });
                }}
                max={Number(current.orderQty ?? 0)}
                min={0}
                step={1}
                width={130}
                isSelected={isEditable}
                />
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>Receiving Status</Text>
            <Text style={styles.statusText}>{current.receivingStatus || 'In-progress'}</Text>
          </View>
        </View>

        <PencilDropdownRow
        label="LPN"
        value={state.lpn}
        onChange={isEditable ? (v) => updateField({ lpn: v }) : undefined}
        options={LPN_OPTIONS}
        placeholder="Select"
        LeftIcon={PenIcon}
        disabled={!isEditable}
        />

        <PencilDropdownRow
        label="Sub Inventory"
        value={state.subInventory}
        onChange={isEditable ? (v) => updateField({ subInventory: v }) : undefined}
        options={SUBINVENTORY_OPTIONS}
        placeholder="Select"
        LeftIcon={PenIcon}
        disabled={!isEditable}
        />

        <PencilDropdownRow
        label="Locator*"
        value={state.locator}
        onChange={isEditable ? (v) => updateField({ locator: v }) : undefined}
        options={LOCATOR_OPTIONS}
        placeholder="Select"
        LeftIcon={PenIcon}
        disabled={!isEditable}
        />

        <View style={{ height: 24 }} />
      </ScrollView>

      {!readOnly && (
        <FooterButtonsComponent
            leftLabel="Save"
            rightLabel="Submit"
            onLeftPress={isEdited ? handleSave : undefined}
            onRightPress={isSubmitEnabled ? handleSubmit : undefined}
            leftEnabled={isEdited}
            rightEnabled={isSubmitEnabled}
        />
        )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: '#FFFFFF', flex: 1 },
  navWrap: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F6FAFA',
    borderColor: '#E5EDF0',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  navBtnDisabled: { opacity: 0.4 },
  navLabel: { fontSize: 14, color: '#0A395D', fontWeight: '600' },
  content: { paddingBottom: 120 },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, justifyContent: 'space-between' },
  block: { paddingVertical: 12 },
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
