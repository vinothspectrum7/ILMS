import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import {
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  Text,
  BackHandler,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import GlobalHeaderComponent from '../components/GlobalHeaderComponent';
import POinfoCardComponent from '../components/POinfoCardComponent';
import ReceivedLineitemComponent from '../components/ReceivedLineitemComponent';
import Toast from 'react-native-toast-message';
import { useReceivingStore } from '../store/receivingStore';
import { GetSingleReceipt } from '../api/ApiServices';
import SummaryTabHdrsComponent from '../components/ReceivedSummaryheader';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BASE_WIDTH = 375;
const rs = v => (SCREEN_WIDTH / BASE_WIDTH) * v;

const ReceivedSummaryScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const readonly = !!route?.params?.readonly;
  const listTypeFromRoute = route?.params?.listType || 'line';
  const headerFromRoute = route?.params?.header || null;
  const PONUMBER = route?.params?.poNumber;
  const sourceId = route?.params?.id ? String(route.params.id) : null;

  const [apiItems, setApiItems] = useState([]);
  const [phase, setPhase] = useState('idle');

  const [inspectOn, setInspectOn] = useState(true);
  const [putAwayOn, setPutAwayOn] = useState(true);

  const {
    poHeader,
    setPoHeader,
    receiveItems,
    summaryItems,
    mergePatchIntoSummaryItems,
    mergePatchIntoReceiveItems,
    resetReceiving,
    OrgData,
  } = useReceivingStore();

  const [draft, setDraft] = useState([]);
  const handledPatchIdsRef = useRef(new Set());
  const didCompleteRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      didCompleteRef.current = false;
      return () => {};
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (listTypeFromRoute === 'Received') {
          navigation.navigate('Receive');
        } else {
          navigation.navigate('NewReceiveScreen');
        }
        return true;
      };
      const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => sub.remove();
    }, [navigation, listTypeFromRoute])
  );

  const norm = v => String(v ?? '').trim().toLowerCase();
  const isInspectionRequired = dt =>
    norm(dt) === 'inspection required' || norm(dt) === 'inspection';
  const isStandardReceipt = dt =>
    norm(dt) === 'standard receipt' || norm(dt) === 'standard';
  const isDirectDelivery = dt =>
    norm(dt) === 'direct delivery' || norm(dt) === 'direct';

  const mapBackendArrayToFrontend = useCallback(
    data => {
      const arr = Array.isArray(data) ? data : [];
      return arr.map((backend, index) => {
        const deliveryType =
          backend?.delivery_type ??
          backend?.deliveryType ??
          backend?.delivery_type_name ??
          backend?.deliveryTypeName ??
          backend?.deliverytype ??
          backend?.delivery_type_code ??
          backend?.delivery_type_desc ??
          '';

        return {
          id: String(backend?.po_line_id ?? index + 1),
          po_line_id: backend?.po_line_id,
          item_id: backend?.item_id,
          name: backend?.item?.item_code || '',
          description: backend?.item?.description || '',
          orderedQty: backend?.ord_qty,
          receivedQty: backend?.rcvd_qty,
          openQty: backend?.open_qty,
          ship_to_location: backend?.ship_to_location,
          max_open_qty: backend?.max_open_qty,
          lpn: '',
          deliverytype: deliveryType,
          sub_inv_name: backend?.sub_inv_name,
          org_id: OrgData?.selectedOrg,
          locator_name: backend?.locator_name,
          status: backend?.line_status,
          uom: backend?.item?.uom === 'EA' ? 'Each' : backend?.item?.uom,
          promisedDate: backend?.promised_dlry_dt
            ? new Date(backend.promised_dlry_dt).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })
            : null,
          needByDate: backend?.need_by_dt
            ? new Date(backend.need_by_dt).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })
            : null,
        };
      });
    },
    [OrgData?.selectedOrg]
  );

  useEffect(() => {
    if (!sourceId && !PONUMBER) return;

    setPhase('loading');

    const loadReceipt = async () => {
      try {
        const resp = await GetSingleReceipt(sourceId, PONUMBER);
        const frontendArray = mapBackendArrayToFrontend(resp);
        setApiItems(frontendArray);
        setPhase('success');
      } catch (err) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to load PO Items. Please try again.',
          position: 'top',
          visibilityTime: 5000,
        });
        setApiItems([]);
        setPhase('error');
      }
    };

    loadReceipt();
  }, [sourceId, PONUMBER, mapBackendArrayToFrontend]);

  useEffect(() => {
    if (headerFromRoute) {
      setPoHeader(null);
      setPoHeader(headerFromRoute);
    }
  }, [headerFromRoute, setPoHeader]);

  useEffect(() => {
    setDraft(apiItems);
  }, [apiItems]);

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

  const headerData = useMemo(
    () =>
      poHeader || {
        receiptNumber: '—',
        supplier: '—',
        poNumber: '—',
        poDate: '—',
      },
    [poHeader]
  );

  const renderItems = useMemo(() => {
    if (Array.isArray(draft) && draft.length > 0) return draft;
    return [];
  }, [draft]);

  const filteredItems = useMemo(() => {
    const wantInspection = inspectOn;
    const wantStandard = putAwayOn;

    return (renderItems || []).filter(it => {
      const dt = it?.deliverytype;

      if (!wantInspection && !wantStandard) {
        return isDirectDelivery(dt);
      }

      if (wantInspection && wantStandard) {
        return isInspectionRequired(dt) || isStandardReceipt(dt);
      }

      if (wantInspection) return isInspectionRequired(dt);
      if (wantStandard) return isStandardReceipt(dt);

      return false;
    });
  }, [renderItems, inspectOn, putAwayOn]);

  const toDetailItemFromSummary = (it, i) => {
    const readonlyReceivingQty =
      listTypeFromRoute === 'scan'
        ? Number(it.openQty ?? 0) > 0
          ? Number(it.openQty ?? 0)
          : Number(it.orderedQty ?? it.orderQty ?? 0)
        : Number(it.orderedQty ?? it.orderQty ?? 0);

    return {
      id: String(it.id),
      poNumber: headerData.poNumber ?? '—',
      lineNumber: i + 1,
      itemName: it.name,
      itemid: it.item_id,
      itemDescription: it.itemDescription ?? it.description ?? '—',
      orderQty: Number(it.orderedQty ?? it.orderQty ?? 0),
      openQty: Number(it.openQty ?? 0),
      ship_to_location: it.ship_to_location ?? '—',
      receivingQty: readonlyReceivingQty,
      receivedQty: Number(it.receivedQty ?? 0),
      receivingStatus: it.status,
      lpn: it.lpn ?? '',
      uom: it.uom,
      sub_inv_name: it.sub_inv_name,
      locator_name: it.locator_name,
      subInventory: it.subInventory ?? '',
      locator: it.locator ?? '',
      deliverytype: it.deliverytype ?? null,
    };
  };

  const openLineDetailsFromSummary = useCallback(
    (item, sourceList) => {
      const source = Array.isArray(sourceList) ? sourceList : filteredItems;
      const idx = Math.max(source.findIndex(x => String(x.id) === String(item.id)), 0);
      const mapped = source.map(toDetailItemFromSummary);

      navigation.navigate({
        name: 'LineItemDetails',
        params: {
          items: mapped,
          startIndex: idx,
          readonly,
          returnTo: 'ReceivedSummaryScreen',
          listType: listTypeFromRoute,
          receiptNumber: headerData?.receiptNumber,
        },
        merge: true,
      });
    },
    [filteredItems, navigation, readonly, listTypeFromRoute, headerData?.receiptNumber]
  );

  const handlePressViewDetails = item => {
    openLineDetailsFromSummary(item, filteredItems);
  };

  const handlePressPendingAction = item => {
    openLineDetailsFromSummary(item, filteredItems);
  };

  const TogglePill = ({ label, value, onToggle }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onToggle}        
      >
        

        <View style={[styles.toggleTrack, { backgroundColor: value ? '#233E55' : '#9D9FA3'},]}>
          {/* <Text style={styles.toggleText}>{label}</Text> */}
          <View
            style={[
              styles.toggleDot,
              value ? styles.dotOn : styles.dotOff,
            ]}
          />
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

      {phase === 'loading' && (
        <View style={styles.loaderWrapper}>
          <ActivityIndicator size="large" color="#233E55" />
          <Text style={styles.statusText}>Loading data…</Text>
        </View>
      )}

      {phase !== 'loading' && (
        <ScrollView contentContainerStyle={styles.contentContainer}>
          <POinfoCardComponent
            receiptNumber={headerData.receiptNumber}
            supplier={headerData.supplier}
            poNumber={headerData.poNumber}
            receiptDate={headerData.poDate}
          />

          <View style={styles.itemcontainer}>
            <View style={styles.summaryHeaderRow}>
              <Text style={styles.itemName}>Item Summary</Text>

              <View style={styles.toggleGroup}>
                <TogglePill
                  label="Inspect"
                  value={inspectOn}
                  onToggle={() => setInspectOn(v => !v)}
                />
                <View style={{ width: rs(10) }} />
                <TogglePill
                  label="Put Away"
                  value={putAwayOn}
                  onToggle={() => setPutAwayOn(v => !v)}
                />
              </View>
            </View>

            <View style={styles.tableHeader}>
              <SummaryTabHdrsComponent />
            </View>

            <FlatList
              data={filteredItems}
              keyExtractor={item => String(item.id)}
              renderItem={({ item }) => (
                <View style={styles.lineItemWrapper}>
                  <ReceivedLineitemComponent
                    item={item}
                    qtyLabel={item.uom}
                    qtyValue={item.receivedQty}
                    readOnly
                    onPressViewDetails={() => handlePressViewDetails(item)}
                    onPressPendingAction={() => handlePressPendingAction(item)}
                  />
                </View>
              )}
              scrollEnabled={false}
              ListEmptyComponent={<View style={{ height: 16 }} />}
            />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: '#F6F8FA', flex: 1 },
  loaderWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  statusText: { marginTop: 12, color: '#333', fontSize: 14 },
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

  summaryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 3,
  },

  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginStart: 6,
  },

  toggleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  togglePill: {
    flexDirection: 'row',
    alignItems: 'center',
    height: rs(23),
    borderRadius: rs(42),
    paddingLeft: rs(12),
    paddingRight: rs(8),
    minWidth: rs(86),
  },

  toggleText: {
    fontSize: 8,
    fontWeight: '400',
    color: '#FFFFFF',
  },

  toggleTrack: {
    marginLeft: rs(10),
    width: rs(62),
    height: rs(20),
    borderRadius: rs(18),
    // backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    paddingHorizontal: rs(2),
  },

  toggleDot: {
    width: rs(14),
    height: rs(14),
    borderRadius: rs(20),
    backgroundColor: '#FFFFFF',
  },

  dotOn: {
    alignSelf: 'flex-end',
  },

  dotOff: {
    alignSelf: 'flex-start',
  },

  tableHeader: { marginTop: 8, marginBottom: 10 },
  lineItemWrapper: { marginBottom: 12 },
});

export default ReceivedSummaryScreen;
