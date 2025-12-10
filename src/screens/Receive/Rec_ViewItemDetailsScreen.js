import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import GlobalHeaderComponent from '../../components/GlobalHeaderComponent';
import FooterButtonsComponent from '../../components/FooterButtonsComponent';
import CustomNumericInput from '../../components/CustomNumericInput';
import Rec_DropDown from '../../components/receive/Rec_DropDown';
import Rec_LotModalPopup from '../../components/receive/Rec_LotModalPopup';
import Rec_LotSerialModalPopup from '../../components/receive/Rec_LotSerialModalPopup';
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
import InspectStatusIcon from '../../assets/icons/InspectionStatusIcon.svg';
import Rec_InspectPopup from '../../components/receive/Rec_InspectPopup';
import InspectEyeIcon from '../../assets/icons/inspecteye.svg';
import Rec_PutAwayPopup from '../../components/receive/Rec_PutAwayPopup';


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

const PUT_AWAY_STATUS = {
  PENDING: 'Pending',
  COMPLETED: 'Completed',
};

const Rec_ViewItemDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { initialTab } = route.params || {};

  useEffect(() => {
    if (initialTab?.toLowerCase() === "inspect") {
      setActiveTab("Inspect");
    }
  }, [initialTab]);


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
        inspectionStatus: stored?.inspectionStatus ?? it.inspectionStatus ?? 'pending',
        inspectionData: stored?.inspectionData ?? it.inspectionData ?? null,
        passedQty: stored?.passedQty ?? it.passedQty ?? 0,
        failedQty: stored?.failedQty ?? it.failedQty ?? 0,
        holdQty: stored?.holdQty ?? it.holdQty ?? 0,
        inspectionNotes: stored?.inspectionNotes ?? it.inspectionNotes ?? '',
        putAwayStatus: stored?.putAwayStatus ?? it.putAwayStatus ?? PUT_AWAY_STATUS.PENDING,
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
  const [inspectModalVisible, setInspectModalVisible] = useState(false);
  const [inspectionCompleted, setInspectionCompleted] = useState(false);
  const [inspectionResults, setInspectionResults] = useState({
    passedQty: 0,
    failedQty: 0,
    holdQty: 0,
    notes: '',
    lineLabel: '',
    lineQty: 0,
  });
  const [putAwayModalVisible, setPutAwayModalVisible] = useState(false);
  const putAwayCompleted = useMemo(() =>
    current?.putAwayStatus === PUT_AWAY_STATUS.COMPLETED,
    [current]
  );
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

  const currentLotSerialLines = useMemo(() => {
    if (!current) return [];
    const fromStore = currentStoreLine?.lotLines;
    if (Array.isArray(fromStore)) return fromStore;
    const fromLocal = lotserialRowsMap[current.id];
    return Array.isArray(fromLocal) ? fromLocal : [];
  }, [current, currentStoreLine, lotserialRowsMap]);

  const lotsCount = currentLotLines.length;
  const hasLots = lotsCount > 0;

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
      inspectionStatus: fromStore?.inspectionStatus ?? it.inspectionStatus ?? 'pending',
      inspectionData: fromStore?.inspectionData ?? it.inspectionData ?? null,
      passedQty: fromStore?.passedQty ?? it.passedQty ?? 0,
      failedQty: fromStore?.failedQty ?? it.failedQty ?? 0,
      holdQty: fromStore?.holdQty ?? it.holdQty ?? 0,
      inspectionNotes: fromStore?.inspectionNotes ?? it.inspectionNotes ?? '',
    };
  }
  setEdited(next);
}, [allItems, receiveItems, readOnly]);

  const handlePutAwayComplete = useCallback((lineId) => {
    mergePatchIntoReceiveItems({
      id: String(lineId),
      putAwayStatus: PUT_AWAY_STATUS.COMPLETED,
    });


  }, [mergePatchIntoReceiveItems]);

