import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import GlobalHeaderComponent from '../../components/GlobalHeaderComponent';
import FooterButtonsComponent from '../../components/FooterButtonsComponent';
import CustomNumericInput from '../../components/CustomNumericInput';
import Rec_DropDown from '../../components/receive/Rec_DropDown';
import Rec_LotModalPopup from '../../components/receive/Rec_LotModalPopup';
import Rec_SerialModalPopup from '../../components/receive/Rec_SerialModalPopup';
import { useReceivingStore } from '../../store/receivingStore';
import { GetLocatorsData } from '../../api/ApiServices';
import ReceiveItemBoxIcon from '../../assets/icons/receiveitemboxicon.svg';
import ReceiveQtyIcon from '../../assets/icons/receiveqtyicon.svg';
import ReceiveLocationIcon from '../../assets/icons/receivelocationicon.svg';
import ReceiveDetailsIcon from '../../assets/icons/receivedetailsicon.svg';
import ReceiveTabIcon from '../../assets/icons/receivetabicon.svg';
import InspectTabIcon from '../../assets/icons/inspecttabicon.svg';
import PutAwayTabIcon from '../../assets/icons/putawaytabicon.svg';
import SelectedReceiveTabIcon from '../../assets/icons/selectedreceivetabicon.svg';
import SelectedInspectTabIcon from '../../assets/icons/selectedinspecttabicon.svg';
import SelectedPutAwayTabIcon from '../../assets/icons/selectedputawaytabicon.svg';
import ReceiveAddIcon from '../../assets/icons/receiveaddicon.svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BASE_WIDTH = 375;
const scale = size => (SCREEN_WIDTH / BASE_WIDTH) * size;
const ms = (size, factor = 0.35) => size + (scale(size) - size) * factor;

const clampToLimit = (qty, limit) => {
  const lim = Number(limit ?? 0);
  const q = Number(qty ?? 0);
  if (!Number.isFinite(lim) || lim <= 0) return 0;
  if (!Number.isFinite(q) || q <= 0) return 0;
  return Math.min(q, lim);
};

