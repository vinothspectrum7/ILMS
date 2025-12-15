import React, { useEffect, useMemo, useState, useCallback, useRef, memo } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Dimensions, Modal, BackHandler, ActivityIndicator } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import BarcodeScanner from './BarCodeScanner';
import GlobalHeaderComponent from '../components/GlobalHeaderComponent';
import BarcodeScannerIcon from '../assets/icons/barcodescanner.svg';
import DeleteSvg from '../assets/icons/delete.svg';
import SortIcon from '../assets/icons/sorticon.svg';
import SortDropdownIcon from '../assets/icons/sortdropdown.svg';
import BackFilterIcon from '../assets/icons/filterbackicon.svg';
import ViewMoreIcon from '../assets/icons/viewmore.svg';
import InputSearchIcon from '../assets/icons/search_receivelist.svg';
import ViewLessIcon from '../assets/icons/viewless.svg';
import { useReceivingStore } from '../store/receivingStore';
import { FetchData, GetPoItems, GetReceivedItems, GetICPoItems, DeleteIncompleteRecord } from '../api/ApiServices';

const initialLayout = { width: Dimensions.get('window').width };
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BASE_WIDTH = 375;
const scale = (size) => (SCREEN_WIDTH / BASE_WIDTH) * size;
const ms = (size, factor = 0.35) => size + (scale(size) - size) * factor;

const FILTERS_PO_ASN = ['Open', 'Closed', 'Fully Received'];
const FILTERS_RX_IC = ['All', 'Purchase Order', 'ASN Order'];
const dash = '—';

const clampPct = (n) => Math.max(0, Math.min(100, Number(n) || 0));
const computePercent = (received, ordered) => {
  const r = Number(received ?? 0);
  const o = Number(ordered ?? 0);
  if (!Number.isFinite(o) || o <= 0) return 0;
  const pct = (r / o) * 100;
  return clampPct(Number(pct.toFixed(2)));  // Round to 2 decimals
};
const getStatusColor = (status) => {
  const s = String(status || '').toUpperCase();
  if (s === 'OPEN') return '#033EFF';
  if (s === 'CLOSED') return '#168035';
  if (s === 'FULLY RECEIVED') return '#168035';
  return '#F06000';
};
const getProgressColor = (percent) => {
  const p = Number(percent || 0);
  if (p >= 100) return '#168035';
  if (p > 0) return '#033EFF';
  return '#ECF1F7';
};
const getPOProgressColor = (percent) => {
  const p = Number(percent || 0);
  if (p >= 100) return '#168035';
  if (p > 0) return '#F06000';
  return '#ECF1F7';
};
const toBackendStatus = (label) => {
  const v = String(label || '').toLowerCase();
  if (v === 'open') return 'OPEN';
  if (v === 'closed') return 'CLOSED';
  if (v === 'fully received') return 'FULLY RECEIVED';
  return null;
};

const formatDate = (input) => {
  const monthShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const out = (y, m, d) => `${String(d).padStart(2, '0')} ${monthShort[m]} ${y}`;
  if (input == null) return dash;
  const n = Date.parse(String(input).trim());
  if (!Number.isNaN(n)) {
    const dt = new Date(n);
    return out(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate());
  }
  return dash;
};

const RightActions = memo(({ onDelete }) => (
  <View style={styles.rightActionContainer}>
    <TouchableOpacity onPress={onDelete} style={styles.actionButton} activeOpacity={0.8} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
      <DeleteSvg width={22} height={22} />
    </TouchableOpacity>
  </View>
));

const ReceiveScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { resetReceiving, OrgData, ActiveTab, setActiveTab } = useReceivingStore();

  const [index, setIndex] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [sortField, setSortField] = useState(null);
  const [showScanner, setShowScanner] = useState(false);

  const [AsnIntialData, setAsnIntialData] = useState([]);
  const [AsnData, setAsnData] = useState([]);

  const [POData, setPOData] = useState([]);
  const [POIntialData, setPOIntialData] = useState([]);

  const [ICListInitial, setICListInitial] = useState([]);
  const [ICList, setICList] = useState([]);

  const [ReceivedData, SetReceivedData] = useState([]);
  const [IntialReceivedData, SetIntialReceivedData] = useState([]);

  const [sortOrder, setSortOrder] = useState('asc');
  const [searchText, setSearchText] = useState('');
  const [activeFilter, setActiveFilter] = useState(null);

  const [phase, setPhase] = useState('idle');

  const [routes] = useState([
    { key: 'poir', title: 'PO/IR' },
    { key: 'asn', title: 'ASN' },
    { key: 'received', title: 'Receipt' },
    { key: 'InComplete', title: 'Incomplete' },
  ]);
  const activeKey = routes[index].key;

  const pagerRef = useRef(null);
  const scrollRef = useRef(null);
  const openRowRef = useRef(null);

  const baselineRef = useRef({ poir: null, asn: null, received: null, InComplete: null });

  const renderRightActions = useCallback(
    (onDelete) => <RightActions onDelete={onDelete} />,
    []
  );

  const pretty = (v) => v;

  const isDateField = (field) =>
    field === 'order_date' ||
    field === 'last_updated_date' ||
    field === 'shipped_date' ||
    field === 'received_date' ||
    field === 'purchase_date';

  const parseMaybeDate = (v) => {
    const n = Date.parse(v);
    return Number.isFinite(n) ? n : Number.NEGATIVE_INFINITY;
  };

  const compareByField = (a, b, field, order) => {
    const dir = order === 'desc' ? -1 : 1;
    const av = a?.[field];
    const bv = b?.[field];
    if (isDateField(field)) {
      const da = parseMaybeDate(av);
      const db = parseMaybeDate(bv);
      if (da === db) return 0;
      return da < db ? -1 * dir : 1 * dir;
    }
    const sa = String(av ?? '').toLowerCase();
    const sb = String(bv ?? '').toLowerCase();
    if (sa === sb) return 0;
    return sa < sb ? -1 * dir : 1 * dir;
  };

  const sortCurrentTabByField = (field, order) => {
    if (activeKey === 'poir') {
      setPOData((prev) => [...prev].sort((a, b) => compareByField(a, b, field, order)));
      return;
    }
    if (activeKey === 'asn') {
      setAsnData((prev) => [...prev].sort((a, b) => compareByField(a, b, field, order)));
      return;
    }
    if (activeKey === 'received') {
      SetReceivedData((prev) => [...prev].sort((a, b) => compareByField(a, b, field, order)));
      return;
    }
    if (activeKey === 'InComplete') {
      setICList((prev) => [...prev].sort((a, b) => compareByField(a, b, field, order)));
      return;
    }
  };

  const captureBaselineIfNeeded = () => {
    if (baselineRef.current[activeKey]) return;
    if (activeKey === 'poir') baselineRef.current.poir = [...POData];
    else if (activeKey === 'asn') baselineRef.current.asn = [...AsnData];
    else if (activeKey === 'received') baselineRef.current.received = [...ReceivedData];
    else if (activeKey === 'InComplete') baselineRef.current.InComplete = [...ICList];
  };

  const restoreBaseline = () => {
    const snap = baselineRef.current[activeKey];
    if (!snap) return;
    if (activeKey === 'poir') setPOData(snap);
    else if (activeKey === 'asn') setAsnData(snap);
    else if (activeKey === 'received') SetReceivedData(snap);
    else if (activeKey === 'InComplete') setICList(snap);
    baselineRef.current[activeKey] = null;
  };

  const handleSort = () => {
    if (sortField) {
      sortCurrentTabByField(sortField, sortOrder);
      setSortOrder((p) => (p === 'asc' ? 'desc' : 'asc'));
      return;
    }

    if (activeKey === 'poir') {
      setPOData((prev) => {
        const sorted = [...prev].sort((a, b) => {
          const dateA = new Date(a.order_date);
          const dateB = new Date(b.order_date);
          if (dateA.getTime() !== dateB.getTime()) return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
          return sortOrder === 'asc' ? String(a.supplier_name || '').localeCompare(String(b.supplier_name || '')) : String(b.supplier_name || '').localeCompare(String(a.supplier_name || ''));
        });
        return sorted;
      });
      setSortOrder((p) => (p === 'asc' ? 'desc' : 'asc'));
      return;
    }

    if (activeKey === 'asn') {
      setAsnData((prev) => {
        const sorted = [...prev].sort((a, b) => {
          const dateA = new Date(a.shipped_date || a.expected_receipt_date);
          const dateB = new Date(b.shipped_date || b.expected_receipt_date);
          if (dateA.getTime() !== dateB.getTime()) return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
          return sortOrder === 'asc' ? String(a.supplier_name || '').localeCompare(String(b.supplier_name || '')) : String(b.supplier_name || '').localeCompare(String(a.supplier_name || ''));
        });
        return sorted;
      });
      setSortOrder((p) => (p === 'asc' ? 'desc' : 'asc'));
      return;
    }

    if (activeKey === 'received') {
      SetReceivedData((prev) => {
        const sorted = [...prev].sort((a, b) => {
          const da = new Date(a.received_date);
          const db = new Date(b.received_date);
          if (da.getTime() !== db.getTime()) return sortOrder === 'asc' ? da - db : db - da;
          return sortOrder === 'asc' ? String(a.supplier_name || '').localeCompare(String(b.supplier_name || '')) : String(b.supplier_name || '').localeCompare(String(a.supplier_name || ''));
        });
        return sorted;
      });
      setSortOrder((p) => (p === 'asc' ? 'desc' : 'asc'));
      return;
    }

    if (activeKey === 'InComplete') {
      setICList((prev) => {
        const sorted = [...prev].sort((a, b) => {
          const da = new Date(a.last_updated_date || a.received_date || a.shipped_date || a.expected_receipt_date);
          const db = new Date(b.last_updated_date || b.received_date || b.shipped_date || b.expected_receipt_date);
          if (da.getTime() !== db.getTime()) return sortOrder === 'asc' ? da - db : db - da;
          return sortOrder === 'asc' ? String(a.supplier_name || '').localeCompare(String(b.supplier_name || '')) : String(b.supplier_name || '').localeCompare(String(a.supplier_name || ''));
        });
        return sorted;
      });
      setSortOrder((p) => (p === 'asc' ? 'desc' : 'asc'));
      return;
    }
  };

  const applyVisible = useCallback(
    (tabKey, qText, filterVal) => {
      const q = String(qText ?? '').trim().toLowerCase();

      if (tabKey === 'poir') {
        const filterStatus = filterVal ? String(filterVal).toUpperCase() : null;
        let base = [...POIntialData];
        if (q) {
          base = base.filter((p) => {
            const hay = [p?.po_number, p?.supplier_name, p?.status].filter(Boolean).map((x) => String(x).toLowerCase());
            return hay.some((h) => h.includes(q));
          });
        } else if (filterStatus === 'FULLY RECEIVED') {
          base = base.filter((p) => Number(p?.received) === 100);
        } else if (filterStatus === 'OPEN') {
          base = base.filter((p) => String(p?.status || '').toUpperCase() === 'OPEN' && Number(p?.received) !== 100);
        } else if (filterStatus === 'CLOSED') {
          base = base.filter((p) => String(p?.status || '').toUpperCase() === 'CLOSED');
        } else if (!q) {
          base = base.filter((p) => String(p?.status || '').toUpperCase() === 'OPEN' && Number(p?.received) !== 100);
        }
        setPOData(base);
        return;
      }

      if (tabKey === 'asn') {
        const filterStatus = filterVal ? String(filterVal).toUpperCase() : null;
        let base = [...AsnIntialData];
        if (q) {
          base = base.filter((a) => {
            const hay = [a?.asn_num, a?.supplier_name, a?.status].filter(Boolean).map((x) => String(x).toLowerCase());
            return hay.some((h) => h.includes(q));
          });
        } else if (filterStatus === 'FULLY RECEIVED') {
          base = base.filter((p) => Number(p?.receivedPct) === 100);
        } else if (filterStatus === 'OPEN') {
          base = base.filter((p) => String(p?.status || '').toUpperCase() === 'OPEN' && Number(p?.receivedPct) !== 100);
        } else if (filterStatus === 'CLOSED') {
          base = base.filter((p) => String(p?.status || '').toUpperCase() === 'CLOSED');
        } else if (!q) {
          base = base.filter((a) => String(a?.status || '').toUpperCase() === 'OPEN' && Number(a?.receivedPct) !== 100);
        }
        setAsnData(base);
        return;
      }

      if (tabKey === 'received') {
        let base = [...IntialReceivedData];
        if (q) {
          base = base.filter((it) => {
            const hay = [it?.po_number, it?.asn_num, it?.supplier_name, it?.status, it?.receipt_num]
              .filter(Boolean)
              .map((x) => String(x).toLowerCase());
            return hay.some((h) => h.includes(q));
          });
        }
        if (filterVal === 'purchase_order') {
          base = base.filter((it) => String(it?.received_type || '').toLowerCase() === 'purchase_order');
        } else if (filterVal === 'asn') {
          base = base.filter((it) => String(it?.received_type || '').toLowerCase() === 'asn');
        }
        SetReceivedData(base);
        return;
      }

      if (tabKey === 'InComplete') {
        let base = [...ICListInitial];
        if (q) {
          base = base.filter((it) => {
            const hay = [it?.po_number, it?.asn_num, it?.supplier_name, it?.status]
              .filter(Boolean)
              .map((x) => String(x).toLowerCase());
            return hay.some((h) => h.includes(q));
          });
        }
        if (filterVal === 'purchase_order') {
          base = base.filter((it) => String(it?.received_type || '').toLowerCase() === 'purchase_order');
        } else if (filterVal === 'asn') {
          base = base.filter((it) => String(it?.received_type || '').toLowerCase() === 'asn');
        }
        setICList(base);
        return;
      }
    },
    [POIntialData, AsnIntialData, ICListInitial, IntialReceivedData]
  );

  const handlePick = (picked) => {
    setMenuOpen(false);
    if (activeKey === 'received' || activeKey === 'InComplete') {
      const v = String(picked).toLowerCase();
      if (v === 'all') {
        setActiveFilter(null);
        applyVisible(activeKey, searchText, null);
      } else if (v === 'purchase order') {
        setActiveFilter('purchase_order');
        applyVisible(activeKey, searchText, 'purchase_order');
      } else if (v === 'asn order') {
        setActiveFilter('asn');
        applyVisible(activeKey, searchText, 'asn');
      }
      return;
    }
    const backend = toBackendStatus(picked);
    setActiveFilter(backend);
    applyVisible(activeKey, searchText, backend);
  };

  useEffect(() => {
    if (!ActiveTab && ActiveTab !== 0) return;
    setIndex(ActiveTab);
  }, [ActiveTab]);

  useEffect(() => {
    if (!OrgData?.selectedOrg) return;
    setPhase('loading');

    const loadASN = async () => {
      try {
        const data = await FetchData(OrgData?.selectedOrg);
        const withPct = (data || []).map((d, idx) => {
          const pct = computePercent(d?.total_rcvd_qty, d?.total_order_qty);
          return { ...d, id: d?.asn_id || `asn-${idx + 1}`, receivedPct: pct };
        });
        setAsnIntialData(withPct);
        setAsnData(withPct.filter((x) => String(x?.status || '').toUpperCase() === 'OPEN' && Number(x?.receivedPct) !== 100));
      } catch {
        Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load ASN data. Please try again.', position: 'top', visibilityTime: 5000 });
      }
    };

    const loadPO = async () => {
      try {
        const data = await GetPoItems(OrgData?.selectedOrg);
        const withPct = (data || []).map((d, idx) => {
          const pct = computePercent(d?.total_received_qty, d?.total_ord_qty);
          return { ...d, id: d?.id || `${idx + 1}`, received: pct };
        });
        setPOIntialData(withPct);
        setPOData(withPct.filter((x) => String(x?.status || '').toUpperCase() === 'OPEN' && Number(x?.received) !== 100));
      } catch {
        Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load Purchase Order data. Please try again.', position: 'top', visibilityTime: 5000 });
      }
    };

    const loadReceived = async () => {
      try {
        const data = await GetReceivedItems(OrgData?.selectedOrg);
        const withIds = (data || []).map((d, idx) => ({ ...d, id: d?.id || `${idx + 1}` }));
        SetIntialReceivedData(withIds);
        SetReceivedData(withIds);
      } catch {
        Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load Received data. Please try again.', position: 'top', visibilityTime: 5000 });
      }
    };

    const loadIC = async () => {
      try {
        const data = await GetICPoItems(OrgData?.selectedOrg);
        const normalized = (data || []).map((d, idx) => {
          const isASN = String(d?.received_type || '').toLowerCase() === 'asn';
          return {
            ...d,
            id: d?.interface_id || `ic-${idx + 1}`,
            isASN,
            asn_id: d?.asn_id,
            asn_num: d?.asn_num,
            po_number: d?.po_number,
            supplier_name: d?.supplier_name,
            received_date: d?.received_date,
            shipped_date: d?.shipped_date,
            expected_receipt_date: d?.expected_receipt_date,
            status: d?.status,
            last_updated_date: d?.last_updated_date,
            received_type: d?.received_type,
          };
        });
        setICListInitial(normalized);
        setICList(normalized);
      } catch {
        Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load Incomplete list. Please try again.', position: 'top', visibilityTime: 5000 });
      }
    };

    Promise.all([loadASN(), loadPO(), loadReceived(), loadIC()]).finally(() => setPhase('success'));
  }, [OrgData?.selectedOrg]);

  useFocusEffect(
    React.useCallback(() => {
      resetReceiving();
      return () => { };
    }, [resetReceiving])
  );

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.navigate('Home');
        return true;
      };
      const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => sub.remove();
    }, [navigation])
  );

  const getSortOptionsForTab = (tabKey) => {
    if (tabKey === 'poir') {
      return [
        { key: 'supplier_name', label: 'Supplier' },
        { key: 'order_date', label: 'Purchase Order Date' },
        { key: 'last_updated_date', label: 'Last Updated Date' },
      ];
    }
    if (tabKey === 'asn') {
      return [
        { key: 'supplier_name', label: 'Supplier' },
        { key: 'shipped_date', label: 'Shipped Date' },
        { key: 'last_updated_date', label: 'Last Updated Date' },
      ];
    }
    if (tabKey === 'received') {
      return [
        { key: 'supplier_name', label: 'Supplier' },
        // { key: 'purchase_date', label: 'Purchase Date' },
        { key: 'received_date', label: 'Receipt Date' },
      ];
    }
    if (tabKey === 'InComplete') {
      return [
        { key: 'supplier_name', label: 'Supplier' },
        { key: 'last_updated_date', label: 'Last Updated Date' },
      ];
    }
    return [];
  };

  const handleSearch = (text) => {
    setSearchText(text);
    applyVisible(activeKey, text, activeFilter);
  };

  const [expandedReceiptIds, setExpandedReceiptIds] = useState(new Set());
  const toggleExpand = (id) => {
    setExpandedReceiptIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const ASNReceiptCard = ({ item, styleOverride }) => {
    const expanded = expandedReceiptIds.has(item.id);
    return (
      <View style={[styles.card, styleOverride]}>
        <View style={styles.toprow}>
          <View style={styles.topcardLeft}>
            <Text style={styles.labelText}>ASN Receipt</Text>
            <Text style={styles.valueText}>{item?.receipt_num || dash}</Text>
          </View>
          <View style={styles.topcardRight}>
            <Text style={styles.labelText}>ASN Number</Text>
            <Text style={styles.valueText}>{item.asn_num}</Text>
          </View>
        </View>
        <View style={styles.bottomrow}>
          <View style={styles.bottomcardLeft}>
            <Text style={styles.labelText}>Supplier</Text>
            <Text style={styles.valueText}>
              {item.supplier_name?.length > 24 ? item.supplier_name.substring(0, 24) + '...' : item.supplier_name}
            </Text>
          </View>
          <View style={styles.bottomcardRight}>
            <Text style={styles.labelText}>Supplier Site</Text>
            <Text style={styles.valueText}>{item.supplier_site || dash}</Text>
          </View>
        </View>
        {expanded && (
          <>
            <View style={styles.bottomrow}>
              <View style={styles.bottomcardLeft}>
                <Text style={styles.labelText}>Carrier</Text>
                <Text style={styles.valueText}>{item.carrier || dash}</Text>
              </View>
              <View style={styles.bottomcardRight}>
                <Text style={styles.labelText}>Pack Slip</Text>
                <Text style={styles.valueText}>{item.pack_slip || dash}</Text>
              </View>
            </View>
            <View style={styles.bottomrow}>
              <View style={styles.bottomcardLeft}>
                <Text style={styles.labelText}>BOL</Text>
                <Text style={styles.valueText}>{item.bol || dash}</Text>
              </View>
              <View style={styles.bottomcardRight}>
                <Text style={styles.labelText}>Waybill</Text>
                <Text style={styles.valueText}>{item.waybill || dash}</Text>
              </View>
            </View>
            <View style={styles.bottomrow}>
              <View style={styles.bottomcardLeft}>
                <Text style={styles.labelText}>Airbill</Text>
                <Text style={styles.valueText}>{item.airbill || dash}</Text>
              </View>
              <View style={styles.bottomcardRight} />
            </View>
          </>
        )}
        <View style={styles.newbottomrow}>
          <View style={styles.newbottomcardLeft}>
            <Text style={styles.newlabelText}>
              Shipped Date: {formatDate(item.shipped_date)} {'\n'}Expected Receipt Date: {formatDate(item.expected_receipt_date)}
            </Text>
          </View>
          <View style={styles.newbottomcardRight}>
            <TouchableOpacity style={styles.viewMoreBtn} activeOpacity={0.7} onPress={() => toggleExpand(item.id)}>
              <Text style={styles.viewMoreText}>{expanded ? 'View Less' : 'View More'}</Text>
              <ViewLessIcon width={ms(14)} height={ms(14)} stroke="#033EFF" fill="none" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const POReceiptCard = ({ item, styleOverride }) => (
    <View style={[styles.card, styleOverride]}>
      <View style={styles.toprow}>
        <View style={styles.topcardLeft}>
          <Text style={styles.labelText}>Receipt</Text>
          <Text style={styles.valueText}>{item?.receipt_num || dash}</Text>
        </View>
        <View style={styles.topcardRight}>
          <Text style={styles.labelText}>Purchase Order</Text>
          <Text style={styles.valueText}>{item.po_number}</Text>
        </View>
      </View>
      <View style={styles.bottomrow}>
        <View style={styles.bottomcardLeft}>
          <Text style={styles.labelText}>Supplier</Text>
          <Text style={styles.valueText}>
            {item.supplier_name?.length > 20 ? item.supplier_name.substring(0, 20) + '...' : item.supplier_name}
          </Text>
        </View>
        <View style={styles.bottomcardRight}>
          <Text style={styles.labelText}>Receiving Date</Text>
          <Text style={styles.valueText}>{formatDate(item.received_date || new Date())}</Text>
        </View>
      </View>
    </View>
  );

  const IncompleteRow = memo(function IncompleteRow({ item, isASN, onDelete, pagerRef, scrollRef, openRowRef }) {
    const rowRef = useRef(null);

    const onOpen = useCallback(() => {
      if (!rowRef.current) return;
      if (openRowRef.current && openRowRef.current !== rowRef.current) {
        openRowRef.current.close();
      }
      openRowRef.current = rowRef.current;
    }, [openRowRef]);

    const onClose = useCallback(() => {
      if (openRowRef.current === rowRef.current) {
        openRowRef.current = null;
      }
    }, [openRowRef]);

    return (
      <View style={styles.incompleteRowContainer}>
        <Swipeable
          ref={rowRef}
          renderRightActions={() => renderRightActions(() => onDelete(item))}
          overshootRight={false}
          rightThreshold={24}
          friction={2}
          simultaneousHandlers={[pagerRef, scrollRef]}
          activeOffsetX={[-24, 24]}
          onSwipeableOpen={onOpen}
          onSwipeableClose={onClose}
          useNativeAnimations={false}
        >
          <TouchableOpacity
            onPress={() => {
              if (isASN) {
                navigation.navigate('IC_AsnReceiptScreen', {
                  selectedASN: {
                    asn_id: item.asn_id,
                    interface_id: item.interface_id,
                    asn_num: item.asn_num,
                    supplier_name: item.supplier_name,
                    shipped_date: item.shipped_date,
                    expected_receipt_date: item.expected_receipt_date,
                    supplier_site: item.supplier_site,
                    carrier: item.carrier,
                    pack_slip: item.pack_slip,
                    bol: item.bol,
                    waybill: item.waybill,
                    airbill: item.airbill,
                    status: item.status,
                  },
                  fromScan: false,
                  scannedAsnId: item.asn_id,
                  scannedAsnNumber: item.asn_num,
                });
              } else {
                navigation.navigate('InCompleteReceiveScreen', {
                  selectedPO: item,
                  fromScan: false,
                  scannedPoNumber: null,
                });
              }
            }}
            activeOpacity={0.9}
          >
            {isASN ? <ASNReceiptCard item={item} styleOverride={styles.cardInsideSwipe} /> : <POReceiptCard item={item} styleOverride={styles.cardInsideSwipe} />}
          </TouchableOpacity>
        </Swipeable>
      </View>
    );
  });

  const InCompleteList = () => {
    const keyExtractor = useCallback((it) => String(it.id), []);
    const onDelete = useCallback(
      async (it) => {
        try {
          const res = await DeleteIncompleteRecord(it?.interface_id);
          if (res !== undefined) {
            const refreshed = await GetICPoItems(OrgData?.selectedOrg);
            const normalized = (refreshed || []).map((d, idx) => ({
              ...d,
              id: d?.interface_id || `ic-${idx + 1}`,
              isASN: String(d?.received_type || '').toLowerCase() === 'asn',
            }));
            setICListInitial(normalized);
            setICList(normalized);
          }
        } catch {
          Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to delete record. Please try again.', position: 'top', visibilityTime: 5000 });
        }
      },
      [OrgData?.selectedOrg]
    );

    const renderItem = useCallback(
      ({ item }) => (
        <IncompleteRow
          item={item}
          isASN={item.isASN}
          onDelete={onDelete}
          pagerRef={pagerRef}
          scrollRef={scrollRef}
          openRowRef={openRowRef}
        />
      ),
      [onDelete]
    );

    return (
      <>
            <View style={styles.iconCluster}>
        <View style={{ position: 'relative' }}>
          <TouchableOpacity
            onPress={() => {
              setMenuOpen((v) => !v);
              setSortMenuOpen(false);
            }}
            style={[styles.chip, isFilterActive && styles.chipActive]}
            activeOpacity={0.8}
          >
            {isFilterActive && <View style={styles.chipInner} />}
            <BackFilterIcon width={24} height={24} fill="#233E55" />
            <Text style={styles.sortText}>Filter</Text>
          </TouchableOpacity>

          {menuOpen && (
            <View style={styles.menuAnchored}>
              {(activeKey === 'poir' || activeKey === 'asn' ? FILTERS_PO_ASN : FILTERS_RX_IC).map((f) => (
                <TouchableOpacity
                  key={f}
                  style={[
                    styles.menuItem,
                    (activeKey === 'poir' || activeKey === 'asn')
                      ? activeFilter === toBackendStatus(f) && styles.menuItemActive
                      : (String(f).toLowerCase() === 'all'
                        ? activeFilter == null
                        : (String(f).toLowerCase() === 'purchase order' ? activeFilter === 'purchase_order' : activeFilter === 'asn')) && styles.menuItemActive
                  ]}
                  onPress={() => handlePick(f)}
                >
                  <Text
                    style={[
                      styles.menuText,
                      (activeKey === 'poir' || activeKey === 'asn')
                        ? activeFilter === toBackendStatus(f) && styles.menuTextActive
                        : (String(f).toLowerCase() === 'all'
                          ? activeFilter == null
                          : (String(f).toLowerCase() === 'purchase order' ? activeFilter === 'purchase_order' : activeFilter === 'asn')) && styles.menuTextActive
                    ]}
                  >
                    {pretty(f)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
        <View style={{ position: 'relative' }}>
          <TouchableOpacity
            onPress={toggleSortMenu}
            style={styles.dropdownHalf}
            activeOpacity={0.8}
          >
            <Text style={styles.sortText}>Sort</Text>
            <SortDropdownIcon width={24} height={24} fill="#233E55" />
          </TouchableOpacity>

          {sortMenuOpen && (
            <View style={styles.menuAnchoredfilter}>
              {getSortOptionsForTab(activeKey).map((opt) => (
                <TouchableOpacity
                  key={opt.key}
                  style={[
                    styles.menuItem,
                    sortField === opt.key && styles.menuItemActive
                  ]}
                  onPress={() => selectSortOption(opt.key)}
                >
                  <Text
                    style={[
                      styles.menuText,
                      sortField === opt.key && styles.menuTextActive
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>
      <FlatList
        data={ICList}
        keyExtractor={keyExtractor}
        contentContainerStyle={{ paddingBottom: 80 }}
        ref={scrollRef}
        ListEmptyComponent={() => (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>No data found</Text>
          </View>
        )}
        renderItem={renderItem}
        removeClippedSubviews
        initialNumToRender={8}
        windowSize={7}
        maxToRenderPerBatch={8}
        updateCellsBatchingPeriod={50}
      />
      </>
    );
  };

  const POList = () => (
    <>
      <View style={styles.iconCluster}>
        <View style={{ position: 'relative' }}>
          <TouchableOpacity
            onPress={() => {
              setMenuOpen((v) => !v);
              setSortMenuOpen(false);
            }}
            style={[styles.chip, isFilterActive && styles.chipActive]}
            activeOpacity={0.8}
          >
            {isFilterActive && <View style={styles.chipInner} />}
            <BackFilterIcon width={24} height={24} fill="#233E55" />
            <Text style={styles.sortText}>Filter</Text>
          </TouchableOpacity>

          {menuOpen && (
            <View style={styles.menuAnchored}>
              {(activeKey === 'poir' || activeKey === 'asn' ? FILTERS_PO_ASN : FILTERS_RX_IC).map((f) => (
                <TouchableOpacity
                  key={f}
                  style={[
                    styles.menuItem,
                    (activeKey === 'poir' || activeKey === 'asn')
                      ? activeFilter === toBackendStatus(f) && styles.menuItemActive
                      : (String(f).toLowerCase() === 'all'
                        ? activeFilter == null
                        : (String(f).toLowerCase() === 'purchase order' ? activeFilter === 'purchase_order' : activeFilter === 'asn')) && styles.menuItemActive
                  ]}
                  onPress={() => handlePick(f)}
                >
                  <Text
                    style={[
                      styles.menuText,
                      (activeKey === 'poir' || activeKey === 'asn')
                        ? activeFilter === toBackendStatus(f) && styles.menuTextActive
                        : (String(f).toLowerCase() === 'all'
                          ? activeFilter == null
                          : (String(f).toLowerCase() === 'purchase order' ? activeFilter === 'purchase_order' : activeFilter === 'asn')) && styles.menuTextActive
                    ]}
                  >
                    {pretty(f)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
        <View style={{ position: 'relative' }}>
          <TouchableOpacity
            onPress={toggleSortMenu}
            style={styles.dropdownHalf}
            activeOpacity={0.8}
          >
            <Text style={styles.sortText}>Sort</Text>
            <SortDropdownIcon width={24} height={24} fill="#233E55" />
          </TouchableOpacity>

          {sortMenuOpen && (
            <View style={styles.menuAnchoredfilter}>
              {getSortOptionsForTab(activeKey).map((opt) => (
                <TouchableOpacity
                  key={opt.key}
                  style={[
                    styles.menuItem,
                    sortField === opt.key && styles.menuItemActive
                  ]}
                  onPress={() => selectSortOption(opt.key)}
                >
                  <Text
                    style={[
                      styles.menuText,
                      sortField === opt.key && styles.menuTextActive
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>
      <FlatList
        data={POData}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={() => (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>No data found</Text>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 80 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('NewReceiveScreen', { selectedPO: item, fromScan: false, scannedPoNumber: null })}
            activeOpacity={0.9}
          >
            <View style={styles.card}>
              <View style={styles.toprow}>
                <View style={styles.topcardLeft}>
                  <Text style={styles.labelText}>PO Number</Text>
                  <Text style={styles.valueText}>{item.po_number}</Text>
                </View>
                <View style={styles.topcardRight}>
                  <Text style={styles.labelText}>Supplier</Text>
                  <Text style={styles.valueText}>
                    {item.supplier_name?.length > 20 ? item.supplier_name.substring(0, 20) + '...' : item.supplier_name}
                  </Text>
                </View>
              </View>
              <View style={styles.bottomrow}>
                <View style={styles.bottomcardLeft}>
                  <Text style={styles.labelText}>PO Status</Text>
                  <View style={styles.statusCard}>
                    <View style={styles.dot} />
                    <Text style={styles.receivestatusText}>{item.status}</Text>
                  </View>
                  {/* <Text style={[styles.valueText, { color: getStatusColor(item.status) }]}>{item.status}</Text> */}
                </View>
                <View style={styles.bottomcardRight}>
                  <Text style={styles.labelText}>PO Order Date</Text>
                  <Text style={styles.orderdatevalueText}>{formatDate(item.order_date)}</Text>
                </View>
              </View>
              <View style={styles.bottomrow}>
                <View style={styles.bottomcardLeft}>
                  <Text style={styles.labelText}>Receiving Status</Text>
                </View>
                <View className="styles.bottomcardRight" />
              </View>
              <View style={styles.bottomrow}>
                <View style={styles.bottomcardLeft}>
                  <View style={styles.poprogresscard}>
                    <View style={styles.progressLabel}>
                      <View style={{ flex: 1, flexDirection: 'row', marginBottom: scale(5) }}>
                        <Text style={[styles.progressText, { color: getPOProgressColor(item.received), marginRight: 5 }]}>Inspection Pending
                        </Text>
                        <View style={[styles.bardot, { backgroundColor: getPOProgressColor(item.received) }]} />
                        <Text style={[styles.progressText, { color: getPOProgressColor(item.received) }]}>Lines</Text>
                      </View>
                      {/* <View style={styles.dot} /> */}
                      <Text style={[styles.progresspercentage, { color: getPOProgressColor(item.received) }]}>{item.received}%</Text>
                    </View>
                    <View style={styles.poprogressWrapper}>
                      <View style={[styles.progressBarleft, { width: `${item.received}%`, backgroundColor: getPOProgressColor(item.received) }]} />
                    </View>
                  </View>
                </View>
                {/* <View style={styles.bottomcardRight} /> */}
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </>
  );

  const ASNList = () => (
    <>
          <View style={styles.iconCluster}>
        <View style={{ position: 'relative' }}>
          <TouchableOpacity
            onPress={() => {
              setMenuOpen((v) => !v);
              setSortMenuOpen(false);
            }}
            style={[styles.chip, isFilterActive && styles.chipActive]}
            activeOpacity={0.8}
          >
            {isFilterActive && <View style={styles.chipInner} />}
            <BackFilterIcon width={24} height={24} fill="#233E55" />
            <Text style={styles.sortText}>Filter</Text>
          </TouchableOpacity>

          {menuOpen && (
            <View style={styles.menuAnchored}>
              {(activeKey === 'poir' || activeKey === 'asn' ? FILTERS_PO_ASN : FILTERS_RX_IC).map((f) => (
                <TouchableOpacity
                  key={f}
                  style={[
                    styles.menuItem,
                    (activeKey === 'poir' || activeKey === 'asn')
                      ? activeFilter === toBackendStatus(f) && styles.menuItemActive
                      : (String(f).toLowerCase() === 'all'
                        ? activeFilter == null
                        : (String(f).toLowerCase() === 'purchase order' ? activeFilter === 'purchase_order' : activeFilter === 'asn')) && styles.menuItemActive
                  ]}
                  onPress={() => handlePick(f)}
                >
                  <Text
                    style={[
                      styles.menuText,
                      (activeKey === 'poir' || activeKey === 'asn')
                        ? activeFilter === toBackendStatus(f) && styles.menuTextActive
                        : (String(f).toLowerCase() === 'all'
                          ? activeFilter == null
                          : (String(f).toLowerCase() === 'purchase order' ? activeFilter === 'purchase_order' : activeFilter === 'asn')) && styles.menuTextActive
                    ]}
                  >
                    {pretty(f)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
        <View style={{ position: 'relative' }}>
          <TouchableOpacity
            onPress={toggleSortMenu}
            style={styles.dropdownHalf}
            activeOpacity={0.8}
          >
            <Text style={styles.sortText}>Sort</Text>
            <SortDropdownIcon width={24} height={24} fill="#233E55" />
          </TouchableOpacity>

          {sortMenuOpen && (
            <View style={styles.menuAnchoredfilter}>
              {getSortOptionsForTab(activeKey).map((opt) => (
                <TouchableOpacity
                  key={opt.key}
                  style={[
                    styles.menuItem,
                    sortField === opt.key && styles.menuItemActive
                  ]}
                  onPress={() => selectSortOption(opt.key)}
                >
                  <Text
                    style={[
                      styles.menuText,
                      sortField === opt.key && styles.menuTextActive
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>
    <FlatList
      data={AsnData}
      keyExtractor={(item) => String(item.asn_id || item.id)}
      contentContainerStyle={{ paddingBottom: 80 }}
      ListEmptyComponent={() => (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>No data found</Text>
        </View>
      )}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => navigation.navigate('AsnReceiptScreen', { selectedASN: item, fromScan: false, scannedAsnId: item.asn_id, scannedAsnNumber: item.asn_num })}
          activeOpacity={0.9}
        >
          <View style={styles.card}>
            <View style={styles.toprow}>
              <View style={styles.topcardLeft}>
                <Text style={styles.labelText}>ASN Number</Text>
                <Text style={styles.valueText}>{item.asn_num}</Text>
              </View>
              <View style={styles.topcardRight}>
                <Text style={styles.labelText}>Supplier</Text>
                <Text style={styles.valueText}>{item.supplier_name}</Text>
              </View>
            </View>
            <View style={styles.bottomrow}>
              <View style={styles.bottomcardLeft}>
                <Text style={styles.labelText}>Status</Text>
                  <View style={styles.statusCard}>
                    <View style={styles.dot} />
                    <Text style={styles.receivestatusText}>{item.status}</Text>
                  </View>
                {/* <Text style={[styles.valueText, { color: getStatusColor(item.status) }]}>{item.status}</Text> */}
              </View>
              <View style={styles.bottomcardRight}>
                <Text style={styles.labelText}>Shipped Date</Text>
                <Text style={styles.orderdatevalueText}>{formatDate(item.shipped_date)}</Text>
              </View>
            </View>
              <View style={styles.bottomrow}>
                <View style={styles.bottomcardLeft}>
                  <Text style={styles.labelText}>Receiving Status</Text>
                </View>
                <View className="styles.bottomcardRight" />
              </View>
              <View style={styles.bottomrow}>
                <View style={styles.bottomcardLeft}>
                  <View style={styles.progresscard}>
                    <View style={styles.progressLabel}>
                      <View style={{ flex: 1, flexDirection: 'row', marginBottom: scale(5) }}>
                        <Text style={[styles.progressText, { color: getProgressColor(item.receivedPct), marginRight: 5 }]}>Put-Away Pending
                        </Text>
                        <View style={[styles.bardot, { backgroundColor: getProgressColor(item.receivedPct) }]} />
                        <Text style={[styles.progressText, { color: getProgressColor(item.receivedPct) }]}>3 Lines</Text>
                      </View>
                      {/* <View style={styles.dot} /> */}
                      <Text style={[styles.progresspercentage, { color: getProgressColor(item.receivedPct) }]}>{item.receivedPct}%</Text>
                    </View>
                    <View style={styles.progressWrapper}>
                      <View style={[styles.progressBarleft, { width: `${item.receivedPct}%`, backgroundColor: getProgressColor(item.receivedPct) }]} />
                    </View>
                  </View>
                </View>
                {/* <View style={styles.bottomcardRight} /> */}
              </View>
          </View>
        </TouchableOpacity>
      )}
    />
    </>
  );

  const ReceivedList = () => (
    <>
          <View style={styles.iconCluster}>
        <View style={{ position: 'relative' }}>
          <TouchableOpacity
            onPress={() => {
              setMenuOpen((v) => !v);
              setSortMenuOpen(false);
            }}
            style={[styles.chip, isFilterActive && styles.chipActive]}
            activeOpacity={0.8}
          >
            {isFilterActive && <View style={styles.chipInner} />}
            <BackFilterIcon width={24} height={24} fill="#233E55" />
            <Text style={styles.sortText}>Filter</Text>
          </TouchableOpacity>

          {menuOpen && (
            <View style={styles.menuAnchored}>
              {(activeKey === 'poir' || activeKey === 'asn' ? FILTERS_PO_ASN : FILTERS_RX_IC).map((f) => (
                <TouchableOpacity
                  key={f}
                  style={[
                    styles.menuItem,
                    (activeKey === 'poir' || activeKey === 'asn')
                      ? activeFilter === toBackendStatus(f) && styles.menuItemActive
                      : (String(f).toLowerCase() === 'all'
                        ? activeFilter == null
                        : (String(f).toLowerCase() === 'purchase order' ? activeFilter === 'purchase_order' : activeFilter === 'asn')) && styles.menuItemActive
                  ]}
                  onPress={() => handlePick(f)}
                >
                  <Text
                    style={[
                      styles.menuText,
                      (activeKey === 'poir' || activeKey === 'asn')
                        ? activeFilter === toBackendStatus(f) && styles.menuTextActive
                        : (String(f).toLowerCase() === 'all'
                          ? activeFilter == null
                          : (String(f).toLowerCase() === 'purchase order' ? activeFilter === 'purchase_order' : activeFilter === 'asn')) && styles.menuTextActive
                    ]}
                  >
                    {pretty(f)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
        <View style={{ position: 'relative' }}>
          <TouchableOpacity
            onPress={toggleSortMenu}
            style={styles.dropdownHalf}
            activeOpacity={0.8}
          >
            <Text style={styles.sortText}>Sort</Text>
            <SortDropdownIcon width={24} height={24} fill="#233E55" />
          </TouchableOpacity>

          {sortMenuOpen && (
            <View style={styles.menuAnchoredfilter}>
              {getSortOptionsForTab(activeKey).map((opt) => (
                <TouchableOpacity
                  key={opt.key}
                  style={[
                    styles.menuItem,
                    sortField === opt.key && styles.menuItemActive
                  ]}
                  onPress={() => selectSortOption(opt.key)}
                >
                  <Text
                    style={[
                      styles.menuText,
                      sortField === opt.key && styles.menuTextActive
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>
    <FlatList
      data={ReceivedData}
      keyExtractor={(item) => String(item.id)}
      contentContainerStyle={{ paddingBottom: 80 }}
      ListEmptyComponent={() => (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>No data found</Text>
        </View>
      )}
      renderItem={({ item }) => {
        const isASN = String(item.received_type || '').toLowerCase() === 'asn';
        return (
          <TouchableOpacity
            onPress={() => {
              if (isASN) {
                navigation.navigate('AsnReceivedScreen', {
                  asn_id: item.asn_id,
                  header: {
                    receipt_num: item.receipt_num,
                    receipt_id: item.receipt_id,
                    asn_num: item.asn_num,
                    supplier_name: item.supplier_name,
                    supplier_site: item.supplier_site,
                    shipped_date: item.shipped_date,
                    expected_receipt_date: item.expected_receipt_date,
                    carrier: item.carrier,
                    pack_slip: item.pack_slip,
                    bol: item.bol,
                    waybill: item.waybill,
                    airbill: item.airbill,
                  },
                });
              } else {
                navigation.navigate('ReceivedSummaryScreen', {
                  readonly: true,
                  id: item.receipt_id,
                  listType: 'Received',
                  header: {
                    receiptNumber: item.receipt_num,
                    supplier: item.supplier_name,
                    poNumber: item.po_number ?? dash,
                    receiptDate: item.received_date,
                  },
                  selectedItems: [],
                });
              }
            }}
            activeOpacity={0.9}
          >
            {isASN ? <ASNReceiptCard item={item} /> : <POReceiptCard item={item} />}
          </TouchableOpacity>
        );
      }}
    />
    </>
  );

  const renderScene = {
    poir: POList,
    asn: ASNList,
    received: ReceivedList,
    InComplete: InCompleteList,
  };

  const handleScan = (value) => {
    const code = String(value).trim().toUpperCase();
    const poMatch = POIntialData.find((p) => String(p.po_number).toUpperCase() === code);
    const asnMatch = AsnIntialData.find((a) => String(a.asn_num).toUpperCase() === code);

    if (poMatch) {
      setShowScanner(false);
      Toast.show({ type: 'success', text1: 'PO found', text2: `${poMatch.po_number} • ${poMatch.supplier_name}`, position: 'top', visibilityTime: 5000 });
      navigation.navigate('NewReceiveScreen', { selectedPO: poMatch, fromScan: true, scannedPoNumber: code });
    } else if (asnMatch) {
      setShowScanner(false);
      Toast.show({ type: 'success', text1: 'ASN found', text2: `${asnMatch.asn_num} • ${asnMatch.supplier_name}`, position: 'top', visibilityTime: 5000 });
      navigation.navigate('AsnReceiptScreen', { selectedASN: asnMatch, fromScan: true, scannedAsnNumber: code, scannedAsnId: asnMatch.asn_id });
    } else {
      Toast.show({ type: 'error', text1: 'PO/IR/ASN not found', text2: `Scanned value ${code} not found`, position: 'top', visibilityTime: 5000 });
      setShowScanner(false);
    }
  };

  const InputRightIcon = useMemo(
    () => (
      <TouchableOpacity onPress={() => setShowScanner(true)}>
        <BarcodeScannerIcon width={24} height={24} fill="#233E55" />
      </TouchableOpacity>
    ),
    []
  );
    const InputLeftIcon = useMemo(
    () => (
      <TouchableOpacity onPress={() => setShowScanner(true)}>
        <InputSearchIcon width={24} height={24} fill="#233E55" />
      </TouchableOpacity>
    ),
    []
  );

  const toggleSortMenu = () => {
    setSortMenuOpen((v) => !v);
    setMenuOpen(false);
  };

  const selectSortOption = (key) => {
    if (sortField === key) {
      setSortField(null);
      restoreBaseline();
      setSortMenuOpen(false);
      return;
    }
    captureBaselineIfNeeded();
    setSortField(key);
    setSortMenuOpen(false);
  };

  const isSortDropdownActive = sortMenuOpen || !!sortField;
  const isFilterActive = menuOpen || activeFilter != null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <GlobalHeaderComponent organizationName={OrgData?.selectedOrgCode} screenTitle="Receiving" notificationCount={0} onBack={() => navigation.navigate('Home')} />
        {phase === 'loading' && (
          <View style={styles.loaderWrapper}>
            <ActivityIndicator size="large" color="#233E55" />
            <Text style={styles.statusText}>Loading...</Text>
          </View>
        )}
        {phase !== 'loading' && (
          <>
            <View style={styles.inputContainer}>
              {InputLeftIcon}
              <TextInput
                placeholder="Enter PO/IR/ASN"
                placeholderTextColor="#9D9FA3"
                style={styles.input}
                value={searchText}
                onChangeText={handleSearch}
              />
              {InputRightIcon}
            </View>

            <TabView
              navigationState={{ index, routes }}
              renderScene={SceneMap(renderScene)}
              onIndexChange={(i) => {
                setIndex(i);
                setActiveTab(i);
                setActiveFilter(null);
                setSortField(null);
                setSortMenuOpen(false);
                setMenuOpen(false);
                applyVisible(routes[i].key, searchText, null);
              }}
              initialLayout={initialLayout}
              swipeEnabled
              gestureHandlerProps={{ ref: pagerRef }}
              renderTabBar={(props) => (
                <View style={styles.tabBarRow}>
                  <View style={{ flex: 1 }}>
                    <TabBar
                      {...props}
                      indicatorStyle={{ backgroundColor: '#233E55', height: 3, bottom: -1 }}
                      style={{ backgroundColor: '#F7F9FB', elevation: 0 }}
                      scrollEnabled
                      tabStyle={{ width: 100, paddingHorizontal: 10 }}
                      activeColor="#233E55"
                      inactiveColor="#9D9FA3"
                      renderLabel={({ route, focused, color }) => <Text style={{ color, fontWeight: focused ? 'bold' : 'normal', fontSize: 12 }}>{route.title}</Text>}
                    />
                  </View>
                </View>
              )}
            />
          </>
        )}

        <Modal visible={showScanner} animationType="slide" onRequestClose={() => setShowScanner(false)}>
          <BarcodeScanner onScan={handleScan} onClose={() => setShowScanner(false)} />
        </Modal>
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FB' },
  loaderWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  statusText: { marginTop: 12, color: '#333', fontSize: 12 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', margin: 12, paddingHorizontal: 10, borderRadius: 8, justifyContent: 'space-between',borderWidth:1,borderColor:'#D9E4EE', },
  input: { flex: 1, height: 40, fontSize: 14, color: '#333' },
  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { fontSize: 16, color: 'gray' },

  card: { justifyContent: 'space-between', backgroundColor: '#FFFFFF', marginHorizontal: 12, marginVertical: 6, borderRadius: 12, padding: 12,borderWidth:1,borderColor:'#D9E4EE', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, },
  progresscard: { backgroundColor: '#F4F9FF', borderRadius: 10, padding: 12 },
  poprogresscard: {backgroundColor:'#FFF7ED',borderRadius: 10, padding: 12 },
  cardInsideSwipe: { marginHorizontal: 0, marginVertical: 0, borderRadius: 0 },
  progressLabel: { flex: 2, flexDirection: 'row' },

  toprow: { flex: 1, flexDirection: 'row', marginBottom: scale(5) },
  bottomrow: { flex: 1, flexDirection: 'row', marginBottom: scale(5) },
  topcardLeft: { flex: 1, flexDirection: 'column', paddingRight: scale(6), paddingBottom: scale(10), minWidth: 0 },
  topcardRight: { flex: 1, flexDirection: 'column', paddingLeft: scale(6), paddingBottom: scale(10), minWidth: 0 },
  bottomcardLeft: { flex: 1, flexDirection: 'column', paddingRight: scale(6), minWidth: 0 },
  bottomcardRight: { flex: 1, flexDirection: 'column', paddingLeft: scale(6), minWidth: 0 },
  newbottomrow: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', marginTop: scale(10) },
  newbottomcardLeft: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', paddingRight: scale(6), minWidth: 0 },
  newbottomcardRight: { flex: 1, justifyContent: 'flex-end', minWidth: 0 },
  newlabelText: { fontSize: ms(8), color: '#666666', flex: 1, marginRight: scale(6) },
  viewMoreBtn: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end' },
  viewMoreText: { fontSize: ms(10), marginRight: ms(6), color: '#033EFF', textDecorationLine: 'underline', textDecorationColor: '#033EFF', fontWeight: '500' },
  labelText: { fontSize: 12, color: '#9D9FA3', flex: 1, fontFamily: 'Mulish', marginBottom: scale(2), fontWeight: 600 },
  progressText: { fontSize: 12, marginBottom: scale(2), fontWeight: 700, letterSpacing: 0.5 },
  progresspercentage: { fontSize: 12, flex: 1, marginBottom: scale(2), fontWeight: 700, letterSpacing: 0.5, textAlign: 'right' },
  valueText: { fontFamily: 'Mulish', fontSize: 12, fontWeight: '700', color: '#595A5C', flex: 1, textAlign: 'left' },
  orderdatevalueText: { fontFamily: 'Mulish', fontSize: 12, fontWeight: '700', color: '#595A5C', flex: 1, textAlign: 'left',marginTop:-15 },
  subLabel: { fontSize: 10, color: '#555', marginTop: 4, marginBottom: 2 },
  progressWrapper: { backgroundColor: '#D9E4EE', borderRadius: 20, height: 10, width: '100%', justifyContent: 'center',  marginTop: 4, marginBottom: 6, },
  poprogressWrapper: { backgroundColor: '#FCDFCC', borderRadius: 20, height: 10, width: '100%', justifyContent: 'center',  marginTop: 4, marginBottom: 6, },
  progressBarleft: { height: 8, borderRadius: 2, marginHorizontal: 0 },

  incompleteRowContainer: { marginHorizontal: 12, marginVertical: 6, borderRadius: 12, backgroundColor: '#FFFFFF', overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3 },

  rightActionContainer: { backgroundColor: '#F8D2D4', justifyContent: 'center', alignItems: 'flex-end', width: 40 },
  actionButton: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 10 },

  tabBarRow: { flexDirection: 'row', zIndex: 999, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#7392AA', marginBottom: 10 },
  iconCluster: { flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'space-between', marginVertical: 6, padding: 12 },

  sharedSortTile: { flexDirection: 'row', alignItems: 'center', height: 32, borderRadius: 8, backgroundColor: '#ECF1F7', borderWidth: 1, borderColor: '#D6E3ED' },
  sortHalf: { width: 24, height: 32, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  sortDivider: { width: 1 },
  dropdownHalf: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 6,
    paddingHorizontal: 8,   // add space inside
    height: 32,
    backgroundColor: '#FFFFFF',  // give bg here (instead of absolute view)
    borderWidth: 1,
    borderColor: '#D9E4EE',
  },

  dropdownInnerWhite: { position: 'absolute', borderRadius: 6, backgroundColor: '#FFFFFF' },

  chip: { width: 82, height: 32, borderRadius: 8, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D6E3ED', alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  chipActive: { backgroundColor: '#E6F0FA' },
  chipInner: { position: 'absolute', height: 19, borderRadius: 4, backgroundColor: '#FFFFFF' },

  menuAnchored: { position: 'absolute', top: 36, left: 0, backgroundColor: '#FFFFFF', borderRadius: 16, paddingVertical: 6, minWidth: 240, shadowColor: '#000000', shadowOpacity: 0.12, shadowOffset: { width: 0, height: 4 }, shadowRadius: 12, elevation: 10, overflow: 'visible', zIndex: 90000 },
  menuAnchoredfilter: { position: 'absolute', top: 36, right: 0, backgroundColor: '#FFFFFF', borderRadius: 16, paddingVertical: 6, minWidth: 240, shadowColor: '#000000', shadowOpacity: 0.12, shadowOffset: { width: 0, height: 4 }, shadowRadius: 12, elevation: 10, overflow: 'visible', zIndex: 90000 },
  menuItem: { paddingVertical: 14, paddingHorizontal: 16, borderRadius: 10 },
  menuItemActive: { backgroundColor: '#E6F0FA' },
  menuText: { fontSize: 16, color: '#111' },
  menuTextActive: { fontWeight: '600' },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECF1F7', // soft light blue
    paddingVertical: 5,
    paddingHorizontal: 5,
    borderRadius: 8,
    width: '40%',
    marginBottom: scale(5)
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 5,
    backgroundColor: '#7392AA', // blue dot
    marginRight: 5,
  },

  receivestatusText: {
    fontSize: 12,
    color: '#7392AA',
    fontWeight: '600',
  },
  bardot: {
    width: 6,
    height: 6,
    borderRadius: 5,
    // backgroundColor: '#7392AA', // blue dot
    marginRight: 5,
    marginLeft: 5,
    // alignItems:'center',
    // justifyContent:'center',
    marginTop: 5
  },

  receivestatusbarText: {
    fontSize: 12,
    color: '#7392AA',
    fontWeight: '600',
  },
  sortText: {
    color: '#233E55',
    fontSize: 14,
    marginRight: 6,  // space between text & icon
    fontWeight: '500',
  },

});

export default ReceiveScreen;
