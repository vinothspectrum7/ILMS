import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Toast from 'react-native-toast-message';
import CloseIcon from '../../assets/icons/close.svg';
import ErrorIcon from '../../assets/icons/error.svg';
import Rec_CustomNumericInput from '../../components/receive/Rec_CustomNumericInput';
import Rec_DropDown from '../../components/receive/Rec_DropDown';
import SingleFooterBtnComponent from '../../components/SingleFooterBtnComponent';
import ItemBoxIcon from '../../assets/icons/lotserialitem.svg';
import Rec_LotSerialModalPopup from './Rec_LotSerialModalPopup';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BASE_WIDTH = 375;
const rs = v => (SCREEN_WIDTH / BASE_WIDTH) * v;

const asName = v => {
  if (!v) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'object') return String(v.name ?? '');
  return '';
};

const asId = v => {
  if (!v) return '';
  if (typeof v === 'string' || typeof v === 'number') return String(v);
  if (typeof v === 'object') return String(v.id ?? '');
  return '';
};

const findItem = (items, value) => {
  const id = asId(value);
  if (!id) return null;
  const arr = Array.isArray(items) ? items : [];
  return arr.find(x => String(x?.id) === id) || null;
};

const safeNum = v => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const sumLotQty = lots =>
  (Array.isArray(lots) ? lots : []).reduce((acc, l) => acc + safeNum(l?.qty ?? l?.lotQty ?? 0), 0);

const sumSerialCount = lots =>
  (Array.isArray(lots) ? lots : []).reduce((acc, l) => {
    const s = l?.serials ?? l?.serialLines ?? l?.serialNumbers ?? [];
    return acc + (Array.isArray(s) ? s.length : 0);
  }, 0);

const inferStatus = lots => {
  const hasLots = Array.isArray(lots) && lots.length > 0;
  if (!hasLots) return '';
  const sc = sumSerialCount(lots);
  return sc > 0 ? 'Lot + Serial Added' : 'Lot Added';
};

