import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  TextInput,
  Image,
  BackHandler,
  Modal,
  Alert,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import Toast from 'react-native-toast-message';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import GlobalHeaderComponent from '../../components/GlobalHeaderComponent';
import FooterButtonsComponent from '../../components/FooterButtonsComponent';
import CustomNumericInput from '../../components/CustomNumericInput';
import Rec_DropDown from '../../components/receive/Rec_DropDown';
import Rec_CustomNumericInput from '../../components/receive/Rec_CustomNumericInput';
import Rec_LotModalPopup from '../../components/receive/Rec_LotModalPopup';
import Rec_LotSerialModalPopup from '../../components/receive/Rec_LotSerialModalPopup';
import Rec_SerialModalPopup from '../../components/receive/Rec_SerialModalPopup';
import Rec_InspectSerialModalPopup from '../../components/receive/Rec_InspectSerialModalPopup';
import { useReceivingStore } from '../../store/receivingStore';
import { GetItemImage, GetLocatorsData, LPNList } from '../../api/ApiServices';
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
import PendingInspectionIcon from '../../assets/icons/pendinginspectionicon.svg';
import PassedInspectionIcon from '../../assets/icons/passedinspectionicon.svg';
import PendingPutAwayIcon from '../../assets/icons/pendingputawayicon.svg';
import PassedPutAwayIcon from '../../assets/icons/passedputawayicon.svg';
import PhotoUploadIcon from '../../assets/icons/photouploadicon.svg';
import PhotoCaptureIcon from '../../assets/icons/photocaptureicon.svg';
import DeleteAttachmentIcon from '../../assets/icons/deleteattachmenticon.svg';
import InspectTickIcon from '../../assets/icons/inspecttickicon.svg';
import Rec_InspectLotModalPopup from '../../components/receive/Rec_InspectLotModalPopup';
import Barcodescanner from '../../assets/icons/barcodescanner.svg';
import BarcodeScanner from '../../screens/BarCodeScanner';
import Rec_InspectLotSerialModalPopup from '../../components/receive/Rec_InspectLotSerialModalPopup';
import Rec_PutAwayLotModalPopup from '../../components/receive/Rec_PutAwayLotModalPopup';
import Rec_PutAwaySerialModalPopup from '../../components/receive/Rec_PutAwaySerialModalPopup';
import CameraIcon from '../../assets/icons/CameraIcon.svg';





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

const getId = v => {
  if (v == null) return '';
  if (typeof v === 'string' || typeof v === 'number') return String(v);
  if (typeof v === 'object' && (v.id != null || v.locator_id != null)) {
    return String(v.id ?? v.locator_id);
  }
  return '';
};


const INSPECTION_STATUS_OPTIONS = [
  { id: 'Above Average', name: 'Above Average' },
  { id: 'Average', name: 'Average' },
  { id: 'Below Average', name: 'Below Average' },
  { id: 'Excellent', name: 'Excellent' },
  { id: 'Reject and Notify', name: 'Reject and Notify' },
  { id: 'Unacceptable', name: 'Unacceptable' },
];

const normalizeLotKey = v => String(v ?? '').trim().toLowerCase();

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
      const inspectionStatus = stored?.inspectionStatus || it.inspectionStatus || 'Pending';
      return {
        ...it,
        receivingQty: Number(stored?.qtyToReceive ?? it.receivingQty ?? 0),
        lpn: stored?.lpn ?? it.lpn ?? '',
        subInventory: stored?.subInventory ?? it.subInventory ?? '',
        locator: stored?.locator ?? it.locator ?? '',
        imageUri: stored?.imageUri ?? it.imageUri ?? null,
        max_open_qty: Number(it.max_open_qty ?? stored?.max_open_qty ?? it.openQty ?? 0),
        itemType: it.itemType || it.itemtype || null,
        orderQty: Number(it.orderQty ?? it.orderedQty ?? 0),
        inspections: stored?.inspections || [],
        inspectionStatus,
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
  const [LpnListData, setLPNoption] = useState([]);
  const [serialRowsMap, setSerialRowsMap] = useState({});
  const [lotserialRowsMap, setSerialLotRowsMap] = useState({});
  const [inspectionEdited, setInspectionEdited] = useState({});
  const [lotModalVisible, setLotModalVisible] = useState(false);
  const [serialModalVisible, setSerialModalVisible] = useState(false);
  const [lotserialModalVisible, setLotSerialModalVisible] = useState(false);
  const [inspectSerialModalVisible, setInspectSerialModalVisible] = useState(false);

  const [putAwaySerialModalVisible, setPutAwaySerialModalVisible] = useState(false);
  const [putAwaySelectedSerialsMap, setPutAwaySelectedSerialsMap] = useState({});
  const [putAwayEditedMap, setPutAwayEditedMap] = useState({});


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

  const lotSerialLotsCount = currentLotSerialLines.length;
  const hasLotSerials = lotSerialLotsCount > 0;

  const lotSerialSerialCount = currentLotSerialLines.reduce((sum, l) => {
    const arr = Array.isArray(l.serials) ? l.serials : [];
    return sum + arr.length;
  }, 0);

  const lotSerialTotalQty = currentLotSerialLines.reduce(
    (sum, l) => sum + (Number(l.qty) || 0),
    0,
  );

  const currentSerialLines = useMemo(() => {
    if (!current) return [];
    const fromStore = currentStoreLine?.serialLines;
    if (Array.isArray(fromStore)) return fromStore;
    const fromLocal = serialRowsMap[current.id];
    return Array.isArray(fromLocal) ? fromLocal : [];
  }, [current, currentStoreLine, serialRowsMap]);

  const currentSavedSerials = useMemo(() => {
    const src = currentSerialLines;
    if (!Array.isArray(src)) return [];
    return src
      .map(s => {
        if (typeof s === 'string') return s.trim();
        if (s && typeof s === 'object') {
          return String(s.serialNo ?? s.serial ?? '').trim();
        }
        return '';
      })
      .filter(Boolean);
  }, [currentSerialLines]);

  const serialCount = currentSavedSerials.length;
  const hasSerials = serialCount > 0;

  const serialMode = useMemo(() => {
    if (!current) return 'ranges';
    const m = currentStoreLine?.serialMode;
    return m === 'manual' ? 'manual' : 'ranges';
  }, [current, currentStoreLine]);

  const [showScanner, setShowScanner] = useState(false);
  const [scannedLot, setScannedLot] = useState('');
  const [scannedLotSerial, setscannedLotSerial] = useState('');
  const [inspectModalVisible, setInspectModalVisible] = useState(false);
  const [selectedLot, setSelectedLot] = useState(null);
  const [selectedLotIndex, setSelectedLotIndex] = useState(0); 

  const [putAwayModalVisible, setPutAwayModalVisible] = useState(false);
  const [selectedPutAwayLot, setSelectedPutAwayLot] = useState(null);
  const [selectedPutAwayLotIndex, setSelectedPutAwayLotIndex] = useState(0);
  const [putAwayDataMap, setPutAwayDataMap] = useState({});
  const [scannedPutAwayLot, setScannedPutAwayLot] = useState('');


  const [inspectLotSerialModalVisible, setInspectLotSerialModalVisible] = useState(false);
  const [selectedLotSerial, setSelectedLotSerial] = useState(null);
  const [selectedLotSerialIndex, setSelectedLotSerialIndex] = useState(0);
  const [selectedLotSerialInitialInspection, setSelectedLotSerialInitialInspection] = useState(null);

  const [inspectLotSerialSerialModalVisible, setInspectLotSerialSerialModalVisible] = useState(false);
  const [inspectLotSerialKey, setInspectLotSerialKey] = useState('');
  const [lotSerialSelectedSerialsMap, setLotSerialSelectedSerialsMap] = useState({});


  const [inspectionDataMap, setInspectionDataMap] = useState({});
  const [selectedLotInitialInspection, setSelectedLotInitialInspection] = useState(null);
    // preview modal state
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewUri, setPreviewUri] = useState(null);
    const [imageMap, setImageMap] = useState({});

  const openInspectModal = useCallback(
    (lot, lotIdx) => {
      setSelectedLot(lot);
      setSelectedLotIndex(lotIdx);
      const itemId = current?.id;
      const key = itemId != null ? `${itemId}-${lotIdx}` : '';
      const fromMap = key ? inspectionDataMap[key] : null;
      let fromStore = null;

      if (!fromMap && currentStoreLine?.inspections && Array.isArray(currentStoreLine.inspections)) {
        fromStore =
          currentStoreLine.inspections.find(i => Number(i?.lotIndex) === Number(lotIdx)) || null;
      }

      setSelectedLotInitialInspection(fromMap || fromStore || null);
      setInspectModalVisible(true);
    },
    [current?.id, inspectionDataMap, currentStoreLine],
  );

  const openPutAwayModal = useCallback(
  (lot, lotIdx) => {
    setSelectedPutAwayLot(lot);
    setSelectedPutAwayLotIndex(lotIdx);

    const itemId = current?.id;
    const key = itemId != null ? `${itemId}-${lotIdx}` : '';
    const fromMap = key ? putAwayDataMap[key] : null;

    let fromStore = null;
    if (!fromMap) {
      const lots = Array.isArray(currentStoreLine?.putAwayLots) ? currentStoreLine.putAwayLots : [];
      fromStore = lots.find(x => Number(x?.lotIndex) === Number(lotIdx)) || null;
    }

    setPutAwayModalVisible(true);
  },
  [current?.id, putAwayDataMap, currentStoreLine],
);

const handleScanAndOpenPutAwayLot = scannedValue => {
  if (!current) return;
  const code = normalizeLotKey(scannedValue);
  if (!code) {
    Toast.show({ type: 'error', text1: 'Invalid Lot' });
    return;
  }
  const idx = currentLotLines.findIndex(l => normalizeLotKey(l?.lotNumber) === code);
  if (idx < 0) {
    Toast.show({ type: 'error', text1: 'Lot not found' });
    return;
  }
  const lot = currentLotLines[idx];
  setTimeout(() => {
    openPutAwayModal(lot, idx);
  }, 250);
};

const handlePutAwayComplete = putAwayData => {
  const lotKey = `${current?.id}-${putAwayData.lotIndex}`;

  setPutAwayDataMap(prev => ({
    ...prev,
    [lotKey]: {
      ...putAwayData,
      putAwayDate: new Date().toISOString(),
    },
  }));

  if (!current) return;

  const stored = Array.isArray(receiveItems)
    ? receiveItems.find(r => String(r.id) === String(current.id))
    : null;

  const existing = Array.isArray(stored?.putAwayLots) ? stored.putAwayLots : [];
  const idx = existing.findIndex(x => Number(x?.lotIndex) === Number(putAwayData.lotIndex));

  let updated;
  const row = { ...putAwayData, putAwayDate: new Date().toISOString() };

  if (idx >= 0) {
    updated = [...existing];
    updated[idx] = row;
  } else {
    updated = [...existing, row];
  }

  const allCompleted =
    Array.isArray(currentLotLines) &&
    currentLotLines.length > 0 &&
    currentLotLines.every((_, i) => updated.some(x => Number(x?.lotIndex) === Number(i)));

  mergePatchIntoReceiveItems({
    id: String(current.id),
    putAwayLots: updated,
    putAwayStatus: allCompleted ? 'Passed' : 'Pending',
  });
};


  const openInspectLotSerialModal = useCallback(
  (lot, lotIdx) => {
    setSelectedLotSerial(lot);
    setSelectedLotSerialIndex(lotIdx);

    const itemId = current?.id;
    const key = itemId != null ? `${itemId}-${lotIdx}` : '';
    setInspectLotSerialKey(key);

    const fromMap = key ? inspectionDataMap[key] : null;
    let fromStore = null;

    if (!fromMap && currentStoreLine?.inspections && Array.isArray(currentStoreLine.inspections)) {
      fromStore =
        currentStoreLine.inspections.find(i => Number(i?.lotIndex) === Number(lotIdx)) || null;
    }

    const initial = fromMap || fromStore || null;

    const initSerials = Array.isArray(initial?.serials) ? initial.serials : [];
    if (key && initSerials.length) {
      setLotSerialSelectedSerialsMap(prev => ({ ...prev, [key]: initSerials }));
    }

    setSelectedLotSerialInitialInspection(initial);
    setInspectLotSerialModalVisible(true);
  },
  [current?.id, inspectionDataMap, currentStoreLine],
);

