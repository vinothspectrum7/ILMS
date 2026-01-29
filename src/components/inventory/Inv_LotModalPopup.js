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
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import LinearGradient from 'react-native-linear-gradient';
import CloseIcon from '../../assets/icons/close.svg';
import CalendarIcon from '../../assets/icons/calendar.svg';
import Inv_CustomNumericInput from './Inv_CustomNumericInput';
import Inv_Dropdown from './Inv_Dropdown';
import BarcodeScanner from '../../screens/BarCodeScanner';
import { MOCK_LOTS } from '../../data/inventoryMockData';
import LotSerialItemIcon from '../../assets/icons/lotserialitem.svg';
import LotSerialDeleteIcon from '../../assets/icons/lotserialdelete.svg';
import ErrorIcon from '../../assets/icons/error.svg';
import { useReceivingStore } from '../../store/receivingStore';
import { GetInventoryLotsData } from '../../api/ApiServices';
import Toast from 'react-native-toast-message';

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

export default function Inv_LotModalPopup({
  visible,
  onClose,
  lineQty = 0,
  itemName = '',
  initialLots = [],
  onSave,
  lineLabel,
  selectedItem,
  fromSub
}) {
  const [lots, setLots] = useState([]);
  const [scannerVisible, setScannerVisible] = useState(false);
  const [scanTargetIdx, setScanTargetIdx] = useState(null);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [datePickerDate, setDatePickerDate] = useState(new Date());
  const [datePickerLotIdx, setDatePickerLotIdx] = useState(null);
  const [datePickerField, setDatePickerField] = useState(null);
  const [showQtyError, setShowQtyError] = useState(false);
  const [LotsList, setLotsList] = useState([
    {
      id: 'LOT251113-528',
      name: 'LOT251113-528',
      code: 'LOT251113-528',
    },
    {
      id: 'LOT176356-379',
      name: 'LOT176356-379',
      code: 'LOT176356-379',
    },
    {
      id: 'LOT365807-977',
      name: 'LOT365807-977',
      code: 'LOT365807-977',
    },
  ]);
  const { OrgData } = useReceivingStore();

  const findLotOption = lotCode => {
    if (!lotCode) return null;
    const target = String(lotCode).toLowerCase().trim();
    return (
      LotsList.find(l => {
        const code = String(l.code || '').toLowerCase().trim();
        const name = String(l.name || '').toLowerCase().trim();
        return code === target || name === target;
      }) || null
    );
  };

  useEffect(() => {
    if (visible) {
      if (initialLots && initialLots.length > 0) {
        setLots(
          initialLots.map((l, idx) => {
            const lotOpt = findLotOption(l.lotNumber);
            return {
              idx,
              lotNumber: l.lotNumber || lotOpt?.code || lotOpt?.name || '',
              selectedLot: lotOpt,
              mfgDate: l.mfgDate || '',
              expDate: l.expDate || '',
              qty: Number(l.qty) || 0,
              maxqty:0
            };
          }),
        );
      } else {
        setLots([
          {
            idx: 0,
            lotNumber: '',
            selectedLot: null,
            mfgDate: '',
            expDate: '',
            qty: 0,
            maxqty:0
          },
        ]);
      }
      setShowQtyError(false);
    }
  }, [visible, initialLots]);

  useEffect(() => {
    if (!selectedItem || !fromSub) return;

    const loadInventoryLotData = async () => {
      try {
        const Lotsdata = await GetInventoryLotsData(useReceivingStore.getState()?.OrgData?.selectedOrgCode || OrgData?.selectedOrgCode,selectedItem?.code,fromSub?.code);
        if (Lotsdata) {
          console.log(Lotsdata,"LotsdataLotsdataLotsdata")
          const LotsdataList = mapLotslist(Lotsdata);
          setLotsList(LotsdataList);
        } else {
          setLotsList([]);
        }
      } catch (err) {
        Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load Lot Number. Please try again.', position: 'top', visibilityTime: 5000 });
      }
    };
    loadInventoryLotData();

  }, [selectedItem, fromSub]);

  const mapLotslist = data =>
    data.map(element => ({
      id: element.Lot,
      name: element.Lot,
      code: element.Lot,
      qty:element.qty
    }));

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
    setShowQtyError(false);
  };

  const handleAddLot = () => {
    if (!canAddMoreLots) return;
    const nextIdx = lots.length ? Math.max(...lots.map(l => l.idx)) + 1 : 0;
    setLots(prev => [
      ...prev,
      {
        idx: nextIdx,
        lotNumber: '',
        selectedLot: null,
        mfgDate: '',
        expDate: '',
        qty: 0,
        maxqty:0
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
        selectedLot: null,
        mfgDate: '',
        expDate: '',
        qty: 0,
        maxqty:0
      },
    ]);
    setShowQtyError(false);
  };

  const hasAllFields =
    lots.length > 0 &&
    lots.every(
      l =>
        l.lotNumber &&
        Number(l.qty) > 0,
    );

  const handleSave = () => {
    if (lineQty > 0 && totalQty < lineQty) {
      setShowQtyError(true);
      return;
    }

    if (!hasAllFields || totalQty !== lineQty || lineQty <= 0) {
      return;
    }

    const payload = lots.map(({ idx, selectedLot, ...rest }) => rest);
    onSave?.(payload, totalQty);
    onClose?.();
  };

  const openScannerForLot = idx => {
    setScanTargetIdx(idx);
    setScannerVisible(true);
  };

  const handleLotScanned = codeString => {
    const scannedRaw = String(codeString || '').trim();
    if (scannedRaw && scanTargetIdx != null) {
      const lotOpt = findLotOption(scannedRaw);
      if (lotOpt) {
        updateLot(scanTargetIdx, {
          selectedLot: lotOpt,
          lotNumber: lotOpt.code || lotOpt.name || scannedRaw,
        });
      } else {
        Alert.alert('Lot not found', 'Scanned code does not match any LOT.');
      }
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

  const qtySelectedActive = totalQty > 0;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      {scannerVisible ? (
        <BarcodeScanner
          onScan={handleLotScanned}
          onClose={() => setScannerVisible(false)}
        />
      ) : (
        <View style={styles.root}>
          <View style={styles.content}>
            <View style={styles.headerBar}>
              <Text style={styles.headerTitle}>
                {lineLabel ? `Lot Number Details - ${lineLabel}` : 'Lot Number Details'}
              </Text>
              <TouchableOpacity
                onPress={onClose}
                hitSlop={{ top: rs(10), bottom: rs(10), left: rs(10), right: rs(10) }}
              >
                <CloseIcon width={rs(20)} height={rs(20)} />
              </TouchableOpacity>
            </View>

            {showQtyError && (
              <View style={styles.errorBanner}>
                <ErrorIcon width={rs(16)} height={rs(16)} />
                <Text style={styles.errorText}>
                  Enter the complete transfer quantity to continue.
                </Text>
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
                    <Text style={styles.itemValue}>{itemName || '-'}</Text>
                  </View>
                </View>
                <View style={styles.qtyInfo}>
                  <Text style={styles.topQtyLabel}>Qty Selected</Text>
                  <Text style={styles.qtyValue}>
                    <Text
                      style={[
                        styles.qtySelected,
                        qtySelectedActive && styles.qtySelectedActive,
                      ]}
                    >
                      {totalQty}
                    </Text>
                    <Text style={styles.qtySlash}>/</Text>
                    <Text style={styles.qtyTotal}>{lineQty}</Text>
                  </Text>
                </View>
              </LinearGradient>
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
                    <View style={styles.lotCard}>
                      <View style={styles.lotHeaderRow}>
                        <Text style={styles.lotTitle}>Lot {index + 1}</Text>
                        <TouchableOpacity
                          onPress={() => handleDeleteLot(lot.idx)}
                          hitSlop={{
                            top: rs(8),
                            bottom: rs(8),
                            left: rs(8),
                            right: rs(8),
                          }}
                        >
                          <View style={styles.lotDeleteIconWrapper}>
                            <LotSerialDeleteIcon width={rs(16)} height={rs(16)} />
                          </View>
                        </TouchableOpacity>
                      </View>

                      <Inv_Dropdown
                        label="Lot Number"
                        required
                        placeholder="Select LOT"
                        value={lot.selectedLot}
                        onChange={item =>
                          updateLot(lot.idx, {
                            selectedLot: item,
                            lotNumber: item?.name || item?.code || '',
                            maxqty:item?.qty
                          })
                        }
                        items={LotsList}
                        displayValue={it => it.name || it.code}
                        renderCode={() => ''}
                        showBarcodeIcon
                        onBarcodePress={() => openScannerForLot(lot.idx)}
                      />

                      <View style={styles.row2}>
                        <View style={styles.col}>
                          {/* <Text style={styles.fieldLabel}>
                            Mfg Date<Text style={styles.required}>*</Text>
                          </Text>
                          <View style={styles.dateRow}>
                            <TextInput
                              style={[styles.dateInput, styles.dateInputMfg]}
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
                          </View> */}
                        </View>

                        <View style={styles.col}>
                          {/* <Text style={styles.fieldLabel}>
                            Exp Date<Text style={styles.required}>*</Text>
                          </Text>
                          <View style={styles.dateRow}>
                            <TextInput
                              style={[styles.dateInput, styles.dateInputExp]}
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
                          </View> */}
                        </View>

                        <View style={styles.colQty}>
                          <Text style={styles.fieldLabel}>
                            Qty<Text style={styles.required}>*</Text>
                          </Text>
                          <Inv_CustomNumericInput
                            value={lot.qty}
                            setValue={next => handleQtyChange(lot.idx, next)}
                            min={0}
                            max={lot.maxqty}
                            disabledinput={false}
                            width={rs(120)}
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

              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
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
        </View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginTop: rs(102),
  },
  headerBar: {
    height: rs(42),
    paddingHorizontal: rs(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E6EEF7',
  },
  headerTitle: {
    fontSize: rs(14),
    fontWeight: '600',
    color: '#233E55',
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
  topInfoWrapper: {
    marginTop: rs(8),
    marginHorizontal: rs(16),
  },
  topInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: rs(12),
    paddingVertical: rs(10),
    borderRadius: rs(8),
    alignItems: 'center',
  },
  topLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBox: {
    width: rs(40),
    height: rs(40),
    borderRadius: rs(8),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: rs(10),
  },
  itemTextBlock: {
    flex: 1,
  },
  itemLabel: {
    fontSize: rs(11),
    color: '#FFFFFF',
    opacity: 0.8,
  },
  itemValue: {
    fontSize: rs(14),
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: rs(2),
  },
  qtyInfo: {
    alignItems: 'flex-end',
  },
  topQtyLabel: {
    fontSize: rs(11),
    color: '#FFFFFF',
    opacity: 0.8,
  },
  qtyValue: {
    marginTop: rs(2),
  },
  qtySelected: {
    fontSize: rs(14),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  qtySelectedActive: {
    fontSize: rs(16),
  },
  qtySlash: {
    fontSize: rs(14),
    color: '#FFFFFF',
  },
  qtyTotal: {
    fontSize: rs(14),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  scroll: {
    flex: 1,
    paddingHorizontal: rs(16),
    paddingTop: rs(16),
  },
  lotGroup: {
    marginBottom: rs(20),
  },
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
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  lotTitle: {
    fontSize: rs(14),
    fontWeight: '600',
    color: '#333333',
  },
  lotDeleteIconWrapper: {
    width: rs(24),
    height: rs(24),
    borderRadius: rs(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldLabel: {
    fontSize: rs(12),
    color: '#555555',
    marginBottom: rs(4),
  },
  required: {
    color: '#E53935',
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
    width: rs(120),
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
    height: rs(40),
    paddingHorizontal: rs(10),
    paddingRight: rs(36),
    fontSize: rs(10),
    color: '#222222',
    backgroundColor: '#FFFFFF',
  },
  dateInputMfg: {
    borderColor: '#2E7D32',
  },
  dateInputExp: {
    borderColor: '#F57C00',
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
});
