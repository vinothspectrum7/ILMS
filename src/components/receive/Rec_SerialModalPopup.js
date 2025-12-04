import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import SelectedRangesIcon from '../../assets/icons/selectedrangesicon.svg';
import RangesIcon from '../../assets/icons/rangesicon.svg';
import SelectedIndividualIcon from '../../assets/icons/selectedindividualicon.svg';
import IndividualIcon from '../../assets/icons/individualicon.svg';

import SerialUpIcon from '../../assets/icons/serialupicon.svg';
import SerialDownIcon from '../../assets/icons/serialdownicon.svg';
import SerialDeleteIcon from '../../assets/icons/serialdeleteicon.svg';
import BarcodeIcon from '../../assets/icons/barcodeicon.svg';
import LotSerialItemIcon from '../../assets/icons/lotserialitem.svg';

import BarcodeScanner from '../../screens/BarCodeScanner';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BASE_WIDTH = 375;
const rs = v => (SCREEN_WIDTH / BASE_WIDTH) * v;

const padN = (num, n) => String(Math.max(0, Number(num) || 0)).padStart(n, '0');
const makeId = () => `${Date.now()}_${Math.random().toString(16).slice(2)}`;

const normalizeInitialSerials = initialSerials => {
  if (!Array.isArray(initialSerials)) return [];
  return initialSerials
    .map(s => {
      if (typeof s === 'string') return { serialNo: s };
      if (s && typeof s === 'object') return { serialNo: String(s.serialNo ?? s.serial ?? '') };
      return { serialNo: '' };
    })
    .filter(x => typeof x.serialNo === 'string')
    .map(x => x.serialNo.trim())
    .filter(Boolean);
};