const openInspectLotSerialSerialModal = useCallback(() => {
  if (!selectedLotSerial || !current) return;

  const qty = Number(selectedLotSerial?.qty || 0);
  if (!qty || qty <= 0) return;

  setInspectLotSerialSerialModalVisible(true);
}, [selectedLotSerial, current]);



  const handleInspectionComplete = inspectionData => {
    const lotKey = `${current?.id}-${inspectionData.lotIndex}`;

    setInspectionDataMap(prev => ({
      ...prev,
      [lotKey]: {
        ...inspectionData,
        inspectionDate: new Date().toISOString(),
      },
    }));

    if (current) {
      const stored = Array.isArray(receiveItems)
        ? receiveItems.find(r => String(r.id) === String(current.id))
        : null;

      const existingInspections = stored?.inspections || [];

      const existingIndex = existingInspections.findIndex(
        insp => insp.lotIndex === inspectionData.lotIndex,
      );

      let updatedInspections;
      if (existingIndex >= 0) {
        updatedInspections = [...existingInspections];
        updatedInspections[existingIndex] = {
          ...inspectionData,
          inspectionDate: new Date().toISOString(),
        };
      } else {
        updatedInspections = [
          ...existingInspections,
          {
            ...inspectionData,
            inspectionDate: new Date().toISOString(),
          },
        ];
      }

      const hasRejected = updatedInspections.some(
        insp =>
          insp.status?.name === 'Reject and Notify' ||
          insp.status?.name === 'Unacceptable',
      );

      const hasPassed = updatedInspections.some(
        insp =>
          insp.status?.name === 'Above Average' ||
          insp.status?.name === 'Average' ||
          insp.status?.name === 'Excellent' ||
          insp.status?.name === 'Passed',
      );

      const inspectionStatus = hasRejected ? 'Rejected' : hasPassed ? 'Passed' : 'Pending';

      mergePatchIntoReceiveItems({
        id: String(current.id),
        inspections: updatedInspections,
        inspectionStatus,
      });
    }
  }; 

  const handleLotSerialInspectionComplete = inspectionData => {
  const lotKey = `${current?.id}-${inspectionData.lotIndex}`;

  setInspectionDataMap(prev => ({
    ...prev,
    [lotKey]: {
      ...inspectionData,
      inspectionDate: new Date().toISOString(),
    },
  }));

  if (current) {
    const stored = Array.isArray(receiveItems)
      ? receiveItems.find(r => String(r.id) === String(current.id))
      : null;

    const existingInspections = stored?.inspections || [];

    const existingIndex = existingInspections.findIndex(
      insp => Number(insp.lotIndex) === Number(inspectionData.lotIndex),
    );

    let updatedInspections;
    if (existingIndex >= 0) {
      updatedInspections = [...existingInspections];
      updatedInspections[existingIndex] = {
        ...inspectionData,
        inspectionDate: new Date().toISOString(),
      };
    } else {
      updatedInspections = [
        ...existingInspections,
        {
          ...inspectionData,
          inspectionDate: new Date().toISOString(),
        },
      ];
    }

    const hasRejected = updatedInspections.some(
      insp =>
        insp.status?.name === 'Reject and Notify' ||
        insp.status?.name === 'Unacceptable',
    );

    const hasPassed = updatedInspections.some(
      insp =>
        insp.status?.name === 'Above Average' ||
        insp.status?.name === 'Average' ||
        insp.status?.name === 'Excellent' ||
        insp.status?.name === 'Passed',
    );

    const inspectionStatus = hasRejected ? 'Rejected' : hasPassed ? 'Passed' : 'Pending';

    mergePatchIntoReceiveItems({
      id: String(current.id),
      inspections: updatedInspections,
      inspectionStatus,
    });
  }
};


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
  if (readOnly) return;

  const next = {};
  for (const it of allItems) {
    const fromStore = Array.isArray(receiveItems)
      ? receiveItems.find(r => String(r.id) === String(it.id))
      : undefined;

    next[it.id] = {
      subInventory: getId(
        fromStore?.putAwaySubInventory ??
          fromStore?.subInventory ??
          it.subInventory ??
          OrgData?.selectedinventory ??
          '',
      ),
      locator: getId(
        fromStore?.putAwayLocator ??
          fromStore?.locator ??
          it.locator ??
          '',
      ),
      putAwayQty: Number(fromStore?.putAwayQty ?? 0),
    };
  }

  setPutAwayEditedMap(next);
}, [allItems, receiveItems, readOnly, OrgData]);


