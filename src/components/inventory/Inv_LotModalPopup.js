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
import CloseIcon from '../../assets/icons/close.svg';
import DeleteIcon from '../../assets/icons/deleteicon.svg';
import BarcodeScannerIcon from '../../assets/icons/barcodescanner.svg';
import CalendarIcon from '../../assets/icons/calendar.svg';
import Inv_CustomNumericInput from './Inv_CustomNumericInput';
import BarcodeScanner from '../../screens/BarCodeScanner';

const { width: SCREEN_WIDTH } = require('react-native').Dimensions.get('window');
const BASE_WIDTH = 375;
const rs = v => (SCREEN_WIDTH / BASE_WIDTH) * v;

const makeRandomLot = () => {
  const base = 'LOT';
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `${base}${rand}`;
};

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

export default function Inv_LotModalPopup({
  visible,
  onClose,
  lineQty = 0,
  itemName = '',
  initialLots = [],
  onSave,
}) {
  const [lots, setLots] = useState([]);
  const [scannerVisible, setScannerVisible] = useState(false);
  const [scanTargetIdx, setScanTargetIdx] = useState(null);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [datePickerDate, setDatePickerDate] = useState(new Date());
  const [datePickerLotIdx, setDatePickerLotIdx] = useState(null);
  const [datePickerField, setDatePickerField] = useState(null);

  useEffect(() => {
    if (visible) {
      if (initialLots && initialLots.length > 0) {
        setLots(
          initialLots.map((l, idx) => ({
            idx,
            lotNumber: l.lotNumber || '',
            mfgDate: l.mfgDate || '',
            expDate: l.expDate || '',
            qty: Number(l.qty) || 0,
          })),
        );
      } else {
        setLots([
          {
            idx: 0,
            lotNumber: '',
            mfgDate: '',
            expDate: '',
            qty: 0,
          },
        ]);
      }
    }
  }, [visible, initialLots]);

  const totalQty = useMemo(
    () => lots.reduce((sum, l) => sum + (Number(l.qty) || 0), 0),
    [lots],
  );

  const remainingQty = Math.max(lineQty - totalQty, 0);
  const canAddMoreLots = remainingQty > 0;

  const updateLot = (idx, patch) => {
    setLots(prev => prev.map(l => (l.idx === idx ? { ...l, ...patch } : l)));
  };

  const handleQtyChange = (idx, nextQty) => {
    const current = lots.find(l => l.idx === idx);
    const currentQty = Number(current?.qty) || 0;
    const otherTotal = totalQty - currentQty + (Number(nextQty) || 0);
    if (otherTotal > lineQty) return;
    updateLot(idx, { qty: nextQty });
  };

  const handleAddLot = () => {
    if (!canAddMoreLots) return;
    const nextIdx = lots.length ? Math.max(...lots.map(l => l.idx)) + 1 : 0;
    setLots(prev => [
      ...prev,
      {
        idx: nextIdx,
        lotNumber: '',
        mfgDate: '',
        expDate: '',
        qty: 0,
      },
    ]);
  };

  const handleDeleteLot = idx => {
    setLots(prev => prev.filter(l => l.idx !== idx));
  };

  const handleDeleteAll = () => {
    setLots([
      {
        idx: 0,
        lotNumber: '',
        mfgDate: '',
        expDate: '',
        qty: 0,
      },
    ]);
  };

  const isValid =
    lots.length > 0 &&
    lineQty > 0 &&
    totalQty === lineQty &&
    lots.every(
      l =>
        l.lotNumber &&
        l.mfgDate &&
        l.expDate &&
        Number(l.qty) > 0,
    );

  const handleSave = () => {
    if (!isValid) return;
    const payload = lots.map(({ idx, ...rest }) => rest);
    onSave?.(payload, totalQty);
    onClose?.();
  };

  const openScannerForLot = idx => {
    setScanTargetIdx(idx);
    setScannerVisible(true);
  };

  const handleLotScanned = codeString => {
    const scanned = String(codeString || '').trim();
    if (scanned && scanTargetIdx != null) {
      updateLot(scanTargetIdx, { lotNumber: scanned });
    }
    setScannerVisible(false);
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

  if (!visible) {
    return null;
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      {scannerVisible ? (
        <BarcodeScanner
          onScan={handleLotScanned}
          onClose={() => setScannerVisible(false)}
        />
      ) : (
        <View style={styles.root}>
          <View style={styles.headerBar}>
            <Text style={styles.headerTitle}>Lot Number Details</Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: rs(10), bottom: rs(10), left: rs(10), right: rs(10) }}
            >
              <CloseIcon width={rs(20)} height={rs(20)} />
            </TouchableOpacity>
          </View>

          <View style={styles.topInfo}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemLabel}>Item Name</Text>
              <Text style={styles.itemValue}>{itemName || '-'}</Text>
            </View>
            <View style={styles.qtyInfo}>
              <Text style={styles.itemLabel}>Qty Selected</Text>
              <Text
                style={[
                  styles.qtyValue,
                  totalQty === lineQty && lineQty > 0 ? styles.qtyOk : styles.qtyPending,
                ]}
              >
                {totalQty}/{lineQty}
              </Text>
            </View>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={{ paddingBottom: rs(100) }}
            keyboardShouldPersistTaps="handled"
          >
            {lots.map((lot, index) => {
              const currentQty = Number(lot.qty) || 0;
              const otherTotal = totalQty - currentQty;
              const lotMax = Math.max(lineQty - otherTotal, 0);

              return (
                <View key={lot.idx} style={styles.lotGroup}>
                  <View style={styles.lotHeaderFloating}>
                    <Text style={styles.lotTitle}>Lot {index + 1}</Text>
                    <TouchableOpacity
                      onPress={() => handleDeleteLot(lot.idx)}
                      hitSlop={{ top: rs(8), bottom: rs(8), left: rs(8), right: rs(8) }}
                    >
                      <View style={styles.deleteCircle}>
                        <DeleteIcon width={rs(18)} height={rs(18)} />
                      </View>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.lotCard}>
                    <Text style={styles.fieldLabel}>
                      Lot Number<Text style={styles.required}>*</Text>
                    </Text>
                    <View style={styles.lotNumberRow}>
                      <TextInput
                        style={styles.lotInput}
                        value={lot.lotNumber}
                        onChangeText={t => updateLot(lot.idx, { lotNumber: t })}
                        placeholder="Enter lot number"
                      />
                      <TouchableOpacity
                        style={styles.iconBtn}
                        onPress={() => openScannerForLot(lot.idx)}
                      >
                        <BarcodeScannerIcon width={rs(18)} height={rs(18)} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.generateBtn}
                        onPress={() => updateLot(lot.idx, { lotNumber: makeRandomLot() })}
                      >
                        <Text style={styles.generateText}>Generate</Text>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.row2}>
                      <View style={styles.col}>
                        <Text style={styles.fieldLabel}>
                          Mfg Date<Text style={styles.required}>*</Text>
                        </Text>
                        <View style={styles.dateRow}>
                          <TextInput
                            style={styles.dateInput}
                            value={lot.mfgDate}
                            onChangeText={t => updateLot(lot.idx, { mfgDate: t })}
                            placeholder="DD/MM/YYYY"
                          />
                          <TouchableOpacity
                            style={styles.dateIconBtn}
                            onPress={() =>
                              openDatePicker(lot.idx, 'mfg', lot.mfgDate)
                            }
                          >
                            <CalendarIcon width={rs(16)} height={rs(16)} />
                          </TouchableOpacity>
                        </View>
                      </View>

                      <View style={styles.col}>
                        <Text style={styles.fieldLabel}>
                          Exp Date<Text style={styles.required}>*</Text>
                        </Text>
                        <View style={styles.dateRow}>
                          <TextInput
                            style={styles.dateInput}
                            value={lot.expDate}
                            onChangeText={t => updateLot(lot.idx, { expDate: t })}
                            placeholder="DD/MM/YYYY"
                          />
                          <TouchableOpacity
                            style={styles.dateIconBtn}
                            onPress={() =>
                              openDatePicker(lot.idx, 'exp', lot.expDate)
                            }
                          >
                            <CalendarIcon width={rs(16)} height={rs(16)} />
                          </TouchableOpacity>
                        </View>
                      </View>

                      <View style={styles.colQty}>
                        <Text style={styles.fieldLabel}>
                          Qty<Text style={styles.required}>*</Text>
                        </Text>
                        <Inv_CustomNumericInput
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
            <TouchableOpacity style={styles.deleteAllBtn} onPress={handleDeleteAll}>
              <Text style={styles.deleteAllText}>Delete All</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveBtn, !isValid && styles.disabledBtn]}
              disabled={!isValid}
              onPress={handleSave}
            >
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.addLotBtn,
                !canAddMoreLots && styles.addLotDisabled,
              ]}
              disabled={!canAddMoreLots}
              onPress={handleAddLot}
            >
              <Text
                style={[
                  styles.addLotText,
                  !canAddMoreLots && styles.addLotTextDisabled,
                ]}
              >
                Add Lot
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerBar: {
    height: rs(52),
    paddingHorizontal: rs(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F3F5F7',
  },
  headerTitle: {
    fontSize: rs(16),
    fontWeight: '600',
    color: '#233E55',
  },
  topInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: rs(16),
    paddingVertical: rs(12),
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  itemInfo: {
    flex: 1,
  },
  qtyInfo: {
    alignItems: 'flex-end',
  },
  itemLabel: {
    fontSize: rs(12),
    color: '#555555',
  },
  itemValue: {
    fontSize: rs(14),
    fontWeight: '600',
    color: '#222222',
    marginTop: rs(2),
  },
  qtyValue: {
    fontSize: rs(14),
    fontWeight: '600',
    marginTop: rs(2),
  },
  qtyPending: {
    color: '#E53935',
  },
  qtyOk: {
    color: '#2E7D32',
  },
  scroll: {
    flex: 1,
    paddingHorizontal: rs(16),
    paddingTop: rs(16),
  },
  lotGroup: {
    marginBottom: rs(20),
  },
  lotHeaderFloating: {
    position: 'absolute',
    top: rs(-10),
    left: rs(20),
    right: rs(-10),
    zIndex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lotCard: {
    borderRadius: rs(8),
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: rs(12),
    paddingTop: rs(20),
    backgroundColor: '#FFFFFF',
  },
  deleteCircle: {
    width: rs(22),
    height: rs(22),
    borderRadius: rs(16),
    backgroundColor: '#DA1E28',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  lotTitle: {
    fontSize: rs(14),
    fontWeight: '600',
    color: '#333333',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: rs(8),
  },
  fieldLabel: {
    fontSize: rs(12),
    color: '#555555',
    marginBottom: rs(4),
  },
  required: {
    color: '#E53935',
  },
  lotNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: rs(10),
  },
  lotInput: {
    flex: 1,
    borderRadius: rs(8),
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: rs(10),
    height: rs(40),
    fontSize: rs(14),
    color: '#222222',
    backgroundColor: '#FFFFFF',
  },
  iconBtn: {
    marginLeft: rs(8),
    padding: rs(8),
    borderRadius: rs(8),
    backgroundColor: '#F3F5F7',
  },
  generateBtn: {
    marginLeft: rs(8),
    paddingHorizontal: rs(12),
    paddingVertical: rs(8),
    borderRadius: rs(8),
    backgroundColor: '#E6EEF7',
  },
  generateText: {
    fontSize: rs(12),
    fontWeight: '500',
    color: '#233E55',
  },
  row2: {
    flexDirection: 'row',
    marginTop: rs(4),
  },
  col: {
    flex: 1,
    marginRight: rs(8),
  },
  colQty: {
    width: rs(90),
    marginStart: rs(10),
  },
  dateRow: {
    width: '100%',
    position: 'relative',
  },
  dateInput: {
    width: '100%',
    borderRadius: rs(8),
    borderWidth: 1,
    borderColor: '#EFEFF0',
    height: rs(40),
    paddingHorizontal: rs(10),
    paddingRight: rs(36),
    fontSize: rs(10),
    color: '#222222',
    backgroundColor: '#FFFFFF',
  },
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
  deleteAllText: {
    color: '#FFFFFF',
    fontSize: rs(13),
    fontWeight: '500',
  },
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
  saveText: {
    color: '#FFFFFF',
    fontSize: rs(13),
    fontWeight: '500',
  },
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
  addLotDisabled: {
    borderColor: '#CCCCCC',
    backgroundColor: '#F5F5F5',
  },
  addLotText: {
    color: '#233E55',
    fontSize: rs(13),
    fontWeight: '500',
  },
  addLotTextDisabled: {
    color: '#888888',
  },
  disabledBtn: {
    opacity: 0.4,
  },
});