export default function Rec_SerialModalPopup({
  visible,
  onClose,
  onSave,
  lineLabel = 'Line1',
  lineQty = 0,
  itemName = '',
  itemCode = '',
  initialSerials = [],
  initialMode = 'ranges',
}) {
  const qty = Number(lineQty || 0);

  const initialSerialsNormalized = useMemo(
    () => normalizeInitialSerials(initialSerials),
    [initialSerials],
  );

  const [activeMode, setActiveMode] = useState(
    initialMode === 'individual' ? 'individual' : 'ranges',
  );
  const [hasGenerated, setHasGenerated] = useState(false);

  const [prefix, setPrefix] = useState('SN');
  const [startNumberText, setStartNumberText] = useState('1');

  const [rows, setRows] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  const [scannerVisible, setScannerVisible] = useState(false);
  const scanTargetRef = useRef({ type: 'row', rowId: null, placeholder: false });

  const clearError = useCallback(() => setErrorMsg(''), []);
  const showError = !!errorMsg;

  const startNumberValue = useMemo(() => {
    const cleaned = String(startNumberText ?? '').replace(/[^\d]/g, '');
    if (!cleaned) return 0;
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : 0;
  }, [startNumberText]);

  const selectedCount = useMemo(() => {
    return rows.filter(r => (r.serial || '').trim().length > 0).length;
  }, [rows]);

  const helperRangeText = useMemo(() => {
    const p = String(prefix || '').trim();
    if (!p) return 'Please enter Prefix';
    if (!Number.isFinite(startNumberValue) || startNumberValue <= 0) return 'Please enter Start Number';
    if (!Number.isFinite(qty) || qty <= 0) return 'Invalid quantity';
    const end = Math.max(startNumberValue, startNumberValue + Math.max(0, qty - 1));
    const a = `${p}${padN(startNumberValue, 6)}`;
    const b = `${p}${padN(end, 6)}`;
    return `We generate ${a} to ${b}`;
  }, [prefix, startNumberValue, qty]);

  const hasAnyEmptyRow = useMemo(() => rows.some(r => !(r.serial || '').trim()), [rows]);
  const canAddRow = useMemo(() => rows.length < qty, [rows.length, qty]);

  const placeholderRow = useMemo(() => {
    if (!canAddRow) return null;
    if (activeMode === 'ranges') {
      if (!hasGenerated) return null;
      if (hasAnyEmptyRow) return null;
      return { __placeholder: true, entry: rows.length + 1 };
    }
    return null;
  }, [activeMode, canAddRow, hasGenerated, hasAnyEmptyRow, rows.length]);

  const shouldShowFooter = useMemo(() => {
    if (activeMode === 'ranges') return hasGenerated;
    return true;
  }, [activeMode, hasGenerated]);

  const resetRangesToAutoGenerate = useCallback(() => {
    setHasGenerated(false);
    setRows([]);
    setPrefix('SN');
    setStartNumberText('1');
  }, []);

  const resetIndividualToSingleRow = useCallback(() => {
    setHasGenerated(false);
    setRows([{ id: makeId(), entry: 1, serial: '', locked: false }]);
  }, []);

  const hydrateOnOpen = useCallback(() => {
    clearError();
    scanTargetRef.current = { type: 'row', rowId: null, placeholder: false };
    setScannerVisible(false);

    const mode = initialMode === 'individual' ? 'individual' : 'ranges';
    setActiveMode(mode);
    setPrefix('SN');
    setStartNumberText('1');

    if (mode === 'individual') {
      if (initialSerialsNormalized.length > 0) {
        const list = initialSerialsNormalized.slice(0, qty).map((s, i) => ({
          id: makeId(),
          entry: i + 1,
          serial: s,
          locked: false,
        }));
        setRows(list.length > 0 ? list : [{ id: makeId(), entry: 1, serial: '', locked: false }]);
      } else {
        setRows([{ id: makeId(), entry: 1, serial: '', locked: false }]);
      }
      setHasGenerated(false);
      return;
    }

    if (initialSerialsNormalized.length > 0) {
      const list = initialSerialsNormalized.slice(0, qty).map((s, i) => ({
        id: makeId(),
        entry: i + 1,
        serial: s,
        locked: true,
      }));
      setRows(list);
      setHasGenerated(true);
    } else {
      resetRangesToAutoGenerate();
    }
  }, [clearError, initialMode, initialSerialsNormalized, qty, resetRangesToAutoGenerate]);

  useEffect(() => {
    if (visible) hydrateOnOpen();
  }, [visible, hydrateOnOpen]);

  const openScannerForRow = useCallback(
    (rowId, isPlaceholder) => {
      clearError();
      scanTargetRef.current = { type: 'row', rowId: rowId || null, placeholder: !!isPlaceholder };
      setScannerVisible(true);
    },
    [clearError],
  );

  const handleSerialScanned = useCallback(
    codeString => {
      const v = String(codeString || '').trim();
      if (!v) {
        setScannerVisible(false);
        return;
      }

      const pending = scanTargetRef.current;
      if (!pending) {
        setScannerVisible(false);
        return;
      }

      setRows(prev => {
        const list = [...prev];

        if (pending.placeholder) {
          if (list.length >= qty) return list;
          list.push({ id: makeId(), entry: list.length + 1, serial: v, locked: false });
          return list.slice(0, qty).map((r, idx) => ({ ...r, entry: idx + 1 }));
        }

        const idx = list.findIndex(r => r.id === pending.rowId);
        if (idx >= 0) {
          list[idx] = { ...list[idx], serial: v };
        }
        return list.map((r, i) => ({ ...r, entry: i + 1 }));
      });

      scanTargetRef.current = { type: 'row', rowId: null, placeholder: false };
      setScannerVisible(false);
    },
    [qty],
  );

  const setRowSerial = useCallback(
    (rowId, value) => {
      clearError();
      setRows(prev => {
        const list = [...prev];
        const idx = list.findIndex(r => r.id === rowId);
        if (idx >= 0) list[idx] = { ...list[idx], serial: value };
        return list.map((r, i) => ({ ...r, entry: i + 1 }));
      });
    },
    [clearError],
  );

  const onChangePlaceholderSerial = useCallback(
    value => {
      clearError();
      const v = String(value || '');
      setRows(prev => {
        if (prev.length >= qty) return prev;
        const list = [...prev, { id: makeId(), entry: prev.length + 1, serial: v, locked: false }];
        return list.map((r, i) => ({ ...r, entry: i + 1 }));
      });
    },
    [clearError, qty],
  );

  const deleteRow = useCallback(
    rowId => {
      clearError();
      setRows(prev => {
        const list = prev.filter(r => r.id !== rowId);
        return list.map((r, i) => ({ ...r, entry: i + 1 }));
      });
    },
    [clearError],
  );

  const addSerialRow = useCallback(() => {
    clearError();
    setRows(prev => {
      if (prev.length >= qty) return prev;
      if (activeMode === 'ranges' && !hasGenerated) return prev;
      if (activeMode === 'ranges' && prev.some(r => !(r.serial || '').trim())) return prev;
      const list = [...prev, { id: makeId(), entry: prev.length + 1, serial: '', locked: false }];
      return list.map((r, i) => ({ ...r, entry: i + 1 }));
    });
  }, [activeMode, clearError, hasGenerated, qty]);

  const onPressGenerate = useCallback(() => {
    clearError();

    const p = String(prefix || '').trim();
    const s = Number(startNumberValue || 0);

    if (!Number.isFinite(qty) || qty <= 0) {
      setErrorMsg('Invalid quantity');
      return;
    }
    if (!p) {
      setErrorMsg('Please enter Prefix');
      return;
    }
    if (!Number.isFinite(s) || s <= 0) {
      setErrorMsg('Please enter a valid Start Number');
      return;
    }

    const generated = Array.from({ length: qty }, (_, i) => ({
      id: makeId(),
      entry: i + 1,
      serial: `${p}${padN(s + i, 6)}`,
      locked: true,
    }));

    setRows(generated);
    setHasGenerated(true);
  }, [clearError, prefix, qty, startNumberValue]);

  const validateBeforeSave = useCallback(() => {
    if (!Number.isFinite(qty) || qty <= 0) return { ok: false, msg: 'Invalid quantity' };
    if (rows.length !== qty) return { ok: false, msg: `Please ensure ${qty} serials are entered` };

    const serials = rows.map(r => (r.serial || '').trim());
    if (serials.some(s => !s)) return { ok: false, msg: 'Please fill all serial numbers' };

    const set = new Set();
    for (const s of serials) {
      const key = s.toLowerCase();
      if (set.has(key)) return { ok: false, msg: 'Duplicate serial numbers are not allowed' };
      set.add(key);
    }
    return { ok: true, msg: '' };
  }, [rows, qty]);

  const handleSave = useCallback(() => {
    const v = validateBeforeSave();
    if (!v.ok) {
      setErrorMsg(v.msg);
      return;
    }
    clearError();
    const serials = rows.map(r => (r.serial || '').trim());
    onSave?.(serials, activeMode);
  }, [activeMode, clearError, onSave, rows, validateBeforeSave]);

  const handleDeleteAll = useCallback(() => {
    clearError();
    scanTargetRef.current = { type: 'row', rowId: null, placeholder: false };
    setScannerVisible(false);

    if (activeMode === 'ranges') {
      resetRangesToAutoGenerate();
      return;
    }
    resetIndividualToSingleRow();
  }, [activeMode, clearError, resetIndividualToSingleRow, resetRangesToAutoGenerate]);

  const incStart = useCallback(() => {
    clearError();
    const base = Number(startNumberValue || 0) || 0;
    const next = Math.max(1, base + 1);
    setStartNumberText(String(next));
  }, [clearError, startNumberValue]);

  const decStart = useCallback(() => {
    clearError();
    const base = Number(startNumberValue || 0) || 0;
    const next = Math.max(1, base - 1);
    setStartNumberText(String(next));
  }, [clearError, startNumberValue]);

  const onStartManualChange = useCallback(
    txt => {
      clearError();
      const cleaned = String(txt || '').replace(/[^\d]/g, '');
      setStartNumberText(cleaned);
    },
    [clearError],
  );

  const switchMode = useCallback(
    nextMode => {
      if (nextMode === activeMode) return;

      clearError();
      scanTargetRef.current = { type: 'row', rowId: null, placeholder: false };
      setScannerVisible(false);

      if (nextMode === 'individual') {
        setActiveMode('individual');
        resetIndividualToSingleRow();
        return;
      }

      setActiveMode('ranges');
      resetRangesToAutoGenerate();
    },
    [activeMode, clearError, resetIndividualToSingleRow, resetRangesToAutoGenerate],
  );

  const renderRow = useCallback(
    r => {
      const disabled = !!r.locked;

      const showScan =
        activeMode === 'individual'
          ? true
          : !disabled;

      return (
        <View key={r.id} style={styles.rowWrap}>
          <Text style={styles.rowEntryText}>#{r.entry}</Text>

          <View style={styles.inputWrap}>
            <TextInput
              value={r.serial}
              onChangeText={txt => setRowSerial(r.id, txt)}
              editable={!disabled}
              placeholder="Enter Serial"
              placeholderTextColor="#91A3B3"
              style={[styles.serialInput, disabled ? styles.serialInputDisabled : null]}
            />
            {showScan ? (
              <TouchableOpacity
                onPress={() => openScannerForRow(r.id, false)}
                activeOpacity={0.85}
                style={styles.scanBtn}
              >
                <BarcodeIcon width={rs(18)} height={rs(18)} />
              </TouchableOpacity>
            ) : null}
          </View>

          <TouchableOpacity onPress={() => deleteRow(r.id)} activeOpacity={0.85} style={styles.deleteBtn}>
            <SerialDeleteIcon width={rs(18)} height={rs(18)} />
          </TouchableOpacity>
        </View>
      );
    },
    [activeMode, deleteRow, openScannerForRow, setRowSerial],
  );

  const renderPlaceholder = useMemo(() => {
    if (!placeholderRow) return null;

    return (
      <View key="__placeholder" style={styles.rowWrap}>
        <Text style={styles.rowEntryText}>#{placeholderRow.entry}</Text>

        <View style={styles.inputWrap}>
          <TextInput
            value=""
            onChangeText={onChangePlaceholderSerial}
            editable
            placeholder="Enter Serial"
            placeholderTextColor="#91A3B3"
            style={styles.serialInput}
          />
          <TouchableOpacity
            onPress={() => openScannerForRow(null, true)}
            activeOpacity={0.85}
            style={styles.scanBtn}
          >
            <BarcodeIcon width={rs(18)} height={rs(18)} />
          </TouchableOpacity>
        </View>

        <View style={styles.deleteBtnGhost} />
      </View>
    );
  }, [onChangePlaceholderSerial, openScannerForRow, placeholderRow]);

  const qtySelectedActive = selectedCount > 0;
  const bodyTitle = useMemo(() => {
    if (activeMode === 'ranges' && !hasGenerated) return 'Auto Generate Serials';
    return 'Serial Numbers';
  }, [activeMode, hasGenerated]);

  if (!visible) return null;

  return (
    <Modal visible={!!visible} animationType="slide" transparent onRequestClose={onClose}>
      {scannerVisible ? (
        <BarcodeScanner onScan={handleSerialScanned} onClose={() => setScannerVisible(false)} />
      ) : (
        <View style={styles.root}>
          <View style={styles.content}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
              <View style={styles.headerBar}>
                <Text style={styles.headerTitle}>{`${lineLabel} - Serial Number Details`}</Text>
                <TouchableOpacity onPress={onClose} activeOpacity={0.85} style={styles.closeBtn}>
                  <Text style={styles.closeTxt}>×</Text>
                </TouchableOpacity>
              </View>

              {showError ? (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorText}>{errorMsg}</Text>
                </View>
              ) : null}

              <View style={styles.topInfoWrapper}>
                <LinearGradient
                  colors={['#5D7688', '#233655']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.topInfo}
                >
                  <View style={styles.topLeft}>
                    <View style={styles.iconBox}>
                      <LotSerialItemIcon width={rs(32)} height={rs(32)} />
                    </View>
                    <View style={styles.itemTextBlock}>
                      <Text style={styles.itemLabel}>Item Name</Text>
                      <Text style={styles.itemValue} numberOfLines={1}>
                        {itemName || itemCode || '-'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.qtyInfo}>
                    <Text style={styles.topQtyLabel}>Qty Selected</Text>
                    <Text style={styles.qtyValue}>
                      <Text style={[styles.qtySelected, qtySelectedActive && styles.qtySelectedActive]}>
                        {selectedCount}
                      </Text>
                      <Text style={styles.qtySlash}>/</Text>
                      <Text style={styles.qtyTotal}>{qty}</Text>
                    </Text>
                  </View>
                </LinearGradient>
              </View>

              <View style={styles.tabsRow}>
                <TouchableOpacity
                  onPress={() => switchMode('ranges')}
                  activeOpacity={0.9}
                  style={[styles.tabBtn, activeMode === 'ranges' ? styles.tabBtnActive : null]}
                >
                  {activeMode === 'ranges' ? (
                    <SelectedRangesIcon width={rs(18)} height={rs(18)} />
                  ) : (
                    <RangesIcon width={rs(18)} height={rs(18)} />
                  )}
                  <Text style={[styles.tabText, activeMode === 'ranges' ? styles.tabTextActive : null]}>
                    Ranges
                  </Text>
                  <Text style={styles.tabSubText}>(Auto generate)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => switchMode('individual')}
                  activeOpacity={0.9}
                  style={[styles.tabBtn, activeMode === 'individual' ? styles.tabBtnActive : null]}
                >
                  {activeMode === 'individual' ? (
                    <SelectedIndividualIcon width={rs(18)} height={rs(18)} />
                  ) : (
                    <IndividualIcon width={rs(18)} height={rs(18)} />
                  )}
                  <Text style={[styles.tabText, activeMode === 'individual' ? styles.tabTextActive : null]}>
                    Individual
                  </Text>
                  <Text style={styles.tabSubText}>(Manual)</Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.scroll}
                contentContainerStyle={{ paddingBottom: rs(18) }}
                keyboardShouldPersistTaps="handled"
              >
                <View style={styles.sectionCard}>
                  <Text style={styles.sectionTitle}>{bodyTitle}</Text>

                  {activeMode === 'ranges' && !hasGenerated ? (
                    <View style={{ marginTop: rs(12) }}>
                      <View style={styles.autoBox}>
                        <View style={styles.autoRow}>
                          <View style={styles.fieldBox}>
                            <Text style={styles.fieldLabel}>Prefix</Text>
                            <TextInput
                              value={prefix}
                              onChangeText={t => {
                                clearError();
                                setPrefix(t);
                              }}
                              style={styles.fieldInput}
                              placeholder="SN"
                              placeholderTextColor="#91A3B3"
                              autoCapitalize="characters"
                            />
                          </View>

                          <View style={styles.fieldBox}>
                            <Text style={styles.fieldLabel}>Start Number</Text>
                            <View style={styles.spinnerBox}>
                              <TextInput
                                value={startNumberText}
                                onChangeText={onStartManualChange}
                                style={styles.spinnerInput}
                                keyboardType="number-pad"
                                placeholder="001"
                                placeholderTextColor="#91A3B3"
                              />
                              <View style={styles.spinnerBtns}>
                                <TouchableOpacity onPress={incStart} style={styles.spinnerBtn} activeOpacity={0.85}>
                                  <SerialUpIcon width={rs(16)} height={rs(16)} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={decStart} style={styles.spinnerBtn} activeOpacity={0.85}>
                                  <SerialDownIcon width={rs(16)} height={rs(16)} />
                                </TouchableOpacity>
                              </View>
                            </View>
                          </View>
                        </View>

                        <Text style={styles.helperText}>{helperRangeText}</Text>
                      </View>

                      <TouchableOpacity onPress={onPressGenerate} style={styles.generateBtn} activeOpacity={0.9}>
                        <Text style={styles.generateTxt}>Generate</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={{ marginTop: rs(12) }}>
                      <View style={styles.tableHeader}>
                        <Text style={styles.tableHeaderTxt}>Serial Numbers</Text>
                      </View>

                      <View style={styles.colsHeader}>
                        <Text style={styles.colEntry}>Entry</Text>
                        <Text style={styles.colSerial}>Serial No</Text>
                        <Text style={styles.colDel} />
                      </View>

                      {rows.map(renderRow)}
                      {renderPlaceholder}
                    </View>
                  )}
                </View>
              </ScrollView>

              {shouldShowFooter ? (
                <View style={styles.footerBar}>
                  <TouchableOpacity style={styles.deleteAllBtn} onPress={handleDeleteAll} activeOpacity={0.9}>
                    <Text style={styles.deleteAllText}>Delete All</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.9}>
                    <Text style={styles.saveText}>Save</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.addBtn, !canAddRow ? styles.addBtnDisabled : null]}
                    disabled={!canAddRow}
                    onPress={addSerialRow}
                    activeOpacity={0.9}
                  >
                    <Text style={[styles.addText, !canAddRow ? styles.addTextDisabled : null]}>Add Serial</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </KeyboardAvoidingView>
          </View>
        </View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'transparent' },
  content: { flex: 1, backgroundColor: '#FFFFFF', marginTop: rs(102) },

  headerBar: {
    height: rs(42),
    paddingHorizontal: rs(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E6EEF7',
  },
  headerTitle: { fontSize: rs(14), fontWeight: '600', color: '#233E55' },
  closeBtn: { width: rs(36), height: rs(36), alignItems: 'center', justifyContent: 'center' },
  closeTxt: { fontSize: rs(28), color: '#233E55', lineHeight: rs(30) },

  errorBanner: {
    marginTop: rs(8),
    marginHorizontal: rs(16),
    backgroundColor: '#DA1E28',
    borderRadius: rs(10),
    paddingVertical: rs(10),
    paddingHorizontal: rs(12),
  },
  errorText: { color: '#FFFFFF', fontSize: rs(12), fontWeight: '700' },

  topInfoWrapper: { marginTop: rs(8), marginHorizontal: rs(16) },
  topInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: rs(12),
    paddingVertical: rs(10),
    borderRadius: rs(8),
    alignItems: 'center',
  },
  topLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconBox: {
    width: rs(40),
    height: rs(40),
    borderRadius: rs(8),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: rs(10),
  },
  itemTextBlock: { flex: 1 },
  itemLabel: { fontSize: rs(11), color: '#FFFFFF', opacity: 0.8 },
  itemValue: { fontSize: rs(14), fontWeight: '600', color: '#FFFFFF', marginTop: rs(2) },

  qtyInfo: { alignItems: 'flex-end' },
  topQtyLabel: { fontSize: rs(11), color: '#FFFFFF', opacity: 0.8 },
  qtyValue: { marginTop: rs(2) },
  qtySelected: { fontSize: rs(14), fontWeight: '600', color: '#FFFFFF' },
  qtySelectedActive: { fontSize: rs(16) },
  qtySlash: { fontSize: rs(14), color: '#FFFFFF' },
  qtyTotal: { fontSize: rs(14), fontWeight: '600', color: '#FFFFFF' },

  tabsRow: {
    marginTop: rs(10),
    marginHorizontal: rs(16),
    flexDirection: 'row',
    gap: rs(10),
  },
  tabBtn: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    borderRadius: rs(10),
    paddingVertical: rs(10),
    paddingHorizontal: rs(10),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: rs(6),
  },
  tabBtnActive: { backgroundColor: '#CFE0FF' },
  tabText: { fontSize: rs(13), fontWeight: '800', color: '#445565' },
  tabTextActive: { color: '#233E55' },
  tabSubText: { fontSize: rs(10), fontWeight: '700', color: '#6B7C8B' },

  scroll: { flex: 1, paddingHorizontal: rs(16), paddingTop: rs(16) },

  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: rs(8),
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: rs(12),
  },
  sectionTitle: { fontSize: rs(14), color: '#1F2D3D', fontWeight: '800' },

  autoBox: {
    backgroundColor: '#ECF1F7',
    borderRadius: rs(10),
    padding: rs(12),
  },
  autoRow: { flexDirection: 'row', gap: rs(10) },

  fieldBox: { flex: 1 },
  fieldLabel: { fontSize: rs(12), color: '#5B6B79', fontWeight: '700', marginBottom: rs(6) },
  fieldInput: {
    borderWidth: 1,
    borderColor: '#D7DEE6',
    borderRadius: rs(10),
    paddingHorizontal: rs(12),
    paddingVertical: Platform.OS === 'ios' ? rs(12) : rs(8),
    fontSize: rs(13),
    color: '#1F2D3D',
    fontWeight: '700',
    backgroundColor: '#FFFFFF',
  },

  spinnerBox: {
    borderWidth: 1,
    borderColor: '#D7DEE6',
    borderRadius: rs(10),
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  spinnerInput: {
    flex: 1,
    paddingHorizontal: rs(12),
    paddingVertical: Platform.OS === 'ios' ? rs(12) : rs(8),
    fontSize: rs(13),
    color: '#1F2D3D',
    fontWeight: '800',
  },
  spinnerBtns: { width: rs(44), borderLeftWidth: 1, borderLeftColor: '#D7DEE6' },
  spinnerBtn: { height: rs(20), alignItems: 'center', justifyContent: 'center' },

  helperText: { marginTop: rs(10), fontSize: rs(12), color: '#6B7C8B', fontWeight: '700' },

  generateBtn: {
    marginTop: rs(12),
    height: rs(46),
    borderRadius: rs(12),
    backgroundColor: '#5D768B',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  generateTxt: { color: '#FFFFFF', fontSize: rs(14), fontWeight: '900' },

  tableHeader: {
    backgroundColor: '#EEF3FF',
    height: rs(40),
    borderTopLeftRadius: rs(10),
    borderTopRightRadius: rs(10),
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: rs(12),
  },
  tableHeaderTxt: { fontSize: rs(13), color: '#1F2D3D', fontWeight: '900' },

  colsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: rs(6),
    paddingTop: rs(12),
    paddingBottom: rs(6),
  },
  colEntry: { width: rs(60), fontSize: rs(11), color: '#6B7C8B', fontWeight: '800' },
  colSerial: { flex: 1, fontSize: rs(11), color: '#6B7C8B', fontWeight: '800' },
  colDel: { width: rs(36) },

  rowWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: rs(10),
    borderBottomWidth: 1,
    borderBottomColor: '#E7EDF3',
  },
  rowEntryText: { width: rs(60), fontSize: rs(13), fontWeight: '900', color: '#3B4B59' },

  inputWrap: { flex: 1, position: 'relative' },
  serialInput: {
    height: rs(40),
    borderWidth: 1,
    borderColor: '#D7DEE6',
    borderRadius: rs(10),
    paddingHorizontal: rs(12),
    paddingRight: rs(40),
    fontSize: rs(13),
    color: '#1F2D3D',
    fontWeight: '700',
    backgroundColor: '#FFFFFF',
  },
  serialInputDisabled: { backgroundColor: '#F2F5F8', color: '#5B6B79' },

  scanBtn: {
    position: 'absolute',
    right: rs(10),
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },

  deleteBtn: { width: rs(36), height: rs(36), alignItems: 'center', justifyContent: 'center' },
  deleteBtnGhost: { width: rs(36), height: rs(36) },

  footerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: rs(16),
    paddingVertical: rs(12),
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    gap: rs(6),
  },
  deleteAllBtn: {
    height: rs(36),
    minWidth: rs(116),
    paddingHorizontal: rs(16),
    borderRadius: rs(30),
    backgroundColor: '#DA1E28',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteAllText: { color: '#FFFFFF', fontSize: rs(13), fontWeight: '500' },
  saveBtn: {
    height: rs(36),
    minWidth: rs(116),
    paddingHorizontal: rs(24),
    borderRadius: rs(30),
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveText: { color: '#FFFFFF', fontSize: rs(13), fontWeight: '500' },
  addBtn: {
    height: rs(36),
    minWidth: rs(116),
    paddingHorizontal: rs(24),
    borderRadius: rs(30),
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#5D768B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtnDisabled: { borderColor: '#CCCCCC', backgroundColor: '#F5F5F5' },
  addText: { color: '#233E55', fontSize: rs(13), fontWeight: '500' },
  addTextDisabled: { color: '#888888' },
});
