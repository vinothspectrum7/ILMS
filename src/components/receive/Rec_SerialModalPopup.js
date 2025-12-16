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
import SerialUpIcon from '../../assets/icons/serialupicon.svg';
import SerialDownIcon from '../../assets/icons/serialdownicon.svg';
import SerialDeleteIcon from '../../assets/icons/serialdeleteicon.svg';
import BarcodeIcon from '../../assets/icons/barcodeicon.svg';
import LotSerialItemIcon from '../../assets/icons/lotserialitem.svg';
import BarcodeScanner from '../../screens/BarCodeScanner';
import ErrorIcon from '../../assets/icons/error.svg';

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
  const initialSerialsNormalized = useMemo(() => normalizeInitialSerials(initialSerials), [initialSerials]);

  const normalizeMode = m => (m === 'manual' || m === 'individual' ? 'manual' : 'ranges');
  const [activeMode, setActiveMode] = useState(normalizeMode(initialMode));

  const [rangesRows, setRangesRows] = useState([]);
  const [rangesHasGenerated, setRangesHasGenerated] = useState(false);
  const [prefix, setPrefix] = useState('SN');
  const [startNumberText, setStartNumberText] = useState('1');

  const [manualRows, setManualRows] = useState([{ id: makeId(), entry: 1, serial: '', source: 'manual' }]);

  const [addSerialText, setAddSerialText] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [scannerVisible, setScannerVisible] = useState(false);
  const scanTargetRef = useRef({ type: 'row', rowId: null });
  const clearError = useCallback(() => setErrorMsg(''), []);

  const activeRows = activeMode === 'ranges' ? rangesRows : manualRows;

  const setActiveRows = useCallback(
    updater => {
      if (activeMode === 'ranges') {
        setRangesRows(prev => updater([...prev]).map((r, i) => ({ ...r, entry: i + 1 })));
      } else {
        setManualRows(prev => updater([...prev]).map((r, i) => ({ ...r, entry: i + 1 })));
      }
    },
    [activeMode],
  );

  const startNumberValue = useMemo(() => {
    const cleaned = String(startNumberText ?? '').replace(/[^\d]/g, '');
    if (!cleaned) return 0;
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : 0;
  }, [startNumberText]);

  const selectedCount = useMemo(
    () => activeRows.filter(r => (r.serial || '').trim().length > 0).length,
    [activeRows],
  );

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

  const computeDupIds = useCallback(list => {
    const map = new Map();
    list.forEach(r => {
      const v = (r.serial || '').trim().toLowerCase();
      if (!v) return;
      if (!map.has(v)) map.set(v, []);
      map.get(v).push(r.id);
    });
    const dups = new Set();
    map.forEach(ids => {
      if (ids.length > 1) ids.forEach(id => dups.add(id));
    });
    return dups;
  }, []);

  const dupIds = useMemo(() => computeDupIds(activeRows), [activeRows, computeDupIds]);

  const canAddRow = useMemo(() => activeRows.length < qty, [activeRows.length, qty]);
  const showTouchArea = activeMode === 'ranges' ? rangesHasGenerated : true;
  const shouldShowFooter = activeMode === 'ranges' ? rangesHasGenerated : true;

  const trimmedAddText = useMemo(() => String(addSerialText || '').trim(), [addSerialText]);

  const canAddByTyping = useMemo(() => {
    if (!showTouchArea) return false;
    if (!canAddRow) return false;
    return trimmedAddText.length > 0;
  }, [showTouchArea, canAddRow, trimmedAddText]);

  const hydrateOnOpen = useCallback(() => {
    clearError();
    scanTargetRef.current = { type: 'row', rowId: null };
    setScannerVisible(false);
    setAddSerialText('');
    const mode = normalizeMode(initialMode);
    setActiveMode(mode);
    setPrefix('SN');
    setStartNumberText('1');

    if (mode === 'manual') {
      if (initialSerialsNormalized.length > 0) {
        const list = initialSerialsNormalized.slice(0, qty).map((s, i) => ({
          id: makeId(),
          entry: i + 1,
          serial: s,
          source: 'manual',
        }));
        setManualRows(list.length ? list : [{ id: makeId(), entry: 1, serial: '', source: 'manual' }]);
      } else {
        setManualRows([{ id: makeId(), entry: 1, serial: '', source: 'manual' }]);
      }
      setRangesRows([]);
      setRangesHasGenerated(false);
      return;
    }

    if (initialSerialsNormalized.length > 0) {
      const list = initialSerialsNormalized.slice(0, qty).map((s, i) => ({
        id: makeId(),
        entry: i + 1,
        serial: s,
        source: 'auto',
      }));
      setRangesRows(list);
      setRangesHasGenerated(true);
    } else {
      setRangesRows([]);
      setRangesHasGenerated(false);
    }
    setManualRows([{ id: makeId(), entry: 1, serial: '', source: 'manual' }]);
  }, [clearError, initialMode, initialSerialsNormalized, qty]);

  useEffect(() => {
    if (visible) hydrateOnOpen();
  }, [visible, hydrateOnOpen]);

  const openScannerForRow = useCallback(
    rowId => {
      clearError();
      scanTargetRef.current = { type: 'row', rowId: rowId || null };
      setScannerVisible(true);
    },
    [clearError],
  );

  const openScannerForAddBar = useCallback(() => {
    clearError();
    if (!showTouchArea || !canAddRow) return;
    scanTargetRef.current = { type: 'addbar', rowId: null };
    setScannerVisible(true);
  }, [clearError, showTouchArea, canAddRow]);

  const handleSerialScanned = useCallback(
    codeString => {
      const v = String(codeString || '').trim();
      setScannerVisible(false);
      if (!v) return;

      const target = scanTargetRef.current;

      if (target.type === 'addbar') {
        setActiveRows(list => {
          if (list.length >= qty) return list;
          list.push({ id: makeId(), entry: list.length + 1, serial: v, source: 'scan' });
          return list.slice(0, qty);
        });
        scanTargetRef.current = { type: 'row', rowId: null };
        return;
      }

      setActiveRows(list => {
        const idx = list.findIndex(r => r.id === target.rowId);
        if (idx >= 0) list[idx] = { ...list[idx], serial: v, source: 'scan' };
        return list;
      });
      scanTargetRef.current = { type: 'row', rowId: null };
    },
    [qty, setActiveRows],
  );

  const setRowSerial = useCallback(
    (rowId, value) => {
      clearError();
      setActiveRows(list => {
        const idx = list.findIndex(r => r.id === rowId);
        if (idx >= 0) list[idx] = { ...list[idx], serial: value };
        return list;
      });
    },
    [clearError, setActiveRows],
  );

  const deleteRow = useCallback(
    rowId => {
      clearError();
      setActiveRows(list => list.filter(r => r.id !== rowId));
    },
    [clearError, setActiveRows],
  );

  const addRowFromTyping = useCallback(() => {
    clearError();
    if (!canAddByTyping) return;
    const v = trimmedAddText;
    setActiveRows(list => [...list, { id: makeId(), entry: list.length + 1, serial: v, source: 'added' }]);
    setAddSerialText('');
  }, [clearError, canAddByTyping, trimmedAddText, setActiveRows]);

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
      source: 'auto',
    }));
    setRangesRows(generated);
    setRangesHasGenerated(true);
    setAddSerialText('');
  }, [clearError, prefix, qty, startNumberValue]);

  const validateAndGetSerials = useCallback(() => {
    if (!Number.isFinite(qty) || qty <= 0) return { ok: false, msg: 'Invalid quantity' };
    if (activeRows.length !== qty) return { ok: false, msg: `Please ensure ${qty} serials are entered` };
    const serials = activeRows.map(r => (r.serial || '').trim());
    if (serials.some(s => !s)) return { ok: false, msg: 'Please fill all serial numbers' };
    if (computeDupIds(activeRows).size > 0) return { ok: false, msg: 'Same Serial No cannot be repeated' };
    return { ok: true, msg: '', serials };
  }, [activeRows, qty, computeDupIds]);

  const handleSave = useCallback(() => {
    const v = validateAndGetSerials();
    if (!v.ok) {
      setErrorMsg(v.msg);
      return;
    }
    clearError();
    onSave?.(v.serials, activeMode);
    setAddSerialText('');
    if (activeMode === 'ranges') {
      setManualRows([{ id: makeId(), entry: 1, serial: '', source: 'manual' }]);
    } else {
      setRangesRows([]);
      setRangesHasGenerated(false);
      setPrefix('SN');
      setStartNumberText('1');
    }
  }, [activeMode, clearError, onSave, validateAndGetSerials]);

  const handleDeleteAll = useCallback(() => {
    clearError();
    scanTargetRef.current = { type: 'row', rowId: null };
    setScannerVisible(false);
    setAddSerialText('');
    if (activeMode === 'ranges') {
      setRangesRows([]);
      setRangesHasGenerated(false);
      setPrefix('SN');
      setStartNumberText('1');
      return;
    }
    setManualRows([{ id: makeId(), entry: 1, serial: '', source: 'manual' }]);
  }, [activeMode, clearError]);

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
      const nm = nextMode === 'manual' || nextMode === 'individual' ? 'manual' : 'ranges';
      if (nm === activeMode) return;
      clearError();
      scanTargetRef.current = { type: 'row', rowId: null };
      setScannerVisible(false);
      setAddSerialText('');
      if (nm === 'manual' && manualRows.length === 0) {
        setManualRows([{ id: makeId(), entry: 1, serial: '', source: 'manual' }]);
      }
      setActiveMode(nm);
    },
    [activeMode, clearError, manualRows.length],
  );

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

              {!!errorMsg && (
                <View style={styles.errorBanner}>
                  <ErrorIcon width={rs(16)} height={rs(16)} />
                  <Text style={styles.errorText}>{errorMsg}</Text>
                </View>
              )}

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
                      <Text style={styles.qtySelected}>{selectedCount}</Text>
                      <Text style={styles.qtySlash}>/</Text>
                      <Text style={styles.qtyTotal}>{qty}</Text>
                    </Text>
                  </View>
                </LinearGradient>
              </View>

              <LinearGradient
                colors={['#89ADC9', '#B1CADE']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.modeBar}
              >
                <Text style={styles.modeLeftText}>Add Serial</Text>
                <View style={styles.modeTabs}>
                  <TouchableOpacity
                    onPress={() => switchMode('ranges')}
                    activeOpacity={0.9}
                    style={[
                      styles.modeTabBtn,
                      activeMode === 'ranges' ? styles.modeTabBtnActive : styles.modeTabBtnInactive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.modeTabTxt,
                        activeMode === 'ranges' ? styles.modeTabTxtActive : styles.modeTabTxtInactive,
                      ]}
                    >
                      Ranges
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => switchMode('manual')}
                    activeOpacity={0.9}
                    style={[
                      styles.modeTabBtn,
                      activeMode === 'manual' ? styles.modeTabBtnActive : styles.modeTabBtnInactive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.modeTabTxt,
                        activeMode === 'manual' ? styles.modeTabTxtActive : styles.modeTabTxtInactive,
                      ]}
                    >
                      Manual
                    </Text>
                  </TouchableOpacity>
                </View>
              </LinearGradient>

              <ScrollView
                style={styles.scroll}
                contentContainerStyle={{ paddingBottom: rs(18) }}
                keyboardShouldPersistTaps="handled"
              >
                {activeMode === 'ranges' && !rangesHasGenerated ? (
                  <View style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>Auto Generate Serials</Text>
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
                  <View style={styles.sectionCard}>
                    <View style={[styles.addTouchWrap, (!showTouchArea || !canAddRow) && styles.addTouchDisabled]}>
                      <TextInput
                        value={addSerialText}
                        onChangeText={t => {
                          clearError();
                          setAddSerialText(t);
                        }}
                        placeholder="Add Serial Number"
                        placeholderTextColor="#6B7C8B"
                        style={styles.addTouchInput}
                        editable={!!showTouchArea && !!canAddRow}
                        autoCapitalize="characters"
                      />
                      <TouchableOpacity
                        onPress={openScannerForAddBar}
                        activeOpacity={0.85}
                        disabled={!showTouchArea || !canAddRow}
                        style={[
                          styles.addTouchScan,
                          (!showTouchArea || !canAddRow) && styles.addTouchScanDisabled,
                        ]}
                      >
                        <BarcodeIcon width={rs(18)} height={rs(18)} />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.tableHeader}>
                      <Text style={styles.tableHeaderTxt}>Serial Numbers</Text>
                    </View>
                    <View style={styles.colsHeader}>
                      <Text style={styles.colEntry}>Entry</Text>
                      <Text style={styles.colSerial}>Serial No</Text>
                      <Text style={styles.colDel} />
                    </View>

                    {activeRows.map(r => {
                      const locked = r.source === 'auto' || r.source === 'scan';
                      return (
                        <View key={r.id} style={styles.rowWrap}>
                          <Text style={styles.rowEntryText}>#{r.entry}</Text>
                          <View style={styles.inputWrap}>
                            <View
                              style={[
                                styles.inputBox,
                                locked && styles.inputBoxLocked,
                                dupIds.has(r.id) && styles.inputBoxError,
                              ]}
                            >
                              <TextInput
                                value={r.serial}
                                onChangeText={txt => setRowSerial(r.id, txt)}
                                placeholder="Enter Serial"
                                placeholderTextColor="#91A3B3"
                                style={[styles.serialInput, locked && styles.serialInputLocked]}
                                editable={!locked}
                              />
                            </View>
                            <TouchableOpacity
                              onPress={() => openScannerForRow(r.id)}
                              activeOpacity={0.85}
                              disabled={locked}
                              style={[styles.scanBtn, locked && styles.scanBtnDisabled]}
                            >
                              <BarcodeIcon width={rs(18)} height={rs(18)} />
                            </TouchableOpacity>
                          </View>
                          <TouchableOpacity
                            onPress={() => deleteRow(r.id)}
                            activeOpacity={0.85}
                            style={styles.deleteBtn}
                          >
                            <SerialDeleteIcon width={rs(18)} height={rs(18)} />
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                  </View>
                )}
              </ScrollView>

              {shouldShowFooter && (
                <View style={styles.footerBar}>
                  <TouchableOpacity style={styles.deleteAllBtn} onPress={handleDeleteAll} activeOpacity={0.9}>
                    <Text style={styles.deleteAllText}>Delete All</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.9}>
                    <Text style={styles.saveText}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.addBtn, (!canAddByTyping || !canAddRow) && styles.addBtnDisabled]}
                    disabled={!canAddByTyping || !canAddRow}
                    onPress={addRowFromTyping}
                    activeOpacity={0.9}
                  >
                    <Text style={[styles.addText, (!canAddByTyping || !canAddRow) && styles.addTextDisabled]}>
                      Add Serial
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
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
    borderRadius: rs(8),
    backgroundColor: '#FDE3E3',
    paddingVertical: rs(8),
    paddingHorizontal: rs(10),
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: { color: '#D32F2F', fontSize: rs(12), fontWeight: '600', marginLeft: rs(6) },

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
  iconBox: { width: rs(40), height: rs(40), borderRadius: rs(8), alignItems: 'center', justifyContent: 'center', marginRight: rs(10) },
  itemTextBlock: { flex: 1 },
  itemLabel: { fontSize: rs(11), color: '#FFFFFF', opacity: 0.8 },
  itemValue: { fontSize: rs(14), fontWeight: '600', color: '#FFFFFF', marginTop: rs(2) },

  qtyInfo: { alignItems: 'flex-end' },
  topQtyLabel: { fontSize: rs(11), color: '#FFFFFF', opacity: 0.8 },
  qtyValue: { marginTop: rs(2) },
  qtySelected: { fontSize: rs(14), fontWeight: '600', color: '#FFFFFF' },
  qtySlash: { fontSize: rs(14), color: '#FFFFFF' },
  qtyTotal: { fontSize: rs(14), fontWeight: '600', color: '#FFFFFF' },

  modeBar: {
    marginTop: rs(12),
    marginHorizontal: rs(16),
    borderRadius: rs(8),
    paddingVertical: rs(6),
    paddingHorizontal: rs(10),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modeLeftText: { color: '#FFFFFF', fontSize: rs(12), fontWeight: '700' },
  modeTabs: { flexDirection: 'row', gap: rs(8) },

  modeTabBtn: {
    paddingVertical: rs(6),
    paddingHorizontal: rs(25),
    borderRadius: rs(4),
    borderWidth: 1,
  },
  modeTabBtnActive: { backgroundColor: '#5D768B', borderColor: '#5D768B' },
  modeTabBtnInactive: { backgroundColor: '#FFFFFF', borderColor: '#FFFFFF' },
  modeTabTxt: { fontSize: rs(12), fontWeight: '700' },
  modeTabTxtActive: { color: '#FFFFFF' },
  modeTabTxtInactive: { color: '#595A5C' },

  scroll: { flex: 1, paddingHorizontal: rs(16), paddingTop: rs(12) },

  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: rs(10),
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: rs(12),
  },
  sectionTitle: { fontSize: rs(14), color: '#1F2D3D', fontWeight: '700' },

  autoBox: { backgroundColor: '#ECF1F7', borderRadius: rs(10), padding: rs(12) },
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
  spinnerBtns: { width: rs(34), borderLeftWidth: 1, borderLeftColor: '#D7DEE6' },
  spinnerBtn: { height: rs(20), alignItems: 'center', justifyContent: 'center' },

  helperText: { marginTop: rs(10), fontSize: rs(12), color: '#595A5C', fontWeight: '700' },

  generateBtn: {
    marginTop: rs(12),
    height: rs(40),
    borderRadius: rs(4),
    backgroundColor: '#5D768B',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  generateTxt: { color: '#FFFFFF', fontSize: rs(14), fontWeight: '700' },

  tableHeader: {
    backgroundColor: '#D9E4EE',
    height: rs(40),
    borderTopLeftRadius: rs(10),
    borderTopRightRadius: rs(10),
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: rs(12),
    marginTop: rs(12),
  },
  tableHeaderTxt: { fontSize: rs(12), color: '#242424', fontWeight: '600' },

  colsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: rs(6),
    paddingTop: rs(12),
    paddingBottom: rs(6),
  },
  colEntry: { width: rs(60), fontSize: rs(11), color: '#5D768B', fontWeight: '600' },
  colSerial: { flex: 1, fontSize: rs(11), color: '#5D768B', fontWeight: '600' },
  colDel: { width: rs(36) },

  rowWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: rs(8),
    paddingHorizontal: rs(6),
    borderRadius: rs(10),
    backgroundColor: '#D9E4EE',
    marginBottom: rs(10),
  },
  rowEntryText: { width: rs(60), fontSize: rs(13), fontWeight: '700', color: '#3B4B59' },

  inputWrap: { flex: 1, position: 'relative' },
  inputBox: {
    height: rs(40),
    borderRadius: rs(8),
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D7DEE6',
    paddingHorizontal: rs(12),
    justifyContent: 'center',
    ...Platform.select({
      android: { elevation: 2 },
      ios: { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 3, shadowOffset: { width: 0, height: 2 } },
    }),
  },
  inputBoxLocked: { backgroundColor: '#F6F8FA' },
  inputBoxError: { borderColor: '#D32F2F' },
  serialInput: {
    fontSize: rs(13),
    color: '#000000',
    fontWeight: '700',
    paddingRight: rs(40),
  },
  serialInputLocked: { color: '#3B4B59' },
  scanBtn: { position: 'absolute', right: rs(10), top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  scanBtnDisabled: { opacity: 0.4 },

  deleteBtn: { width: rs(36), height: rs(36), alignItems: 'center', justifyContent: 'center' },

  addTouchWrap: {
    height: rs(46),
    borderRadius: rs(10),
    borderWidth: 1,
    borderColor: '#C9D6E1',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: rs(12),
    marginBottom: rs(12),
  },
  addTouchDisabled: { opacity: 0.45 },
  addTouchInput: {
    flex: 1,
    fontSize: rs(12),
    color: '#1F2D3D',
    fontWeight: '700',
    paddingVertical: 0,
    paddingRight: rs(10),
  },
  addTouchScan: {
    width: rs(36),
    height: rs(36),
    borderRadius: rs(8),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E9F0F7',
  },
  addTouchScanDisabled: { backgroundColor: '#EFF4F8' },

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