const handleInspectionComplete = useCallback((results) => {
  setInspectionCompleted(true);
  setInspectionResults(results);
  setInspectModalVisible(false);

  if (current) {
    const inspectionData = {
      passedQty: Number(results.passedQty) || 0,
      failedQty: Number(results.failedQty) || 0,
      holdQty: Number(results.holdQty) || 0,
      notes: String(results.notes || ''),
      images: Array.isArray(results.images) ? results.images : [],
      timestamp: new Date().toISOString(),
      lineLabel: results.lineLabel || `Line${index + 1}`,
      lineQty: Number(results.lineQty) || currentQty,
    };

    mergePatchIntoReceiveItems({
      id: String(current.id),
      inspectionStatus: 'passed',
      inspectionData: inspectionData,
      passedQty: inspectionData.passedQty,
      failedQty: inspectionData.failedQty,
      holdQty: inspectionData.holdQty,
      inspectionNotes: inspectionData.notes,
    });

    setEdited(prev => ({
      ...prev,
      [current.id]: {
        ...(prev[current.id] ?? {}),
        inspectionStatus: 'passed',
        inspectionData: inspectionData,
        passedQty: inspectionData.passedQty,
        failedQty: inspectionData.failedQty,
        holdQty: inspectionData.holdQty,
        inspectionNotes: inspectionData.notes,
      },
    }));
  }
}, [current, mergePatchIntoReceiveItems, currentQty, index]);

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
          } catch { }
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
  const [lotserialModalVisible, setLotSerialModalVisible] = useState(false);

  // const persistPatches = () => {
  //   const patches = [];
  //   allItems.forEach(it => {
  //     const st = edited[it.id];
  //     if (!st) return;
  //     const limit = Number(it.max_open_qty ?? it.openQty ?? 0);
  //     const clampedQty = clampToLimit(Number(st.receivingQty ?? 0), limit);
  //     if (!readOnly) {
  //       patches.push({
  //         id: String(it.id),
  //         receivingQty: clampedQty,
  //         qtyToReceive: clampedQty,
  //         lpn: st.lpn ?? '',
  //         subInventory: st.subInventory ?? '',
  //         locator: st.locator ?? null,
  //       });
  //     }
  //   });
  //   patches.forEach(p => mergePatchIntoReceiveItems(p));
  // };

  const openLotModal = () => {
    if (!current || readOnly) return;
    persistPatches();
    setLotModalVisible(true);
  };

  const handleSaveInspection = (inspectionData) => {
    if (!current) return;

    const safeInspection = {
      passedQty: Number(inspectionData.passedQty) || 0,
      failedQty: Number(inspectionData.failedQty) || 0,
      holdQty: Number(inspectionData.holdQty) || 0,
      notes: String(inspectionData.notes || ''),
      images: Array.isArray(inspectionData.images) ? inspectionData.images : [],
      timestamp: new Date().toISOString(),
      lineLabel: inspectionData.lineLabel || `Line${index + 1}`,
      lineQty: Number(inspectionData.lineQty) || 0,
    };

    mergePatchIntoReceiveItems({
      id: String(current.id),
      inspectionData: safeInspection,
      inspectionStatus: 'passed',
      passedQty: safeInspection.passedQty,
      failedQty: safeInspection.failedQty,
      holdQty: safeInspection.holdQty,
    });
  };

  useEffect(() => {
    if (current && (current?.inspectionData || current?.inspectionStatus === 'passed')) {
      setInspectionResults({
        passedQty: current.inspectionData?.passedQty || current.passedQty || 0,
        failedQty: current.inspectionData?.failedQty || current.failedQty || 0,
        holdQty: current.inspectionData?.holdQty || current.holdQty || 0,
        notes: current.inspectionData?.notes || current.inspectionNotes || '',
        lineLabel: current.inspectionData?.lineLabel || `Line${index + 1}`,
        lineQty: current.inspectionData?.lineQty || currentQty,
      });
      setInspectionCompleted(true);
    } else {
      setInspectionResults({
        passedQty: 0,
        failedQty: 0,
        holdQty: 0,
        notes: '',
        lineLabel: `Line${index + 1}`,
        lineQty: currentQty,
      });
      setInspectionCompleted(false);
    }
  }, [current, index, currentQty]);

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

  const handleComplete = () => {
    const results = {
      passed: totalPassed,
      failed: totalFailed,
      hold: totalHold,
    };
    onComplete(results);
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
        inspectionStatus: st.inspectionStatus ?? it.inspectionStatus,
        inspectionData: st.inspectionData ?? it.inspectionData,
        passedQty: st.passedQty ?? it.passedQty,
        failedQty: st.failedQty ?? it.failedQty,
        holdQty: st.holdQty ?? it.holdQty,
        inspectionNotes: st.inspectionNotes ?? it.inspectionNotes,
        putAwayStatus: it.putAwayStatus ?? PUT_AWAY_STATUS.PENDING,
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
    const showLotSerial = itemType === 'LotSerial' || itemType === 'Lot+Serial';
    return { showLot, showSerial, showLotSerial };
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

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.mainContainer}>
          <View style={styles.cardReceive}>
            <View style={styles.tabRow}>
              <TouchableOpacity
                style={styles.tabWrapper}
                activeOpacity={0.9}
                onPress={() => setActiveTab('Receive')}
              >
                <LinearGradient
                  colors={
                    activeTab === 'Receive'
                      ? ['#233E55', '#5D768B']
                      : ['#E5E7EB', '#D1D5DB']
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.tabBtn, activeTab === 'Receive' && styles.tabBtnActive]}
                >
                  {activeTab === 'Receive' ? (
                    <SelectedReceiveTabIcon width={16} height={16} />
                  ) : (
                    <ReceiveTabIcon width={16} height={16} />
                  )}
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === 'Receive'
                        ? styles.tabTextActive
                        : styles.tabTextInactive,
                    ]}
                  >
                    Receive
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.tabWrapper}
                activeOpacity={0.9}
                onPress={() => setActiveTab('Inspect')}
              >
                <LinearGradient
                  colors={
                    activeTab === 'Inspect'
                      ? ['#233E55', '#5D768B']
                      : ['#F3F4F6', '#E5E7EB']
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.tabBtn, activeTab === 'Inspect' && styles.tabBtnActive]}
                >
                  {activeTab === 'Inspect' ? (
                    <SelectedInspectTabIcon width={16} height={16} />
                  ) : (
                    <InspectTabIcon width={16} height={16} />
                  )}
                  <Text
                    style={
                      activeTab === 'Inspect'
                        ? [styles.tabText, styles.tabTextActive]
                        : [styles.tabText, styles.tabTextInactive]
                    }
                  >
                    Inspect
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.tabWrapper}
                activeOpacity={0.9}
                onPress={() => setActiveTab('PutAway')}
              >
                <LinearGradient
                  colors={
                    activeTab === 'PutAway'
                      ? ['#233E55', '#5D768B']
                      : ['#F3F4F6', '#E5E7EB']
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.tabBtn, activeTab === 'PutAway' && styles.tabBtnActive]}
                >
                  {activeTab === 'PutAway' ? (
                    <SelectedPutAwayTabIcon width={16} height={16} />
                  ) : (
                    <PutAwayTabIcon width={16} height={16} />
                  )}
                  <Text
                    style={
                      activeTab === 'PutAway'
                        ? [styles.tabText, styles.tabTextActive]
                        : [styles.tabText, styles.tabTextInactive]
                    }
                  >
                    Put Away
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {activeTab === 'Receive' && (
              <>
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

                {current && (
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
              </>
            )}

            {activeTab === 'Inspect' && (
              <View style={{ width: '100%' }}>
                {!(inspectionCompleted || current?.inspectionStatus === 'passed' || currentStoreLine?.inspectionStatus === 'passed') ? (<>
                  <View
                    style={{
                      borderWidth: 1,
                      borderColor: '#F06000',
                      backgroundColor: '#FFF7EC',
                      padding: 12,
                      borderRadius: 8,
                      marginBottom: 18,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <InspectStatusIcon width={16} height={16} style={{ marginRight: 6 }} />
                      <Text style={{ color: '#F06000', fontSize: 14, fontWeight: '500' }}>
                        Inspection Status
                      </Text>
                    </View>

                    <Text
                      style={{
                        color: '#F06000', 
                        fontSize: 14,
                        fontWeight: '600',
                      }}
                    >
                      Pending
                    </Text>
                  </View>

                  <Pressable
                    style={{
                      width: '100%',
                      borderWidth: 1,
                      borderColor: '#5D768B',
                      paddingVertical: 12,
                      borderRadius: 8,
                      alignItems: 'center',
                    }}
                    onPress={() => setInspectModalVisible(true)}
                  >
                    <Text style={{ color: '#5D768B', fontSize: 15, fontWeight: '600' }}>
                      Perform Inspection
                    </Text>
                  </Pressable>
                </>
                ) : (
                  <>
                    <View
                      style={{
                        borderWidth: 1,
                        borderColor: '#0E9F6E',
                        backgroundColor: '#ECFDF5',
                        padding: 12,
                        borderRadius: 8,
                        marginBottom: 16,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Text style={{ color: '#0E9F6E', fontSize: 14, fontWeight: '600' }}>
                        Inspection Status
                      </Text>
                      <Text style={{ color: '#0E9F6E', fontSize: 14, fontWeight: '700' }}>
                        Passed
                      </Text>
                    </View>

                    <View style={{
                      width: ms(325),
                      height: ms(114),
                      borderRadius: ms(8),
                      backgroundColor: '#FFFFFF',
                      padding: ms(16),
                      shadowColor: '#000000',
                      shadowOpacity: 0.25,
                      shadowOffset: { width: 0, height: 4 },
                      shadowRadius: 10,
                      elevation: 5,
                      alignSelf: 'center',
                    }}>
                      <Text style={{
                        fontSize: ms(14),
                        fontWeight: '700',
                        color: '#233E55',
                        marginBottom: ms(12),
                      }}>
                        Inspection Results
                      </Text>

                      <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                        <View
                          style={{
                            flex: 1,
                            marginRight: ms(3),
                            height: ms(53),
                            borderRadius: ms(8),
                            backgroundColor: '#EEFDF8',
                            justifyContent: 'center',
                            alignItems: 'center',
                            shadowColor: '#00000040',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.25,
                            shadowRadius: 10,
                            elevation: 3,
                          }}
                        >
                          <Text style={{ color: '#0E9F6E', fontWeight: '700', fontSize: ms(18) }}>
                            {current?.passedQty || current?.inspectionData?.passedQty || inspectionResults.passedQty || 0}
                          </Text>
                          <Text style={{ color: '#0E9F6E', fontSize: ms(12), fontWeight: '600' }}>Passed</Text>
                        </View>

                        <View
                          style={{
                            flex: 1,
                            marginHorizontal: ms(3),
                            height: ms(53),
                            borderRadius: ms(8),
                            backgroundColor: '#FDF2F7',
                            justifyContent: 'center',
                            alignItems: 'center',
                            shadowColor: '#00000040',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.25,
                            shadowRadius: 10,
                            elevation: 3,
                          }}
                        >
                          <Text style={{ color: '#DA1E28', fontWeight: '700', fontSize: ms(18) }}>
                            {current?.failedQty || current?.inspectionData?.failedQty || inspectionResults.failedQty || 0}
                          </Text>
                          <Text style={{ color: '#DA1E28', fontSize: ms(12), fontWeight: '600' }}>Failed</Text>
                        </View>

                        <View
                          style={{
                            flex: 1,
                            marginLeft: ms(3),
                            height: ms(53),
                            borderRadius: ms(8),
                            backgroundColor: '#FFF8EC',
                            justifyContent: 'center',
                            alignItems: 'center',
                            shadowColor: '#00000040',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.25,
                            shadowRadius: 10,
                            elevation: 3,
                          }}
                        >
                          <Text style={{ color: '#F06000', fontWeight: '700', fontSize: ms(18) }}>
                            {current?.holdQty || current?.inspectionData?.holdQty || inspectionResults.holdQty || 0}
                          </Text>
                          <Text style={{ color: '#F06000', fontSize: ms(12), fontWeight: '600' }}>On Hold</Text>
                        </View>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={{
                        width: '100%',
                        backgroundColor: '#7392AA',
                        paddingVertical: 12,
                        borderRadius: 8,
                        alignItems: 'center',
                        marginTop: 16,
                        flexDirection: 'row',
                        justifyContent: 'center',
                      }}
                      onPress={() => setInspectModalVisible(true)}
                    >
                      <InspectEyeIcon width={20} height={20} fill="#7392AA" style={{ marginRight: 8 }} />
                      <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600' }}>
                        View Inspection
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            )}
            {activeTab === 'PutAway' && (
              <View style={{ width: '100%' }}>
                {!putAwayCompleted ? (
                  <>
                    <View
                      style={{
                        borderWidth: 1,
                        borderColor: '#F06000',
                        backgroundColor: '#FFF7EC',
                        padding: 12,
                        borderRadius: 8,
                        marginBottom: 16,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <InspectStatusIcon width={16} height={16} style={{ marginRight: 6 }} />
                        <Text style={{ color: '#F06000', fontSize: 14, fontWeight: '500' }}>
                          Put Away Status
                        </Text>
                      </View>

                      <Text
                        style={{
                          color: putAwayCompleted ? '#0E9F6E' : '#F06000',
                          fontSize: 14,
                          fontWeight: '600',
                        }}
                      >
                        {putAwayCompleted ? PUT_AWAY_STATUS.COMPLETED : PUT_AWAY_STATUS.PENDING}
                      </Text>
                    </View>

                    <Pressable
                      style={{
                        width: '100%',
                        borderWidth: 1,
                        borderColor: '#5D768B',
                        paddingVertical: 12,
                        borderRadius: 8,
                        alignItems: 'center',
                      }}
                      onPress={() => setPutAwayModalVisible(true)}
                    >
                      <Text style={{ color: '#5D768B', fontSize: 15, fontWeight: '600' }}>
                        Perform Put Away
                      </Text>
                    </Pressable>
                  </>
                ) : (
                  <>
                    <View
                      style={{
                        borderWidth: 1,
                        borderColor: '#0E9F6E',
                        backgroundColor: '#ECFDF5',
                        padding: 12,
                        borderRadius: 8,
                        marginBottom: 16,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <InspectStatusIcon width={16} height={16} style={{ marginRight: 6 }} />
                        <Text style={{ color: '#0E9F6E', fontSize: 14, fontWeight: '600' }}>
                          Put Away Status
                        </Text>
                      </View>
                      <Text style={{ color: '#0E9F6E', fontSize: 14, fontWeight: '700' }}>
                        {PUT_AWAY_STATUS.COMPLETED}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={{
                        width: '100%',
                        backgroundColor: '#7392AA',
                        paddingVertical: 12,
                        borderRadius: 8,
                        alignItems: 'center',
                        marginTop: 16,
                        flexDirection: 'row',
                        justifyContent: 'center',
                      }}
                      onPress={() => setPutAwayModalVisible(true)}
                    >
                      <InspectStatusIcon width={20} height={20} fill="#7392AA" style={{ marginRight: 8 }} />
                      <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600' }}>
                        View Put Away
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
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

                {itemPills.showLotSerial && (
                  <View style={styles.addLotRow}>
                    <TouchableOpacity
                      style={styles.addLotBtn}
                      activeOpacity={0.85}
                      onPress={openLotSerialModal}
                      disabled={readOnly || Number(current.openQty ?? 0) === 0}
                    >
                      {hasLotSerials ? (
                        <View style={styles.addLotGreen}>
                          <ReceiveAddIcon width={16} height={16} />
                          <Text style={styles.addLotGreenText}>
                            {`${lotSerialLotsCount} Lots + ${lotSerialSerialCount} Serials Added - ${lotSerialTotalQty} QTY`}
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
                          <Text style={styles.addLotText}>Add Lot + Serial</Text>
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

          <Rec_LotSerialModalPopup
            visible={lotserialModalVisible}
            onClose={() => setLotSerialModalVisible(false)}
            onSave={handleSaveLotSerials}
            itemName={current.itemName}
            itemCode={current.itemid}
            lineQty={currentQty}
            lineLabel={lineLabel}
            initialLots={currentLotSerialLines}
          />
        </>
      )}
      <Rec_InspectPopup
        visible={inspectModalVisible}
        onClose={() => setInspectModalVisible(false)}
        itemName={current?.itemName}
        itemCode={current?.itemid}
        lineLabel={`Line${index + 1}`}
        lineQty={currentQty}
        onComplete={handleInspectionComplete}
      />

      {current && (
        <Rec_PutAwayPopup
          visible={putAwayModalVisible}
          onClose={() => setPutAwayModalVisible(false)}
          lineLabel={`Line${index + 1}`}
          lineQty={currentQty}
          lineId={current.id}
          onPutAwayComplete={handlePutAwayComplete}
        />
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
  navEdge: {
    width: ms(44),
    height: ms(32),
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    flex: 1,
    color: '#233E55',
    textAlign: 'center',
    fontSize: ms(12),
    fontWeight: '600',
  },
  scrollContent: { paddingBottom: ms(120) },
  mainContainer: { paddingBottom: ms(16) },

  cardReceive: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: ms(16),
    marginTop: ms(4),
    borderRadius: ms(12),
    paddingHorizontal: ms(14),
    paddingTop: ms(12),
    paddingBottom: ms(16),
    elevation: 2,
    minHeight: 200,
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
    marginBottom: ms(12),
  },
  itemInfoRow: { flexDirection: 'row', alignItems: 'center' },
  itemIconWrap: {
    width: ms(46),
    height: ms(46),
    borderRadius: ms(10),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: ms(10),
  },
  itemTextCol: { flex: 1 },
  itemName: { fontSize: ms(13), fontWeight: '700', color: '#111827' },
  itemCode: { marginTop: ms(3), fontSize: ms(11), color: '#9D9FA3' },
  itemPillsCol: { alignItems: 'flex-end', justifyContent: 'center' },
  pilllotserial: {
    minWidth: ms(50),
    paddingHorizontal: ms(10),
    paddingVertical: ms(8),
    borderRadius: ms(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillLot: {
    minWidth: ms(48),
    paddingHorizontal: ms(8),
    paddingVertical: ms(3),
    borderRadius: ms(12),
    backgroundColor: '#D9E4EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillLotText: { fontSize: ms(10), color: '#5C996E', fontWeight: '600' },
  pillSerial: {
    minWidth: ms(48),
    paddingHorizontal: ms(8),
    paddingVertical: ms(3),
    borderRadius: ms(12),
    backgroundColor: '#9CC6F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: ms(4),
  },
  pillSerialText: { fontSize: ms(10), color: '#668694', fontWeight: '600' },

  section: { marginTop: ms(8) },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: ms(8) },
  sectionTitle: {
    marginLeft: ms(6),
    fontSize: ms(13),
    fontWeight: '700',
    color: '#111827',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: ms(6),
    justifyContent: 'space-between',
  },
  label: { fontSize: ms(11), color: '#6C6C6C' },
  orderQtyText: { fontSize: ms(13), fontWeight: '700', color: '#111827' },
  orderQtyUom: { fontSize: ms(11), fontWeight: '600', color: '#6B7280' },
  numericRight: { alignItems: 'flex-end', justifyContent: 'center' },
  uomText: {
    fontSize: ms(10),
    color: '#595A5C',
    marginTop: ms(2),
    marginRight: ms(2),
    textAlign: 'right',
  },

  shipHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  shipHeaderLeft: { flexDirection: 'row', alignItems: 'center' },
  shipValue: {
    fontSize: ms(12),
    fontWeight: '700',
    color: '#111827',
    marginLeft: ms(8),
    flexShrink: 1,
    textAlign: 'right',
  },

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
  addLotText: {
    marginLeft: ms(6),
    fontSize: ms(11),
    fontWeight: '700',
    color: '#FFFFFF',
  },

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
  addLotGreenText: {
    marginLeft: ms(6),
    fontSize: ms(11),
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default Rec_ViewItemDetailsScreen;