useEffect(() => {
  if (readOnly) return;
  if (!current) return;
  if (current?.itemType !== 'Serial') return;

  const storeSerials = Array.isArray(currentStoreLine?.putAwaySerials)
    ? currentStoreLine.putAwaySerials
    : [];

  if (!storeSerials.length) return;

  setPutAwaySelectedSerialsMap(prev => {
    const existing = Array.isArray(prev[current.id]) ? prev[current.id] : [];
    if (existing.length) return prev; // don’t override user’s current session selection
    return { ...prev, [current.id]: storeSerials };
  });
}, [readOnly, current?.id, current?.itemType, currentStoreLine?.putAwaySerials]);




  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.navigate('NewReceiveScreen');
        return true;
      };
      const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => sub.remove();
    }, [navigation]),
  );

  useEffect(() => {
    if (readOnly) return;
    const next = {};
    for (const it of allItems) {
      const fromStore = Array.isArray(receiveItems)
        ? receiveItems.find(r => String(r.id) === String(it.id))
        : undefined;
      const insp = fromStore?.inspectionData || {};
      const photos = Array.isArray(insp.attachments) ? insp.attachments : [];
      const serials = Array.isArray(insp.serials) ? insp.serials : [];
      next[it.id] = {
        inspectionQty: Number(insp.qty ?? 0),
        inspectionStatus: insp.status || fromStore?.inspectionStatus || '',
        inspectionNotes: fromStore?.inspectionNotes || insp.notes || '',
        inspectionPhotos: photos,
        inspectionSerials: serials,
      };
    }
    setInspectionEdited(next);
  }, [allItems, receiveItems, readOnly]);

  useEffect(() => {
    if (!readOnly && Array.isArray(allItems)) {
      allItems.forEach(async it => {
        const sub_id =
          edited[it.id]?.subInventory ?? it.subInventory ?? OrgData?.selectedinventory;
        if (!sub_id) return;
        const cached = getLocatorFromCache(sub_id?.id);
        if (cached) {
          setLocatorDataMap(prev => ({ ...prev, [it.id]: cached }));
        } else {
          try {
            const locdata = await GetLocatorsData(sub_id?.id);
            if (Array.isArray(locdata) && locdata.length) {
              const mapped = locdata.map(d => ({
                id: d.locator_id,
                name: d.locator_name,
                enabled: d.locator_enabled,
              }));
              setLocatorDataMap(prev => ({ ...prev, [it.id]: mapped }));
              setLocatorInCache(sub_id?.id, mapped);
            }
          } catch { }
        }
      });
    }
  }, [allItems, edited, readOnly, OrgData, getLocatorFromCache, setLocatorInCache]);

  useEffect(() => {
    async function fetchLPN() {
      try {
        const Lpndata = await LPNList();
        const LpndataList = Lpndata.map(d => ({
          id: d.lpn_id,
          name: d.lpn_num,
          enabled: d.lpn_enabled,
        }));
        setLPNoption(LpndataList);
      } catch (err) {
        console.log('LPN fetch error', err);
      }
    }

    fetchLPN();
  }, []);

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

  const handlePutAwaySubInvChange = (itemId, val) => {
    const id = getId(val);
    setPutAwayEditedMap(prev => ({
      ...prev,
      [itemId]: { ...(prev[itemId] ?? {}), subInventory: id, locator: '' },
    }));
  };

  const handlePutAwayLocatorChange = (itemId, val) => {
    const id = getId(val);
    setPutAwayEditedMap(prev => ({
      ...prev,
      [itemId]: { ...(prev[itemId] ?? {}), locator: id },
    }));
  };


  const handlePutAwayQtyChange = (itemId, limit, newQty) => {
    if (readOnly) return;
    const clamped = clampToLimit(newQty, limit);
    setPutAwayEditedMap(prev => ({
      ...prev,
      [itemId]: { ...(prev[itemId] ?? {}), putAwayQty: clamped },
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
    const clamped = clampToLimit(
      newQty,
      Number(item.max_open_qty ?? item.openQty ?? 0),
    );
    setEdited(prev => ({
      ...prev,
      [itemId]: { ...(prev[itemId] ?? {}), receivingQty: clamped },
    }));
  };

  const handleInspectionQtyChange = (itemId, limit, newQty) => {
    if (readOnly) return;
    const clamped = clampToLimit(newQty, limit);
    setInspectionEdited(prev => {
      const prevLine = prev[itemId] || {};
      return {
        ...prev,
        [itemId]: { ...prevLine, inspectionQty: clamped },
      };
    });
  };

  const handleInspectionStatusChange = (itemId, status) => {
    setInspectionEdited(prev => {
      const prevLine = prev[itemId] || {};
      return {
        ...prev,
        [itemId]: { ...prevLine, inspectionStatus: status },
      };
    });
  };

  const handleInspectionNotesChange = (itemId, text) => {
    setInspectionEdited(prev => {
      const prevLine = prev[itemId] || {};
      return {
        ...prev,
        [itemId]: { ...prevLine, inspectionNotes: text },
      };
    });
  };

  const handleAddPhotoUris = (itemId, uris) => {
    if (!Array.isArray(uris) || !uris.length) return;
    setInspectionEdited(prev => {
      const prevLine = prev[itemId] || {};
      const existing = Array.isArray(prevLine.inspectionPhotos)
        ? prevLine.inspectionPhotos
        : [];
      return {
        ...prev,
        [itemId]: {
          ...prevLine,
          inspectionPhotos: [...existing, ...uris],
        },
      };
    });
    Toast.show({ type: 'success', text1: 'Image Attached' });
  };

  const handleAddPhotoFromGallery = async () => {
    if (!current) return;
    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 0,
    });
    if (result.didCancel || result.errorCode) return;
    const uris = (result.assets || [])
      .map(a => a.uri)
      .filter(u => typeof u === 'string');
    handleAddPhotoUris(current.id, uris);
  };

  const handleAddPhotoFromCamera = async () => {
    if (!current) return;
    const result = await launchCamera({
      mediaType: 'photo',
    });
    if (result.didCancel || result.errorCode) return;
    const uris = (result.assets || [])
      .map(a => a.uri)
      .filter(u => typeof u === 'string');
    handleAddPhotoUris(current.id, uris);
  };

  const handleRemovePhoto = (itemId, uri) => {
    setInspectionEdited(prev => {
      const prevLine = prev[itemId] || {};
      const existing = Array.isArray(prevLine.inspectionPhotos)
        ? prevLine.inspectionPhotos
        : [];
      return {
        ...prev,
        [itemId]: {
          ...prevLine,
          inspectionPhotos: existing.filter(x => x !== uri),
        },
      };
    });
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

  const openLotModal = () => {
    if (!current || readOnly) return;
    persistPatches();
    setLotModalVisible(true);
  };

  const openSerialModal = () => {
    if (!current || readOnly) return;
    persistPatches();
    setSerialModalVisible(true);
  };

  const openLotSerialModal = () => {
    if (!current || readOnly) return;
    persistPatches();
    setLotSerialModalVisible(true);
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
      serialMode: mode === 'manual' ? 'manual' : 'ranges',
    });

    setSerialRowsMap(prev => ({
      ...prev,
      [current.id]: safeSerials,
    }));

    setSerialModalVisible(false);
  };

  const handleSaveLotSerials = (lots, totalQty) => {
    if (!current) return;

    const safeLots = Array.isArray(lots)
      ? lots.map(l => ({
        lotNumber: String(l.lotNumber || ''),
        mfgDate: String(l.mfgDate || ''),
        expDate: String(l.expDate || ''),
        qty: Number(l.qty) || 0,
        serialMode: l.serialMode ?? null,
        serials: Array.isArray(l.serials)
          ? l.serials.map(s => String(s || '').trim()).filter(Boolean)
          : [],
      }))
      : [];

    const flatSerials = safeLots.flatMap(l => l.serials || []);
    const flatSerialCount = flatSerials.length;

    let overallSerialMode = null;
    if (flatSerialCount > 0) {
      const allRanges =
        safeLots.length > 0 && safeLots.every(l => l.serialMode === 'ranges');
      overallSerialMode = allRanges ? 'ranges' : 'manual';
    }

    mergePatchIntoReceiveItems({
      id: String(current.id),
      lotLines: safeLots,
      lotTotalQty: Number(totalQty) || 0,
      serialLines: flatSerials,
      serialTotalQty: flatSerialCount,
      serialMode: overallSerialMode,
    });

    setSerialLotRowsMap(prev => ({
      ...prev,
      [current.id]: safeLots,
    }));

    setLotSerialModalVisible(false);
  };

  const isReceiveSubmitEnabled = useMemo(() => {
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

  // const handleSaveAll = () => {
  //   if (!isSubmitEnabled) return;
  //   persistPatches();
  //   if (returnTo) navigation.navigate(returnTo, { listType });
  //   else navigation.goBack();
  // };
  const handleSaveAll = () => {
    if (!isReceiveSubmitEnabled) return;
    persistPatches();

    allItems.forEach(item => {
      const itemInspections = Object.keys(inspectionDataMap)
        .filter(key => key.startsWith(`${item.id}-`))
        .map(key => inspectionDataMap[key]);

      if (itemInspections.length > 0) {
        const hasRejected = itemInspections.some(
          insp =>
            insp.status?.name === 'Reject and Notify' ||
            insp.status?.name === 'Unacceptable',
        );

        const hasPassed = itemInspections.some(
          insp =>
            insp.status?.name === 'Above Average' ||
            insp.status?.name === 'Average' ||
            insp.status?.name === 'Excellent' ||
            insp.status?.name === 'Passed',
        );

        const inspectionStatus = hasRejected ? 'Rejected' : hasPassed ? 'Passed' : 'Pending';

        mergePatchIntoReceiveItems({
          id: String(item.id),
          inspections: itemInspections,
          inspectionStatus,
          lastInspectionDate: itemInspections[itemInspections.length - 1]?.inspectionDate,
        });
      }
    });

    if (returnTo) navigation.navigate(returnTo, { listType });
    else navigation.goBack();
  };

  const handleSaveInspectLot = () => {
    if (!current) return;
    if (returnTo) navigation.navigate(returnTo, { listType });
    else navigation.goBack();
  };

    const handleSavePutAway = useCallback(() => {
    if (!current) return;

    const stored = Array.isArray(receiveItems)
      ? receiveItems.find(r => String(r.id) === String(current.id))
      : null;

    const putAwayLots = Array.isArray(stored?.putAwayLots) ? stored.putAwayLots : [];

    const local = putAwayEditedMap[current.id] ?? {};
    const localPutAwaySubInv = local.subInventory ?? '';
    const localPutAwayLocator = local.locator ?? '';
    const localPutAwayQty = Number(local.putAwayQty ?? 0);

    const storePutAwaySerials = Array.isArray(stored?.putAwaySerials)
      ? stored.putAwaySerials
      : [];

    const localPutAwaySerials = Array.isArray(putAwaySelectedSerialsMap[current.id])
      ? putAwaySelectedSerialsMap[current.id]
      : [];

    const finalPutAwaySerials =
      localPutAwaySerials.length > 0 ? localPutAwaySerials : storePutAwaySerials;

    const isSerialPassed =
      itemType === 'Serial' &&
      localPutAwayQty > 0 &&
      finalPutAwaySerials.length === localPutAwayQty;


    const computedPutAwayStatus =
      itemType === 'Serial'
        ? isSerialPassed
          ? 'Passed'
          : 'Pending'
        : stored?.putAwayStatus ?? 'Pending';

    mergePatchIntoReceiveItems({
      id: String(current.id),
      putAwayLots,
      putAwaySubInventory: localPutAwaySubInv,
      putAwayLocator: localPutAwayLocator,
      putAwayQty: localPutAwayQty,
      putAwaySerials: finalPutAwaySerials,
      putAwayStatus: computedPutAwayStatus,
      lastPutAwayDate: new Date().toISOString(),
    });

    if (returnTo) navigation.navigate(returnTo, { listType });
    else navigation.goBack();
  }, [
    current,
    itemType,
    receiveItems,
    putAwayEditedMap,
    putAwaySelectedSerialsMap,
    mergePatchIntoReceiveItems,
    returnTo,
    navigation,
    listType,
  ]);



  const titleContext = current?.poNumber ? String(current.poNumber) : 'Receiving';

  const currentEdited = current ? edited[current.id] ?? {} : {};

  const currentQty = current
    ? Number(currentEdited.receivingQty ?? current.receivingQty ?? 0)
    : 0;

  const currentInspection = current ? inspectionEdited[current.id] ?? {} : {};
  const inspectionQty = current ? Number(currentInspection.inspectionQty ?? 0) : 0;
  const inspectionStatusValue = currentInspection.inspectionStatus || '';
  const inspectionNotes = currentInspection.inspectionNotes || '';
  const inspectionPhotos = Array.isArray(currentInspection.inspectionPhotos)
    ? currentInspection.inspectionPhotos
    : [];
  const inspectionSerials = Array.isArray(currentInspection.inspectionSerials)
    ? currentInspection.inspectionSerials
    : [];

  const itemType = current?.itemType || null;

  const currentPutAwayEdited = current ? putAwayEditedMap[current.id] ?? {} : {};
  const putAwaySubInventory = currentPutAwayEdited.subInventory ?? '';
  const putAwayLocator = currentPutAwayEdited.locator ?? '';
  const putAwayQty = Number(currentPutAwayEdited.putAwayQty ?? 0);

  const putAwaySavedSerialsCount = currentSavedSerials.length; // Saved Receive Serials Count (same source)

  const putAwayMax =
    current && putAwaySavedSerialsCount > 0
      ? Math.min(currentQty, putAwaySavedSerialsCount)
      : 0;


      useEffect(() => {
        if (readOnly) return;
        if (!current) return;
        if (activeTab !== 'PutAway') return;
        if (itemType !== 'Serial') return;

        if (putAwayMax <= 0) return;

        setPutAwayEditedMap(prev => {
          const line = prev[current.id] ?? {};
          const existingQty = Number(line.putAwayQty ?? 0);

          // keep user's qty if already valid
          if (existingQty > 0 && existingQty <= putAwayMax) return prev;

          return {
            ...prev,
            [current.id]: {
              ...line,
              putAwayQty: putAwayMax,
            },
          };
        });
      }, [readOnly, current?.id, activeTab, itemType, putAwayMax]);



  const putAwaySelectedSerialsLocal = current
    ? Array.isArray(putAwaySelectedSerialsMap[current.id])
      ? putAwaySelectedSerialsMap[current.id]
      : []
    : [];

  const putAwaySelectedSerialsStore = Array.isArray(currentStoreLine?.putAwaySerials)
    ? currentStoreLine.putAwaySerials
    : [];

  const effectivePutAwaySerials =
    putAwaySelectedSerialsLocal.length > 0
      ? putAwaySelectedSerialsLocal
      : putAwaySelectedSerialsStore;

  const putAwayHasSerialSelection = effectivePutAwaySerials.length > 0;

  const isPutAwaySerialPassed =
    putAwayQty > 0 && effectivePutAwaySerials.length === putAwayQty;


  const putAwaySerialStatusCardBg = isPutAwaySerialPassed ? '#EEFDF8' : '#FFF8EC';
  const putAwaySerialStatusCardBorder = isPutAwaySerialPassed ? '#73B386' : '#F06000';
  const putAwaySerialStatusCardTextColor = isPutAwaySerialPassed ? '#168035' : '#F06000';
  const putAwaySerialStatusPillBg = isPutAwaySerialPassed ? '#168035' : '#FCDFCC';

  const putAwaySerialAddEnabled =
    !readOnly &&
    !!current &&
    currentQty > 0 &&
    !!putAwaySubInventory &&
    !!putAwayLocator &&
    putAwayQty > 0 &&
    putAwayQty <= putAwayMax;

  const shouldShowPutAwaySummary =
    !!putAwaySubInventory && !!putAwayLocator && putAwayQty > 0;


  const itemPills = (() => {
    const showLot = itemType === 'Lot';
    const showSerial = itemType === 'Serial';
    const showLotSerial = itemType === 'Lot+Serial';
    const showreceive = itemType === null;
    return { showLot, showSerial, showLotSerial,showreceive };
  })();

  const lineLabel = `Line${index + 1}`;

  useEffect(() => {
    const savedInspections = {};

    allItems.forEach(item => {
      const stored = Array.isArray(receiveItems)
        ? receiveItems.find(r => String(r.id) === String(item.id))
        : null;

      if (stored?.inspections && Array.isArray(stored.inspections)) {
        stored.inspections.forEach(inspection => {
          if (inspection.lotIndex !== undefined) {
            const key = `${item.id}-${inspection.lotIndex}`;
            savedInspections[key] = inspection;
          }
        });
      }
    });

    setInspectionDataMap(savedInspections);
  }, [allItems, receiveItems]);


  useEffect(() => {
  const saved = {};

  allItems.forEach(item => {
    const stored = Array.isArray(receiveItems)
      ? receiveItems.find(r => String(r.id) === String(item.id))
      : null;

    const lots = Array.isArray(stored?.putAwayLots) ? stored.putAwayLots : [];
    lots.forEach(pa => {
      if (pa?.lotIndex !== undefined && pa?.lotIndex !== null) {
        const key = `${item.id}-${pa.lotIndex}`;
        saved[key] = pa;
      }
    });
  });

  setPutAwayDataMap(saved);
}, [allItems, receiveItems]);


  const baseInspectionStatus = (currentStoreLine?.inspectionStatus || '').toLowerCase();
  const storeInspectionSerials = Array.isArray(
    currentStoreLine?.inspectionData?.serials,
  )
    ? currentStoreLine.inspectionData.serials
    : [];
  const hasAnyInspectionSerials =
    inspectionSerials.length > 0 || storeInspectionSerials.length > 0;
  const isInspectionPassed =
    baseInspectionStatus === 'passed' ||
    (hasAnyInspectionSerials && inspectionQty > 0);

  const savedSerialsCount = currentSavedSerials.length;
  const inspectionMax =
    current && savedSerialsCount > 0 ? Math.min(currentQty, savedSerialsCount) : 0;

  const isInspectSubmitEnabled = useMemo(() => {
    if (readOnly || !current) return false;
    const qty = Number(inspectionQty || 0);
    const statusSelected = !!inspectionStatusValue;
    const serials = inspectionSerials;
    if (!qty || qty <= 0) return false;
    if (!statusSelected) return false;
    if (!Array.isArray(serials) || !serials.length) return false;
    if (qty > currentQty) return false;
    if (qty > savedSerialsCount) return false;
    if (serials.length !== qty) return false;
    return true;
  }, [
    readOnly,
    current,
    inspectionQty,
    inspectionStatusValue,
    inspectionSerials,
    currentQty,
    savedSerialsCount,
  ]);

  const handleSaveInspect = () => {
    if (!current || !isInspectSubmitEnabled) return;
    const qty = Number(inspectionQty || 0);
    const status = inspectionStatusValue || '';
    const notes = inspectionNotes || '';
    const photos = inspectionPhotos;
    const serials = inspectionSerials;
    const passedQty = qty;
    const failedQty = 0;
    const holdQty = 0;
    const inspectionStatusLabel = 'Passed';

    mergePatchIntoReceiveItems({
      id: String(current.id),
      inspectionStatus: inspectionStatusLabel,
      inspectionData: {
        qty,
        status,
        notes,
        attachments: photos,
        serials,
      },
      passedQty,
      failedQty,
      holdQty,
      inspectionNotes: notes,
    });

    if (returnTo) navigation.navigate(returnTo, { listType });
    else navigation.goBack();
  };

  const handleOpenInspectSerialModal = () => {
    if (!current || readOnly) return;
    if (!inspectionQty || inspectionQty <= 0) return;
    if (!inspectionStatusValue) return;
    setInspectSerialModalVisible(true);
  };

  const inspectAddSerialEnabled =
    !readOnly &&
    currentQty > 0 &&
    inspectionQty > 0 &&
    inspectionQty <= inspectionMax &&
    !!inspectionStatusValue &&
    savedSerialsCount > 0;

  const addSerialHasSelection = Array.isArray(inspectionSerials)
    ? inspectionSerials.length > 0
    : false;

  const inspectStatusCardBg = isInspectionPassed ? '#EEFDF8' : '#FFF8EC';
  const inspectStatusCardBorder = isInspectionPassed ? '#73B386' : '#F06000';
  const inspectStatusCardTextColor = isInspectionPassed ? '#168035' : '#F06000';
  const inspectStatusPillBg = isInspectionPassed ? '#168035' : '#FCDFCC';
  useEffect(() => {
    const savedInspections = {};

    allItems.forEach(item => {
      const stored = Array.isArray(receiveItems)
        ? receiveItems.find(r => String(r.id) === String(item.id))
        : null;

      if (stored?.inspections && Array.isArray(stored.inspections)) {
        stored.inspections.forEach((inspection, index) => {
          if (inspection.lotIndex !== undefined) {
            const key = `${item.id}-${inspection.lotIndex}`;
            savedInspections[key] = inspection;
          }
        });
      }
    });

    setInspectionDataMap(savedInspections);
  }, [allItems, receiveItems]);

  const allSavedLotsInspected = useMemo(() => {
    if (!current) return false;
    if (!hasLots) return false;
    return currentLotLines.every((_, idx) => {
      const key = `${current.id}-${idx}`;
      return !!inspectionDataMap[key];
    });
  }, [current, hasLots, currentLotLines, inspectionDataMap]);

    const allSavedLotsPutAwayCompleted = useMemo(() => {
    if (!current) return false;
    if (!hasLots) return false;

    const stored = Array.isArray(receiveItems)
      ? receiveItems.find(r => String(r.id) === String(current.id))
      : null;

    const putAwayLots = Array.isArray(stored?.putAwayLots) ? stored.putAwayLots : [];

    return currentLotLines.every((_, idx) => {
      const row = putAwayLots.find(x => Number(x?.lotIndex) === Number(idx));
      const qty = Number(row?.putAwayQty ?? 0);
      const lotQty = Number(currentLotLines[idx]?.qty ?? 0);
      return lotQty > 0 && qty === lotQty;
    });
  }, [current, hasLots, currentLotLines, receiveItems]);


  const allSavedLotSerialLotsInspected = useMemo(() => {
  if (!current) return false;
  if (!hasLotSerials) return false;
  return currentLotSerialLines.every((_, idx) => {
    const key = `${current.id}-${idx}`;
    return !!inspectionDataMap[key];
  });
}, [current, hasLotSerials, currentLotSerialLines, inspectionDataMap]);

const isInspectLotSerialSubmitEnabled = useMemo(() => {
  if (readOnly || !current) return false;
  if (!hasLotSerials) return false;
  return allSavedLotSerialLotsInspected;
}, [readOnly, current, hasLotSerials, allSavedLotSerialLotsInspected]);

  
  const isInspectLotSubmitEnabled = useMemo(() => {
    if (readOnly || !current) return false;
    if (!hasLots) return false;
    return allSavedLotsInspected;
  }, [readOnly, current, hasLots, allSavedLotsInspected]);

  const lotInspectCardPassed = allSavedLotsInspected;
  const lotInspectCardBg = lotInspectCardPassed ? '#EEFDF8' : '#FFF8EC';
  const lotInspectCardBorder = lotInspectCardPassed ? '#73B386' : '#F06000';
  const lotInspectCardTextColor = lotInspectCardPassed ? '#168035' : '#F06000';
  const lotInspectPillBg = lotInspectCardPassed ? '#168035' : '#FCDFCC';

  const handleScanAndOpenLotInspect = scannedValue => {
    if (!current) return;
    const code = normalizeLotKey(scannedValue);
    if (!code) {
      Toast.show({ type: 'error', text1: 'Invalid Lot' });
      return;
    }
    const idx = currentLotLines.findIndex(l => normalizeLotKey(l?.lotNumber) === code);
    if (idx < 0) {
      Toast.show({ type: 'error', text1: 'Lot not found' });
      return;
    }
    const lot = currentLotLines[idx];
    setTimeout(() => {
      openInspectModal(lot, idx);
    }, 250);
  };

const renderImageBox = (item) => {
  const imgState = edited[item.itemid] ?? {
    imageUri: item.imageUri,
    loading: false,
  };

  if (imgState.loading) {
    return <ActivityIndicator size="large" color="#007bff" />;
  }

  if (imgState.imageUri) {
    return (
      <TouchableOpacity
        style={{ flex: 1, width: '100%', height: '100%' }}
        onPress={() => {
          setPreviewUri(imgState.imageUri);
          setPreviewVisible(true);
        }}
      >
        <Image
          source={{ uri: imgState.imageUri }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />
      </TouchableOpacity>
    );
  }

  return <Text style={{ fontSize: 10, color: '#999' }}>No Image</Text>;
};



useEffect(() => {
  const currentItem = allItems[index];
  if (!currentItem) return;

  const editedItem = edited[currentItem.itemid];

  // 🚫 If user already changed image, DO NOT fetch
  if (editedItem?.source === 'local') return;

  // ✅ Fetch only once
  if (!editedItem?.imageUri && !editedItem?.loading) {
    fetchImageForItem(currentItem.itemid);
  }
}, [index, allItems, edited]);

    
    
const fetchImageForItem = async (itemId) => {
  setEdited(prev => ({
    ...prev,
    [itemId]: {
      ...(prev[itemId] ?? {}),
      loading: true,
    },
  }));

  try {
    const resp = await GetItemImage(itemId);

    setEdited(prev => ({
      ...prev,
      [itemId]: {
        imageUri: resp?.base64_image ?? null,
        loading: false,
        source: 'api',
      },
    }));
  } catch (err) {
    setEdited(prev => ({
      ...prev,
      [itemId]: {
        imageUri: null,
        loading: false,
        source: 'api',
      },
    }));
  }
};



const handleImagePick = (itemId) => {
  Alert.alert('Select Image', 'Choose an option', [
    {
      text: 'Camera',
      onPress: () => {
        launchCamera({ mediaType: 'photo', quality: 0.7 }, res => {
          if (!res.didCancel && !res.errorCode) {
            const uri = res.assets?.[0]?.uri;
            setEdited(prev => ({
              ...prev,
              [itemId]: {
                imageUri: uri,
                loading: false,
                source: 'local', // 🔑
              },
            }));
          }
        });
      },
    },
    {
      text: 'Gallery',
      onPress: () => {
        launchImageLibrary({ mediaType: 'photo', quality: 0.7 }, res => {
          if (!res.didCancel && !res.errorCode) {
            const uri = res.assets?.[0]?.uri;
            console.log(uri,itemId,"sdfghjhgfdsdfghjhgfdesdfgh")
            setEdited(prev => ({
              ...prev,
              [itemId]: {
                imageUri: uri,
                loading: false,
                source: 'local',
              },
            }));
          }
        });
      },
    },
    { text: 'Cancel', style: 'cancel' },
  ]);
};



  const handleScanAndOpenLotandSerialInspect = scannedValue => {
    if (!current) return;
    const code = normalizeLotKey(scannedValue);
    if (!code) {
      Toast.show({ type: 'error', text1: 'Invalid Lot' });
      return;
    }
    const idx = currentLotSerialLines.findIndex(l => normalizeLotKey(l?.lotNumber) === code);
    if (idx < 0) {
      Toast.show({ type: 'error', text1: 'Lot not found' });
      return;
    }
    const lot = currentLotSerialLines[idx];
    setTimeout(() => {
      openInspectLotSerialModal(lot, idx);
    }, 250);
  };

    const rightPress =
    activeTab === 'Receive'
      ? isReceiveSubmitEnabled
        ? handleSaveAll
        : undefined
      : activeTab === 'Inspect'
      ? itemType === 'Serial'
        ? isInspectSubmitEnabled
          ? handleSaveInspect
          : undefined
        : itemType === 'Lot'
        ? isInspectLotSubmitEnabled
          ? handleSaveInspectLot
          : undefined
        : itemType === 'Lot+Serial'
        ? isInspectLotSerialSubmitEnabled
          ? handleSaveInspectLot
          : undefined
        : undefined
      : activeTab === 'PutAway'
      ? itemType === 'Lot'
        ? allSavedLotsPutAwayCompleted
          ? handleSavePutAway
          : undefined
        : itemType === 'Serial'
        ? isPutAwaySerialPassed
          ? handleSavePutAway
          : undefined
        : undefined
      : undefined;




    const rightEnabled =
    activeTab === 'Receive'
      ? isReceiveSubmitEnabled
      : activeTab === 'Inspect'
      ? itemType === 'Serial'
        ? isInspectSubmitEnabled
        : itemType === 'Lot'
        ? isInspectLotSubmitEnabled
        : itemType === 'Lot+Serial'
        ? isInspectLotSerialSubmitEnabled
        : false
      : activeTab === 'PutAway'
      ? itemType === 'Lot'
        ? allSavedLotsPutAwayCompleted
        : itemType === 'Serial'
        ? isPutAwaySerialPassed
        : false
      : false;




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
                      : ['#F3F4F6', '#E5E7EB']
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.tabBtn, activeTab === 'Receive' && styles.tabBtnActive]}
                >
                  {activeTab === 'Receive' ? (
                    <SelectedReceiveTabIcon width={18} height={18} />
                  ) : (
                    <ReceiveTabIcon width={18} height={18} />
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
                disabled={itemPills?.showreceive}
              >
                <LinearGradient
                  colors={
                    activeTab === 'Inspect'
                      ? ['#233E55', '#5D768B']
                      :itemPills?.showreceive?['#c1c3c6ff','#b7b9bdff']: ['#F3F4F6', '#E5E7EB']
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.tabBtn, activeTab === 'Inspect' && styles.tabBtnActive]}
                >
                  {activeTab === 'Inspect' ? (
                    <SelectedInspectTabIcon width={18} height={18} />
                  ) : (
                    <InspectTabIcon width={18} height={18} />
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
                disabled={itemPills?.showreceive}
              >
                <LinearGradient
                  colors={
                    activeTab === 'PutAway'
                      ? ['#233E55', '#5D768B']
                      :itemPills?.showreceive?['#c1c3c6ff','#b7b9bdff']: ['#F3F4F6', '#E5E7EB']
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.tabBtn, activeTab === 'PutAway' && styles.tabBtnActive]}
                >
                  {activeTab === 'PutAway' ? (
                    <SelectedPutAwayTabIcon width={18} height={18} />
                  ) : (
                    <PutAwayTabIcon width={18} height={18} />
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

            {activeTab === 'Receive' && current && (
              <View style={styles.itemInfoBox}>
                <View style={styles.itemInfoRow}>
                  <View style={styles.itemIconWrap}>
                    {/* <ReceiveItemBoxIcon width={40} height={40} /> */}
                      {!readOnly &&<TouchableOpacity style={styles.cameraIcon} onPress={() => handleImagePick(current.itemid)}>
                        <CameraIcon width={25} height={25} />
                      </TouchableOpacity>}
                      <View style={styles.imageWrapper}>
                        {renderImageBox(allItems[index])}
                      </View>
                  </View>
                  <View style={styles.itemTextCol}>
                    <Text style={styles.itemName} numberOfLines={1}>
                      {current?.itemName || 'Item Name'}
                    </Text>
                    <Text style={styles.itemCode} numberOfLines={1}>
                      {current?.itemName || 'Item Code'}
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
                    {itemPills.showLotSerial && (
                      <View style={styles.pilllotserial}>
                        <View style={styles.pillLot}>
                          <Text style={styles.pillLotText}>Lot</Text>
                        </View>
                        <View style={styles.pillSerial}>
                          <Text style={styles.pillSerialText}>Serial</Text>
                        </View>
                      </View>
                    )}
                    {itemPills.showreceive && (
                      <View style={styles.pilllotserial}>
                        <View style={styles.pillLot}>
                          <Text style={styles.pillLotText}>Receive</Text>
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            )}
            {activeTab === 'Receive' && current && (
              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <ReceiveQtyIcon width={19} height={19} />
                  <Text style={styles.sectionTitle}>Quantity Overview</Text>
                </View>

                <View style={[styles.row,{borderBottomWidth:0.5,borderBottomColor:'#CCCED2'}]}>
                  <Text style={styles.label}>Order Quantity</Text>
                  <Text style={styles.orderQtyText}>
                    {current.orderQty}{' '}
                    <Text style={styles.orderQtyUom}>/ {current.uom}</Text>
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

            {activeTab === 'Inspect' && current && itemType === 'Serial' && (
              <View style={styles.inspectContainer}>
                <View
                  style={[
                    styles.inspectInfoCard,
                    {
                      backgroundColor: inspectStatusCardBg,
                      borderColor: inspectStatusCardBorder,
                    },
                  ]}
                >
                  <View style={styles.inspectInfoIconWrap}>
                    {isInspectionPassed ? (
                      <PassedInspectionIcon width={24} height={24} />
                    ) : (
                      <PendingInspectionIcon width={24} height={24} />
                    )}
                  </View>
                  <View style={styles.inspectInfoMiddle}>
                    <Text
                      style={[
                        styles.inspectInfoLabel,
                        { color: inspectStatusCardTextColor },
                      ]}
                    >
                      Inspection Status
                    </Text>
                    <View
                      style={[
                        styles.inspectStatusPill,
                        { backgroundColor: inspectStatusPillBg },
                      ]}
                    >
                      <Text
                        style={[
                          styles.inspectStatusPillText,
                          isInspectionPassed
                            ? styles.inspectStatusPillTextPassed
                            : styles.inspectStatusPillTextPending,
                        ]}
                      >
                        {isInspectionPassed ? 'Passed' : 'Pending'}
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={[
                      styles.inspectInfoRightText,
                      { color: inspectStatusCardTextColor },
                    ]}
                  >
                    Serial Controlled
                  </Text>
                </View>

                <View style={styles.inspectRecQtyRow}>
                  <Text style={styles.inspectRecQtyLabel}>Receiving Qty</Text>
                  <Text style={styles.inspectRecQtyValue}>
                    {currentQty}{' '}
                    <Text style={styles.inspectRecQtyValueUnit}>Qty</Text>
                  </Text>
                </View>

                <View style={styles.inspectQtySection}>
                  <Text style={styles.inspectQtyLabel}>Inspection Qty</Text>
                  <View style={styles.inspectQtyInputWrapper}>
                    <Rec_CustomNumericInput
                      key={`inspqty-${String(current.id)}`}
                      value={inspectionQty}
                      bgColor="#5D768B"
                      borderColor="#5D768B"
                      textColor="#FFFFFF"
                      height={ms(50)}
                      setValue={v => {
                        const raw = typeof v === 'function' ? v(inspectionQty) : v;
                        handleInspectionQtyChange(current.id, inspectionMax, raw);
                      }}
                      max={inspectionMax}
                      min={0}
                      step={1}
                      width="100%"
                      isSelected
                      disabledinput={currentQty === 0 || inspectionMax === 0}
                    />
                  </View>
                </View>

                <View style={styles.inspectStatusSection}>
                  <Text style={styles.mandLabel}>Select Status</Text>
                  <Rec_DropDown
                    value={inspectionStatusValue}
                    onChange={val => handleInspectionStatusChange(current.id, val)}
                    items={INSPECTION_STATUS_OPTIONS}
                    placeholder="Select Status"
                    disabled={readOnly || currentQty === 0 || inspectionMax === 0}
                    width="100%"
                    height={32}
                  />
                </View>

                <View style={styles.inspectNotesSection}>
                  <Text style={styles.mandLabel}>Inspection Notes</Text>
                  <View style={styles.notesInputWrapper}>
                    <TextInput
                      value={inspectionNotes}
                      onChangeText={txt => handleInspectionNotesChange(current.id, txt)}
                      placeholder="Maximum 100 characters"
                      placeholderTextColor="#9CA3AF"
                      maxLength={100}
                      multiline
                      style={styles.notesInput}
                    />
                    <Text style={styles.notesCounter}>
                      {inspectionNotes.length}/100
                    </Text>
                  </View>
                </View>

                <View style={styles.photosSection}>
                  <Text style={styles.mandLabel}>Photos</Text>
                  <View style={styles.photoButtonsRow}>
                    <TouchableOpacity
                      style={styles.photoButton}
                      activeOpacity={0.85}
                      onPress={handleAddPhotoFromGallery}
                    >
                      <PhotoUploadIcon width={20} height={20} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.photoButton}
                      activeOpacity={0.85}
                      onPress={handleAddPhotoFromCamera}
                    >
                      <PhotoCaptureIcon width={20} height={20} />
                    </TouchableOpacity>
                  </View>

                  {inspectionPhotos.length > 0 && (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={styles.photoThumbList}
                    >
                      {inspectionPhotos.map(uri => (
                        <View key={uri} style={styles.photoThumbWrapper}>
                          <Image source={{ uri }} style={styles.photoThumb} resizeMode="cover" />
                          <TouchableOpacity
                            style={styles.photoDeleteBtn}
                            onPress={() => handleRemovePhoto(current.id, uri)}
                            activeOpacity={0.8}
                          >
                            <DeleteAttachmentIcon width={16} height={16} />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </ScrollView>
                  )}
                </View>

                <View style={styles.inspectSerialButtonRow}>
                  <TouchableOpacity
                    style={[
                      styles.inspectSerialBtn,
                      addSerialHasSelection && styles.inspectSerialBtnAddedBackground,
                      !inspectAddSerialEnabled && styles.inspectSerialBtnDisabled,
                    ]}
                    activeOpacity={0.9}
                    disabled={!inspectAddSerialEnabled}
                    onPress={handleOpenInspectSerialModal}
                  >
                    {addSerialHasSelection && (
                      <View style={styles.inspectSerialTickWrap}>
                        <InspectTickIcon width={16} height={16} />
                      </View>
                    )}
                    <Text
                      style={[
                        styles.inspectSerialBtnText,
                        addSerialHasSelection && styles.inspectSerialBtnTextAdded,
                      ]}
                    >
                      {addSerialHasSelection ? 'Serial Added' : 'Add Serial'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {activeTab === 'Inspect' && current && itemType === 'Lot' && (
              <View style={styles.section}>
                <View
                  style={[
                    styles.inspectInfoCard,
                    {
                      backgroundColor: lotInspectCardBg,
                      borderColor: lotInspectCardBorder,
                      marginTop: ms(6),
                    },
                  ]}
                >
                  <View style={styles.inspectInfoIconWrap}>
                    {lotInspectCardPassed ? (
                      <PassedInspectionIcon width={24} height={24} />
                    ) : (
                      <PendingInspectionIcon width={24} height={24} />
                    )}
                  </View>

                  <View style={styles.inspectInfoMiddle}>
                    <Text
                      style={[
                        styles.inspectInfoLabel,
                        { color: lotInspectCardTextColor },
                      ]}
                    >
                      Inspection Status
                    </Text>

                    <View
                      style={[
                        styles.inspectStatusPill,
                        { backgroundColor: lotInspectPillBg },
                      ]}
                    >
                      <Text
                        style={[
                          styles.inspectStatusPillText,
                          lotInspectCardPassed
                            ? styles.inspectStatusPillTextPassed
                            : styles.inspectStatusPillTextPending,
                        ]}
                      >
                        {lotInspectCardPassed ? 'Passed' : 'Pending'}
                      </Text>
                    </View>
                  </View>

                  <Text
                    style={[
                      styles.inspectInfoRightText,
                      { color: lotInspectCardTextColor },
                    ]}
                  >
                    Lot Controlled
                  </Text>
                </View>

                {current?.itemType === 'Lot' && (
                  <TouchableOpacity
                    onPress={() => setShowScanner(true)}
                    activeOpacity={0.7}
                    style={{
                      width: '100%',
                      height: 38,
                      borderRadius: 4,
                      borderWidth: 1,
                      borderColor: '#CCCED2',
                      paddingHorizontal: 10,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 18,
                      marginTop: 18,
                    }}
                  >
                    <Text style={{ color: '#7E7E7E', fontSize: 14 }}>
                      {scannedLot || 'Scan Lot'}
                    </Text>
                    <Barcodescanner width={18} height={18} />
                  </TouchableOpacity>
                )}

                {current?.itemType === 'Lot' && hasLots && currentLotLines && (
                  <View>
                    {currentLotLines.map((lot, idx) => {
                      const inspectionData = inspectionDataMap[`${current.id}-${idx}`];
                      const isInspected = !!inspectionData;
                      const statusName = inspectionData?.status?.name || 'Pending';

                      const getStatusStyle = statusNameArg => {
                        switch (statusNameArg) {
                          case 'Above Average':
                            return { bg: '#EEFDF8', text: '#168035' };
                          case 'Average':
                            return { bg: '#FFFBEA', text: '#C78C00' };
                          case 'Below Average':
                            return { bg: '#FFF8EC', text: '#F06000' };
                          case 'Excellent':
                            return { bg: '#EAF2FF', text: '#033EFF' };
                          case 'Reject and Notify':
                            return { bg: '#FFECEC', text: '#D32F2F' };
                          case 'Unacceptable':
                            return { bg: '#FDE2E2', text: '#991B1B' };
                          default:
                            return { bg: '#F3F4F6', text: '#374151' };
                        }
                      };

                      const statusStyle = getStatusStyle(statusName);

                      return (
                        <View
                          key={`lot-${idx}`}
                          style={{
                            width: '100%',
                            minHeight: 74,
                            borderRadius: 8,
                            borderWidth: 1,
                            borderColor: '#ECF1F7',
                            backgroundColor: '#FFFFFF',
                            padding: 10,
                            marginBottom: 8,
                          }}
                        >
                          <Text
                            style={{
                              fontFamily: 'Mulish',
                              fontSize: 12,
                              fontWeight: '600',
                              color: '#233E55',
                              marginBottom: 6,
                            }}
                          >
                            {lot.lotNumber || `LOT ${idx + 1}`}
                          </Text>

                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <View style={{ flexDirection: 'row' }}>
                              <Text
                                style={{
                                  fontSize: 9,
                                  fontWeight: '600',
                                  color: '#9D9FA3',
                                }}
                              >
                                Mfg:{' '}
                                <Text style={{ color: '#111827' }}>
                                  {lot.mfgDate || '-'}
                                </Text>
                              </Text>
                              <Text
                                style={{
                                  fontSize: 9,
                                  fontWeight: '600',
                                  color: '#9D9FA3',
                                  marginLeft: 8,
                                }}
                              >
                                Exp:{' '}
                                <Text style={{ color: '#111827' }}>
                                  {lot.expDate || '-'}
                                </Text>
                              </Text>
                            </View>

                            <TouchableOpacity
                              onPress={() => openInspectModal(lot, idx)}
                              style={{
                                paddingHorizontal: 10,
                                paddingVertical: 4,
                                borderRadius: 6,
                                borderWidth: 0,
                                borderColor: isInspected ? '#16803C' : '#033EFF',
                                backgroundColor: isInspected ? '#E7F7ED' : '#D7E8FE',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: 12,
                                  fontWeight: '700',
                                  color: isInspected ? '#16803C' : '#033EFF',
                                }}
                              >
                                {isInspected ? 'Inspected' : 'Inspect'}
                              </Text>
                            </TouchableOpacity>
                          </View>

                          {isInspected && (
                            <View style={{ marginTop: 6 }}>
                              <View
                                style={{
                                  paddingHorizontal: 12,
                                  paddingVertical: 3,
                                  borderRadius: 12,
                                  backgroundColor: statusStyle.bg,
                                  alignSelf: 'flex-start',
                                }}
                              >
                                <Text
                                  style={{
                                    fontSize: 10,
                                    fontWeight: '700',
                                    color: statusStyle.text,
                                  }}
                                >
                                  Status: {statusName}
                                </Text>
                              </View>
                            </View>
                          )}
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            )}

            {activeTab === 'Inspect' && current && itemType !== 'Serial' && itemType !== 'Lot' && itemType !== 'Lot+Serial' && (
              <View style={styles.inspectWipContainer}>
                <Text style={styles.inspectWipText}>
                  {itemType === 'Lot'
                    ? 'Inspect - Lot flow (WIP)'
                    : 'Inspect - Lot + Serial flow (WIP)'}
                </Text>
              </View>
            )}

            {activeTab === 'Inspect' && current && itemType === 'Lot+Serial' && (
  <View style={styles.section}>
    <View
      style={[
        styles.inspectInfoCard,
        {
          backgroundColor: allSavedLotSerialLotsInspected ? '#EEFDF8' : '#FFF8EC',
          borderColor: allSavedLotSerialLotsInspected ? '#73B386' : '#F06000',
          marginTop: ms(6),
        },
      ]}
    >
      <View style={styles.inspectInfoIconWrap}>
        {allSavedLotSerialLotsInspected ? (
          <PassedInspectionIcon width={24} height={24} />
        ) : (
          <PendingInspectionIcon width={24} height={24} />
        )}
      </View>

      <View style={styles.inspectInfoMiddle}>
        <Text
          style={[
            styles.inspectInfoLabel,
            { color: allSavedLotSerialLotsInspected ? '#168035' : '#F06000' },
          ]}
        >
          Inspection Status
        </Text>

        <View
          style={[
            styles.inspectStatusPill,
            { backgroundColor: allSavedLotSerialLotsInspected ? '#168035' : '#FCDFCC' },
          ]}
        >
          <Text
            style={[
              styles.inspectStatusPillText,
              allSavedLotSerialLotsInspected
                ? styles.inspectStatusPillTextPassed
                : styles.inspectStatusPillTextPending,
            ]}
          >
            {allSavedLotSerialLotsInspected ? 'Passed' : 'Pending'}
          </Text>
        </View>
      </View>

      <Text
        style={[
          styles.inspectInfoRightText,
          { color: allSavedLotSerialLotsInspected ? '#168035' : '#F06000' },
        ]}
      >
        Lot + Serial Controlled
      </Text>
    </View>
                {/* {current?.itemType === 'Lot' && ( */}
                  <TouchableOpacity
                    onPress={() => setShowScanner(true)}
                    activeOpacity={0.7}
                    style={{
                      width: '100%',
                      height: 38,
                      borderRadius: 4,
                      borderWidth: 1,
                      borderColor: '#CCCED2',
                      paddingHorizontal: 10,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 18,
                      marginTop: 18,
                    }}
                  >
                    <Text style={{ color: '#7E7E7E', fontSize: 14 }}>
                      {scannedLotSerial || 'Scan Lot'}
                    </Text>
                    <Barcodescanner width={18} height={18} />
                  </TouchableOpacity>
                {/* )} */}
    {hasLotSerials && currentLotSerialLines && (
      <View style={{ marginTop: ms(14) }}>
        {currentLotSerialLines.map((lot, idx) => {
          const inspectionData = inspectionDataMap[`${current.id}-${idx}`];
          const isInspected = !!inspectionData;
          const statusName = inspectionData?.status?.name || 'Pending';

          const getStatusStyle = statusNameArg => {
            switch (statusNameArg) {
              case 'Above Average':
                return { bg: '#EEFDF8', text: '#168035' };
              case 'Average':
                return { bg: '#FFFBEA', text: '#C78C00' };
              case 'Below Average':
                return { bg: '#FFF8EC', text: '#F06000' };
              case 'Excellent':
                return { bg: '#EAF2FF', text: '#033EFF' };
              case 'Reject and Notify':
                return { bg: '#FFECEC', text: '#D32F2F' };
              case 'Unacceptable':
                return { bg: '#FDE2E2', text: '#991B1B' };
              default:
                return { bg: '#F3F4F6', text: '#374151' };
            }
          };

          const statusStyle = getStatusStyle(statusName);

          return (
            <View
              key={`lotserial-${idx}`}
              style={{
                width: '100%',
                minHeight: 74,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: '#ECF1F7',
                backgroundColor: '#FFFFFF',
                padding: 10,
                marginBottom: 8,
              }}
            >
              <Text
                style={{
                  fontFamily: 'Mulish',
                  fontSize: 12,
                  fontWeight: '600',
                  color: '#233E55',
                  marginBottom: 6,
                }}
              >
                {lot.lotNumber || `LOT ${idx + 1}`}
              </Text>

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <View style={{ flexDirection: 'row' }}>
                  <Text
                    style={{
                      fontSize: 9,
                      fontWeight: '600',
                      color: '#9D9FA3',
                    }}
                  >
                    Mfg:{' '}
                    <Text style={{ color: '#111827' }}>
                      {lot.mfgDate || '-'}
                    </Text>
                  </Text>
                  <Text
                    style={{
                      fontSize: 9,
                      fontWeight: '600',
                      color: '#9D9FA3',
                      marginLeft: 8,
                    }}
                  >
                    Exp:{' '}
                    <Text style={{ color: '#111827' }}>
                      {lot.expDate || '-'}
                    </Text>
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => openInspectLotSerialModal(lot, idx)}
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 6,
                    borderWidth: 0,
                    borderColor: isInspected ? '#16803C' : '#033EFF',
                    backgroundColor: isInspected ? '#E7F7ED' : '#D7E8FE',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '700',
                      color: isInspected ? '#16803C' : '#033EFF',
                    }}
                  >
                    {isInspected ? 'Inspected' : 'Inspect'}
                  </Text>
                </TouchableOpacity>
              </View>

              {isInspected && (
                <View style={{ marginTop: 6 }}>
                  <View
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 3,
                      borderRadius: 12,
                      backgroundColor: statusStyle.bg,
                      alignSelf: 'flex-start',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 10,
                        fontWeight: '700',
                        color: statusStyle.text,
                      }}
                    >
                      Status: {statusName}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          );
        })}
      </View>
    )}
  </View>
)}


            {activeTab === 'PutAway' && current && itemType === 'Lot' && (
  <View style={styles.section}>
    {(() => {
      const allSavedLotsPutAwayCompleted =
        currentLotLines.length > 0 &&
        currentLotLines.every((_, idx) => !!putAwayDataMap[`${current.id}-${idx}`]);

      const cardPassed = allSavedLotsPutAwayCompleted;
      const cardBg = cardPassed ? '#EEFDF8' : '#FFF8EC';
      const cardBorder = cardPassed ? '#73B386' : '#F06000';
      const cardText = cardPassed ? '#168035' : '#F06000';
      const pillBg = cardPassed ? '#168035' : '#FCDFCC';

      return (
        <>
          <View
            style={[
              styles.inspectInfoCard,
              {
                backgroundColor: cardBg,
                borderColor: cardBorder,
                marginTop: ms(6),
              },
            ]}
          >
            <View style={styles.inspectInfoIconWrap}>
              {cardPassed ? (
                <PassedPutAwayIcon width={24} height={24} />
              ) : (
                <PendingPutAwayIcon width={24} height={24} />
              )}
            </View>

            <View style={styles.inspectInfoMiddle}>
              <Text style={[styles.inspectInfoLabel, { color: cardText }]}>
                Put Away Status
              </Text>

              <View style={[styles.inspectStatusPill, { backgroundColor: pillBg }]}>
                <Text
                  style={[
                    styles.inspectStatusPillText,
                    cardPassed
                      ? styles.inspectStatusPillTextPassed
                      : styles.inspectStatusPillTextPending,
                  ]}
                >
                  {cardPassed ? 'Passed' : 'Pending'}
                </Text>
              </View>
            </View>

            <Text style={[styles.inspectInfoRightText, { color: cardText }]}>
              Lot Controlled
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => setShowScanner(true)}
            activeOpacity={0.7}
            style={{
              width: '100%',
              height: 38,
              borderRadius: 4,
              borderWidth: 1,
              borderColor: '#CCCED2',
              paddingHorizontal: 10,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 18,
              marginTop: 18,
            }}
          >
            <Text style={{ color: '#7E7E7E', fontSize: 14 }}>
              {scannedPutAwayLot || 'Scan Lot'}
            </Text>
            <Barcodescanner width={18} height={18} />
          </TouchableOpacity>

          {hasLots && currentLotLines && (
            <View>
              {currentLotLines.map((lot, idx) => {
                const putAwayData = putAwayDataMap[`${current.id}-${idx}`];
                const isCompleted = !!putAwayData;

                return (
                  <View
                    key={`putaway-lot-${idx}`}
                    style={{
                      width: '100%',
                      minHeight: 64,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: '#ECF1F7',
                      backgroundColor: '#FFFFFF',
                      padding: 10,
                      marginBottom: 8,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: 'Mulish',
                        fontSize: 12,
                        fontWeight: '800',
                        color: '#233E55',
                        marginBottom: 6,
                      }}
                    >
                      {lot.lotNumber || `LOT ${idx + 1}`}
                    </Text>

                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <View style={{ flexDirection: 'row' }}>
                        <Text style={{ fontSize: 9, fontWeight: '600', color: '#9D9FA3' }}>
                          Mfg:{' '}
                          <Text style={{ color: '#111827' }}>{lot.mfgDate || '-'}</Text>
                        </Text>
                        <Text
                          style={{
                            fontSize: 9,
                            fontWeight: '600',
                            color: '#9D9FA3',
                            marginLeft: 8,
                          }}
                        >
                          Exp:{' '}
                          <Text style={{ color: '#111827' }}>{lot.expDate || '-'}</Text>
                        </Text>
                      </View>

                      <TouchableOpacity
                        onPress={() => openPutAwayModal(lot, idx)}
                        style={{
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                          borderRadius: 6,
                          borderWidth: 0,
                          borderColor: isCompleted ? '#16803C' : '#033EFF',
                          backgroundColor: isCompleted ? '#E7F7ED' : '#D7E8FE',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: '700',
                            color: isCompleted ? '#16803C' : '#033EFF',
                          }}
                        >
                          {isCompleted ? 'Completed' : 'Put Away'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </>
      );
    })()}
  </View>
)}

            {activeTab === 'PutAway' && current && itemType === 'Serial' && (
              <View style={styles.inspectContainer}>
                <View
                  style={[
                    styles.inspectInfoCard,
                    {
                      backgroundColor: putAwaySerialStatusCardBg,
                      borderColor: putAwaySerialStatusCardBorder,
                    },
                  ]}
                >
                  <View style={styles.inspectInfoIconWrap}>
                    {isPutAwaySerialPassed ? (
                      <PassedPutAwayIcon width={24} height={24} />
                    ) : (
                      <PendingPutAwayIcon width={24} height={24} />
                    )}
                  </View>

                  <View style={styles.inspectInfoMiddle}>
                    <Text
                      style={[
                        styles.inspectInfoLabel,
                        { color: putAwaySerialStatusCardTextColor },
                      ]}
                    >
                      Put Away Status
                    </Text>

                    <View
                      style={[
                        styles.inspectStatusPill,
                        { backgroundColor: putAwaySerialStatusPillBg },
                      ]}
                    >
                      <Text
                        style={[
                          styles.inspectStatusPillText,
                          isPutAwaySerialPassed
                            ? styles.inspectStatusPillTextPassed
                            : styles.inspectStatusPillTextPending,
                        ]}
                      >
                        {isPutAwaySerialPassed ? 'Passed' : 'Pending'}
                      </Text>
                    </View>
                  </View>

                  <Text
                    style={[
                      styles.inspectInfoRightText,
                      { color: putAwaySerialStatusCardTextColor },
                    ]}
                  >
                    Serial Controlled
                  </Text>
                </View>

                <View style={styles.inspectRecQtyRow}>
                  <Text style={styles.inspectRecQtyLabel}>Receiving Qty</Text>
                  <Text style={styles.inspectRecQtyValue}>
                    {currentQty}{' '}
                    <Text style={styles.inspectRecQtyValueUnit}>Qty</Text>
                  </Text>
                </View>

                <View style={styles.inspectStatusSection}>
                  <Text style={styles.mandLabel}>Sub Inventory*</Text>
                  <Rec_DropDown
                    value={putAwaySubInventory}
                    onChange={val => handlePutAwaySubInvChange(current.id, val)}
                    items={InventoryList}
                    placeholder="Select Sub Inventory"
                    disabled={readOnly || currentQty === 0}
                    width="100%"
                    height={32}
                  />
                </View>

                <View style={styles.inspectStatusSection}>
                  <Text style={styles.mandLabel}>Target Locator*</Text>
                  <Rec_DropDown
                    value={putAwayLocator}
                    onChange={val => handlePutAwayLocatorChange(current.id, val)}
                    items={locatorDataMap[current.id] ?? []}
                    placeholder="Select Target Locator"
                    disabled={readOnly || currentQty === 0 || !putAwaySubInventory}
                    width="100%"
                    height={32}
                  />
                </View>

                <View style={styles.inspectQtySection}>
                  <Text style={styles.inspectQtyLabel}>Put Away Qty</Text>
                  <View style={styles.inspectQtyInputWrapper}>
                    <Rec_CustomNumericInput
                      key={`putawayqty-${String(current.id)}`}
                      value={putAwayQty}
                      bgColor="#5D768B"
                      borderColor="#5D768B"
                      textColor="#FFFFFF"
                      height={ms(50)}
                      setValue={v => {
                        const raw = typeof v === 'function' ? v(putAwayQty) : v;
                        handlePutAwayQtyChange(current.id, putAwayMax, raw);
                      }}
                      max={putAwayMax}
                      min={0}
                      step={1}
                      width="100%"
                      isSelected
                      disabledinput={currentQty === 0 || putAwayMax === 0}
                    />
                  </View>
                </View>

                {shouldShowPutAwaySummary && (
                  <View style={{ marginTop: ms(16) }}>
                    <View
                      style={{
                        height: ms(34),
                        backgroundColor: '#5D768B',
                        borderTopLeftRadius: ms(10),
                        borderTopRightRadius: ms(10),
                        justifyContent: 'center',
                        paddingHorizontal: ms(12),
                      }}
                    >
                      <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: ms(12) }}>
                        Summary
                      </Text>
                    </View>

                    <View
                      style={{
                        backgroundColor: '#FFFFFF',
                        borderBottomLeftRadius: ms(10),
                        borderBottomRightRadius: ms(10),
                        padding: ms(12),
                        borderWidth: 1,
                        borderColor: '#ECF1F7',
                      }}
                    >
                      <View style={{ flexDirection: 'row' }}>
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: '#595A5C', fontSize: ms(11), fontWeight: '600' }}>
                            Item
                          </Text>
                          <Text style={{ color: '#111827', fontSize: ms(12), fontWeight: '700', marginTop: ms(3) }}>
                            {current?.itemName || '-'}
                          </Text>

                          <Text style={{ color: '#595A5C', fontSize: ms(11), fontWeight: '600', marginTop: ms(10) }}>
                            From
                          </Text>
                          <Text style={{ color: '#111827', fontSize: ms(12), fontWeight: '700', marginTop: ms(3) }}>
                            {(() => {
                              const found = InventoryList?.find(x => String(x.id) === String(putAwaySubInventory));
                              return found?.name || '-';
                            })()}
                          </Text>
                        </View>

                        <View style={{ flex: 1 }}>
                          <Text style={{ color: '#595A5C', fontSize: ms(11), fontWeight: '600' }}>
                            Quantity
                          </Text>
                          <Text style={{ color: '#111827', fontSize: ms(12), fontWeight: '700', marginTop: ms(3) }}>
                            {putAwayQty} {current?.uom || ''}
                          </Text>

                          <Text style={{ color: '#595A5C', fontSize: ms(11), fontWeight: '600', marginTop: ms(10) }}>
                            To
                          </Text>
                          <Text style={{ color: '#111827', fontSize: ms(12), fontWeight: '700', marginTop: ms(3) }}>
                            {(() => {
                              const list = locatorDataMap[current.id] ?? [];
                              const found = list.find(x => String(x.id) === String(putAwayLocator));
                              return found?.name || '-';
                            })()}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                )}

                <View style={styles.inspectSerialButtonRow}>
                  <TouchableOpacity
                    style={[
                      styles.inspectSerialBtn,
                      putAwayHasSerialSelection && styles.inspectSerialBtnAddedBackground,
                      !putAwaySerialAddEnabled && styles.inspectSerialBtnDisabled,
                    ]}
                    activeOpacity={0.9}
                    disabled={!putAwaySerialAddEnabled}
                    onPress={() => setPutAwaySerialModalVisible(true)}
                  >
                    {putAwayHasSerialSelection && (
                      <View style={styles.inspectSerialTickWrap}>
                        <InspectTickIcon width={20} height={20} />
                      </View>
                    )}
                    <Text
                      style={[
                        styles.inspectSerialBtnText,
                        putAwayHasSerialSelection && styles.inspectSerialBtnTextAdded,
                      ]}
                    >
                      {putAwayHasSerialSelection ? 'Serial Added' : 'Add Serial'}
                    </Text>
                  </TouchableOpacity>
                </View>
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
                  <Text style={styles.mandLabel}>LPN*</Text>
                  <Rec_DropDown
                    value={currentEdited.lpn}
                    onChange={id => handleLpnChange(current.id, id)}
                    items={LpnListData}
                    placeholder="Select LPN"
                    disabled={readOnly || Number(current.openQty ?? 0) === 0}
                    width="100%"
                    height={32}
                  />
                </View>

                <View style={styles.subLocRow}>
                  <View style={styles.subCol}>
                    <Text style={styles.mandLabel}>Sub Inventory*</Text>
                    <Rec_DropDown
                      value={currentEdited.subInventory}
                      onChange={id => handleSubInvChange(current.id, id)}
                      items={InventoryList}
                      placeholder="Select Sub Inv"
                      disabled={readOnly || Number(current.openQty ?? 0) === 0}
                      width="100%"
                      height={32}
                    />
                  </View>
                  <View style={styles.locCol}>
                    <Text style={styles.mandLabel}>Locator*</Text>
                    <Rec_DropDown
                      value={currentEdited.locator}
                      onChange={id => handleLocatorChange(current.id, id)}
                      items={locatorDataMap[current.id] ?? []}
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
                      disabled={readOnly || Number(current.openQty ?? 0) === 0 || currentQty==0}
                    >
                      {hasLots ? (
                        <View style={styles.addLotGreen}>
                          <ReceiveAddIcon width={20} height={20} />
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
                          <ReceiveAddIcon width={20} height={20} />
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
                      disabled={readOnly || Number(current.openQty ?? 0) === 0 || currentQty === 0}
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
                          <ReceiveAddIcon width={20} height={20} />
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
                      disabled={readOnly || Number(current.openQty ?? 0) === 0 || currentQty==0}
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
          onRightPress={rightPress}
          leftEnabled
          rightEnabled={rightEnabled}
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

          <Modal
            visible={showScanner}
            animationType="slide"
            onRequestClose={() => setShowScanner(false)}
          >
            <BarcodeScanner
              onScan={value => {
                if (current && activeTab === 'PutAway' && itemType === 'Lot') {
                  setScannedPutAwayLot(value);
                  setShowScanner(false);
                  handleScanAndOpenPutAwayLot(value);
                  return;
                }

                if (current && itemType === 'Lot+Serial') {
                  setscannedLotSerial(value);
                  setShowScanner(false);
                  handleScanAndOpenLotandSerialInspect(value);
                  return;
                }

                setScannedLot(value);
                setShowScanner(false);
                handleScanAndOpenLotInspect(value);
              }}

              onClose={() => setShowScanner(false)}
            />
          </Modal>

          <Rec_InspectSerialModalPopup
            visible={inspectSerialModalVisible}
            onClose={() => setInspectSerialModalVisible(false)}
            inspectionQty={inspectionQty}
            savedSerials={currentSavedSerials}
            initialSelectedSerials={
              inspectionSerials.length > 0
                ? inspectionSerials
                : inspectionQty === currentQty
                ? currentSavedSerials.slice(0, inspectionQty)
                : []
            }
            requireValidationAgainstSaved={inspectionQty < currentQty}
            onConfirm={serials => {
              setInspectionEdited(prev => {
                const prevLine = prev[current.id] || {};
                return {
                  ...prev,
                  [current.id]: { ...prevLine, inspectionSerials: serials },
                };
              });
              setInspectSerialModalVisible(false);
            }}
          />

          <Rec_PutAwaySerialModalPopup
            visible={putAwaySerialModalVisible}
            onClose={() => setPutAwaySerialModalVisible(false)}
            putawayQty={putAwayQty}
            savedSerials={currentSavedSerials}
            initialSelectedSerials={effectivePutAwaySerials}
            requireValidationAgainstSaved={true}
            onConfirm={serials => {
              if (!current) return;
              setPutAwaySelectedSerialsMap(prev => ({
                ...prev,
                [current.id]: serials,
              }));
              setPutAwaySerialModalVisible(false);
            }}
          />
          
        </>
      )}

      <Rec_InspectLotModalPopup
        key={`inspect-${current?.id}-${selectedLotIndex}`}
        visible={inspectModalVisible}
        onClose={() => {
          setInspectModalVisible(false);
          setTimeout(() => {
            setSelectedLot(null);
          }, 300);
        }}
        lot={selectedLot}
        lotIndex={selectedLotIndex}
        itemName={current?.itemName}
        itemCode={current?.itemid}
        onComplete={handleInspectionComplete}
        initialInspectionData={selectedLotInitialInspection}
      />

      <Rec_PutAwayLotModalPopup
        key={`putaway-${current?.id}-${selectedPutAwayLotIndex}`}
        visible={putAwayModalVisible}
        onClose={() => {
          setPutAwayModalVisible(false);
          setTimeout(() => {
            setSelectedPutAwayLot(null);
          }, 300);
        }}
        lot={selectedPutAwayLot}
        lotIndex={selectedPutAwayLotIndex}
        itemName={current?.itemName}
        itemCode={current?.itemid}
        uom={current?.uom || ''}
        inventoryItems={InventoryList}
        defaultSubInventory={edited[current?.id]?.subInventory || current?.subInventory || OrgData?.selectedinventory}
        defaultLocator={edited[current?.id]?.locator || current?.locator || ''}
        lineReceivingQty={Number(edited[current?.id]?.receivingQty ?? current?.receivingQty ?? 0)}
        fetchLocators={async subInvId => {
          const locdata = await GetLocatorsData(subInvId);
          return Array.isArray(locdata)
            ? locdata.map(d => ({
                id: d.locator_id,
                name: d.locator_name,
                enabled: d.locator_enabled,
              }))
            : [];
        }}
        initialPutAwayData={(() => {
          const key = current?.id != null ? `${current.id}-${selectedPutAwayLotIndex}` : '';
          return key ? putAwayDataMap[key] : null;
        })()}
        onComplete={handlePutAwayComplete}
      />


      <Rec_InspectLotSerialModalPopup
        key={`inspect-ls-${current?.id}-${selectedLotSerialIndex}`}
        visible={inspectLotSerialModalVisible}
        onClose={() => {
          setInspectLotSerialModalVisible(false);
          setTimeout(() => {
            setSelectedLotSerial(null);
          }, 300);
        }}
        lot={selectedLotSerial}
        lotIndex={selectedLotSerialIndex}
        itemName={current?.itemName}
        itemCode={current?.itemid}
        initialInspectionData={{
          ...(selectedLotSerialInitialInspection || {}),
          serials:
            (inspectLotSerialKey && lotSerialSelectedSerialsMap[inspectLotSerialKey]) ||
            (Array.isArray(selectedLotSerialInitialInspection?.serials)
              ? selectedLotSerialInitialInspection.serials
              : []),
        }}
        hasSerialInspection={
          (() => {
            const key = inspectLotSerialKey;
            const lotQty = Number(selectedLotSerial?.qty || 0);
            const selected =
              (key && lotSerialSelectedSerialsMap[key]) ||
              (Array.isArray(selectedLotSerialInitialInspection?.serials)
                ? selectedLotSerialInitialInspection.serials
                : []);
            return lotQty > 0 && Array.isArray(selected) && selected.length === lotQty;
          })()
        }
        onAddSerial={openInspectLotSerialSerialModal}
        onComplete={inspectionData => {
          const itemId = current?.id;
          if (!itemId) return;

          const key = `${itemId}-${inspectionData.lotIndex}`;
          const lotQty = Number(inspectionData?.lotDetails?.qty || selectedLotSerial?.qty || 0);

          const selectedSerials =
            lotSerialSelectedSerialsMap[key] ||
            (Array.isArray(inspectionData?.serials) ? inspectionData.serials : []);

          const payload = {
            qty: lotQty,
            inspectQty: lotQty,
            status: inspectionData.status,
            notes: inspectionData.notes || '',
            attachments: inspectionData.attachments || inspectionData.images || [],
            images: inspectionData.images || inspectionData.attachments || [],
            serials: selectedSerials,
            lotIndex: inspectionData.lotIndex,
            lotDetails: inspectionData.lotDetails,
            inspectionDate: new Date().toISOString(),
          };

          setInspectionDataMap(prev => ({ ...prev, [key]: payload }));

          const stored = Array.isArray(receiveItems)
            ? receiveItems.find(r => String(r.id) === String(itemId))
            : null;

          const existingInspections = stored?.inspections || [];
          const existingIndex = existingInspections.findIndex(
            insp => Number(insp?.lotIndex) === Number(payload.lotIndex),
          );

          const updatedInspections =
            existingIndex >= 0
              ? existingInspections.map((x, i) => (i === existingIndex ? payload : x))
              : [...existingInspections, payload];

          const hasRejected = updatedInspections.some(
            insp => insp.status?.name === 'Reject and Notify' || insp.status?.name === 'Unacceptable',
          );

          const hasPassed = updatedInspections.some(
            insp =>
              insp.status?.name === 'Above Average' ||
              insp.status?.name === 'Average' ||
              insp.status?.name === 'Excellent' ||
              insp.status?.name === 'Passed',
          );

          const inspectionStatus = hasRejected ? 'Rejected' : hasPassed ? 'Passed' : 'Pending';

          mergePatchIntoReceiveItems({
            id: String(itemId),
            inspections: updatedInspections,
            inspectionStatus,
          });

          setInspectLotSerialModalVisible(false);
        }}
      />

      <Rec_InspectSerialModalPopup
        visible={inspectLotSerialSerialModalVisible}
        onClose={() => setInspectLotSerialSerialModalVisible(false)}
        inspectionQty={Number(selectedLotSerial?.qty || 0)}
        savedSerials={Array.isArray(selectedLotSerial?.serials) ? selectedLotSerial.serials : []}
        initialSelectedSerials={
          (inspectLotSerialKey && lotSerialSelectedSerialsMap[inspectLotSerialKey]) ||
          (Array.isArray(selectedLotSerialInitialInspection?.serials)
            ? selectedLotSerialInitialInspection.serials
            : [])
        }
        requireValidationAgainstSaved={true}
        onConfirm={serials => {
          const key = inspectLotSerialKey;
          if (key) {
            setLotSerialSelectedSerialsMap(prev => ({ ...prev, [key]: serials }));
          }
          setInspectLotSerialSerialModalVisible(false);
        }}
      />
      <Modal
        visible={previewVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => { setPreviewVisible(false); setPreviewUri(null); }}
      >
        <SafeAreaView style={styles.fullScreenModal}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => { setPreviewVisible(false); setPreviewUri(null); }} style={styles.backBtn}>
              <ChevronLeft size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Preview</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.modalBackground}> 
            <Pressable style={styles.modalCloseArea} onPress={() => {setPreviewVisible(false);setPreviewUri(null)}} />
            {previewUri ? (
              <Image source={{ uri: previewUri }} style={styles.fullImage} resizeMode="contain" />
            ) : null}
          </View>
        </SafeAreaView>
      </Modal>

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

  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: ms(10),
  },
  tabWrapper: { flex: 1, marginHorizontal: ms(2) },
  tabBtn: {
    borderRadius: ms(8),
    paddingVertical: ms(9),
    paddingHorizontal: ms(8),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBtnActive: {
    elevation: 6,
  },
  tabText: { fontSize: ms(11), marginLeft: ms(4) },
  tabTextActive: { color: '#FFFFFF', fontWeight: '700' },
  tabTextInactive: { color: '#4B5563', fontWeight: '600' },

  itemInfoBox: {
    backgroundColor: '#EEF3FF',
    borderRadius: ms(10),
    paddingVertical: ms(10),
    paddingHorizontal: ms(10),
    elevation: 4,
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
  itemTextCol: { flex: 1,marginLeft:5 },
  itemName: { fontSize: ms(13), fontWeight: '700', color: '#111827' },
  itemCode: { marginTop: ms(3), fontSize: ms(12), color: '#9D9FA3',fontWeight:700 },
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
    borderRadius: ms(4),
    backgroundColor: '#D9E4EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillLotText: { fontSize: ms(10), color: '#5C996E', fontWeight: '600' },
  pillSerial: {
    minWidth: ms(48),
    paddingHorizontal: ms(8),
    paddingVertical: ms(3),
    borderRadius: ms(4),
    backgroundColor: '#9CC6F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: ms(4),
  },
  pillSerialText: { fontSize: ms(11), color: '#668694', fontWeight: '700' },

  section: { marginTop: ms(16) },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: ms(8) },
  sectionTitle: {
    marginLeft: ms(6),
    fontSize: ms(14),
    fontWeight: '700',
    color: '#242424',
    fontFamily:'Mulish'
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: ms(8),
    justifyContent: 'space-between',
  },
  label: { fontSize: ms(12), color: '#595A5C' },
  orderQtyText: { fontSize: ms(13), fontWeight: '700', color: '#242424' },
  orderQtyUom: { fontSize: ms(11), fontWeight: '600', color: '#242424' },
  numericRight: { alignItems: 'flex-end', justifyContent: 'center' },
  uomText: {
    fontSize: ms(10),
    color: '#242424',
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
    fontSize: ms(14),
    fontWeight: '700',
    color: '#242424',
    marginLeft: ms(8),
    flexShrink: 1,
    textAlign: 'right',
  },

  fieldBlockFull: { marginTop: ms(10) },
  mandLabel: { fontSize: ms(12), color: '#595A5C', marginBottom: ms(4),fontWeight:400 },

  subLocRow: { flexDirection: 'row', marginTop: ms(12) },
  subCol: { flex: 1, marginRight: ms(6) },
  locCol: { flex: 1, marginLeft: ms(6) },

  addLotRow: { marginTop: ms(14) },
  addLotBtn: { alignSelf: 'stretch' },
  addLotGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: ms(12),
    paddingVertical: ms(10),
    borderRadius: ms(8),
    alignSelf: 'stretch',
    // justifyContent: 'center',
  },
  addLotText: {
    marginLeft: ms(6),
    fontSize: ms(14),
    fontWeight: '600',
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

  inspectContainer: {
    marginTop: ms(16),
  },
  inspectInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: ms(10),
    paddingHorizontal: ms(12),
    paddingVertical: ms(10),
    borderWidth: 1,
  },
  inspectInfoIconWrap: {
    width: ms(32),
    height: ms(32),
    borderRadius: ms(16),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: ms(10),
  },
  inspectInfoMiddle: { flex: 1 },
  inspectInfoLabel: {
    fontSize: ms(12),
    fontWeight: '700',
    marginBottom: ms(4),
  },
  inspectStatusPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: ms(10),
    paddingVertical: ms(4),
    borderRadius: ms(20),
  },
  inspectStatusPillText: {
    fontSize: ms(10),
    fontWeight: '600',
  },
  inspectStatusPillTextPending: { color: '#F06000' },
  inspectStatusPillTextPassed: { color: '#FFFFFF' },
  inspectInfoRightText: {
    fontSize: ms(12),
    fontWeight: '600',
  },

  inspectRecQtyRow: {
    marginTop: ms(12),
    borderRadius: ms(10),
    backgroundColor: '#ECF1F7',
    paddingHorizontal: ms(12),
    paddingVertical: ms(10),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inspectRecQtyLabel: {
    fontSize: ms(12),
    fontWeight: '600',
    color: '#033EFF',
  },
  inspectRecQtyValue: {
    fontSize: ms(12),
    fontWeight: '700',
    color: '#033EFF',
  },
  inspectRecQtyValueUnit: {
    fontSize: ms(12),
    fontWeight: '700',
    color: '#033EFF',
  },

  inspectQtySection: {
    marginTop: ms(16),
  },
  inspectQtyLabel: {
    fontSize: ms(12),
    fontWeight: '500',
    color: '#111827',
    marginBottom: ms(6),
  },
  inspectQtyInputWrapper: {
    borderRadius: ms(10),
    overflow: 'hidden',
  },

  inspectStatusSection: {
    marginTop: ms(14),
  },

  inspectNotesSection: {
    marginTop: ms(14),
  },
  notesInputWrapper: {
    borderRadius: ms(10),
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: ms(10),
    paddingTop: ms(8),
    paddingBottom: ms(4),
    backgroundColor: '#FFFFFF',
  },
  notesInput: {
    minHeight: ms(72),
    fontSize: ms(12),
    color: '#111827',
    textAlignVertical: 'top',
  },
  notesCounter: {
    fontSize: ms(10),
    color: '#9CA3AF',
    alignSelf: 'flex-end',
    marginTop: ms(4),
  },

  photosSection: {
    marginTop: ms(16),
  },
  photoButtonsRow: {
    flexDirection: 'row',
    marginTop: ms(6),
    gap: ms(8),
  },
  photoButton: {
    flex: 1,
    height: ms(44),
    borderRadius: ms(10),
    backgroundColor: '#ECF1F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoThumbList: {
    marginTop: ms(10),
  },
  photoThumbWrapper: {
    width: ms(56),
    height: ms(56),
    borderRadius: ms(10),
    marginRight: ms(8),
    overflow: 'hidden',
  },
  photoThumb: {
    width: '100%',
    height: '100%',
  },
  photoDeleteBtn: {
    position: 'absolute',
    right: ms(2),
    top: ms(2),
    width: ms(18),
    height: ms(18),
    borderRadius: ms(9),
    alignItems: 'center',
    justifyContent: 'center',
  },

  inspectSerialButtonRow: {
    marginTop: ms(16),
  },
  inspectSerialBtn: {
    height: ms(35),
    borderRadius: ms(8),
    borderWidth: 1,
    borderColor: '#5D768B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    backgroundColor: '#FFFFFF',
  },
  inspectSerialBtnAddedBackground: {
    backgroundColor: '#5D768B',
  },
  inspectSerialBtnDisabled: {
    opacity: 0.5,
  },
  inspectSerialTickWrap: {
    marginRight: ms(6),
  },
  inspectSerialBtnText: {
    fontSize: ms(12),
    fontWeight: '600',
    color: '#5D768B',
  },
  inspectSerialBtnTextAdded: {
    color: '#FFFFFF',
  },

  inspectWipContainer: {
    marginTop: ms(18),
    paddingVertical: ms(16),
    paddingHorizontal: ms(12),
    borderRadius: ms(10),
    backgroundColor: '#ECF1F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inspectWipText: {
    fontSize: ms(12),
    color: '#4B5563',
    fontWeight: '600',
  },

  putAwayContainer: {
    marginTop: ms(18),
    paddingVertical: ms(30),
    paddingHorizontal: ms(12),
    borderRadius: ms(10),
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  putAwayText: {
    fontSize: ms(13),
    color: '#6B7280',
    fontWeight: '600',
    textAlign: 'center',
  },
    imageWrapper: {
    position: 'relative',
    width: 60,
    height: 60,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    // marginRight:5
  },
  image: {
    width: '100%',
    height: '100%',
  },
  cameraIcon: {
    position: 'absolute',
    top: -10,
    right: -10,
    zIndex: 5,
    elevation: 2,
  },
    fullScreenModal: {
    flex: 1,
    backgroundColor: '#000',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  backBtn: {
    padding: 6,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },

  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseArea: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  previewImage: {
    width: '90%',
    height: '70%',
    resizeMode: 'contain',
  },

});

export default Rec_ViewItemDetailsScreen;
