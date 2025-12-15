import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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
import BarcodeIcon from '../../assets/icons/barcodeicon.svg';
import SerialDeleteIcon from '../../assets/icons/serialdeleteicon.svg';
import ErrorIcon from '../../assets/icons/error.svg';
import BarcodeScanner from '../../screens/BarCodeScanner';
import SingleFooterBtnComponent from '../inventory/Inv_SingleFooterBtnComponent';
import LotSerialAddIcon from '../../assets/icons/lotserialaddicon.svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BASE_WIDTH = 375;
const rs = v => (SCREEN_WIDTH / BASE_WIDTH) * v;
const makeId = () => `${Date.now()}_${Math.random().toString(16).slice(2)}`;

const normalizeSerialArray = list => {
  if (!Array.isArray(list)) return [];
  return list
    .map(s => {
      if (typeof s === 'string') return s.trim();
      if (s && typeof s === 'object') {
        return String(s.serialNo ?? s.serial ?? '').trim();
      }
      return '';
    })
    .filter(Boolean);
};

export default function Rec_PutAwaySerialModalPopup({
  visible,
  onClose,
  putawayQty = 0,
  savedSerials = [],
  initialSelectedSerials = [],
  onConfirm,
  requireValidationAgainstSaved = false,
}) {
  const [rows, setRows] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [scannerVisible, setScannerVisible] = useState(false);
  const [invalidIds, setInvalidIds] = useState([]);
  const scanTargetRef = useRef({ rowId: null, addNew: false });

  const clearError = useCallback(() => {
    setErrorMsg('');
    setInvalidIds([]);
  }, []);

  const savedSerialsNormalized = useMemo(
    () => normalizeSerialArray(savedSerials),
    [savedSerials],
  );

  const qty = Number(putawayQty || 0);

  const isFullPutAway =
    qty > 0 && qty === savedSerialsNormalized.length && savedSerialsNormalized.length > 0;

  const canAddRow = useMemo(
    () => qty > 0 && rows.length < qty,
    [rows.length, qty],
  );

  useEffect(() => {
    if (!visible) return;

    const baseInitial = normalizeSerialArray(initialSelectedSerials);
    let nextRows = [];

    if (baseInitial.length) {
      const takeCount = qty > 0 ? Math.min(qty, baseInitial.length) : baseInitial.length;
      nextRows = baseInitial.slice(0, takeCount).map((s, i) => ({
        id: makeId(),
        entry: i + 1,
        serial: s,
        editable: true,
        isScanned: false,
      }));
    } else if (isFullPutAway) {
      const takeCount = Math.min(qty, savedSerialsNormalized.length);
      nextRows = savedSerialsNormalized.slice(0, takeCount).map((s, i) => ({
        id: makeId(),
        entry: i + 1,
        serial: s,
        editable: false,
        isScanned: true,
      }));
    } else if (qty > 0) {
      nextRows = [
        {
          id: makeId(),
          entry: 1,
          serial: '',
          editable: true,
          isScanned: false,
        },
      ];
    }

    setRows(nextRows);
    setErrorMsg('');
    setInvalidIds([]);
    scanTargetRef.current = { rowId: null, addNew: false };
    setScannerVisible(false);
  }, [visible, qty, initialSelectedSerials, savedSerialsNormalized, isFullPutAway]);

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

  const dupIds = useMemo(() => computeDupIds(rows), [rows, computeDupIds]);

  const setRowSerial = useCallback(
    (rowId, value) => {
      clearError();
      setRows(prev =>
        prev.map(r => (r.id === rowId ? { ...r, serial: value } : r)),
      );
    },
    [clearError],
  );

  const deleteRow = useCallback(
    rowId => {
      clearError();
      setRows(prev =>
        prev
          .filter(r => r.id !== rowId)
          .map((r, idx) => ({ ...r, entry: idx + 1 })),
      );
    },
    [clearError],
  );

  const addManualRow = useCallback(() => {
    clearError();
    if (!canAddRow) return;
    setRows(prev => [
      ...prev,
      {
        id: makeId(),
        entry: prev.length + 1,
        serial: '',
        editable: true,
        isScanned: false,
      },
    ]);
  }, [clearError, canAddRow]);

  const openScannerForRow = useCallback(
    (rowId, addNew = false) => {
      clearError();
      scanTargetRef.current = { rowId: rowId || null, addNew: !!addNew };
      setScannerVisible(true);
    },
    [clearError],
  );

  const handleSerialScanned = useCallback(
    codeString => {
      const v = String(codeString || '').trim();
      setScannerVisible(false);
      if (!v) return;
      const target = scanTargetRef.current;
      if (target.addNew) {
        if (!canAddRow) return;
        setRows(prev => [
          ...prev,
          {
            id: makeId(),
            entry: prev.length + 1,
            serial: v,
            editable: false,
            isScanned: true,
          },
        ]);
      } else {
        setRows(prev =>
          prev.map(r =>
            r.id === target.rowId ? { ...r, serial: v } : r,
          ),
        );
      }
      scanTargetRef.current = { rowId: null, addNew: false };
    },
    [canAddRow],
  );

  const validateAndGetSerials = useCallback(() => {
    const result = { ok: false, msg: '', serials: [], invalidIds: [] };

    if (!qty || qty <= 0) {
      result.msg = 'Invalid putaway quantity';
      return result;
    }

    if (!rows.length) {
      result.msg = 'Add Serial to Put Away';
      return result;
    }

    const serials = rows.map(r => (r.serial || '').trim());

    if (serials.some(s => !s)) {
      result.msg = 'Add Serial to Put Away';
      return result;
    }

    if (rows.length !== qty) {
      result.msg = 'Add Serial to Put Away';
      return result;
    }

    const dupSet = computeDupIds(rows);
    if (dupSet.size > 0) {
      result.msg = 'Same Serial No cannot be repeated';
      result.invalidIds = Array.from(dupSet);
      return result;
    }

    const savedSet = new Set(savedSerialsNormalized);
    const invalids = [];
    rows.forEach(r => {
      const v = (r.serial || '').trim();
      if (v && !savedSet.has(v)) {
        invalids.push(r.id);
      }
    });

    if (invalids.length > 0) {
      result.msg = 'Invalid Serial added';
      result.invalidIds = invalids;
      return result;
    }

    result.ok = true;
    result.serials = serials;
    return result;
  }, [qty, rows, computeDupIds, savedSerialsNormalized]);

  const handleConfirm = useCallback(() => {
    setInvalidIds([]);
    const v = validateAndGetSerials();
    if (!v.ok) {
      setErrorMsg(v.msg);
      setInvalidIds(v.invalidIds || []);
      return;
    }
    setErrorMsg('');
    setInvalidIds([]);
    if (onConfirm) onConfirm(v.serials);
  }, [validateAndGetSerials, onConfirm]);

  if (!visible) return null;

  if (scannerVisible) {
    return (
      <Modal
        visible={true}
        animationType="slide"
        transparent
        onRequestClose={() => setScannerVisible(false)}
      >
        <BarcodeScanner
          onScan={handleSerialScanned}
          onClose={() => setScannerVisible(false)}
        />
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <KeyboardAvoidingView
            style={styles.kav}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <View style={styles.headerBar}>
              <View style={styles.headerLeft}>
                <Text style={styles.headerTitle}>Serial</Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeBtn}
                activeOpacity={0.85}
              >
                <Text style={styles.closeTxt}>×</Text>
              </TouchableOpacity>
            </View>

            {!!errorMsg && (
              <View style={styles.errorBanner}>
                <ErrorIcon width={rs(16)} height={rs(16)} />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            )}

            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
            >
              <TouchableOpacity
                activeOpacity={0.9}
                disabled={!canAddRow}
                onPress={() => openScannerForRow(null, true)}
                style={[
                  styles.addTouchWrap,
                  !canAddRow && styles.addTouchDisabled,
                ]}
              >
                <Text
                  style={[
                    styles.addTouchText,
                    !canAddRow && styles.addTouchTextDisabled,
                  ]}
                >
                  Add Serial Number
                </Text>
                <View
                  style={[
                    styles.addTouchScan,
                    !canAddRow && styles.addTouchScanDisabled,
                  ]}
                >
                  <BarcodeIcon width={rs(18)} height={rs(18)} />
                </View>
              </TouchableOpacity>

              <View style={styles.tableHeader}>
                <View style={styles.tableHeaderInner}>
                  <Text style={styles.tableHeaderTxt}>Serial Numbers</Text>
                  <TouchableOpacity
                    onPress={addManualRow}
                    activeOpacity={0.85}
                    disabled={!canAddRow}
                    style={[
                      styles.headerAddIconBtn,
                      !canAddRow && styles.headerAddIconDisabled,
                    ]}
                  >
                    <LotSerialAddIcon width={rs(18)} height={rs(18)} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.colsHeader}>
                <Text style={styles.colEntry}>Entry</Text>
                <Text style={styles.colSerial}>Serial No</Text>
                <Text style={styles.colDel} />
              </View>

              {rows.map(r => {
                const isInvalid =
                  dupIds.has(r.id) || invalidIds.includes(r.id);
                return (
                  <View key={r.id} style={styles.rowWrap}>
                    <Text style={styles.rowEntryText}>#{r.entry}</Text>
                    <View style={styles.inputWrap}>
                      <View
                        style={[
                          styles.inputBox,
                          isInvalid && styles.inputBoxError,
                        ]}
                      >
                        <TextInput
                          value={r.serial}
                          onChangeText={txt => setRowSerial(r.id, txt)}
                          placeholder="Enter Serial"
                          placeholderTextColor="#91A3B3"
                          style={styles.serialInput}
                          editable={r.editable}
                        />
                      </View>
                      <TouchableOpacity
                        onPress={() => openScannerForRow(r.id, false)}
                        activeOpacity={0.85}
                        style={styles.scanBtn}
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
            </ScrollView>

            <View style={styles.footer}>
              <SingleFooterBtnComponent
                label="Confirm Serial"
                onPress={handleConfirm}
                enabled={true}
              />
            </View>
          </KeyboardAvoidingView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '90%',
    maxHeight: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: rs(12),
    overflow: 'hidden',
  },
  kav: {
    maxHeight: '100%',
  },
  headerBar: {
    height: rs(44),
    paddingHorizontal: rs(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E6EEF7',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: rs(14),
    fontWeight: '600',
    color: '#233E55',
    marginLeft: rs(8),
  },
  closeBtn: {
    width: rs(32),
    height: rs(32),
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeTxt: {
    fontSize: rs(24),
    color: '#233E55',
    lineHeight: rs(26),
  },
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
  errorText: {
    color: '#D32F2F',
    fontSize: rs(12),
    fontWeight: '600',
    marginLeft: rs(6),
  },
  scroll: {
    paddingHorizontal: rs(16),
    paddingTop: rs(12),
  },
  scrollContent: {
    paddingBottom: rs(16),
  },
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
  addTouchDisabled: {
    opacity: 0.45,
  },
  addTouchText: {
    fontSize: rs(12),
    color: '#1F2D3D',
    fontWeight: '700',
  },
  addTouchTextDisabled: {
    color: '#6B7C8B',
  },
  addTouchScan: {
    width: rs(36),
    height: rs(36),
    borderRadius: rs(8),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E9F0F7',
  },
  addTouchScanDisabled: {
    backgroundColor: '#EFF4F8',
  },
  tableHeader: {
    backgroundColor: '#EEF3FF',
    height: rs(40),
    borderTopLeftRadius: rs(10),
    borderTopRightRadius: rs(10),
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: rs(12),
    marginTop: rs(4),
  },
  tableHeaderInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  tableHeaderTxt: {
    fontSize: rs(13),
    color: '#1F2D3D',
    fontWeight: '700',
  },
  headerAddIconBtn: {
    width: rs(28),
    height: rs(28),
    borderRadius: rs(14),
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAddIconDisabled: {
    opacity: 0.4,
  },
  colsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: rs(6),
    paddingTop: rs(10),
    paddingBottom: rs(6),
  },
  colEntry: {
    width: rs(60),
    fontSize: rs(11),
    color: '#6B7C8B',
    fontWeight: '600',
  },
  colSerial: {
    flex: 1,
    fontSize: rs(11),
    color: '#6B7C8B',
    fontWeight: '600',
  },
  colDel: {
    width: rs(36),
  },
  rowWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: rs(10),
    paddingHorizontal: rs(6),
    borderRadius: rs(10),
    backgroundColor: '#D9E4EE',
    marginBottom: rs(10),
  },
  rowEntryText: {
    width: rs(60),
    fontSize: rs(13),
    fontWeight: '700',
    color: '#3B4B59',
  },
  inputWrap: {
    flex: 1,
    position: 'relative',
  },
  inputBox: {
    height: rs(40),
    borderRadius: rs(8),
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D7DEE6',
    paddingHorizontal: rs(12),
    justifyContent: 'center',
    ...Platform.select({
      android: {
        elevation: 2,
      },
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 2 },
      },
    }),
  },
  inputBoxError: {
    borderColor: '#D32F2F',
  },
  serialInput: {
    fontSize: rs(13),
    color: '#000000',
    fontWeight: '700',
    paddingRight: rs(40),
  },
  scanBtn: {
    position: 'absolute',
    right: rs(10),
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtn: {
    width: rs(36),
    height: rs(36),
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    paddingHorizontal: rs(16),
    paddingVertical: rs(10),
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
});