export default function Rec_PutAwayLotSerialModalPopup({
  visible,
  onClose,
  lot,
  lotIndex,
  itemName = '',
  itemCode = '',
  uom = '',
  uomCode='',
  inventoryItems = [],
  defaultSubInventory = null,
  defaultLocator = null,
  fetchLocators,
  initialPutAwayData = null,
  onComplete,
  rowQty,
  rowId,
  putAwayTargetQty,
}) {
  const [subInv, setSubInv] = useState(null);
  const [locator, setLocator] = useState(null);
  const [locatorItems, setLocatorItems] = useState([]);
  const [putAwayQty, setPutAwayQty] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  const [lotSerialVisible, setLotSerialVisible] = useState(false);
  const [addedPutAwayLots, setAddedPutAwayLots] = useState([]);

  const [showPutAwayUI, setShowPutAwayUI] = useState(true);


  const clearError = useCallback(() => setErrorMsg(''), []);

  const loadLocators = useCallback(
    async subInvValue => {
      const sub = findItem(inventoryItems, subInvValue) || subInvValue;
      const subId = asId(sub);
      if (!subId) {
        setLocatorItems([]);
        return [];
      }

      try {
        if (typeof fetchLocators !== 'function') {
          setLocatorItems([]);
          return [];
        }

        const list = await fetchLocators(subId);
        const mapped = Array.isArray(list)
          ? list.map(d => ({
              id: d?.id ?? d?.locator_id,
              name: d?.name ?? d?.locator_name,
              enabled: d?.enabled ?? d?.locator_enabled,
            }))
          : [];

        setLocatorItems(mapped);
        return mapped;
      } catch {
        setLocatorItems([]);
        return [];
      }
    },
    [fetchLocators, inventoryItems],
  );

  useEffect(() => {
    if (!visible) return;

    const pre = initialPutAwayData || null;

    const preSubInv = pre?.subInventory ?? pre?.fromSubInventory ?? defaultSubInventory ?? null;
    const preLocator = pre?.locator ?? pre?.targetLocator ?? defaultLocator ?? null;

    const preQtyRaw = safeNum(pre?.putAwayQty ?? pre?.qty ?? putAwayTargetQty ?? 0);
    const preQty = preQtyRaw > 0 ? preQtyRaw : safeNum(putAwayTargetQty);

    const preLots =
      pre?.putAwayLotLines ??
      pre?.putAwayLots ??
      pre?.lotLines ??
      pre?.lots ??
      [];

    setSubInv(preSubInv || null);
    setLocator(preLocator || null);
    setPutAwayQty(safeNum(putAwayTargetQty) > 0 ? preQty : 0);
    setAddedPutAwayLots(Array.isArray(preLots) ? preLots : []);
    setErrorMsg('');

    (async () => {
      const list = await loadLocators(preSubInv || null);

      if (preLocator) {
        const ok = !!findItem(list, preLocator) || !!findItem(list, { id: asId(preLocator) });
        if (!ok) setLocator(null);
      }
    })();
  }, [visible, initialPutAwayData, defaultSubInventory, defaultLocator, putAwayTargetQty, loadLocators]);

  const subName = useMemo(() => asName(findItem(inventoryItems, subInv) || subInv), [inventoryItems, subInv]);
  const locName = useMemo(() => asName(findItem(locatorItems, locator) || locator), [locatorItems, locator]);

  const showSummary = !!subInv && safeNum(putAwayQty) > 0;

  const hasLots = Array.isArray(addedPutAwayLots) && addedPutAwayLots.length > 0;
  const lotsCount = hasLots ? addedPutAwayLots.length : 0;
  const totalLotQty = hasLots ? sumLotQty(addedPutAwayLots) : 0;
  const serialCount = hasLots ? sumSerialCount(addedPutAwayLots) : 0;

  const addRowText = useMemo(() => {
    if (!hasLots) return 'Add Lot+Serial';
    if (serialCount > 0) return `${lotsCount} Lots+${serialCount} Serials Added - ${safeNum(putAwayQty)} QTY`;
    return `${lotsCount} Lots Added - ${safeNum(putAwayQty)} QTY`;
  }, [hasLots, lotsCount, serialCount, putAwayQty]);

  const validate = useCallback(() => {
    const q = safeNum(putAwayQty);
    const lotQ = safeNum(putAwayTargetQty);
    const lineQ = safeNum(rowQty);

    if (!subInv) return 'Select Sub Inventory to Confirm Put Away';
    if (!q || q <= 0) return 'Enter Put Away Qty to Confirm Put Away';

    if (!hasLots) return 'Add Lot or Lot+Serial to Confirm Put Away';

    // if (lotQ > 0 && q !== lotQ) return 'Put Away Qty should be equal to Lot Qty';
    if (lineQ > 0 && q > lineQ) return 'Put Away Qty should not be greater than Receiving Qty';

    const lotsTotal = safeNum(totalLotQty);
    if (lotsTotal > 0 && q > 0 && lotsTotal !== q) return 'Total Lot Qty should be equal to Put Away Qty';

    return '';
  }, [subInv, putAwayQty, putAwayTargetQty, rowQty, hasLots, totalLotQty]);

  const handleConfirmPutAway = useCallback(() => {
    const msg = validate();
    if (msg) {
      setErrorMsg(msg);
      return;
    }

    const subObj = findItem(inventoryItems, subInv) || subInv;
    const locObj = locator ? findItem(locatorItems, locator) || locator : null;

    const payload = {
      rowId,
      putAwayQty: safeNum(putAwayQty),
      subInventory: subObj,
      targetLocator: locObj,
      lotDetails: lot,
      lotIndex,
      itemName,
      itemCode,
      uom,
      uomCode,
      putAwayLotLines: addedPutAwayLots,
      putAwaySerialLines: [],
      putAwayStatus: inferStatus(addedPutAwayLots),
      lastPutAwayDate: new Date().toISOString(),
    };

    if (onComplete) onComplete(payload);

    Toast.show({ type: 'success', text1: 'Put Away Saved' });
    onClose();
  }, [
    validate,
    inventoryItems,
    locatorItems,
    subInv,
    locator,
    putAwayQty,
    lot,
    lotIndex,
    itemName,
    itemCode,
    uom,
    addedPutAwayLots,
    onComplete,
    onClose,
  ]);

  const isReady = !!subInv && safeNum(putAwayQty) > 0 && hasLots;

  const openLotSerialModal = useCallback(() => {
  clearError();
  if (!subInv) {
    setErrorMsg('Select Sub Inventory before adding Lot/Serial');
    return;
  }
  if (safeNum(putAwayQty) <= 0) {
    setErrorMsg('Enter Put Away Qty before adding Lot/Serial');
    return;
  }

  setShowPutAwayUI(false);
  setLotSerialVisible(true);
}, [clearError, subInv, putAwayQty]);


  const handleLotSerialClose = useCallback(() => {
  setLotSerialVisible(false);
  setShowPutAwayUI(true);
}, []);


  const handleLotSerialSave = useCallback((payload) => {
  const lots = Array.isArray(payload) ? payload : [];
  setAddedPutAwayLots(lots);
  setLotSerialVisible(false);
  setShowPutAwayUI(true);
  Toast.show({ type: 'success', text1: 'Lot/Serial Saved' });
}, []);


  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
        {showPutAwayUI && (
          <View style={styles.modalContainer}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Put Away</Text>
              <TouchableOpacity onPress={onClose} activeOpacity={0.85}>
                <CloseIcon width={rs(18)} height={rs(18)} />
              </TouchableOpacity>
            </View>

            {!!errorMsg && (
              <View style={styles.errorBanner}>
                <ErrorIcon width={rs(16)} height={rs(16)} />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            )}

            <View style={styles.body}>
              <View style={styles.lotCard}>
                <ItemBoxIcon width={40} height={40} />
                <View style={{ flex: 1, marginLeft: 5 }}>
                  <Text style={styles.lotId}>{itemName || 'N/A'}</Text>
                  <View style={styles.lotRow}>
                    <Text style={styles.smallText}>{itemCode || '-'}</Text>
                  </View>
                </View>
                <View style={styles.qtyBox}>
                  <Text style={styles.qtyLabel}>Qty</Text>
                  <Text style={styles.qtyValue}>{safeNum(putAwayTargetQty)}</Text>
                </View>
              </View>

              <View style={styles.sectionBlock}>
                <Text style={styles.mandLabel}>Sub-Inventory*</Text>
                <Rec_DropDown
                  label=""
                  placeholder="Select Sub Inventory"
                  value={subInv}
                  onChange={async val => {
                    clearError();
                    setSubInv(val);
                    setLocator(null);
                    await loadLocators(val);
                  }}
                  items={inventoryItems}
                />
              </View>

              <View style={styles.sectionBlock}>
                <Text style={styles.mandLabel}>Target Locator</Text>
                <Rec_DropDown
                  label=""
                  placeholder="Select Target Locator"
                  value={locator}
                  onChange={val => {
                    clearError();
                    setLocator(val);
                  }}
                  items={locatorItems}
                />
              </View>

              <View style={styles.sectionBlock}>
                <Text style={styles.mandLabel}>Put-Away Qty</Text>
                <Rec_CustomNumericInput
                  value={putAwayQty}
                  setValue={v => {
                    clearError();
                    const raw = typeof v === 'function' ? v(putAwayQty) : v;
                    setPutAwayQty(safeNum(raw));
                  }}
                  min={0}
                  max={putAwayTargetQty}
                  step={1}
                  width="100%"
                  height={rs(42)}
                  isSelected={true}
                  disabledinput={false}
                />
              </View>

              {showSummary && (
                <View style={styles.sectionBlock}>
                  <View style={styles.summaryWrap}>
                    <View style={styles.summaryHeader}>
                      <Text style={styles.summaryHeaderText}>Summary</Text>
                    </View>

                    <View style={styles.summaryBody}>
                      <View style={styles.summaryCol}>
                        <Text style={styles.sumLabel}>Item</Text>
                        <Text style={styles.sumValue} numberOfLines={1}>
                          {itemName || '-'}
                        </Text>

                        <View style={{ height: rs(14) }} />

                        <Text style={styles.sumLabel}>From</Text>
                        <Text style={styles.sumValue} numberOfLines={1}>
                          {subName || '-'}
                        </Text>
                      </View>

                      <View style={styles.summaryCol}>
                        <Text style={styles.sumLabel}>Quantity</Text>
                        <Text style={styles.sumValue} numberOfLines={1}>
                          {safeNum(putAwayQty)}
                          {uom ? ` ${uom}` : ''}
                        </Text>

                        <View style={{ height: rs(14) }} />

                        <Text style={styles.sumLabel}>To</Text>
                        <Text style={styles.sumValue} numberOfLines={2}>
                          {locName || '-'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              )}

              <View style={styles.addLotRow}>
                <TouchableOpacity style={styles.addLotBtn} activeOpacity={0.85} onPress={openLotSerialModal}>
                  {hasLots ? (
                    <View style={styles.addLotGreen}>
                      <ItemBoxIcon width={rs(16)} height={rs(16)} />
                      <Text style={styles.addLotGreenText}>{addRowText}</Text>
                    </View>
                  ) : (
                    <LinearGradient
                      colors={['#7392AA', '#89ADC9']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.addLotGrad}
                    >
                      <ItemBoxIcon width={rs(20)} height={rs(20)} />
                      <Text style={styles.addLotText}>{addRowText}</Text>
                    </LinearGradient>
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.footerWrap}>
                <SingleFooterBtnComponent
                  label="Confirm Put Away"
                  onPress={handleConfirmPutAway}
                  enabled={isReady}
                  containerStyle={{ marginBottom: 0 }}
                  buttonStyle={{ width: '100%', marginStart: 0 }}
                  labelStyle={{ fontSize: 14 }}
                />
              </View>
            </View>
          </View>
        )}

          <Rec_LotSerialModalPopup
            visible={lotSerialVisible}
            onClose={handleLotSerialClose}
            itemName={itemName}
            itemCode={itemCode}
            lineQty={safeNum(putAwayQty)}
            initialLots={addedPutAwayLots}
            onSave={handleLotSerialSave}
            mode="putAway"
          />

        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: rs(20),
  },
  modalContainer: {
    width: Math.min(rs(360), SCREEN_WIDTH * 0.92),
    backgroundColor: '#FFFFFF',
    borderRadius: rs(8),
    overflow: 'hidden',
  },
  header: {
    height: rs(56),
    backgroundColor: '#ECF1F7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: rs(16),
  },
  headerTitle: {
    fontSize: rs(16),
    fontWeight: '600',
    color: '#111827',
  },
  errorBanner: {
    marginTop: rs(10),
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
    flex: 1,
  },
  body: {
    paddingHorizontal: rs(16),
    paddingTop: rs(14),
    paddingBottom: rs(16),
  },
  lotCard: {
    width: '100%',
    minHeight: rs(54),
    backgroundColor: '#4F6577',
    borderRadius: rs(6),
    paddingHorizontal: rs(12),
    paddingVertical: rs(10),
    flexDirection: 'row',
    alignItems: 'center',
  },
  lotId: {
    color: '#FFFFFF',
    fontSize: rs(13),
    fontWeight: '600',
  },
  lotRow: {
    flexDirection: 'row',
    marginTop: rs(2),
  },
  smallText: {
    color: '#DCE3EA',
    fontSize: rs(11),
    marginRight: rs(18),
  },
  qtyBox: {
    alignItems: 'flex-end',
  },
  qtyLabel: {
    color: '#DCE3EA',
    fontSize: rs(11),
  },
  qtyValue: {
    color: '#FFFFFF',
    fontSize: rs(16),
    fontWeight: '700',
  },
  sectionBlock: {
    width: '100%',
    marginTop: rs(16),
  },
  mandLabel: {
    fontSize: rs(11),
    color: '#6C6C6C',
    marginBottom: rs(6),
    fontWeight: '600',
  },
  summaryWrap: {
    width: '100%',
    borderRadius: rs(10),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  summaryHeader: {
    height: rs(36),
    backgroundColor: '#5D768B',
    justifyContent: 'center',
    paddingHorizontal: rs(14),
  },
  summaryHeaderText: {
    color: '#FFFFFF',
    fontSize: rs(13),
    fontWeight: '700',
    textAlign: 'left',
  },
  summaryBody: {
    flexDirection: 'row',
    paddingHorizontal: rs(14),
    paddingVertical: rs(14),
  },
  summaryCol: {
    flex: 1,
  },
  sumLabel: {
    color: '#595A5C',
    fontSize: rs(11),
    fontWeight: '600',
    marginBottom: rs(6),
  },
  sumValue: {
    color: '#111827',
    fontSize: rs(13),
    fontWeight: '700',
  },
  addLotRow: {
    marginTop: rs(14),
  },
  addLotBtn: {
    alignSelf: 'stretch',
  },
  addLotGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: rs(12),
    paddingVertical: rs(10),
    borderRadius: rs(8),
    alignSelf: 'stretch',
  },
  addLotText: {
    marginLeft: rs(6),
    fontSize: rs(14),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  addLotGreen: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: rs(12),
    paddingVertical: rs(10),
    borderRadius: rs(12),
    alignSelf: 'stretch',
    justifyContent: 'center',
    backgroundColor: '#73B386',
  },
  addLotGreenText: {
    marginLeft: rs(6),
    fontSize: rs(11),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  footerWrap: {
    width: '100%',
    marginTop: rs(18),
  },
});
