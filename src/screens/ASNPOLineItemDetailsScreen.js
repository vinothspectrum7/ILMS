import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, FlatList, Dimensions, Image, Alert, Modal, Pressable, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, StackActions } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import GlobalHeaderComponent from '../components/GlobalHeaderComponent';
import FooterButtonsComponent from '../components/FooterButtonsComponent';
import CustomNumericInput from '../components/CustomNumericInput';
import PencilDropdownRow from '../components/PencilDropdownRow';
import SuccessModal from '../components/SuccessModal';
import { useReceivingStore } from '../store/receivingStore';
import { GetItemImage, GetLocatorsData } from '../api/ApiServices';
import CameraIcon from '../assets/icons/CameraIcon.svg';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CONTROL_WIDTH = 80;
const CONTROL_HEIGHT = 28;
const NUMCONTROL_WIDTH = 80;
const NUMCONTROL_HEIGHT = 28;

const InlineFieldRow = ({ label, children }) => (
  <View style={styles.inlineRow}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.inlineRight}>{children}</View>
  </View>
);

const clampToLimit = (qty, limit) => {
  const lim = Number(limit ?? 0);
  const q = Number(qty ?? 0);
  if (!Number.isFinite(lim) || lim <= 0) return 0;
  if (!Number.isFinite(q) || q <= 0) return 0;
  return Math.min(q, lim);
};

const sum = (arr, key) =>
  (Array.isArray(arr) ? arr : []).reduce((acc, x) => {
    const v = Number(x?.[key]);
    return acc + (Number.isFinite(v) ? v : 0);
  }, 0);

const ASNPOLineItemDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const readOnly = !!route?.params?.readonly;
  const returnTo = route?.params?.returnTo || null;
  const receiptNumber = route?.params?.receiptNumber || null;
  const listType = route?.params?.listType || 'line';
  const isEditable = !readOnly;

  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewUri, setPreviewUri] = useState(null);
  const [imageMap, setImageMap] = useState({});

  const {
    InventoryList,
    OrgData,
    receiveItems,
    initReceiveItems,
    mergePatchIntoReceiveItems,
    setLocatorInCache,
    getLocatorFromCache,
    asnSelectedLines,
    initAsnSelectedLines,
    updateAsnLine,
    setAsnEditedLinesForPO,
    selectAsnPOId,
    asnSelectedPOIds,
  } = useReceivingStore();

  const baseItems = Array.isArray(route?.params?.items) && route.params.items.length > 0 ? route.params.items : [];
  const inReadonlyFromAsn = readOnly || returnTo === 'AsnReceivedScreen' || listType === 'received';

  const mergedItems = useMemo(() => {
    return baseItems.map((it) => {
      const stored = Array.isArray(receiveItems) ? receiveItems.find(r => String(r.id) === String(it.id)) : undefined;
      const qtyFromStore = Number(stored?.qtyToReceive);
      const qtyFromNav = Number(it?.receivingQty);
      const receivingQty = inReadonlyFromAsn
        ? Number.isFinite(qtyFromNav) ? qtyFromNav : 0
        : (Number.isFinite(qtyFromStore) ? qtyFromStore : (Number.isFinite(qtyFromNav) ? qtyFromNav : 0));
      return {
        ...it,
        receivingQty,
        lpn: stored?.lpn ?? it.lpn ?? '',
        subInventory: stored?.subInventory ?? it.subInventory ?? '',
        locator: stored?.locator ?? it.locator ?? '',
        imageUri: stored?.imageUri ?? it.imageUri ?? null,
        max_open_qty: Number(it.max_open_qty ?? stored?.max_open_qty ?? it.openQty ?? 0),
      };
    });
  }, [baseItems, receiveItems, inReadonlyFromAsn]);

  const startIndex = Math.max(0, Math.min(Number(route?.params?.startIndex ?? 0), mergedItems.length - 1));
  const [menuOpen, setMenuOpen] = useState(false);
  const [index, setIndex] = useState(startIndex);
  const [edited, setEdited] = useState({});
  const [locatorDataMap, setLocatorDataMap] = useState({});
  const [SUB_WIDTH, setSubWidth] = useState(80);
  const [LpnList, setLpnList] = useState([]);
  const [successVisible, setSuccessVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const listRef = useRef(null);
  const isProgrammaticScrollRef = useRef(false);
  const prefilledRef = useRef(false);

  const allItems = mergedItems;
  const current = useMemo(() => allItems[index], [allItems, index]);

  useEffect(() => {
    if (!Array.isArray(receiveItems) || receiveItems.length === 0) {
      if (Array.isArray(allItems) && allItems.length > 0) {
        const seed = allItems.map((it) => ({
          id: String(it.id),
          qtyToReceive: Number(it.receivingQty ?? 0),
          receivingQty: Number(it.receivingQty ?? 0),
          lpn: it.lpn ?? '',
          subInventory: it.subInventory ?? '',
          locator: it.locator ?? '',
          max_open_qty: Number(it.max_open_qty ?? it.openQty ?? 0),
          orderedQty: Number(it.orderQty ?? 0),
          receivedQty: Number(it.receivedQty ?? 0),
          openQty: Number(it.openQty ?? 0),
          uom: it.uom,
        }));
        // initReceiveItems(seed);
      }
    }
  }, [allItems, receiveItems]);

  useEffect(() => {
    if (readOnly) return;
    if (prefilledRef.current) return;
    const next = { ...edited };
    for (const it of allItems) {
      if (next[it.id]) continue;
      const fromStore = Array.isArray(receiveItems) ? receiveItems.find(r => String(r.id) === String(it.id)) : undefined;
      if (fromStore) {
        next[it.id] = {
          receivingQty: Number(fromStore.qtyToReceive ?? 0),
          lpn: fromStore.lpn ?? it.lpn ?? '',
          subInventory: fromStore.subInventory ?? it.subInventory ?? '',
          locator: fromStore.locator ?? it.locator ?? '',
          imageUri: fromStore.imageUri ?? it.imageUri ?? null,
        };
      } else {
        const limit = Number(it.max_open_qty ?? it.openQty ?? 0);
        const initialQty = clampToLimit(Number(it.receivingQty ?? it.openQty ?? 0), limit);
        next[it.id] = {
          receivingQty: initialQty,
          lpn: it.lpn ?? '',
          subInventory: it.subInventory ?? '',
          locator: it.locator ?? '',
          imageUri: it.imageUri ?? null,
        };
      }
    }
    if (Object.keys(next).length !== Object.keys(edited).length) {
      setEdited(next);
    }
    prefilledRef.current = true;
  }, [allItems, receiveItems, readOnly]);

  useEffect(() => {
    const currentItem = allItems[index];
    if (currentItem && !currentItem.imageUri && !imageMap[currentItem.id]) {
      fetchImageForItem(currentItem.itemid);
    }
  }, [index, allItems]);

  const fetchImageForItem = async (itemId) => {
    setImageMap((prev) => ({
      ...prev,
      [itemId]: { uri: null, loading: true },
    }));
    try {
      const resp = await GetItemImage(itemId);
      if (resp) {
        setImageMap((prev) => ({
          ...prev,
          [itemId]: { uri: resp?.base64_image, loading: false },
        }));
      } else {
        setImageMap((prev) => ({
          ...prev,
          [itemId]: { uri: null, loading: false },
        }));
      }
    } catch (err) {
      setImageMap((prev) => ({
        ...prev,
        [itemId]: { uri: null, loading: false },
      }));
    }
  };

  const readonlyScanQty = (() => {
    if (!readOnly || listType !== 'scan') return null;
    const open = Number(current.openQty ?? 0);
    const ord = Number(current.orderQty ?? 0);
    return open > 0 ? open : ord;
  })();

  const estimateWidth = (label) => {
    const text = String(label ?? '').trim();
    const charW = 7.2;
    const padding = 24;
    const minW = CONTROL_WIDTH;
    const maxW = Math.min(SCREEN_WIDTH * 0.6, 280);
    const w = Math.ceil(text.length * charW + padding);
    return Math.max(minW, Math.min(maxW, w));
  };

  const findLabel = (value, options) => {
    if (!value) return '';
    if (Array.isArray(options)) {
      const hit = options.find(o => String(o?.id) === String(value) || String(o?.value) === String(value));
      if (hit?.name) return hit.name;
      if (hit?.label) return hit.label;
    }
    return String(value);
  };

  useEffect(() => {
    if (readOnly) return;
    allItems.forEach(async (it) => {
      const sub_id = it.subInventory || edited[it.id]?.subInventory;
      if (!sub_id) return;
      const cached = getLocatorFromCache(sub_id);
      if (cached) {
        setLocatorDataMap((prev) => ({ ...prev, [it.id]: cached }));
      } else {
        try {
          const locdata = await GetLocatorsData(sub_id);
          if (locdata) {
            const apiLocators = locdata.map((d) => ({
              id: d.locator_id,
              name: d.locator_name,
              enabled: d.locator_enabled,
            }));
            setLocatorDataMap((prev) => ({ ...prev, [it.id]: apiLocators }));
            setLocatorInCache(sub_id, apiLocators);
          }
        } catch {}
      }
    });
  }, [allItems, readOnly]);

  const handleSubInventoryChange = async (itemId, sub_id) => {
    setEdited((prev) => ({
      ...prev,
      [itemId]: { ...(prev[itemId] ?? {}), subInventory: sub_id, locator: '' },
    }));
    const findLabels = findLabel(sub_id, InventoryList);
    const dynamicwidth = estimateWidth(findLabels);
    setSubWidth(dynamicwidth);
    const cached = getLocatorFromCache(sub_id);
    if (cached) {
      setLocatorDataMap((prev) => ({ ...prev, [itemId]: cached }));
    } else {
      try {
        const locdata = await GetLocatorsData(sub_id);
        if (locdata) {
          const apiLocators = locdata.map((d) => ({
            id: d.locator_id,
            name: d.locator_name,
            enabled: d.locator_enabled,
          }));
          setLocatorDataMap((prev) => ({ ...prev, [itemId]: apiLocators }));
          setLocatorInCache(sub_id, apiLocators);
        }
      } catch {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to load Locators',
          position: 'top',
          visibilityTime: 5000,
        });
      }
    }
  };

  const handleImagePick = (itemId) => {
    Alert.alert(
      'Select Image',
      'Choose an option',
      [
        {
          text: 'Camera',
          onPress: () => {
            launchCamera({ mediaType: 'photo', quality: 0.7 }, response => {
              if (!response.didCancel && !response.errorCode) {
                const uri = response.assets?.[0]?.uri || null;
                setEdited(prev => ({
                  ...prev,
                  [itemId]: { ...(prev[itemId] ?? {}), imageUri: uri },
                }));
              }
            });
          },
        },
        {
          text: 'Gallery',
          onPress: () => {
            launchImageLibrary({ mediaType: 'photo', quality: 0.7 }, response => {
              if (!response.didCancel && !response.errorCode) {
                const uri = response.assets?.[0]?.uri || null;
                setEdited(prev => ({
                  ...prev,
                  [itemId]: { ...(prev[itemId] ?? {}), imageUri: uri },
                }));
              }
            });
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const isSubmitEnabled = useMemo(() => {
    if (readOnly) return false;
    return allItems.some((it) => {
      const st = edited[it.id];
      if (!st) return false;
      const limit = Number(it.max_open_qty ?? it.openQty ?? 0);
      const q = Number(st.receivingQty ?? 0);
      const qtyOk = q > 0 && q <= limit;
      const subInvOk = !!st.subInventory;
      return qtyOk && subInvOk;
    });
  }, [edited, allItems, readOnly]);

  const titlePo = returnTo == 'ReceivedSummaryScreen' ? receiptNumber : current?.poNumber ? `${String(current.poNumber)}` : 'Receiving';

  const scrollToIndex = useCallback((i) => {
    if (i < 0 || i >= allItems.length) return;
    isProgrammaticScrollRef.current = true;
    listRef.current?.scrollToIndex({ index: i, animated: true });
    setIndex(i);
  }, [allItems.length]);

  const goPrev = useCallback(() => { if (index > 0) scrollToIndex(index - 1); }, [index, scrollToIndex]);
  const goNext = useCallback(() => { if (index < allItems.length - 1) scrollToIndex(index + 1); }, [index, allItems.length, scrollToIndex]);

  const handleCancelNav = useCallback(() => {
    if (returnTo && returnTo !== 'PovViewItems' && returnTo !== 'poviewitems') navigation.navigate(returnTo, { listType });
    else if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('Receive');
  }, [navigation, returnTo]);

  const buildPatches = useCallback(() => {
    const patches = [];
    for (const it of allItems) {
      const st = edited[it.id];
      if (!st) continue;
      const limit = Number(it.max_open_qty ?? it.openQty ?? 0);
      const clampedQty = st.receivingQty ?? 0;
      // const valid = clampedQty > 0 && clampedQty <= limit && !!st.subInventory;
      // if (!valid) continue;
      patches.push({
        id: String(it.id),
        receivingQty: clampedQty,
        qtyToReceive: clampedQty,
        lpn: st.lpn ?? '',
        subInventory: st.subInventory ?? null,
        locator: st.locator ?? null,
        imageUri: st.imageUri ?? it.imageUri ?? null,
      });
    }
    return patches;
  }, [allItems, edited]);

  const resolvePoContext = useCallback(() => {
    const poFromParams = route?.params?.selectedPO?.po_id || route?.params?.poId;
    const poNumberFromParams = route?.params?.selectedPO?.po_number || route?.params?.poNumber;
    if (poFromParams) return { po_id: String(poFromParams), po_number: poNumberFromParams || String(titlePo || '-') };
    if (Array.isArray(asnSelectedPOIds) && asnSelectedPOIds.length > 0) {
      const nid = String(asnSelectedPOIds[0]);
      let pn = '-';
      if (Array.isArray(asnSelectedLines) && asnSelectedLines.length > 0) {
        const hit = asnSelectedLines.find(x => String(x.id) === nid);
        pn = hit?.po_number || pn;
      }
      return { po_id: nid, po_number: pn || String(titlePo || '-') };
    }
    if (Array.isArray(asnSelectedLines) && asnSelectedLines.length > 0) {
      const first = asnSelectedLines[0];
      const nid = String(first?.po_id || first?.id || '');
      const pn = first?.po_number || String(titlePo || '-');
      if (nid) return { po_id: nid, po_number: pn };
    }
    return { po_id: null, po_number: String(titlePo || '-') };
  }, [route?.params, asnSelectedPOIds, asnSelectedLines, titlePo]);

  const buildEnrichedLinesFromDetails = useCallback(() => {
    const patchedMap = new Map();
    (receiveItems || []).forEach((ri) => {
      patchedMap.set(String(ri.id), ri);
    });
    const lines = (allItems || []).map((it) => {
      console.log(it,"it");
      const r = patchedMap.get(String(it.id)) || {};
      const rawQty = Number(edited[it.id]?.receivingQty ?? it.receivingQty ?? 0);
      const limit = Number(it.max_open_qty ?? it.openQty ?? 0);
      const clamped = Math.max(0, Math.min(rawQty, Number.isFinite(limit) ? limit : 0));
      return {
        po_line_id: it.po_line_id,
        item_id: it.item_id || it.itemid,
        item_code: it.itemName || it.item_nane,
        item_description: it.item_description || it.itemdescription,
        ordered_qty: Number(it.orderQty ?? it.orderedQty ?? 0),
        rcvd_qty: Number(it.receivedQty ?? 0),
        max_open_qty: Number(it.max_open_qty ?? it.openQty ?? 0),
        shipped_qty: Number(it.shipped_qty ?? 0),
        uom: it.uom,
        ship_to_location: it.ship_to_location,
        line_status: it.receivingStatus,
        receiving_qty: clamped,
        subInventory: r?.subInventory ?? edited[it.id]?.subInventory ?? it.subInventory ?? null,
        locator: r?.locator ?? edited[it.id]?.locator ?? it.locator ?? null,
      };
    });
    return lines;
  }, [allItems, receiveItems, edited]);

  const finalizeLinesWithAutoFill = useCallback((lines) => {
    const arr = Array.isArray(lines) ? lines : [];
    const allZero = arr.every(li => Number(li?.receiving_qty ?? 0) <= 0);
    if (!allZero) return arr;
    return arr.map(li => {
      const ord = Number(li?.ordered_qty ?? 0);
      const cap = Number(li?.max_open_qty ?? ord);
      const maxCap = Number.isFinite(cap) ? cap : 0;
      return { ...li, receiving_qty: Math.min(ord, maxCap) };
    });
  }, []);

  const navigateBackToList = useCallback(() => {
    if (returnTo && returnTo !== 'PovViewItems' && returnTo !== 'poviewitems') navigation.navigate(returnTo, { listType });
    else if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('Receive');
  }, [navigation, returnTo, listType]);

  const handleSaveAll = useCallback(async () => {
    const patches = buildPatches();
    if (!patches.length) {
      Toast.show({ type: 'info', text1: 'No changes to save', position: 'top', visibilityTime: 5000 });
      return;
    }
    try {
      console.log(patches,"buildPatchesbuildPatchesbuildPatches");
      for (const p of patches) mergePatchIntoReceiveItems(p);
      const { po_id, po_number } = resolvePoContext();
      const enriched = buildEnrichedLinesFromDetails();
      // console.log(enrichedLines,"enrichedLines");
      const finalizedLines = finalizeLinesWithAutoFill(enriched);
      console.log(finalizedLines,"finalizedLines");
      const ordered_qty = sum(finalizedLines, 'ordered_qty');
      const rcvd_qty = sum(finalizedLines, 'rcvd_qty');
      const receiving_qty = sum(finalizedLines, 'receiving_qty');
      const shippedVals = finalizedLines.map((x) => Number(x?.shipped_qty)).filter((v) => Number.isFinite(v));
      const shipped_qty = shippedVals.length ? shippedVals.reduce((a, b) => a + b, 0) : null;
      if (po_id) {
        setAsnEditedLinesForPO(po_id, finalizedLines);
        // selectAsnPOId(po_id);
        // const existing = Array.isArray(asnSelectedLines) ? asnSelectedLines.find(x => String(x.id) === String(po_id)) : null;
        const poEntry = {
          id: String(po_id || '0'),
          po_id: po_id || '',
          po_number: po_number || '-',
          line: {
            ordered_qty,
            rcvd_qty,
            shipped_qty,
            receiving_qty,
            asn_line_items: finalizedLines,
          },
        };
        // if (existing) {
        //   updateAsnLine({ id: String(poEntry.id), line: poEntry.line });
        // } else {
        //   initAsnSelectedLines([poEntry]);
        // }
      }
      const label = returnTo === 'podetailsummary' ? 'Updated Successfully' : 'Saved Successfully';
      setSuccessMessage(label);
      setSuccessVisible(true);
      setTimeout(() => {
        setSuccessVisible(false);
        navigateBackToList();
      }, 1200);
    } catch {
      Toast.show({ type: 'error', text1: 'Save failed', text2: 'Please try again.', position: 'top', visibilityTime: 5000 });
    }
  }, [buildPatches, mergePatchIntoReceiveItems, navigateBackToList, returnTo]);

  const renderImageBox = (item) => {
    const imgState = imageMap[item.itemid] || { uri: item.imageUri, loading: false };
    if (imgState.loading) {
      return <ActivityIndicator size="large" />;
    }
    if (imgState.uri) {
      return (
        <TouchableOpacity
          style={{ flex: 1, width: '100%', height: '100%' }}
          onPress={() => {
            setPreviewUri(imgState.uri);
            setPreviewVisible(true);
          }}
          activeOpacity={0.9}
        >
          <Image source={{ uri: imgState.uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        </TouchableOpacity>
      );
    }
    return <Text style={{ fontSize: 10, color: '#999' }}>No Image</Text>;
  };

  const renderPage = ({ item }) => {
    const fromStore = Array.isArray(receiveItems) ? receiveItems.find(r => String(r.id) === String(item.id)) : undefined;
    const storeQty = Number(fromStore?.qtyToReceive);
    const mergedQty = Number(item.receivingQty ?? 0);
    const defaultEditableQty = Number.isFinite(storeQty) ? storeQty : mergedQty;
    console.log(mergedQty,storeQty,defaultEditableQty,"QTTTTTTTTTTT")

    const readonlyQty = returnTo == 'AsnReceivedScreen' ? item.receivingQty :
      readOnly
        ? (listType === 'scan'
          ? (Number(item.openQty ?? 0) > 0 ? Number(item.openQty ?? 0) : Number(item.orderQty ?? 0))
          : Number(item.orderQty ?? mergedQty ?? 0))
        : defaultEditableQty;

    const pageState = edited[item.id] ?? {
      receivingQty: readonlyQty,
      lpn: fromStore?.lpn ?? item.lpn ?? '',
      subInventory: fromStore?.subInventory ?? item.subInventory ?? '',
      locator: fromStore?.locator ?? item.locator ?? '',
      imageUri: fromStore?.imageUri ?? item.imageUri ?? null,
      openQty: fromStore?.openQty ?? item.openQty ?? ''
    };

    const findLabels = (value, options) => {
      if (!value) return '';
      if (Array.isArray(options)) {
        const hit = options.find(o => String(o?.id) === String(value) || String(o?.value) === String(value));
        if (hit?.name) return hit.name;
        if (hit?.label) return hit.label;
      }
      return String(value);
    };

    const estimateWidth = (label) => {
      const text = String(label ?? '').trim();
      const charW = 7.2;
      const padding = 24;
      const minW = CONTROL_WIDTH;
      const maxW = Math.min(SCREEN_WIDTH * 0.6, 280);
      const w = Math.ceil(text.length * charW + padding);
      return Math.max(minW, Math.min(maxW, w));
    };

    const findLabelsVal = findLabels(pageState?.subInventory, InventoryList);
    const dynamicwidth = estimateWidth(findLabelsVal);
    setSubWidth(dynamicwidth);

    const siteLocationValueRaw = String(
      item.ship_to_location ?? item.shipped_location ?? item.shippedlocation ?? item.shiptolocation ?? ''
    ).trim();
    const siteLocationValue = siteLocationValueRaw.length > 0 ? siteLocationValueRaw : '-';

    return (
      <View style={{ width: SCREEN_WIDTH }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.card} key={`card-${item.id}`}>
            <View style={styles.row}>
              <Text style={styles.label}>Item Name</Text>
              <Text style={styles.valueBold} numberOfLines={1}>{item.itemName || '—'}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.block}>
              <Text style={styles.label}>Item Description</Text>
              <View style={styles.row}>
                <Text style={styles.descText} numberOfLines={3}>
                  {item.itemDescription || '—'}
                </Text>
                <View style={styles.imageWrapper}>
                  {renderImageBox(allItems[index])}
                  {/* {!readOnly && (
                    <TouchableOpacity style={styles.cameraIcon} onPress={() => handleImagePick(item.id)}>
                      <CameraIcon width={22} height={22} />
                    </TouchableOpacity>
                  )} */}
                </View>
              </View>
            </View>

            <View style={styles.divider} />
            <View style={styles.divider} />

            <View style={styles.row}>
              <Text style={styles.label}>Order Quantity</Text>
              <Text style={styles.qtyRight}>{String(item.orderQty ?? 0)}</Text>
            </View>
            <Text style={styles.uomText}>{item.uom}</Text>

            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.label}>{readOnly ? 'Received' : 'Receiving'} Quantity</Text>
              <View style={styles.numericRight}>
                {readOnly ? (
                  <Text style={styles.qtyRight}>{String(readOnly ? (returnTo == 'AsnReceivedScreen' ? item.receivingQty : (listType === 'scan' ? (Number(item.openQty ?? 0) > 0 ? Number(item.openQty ?? 0) : Number(item.orderQty ?? 0)) : Number(item.orderQty ?? mergedQty ?? 0))) : 0)}</Text>
                ) : (
                  <CustomNumericInput
                    key={`qty-${String(item.id)}`}
                    value={Number(pageState.receivingQty) || 0}
                    setValue={(v) => {
                      if (readOnly) return;
                      const currentVal = Number(pageState.receivingQty) || 0;
                      const raw = typeof v === 'function' ? v(currentVal) : v;
                      const n = Number(raw);
                      const clamped = clampToLimit(n, Number(item.max_open_qty ?? 0));
                      setEdited((prev) => ({ ...prev, [item.id]: { ...(prev[item.id] ?? {}), receivingQty: clamped } }));
                    }}
                    max={Number(item.max_open_qty ?? 0)}
                    min={0}
                    step={1}
                    width={NUMCONTROL_WIDTH}
                    height={NUMCONTROL_HEIGHT}
                    isSelected={isEditable}
                    disabledinput={item.openQty==0}
                  />
                )}
              </View>
            </View>
            <Text style={styles.uomText}>{item.uom}</Text>

            <View style={styles.divider} />
            <InlineFieldRow label="Ship-To Location">
              <Text style={[styles.valueBold, { minWidth: '60%' }]} numberOfLines={1}>
                {siteLocationValue}
              </Text>
            </InlineFieldRow>

            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.label}>Receiving Status</Text>
              <Text
                style={[
                  styles.statusText,
                  {
                    color:
                      pageState.receivingQty > 0 && item.receivingStatus == 'OPEN'
                        ? '#F06000'
                        : item.receivingStatus && item.receivingStatus == 'OPEN'
                        ? '#033EFF'
                        : item.receivingStatus == 'FULLY RECEIVED'
                        ? '#168035'
                        : '#F06000',
                  },
                ]}
              >
                {pageState.receivingQty > 0 && item.receivingStatus == 'OPEN' ? 'In Progress' : item.receivingStatus}
              </Text>
            </View>

            <View style={styles.divider} />
            <InlineFieldRow label="LPN">
              {!readOnly ? (
                <PencilDropdownRow
                  key={`lpn-${String(item.id)}`}
                  value={pageState.lpn}
                  onChange={
                    isEditable
                      ? (id) =>
                          setEdited((prev) => ({
                            ...prev,
                            [item.id]: {
                              ...(prev[item.id] ?? {}),
                              lpn: id,
                            },
                          }))
                      : undefined
                  }
                  options={LpnList}
                  placeholder="Select LPN"
                  disabled={!isEditable || item.openQty==0}
                  width={CONTROL_WIDTH}
                  selectedwidth={CONTROL_WIDTH}
                  height={CONTROL_HEIGHT}
                  compact
                />
              ) : (
                <Text style={[styles.valueBold, { minWidth: '60%' }]} numberOfLines={1}> - </Text>
              )}
            </InlineFieldRow>

            <View style={styles.divider} />
            <InlineFieldRow label="Sub Inventory*">
              {!readOnly ? (
                <PencilDropdownRow
                  key={`subinv-${String(item.id)}`}
                  value={pageState.subInventory}
                  onChange={isEditable ? (sub_id) => handleSubInventoryChange(item.id, sub_id) : undefined}
                  options={InventoryList}
                  placeholder="Select Sub Inventory"
                  disabled={!isEditable || item.openQty==0}
                  width={CONTROL_WIDTH}
                  selectedwidth={SUB_WIDTH}
                  height={CONTROL_HEIGHT}
                  compact
                />
              ) : (
                <Text style={[styles.valueBold, { minWidth: '60%' }]} numberOfLines={1}>{item.sub_inv_name}</Text>
              )}
            </InlineFieldRow>

            <View style={styles.divider} />
            <InlineFieldRow label="Locator">
              {!readOnly ? (
                <PencilDropdownRow
                  key={`locator-${String(item.id)}`}
                  value={pageState.locator}
                  onChange={isEditable ? (id) => setEdited((prev) => ({ ...prev, [item.id]: { ...(prev[item.id] ?? {}), locator: id } })) : undefined}
                  options={locatorDataMap[item.id] ?? []}
                  placeholder="Select Locator"
                  disabled={!isEditable || item.openQty==0}
                  width={CONTROL_WIDTH}
                  selectedwidth={CONTROL_WIDTH}
                  height={CONTROL_HEIGHT}
                  compact
                />
              ) : (
                <Text style={[styles.valueBold, { minWidth: '60%' }]} numberOfLines={1}>{item.locator_name}</Text>
              )}
            </InlineFieldRow>
          </View>

          <View style={{ height: 24 }} />
        </ScrollView>
      </View>
    );
  };

  const leftBtnLabel = 'Cancel';
  const rightBtnLabel = returnTo === 'podetailsummary' ? 'Update' : 'Save';

  return (
    <SafeAreaView style={styles.container}>
      <GlobalHeaderComponent
        organizationName={OrgData?.selectedOrgCode}
        screenTitle="Receiving "
        contextInfo={titlePo}
        notificationCount={0}
        onBack={() => navigation.goBack()}
        onMenu={() => setMenuOpen(true)}
      />
      <View style={styles.navBar}>
        <TouchableOpacity onPress={goPrev} disabled={index === 0} style={styles.navEdge} activeOpacity={0.7}>
          <ChevronLeft size={22} color={index === 0 ? '#C8D0D6' : '#233E55'} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>{`Line Item ${index + 1}`}</Text>
        <TouchableOpacity onPress={goNext} disabled={index === allItems.length - 1} style={styles.navEdge} activeOpacity={0.7}>
          <ChevronRight size={22} color={index === allItems.length - 1 ? '#C8D0D6' : '#233E55'} />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={listRef}
        data={allItems}
        keyExtractor={(it) => String(it.id)}
        renderItem={renderPage}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={startIndex}
        getItemLayout={(_, i) => ({ length: SCREEN_WIDTH, offset: SCREEN_WIDTH * i, index: i })}
        removeClippedSubviews={false}
        windowSize={3}
        onScroll={(e) => {
          if (isProgrammaticScrollRef.current) return;
          const x = e.nativeEvent.contentOffset.x;
          const newIndex = Math.round(x / SCREEN_WIDTH);
          if (newIndex !== index) {
            setIndex(newIndex);
          }
        }}
        onMomentumScrollEnd={() => {
          isProgrammaticScrollRef.current = false;
        }}
        scrollEventThrottle={16}
      />

      {!readOnly && (
        <FooterButtonsComponent
          leftLabel={leftBtnLabel}
          rightLabel={rightBtnLabel}
          onLeftPress={handleCancelNav}
          onRightPress={isSubmitEnabled ? handleSaveAll : undefined}
          leftEnabled={true}
          rightEnabled={isSubmitEnabled}
        />
      )}

      <SuccessModal
        visible={successVisible}
        message={successMessage ?? 'Submitted Successfully'}
        onDismiss={() => setSuccessVisible(false)}
        autoHideMs={1800}
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
            <Pressable style={styles.modalCloseArea} onPress={() => { setPreviewVisible(false); setPreviewUri(null); }} />
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
    marginTop: 14,
    marginBottom: 14,
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  navEdge: { width: 44, height: 32, alignItems: 'center', justifyContent: 'center' },
  navTitle: { flex: 1, color: '#233E55', textAlign: 'center', fontSize: 12, fontWeight: '600' },
  content: { paddingBottom: 120 },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 80,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 6,
  },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, justifyContent: 'space-between' },
  block: { paddingVertical: 12 },
  inlineRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  inlineRight: { alignItems: 'flex-end', justifyContent: 'center' },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: '#E5E7EB' },
  label: { fontSize: 12, color: '#6C6C6C' },
  valueBold: { fontSize: 12, color: '#000000', fontWeight: '700', maxWidth: '58%', textAlign: 'right' },
  descText: { marginTop: 6, fontSize: 12, fontWeight: '700', color: '#111827', lineHeight: 18 },
  qtyRight: { fontSize: 12, fontWeight: '700', color: '#111827' },
  qtyUnit: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  numericRight: { alignItems: 'flex-end', justifyContent: 'center' },
  statusText: { color: '#F5B429', fontWeight: '700' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', alignItems: 'center', justifyContent: 'center' },
  successCard: { width: '75%', backgroundColor: '#FFFFFF', borderRadius: 14, paddingVertical: 18, paddingHorizontal: 16, alignItems: 'center' },
  successTitle: { fontSize: 14, fontWeight: '700', color: '#233E55', marginBottom: 6 },
  successMsg: { fontSize: 13, fontWeight: '600', color: '#111827' },
  uomText: { fontSize: 10, color: '#595A5C', marginTop: -6, marginBottom: 10, marginRight: 2, textAlign: 'right' },
  imageWrapper: { position: 'relative', width: 70, height: 70, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  image: { width: '100%', height: '100%' },
  cameraIcon: { position: 'absolute', top: -3, right: -5, zIndex: 5 },
  fullScreenModal: { flex: 1, backgroundColor: '#000' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, backgroundColor: '#fff', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#ccc' },
  backBtn: { padding: 6 },
  modalTitle: { fontSize: 16, fontWeight: '600', color: '#000' },
  imageContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  fullImage: { width: '100%', height: '100%' },
  modalBackground: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  modalCloseArea: { position: 'absolute', width: '100%', height: '100%' },
  previewImage: { width: '90%', height: '70%', resizeMode: 'contain' },
});

export default ASNPOLineItemDetailsScreen;