const Rec_ViewItemDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const readOnly = !!route?.params?.readonly;
  const returnTo = route?.params?.returnTo || null;
  const listType = route?.params?.listType || 'line';

  const {
    InventoryList,
    OrgData,
    receiveItems,
    mergePatchIntoReceiveItems,
    setLocatorInCache,
    getLocatorFromCache,
  } = useReceivingStore();

  const baseItems = Array.isArray(route?.params?.items) ? route.params.items : [];

  const mergedItems = useMemo(() => {
    return baseItems.map(it => {
      const stored = Array.isArray(receiveItems)
        ? receiveItems.find(r => String(r.id) === String(it.id))
        : undefined;
      const receivingQty = Number(stored?.qtyToReceive ?? it.receivingQty ?? 0);
      return {
        ...it,
        receivingQty,
        lpn: stored?.lpn ?? it.lpn ?? '',
        subInventory: stored?.subInventory ?? it.subInventory ?? '',
        locator: stored?.locator ?? it.locator ?? '',
        imageUri: stored?.imageUri ?? it.imageUri ?? null,
        max_open_qty: Number(it.max_open_qty ?? stored?.max_open_qty ?? it.openQty ?? 0),
        itemType: it.itemType || it.itemtype || 'Lot',
        orderQty: Number(it.orderQty ?? it.orderedQty ?? 0),
      };
    });
  }, [baseItems, receiveItems]);

  const startIndex = Math.max(
    0,
    Math.min(Number(route?.params?.startIndex ?? 0), mergedItems.length - 1),
  );

  const [index, setIndex] = useState(startIndex);
  const [activeTab, setActiveTab] = useState('Receive');
  const [edited, setEdited] = useState({});
  const [locatorDataMap, setLocatorDataMap] = useState({});
  const [lotRowsMap, setLotRowsMap] = useState({});
  const [serialRowsMap, setSerialRowsMap] = useState({});
  const listRef = useRef(null);
  const isProgrammaticScroll = useRef(false);

  const allItems = mergedItems;
  const current = useMemo(() => allItems[index] || null, [allItems, index]);

  const currentStoreLine = useMemo(() => {
    if (!current) return null;
    return Array.isArray(receiveItems)
      ? receiveItems.find(r => String(r.id) === String(current.id))
      : null;
  }, [receiveItems, current]);

  const currentLotLines = useMemo(() => {
    if (!current) return [];
    const fromStore = currentStoreLine?.lotLines;
    if (Array.isArray(fromStore)) return fromStore;
    const fromLocal = lotRowsMap[current.id];
    return Array.isArray(fromLocal) ? fromLocal : [];
  }, [current, currentStoreLine, lotRowsMap]);

  const lotsCount = currentLotLines.length;
  const hasLots = lotsCount > 0;

  const currentSerialLines = useMemo(() => {
    if (!current) return [];
    const fromStore = currentStoreLine?.serialLines;
    if (Array.isArray(fromStore)) return fromStore;
    const fromLocal = serialRowsMap[current.id];
    return Array.isArray(fromLocal) ? fromLocal : [];
  }, [current, currentStoreLine, serialRowsMap]);

  const serialCount = currentSerialLines.length;
  const hasSerials = serialCount > 0;

  const serialMode = useMemo(() => {
    if (!current) return 'ranges';
    const m = currentStoreLine?.serialMode;
    return m === 'individual' ? 'individual' : 'ranges';
  }, [current, currentStoreLine]);

  useEffect(() => {
    if (readOnly) return;
    const next = {};
    for (const it of allItems) {
      const fromStore = Array.isArray(receiveItems)
        ? receiveItems.find(r => String(r.id) === String(it.id))
        : undefined;
      next[it.id] = {
        receivingQty: Number(fromStore?.qtyToReceive ?? it.receivingQty ?? 0),
        lpn: fromStore?.lpn ?? it.lpn ?? '',
        subInventory: fromStore?.subInventory ?? it.subInventory ?? '',
        locator: fromStore?.locator ?? it.locator ?? '',
      };
    }
    setEdited(next);
  }, [allItems, receiveItems, readOnly]);

  useEffect(() => {
    if (!readOnly && Array.isArray(allItems)) {
      allItems.forEach(async it => {
        const sub_id =
          edited[it.id]?.subInventory ?? it.subInventory ?? OrgData?.selectedinventory;
        if (!sub_id) return;
        const cached = getLocatorFromCache(sub_id);
        if (cached) {
          setLocatorDataMap(prev => ({ ...prev, [it.id]: cached }));
        } else {
          try {
            const locdata = await GetLocatorsData(sub_id);
            if (Array.isArray(locdata) && locdata.length) {
              const mapped = locdata.map(d => ({
                id: d.locator_id,
                name: d.locator_name,
                enabled: d.locator_enabled,
              }));
              setLocatorDataMap(prev => ({ ...prev, [it.id]: mapped }));
              setLocatorInCache(sub_id, mapped);
            }
          } catch {}
        }
      });
    }
  }, [allItems, edited, readOnly, OrgData, getLocatorFromCache, setLocatorInCache]);

  const lpnOptions = useMemo(() => {
    const set = new Map();
    receiveItems.forEach(r => {
      if (r.lpn) {
        const key = String(r.lpn);
        if (!set.has(key)) {
          set.set(key, { id: key, name: key });
        }
      }
    });
    return Array.from(set.values());
  }, [receiveItems]);

  const scrollToIndex = useCallback(
    i => {
      if (i < 0 || i >= allItems.length) return;
      isProgrammaticScroll.current = true;
      listRef.current?.scrollToIndex({ index: i, animated: true });
      setIndex(i);
    },
    [allItems.length],
  );

  const goPrev = useCallback(() => {
    if (index > 0) scrollToIndex(index - 1);
  }, [index, scrollToIndex]);

  const goNext = useCallback(() => {
    if (index < allItems.length - 1) scrollToIndex(index + 1);
  }, [index, allItems.length, scrollToIndex]);

  const handleCancelNav = useCallback(() => {
    if (returnTo) navigation.navigate(returnTo);
    else navigation.goBack();
  }, [navigation, returnTo]);

  const handleSubInvChange = (itemId, subInvId) => {
    setEdited(prev => ({
      ...prev,
      [itemId]: { ...(prev[itemId] ?? {}), subInventory: subInvId, locator: '' },
    }));
  };

  const handleLocatorChange = (itemId, locatorId) => {
    setEdited(prev => ({
      ...prev,
      [itemId]: { ...(prev[itemId] ?? {}), locator: locatorId },
    }));
  };

  const handleLpnChange = (itemId, lpnId) => {
    setEdited(prev => ({
      ...prev,
      [itemId]: { ...(prev[itemId] ?? {}), lpn: lpnId },
    }));
  };

  const handleQtyChange = (itemId, item, newQty) => {
    if (readOnly) return;
    const clamped = clampToLimit(newQty, Number(item.max_open_qty ?? item.openQty ?? 0));
    setEdited(prev => ({
      ...prev,
      [itemId]: { ...(prev[itemId] ?? {}), receivingQty: clamped },
    }));
  };

  const [lotModalVisible, setLotModalVisible] = useState(false);
  const [serialModalVisible, setSerialModalVisible] = useState(false);

  const openLotModal = () => {
    if (!current) return;
    setLotModalVisible(true);
  };

  const openSerialModal = () => {
    if (!current) return;
    setSerialModalVisible(true);
  };

  const handleSaveLots = (lots, totalQty) => {
    if (!current) return;
    const safeLots = Array.isArray(lots)
      ? lots.map(l => ({
          lotNumber: String(l.lotNumber || ''),
          mfgDate: String(l.mfgDate || ''),
          expDate: String(l.expDate || ''),
          qty: Number(l.qty) || 0,
        }))
      : [];

    mergePatchIntoReceiveItems({
      id: String(current.id),
      lotLines: safeLots,
      lotTotalQty: Number(totalQty) || 0,
    });

    setLotRowsMap(prev => ({
      ...prev,
      [current.id]: safeLots,
    }));

    setLotModalVisible(false);
  };

  const handleSaveSerials = (serials, mode) => {
    if (!current) return;
    const safeSerials = Array.isArray(serials)
      ? serials.map(s => String(s || '').trim()).filter(Boolean)
      : [];

    mergePatchIntoReceiveItems({
      id: String(current.id),
      serialLines: safeSerials,
      serialTotalQty: safeSerials.length,
      serialMode: mode === 'individual' ? 'individual' : 'ranges',
    });

    setSerialRowsMap(prev => ({
      ...prev,
      [current.id]: safeSerials,
    }));

    setSerialModalVisible(false);
  };

  const persistPatches = () => {
    const patches = [];
    allItems.forEach(it => {
      const st = edited[it.id];
      if (!st) return;
      const limit = Number(it.max_open_qty ?? it.openQty ?? 0);
      const clampedQty = clampToLimit(Number(st.receivingQty ?? 0), limit);
      if (!readOnly) {
        patches.push({
          id: String(it.id),
          receivingQty: clampedQty,
          qtyToReceive: clampedQty,
          lpn: st.lpn ?? '',
          subInventory: st.subInventory ?? '',
          locator: st.locator ?? null,
        });
      }
    });
    patches.forEach(p => mergePatchIntoReceiveItems(p));
  };

  const isSubmitEnabled = useMemo(() => {
    if (readOnly) return false;
    return allItems.some(it => {
      const st = edited[it.id];
      if (!st) return false;
      const limit = Number(it.max_open_qty ?? it.openQty ?? 0);
      const q = Number(st.receivingQty ?? 0);
      const qtyOk = q > 0 && q <= limit;
      const subInvOk = !!st.subInventory;
      return qtyOk && subInvOk;
    });
  }, [edited, allItems, readOnly]);

  const handleSaveAll = () => {
    if (!isSubmitEnabled) return;
    persistPatches();
    if (returnTo) navigation.navigate(returnTo, { listType });
    else navigation.goBack();
  };

  const titleContext = current?.poNumber ? String(current.poNumber) : 'Receiving';

  const currentEdited = current ? edited[current.id] ?? {} : {};

  const currentQty = current
    ? Number(currentEdited.receivingQty ?? current.receivingQty ?? 0)
    : 0;

  const itemType = current?.itemType || 'Lot';

  const itemPills = (() => {
    const showLot = itemType === 'Lot' || itemType === 'Lot+Serial';
    const showSerial = itemType === 'Serial' || itemType === 'Lot+Serial';
    return { showLot, showSerial };
  })();

  const lineLabel = `Line${index + 1}`;

  return (
    <SafeAreaView style={styles.container}>
      <GlobalHeaderComponent
        organizationName={OrgData?.selectedOrgCode}
        screenTitle="Receiving"
        contextInfo={titleContext}
        notificationCount={0}
        onBack={handleCancelNav}
      />

      <View style={styles.navBar}>
        <TouchableOpacity
          onPress={goPrev}
          disabled={index === 0}
          style={styles.navEdge}
          activeOpacity={0.7}
        >
          <ChevronLeft size={22} color={index === 0 ? '#C8D0D6' : '#233E55'} />
        </TouchableOpacity>

        <Text style={styles.navTitle}>{`Line Item ${index + 1}`}</Text>

        <TouchableOpacity
          onPress={goNext}
          disabled={index === allItems.length - 1}
          style={styles.navEdge}
          activeOpacity={0.7}
        >
          <ChevronRight
            size={22}
            color={index === allItems.length - 1 ? '#C8D0D6' : '#233E55'}
          />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.mainContainer}>
          <View style={styles.cardReceive}>
            <View style={styles.tabRow}>
              <TouchableOpacity style={styles.tabWrapper} activeOpacity={0.9} onPress={() => setActiveTab('Receive')}>
                <LinearGradient
                  colors={activeTab === 'Receive' ? ['#233E55', '#5D768B'] : ['#E5E7EB', '#D1D5DB']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.tabBtn, activeTab === 'Receive' && styles.tabBtnActive]}
                >
                  {activeTab === 'Receive' ? (
                    <SelectedReceiveTabIcon width={16} height={16} />
                  ) : (
                    <ReceiveTabIcon width={16} height={16} />
                  )}
                  <Text style={[styles.tabText, activeTab === 'Receive' ? styles.tabTextActive : styles.tabTextInactive]}>
                    Receive
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.tabWrapper} activeOpacity={0.9} onPress={() => setActiveTab('Inspect')}>
                <LinearGradient
                  colors={activeTab === 'Inspect' ? ['#233E55', '#5D768B'] : ['#F3F4F6', '#E5E7EB']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.tabBtn, activeTab === 'Inspect' && styles.tabBtnActive]}
                >
                  {activeTab === 'Inspect' ? (
                    <SelectedInspectTabIcon width={16} height={16} />
                  ) : (
                    <InspectTabIcon width={16} height={16} />
                  )}
                  <Text style={activeTab === 'Inspect' ? [styles.tabText, styles.tabTextActive] : [styles.tabText, styles.tabTextInactive]}>
                    Inspect
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.tabWrapper} activeOpacity={0.9} onPress={() => setActiveTab('PutAway')}>
                <LinearGradient
                  colors={activeTab === 'PutAway' ? ['#233E55', '#5D768B'] : ['#F3F4F6', '#E5E7EB']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.tabBtn, activeTab === 'PutAway' && styles.tabBtnActive]}
                >
                  {activeTab === 'PutAway' ? (
                    <SelectedPutAwayTabIcon width={16} height={16} />
                  ) : (
                    <PutAwayTabIcon width={16} height={16} />
                  )}
                  <Text style={activeTab === 'PutAway' ? [styles.tabText, styles.tabTextActive] : [styles.tabText, styles.tabTextInactive]}>
                    Put Away
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <View style={styles.itemInfoBox}>
              <View style={styles.itemInfoRow}>
                <View style={styles.itemIconWrap}>
                  <ReceiveItemBoxIcon width={40} height={40} />
                </View>
                <View style={styles.itemTextCol}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {current?.itemName || 'Item Name'}
                  </Text>
                  <Text style={styles.itemCode} numberOfLines={1}>
                    {current?.itemid || 'Item Code'}
                  </Text>
                </View>
                <View style={styles.itemPillsCol}>
                  {itemPills.showLot && (
                    <View style={styles.pillLot}>
                      <Text style={styles.pillLotText}>Lot</Text>
                    </View>
                  )}
                  {itemPills.showSerial && (
                    <View style={styles.pillSerial}>
                      <Text style={styles.pillSerialText}>Serial</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            {activeTab === 'Receive' && current && (
              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <ReceiveQtyIcon width={18} height={18} />
                  <Text style={styles.sectionTitle}>Quantity Overview</Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>Order Quantity</Text>
                  <Text style={styles.orderQtyText}>
                    {current.orderQty} <Text style={styles.orderQtyUom}>/ {current.uom}</Text>
                  </Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>Receiving Quantity</Text>
                  <View style={styles.numericRight}>
                    {readOnly ? (
                      <Text style={styles.orderQtyText}>{currentQty}</Text>
                    ) : (
                      <CustomNumericInput
                        key={`qty-${String(current.id)}`}
                        value={currentQty}
                        setValue={v => {
                          const raw = typeof v === 'function' ? v(currentQty) : v;
                          handleQtyChange(current.id, current, raw);
                        }}
                        max={Number(current.max_open_qty ?? current.openQty ?? 0)}
                        min={0}
                        step={1}
                        width={80}
                        height={28}
                        isSelected
                        disabledinput={Number(current.openQty ?? 0) === 0}
                      />
                    )}
                  </View>
                </View>

                <Text style={styles.uomText}>{current.uom}</Text>
              </View>
            )}
          </View>

          {activeTab === 'Receive' && current && (
            <>
              <View style={styles.cardShipTo}>
                <View style={styles.shipHeaderRow}>
                  <View style={styles.shipHeaderLeft}>
                    <ReceiveLocationIcon width={18} height={18} />
                    <Text style={styles.sectionTitle}>Ship-To Location</Text>
                  </View>
                  <Text style={styles.shipValue} numberOfLines={1}>
                    {current?.ship_to_location || '-'}
                  </Text>
                </View>
              </View>

              <View style={styles.cardDetails}>
                <View style={styles.sectionHeaderRow}>
                  <ReceiveDetailsIcon width={18} height={18} />
                  <Text style={styles.sectionTitle}>Receiving Details</Text>
                </View>

                <View style={styles.fieldBlockFull}>
                  <Text style={styles.mandLabel}>LPN</Text>
                  <Rec_DropDown
                    value={currentEdited.lpn}
                    onChange={id => handleLpnChange(current.id, id)}
                    options={lpnOptions}
                    placeholder="Select LPN"
                    disabled={readOnly || Number(current.openQty ?? 0) === 0}
                    width="100%"
                    height={32}
                  />
                </View>

                <View style={styles.subLocRow}>
                  <View style={styles.subCol}>
                    <Text style={styles.mandLabel}>Sub Inventory</Text>
                    <Rec_DropDown
                      value={currentEdited.subInventory}
                      onChange={id => handleSubInvChange(current.id, id)}
                      options={InventoryList}
                      placeholder="Select Sub Inv"
                      disabled={readOnly || Number(current.openQty ?? 0) === 0}
                      width="100%"
                      height={32}
                    />
                  </View>
                  <View style={styles.locCol}>
                    <Text style={styles.mandLabel}>Locator</Text>
                    <Rec_DropDown
                      value={currentEdited.locator}
                      onChange={id => handleLocatorChange(current.id, id)}
                      options={locatorDataMap[current.id] ?? []}
                      placeholder="Select Locator"
                      disabled={readOnly || Number(current.openQty ?? 0) === 0}
                      width="100%"
                      height={32}
                    />
                  </View>
                </View>

                {itemPills.showLot && (
                  <View style={styles.addLotRow}>
                    <TouchableOpacity
                      style={styles.addLotBtn}
                      activeOpacity={0.85}
                      onPress={openLotModal}
                      disabled={readOnly || Number(current.openQty ?? 0) === 0}
                    >
                      {hasLots ? (
                        <View style={styles.addLotGreen}>
                          <ReceiveAddIcon width={16} height={16} />
                          <Text style={styles.addLotGreenText}>
                            {`${lotsCount} Lots Added - ${currentQty} QTY`}
                          </Text>
                        </View>
                      ) : (
                        <LinearGradient
                          colors={['#7392AA', '#89ADC9']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={styles.addLotGrad}
                        >
                          <ReceiveAddIcon width={16} height={16} />
                          <Text style={styles.addLotText}>Add Lot</Text>
                        </LinearGradient>
                      )}
                    </TouchableOpacity>
                  </View>
                )}

                {itemPills.showSerial && (
                  <View style={styles.addLotRow}>
                    <TouchableOpacity
                      style={styles.addLotBtn}
                      activeOpacity={0.85}
                      onPress={openSerialModal}
                      disabled={readOnly || Number(current.openQty ?? 0) === 0}
                    >
                      {hasSerials ? (
                        <View style={styles.addLotGreen}>
                          <ReceiveAddIcon width={16} height={16} />
                          <Text style={styles.addLotGreenText}>
                            {`${serialCount} Serials Added - ${currentQty} QTY`}
                          </Text>
                        </View>
                      ) : (
                        <LinearGradient
                          colors={['#7392AA', '#89ADC9']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={styles.addLotGrad}
                        >
                          <ReceiveAddIcon width={16} height={16} />
                          <Text style={styles.addLotText}>Add Serial</Text>
                        </LinearGradient>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {!readOnly && (
        <FooterButtonsComponent
          leftLabel="Cancel"
          rightLabel="Save"
          onLeftPress={handleCancelNav}
          onRightPress={isSubmitEnabled ? handleSaveAll : undefined}
          leftEnabled
          rightEnabled={isSubmitEnabled}
        />
      )}

      {current && (
        <>
          <Rec_LotModalPopup
            visible={lotModalVisible}
            onClose={() => setLotModalVisible(false)}
            onSave={handleSaveLots}
            itemName={current.itemName}
            itemCode={current.itemid}
            lineQty={currentQty}
            lineLabel={lineLabel}
            initialLots={currentLotLines}
          />

          <Rec_SerialModalPopup
            visible={serialModalVisible}
            onClose={() => setSerialModalVisible(false)}
            onSave={handleSaveSerials}
            itemName={current.itemName}
            itemCode={current.itemid}
            lineQty={currentQty}
            lineLabel={lineLabel}
            initialSerials={currentSerialLines}
            initialMode={serialMode}
          />
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: '#F6F8FA', flex: 1 },
  navBar: {
    marginTop: ms(14),
    marginBottom: ms(14),
    marginHorizontal: ms(16),
    backgroundColor: '#FFFFFF',
    borderRadius: ms(18),
    paddingVertical: ms(12),
    paddingHorizontal: ms(8),
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
  },
  navEdge: { width: ms(44), height: ms(32), alignItems: 'center', justifyContent: 'center' },
  navTitle: { flex: 1, color: '#233E55', textAlign: 'center', fontSize: ms(12), fontWeight: '600' },
  scrollContent: { paddingBottom: ms(120) },
  mainContainer: { paddingBottom: ms(16) },

  cardReceive: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: ms(16),
    marginTop: ms(4),
    borderRadius: ms(12),
    paddingHorizontal: ms(14),
    paddingTop: ms(12),
    paddingBottom: ms(10),
    elevation: 2,
  },
  cardShipTo: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: ms(16),
    marginTop: ms(12),
    borderRadius: ms(12),
    paddingHorizontal: ms(14),
    paddingVertical: ms(12),
    elevation: 2,
  },
  cardDetails: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: ms(16),
    marginTop: ms(12),
    marginBottom: ms(16),
    borderRadius: ms(12),
    paddingHorizontal: ms(14),
    paddingTop: ms(12),
    paddingBottom: ms(12),
    elevation: 2,
  },

  tabRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: ms(10) },
  tabWrapper: { flex: 1, marginHorizontal: ms(2) },
  tabBtn: {
    borderRadius: ms(24),
    paddingVertical: ms(9),
    paddingHorizontal: ms(8),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBtnActive: {
    shadowColor: '#000000',
    shadowOpacity: 0.22,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  tabText: { fontSize: ms(11), marginLeft: ms(4) },
  tabTextActive: { color: '#FFFFFF', fontWeight: '700' },
  tabTextInactive: { color: '#4B5563', fontWeight: '600' },

  itemInfoBox: {
    backgroundColor: '#EEF3FF',
    borderRadius: ms(10),
    paddingVertical: ms(10),
    paddingHorizontal: ms(10),
    elevation: 2,
  },
  itemInfoRow: { flexDirection: 'row', alignItems: 'center' },
  itemIconWrap: { width: ms(46), height: ms(46), borderRadius: ms(10), alignItems: 'center', justifyContent: 'center', marginRight: ms(10) },
  itemTextCol: { flex: 1 },
  itemName: { fontSize: ms(13), fontWeight: '700', color: '#111827' },
  itemCode: { marginTop: ms(3), fontSize: ms(11), color: '#9D9FA3' },
  itemPillsCol: { alignItems: 'flex-end', justifyContent: 'center' },
  pillLot: { minWidth: ms(48), paddingHorizontal: ms(8), paddingVertical: ms(3), borderRadius: ms(12), backgroundColor: '#D9E4EE', alignItems: 'center', justifyContent: 'center' },
  pillLotText: { fontSize: ms(10), color: '#5C996E', fontWeight: '600' },
  pillSerial: { minWidth: ms(48), paddingHorizontal: ms(8), paddingVertical: ms(3), borderRadius: ms(12), backgroundColor: '#9CC6F6', alignItems: 'center', justifyContent: 'center', marginTop: ms(4) },
  pillSerialText: { fontSize: ms(10), color: '#668694', fontWeight: '600' },

  section: { marginTop: ms(16) },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: ms(8) },
  sectionTitle: { marginLeft: ms(6), fontSize: ms(13), fontWeight: '700', color: '#111827' },

  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: ms(6), justifyContent: 'space-between' },
  label: { fontSize: ms(11), color: '#6C6C6C' },
  orderQtyText: { fontSize: ms(13), fontWeight: '700', color: '#111827' },
  orderQtyUom: { fontSize: ms(11), fontWeight: '600', color: '#6B7280' },
  numericRight: { alignItems: 'flex-end', justifyContent: 'center' },
  uomText: { fontSize: ms(10), color: '#595A5C', marginTop: ms(2), marginRight: ms(2), textAlign: 'right' },

  shipHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  shipHeaderLeft: { flexDirection: 'row', alignItems: 'center' },
  shipValue: { fontSize: ms(12), fontWeight: '700', color: '#111827', marginLeft: ms(8), flexShrink: 1, textAlign: 'right' },

  fieldBlockFull: { marginTop: ms(10) },
  mandLabel: { fontSize: ms(11), color: '#6C6C6C', marginBottom: ms(4) },

  subLocRow: { flexDirection: 'row', marginTop: ms(12) },
  subCol: { flex: 1, marginRight: ms(6) },
  locCol: { flex: 1, marginLeft: ms(6) },

  addLotRow: { marginTop: ms(14) },
  addLotBtn: { alignSelf: 'stretch' },
  addLotGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: ms(12),
    paddingVertical: ms(8),
    borderRadius: ms(18),
    alignSelf: 'stretch',
    justifyContent: 'center',
  },
  addLotText: { marginLeft: ms(6), fontSize: ms(11), fontWeight: '700', color: '#FFFFFF' },

  addLotGreen: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: ms(12),
    paddingVertical: ms(10),
    borderRadius: ms(12),
    alignSelf: 'stretch',
    justifyContent: 'center',
    backgroundColor: '#73B386',
  },
  addLotGreenText: { marginLeft: ms(6), fontSize: ms(11), fontWeight: '700', color: '#FFFFFF' },
});

export default Rec_ViewItemDetailsScreen;
