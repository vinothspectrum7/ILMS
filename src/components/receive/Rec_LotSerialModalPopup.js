import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import LinearGradient from 'react-native-linear-gradient';
import CloseIcon from '../../assets/icons/close.svg';
import CalendarIcon from '../../assets/icons/calendar.svg';
import BarcodeScannerIcon from '../../assets/icons/barcodescanner.svg';
import BarcodeIcon from '../../assets/icons/barcodeicon.svg';
import Rec_CustomNumericInput from './Rec_CustomNumericInput';
import BarcodeScanner from '../../screens/BarCodeScanner';
import LotSerialItemIcon from '../../assets/icons/lotserialitem.svg';
import LotSerialDeleteIcon from '../../assets/icons/lotserialdelete.svg';
import SerialDeleteIcon from '../../assets/icons/serialdeleteicon.svg';
import LotSerialAddIcon from '../../assets/icons/lotserialaddicon.svg';
import LotSerialUpArrowIcon from '../../assets/icons/lotserialuparrowicon.svg';
import LotSerialDownArrowIcon from '../../assets/icons/lotserialdownarrowicon.svg';
import SerialUpIcon from '../../assets/icons/serialupicon.svg';
import SerialDownIcon from '../../assets/icons/serialdownicon.svg';
import ErrorIcon from '../../assets/icons/error.svg';

const { width: SCREEN_WIDTH } = require('react-native').Dimensions.get('window');
const BASE_WIDTH = 375;
const rs = v => (SCREEN_WIDTH / BASE_WIDTH) * v;

