import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { FlatList, SafeAreaView, ScrollView, StyleSheet, View, Text, Modal, BackHandler, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import GlobalHeaderComponent from '../components/GlobalHeaderComponent';
import POinfoCardComponent from '../components/POinfoCardComponent';
import ToggleTabsComponent from '../components/ToggleTabsComponent';
import LineItemListCardComponent from '../components/LineItemListCardComponent';
import FooterButtonsComponent from '../components/FooterButtonsComponent';
import TableHeaderComponent from '../components/TableHeaderComponent';
import ScanItemListCardComponent from '../components/ScanItemListCardComponent';
import SummaryTabHdrComponent from '../components/SummaryTabHdrComponent';
import BarcodeScanner from './BarCodeScanner';
import { useReceivingStore } from '../store/receivingStore';
import ConfirmModalComponent from '../components/ConfirmModalComponent';
import { GetSinglePO, Submit_Receive_Qty, Save_Receive_Qty, ReleasePO } from '../api/ApiServices';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ConfirmSvg from '../assets/icons/success.svg';
import FailureSvg from '../assets/icons/failure.svg';
import BarcodeScannerIcon from '../assets/icons/barcodescanner.svg';
import { clearCurrentPO, getCurrentPO, setCurrentPO } from '../api/posession';

const clampToLimit = (qty, limit) => {
  const lim = Number(limit ?? 0);
  const q = Number(qty ?? 0);
  if (!Number.isFinite(lim) || lim <= 0) return 0;
  if (!Number.isFinite(q) || q <= 0) return 0;
  return Math.min(q, lim);
};

const mapHeader = po => ({
  purchaseReceipt: po?.next_receipt_num ?? '—',
  supplier: po?.supplier_name ?? '',
  poNumber: po?.po_number ?? '—',
  poDate: po?.order_date ?? '—',
});

const sameScanList = (a, b) => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const x = a[i];
    const y = b[i];
    if (String(x.id) !== String(y.id)) return false;
    if (Number(x.qtyToReceive ?? 0) !== Number(y.qtyToReceive ?? 0)) return false;
    if ((x.lpn ?? '') !== (y.lpn ?? '')) return false;
    if (String(x.subInventory ?? '') !== String(y.subInventory ?? '')) return false;
    if (String(x.locator ?? '') !== String(y.locator ?? '')) return false;
  }
  return true;
};

const NewReceiveScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const [profileName, setProfileName] = useState('');
  const {
    poHeader,
    setPoHeader,
    receiveItems,
    initReceiveItems,
    mergePatchIntoReceiveItems,
    resetReceiving,
    OrgData,
  } = useReceivingStore();

  const selectedPO = route?.params?.selectedPO || null;
  const printcopies = route?.params?.copies || '0';
  console.log(printcopies, "printcopiesprintcopiesprintcopiesprintcopies")

  const [modalVisible, setModalVisible] = useState(false);
  const didCompleteRef = useRef(false);

  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [saveModalStatus, setSaveModalStatus] = useState('success');

  const didsaveCompleteRef = useRef(false);

  const [draftItems, setDraftItems] = useState([]);
  const [phase, setPhase] = useState('idle');
  const [PoListItems, setPoListItems] = useState([]);
  const [PurchaseReceipt, setPurchaseReceipt] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [scannedItems, setScannedItems] = useState([]);
  const [showScanner, setShowScanner] = useState(false);
  const [filter, setFilter] = useState('pending');

  useFocusEffect(
    useCallback(() => {
      didCompleteRef.current = false;
      return () => {};
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      const onBackPress = async () => {
        if (showScanner) {
          setShowScanner(false);
          return true;
        }
        if (modalVisible) {
          setModalVisible(false);
          return true;
        }
        if (saveModalVisible) {
          setSaveModalVisible(false);
          return true;
        }
        clearCurrentPO();
        navigation.navigate('Receive');
        return true;
        // const { currentPO, lockedByUser } = getCurrentPO();
        // if (currentPO && !lockedByUser) {
        //   setPhase('loading');
        //   try {
        //     const release = await ReleasePO(currentPO);
        //     if (release) {
        //       setPhase('success');
        //       clearCurrentPO();
        //       navigation.navigate('Receive');
        //       return true;
        //     } else {
        //       Toast.show({
        //         type: 'error',
        //         text1: 'Error',
        //         text2: 'Failed to Release PO. Please try again.',
        //         position: 'top',
        //         visibilityTime: 5000,
        //       });
        //     }
        //   } catch (error) {
        //     setPhase('error');
        //     Toast.show({
        //       type: 'error',
        //       text1: 'Error',
        //       text2: `${error}`,
        //       position: 'top',
        //       visibilityTime: 5000,
        //     });
        //   }
        // } else {
        //   setPhase('error');
        //   clearCurrentPO();
        //   navigation.navigate('Receive');
        //   return true;
        // }
      };
      const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => sub.remove();
    }, [navigation, showScanner, modalVisible, saveModalVisible])
  );

  useEffect(() => {
    if (!selectedPO) return;
    setPoHeader(mapHeader(selectedPO));
  }, [selectedPO, setPoHeader]);

  const getLabel = (lot_enabled, serial_enabled) => {
  if (lot_enabled && serial_enabled) {
    return "Lot+Serial";
  } else if (lot_enabled) {
    return "Lot";
  } else if (serial_enabled) {
    return "Serial";
  } else {
    return null;
  }
};


  const mapBackendArrayToFrontend = (data, posingledata) => {
    const mapped = data.map((backend, index) => ({
      id: index + 1,
      po_line_id: backend?.po_line_id,
      po_line_number: backend?.line_number,
      item_id: backend?.item_id,
      purchaseReceipt: posingledata?.next_receipt_num || '',
      name: backend.item?.item_code || '',
      description: backend.item?.description || '',
      supplier_site_code:backend?.supplier_site_code || null,
      location_code:backend?.location_code || null,
      orderedQty: backend.ord_qty,
      orderqty: backend.ord_qty,
      itemtype: getLabel(backend.item?.lot_enabled, backend.item?.serial_enabled),
      deliverytype:backend?.delivery_type,
      ship_to_location: backend.ship_to_location,
      receivedQty: backend.rcvd_qty,
      openQty:
        backend.rcvd_qty > backend.ord_qty
          ? 0
          : Number(backend.ord_qty) - Number(backend.rcvd_qty),
      max_open_qty: Math.floor(backend.max_open_qty ?? 0),
      lpn: '',
      subInventory: OrgData?.selectedinventory,
      imageUri: backend?.image_uri || null,
      org_id: OrgData?.selectedOrg,
      org_code:OrgData?.selectedOrgCode,
      business_name:OrgData?.BusinessName??null,
      locator: '',
      status: backend.line_status,
      uom: backend.item?.uom,
      uomCode: backend.item?.uom_code,
      promisedDate: backend.promised_dlry_dt
        ? new Date(backend.promised_dlry_dt).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
        : null,
      needByDate: backend.need_by_dt
        ? new Date(backend.need_by_dt).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
        : null,
    }));

    return mapped.sort((a, b) => {
      if (a.openQty === 0 && b.openQty !== 0) return 1;
      if (a.openQty !== 0 && b.openQty === 0) return -1;
      return 0;
    });
  };
  
  useEffect(() => {
    if (!selectedPO?.po_id) return;
    setPhase('loading');
    const loadPoData = async () => {
      try {
        console.log(selectedPO,"selectedPOselectedPOselectedPOselectedPOselectedPOselectedPO")
        const posingledata = await GetSinglePO(selectedPO.po_number);
        if (posingledata?.purchase_order_lines) {
          const lockstatus = posingledata?.po_user_action == 'ASSIGNED' ? true : false;
          setCurrentPO(selectedPO.po_id, lockstatus);
          setPurchaseReceipt(posingledata?.next_receipt_num);
          console.log(posingledata,"posingledata.purchase_order_linesposingledata.purchase_order_lines")
          const frontendArray = mapBackendArrayToFrontend(posingledata.purchase_order_lines, posingledata);
          setPoListItems(frontendArray);
        } else {
          setPoListItems([]);
        }
        setPhase('success');
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: `${error}`,
          position: 'top',
          visibilityTime: 10000,
        });
        setPhase('error');
        clearCurrentPO();
        navigation.navigate('Receive');
      }
    };
    loadPoData();
  }, [selectedPO?.po_id]);

  useEffect(() => {
    if (PoListItems.length > 0) {
      const seeded = PoListItems.map(i => ({ ...i, qtyToReceive: 0 }));
      initReceiveItems(seeded);
    }
  }, [PoListItems, initReceiveItems]);

  useFocusEffect(
    useCallback(() => {
      const withStored = receiveItems.map(src => {
        const qty = Number(src?.qtyToReceive ?? src?.receivingQty ?? 0);
        return { ...src, qtyToReceive: qty };
      });
      setDraftItems(withStored);
      setSelectedItems(
        withStored.filter(x => Number(x.qtyToReceive ?? 0) > 0).map(x => x.id)
      );
      return () => {};
    }, [receiveItems])
  );

  const persistQty = (id, qty, fields = {}) => {
    const n = Number(qty ?? 0);
    mergePatchIntoReceiveItems({
      id: String(id),
      qtyToReceive: n,
      receivingQty: n,
      lpn: fields.lpn ?? '',
      subInventory: fields.subInventory ?? '',
      locator: fields.locator ?? '',
    });
  };

  const handleCheckToggle = item => {
    const isChecked = selectedItems.includes(item.id);
    if (isChecked) {
      setSelectedItems(prev => prev.filter(id => id !== item.id));
      setDraftItems(prev =>
        prev.map(it => (it.id === item.id ? { ...it, qtyToReceive: 0 } : it))
      );
      persistQty(item.id, 0, item);
      return;
    }
    const autoQty = clampToLimit(item.openQty, item.max_open_qty);
    setDraftItems(prev =>
      prev.map(it => (it.id === item.id ? { ...it, qtyToReceive: autoQty } : it))
    );
    setSelectedItems(prev => [...prev, item.id]);
    persistQty(item.id, autoQty, item);
  };

  const handleQtyChange = (id, newQty) => {
    setDraftItems(prev => {
      const next = prev.map(item =>
        item.id === id
          ? { ...item, qtyToReceive: clampToLimit(newQty, item.max_open_qty) }
          : item
      );
      const changed = next.find(x => x.id === id);
      const clamped = Number(changed?.qtyToReceive ?? 0);
      setSelectedItems(curr => {
        const has = curr.includes(id);
        if (clamped > 0 && !has) return [...curr, id];
        if (clamped === 0 && has) return curr.filter(x => x !== id);
        return curr;
      });
      persistQty(id, clamped, changed || {});
      return next;
    });
  };

  const commitDraftToStore = () => {
    draftItems.forEach(it => {
      const limit = it.max_open_qty;
      const clamped = clampToLimit(it.qtyToReceive, limit);
      persistQty(it.id, clamped, it);
    });
  };

  const handleReceive = () => {
    commitDraftToStore();
    const source = draftItems;
    console.log(source,"draftitemssssssssssssssssssssss")
    const payload = source
      .filter(i => Number(i.qtyToReceive ?? 0) > 0)
      .map(i => ({
        id: i.id,
        purchaseReceipt: i.purchaseReceipt,
        name: i.name,
        description: i.description,
        orderedQty: i.orderedQty,
        orderqty: i.orderqty,
        itemtype: i.itemtype ?? null,
        ship_to_location: i.ship_to_location,
        receivedQty: i.receivedQty,
        openQty: i.openQty,
        uom: i.uom,
        promisedDate: i.promisedDate,
        needByDate: i.needByDate,
        qtyToReceive: i.qtyToReceive,
        po_line_id: i.po_line_id,
        item_id: i.item_id,
        lpn: i.lpn ? i.lpn : null,
        subInventory: i.subInventory ? i.subInventory : OrgData?.selectedinventory,
        org_id: OrgData?.selectedOrg,
        locator: i.locator ? i.locator : null,
        status: i.status,
        copies: printcopies,
      }));
    navigation.push('ReceiveSummaryScreen', {
      id: selectedPO?.id ?? null,
      selectedItems: payload,
      readonly: false,
      purchaseReceipt: PurchaseReceipt,
      header: mapHeader(selectedPO),
      listType: 'line',
      copies: printcopies,
      interface_id: null,
    });
  };

  const formatToday = () => {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1)
      .toString()
      .padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${yyyy}-${mm}-${dd}`;
  };

  const mapConfirmSaveData = data => {
    const FILTER_ZERO_QTY = false;

    const rows = data.map(backend => {
      const qty = Number(backend?.qtyToReceive ?? 0);
      return {
        po_line_id: backend?.po_line_id,
        item_id: backend?.item_id,
        org_id: backend?.org_id,
        sub_inv_id: backend?.subInventory,
        locator_id: backend?.locator ? backend?.locator : null,
        lot_number: '',
        expiry_date: formatToday(),
        received_qty: qty,
        is_checked: qty > 0 ? true : false,
        received_type: 'purchase_order',
        asn_header_uuid: null,
      };
    });

    return FILTER_ZERO_QTY ? rows.filter(r => r.received_qty > 0) : rows;
  };

  const isSaveSuccess = res => {
    if (!res) return false;
    if (res === true) return true;
    if (typeof res?.results === 'boolean') return res.results === true;
    if (typeof res?.results === 'number') return res.results > 0;
    if (Array.isArray(res?.results)) return res.results.length > 0;
    if (res?.results[0].status == 'success') return true;
    if (res?.results[0].status == 'error') return false;
    if (res?.status === 'success' || res?.status === 'ok') return true;
    if (typeof res?.message === 'string' && res.message.toLowerCase().includes('success'))
      return true;
    return false;
  };

  const handlesave = async () => {
    didCompleteRef.current = false;
    try {
      const payload = mapConfirmSaveData(draftItems);
      const response = await Save_Receive_Qty(payload);
      if (isSaveSuccess(response)) {
        setSaveModalStatus('success');
        setSaveModalVisible(true);
        setTimeout(() => handlesaveSuccess(), 3500);
      } else {
        setSaveModalStatus('failure');
        setSaveModalVisible(true);
        setTimeout(() => handlesaveFailure(), 3500);
      }
    } catch (e) {
      setSaveModalStatus('failure');
      setSaveModalVisible(true);
      setTimeout(() => handlesaveFailure(), 3500);
    }
  };

  const handlesaveSuccess = () => {
    if (didCompleteRef.current) return;
    didCompleteRef.current = true;
    setSaveModalVisible(false);
  };

  const handlesaveFailure = () => {
    if (didCompleteRef.current) return;
    didCompleteRef.current = true;
    setSaveModalVisible(false);
  };

  const handleCancel = () => setModalVisible(false);

  const handleFailure = () => {
    Toast.hide();
    setModalVisible(false);
  };

  const goToLineItemDetails = (startIdx = 0, source = draftItems, readonly = false, listType = 'line') => {
    console.log(draftItems,"DRAFTITEMSSS");
    const withLatestFromStore = source.map((it, i) => {
      const s = receiveItems.find(r => String(r.id) === String(it.id));
      const qty = Number(s?.qtyToReceive ?? s?.receivingQty ?? it.qtyToReceive ?? 0);
      return {
        id: String(it.id),
        poNumber: poHeader?.poNumber ?? '—',
        lineNumber: i + 1,
        itemName: it.name,
        po_line_id: it.po_line_id,
        itemid: it.item_id,
        ship_to_location: it.ship_to_location,
        itemDescription: it.itemDescription ?? it.description ?? '—',
        orderQty: Number(it.orderedQty ?? it.orderQty ?? 0),
        orderqty: Number(it.orderedQty ?? it.orderQty ?? it.orderqty ?? 0),
        itemtype: it.itemtype ?? null,
        deliverytype:s?.deliverytype ?? it.deliverytype ?? null,
        openQty: Number(it.openQty ?? 0),
        uom: it.uom,
        receivingQty: qty,
        receivingStatus: it.status,
        lpn: s?.lpn ?? it.lpn ?? '',
        subInventory: s?.subInventory ?? it.subInventory ?? '',
        locator: s?.locator ?? null,
        max_open_qty: Number(it.max_open_qty ?? it.openQty ?? 0),
        imageUri: s?.imageUri ?? it.imageUri ?? null,
      };
    });
    navigation.navigate({
      name: 'Rec_ViewItemDetailsScreen',
      params: {
        items: withLatestFromStore,
        startIndex: startIdx,
        readonly,
        returnTo: 'NewReceiveScreen',
        listType,
      },
      merge: true,
    });
  };

  const visibleItems = useMemo(() => {
    if (!Array.isArray(draftItems) || !draftItems.length) return [];
    let filtered = [];
    if (filter === 'all') filtered = draftItems;
    else if (filter === 'received') {
      filtered = draftItems.filter(it => {
        const r = Number(it?.receivedQty ?? 0);
        const o = Number(it?.orderedQty ?? 0);
        return r >= o && o > 0;
      });
    } else if (filter === 'pending') {
      filtered = draftItems.filter(it => {
        const r = Number(it?.openQty ?? 0);
        // const o = Number(it?.orderedQty ?? 0);
        // console.log(r ,"andddddddd",o);
        return r!=0 ;
      });
    } else {
      filtered = draftItems;
    }

    const enabled = filtered.filter(it => Number(it.openQty) > 0);
    const disabled = filtered.filter(it => Number(it.openQty) === 0);
    return [...enabled, ...disabled];
  }, [draftItems, filter]);

  const handleScan = value => {
    const id = String(value).trim();
    const source = draftItems.find(x => String(x.name) === id);
    if (!source) {
      Toast.show({
        type: 'error',
        text1: 'Unknown barcode',
        text2: `No item with id ${id}`,
        position: 'top',
        visibilityTime: 5000,
      });
      setShowScanner(false);
      return;
    }
    if (source?.openQty === 0) {
      Toast.show({
        type: 'error',
        text1: 'Received',
        text2: 'Received item cannot be scanned',
        position: 'top',
        visibilityTime: 5000,
      });
      setShowScanner(false);
      return;
    }
    if (
      selectedItems.length > 0 &&
      source?.id != null &&
      selectedItems.some(x => x == source?.id)
    ) {
      Alert.alert('Failure', 'Scanned item already added to the list');
      setShowScanner(false);
      return;
    }
    const fullReceiving = Math.max(0, source.openQty ?? 0);
    setSelectedItems(prev => [...prev, source?.id]);
    persistQty(source.id, fullReceiving, source);
    setShowScanner(false);
    Toast.show({
      type: 'success',
      text1: 'Item added from scan',
      text2: `${source.name} (ID: ${id})`,
      position: 'top',
      visibilityTime: 5000,
    });
  };
    const normDeliveryType = v => String(v ?? '').trim().toLowerCase();
    const isDirectDelivery = dt => normDeliveryType(dt) === 'direct delivery';
    const isStandardDelivery = dt => normDeliveryType(dt) === 'standard receipt';
    const isInspectionRequired = dt => normDeliveryType(dt) === 'inspection required';

    const getSelectedDraftItems = (items = []) =>
      (items || []).filter(i => Number(i.qtyToReceive ?? 0) > 0);

    const hasValidLotForLine = line => {
      if (!Array.isArray(line?.lotLines) || line.lotLines.length === 0) return false;

      const total = line.lotLines.reduce((sum, l) => sum + Number(l?.qty ?? 0), 0);
      const target = Number(line?.qtyToReceive ?? 0);

      if (total !== target) return false;

      return line.lotLines.every(l => Number(l?.qty ?? 0) > 0 && !!String(l?.lotNumber ?? '').trim());
      };

      const hasValidSerialForLine = line => {
      if (!Array.isArray(line?.serialLines) || line.serialLines.length === 0) return false;

      const target = Number(line?.qtyToReceive ?? 0);
      if (!Number.isFinite(target) || target <= 0) return false;

      // Common rule: serial count must match receiving qty
      if (line.serialLines.length !== target) return false;

      return line.serialLines.every(s => !!String(s?.serialNumber ?? s?.serial ?? '').trim());
      };

      const hasValidLotSerialForLine = line => {
      // 1) Must have lot lines
      if (!Array.isArray(line?.lotLines) || line.lotLines.length === 0) return false;

      const target = Number(line?.qtyToReceive ?? 0);
      const lotTotal = line.lotLines.reduce((sum, l) => sum + Number(l?.qty ?? 0), 0);
      if (lotTotal !== target) return false;

      // 2) Each lot must be valid and its serials count must match that lot qty
      return line.lotLines.every(l => {
        const lotNoOk = !!String(l?.lotNumber ?? '').trim();
        const lotQty = Number(l?.qty ?? 0);
        if (!lotNoOk || !Number.isFinite(lotQty) || lotQty <= 0) return false;

        const serials = Array.isArray(l?.serials) ? l.serials : Array.isArray(l?.serialLines) ? l.serialLines : [];
        if (!serials || serials.length !== lotQty) return false;

        return serials.every(s => !!String(s?.serialNumber ?? s?.serial ?? '').trim());
      });
      };

      const isLineItemTypeValidForDirect = line => {
      const t = String(line?.itemtype ?? '').trim();

      if (t === 'Lot') return hasValidLotForLine(line);
      if (t === 'Serial') return hasValidSerialForLine(line);
      if (t === 'Lot+Serial') return hasValidLotSerialForLine(line);

      // If itemtype is null / normal item => no lot/serial validation required
      return true;
      };

      const isLineValidForReceive = line => {
      const qty = Number(line?.qtyToReceive ?? 0);
      if (!Number.isFinite(qty) || qty <= 0) return false;

      const dt = line?.deliverytype;

      // Standard & Inspection required:
      // - qty > 0 only
      // - LPN not mandatory
      // - subInventory/locator not required
      if (isStandardDelivery(dt) || isInspectionRequired(dt)) {
        return true;
      }

      // Direct delivery:
      // - qty > 0
      // - subInventory mandatory
      // - lot/serial data mandatory based on itemtype
      if (isDirectDelivery(dt)) {
        const subInvOk = !!String(line?.subInventory ?? '').trim();
        if (!subInvOk) return false;
        return isLineItemTypeValidForDirect(line);
      }

      // Unknown delivery type => be safe and block receive
      return false;
      };

      const canReceiveByDeliveryType = (items = []) => {
      const selected = getSelectedDraftItems(items);
      if (selected.length === 0) return false;
      return selected.every(isLineValidForReceive);
      };



  const hasAnyItems = useMemo(() => selectedItems.length > 0, [selectedItems]);
  const canReceive = hasAnyItems && canReceiveByDeliveryType(draftItems);


  const Releasefunction = async () => {
    // const { currentPO, lockedByUser } = getCurrentPO();
    // if (currentPO && !lockedByUser) {
    //   setPhase('loading');
    //   try {
    //     const release = await ReleasePO(currentPO);
    //     if (release) {
    //       setPhase('success');
    //       clearCurrentPO();
    //       navigation.navigate('Receive');
    //       return true;
    //     } else {
    //       Toast.show({
    //         type: 'error',
    //         text1: 'Error',
    //         text2: 'Failed to Release PO. Please try again.',
    //         position: 'top',
    //         visibilityTime: 5000,
    //       });
    //     }
    //   } catch (error) {
    //     setPhase('error');
    //     Toast.show({
    //       type: 'error',
    //       text1: 'Error',
    //       text2: `${error}`,
    //       position: 'top',
    //       visibilityTime: 5000,
    //     });
    //   }
    // } else {
    //   setPhase('error');
    //   clearCurrentPO();
    //   navigation.navigate('Receive');
    //   return true;
    // }
          // setPhase('success');
          clearCurrentPO();
          navigation.navigate('Receive');
          return true;
  };

  return (
    <SafeAreaView style={styles.container}>
      <GlobalHeaderComponent
        organizationName={OrgData?.selectedOrgCode}
        screenTitle="Receiving"
        notificationCount={0}
        onBack={() => Releasefunction()}
      />
      {phase === 'loading' && (
        <View style={styles.loaderWrapper}>
          <ActivityIndicator size="large" color="#233E55" />
        </View>
      )}
      {phase !== 'loading' && (
        <>
          <ScrollView contentContainerStyle={styles.contentContainer}>
            <POinfoCardComponent
              receiptNumber={poHeader?.purchaseReceipt || '—'}
              supplier={poHeader?.supplier || '—'}
              poNumber={poHeader?.poNumber || '—'}
              receiptDate={poHeader?.poDate || '—'}
            />
            <View style={styles.itemcontainer}>
              <TouchableOpacity
                style={styles.scanRow}
                onPress={() => setShowScanner(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.scanText}>Scan more item</Text>
                <BarcodeScannerIcon width={20} height={20} fill="#7A7A7A" />
              </TouchableOpacity>
              <View style={styles.tableHeader}>
                <TableHeaderComponent
                  allSelected={
                    selectedItems.length === draftItems.length &&
                    draftItems.every(d => Number(d.qtyToReceive ?? 0) > 0)
                  }
                  onToggleAll={() => {
                    const selecting = !(
                      selectedItems.length === draftItems.length &&
                      draftItems.every(d => Number(d.qtyToReceive ?? 0) > 0)
                    );
                    if (!selecting) {
                      setSelectedItems([]);
                      setDraftItems(prev =>
                        prev.map(it => ({ ...it, qtyToReceive: 0 }))
                      );
                      draftItems.forEach(it => persistQty(it.id, 0, it));
                      return;
                    }
                    const next = draftItems.map(it => {
                      const limit = it.max_open_qty;
                      const useQty = clampToLimit(it.openQty, limit);
                      return { ...it, qtyToReceive: useQty };
                    });
                    setDraftItems(next);
                    setSelectedItems(
                      next
                        .filter(x => Number(x.qtyToReceive ?? 0) > 0)
                        .map(x => x.id)
                    );
                    next.forEach(it => persistQty(it.id, it.qtyToReceive, it));
                  }}
                  activeFilter={filter}
                  onChangeFilter={setFilter}
                />
              </View>
              <FlatList
                data={visibleItems}
                keyExtractor={item => String(item.id)}
                renderItem={({ item, index }) => (
                  <View style={styles.lineItemWrapper}>
                    <LineItemListCardComponent
                      item={item}
                      index={index}
                      isSelected={selectedItems.includes(item.id)}
                      onCheckToggle={handleCheckToggle}
                      onQtyChange={handleQtyChange}
                      onViewDetails={() =>
                        goToLineItemDetails(index, draftItems, false, 'line')
                      }
                    />
                  </View>
                )}
                scrollEnabled={false}
              />
            </View>
          </ScrollView>
          <FooterButtonsComponent
            leftLabel="Save"
            rightLabel="Receive"
            onLeftPress={hasAnyItems ? () => { commitDraftToStore(); handlesave(); } : undefined}
            onRightPress={ handleReceive}
            leftEnabled={hasAnyItems}
            rightEnabled={true}
          />
          <Modal visible={showScanner} animationType="slide">
            <BarcodeScanner onScan={handleScan} onClose={() => setShowScanner(false)} />
          </Modal>
          <Modal
            visible={saveModalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => {}}
          >
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(0,0,0,0.4)',
              }}
            >
              <View
                style={{
                  backgroundColor: 'white',
                  borderRadius: 12,
                  padding: 24,
                  alignItems: 'center',
                  width: '80%',
                }}
              >
                {saveModalStatus === 'success' ? (
                  <ConfirmSvg width={72} height={72} />
                ) : (
                  <FailureSvg width={72} height={72} />
                )}
                <Text
                  style={{
                    marginTop: 16,
                    textAlign: 'center',
                    fontSize: 16,
                    color: '#333',
                  }}
                >
                  {saveModalStatus === 'success'
                    ? 'Order Saved Successfully. Please continue Receipt.'
                    : 'Save failed. Please try again.'}
                </Text>
              </View>
            </View>
          </Modal>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: '#F6F8FA', flex: 1 },
  loaderWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  contentContainer: { paddingBottom: 120 },
  itemcontainer: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 12,
    paddingTop: 8,
    paddingBottom: 6,
    elevation: 2,
  },
  tableHeader: { marginBottom: 10, marginTop: 8 },
  lineItemWrapper: { marginBottom: 12 },
  scanRow: {
    backgroundColor: '#FFFFFF',
    borderColor: '#00000040',
    borderWidth: 1,
    borderRadius: 10,
    height: 40,
    marginHorizontal: 15,
    marginTop: 6,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scanText: { color: '#242424' },
});

export default NewReceiveScreen;
