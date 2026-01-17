import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { FlatList, SafeAreaView, ScrollView, StyleSheet, View, Text, Modal, BackHandler, ActivityIndicator, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import GlobalHeaderComponent from '../components/GlobalHeaderComponent';
import POinfoCardComponent from '../components/POinfoCardComponent';
import ConfirmLineItemComponent from '../components/ConfirmLineItemComponent';
import FooterButtonsComponent from '../components/FooterButtonsComponent';
import SummaryTabHdrComponent from '../components/SummaryTabHdrComponent';
import ConfirmModalComponent from '../components/ConfirmModalComponent';
import Toast from 'react-native-toast-message';
import { createOrderReceipt } from '../api/mockApi';
import { useReceivingStore } from '../store/receivingStore';
import { Submit_Receive_Qty, Save_Receive_Qty } from '../api/ApiServices';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ConfirmSvg from '../assets/icons/success.svg';
import FailureSvg from '../assets/icons/failure.svg';
import DeleteSvg from '../assets/icons/delete.svg';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import { getCurrentPO } from '../api/posession';

const receivedData = [
  { id: '1', purchaseReceipt: 'PR-00002', poNumber: 'PO-00002', supplier: '3DIng', receivedDate: '21 Jul 2025', status: 'Fully Received' },
  { id: '2', purchaseReceipt: 'PR-00003', poNumber: 'PO-00003', supplier: 'TechNerds', receivedDate: '22 Jul 2025', status: 'Partially Received' },
  { id: '3', purchaseReceipt: 'PR-00004', poNumber: 'PO-00004', supplier: 'CreativeTools', receivedDate: '23 Jul 2025', status: 'Fully Received' },
  { id: '4', purchaseReceipt: 'PR-00005', poNumber: 'PO-00005', supplier: 'BuildCorp', receivedDate: '24 Jul 2025', status: 'Fully Received' },
];

const defaultReceiptItems = [
  { id: 'a', name: 'Lorem Impusum', description: 'Lorem ipsum dolor sit amet…', orderedQty: 100, receivedQty: 100, openQty: 0, promisedDate: '22/07/2025', needByDate: '24/07/2025', lpn: 'LPN1', subInventory: 'SUBINVENTORY1', locator: 'LOCATOR1' },
  { id: 'b', name: 'Impusum', description: 'Lorem ipsum dolor sit amet…', orderedQty: 150, receivedQty: 150, openQty: 0, promisedDate: '22/07/2025', needByDate: '24/07/2025', lpn: 'LPN2', subInventory: 'SUBINVENTORY2', locator: 'LOCATOR2' },
  { id: 'c', name: 'Des Impusum', description: 'dolor ipsum dolor sit amet…', orderedQty: 200, receivedQty: 200, openQty: 0, promisedDate: '22/07/2025', needByDate: '24/07/2025', lpn: 'LPN3', subInventory: 'SUBINVENTORY3', locator: 'LOCATOR3' },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ACTION_WIDTH = SCREEN_WIDTH * 0.8;
const rs = v => (SCREEN_WIDTH / ACTION_WIDTH) * v;

const ReceiveSummaryScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const [openItems, setOpenItems] = useState(new Set());
  const [profileName, setProfileName] = useState('');
  const [deletedIds, setDeletedIds] = useState([]);
  const readonly = !!route?.params?.readonly;
  const printcopies = route?.params?.copies || '0';
  console.log(printcopies, "printcopiesprintcopiesprintcopiesprintcopies")
  const listTypeFromRoute = route?.params?.listType || 'line';
  console.log(listTypeFromRoute, "listTypeFromRoutelistTypeFromRoutelistTypeFromRoute")
  const headerFromRoute = route?.params?.header || null;
  const purchaseReceipt = route?.params?.purchaseReceipt;
  const { currentPO } = getCurrentPO();
  const sourceId = route?.params?.id ? String(route.params.id) : null;
  const Interface_Id = route?.params?.interface_id ? route.params.interface_id : null;
  const passedItems = Array.isArray(route?.params?.selectedItems) ? route.params.selectedItems : [];

  const {
    poHeader,
    setPoHeader,
    receiveItems,
    summaryItems,
    initSummaryItems,
    mergePatchIntoSummaryItems,
    mergePatchIntoReceiveItems,
    resetReceiving,
    OrgData,
  } = useReceivingStore();

  const [printlabel, setprintlabel] = useState(true);
  const [labelprinted, setlabelprinted] = useState(true);

  const [draft, setDraft] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  const [lastReceiptPayload, setLastReceiptPayload] = useState(null);
  const [confirmDeliveryType, setConfirmDeliveryType] = useState('Inspection required');


  const didCompleteRef = useRef(false);

  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [saveModalStatus, setSaveModalStatus] = useState('success');

  const didsaveCompleteRef = useRef(false);

  const handledPatchIdsRef = useRef(new Set());
  const initializedRef = useRef(false);

  const handleSwipeOpen = useCallback(id => {
    setOpenItems(prev => {
      if (prev.has(id)) return prev;
      const newSet = new Set(prev);
      newSet.add(id);
      return newSet;
    });
  }, []);

  const handleSwipeClose = useCallback(id => {
    setOpenItems(prev => {
      if (!prev.has(id)) return prev;
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      didCompleteRef.current = false;
      return () => { };
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (modalVisible) {
          setModalVisible(false);
          return true;
        }
        if (saveModalVisible) {
          setSaveModalVisible(false);
          return true;
        }
        if (listTypeFromRoute === 'Received') {
          navigation.navigate('Receive');
        } else {
          navigation.navigate('NewReceiveScreen');
        }
        return true;
      };
      const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => sub.remove();
    }, [navigation, modalVisible, listTypeFromRoute, saveModalVisible])
  );

  useEffect(() => {
    if (poHeader) return;
    if (headerFromRoute) {
      setPoHeader(headerFromRoute);
      return;
    }
    if (readonly) {
      let rec = null;
      if (sourceId) rec = receivedData.find(r => r.id === sourceId);
      if (!rec) {
        const poNo =
          route?.params?.header?.poNumber || route?.params?.poNumber || null;
        if (poNo) rec = receivedData.find(r => r.poNumber === poNo);
      }
      if (rec) {
        setPoHeader({
          purchaseReceipt: rec.purchaseReceipt,
          supplier: rec.supplier,
          poNumber: rec.poNumber,
          poDate: rec.receivedDate,
        });
      }
    }
  }, [poHeader, headerFromRoute, readonly, sourceId, setPoHeader, route?.params?.header?.poNumber, route?.params?.poNumber]);

  useEffect(() => {
    if (initializedRef.current) return;
    if (readonly) {
      setDraft(passedItems.length ? passedItems : defaultReceiptItems);
    } else if (Array.isArray(receiveItems) && receiveItems.length > 0) {
      setDraft(receiveItems);
    } else if (Array.isArray(passedItems) && passedItems.length > 0) {
      setDraft(passedItems);
      initSummaryItems(passedItems);
    } else if (Array.isArray(summaryItems) && summaryItems.length > 0) {
      setDraft(summaryItems);
    }
    initializedRef.current = true;
  }, [readonly, receiveItems, passedItems, summaryItems, initSummaryItems]);

  const patch = route?.params?.patch;

  useEffect(() => {
    const patchId = patch?.id != null ? String(patch.id) : null;
    if (!patchId || handledPatchIdsRef.current.has(patchId)) return;
    handledPatchIdsRef.current.add(patchId);
    setDraft(prev =>
      prev.map(it =>
        String(it.id) === patchId
          ? {
            ...it,
            qtyToReceive:
              typeof patch.receivingQty === 'number'
                ? patch.receivingQty
                : it.qtyToReceive,
            lpn: patch.lpn ?? it.lpn,
            subInventory: patch.subInventory ?? it.subInventory,
            locator: patch.locator ?? it.locator,
          }
          : it
      )
    );
    mergePatchIntoSummaryItems(patch);
    mergePatchIntoReceiveItems(patch);
    const t = setTimeout(() => navigation.setParams({ patch: undefined }), 0);
    return () => clearTimeout(t);
  }, [patch?.id, patch, mergePatchIntoSummaryItems, mergePatchIntoReceiveItems, navigation]);


  const normDeliveryType = v => String(v ?? '').trim().toLowerCase();
  const isDirectDelivery = dt => normDeliveryType(dt) === 'direct delivery';
  const isStandardDelivery = dt => normDeliveryType(dt) === 'standard receipt';
  const isInspectionRequired = dt => normDeliveryType(dt) === 'inspection required';

  const hasAnyDeliveryType = dt => !!String(dt ?? '').trim();

  const hasValidLotForLine = line => {
    if (!Array.isArray(line?.lotLines) || line.lotLines.length === 0) return false;

    const total = line.lotLines.reduce((sum, l) => sum + Number(l?.qty ?? 0), 0);
    const target = Number(line?.qtyToReceive ?? line?.receivingQty ?? 0);

    if (!Number.isFinite(target) || target <= 0) return false;
    if (total !== target) return false;

    return line.lotLines.every(
      l => Number(l?.qty ?? 0) > 0 && !!String(l?.lotNumber ?? '').trim()
    );
  };

  const hasValidSerialForLine = line => {
    if (!Array.isArray(line?.serialLines) || line.serialLines.length === 0) return false;

    const target = Number(line?.qtyToReceive ?? line?.receivingQty ?? 0);
    if (!Number.isFinite(target) || target <= 0) return false;

    if (line.serialLines.length !== target) return false;

    return line.serialLines.every(s =>
      !!String(s?.serialNumber ?? s?.serial ?? '').trim()
    );
  };

  const hasValidLotSerialForLine = line => {
    if (!Array.isArray(line?.lotLines) || line.lotLines.length === 0) return false;

    const target = Number(line?.qtyToReceive ?? line?.receivingQty ?? 0);
    if (!Number.isFinite(target) || target <= 0) return false;

    const lotTotal = line.lotLines.reduce((sum, l) => sum + Number(l?.qty ?? 0), 0);
    if (lotTotal !== target) return false;

    return line.lotLines.every(l => {
      const lotNoOk = !!String(l?.lotNumber ?? '').trim();
      const lotQty = Number(l?.qty ?? 0);
      if (!lotNoOk || !Number.isFinite(lotQty) || lotQty <= 0) return false;

      const serials = Array.isArray(l?.serials)
        ? l.serials
        : Array.isArray(l?.serialLines)
          ? l.serialLines
          : [];

      if (!serials || serials.length !== lotQty) return false;

      return serials.every(s => !!String(s?.serialNumber ?? s?.serial ?? '').trim());
    });
  };

  const isLineItemTypeValidForDirect = line => {
    const t = String(line?.itemtype ?? '').trim();
    if (t === 'Lot') return hasValidLotForLine(line);
    if (t === 'Serial') return hasValidSerialForLine(line);
    if (t === 'Lot+Serial') return hasValidLotSerialForLine(line);
    return true; // normal item => no lot/serial requirement
  };

  const isLineValidForConfirm = line => {
    const qty = Number(line?.qtyToReceive ?? line?.receivingQty ?? 0);
    if (!Number.isFinite(qty) || qty <= 0) return false;

    const dt = line?.deliverytype;

    // deliverytype must be present
    if (!hasAnyDeliveryType(dt)) return false;

    // Standard / Inspection required:
    // - qty > 0
    // - LPN optional
    // - subInventory optional
    // - locator optional
    // - no lot/serial enforcement
    if (isStandardDelivery(dt) || isInspectionRequired(dt)) {
      return true;
    }

    // Direct delivery:
    // - qty > 0
    // - subInventory mandatory
    // - lot/serial mandatory based on itemtype
    if (isDirectDelivery(dt)) {
      const subInvOk = !!String(line?.subInventory ?? '').trim();
      if (!subInvOk) return false;
      return isLineItemTypeValidForDirect(line);
    }

    // unknown delivery type => block
    return false;
  };

  const getConfirmEligibleLines = (items = []) => {
    return (items || []).filter(isLineValidForConfirm);
  };


  const headerData = useMemo(
    () =>
      poHeader || {
        purchaseReceipt: '—',
        supplier: '—',
        poNumber: '—',
        poDate: '—',
      },
    [poHeader]
  );

  const formatDateToYMD = (dateStr) => {
    if (!dateStr) return null;

    const [dd, mm, yyyy] = dateStr.split('/');
    return `${yyyy}-${mm}-${dd}`;
  };

  const mapConfirmLots = (data) => {
    return data.map(backend => ({
      "lot_number": backend?.lotNumber,
      "transaction_quantity": backend?.qty,
      "lot_expiration_date": formatDateToYMD(backend?.expDate)
    }));
  }

  const mapConfirmData = data => {
    return (data || []).map(backend => {
      const dt = backend?.deliverytype;

      const subInvId =
        backend?.subInventory?.id != null ? backend.subInventory.id : null;
      const subInvCode =
        backend?.subInventory?.name != null ? backend.subInventory.name : null;

      const locatorId =
        backend?.locator?.id != null ? backend.locator.id : null;
      const locatorCode =
        backend?.locator?.name != null ? backend.locator.name : null;

      const lpnNumber =
        backend?.lpn?.id != null ? backend.lpn.id : null;

      const base = {
        po_id: currentPO,
        po_number: poHeader?.poNumber,

        po_line_id: backend?.po_line_id,
        po_line_num: backend?.po_line_number,

        item_id: backend?.item_id,
        item_code: backend?.name,

        org_id: backend?.org_id,
        org_code: backend?.org_code,
        business_unit: OrgData?.BusinessName,
        supplier_name: poHeader?.supplier,

        uom_code: backend?.uomCode,
        uom: backend?.uom,

        source_doc_code: 'PO',
        received_qty: Number(backend?.qtyToReceive ?? backend?.receivingQty ?? 0),
        delivery_type: dt,

        lot_item_lots: Array.isArray(backend?.lotLines) ? mapConfirmLots(backend.lotLines) : [],
      };

      // Include optional fields only if available (Standard/Inspection optional, Direct already validated)
      if (subInvId != null) base.sub_inv_id = subInvId;
      if (subInvCode != null) base.sub_inv_code = subInvCode;

      if (locatorId != null) base.locator_id = locatorId;
      if (locatorCode != null) base.locator_code = locatorCode;

      // LPN optional for all (your current rule)
      if (lpnNumber != null) base.lpn_number = lpnNumber;

      return base;
    });
  };

  const pickConfirmDeliveryType = (lines = []) => {
    const norm = v => String(v ?? '').trim().toLowerCase();

    // If any line is inspection required -> Inspection required
    if (lines.some(l => norm(l?.deliverytype) === 'inspection required')) return 'Inspection required';

    // If any line is standard receipt -> Standard receipt
    if (lines.some(l => norm(l?.deliverytype) === 'standard receipt')) return 'Standard receipt';

    // else treat as Direct delivery (no post question)
    return 'Direct delivery';
  };

  const openConfirmModal = () => {
    const eligibleLines = getConfirmEligibleLines(renderItems);
    const dt = pickConfirmDeliveryType(eligibleLines);
    setConfirmDeliveryType(dt);
    setModalVisible(true);
  };




  const confirmAction = async () => {
    console.log(renderItems, "renderItemsrenderItemsrenderItemsrenderItems")
    const eligibleLines = getConfirmEligibleLines(renderItems);

    if (!eligibleLines.length) {
      Toast.show({
        type: 'error',
        text1: 'Invalid items',
        text2: 'No eligible lines to confirm. Please check Delivery Type, Qty, Sub Inventory and Lot/Serial data.',
        position: 'top',
        visibilityTime: 5000,
      });
      return { success: false, message: 'No eligible lines to confirm' };
    }

    console.log(eligibleLines, "eligibleLines");
    const formatdata = mapConfirmData(eligibleLines);

    console.log(formatdata, "mapConfirmDatamapConfirmData");
    try {
      const response = await Submit_Receive_Qty(formatdata);
      console.log(response, "Submit_Receive_Qty");
      if (response?.status == "SUCCESS") {
        // Extract receipt_num safely from possible shapes
        const receipt_num =
          response?.receipt_num ??
          response?.receiptNumber ??
          response?.data?.receipt_num ??
          response?.data?.receiptNumber ??
          response?.results?.receipt_num ??
          null;

        const supplier_name =
          response?.supplier_name ??
          response?.data?.supplier_name ??
          poHeader?.supplier ??
          '—';

        const po_number =
          response?.po_number ??
          response?.data?.po_number ??
          poHeader?.poNumber ??
          '—';

        // receipt_date not available now -> '-'
        const received_date = response?.received_date ?? response?.data?.received_date ?? '-';

        // store for navigation usage
        setLastReceiptPayload({ receipt_num, supplier_name, po_number, received_date });

        // decide which post question text to show
        const dt = pickConfirmDeliveryType(eligibleLines);
        setConfirmDeliveryType(dt);

        console.log(setConfirmDeliveryType, "setConfirmDeliveryTypesetConfirmDeliveryTypesetConfirmDeliveryType");

        return {
          success: true,
          receipt_num,
          item: { supplier_name, po_number, received_date },
        };
      }

      return {
        success: false,
        message: response?.message || 'Failed to create order receipt',
      };
    } catch (err) {
      return {
        success: false,
        message: err.detail?.[0].msg || 'Network error. Please try again.',
      };
    }
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
      const payload = mapConfirmSaveData(receiveItems);
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

  const renderItems = useMemo(() => {
    if (!readonly && Array.isArray(receiveItems) && receiveItems.length > 0) {
      return receiveItems.filter(
        it => Number(it?.qtyToReceive ?? it?.receivingQty ?? 0) > 0
      );
    }
    if (Array.isArray(summaryItems) && summaryItems.length > 0) return summaryItems;
    if (Array.isArray(draft) && draft.length > 0) return draft;
    return [];
  }, [readonly, receiveItems, summaryItems, draft]);

  const qtyFor = useCallback(
    it => {
      const inReceive = Array.isArray(receiveItems)
        ? receiveItems.find(x => String(x.id) === String(it.id))
        : null;
      const inSummary = Array.isArray(summaryItems)
        ? summaryItems.find(x => String(x.id) === String(it.id))
        : null;
      const q =
        inReceive?.qtyToReceive ??
        inReceive?.receivingQty ??
        inSummary?.qtyToReceive ??
        inSummary?.receivingQty ??
        it?.qtyToReceive ??
        0;
      return Number(q);
    },
    [receiveItems, summaryItems]
  );

  useFocusEffect(
    useCallback(() => {
      const hasLive = Array.isArray(receiveItems) && receiveItems.length > 0;
      const nonePassed = !Array.isArray(passedItems) || passedItems.length === 0;
      const noneSummary = !Array.isArray(summaryItems) || summaryItems.length === 0;
      if (!readonly && !hasLive && nonePassed && noneSummary) {
        if (listTypeFromRoute === 'Received') {
          navigation.replace('Receive');
        } else {
          navigation.replace('NewReceiveScreen', {
            listType: listTypeFromRoute || 'line',
          });
        }
      }
    }, [readonly, receiveItems, passedItems, summaryItems, listTypeFromRoute, navigation])
  );

  const handleCancel = () => setModalVisible(false);

  const handleSuccess = () => {
    if (didCompleteRef.current) return;
    didCompleteRef.current = true;
    setModalVisible(false);
    resetReceiving();
    navigation.navigate('Receive');
  };

  const handleFailure = () => {
    setModalVisible(false);
  };


  const openLineDetailsFromSummary = item => {
    const source = renderItems;
    const idx = Math.max(source.findIndex(x => String(x.id) === String(item.id)), 0);

    // Same data-flow as NewReceiveScreen -> goToLineItemDetails
    const withLatestFromStore = source.map((it, i) => {
      const s = Array.isArray(receiveItems)
        ? receiveItems.find(r => String(r.id) === String(it.id))
        : null;

      const qty = Number(s?.qtyToReceive ?? s?.receivingQty ?? it.qtyToReceive ?? 0);

      return {
        id: String(it.id),
        poNumber: headerData.poNumber ?? '—',
        lineNumber: i + 1,

        itemName: it.name,
        po_line_id: it.po_line_id,
        po_line_number: it.po_line_number,
        itemid: it.item_id,

        ship_to_location: it.ship_to_location,
        itemDescription: it.itemDescription ?? it.description ?? '—',

        orderQty: Number(it.orderedQty ?? it.orderQty ?? 0),
        orderqty: Number(it.orderedQty ?? it.orderQty ?? it.orderqty ?? 0),

        itemtype: it.itemtype ?? null,
        deliverytype: s?.deliverytype ?? it.deliverytype ?? null,

        openQty: Number(it.openQty ?? 0),
        uom: it.uom,

        receivingQty: qty,
        receivingStatus: it.status,

        lpn: s?.lpn ?? it.lpn ?? '',
        subInventory: s?.subInventory ?? it.subInventory ?? '',
        locator: s?.locator ?? it.locator ?? null,

        max_open_qty: Number(it.max_open_qty ?? it.openQty ?? 0),
        imageUri: s?.imageUri ?? it.imageUri ?? null,
      };
    });

    navigation.navigate({
      name: 'Rec_ViewItemDetailsScreen',
      params: {
        items: withLatestFromStore,
        startIndex: idx,
        readonly,
        returnTo: 'ReceiveSummaryScreen',
        listType: listTypeFromRoute,
      },
      merge: true,
    });
  };


  const renderRightActions = onDelete => {
    return (
      <View style={styles.deleteContainer}>
        <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
          <DeleteSvg width={30} height={30} />
        </TouchableOpacity>
      </View>
    );
  };

  const formatToday = () => {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleDelete = itemId => {
    setDeletedIds(prev => [...prev, itemId]);

    if (!readonly && Array.isArray(receiveItems) && receiveItems.length > 0) {
      useReceivingStore.setState({
        receiveItems: receiveItems.map(it =>
          String(it.id) === String(itemId)
            ? {
              ...it,
              subInventory: OrgData?.selectedinventory,
              qtyToReceive: 0,
              locator: OrgData?.selectedOrg,
            }
            : it
        ),
      });
      return;
    }

    if (Array.isArray(summaryItems) && summaryItems.length > 0) {
      useReceivingStore.setState({
        summaryItems: summaryItems.map(it =>
          String(it.id) === String(itemId)
            ? {
              ...it,
              subInventory: OrgData?.selectedinventory,
              qtyToReceive: 0,
              locator: OrgData?.selectedOrg,
            }
            : it
        ),
      });
      return;
    }

    if (Array.isArray(draft) && draft.length > 0) {
      setDraft(prev =>
        prev.map(it =>
          String(it.id) === String(itemId)
            ? {
              ...it,
              subInventory: OrgData?.selectedinventory,
              qtyToReceive: 0,
              locator: OrgData?.selectedOrg,
            }
            : it
        )
      );
      return;
    }
  };

  const filteredItems = renderItems.filter(item => !deletedIds.includes(item.id));

  useFocusEffect(
    useCallback(() => {
      if (filteredItems.length === 0) {
        if (listTypeFromRoute === 'Received') {
          navigation.navigate('Receive');
        } else {
          navigation.navigate('NewReceiveScreen');
        }
      }
    }, [filteredItems, listTypeFromRoute, navigation])
  );

  const TogglePill = ({ Rightlabel,Leftlabel, value, onToggle }) => {
    return (
      <TouchableOpacity activeOpacity={0.9} onPress={onToggle}>
        <View style={[styles.toggleTrack, { backgroundColor: value ? '#168035' : '#233E55' }]}>
          {value ? (
            <>
              <Text style={[styles.toggleText, styles.textLeft]}>{Leftlabel}</Text>
              <View style={[styles.toggleDot, styles.dotOn]} />
            </>
          ) : (
            <>
              <View style={[styles.toggleDot, styles.dotOff]} />
              <Text style={[styles.toggleText, styles.textRight]}>{Rightlabel}</Text>
            </>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <GlobalHeaderComponent
        organizationName={
          useReceivingStore.getState()?.OrgData?.selectedOrgCode ||
          OrgData?.selectedOrgCode
        }
        screenTitle="Receiving"
        notificationCount={0}
        onBack={() => {
          if (listTypeFromRoute === 'Received') {
            navigation.navigate('Receive');
          } else {
            navigation.navigate('NewReceiveScreen');
          }
        }}
      />

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <POinfoCardComponent
          receiptNumber={purchaseReceipt}
          supplier={headerData.supplier}
          poNumber={headerData.poNumber}
          receiptDate={headerData.poDate}
        />

        <View style={styles.itemcontainer}>
          <Text style={styles.itemName}>Items Summary</Text>

          <View style={styles.toggleGroup}>
            <TogglePill Leftlabel="Label Printed" Rightlabel="Print Label" value={printlabel} onToggle={() => setprintlabel(v => !v)} />
          </View>

          <View style={styles.tableHeader}>
            <SummaryTabHdrComponent />
          </View>

          <FlatList
            data={filteredItems}
            keyExtractor={item => String(item.id)}
            renderItem={({ item }) => (
              <GestureHandlerRootView>
                <Swipeable
                  renderRightActions={() => renderRightActions(() => handleDelete(item.id))}
                  onSwipeableOpen={() => handleSwipeOpen(item.id)}
                  onSwipeableClose={() => handleSwipeClose(item.id)}
                  onSwipeableOpenStartDrag={() => handleSwipeOpen(item.id)}
                  onSwipeableCloseStartDrag={() => handleSwipeClose(item.id)}
                >
                  <View style={[styles.lineItemWrapper]}>
                    <ConfirmLineItemComponent
                      item={item}
                      qtyLabel={item.uom}
                      qtyValue={
                        readonly
                          ? Number(item.orderedQty ?? item.receivedQty ?? qtyFor(item))
                          : qtyFor(item)
                      }
                      readOnly
                      isSwipe={openItems.has(item.id)}
                      onViewDetails={() => openLineDetailsFromSummary(item)}
                    />
                  </View>
                </Swipeable>
              </GestureHandlerRootView>
            )}
            scrollEnabled={false}
            ListEmptyComponent={<View style={{ height: 16 }} />}
          />
        </View>
      </ScrollView>

      {!readonly && (
        <>
          <FooterButtonsComponent
            leftLabel="Save"
            rightLabel="Confirm"
            onLeftPress={() => {
              handlesave();
            }}
            onRightPress={openConfirmModal}
            leftEnabled
            rightEnabled
          />
          <ConfirmModalComponent
            visible={modalVisible}
            title="Confirmation"
            message="Are you sure want to receive this Purchase Order?"
            deliveryType={confirmDeliveryType}
            confirmAction={confirmAction}

            // YES on postSuccess -> navigate to ReceivedSummaryScreen with required params
            onInspect={(payloadFromModal) => {
              const receipt_num =
                payloadFromModal?.receipt_num ??
                lastReceiptPayload?.receipt_num ??
                null;

              const supplier_name =
                payloadFromModal?.item?.supplier_name ??
                lastReceiptPayload?.supplier_name ??
                '—';

              const po_number =
                payloadFromModal?.item?.po_number ??
                lastReceiptPayload?.po_number ??
                poHeader?.poNumber ??
                '—';

              navigation.navigate('ReceivedSummaryScreen', {
                readonly: true,
                id: receipt_num,
                poNumber: po_number ?? null,
                listType: 'Received',
                header: {
                  receiptNumber: receipt_num,
                  supplier: supplier_name,
                  poNumber: po_number ?? '—',
                  receiptDate: '-', // future: from API response
                },
                selectedItems: [],
              });
            }}

            onPutaway={(payloadFromModal) => {
              const receipt_num =
                payloadFromModal?.receipt_num ??
                lastReceiptPayload?.receipt_num ??
                null;

              const supplier_name =
                payloadFromModal?.item?.supplier_name ??
                lastReceiptPayload?.supplier_name ??
                '—';

              const po_number =
                payloadFromModal?.item?.po_number ??
                lastReceiptPayload?.po_number ??
                poHeader?.poNumber ??
                '—';

              navigation.navigate('ReceivedSummaryScreen', {
                readonly: true,
                id: receipt_num,
                poNumber: po_number ?? null,
                listType: 'Received',
                header: {
                  receiptNumber: receipt_num,
                  supplier: supplier_name,
                  poNumber: po_number ?? '—',
                  receiptDate: '-', // future: from API response
                },
                selectedItems: [],
              });
            }}

            // keep if you still need putaway later (not used now but preserved)

            onCancel={handleCancel}
            onSuccess={handleSuccess}
            onFailure={handleFailure}
          />

          <Modal
            visible={saveModalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => { }}
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
  contentContainer: { paddingBottom: 120 },
  tableHeader: { marginTop: 8, marginBottom: 10 },
  lineItemWrapper: { marginBottom: 12 },
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
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginHorizontal: 12,
    marginStart: 18,
    marginTop: 3,
    paddingTop: 3,
  },
  deleteContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    backgroundColor: '#F8D2D4',
    borderRadius: 10,
    marginBottom: 13,
    marginRight: 20,
  },
  deleteButton: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  toggleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginEnd: rs(10), 
    alignSelf: 'flex-end'
  },
  toggleText: {
    fontSize: 10,
    fontWeight: '400',
    color: '#FFFFFF',
    paddingLeft: rs(5),
    paddingRight: rs(5),
  },
  toggleTrack: {
    width: rs(72),
    height: rs(20),
    borderRadius: rs(18),
    paddingHorizontal: rs(3),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleDot: {
    width: rs(14),
    height: rs(14),
    borderRadius: rs(20),
    backgroundColor: '#FFFFFF',
  },
  dotOn: {},
  dotOff: {},
  textLeft: {
    textAlign: 'left',
    flex: 1,
  },
  textRight: {
    textAlign: 'right',
    flex: 1,
  },
});

export default ReceiveSummaryScreen;