const formatDate = date => {
  if (!date) return '';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

const parseDate = str => {
  if (!str) return null;
  const parts = String(str).split('/');
  if (parts.length !== 3) return null;
  const [dd, mm, yyyy] = parts.map(p => parseInt(p, 10));
  if (!dd || !mm || !yyyy) return null;
  const d = new Date(yyyy, mm - 1, dd);
  if (Number.isNaN(d.getTime())) return null;
  return d;
};

const pad2 = n => String(n).padStart(2, '0');
const padN = (num, n) => String(Math.max(0, Number(num) || 0)).padStart(n, '0');
const makeId = () => `${Date.now()}_${Math.random().toString(16).slice(2)}`;

const generateLotNumber = () => {
  const d = new Date();
  const yy = String(d.getFullYear()).slice(-2);
  const mm = pad2(d.getMonth() + 1);
  const dd = pad2(d.getDate());
  const rand = String(Math.floor(100 + Math.random() * 900));
  return `LOT${yy}${mm}${dd}-${rand}`;
};

const computeDupIds = list => {
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
};


export default function Rec_LotSerialModalPopup({
  visible,
  onClose,
  lineQty = 0,
  itemName = '',
  itemCode = '',
  initialLots = [],
  initialData = [],
  onSave,
  onComplete,
  lineLabel,
  mode = 'receive', // 'receive' | 'putAway'
  putAwayMode = false,
}) {

  const isPutAway = String(mode || '').toLowerCase() === 'putaway' || !!putAwayMode;
  const [lots, setLots] = useState([]);
  const [scannerVisible, setScannerVisible] = useState(false);
  const [scanContext, setScanContext] = useState({
    kind: null,
    lotIdx: null,
    rowId: null,
    fromAddBar: false,
  });
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [datePickerDate, setDatePickerDate] = useState(new Date());
  const [datePickerLotIdx, setDatePickerLotIdx] = useState(null);
  const [datePickerField, setDatePickerField] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const clearError = () => setErrorMsg('');

  const createEmptyLot = (idx, base = {}) => ({
  idx,
  lotNumber: base.lotNumber || '',
  mfgDate: base.mfgDate || '',
  expDate: base.expDate || '',
  qty: Number(base.qty) || 0,
  serialMode: base.serialMode || null,
  serialRows: Array.isArray(base.serials)
    ? base.serials.map((s, i) => ({
        id: makeId(),
        entry: i + 1,
        serial: String(s || ''),
        source: base.serialMode === 'ranges' ? 'auto' : 'manual',
      }))
    : [],
  serialExpanded: false,
  prefix: 'SN',
  startNumberText: '1',
  rangesHasGenerated:
    base.serialMode === 'ranges' && Array.isArray(base.serials) && base.serials.length > 0,
  addSerialText: '',
});

  useEffect(() => {
    if (!visible) return;
    const seedLots =
      Array.isArray(initialLots) && initialLots.length > 0
        ? initialLots
        : Array.isArray(initialData) && initialData.length > 0
        ? initialData
        : [];

    if (seedLots.length > 0) {
      const nextLots = seedLots.map((l, index) =>
        createEmptyLot(Number.isFinite(l.idx) ? l.idx : index, l),
      );
      setLots(nextLots);
    } else {
      setLots([createEmptyLot(0)]);
    }

    setErrorMsg('');
    setScannerVisible(false);
    setScanContext({ kind: null, lotIdx: null, rowId: null, fromAddBar: false });
    setDatePickerVisible(false);
  }, [visible, initialLots]);

  const totalQty = useMemo(() => lots.reduce((sum, l) => sum + (Number(l.qty) || 0), 0), [lots]);

  const remainingQty = Math.max(lineQty - totalQty, 0);
  const canAddMoreLots = remainingQty > 0;

  const updateLot = (idx, patch) => {
    setLots(prev => prev.map(l => (l.idx === idx ? { ...l, ...patch } : l)));
  };

  const updateLotSerials = (idx, updater) => {
    setLots(prev =>
      prev.map(l => {
        if (l.idx !== idx) return l;
        const next = updater([...(l.serialRows || [])]);
        return { ...l, serialRows: next.map((row, i) => ({ ...row, entry: i + 1 })) };
      }),
    );
  };

  const handleQtyChange = (idx, nextQty) => {
    const current = lots.find(l => l.idx === idx);
    const currentQty = Number(current?.qty) || 0;
    const otherTotal = totalQty - currentQty + (Number(nextQty) || 0);
    if (otherTotal > lineQty) return;
    updateLot(idx, { qty: nextQty });
    setErrorMsg('');
  };

  const handleAddLot = () => {
    if (!canAddMoreLots) return;
    const nextIdx = lots.length ? Math.max(...lots.map(l => l.idx)) + 1 : 0;
    setLots(prev => [...prev, createEmptyLot(nextIdx)]);
  };

  const handleDeleteLot = idx => {
    setLots(prev => prev.filter(l => l.idx !== idx));
  };

  const handleDeleteAllLots = () => {
    setLots([createEmptyLot(0)]);
    setErrorMsg('');
  };

  const openScannerForLot = idx => {
    clearError();
    setScanContext({ kind: 'lot', lotIdx: idx, rowId: null, fromAddBar: false });
    setScannerVisible(true);
  };

  const openScannerForSerial = (lotIdx, rowId = null, fromAddBar = false) => {
    clearError();
    setScanContext({ kind: 'serial', lotIdx, rowId, fromAddBar: !!fromAddBar });
    setScannerVisible(true);
  };

  const handleBarcodeScanned = codeString => {
    const scannedRaw = String(codeString || '').trim();
    setScannerVisible(false);
    if (!scannedRaw) return;
    const ctx = scanContext;

    if (ctx.kind === 'lot') {
      updateLot(ctx.lotIdx, { lotNumber: scannedRaw });
      return;
    }

    if (ctx.kind === 'serial') {
      setScanContext({ kind: null, lotIdx: null, rowId: null, fromAddBar: false });
      const lot = lots.find(l => l.idx === ctx.lotIdx);
      if (!lot) return;

      const lotQty = Number(lot.qty) || 0;

      if (ctx.fromAddBar) {
        updateLotSerials(ctx.lotIdx, list => {
          if (list.length >= lotQty) return list;
          return [...list, { id: makeId(), entry: list.length + 1, serial: scannedRaw, source: 'scan' }];
        });
        updateLot(ctx.lotIdx, { serialMode: lot.serialMode || 'manual', serialExpanded: true });
        return;
      }

      updateLotSerials(ctx.lotIdx, list => {
        const idx = list.findIndex(r => r.id === ctx.rowId);
        if (idx >= 0) list[idx] = { ...list[idx], serial: scannedRaw, source: 'scan' };
        return list;
      });
      updateLot(ctx.lotIdx, { serialMode: lot.serialMode || 'manual', serialExpanded: true });
    }
  };

  const openDatePicker = (lotIdx, field, currentValue) => {
    const parsed = parseDate(currentValue);
    setDatePickerDate(parsed || new Date());
    setDatePickerLotIdx(lotIdx);
    setDatePickerField(field);
    setDatePickerVisible(true);
  };

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      if (event.type === 'dismissed') {
        setDatePickerVisible(false);
        return;
      }
    }
    const chosen = selectedDate || datePickerDate;
    setDatePickerVisible(Platform.OS === 'ios');
    if (datePickerLotIdx != null && datePickerField) {
      const formatted = formatDate(chosen);
      const key = datePickerField === 'mfg' ? 'mfgDate' : 'expDate';
      updateLot(datePickerLotIdx, { [key]: formatted });
    }
  };

  const handleSwitchMode = (lotIdx, mode) => {
    const nm = mode === 'manual' ? 'manual' : 'ranges';
    const lot = lots.find(l => l.idx === lotIdx);
    if (!lot) return;
    clearError();
    updateLot(lotIdx, { addSerialText: '' });

    const lotQty = Number(lot.qty) || 0;

    if (nm === 'ranges') {
      updateLot(lotIdx, {
        serialMode: 'ranges',
        prefix: 'SN',
        startNumberText: '1',
        rangesHasGenerated: false,
        serialExpanded: false,
      });
      updateLotSerials(lotIdx, () => []);
      return;
    }

    if (nm === 'manual') {
      if (lot.serialRows && lot.serialRows.length > 0) {
        updateLot(lotIdx, { serialMode: 'manual', rangesHasGenerated: false, serialExpanded: true });
        return;
      }

      if (lotQty <= 0) {
        updateLot(lotIdx, { serialMode: 'manual', rangesHasGenerated: false, serialExpanded: false });
        updateLotSerials(lotIdx, () => []);
        return;
      }

      updateLot(lotIdx, { serialMode: 'manual', rangesHasGenerated: false, serialExpanded: true });
      updateLotSerials(lotIdx, () => [{ id: makeId(), entry: 1, serial: '', source: 'manual' }]);
    }
  };

  const handleRangeInputChange = (lotIdx, key, value) => {
    clearError();
    if (key === 'startNumberText') {
      const cleaned = String(value || '').replace(/[^\d]/g, '');
      updateLot(lotIdx, { startNumberText: cleaned });
      return;
    }
    updateLot(lotIdx, { [key]: value });
  };

  const incStart = lotIdx => {
    clearError();
    const lot = lots.find(l => l.idx === lotIdx);
    if (!lot) return;
    const base = Number(lot.startNumberText || 0) || 0;
    const next = Math.max(1, base + 1);
    updateLot(lotIdx, { startNumberText: String(next) });
  };

  const decStart = lotIdx => {
    clearError();
    const lot = lots.find(l => l.idx === lotIdx);
    if (!lot) return;
    const base = Number(lot.startNumberText || 0) || 0;
    const next = Math.max(1, base - 1);
    updateLot(lotIdx, { startNumberText: String(next) });
  };

  const handleGenerateRanges = lotIdx => {
    clearError();
    const lot = lots.find(l => l.idx === lotIdx);
    if (!lot) return;
    const qty = Number(lot.qty) || 0;
    const p = String(lot.prefix || '').trim();
    const s = Number(lot.startNumberText || 0);
    if (!Number.isFinite(qty) || qty <= 0) {
      setErrorMsg('Invalid quantity for this Lot');
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
    updateLotSerials(lotIdx, () => generated);
    updateLot(lotIdx, { serialMode: 'ranges', rangesHasGenerated: true, serialExpanded: true, addSerialText: '' });
  };

  const handleSerialAddFromBar = lotIdx => {
    clearError();
    const lot = lots.find(l => l.idx === lotIdx);
    if (!lot) return;

    const lotQty = Number(lot.qty) || 0;
    const rows = lot.serialRows || [];
    if (rows.length >= lotQty) return;

    const v = String(lot.addSerialText || '').trim();
    if (!v) return;

    updateLotSerials(lotIdx, list => [...list, { id: makeId(), entry: list.length + 1, serial: v, source: 'manual' }]);
    updateLot(lotIdx, { serialMode: lot.serialMode || 'manual', serialExpanded: true, addSerialText: '' });
  };

  const handleSerialDeleteRow = (lotIdx, rowId) => {
    clearError();
    updateLotSerials(lotIdx, list => list.filter(r => r.id !== rowId));
  };

  const handleSerialDeleteAll = lotIdx => {
    clearError();
    const lot = lots.find(l => l.idx === lotIdx);
    if (!lot) return;

    updateLot(lotIdx, { addSerialText: '' });

    if (lot.serialMode === 'ranges' && lot.rangesHasGenerated) {
      updateLot(lotIdx, {
        serialMode: null,
        rangesHasGenerated: false,
        serialExpanded: false,
        prefix: 'SN',
        startNumberText: '1',
      });
      updateLotSerials(lotIdx, () => []);
      return;
    }

    updateLotSerials(lotIdx, () => []);
    updateLot(lotIdx, { serialMode: null, serialExpanded: false });
  };

  const handleSerialChange = (lotIdx, rowId, value) => {
    clearError();
    updateLotSerials(lotIdx, list => {
      const idx = list.findIndex(r => r.id === rowId);
      if (idx >= 0) list[idx] = { ...list[idx], serial: value };
      return list;
    });
  };

  const toggleSerialExpand = lotIdx => {
    const lot = lots.find(l => l.idx === lotIdx);
    if (!lot) return;
    updateLot(lotIdx, { serialExpanded: !lot.serialExpanded });
  };

  const buildHelperRangeText = lot => {
    const qty = Number(lot.qty) || 0;
    const p = String(lot.prefix || '').trim();
    const cleaned = String(lot.startNumberText || '').replace(/[^\d]/g, '');
    if (!p) return 'Please enter Prefix';
    if (!cleaned) return 'Please enter Start Number';
    const s = Number(cleaned);
    if (!Number.isFinite(s) || s <= 0) return 'Please enter Start Number';
    if (!Number.isFinite(qty) || qty <= 0) return 'Invalid quantity';
    const end = Math.max(s, s + Math.max(0, qty - 1));
    const a = `${p}${padN(s, 6)}`;
    const b = `${p}${padN(end, 6)}`;
    return `We generate ${a} to ${b}`;
  };

  const validateBeforeSave = () => {
    if (!Number.isFinite(lineQty) || lineQty <= 0) {
      return { ok: false, msg: 'Invalid line quantity' };
    }
    if (lots.length === 0) {
      return { ok: false, msg: 'Please add at least one Lot' };
    }
    const sumQty = lots.reduce((sum, l) => sum + (Number(l.qty) || 0), 0);
    if (sumQty !== Number(lineQty)) {
      return { ok: false, msg: 'Enter the complete transfer quantity to continue.' };
    }

    for (let i = 0; i < lots.length; i += 1) {
      const lot = lots[i];
      const lotIdx = i + 1;
            // In PutAway mode, Mfg/Exp are optional. In Receive mode, keep existing strictness.
      if (!lot.lotNumber || !(Number(lot.qty) > 0)) {
        return { ok: false, msg: `Please fill all required Lot fields for Lot ${lotIdx}` };
      }

      if (!isPutAway) {
        if (!lot.mfgDate || !lot.expDate) {
          return { ok: false, msg: `Please fill all Lot fields for Lot ${lotIdx}` };
        }
      } else {
          if (!lot.expDate) {
           return { ok: false, msg: `Please enter Exp Date for Lot ${lotIdx}` };
           }
        // Optional dates in PutAway: if provided, must be valid DD/MM/YYYY
        if (lot.mfgDate && !parseDate(lot.mfgDate)) {
          return { ok: false, msg: `Invalid Mfg Date for Lot ${lotIdx}` };
        }
        if (lot.expDate && !parseDate(lot.expDate)) {
          return { ok: false, msg: `Invalid Exp Date for Lot ${lotIdx}` };
        }
      }

      const rows = lot.serialRows || [];
      if (!rows.length) continue;

      const trimmed = rows.map(r => (r.serial || '').trim());
      if (trimmed.some(s => !s)) {
        return { ok: false, msg: `Please fill all serial numbers for Lot ${lotIdx}` };
      }
      if (trimmed.length !== Number(lot.qty) || trimmed.length === 0) {
        return { ok: false, msg: `Serial count must be equal to Qty for Lot ${lotIdx}` };
      }
      const dupIds = computeDupIds(rows);
      if (dupIds.size > 0) {
        return { ok: false, msg: `Same Serial No cannot be repeated within Lot ${lotIdx}` };
      }
    }
    return { ok: true, msg: '' };
  };

  const handleSave = () => {
    const v = validateBeforeSave();
    if (!v.ok) {
      setErrorMsg(v.msg);
      return;
    }
    setErrorMsg('');
    const payload = lots.map(l => ({
      lotNumber: l.lotNumber,
      mfgDate: l.mfgDate,
      expDate: l.expDate,
      qty: l.qty,
      serialMode: l.serialRows && l.serialRows.length > 0 ? l.serialMode || 'manual' : null,
      serials: (l.serialRows || []).map(r => (r.serial || '').trim()),
    }));
        const total = payload.reduce((sum, x) => sum + (Number(x.qty) || 0), 0);

    const meta = {
      mode: isPutAway ? 'putAway' : 'receive',
      lotsCount: payload.length,
      totalQty: total,
      serialsCount: payload.reduce((s, l) => s + ((l.serials || []).length || 0), 0),
    };

    onSave?.(payload, total, meta);
    onComplete?.(payload, total, meta);
    onClose?.();

  };

  if (!visible) return null;

  const renderSerialSection = lot => {
    const lotQty = Number(lot.qty) || 0;
    if (lotQty <= 0) return null;

    const rows = lot.serialRows || [];
    const dupIds = computeDupIds(rows);
    const hasSerials = rows.length > 0;
    const canAddRow = rows.length < lotQty;

    const hasSerialModeForAddBar =
      lot.serialMode === 'manual' || (lot.serialMode === 'ranges' && lot.rangesHasGenerated);

    const trimmedBarText = String(lot.addSerialText || '').trim();
    const canAddByTyping = !!hasSerialModeForAddBar && !!lot.serialExpanded && !!canAddRow && trimmedBarText.length > 0;

    const renderSerialTable = () => {
      if (!lot.serialExpanded || !hasSerials) return null;
      return (
        <View style={styles.serialTableCard}>
          <View style={styles.serialHeaderRow}>
            <View style={styles.serialHeaderLeft}>
              <Text style={styles.serialHeaderEntry}>Entry</Text>
              <Text style={styles.serialHeaderSerial}>Serial No</Text>
            </View>
            <View style={styles.serialHeaderActions}>
              <TouchableOpacity
                onPress={() => handleSerialAddFromBar(lot.idx)}
                disabled={!canAddByTyping}
                style={[styles.serialHeaderIconBtn, !canAddByTyping && styles.serialHeaderIconDisabled]}
              >
                <LotSerialAddIcon width={rs(18)} height={rs(18)} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleSerialDeleteAll(lot.idx)} style={styles.serialHeaderIconBtn}>
                <LotSerialDeleteIcon width={rs(18)} height={rs(18)} />
              </TouchableOpacity>
            </View>
          </View>

          {rows.map(r => {
            const locked = r.source === 'auto' || r.source === 'scan';
            const hasError = dupIds.has(r.id);
            return (
              <View key={r.id} style={styles.serialRow}>
                <Text style={styles.serialEntryText}>{`#${r.entry}`}</Text>
                <View style={styles.serialInputWrap}>
                  <View style={[styles.serialInputBox, locked && styles.serialInputBoxLocked, hasError && styles.serialInputBoxError]}>
                    <TextInput
                      style={[styles.serialInput, locked && styles.serialInputLocked]}
                      value={r.serial}
                      editable={!locked}
                      placeholder="Enter Serial"
                      placeholderTextColor="#91A3B3"
                      onChangeText={txt => handleSerialChange(lot.idx, r.id, txt)}
                    />
                    <TouchableOpacity
                      onPress={() => openScannerForSerial(lot.idx, r.id, false)}
                      disabled={locked}
                      style={[styles.serialScanBtn, locked && styles.serialScanDisabled]}
                    >
                      <BarcodeIcon width={rs(18)} height={rs(18)} />
                    </TouchableOpacity>
                  </View>
                </View>
                <TouchableOpacity onPress={() => handleSerialDeleteRow(lot.idx, r.id)} style={styles.serialDeleteRowBtn}>
                  <SerialDeleteIcon width={rs(18)} height={rs(18)} />
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      );
    };

    const renderAutoGenerateSection = () => {
      if (lot.serialMode !== 'ranges' || lot.rangesHasGenerated) return null;
      return (
        <View style={styles.autoCard}>
          <Text style={styles.sectionTitle}>Auto Generate Serials</Text>
          <View style={styles.autoBox}>
            <View style={styles.autoRow}>
              <View style={styles.fieldBox}>
                <Text style={styles.fieldLabel}>
                  Mfg Date{!isPutAway ? <Text style={styles.required}>*</Text> : null}
                </Text>

                <TextInput
                  value={lot.prefix}
                  onChangeText={t => handleRangeInputChange(lot.idx, 'prefix', t)}
                  style={styles.fieldInput}
                  placeholder="SN"
                  placeholderTextColor="#91A3B3"
                  autoCapitalize="characters"
                />
              </View>
              <View style={styles.fieldBox}>
                <Text style={styles.fieldLabel}>
                  Exp Date{!isPutAway ? <Text style={styles.required}>*</Text> : null}
                </Text>

                <View style={styles.spinnerBox}>
                  <TextInput
                    value={lot.startNumberText}
                    onChangeText={t => handleRangeInputChange(lot.idx, 'startNumberText', t)}
                    style={styles.spinnerInput}
                    keyboardType="number-pad"
                    placeholder="001"
                    placeholderTextColor="#91A3B3"
                  />
                  <View style={styles.spinnerBtns}>
                    <TouchableOpacity onPress={() => incStart(lot.idx)} style={styles.spinnerBtn} activeOpacity={0.85}>
                      <SerialUpIcon width={rs(16)} height={rs(16)} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => decStart(lot.idx)} style={styles.spinnerBtn} activeOpacity={0.85}>
                      <SerialDownIcon width={rs(16)} height={rs(16)} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
            <Text style={styles.helperText}>{buildHelperRangeText(lot)}</Text>
          </View>
          <TouchableOpacity onPress={() => handleGenerateRanges(lot.idx)} style={styles.generateBtn} activeOpacity={0.9}>
            <Text style={styles.generateText}>Generate</Text>
          </TouchableOpacity>
        </View>
      );
    };

    const renderViewSerialsBar = () => {
      if (!hasSerials) return null;
      return (
        <TouchableOpacity onPress={() => toggleSerialExpand(lot.idx)} style={styles.viewSerialsBar} activeOpacity={0.9}>
          <Text style={styles.viewSerialsText}>View Serials</Text>
          {lot.serialExpanded ? (
            <LotSerialUpArrowIcon width={rs(18)} height={rs(18)} />
          ) : (
            <LotSerialDownArrowIcon width={rs(18)} height={rs(18)} />
          )}
        </TouchableOpacity>
      );
    };

    const renderAddSerialRow = () => {
      const showTabs = !hasSerials;
      if (!showTabs) return null;
      return (
        <LinearGradient colors={['#89ADC9', '#B1CADE']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.modeBar}>
          <Text style={styles.modeLeftText}>Add Serial</Text>
          <View style={styles.modeTabs}>
            <TouchableOpacity
              onPress={() => handleSwitchMode(lot.idx, 'ranges')}
              activeOpacity={0.9}
              style={[styles.modeTabBtn, lot.serialMode === 'ranges' ? styles.modeTabBtnActive : styles.modeTabBtnInactive]}
            >
              <Text style={[styles.modeTabText, lot.serialMode === 'ranges' ? styles.modeTabTextActive : styles.modeTabTextInactive]}>
                Ranges
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleSwitchMode(lot.idx, 'manual')}
              activeOpacity={0.9}
              style={[styles.modeTabBtn, lot.serialMode === 'manual' ? styles.modeTabBtnActive : styles.modeTabBtnInactive]}
            >
              <Text style={[styles.modeTabText, lot.serialMode === 'manual' ? styles.modeTabTextActive : styles.modeTabTextInactive]}>
                Manual
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      );
    };

    const renderAddSerialBar = () => {
      const enabled = !!hasSerialModeForAddBar && !!lot.serialExpanded && !!canAddRow;
      if (!hasSerialModeForAddBar || !lot.serialExpanded) return null;

      return (
        <View style={[styles.addTouchWrap, !enabled && styles.addTouchDisabled]}>
          <TextInput
            value={lot.addSerialText}
            onChangeText={t => {
              clearError();
              updateLot(lot.idx, { addSerialText: t });
            }}
            placeholder="Add Serial Number"
            placeholderTextColor="#6B7C8B"
            style={styles.addTouchInput}
            editable={enabled}
            autoCapitalize="characters"
          />
          <TouchableOpacity
            onPress={() => openScannerForSerial(lot.idx, null, true)}
            activeOpacity={0.85}
            disabled={!enabled}
            style={[styles.addTouchScan, !enabled && styles.addTouchScanDisabled]}
          >
            <BarcodeIcon width={rs(18)} height={rs(18)} />
          </TouchableOpacity>
        </View>
      );
    };

    return (
      <View style={styles.serialSection}>
        {renderAddSerialRow()}
        {renderAutoGenerateSection()}
        {renderViewSerialsBar()}
        {renderAddSerialBar()}
        {renderSerialTable()}
      </View>
    );
  };

  const qtySelectedActive = totalQty > 0;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      {scannerVisible ? (
        <BarcodeScanner
          onScan={handleBarcodeScanned}
          onClose={() => {
            setScannerVisible(false);
            setScanContext({ kind: null, lotIdx: null, rowId: null, fromAddBar: false });
          }}
        />
      ) : (
        <View style={styles.root}>
          <View style={styles.content}>
            <View style={styles.headerBar}>
              <Text style={styles.headerTitle}>
                {lineLabel ? `${lineLabel} - Lot + Serial Details` : 'Lot + Serial Details'}
              </Text>
              <TouchableOpacity onPress={onClose} hitSlop={{ top: rs(10), bottom: rs(10), left: rs(10), right: rs(10) }}>
                <CloseIcon width={rs(20)} height={rs(20)} />
              </TouchableOpacity>
            </View>

            {!!errorMsg && (
              <View style={styles.errorBanner}>
                <ErrorIcon width={rs(16)} height={rs(16)} />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            )}

            <View style={styles.topInfoWrapper}>
              <LinearGradient colors={['#5D7688', '#233655']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.topInfo}>
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
                    <Text style={[styles.qtySelected, qtySelectedActive && styles.qtySelectedActive]}>{totalQty}</Text>
                    <Text style={styles.qtySlash}>/</Text>
                    <Text style={styles.qtyTotal}>{lineQty}</Text>
                  </Text>
                </View>
              </LinearGradient>
            </View>

            <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: rs(100) }} keyboardShouldPersistTaps="handled">
              {lots.map((lot, index) => {
                const currentQty = Number(lot.qty) || 0;
                const otherTotal = totalQty - currentQty;
                const lotMax = Math.max(lineQty - otherTotal, 0);

                return (
                  <View key={lot.idx} style={styles.lotGroup}>
                    <View style={styles.lotCard}>
                      <View style={styles.lotHeaderRow}>
                        <Text style={styles.lotTitle}>{`Lot ${index + 1}`}</Text>
                        <TouchableOpacity
                          onPress={() => handleDeleteLot(lot.idx)}
                          hitSlop={{ top: rs(8), bottom: rs(8), left: rs(8), right: rs(8) }}
                        >
                          <View style={styles.lotDeleteIconWrapper}>
                            <LotSerialDeleteIcon width={rs(16)} height={rs(16)} />
                          </View>
                        </TouchableOpacity>
                      </View>

                      <Text style={styles.fieldLabel}>
                        Lot Number<Text style={styles.required}>*</Text>
                      </Text>

                      <View style={styles.lotNumberRow}>
                        <View style={styles.lotNumberInputWrap}>
                          <TextInput
                            style={styles.lotNumberInput}
                            value={lot.lotNumber}
                            onChangeText={t => updateLot(lot.idx, { lotNumber: t })}
                            placeholder="Enter Lot Number"
                          />
                          <TouchableOpacity
                            style={styles.barcodeBtn}
                            onPress={() => openScannerForLot(lot.idx)}
                            hitSlop={{ top: rs(10), bottom: rs(10), left: rs(10), right: rs(10) }}
                          >
                            <BarcodeScannerIcon width={rs(18)} height={rs(18)} />
                          </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                          style={styles.generateLotBtn}
                          onPress={() => updateLot(lot.idx, { lotNumber: generateLotNumber() })}
                          activeOpacity={0.85}
                        >
                          <Text style={styles.generateLotText}>Generate</Text>
                        </TouchableOpacity>
                      </View>

                      <View style={styles.row2}>
                        <View style={styles.col}>
                          <Text style={styles.fieldLabel}>
                            Mfg Date<Text style={styles.required}></Text>
                          </Text>
                          <View style={styles.dateRow}>
                            <TextInput
                              style={[styles.dateInput, styles.dateInputMfg]}
                              value={lot.mfgDate}
                              onChangeText={t => updateLot(lot.idx, { mfgDate: t })}
                              placeholder="DD/MM/YYYY"
                            />
                            <TouchableOpacity style={styles.dateIconBtn} onPress={() => openDatePicker(lot.idx, 'mfg', lot.mfgDate)}>
                              <CalendarIcon width={rs(16)} height={rs(16)} />
                            </TouchableOpacity>
                          </View>
                        </View>

                        <View style={styles.col}>
                          <Text style={styles.fieldLabel}>
                            Exp Date <Text style={styles.required}>*</Text>
                          </Text>
                          <View style={styles.dateRow}>
                            <TextInput
                              style={[styles.dateInput, styles.dateInputExp]}
                              value={lot.expDate}
                              onChangeText={t => updateLot(lot.idx, { expDate: t })}
                              placeholder="DD/MM/YYYY"
                            />
                            <TouchableOpacity style={styles.dateIconBtn} onPress={() => openDatePicker(lot.idx, 'exp', lot.expDate)}>
                              <CalendarIcon width={rs(16)} height={rs(16)} />
                            </TouchableOpacity>
                          </View>
                        </View>

                        <View style={styles.colQty}>
                          <Text style={styles.fieldLabel}>
                            Qty<Text style={styles.required}>*</Text>
                          </Text>
                          <Rec_CustomNumericInput
                            value={lot.qty}
                            setValue={next => handleQtyChange(lot.idx, next)}
                            min={0}
                            max={lotMax}
                            disabledinput={false}
                            width={rs(90)}
                            height={rs(40)}
                          />
                        </View>
                      </View>

                      {renderSerialSection(lot)}
                    </View>
                  </View>
                );
              })}

              {datePickerVisible && (
                <DateTimePicker
                  value={datePickerDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
                  onChange={handleDateChange}
                />
              )}
            </ScrollView>

            <View style={styles.footerBar}>
              <TouchableOpacity style={styles.deleteAllBtn} onPress={handleDeleteAllLots}>
                <Text style={styles.deleteAllText}>Delete</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.addLotBtn, !canAddMoreLots && styles.addLotDisabled]}
                disabled={!canAddMoreLots}
                onPress={handleAddLot}
              >
                <Text style={[styles.addLotText, !canAddMoreLots && styles.addLotTextDisabled]}>Add Lot</Text>
              </TouchableOpacity>
            </View>
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
  qtySelectedActive: { fontSize: rs(16) },
  qtySlash: { fontSize: rs(14), color: '#FFFFFF' },
  qtyTotal: { fontSize: rs(14), fontWeight: '600', color: '#FFFFFF' },

  scroll: { flex: 1, paddingHorizontal: rs(16), paddingTop: rs(16) },
  lotGroup: { marginBottom: rs(20) },
  lotCard: {
    borderRadius: rs(8),
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: rs(12),
    backgroundColor: '#FFFFFF',
  },
  lotHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ECF1F7',
    paddingHorizontal: rs(10),
    paddingVertical: rs(6),
    marginHorizontal: -rs(12),
    marginTop: -rs(12),
    marginBottom: rs(12),
    borderTopLeftRadius: rs(8),
    borderTopRightRadius: rs(8),
  },
  lotTitle: { fontSize: rs(14), fontWeight: '600', color: '#333333' },
  lotDeleteIconWrapper: { width: rs(24), height: rs(24), borderRadius: rs(12), alignItems: 'center', justifyContent: 'center' },

  fieldLabel: { fontSize: rs(12), color: '#555555', marginBottom: rs(6) },
  required: { color: '#E53935' },

  lotNumberRow: { flexDirection: 'row', alignItems: 'center', marginBottom: rs(12) },
  lotNumberInputWrap: { flex: 1, position: 'relative' },
  lotNumberInput: {
    width: '100%',
    borderRadius: rs(10),
    borderWidth: 1,
    borderColor: '#D8DEE6',
    height: rs(44),
    paddingHorizontal: rs(12),
    paddingRight: rs(44),
    fontSize: rs(12),
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  barcodeBtn: { position: 'absolute', right: rs(10), top: rs(11), width: rs(22), height: rs(22), alignItems: 'center', justifyContent: 'center' },
  generateLotBtn: {
    marginLeft: rs(10),
    height: rs(44),
    paddingHorizontal: rs(16),
    borderRadius: rs(10),
    backgroundColor: '#EEF3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  generateLotText: { color: '#111827', fontSize: rs(12), fontWeight: '600' },

  row2: { flexDirection: 'row', marginTop: rs(4) },
  col: { flex: 1, marginRight: rs(8) },
  colQty: { width: rs(90), marginStart: rs(10) },

  dateRow: { width: '100%', position: 'relative' },
  dateInput: {
    width: '100%',
    borderRadius: rs(8),
    borderWidth: 1,
    height: rs(40),
    paddingHorizontal: rs(10),
    paddingRight: rs(36),
    fontSize: rs(10),
    color: '#222222',
    backgroundColor: '#FFFFFF',
  },
  dateInputMfg: { borderColor: '#2E7D32' },
  dateInputExp: { borderColor: '#F57C00' },
  dateIconBtn: {
    position: 'absolute',
    right: rs(8),
    top: rs(8),
    width: rs(24),
    height: rs(24),
    borderRadius: rs(4),
    backgroundColor: '#F3F5F7',
    justifyContent: 'center',
    alignItems: 'center',
  },

  footerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: rs(16),
    paddingVertical: rs(12),
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  deleteAllBtn: {
    height: rs(36),
    minWidth: rs(116),
    paddingHorizontal: rs(16),
    borderRadius: rs(30),
    backgroundColor: '#DA1E28',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: rs(3),
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
    marginHorizontal: rs(3),
  },
  saveText: { color: '#FFFFFF', fontSize: rs(13), fontWeight: '500' },
  addLotBtn: {
    height: rs(36),
    minWidth: rs(116),
    paddingHorizontal: rs(24),
    borderRadius: rs(30),
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#5D768B',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: rs(3),
  },
  addLotDisabled: { borderColor: '#CCCCCC', backgroundColor: '#F5F5F5' },
  addLotText: { color: '#233E55', fontSize: rs(13), fontWeight: '500' },
  addLotTextDisabled: { color: '#888888' },

  serialSection: { marginTop: rs(16) },

  modeBar: {
    borderRadius: rs(10),
    paddingVertical: rs(8),
    paddingHorizontal: rs(10),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: rs(10),
  },
  modeLeftText: { color: '#FFFFFF', fontSize: rs(12), fontWeight: '700' },
  modeTabs: { flexDirection: 'row', gap: rs(8) },
  modeTabBtn: { paddingVertical: rs(6), paddingHorizontal: rs(16), borderRadius: rs(8), borderWidth: 1 },
  modeTabBtnActive: { backgroundColor: '#5D768B', borderColor: '#5D768B' },
  modeTabBtnInactive: { backgroundColor: '#FFFFFF', borderColor: '#5D768B' },
  modeTabText: { fontSize: rs(12), fontWeight: '700' },
  modeTabTextActive: { color: '#FFFFFF' },
  modeTabTextInactive: { color: '#5D768B' },

  autoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: rs(10),
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: rs(12),
    marginTop: rs(6),
  },
  sectionTitle: { fontSize: rs(14), color: '#1F2D3D', fontWeight: '700' },
  autoBox: { backgroundColor: '#ECF1F7', borderRadius: rs(10), padding: rs(12), marginTop: rs(8) },
  autoRow: { flexDirection: 'row', gap: rs(10) },
  fieldBox: { flex: 1 },
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
  spinnerBox: { borderWidth: 1, borderColor: '#D7DEE6', borderRadius: rs(10), flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', overflow: 'hidden' },
  spinnerInput: { flex: 1, paddingHorizontal: rs(12), paddingVertical: Platform.OS === 'ios' ? rs(12) : rs(8), fontSize: rs(13), color: '#1F2D3D', fontWeight: '800' },
  spinnerBtns: { width: rs(34), borderLeftWidth: 1, borderLeftColor: '#D7DEE6' },
  spinnerBtn: { height: rs(20), alignItems: 'center', justifyContent: 'center' },
  helperText: { marginTop: rs(10), fontSize: rs(12), color: '#6B7C8B', fontWeight: '700' },
  generateBtn: { marginTop: rs(12), height: rs(46), borderRadius: rs(12), backgroundColor: '#5D768B', alignItems: 'center', justifyContent: 'center', width: '100%' },
  generateText: { color: '#FFFFFF', fontSize: rs(14), fontWeight: '700' },

  viewSerialsBar: {
    marginTop: rs(12),
    borderRadius: rs(8),
    backgroundColor: '#B1CADE',
    paddingHorizontal: rs(12),
    paddingVertical: rs(10),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  viewSerialsText: { fontSize: rs(13), color: '#FFFFFF', fontWeight: '700' },

  addTouchWrap: {
    marginTop: rs(10),
    height: rs(46),
    borderRadius: rs(10),
    borderWidth: 1,
    borderColor: '#C9D6E1',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: rs(12),
  },
  addTouchDisabled: { opacity: 0.5 },
  addTouchInput: { flex: 1, fontSize: rs(12), color: '#1F2D3D', fontWeight: '700', paddingVertical: 0, paddingRight: rs(10) },
  addTouchScan: { width: rs(36), height: rs(36), borderRadius: rs(8), alignItems: 'center', justifyContent: 'center', backgroundColor: '#E9F0F7' },
  addTouchScanDisabled: { backgroundColor: '#EFF4F8' },

  serialTableCard: {
    marginTop: rs(10),
    backgroundColor: '#FFFFFF',
    borderRadius: rs(10),
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: rs(10),
  },
  serialHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: rs(8),
    backgroundColor: '#ECF1F7',
    borderRadius: rs(8),
    paddingHorizontal: rs(8),
    paddingVertical: rs(6),
  },
  serialHeaderLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  serialHeaderEntry: { width: rs(60), fontSize: rs(11), color: '#233E55', fontWeight: '600' },
  serialHeaderSerial: { flex: 1, fontSize: rs(11), color: '#233E55', fontWeight: '600' },
  serialHeaderActions: { flexDirection: 'row', alignItems: 'center' },
  serialHeaderIconBtn: { width: rs(30), height: rs(30), borderRadius: rs(15), alignItems: 'center', justifyContent: 'center', marginLeft: rs(6) },
  serialHeaderIconDisabled: { opacity: 0.3 },

  serialRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: rs(8) },
  serialEntryText: { width: rs(60), fontSize: rs(13), fontWeight: '700', color: '#3B4B59' },
  serialInputWrap: { flex: 1, position: 'relative' },
  serialInputBox: { height: rs(40), borderRadius: rs(8), backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D7DEE6', paddingHorizontal: rs(12), justifyContent: 'center' },
  serialInputBoxLocked: { backgroundColor: '#F3F5F7' },
  serialInputBoxError: { borderColor: '#D32F2F' },
  serialInput: { fontSize: rs(13), color: '#000000', fontWeight: '700', paddingRight: rs(40) },
  serialInputLocked: { color: '#6B7C8B' },
  serialScanBtn: { position: 'absolute', right: rs(10), top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  serialScanDisabled: { opacity: 0.3 },
  serialDeleteRowBtn: { width: rs(36), height: rs(36), alignItems: 'center', justifyContent: 'center' },
});
