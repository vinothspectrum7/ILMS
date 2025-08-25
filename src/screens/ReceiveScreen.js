import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Modal,
  BackHandler,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import BarcodeScanner from './BarCodeScanner';
import GlobalHeaderComponent from '../components/GlobalHeaderComponent';
import BarcodeScannerIcon from '../assets/icons/barcodescanner.svg';
import SearchIcon from '../assets/icons/search.svg';
import { useReceivingStore } from '../store/receivingStore';
import { FetchData, GetPoItems } from '../api/ApiServices';

const initialLayout = { width: Dimensions.get('window').width };

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BASE_WIDTH = 375;
const scale = (size) => (SCREEN_WIDTH / BASE_WIDTH) * size;
const ms = (size, factor = 0.35) => size + (scale(size) - size) * factor;

// const poData = [
//   { id: '1', purchaseReceipt: 'PR-00002', poNumber: 'PO-00002', supplier: '3DIng',     poDate: '21 JUL 2025', status: 'OPEN', received: 40, billed: 60 },
//   { id: '2', purchaseReceipt: 'PR-00003', poNumber: 'PO-00003', supplier: 'TechCo',    poDate: '22 JUL 2025', status: 'OPEN', received: 55, billed: 80 },
//   { id: '3', purchaseReceipt: 'PR-00004', poNumber: 'PO-00004', supplier: 'DesignHub', poDate: '23 JUL 2025', status: 'OPEN', received: 70, billed: 75 },
//   { id: '4', purchaseReceipt: 'PR-00005', poNumber: 'PO-00005', supplier: 'BuildCorp', poDate: '24 JUL 2025', status: 'OPEN', received: 90, billed: 90 },
// ];

const receivedData = [
  { id: '1', purchaseReceipt: 'PR-00002', poNumber: 'PO-00002', supplier: '3DIng',         receivedDate: '21 Jul 2025', status: 'Fully Received' },
  { id: '2', purchaseReceipt: 'PR-00003', poNumber: 'PO-00003', supplier: 'TechNerds',     receivedDate: '22 Jul 2025', status: 'Partially Received' },
  { id: '3', purchaseReceipt: 'PR-00004', poNumber: 'PO-00004', supplier: 'CreativeTools', receivedDate: '23 Jul 2025', status: 'Fully Received' },
  { id: '4', purchaseReceipt: 'PR-00005', poNumber: 'PO-00005', supplier: 'BuildCorp',     receivedDate: '24 Jul 2025', status: 'Fully Received' },
];

const ReceiveScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { resetReceiving,OrgData } = useReceivingStore();
  // const selectedorg = route?.params?.selectedOrg || null;

  const [index, setIndex] = useState(0);
  const [showScanner, setShowScanner] = useState(false);
  const [AsnIntialData,setAsnIntialData] = useState([]);
  const [AsnData,setAsnData] = useState([]);

  const [routes] = useState([
    { key: 'poir', title: 'PO/IR' },
    { key: 'asn', title: 'ASN' },
    { key: 'received', title: 'Received' },
    { key: 'inprogress', title: 'In-progress' },
  ]);
  const activeKey = routes[index].key;

  const [searchText, setSearchText] = useState('');
  const [POData, setPOData] = useState([]);
  const [filteredReceived, setFilteredReceived] = useState(receivedData);
  const [POIntialData, setPOIntialData] = useState([]);

  const [phase, setPhase] = useState('idle');

  useEffect(() => {
    console.log(OrgData,"selectedorgselectedorgselectedorgselectedorg")
      if (!OrgData?.selectedOrg) return;
      setPhase('loading');
    const loadData = async () => {
      // setPhase('loading');
      setAsnData([]);
      setAsnIntialData([]);
      try {
        const userdata = await FetchData(OrgData?.selectedOrg);
        setAsnData(userdata);
        setAsnIntialData(userdata);
        setPhase('success');
        console.log(userdata, "usereejebu");
      } catch (err) {
        console.error("Error loading ASN data:", err);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to load ASN data. Please try again.',
          position: 'top',
        });
        setPhase('error');
      }
    };

    const loadPoData = async () => {
      // setPhase('loading');
      setPOData([]);
      setPOIntialData([]);
      try {
        const podata = await GetPoItems(OrgData?.selectedOrg);
        if(podata!=undefined && podata.length!=0){
          podata.forEach((element,index) => {
            element["id"] = index+1;
            const total_ord_qty = element.total_ord_qty;
            const total_received_qty = element.total_received_qty;
            // calculate percentage
            const receivedPercent =
              total_ord_qty > 0
                ? (total_received_qty / total_ord_qty) * 100
                : 0;
            element["received"] = receivedPercent;
          });
        }
        setPOData(podata);
        setPOIntialData(podata);
        setPhase('success');
        console.log(podata, "podatapodatapodata");
      } catch (err) {
        console.error("Error loading PO data:", err);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to load Purchase Order data. Please try again.',
          position: 'top',
        });
        setPhase('error');
      }
    };

    loadPoData();
    loadData();
  }, [OrgData?.selectedOrg]);

  useFocusEffect(
    React.useCallback(() => {
      resetReceiving();
      return () => {};
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

  const handleSearch = (text) => {
    setSearchText(text);
    const q = text.trim().toLowerCase();

    if (activeKey === 'received') {
      setFilteredReceived(
        receivedData.filter(
          r =>
            r.purchaseReceipt.toLowerCase().includes(q) ||
            r.poNumber.toLowerCase().includes(q) ||
            r.supplier.toLowerCase().includes(q)
        )
      );
    }
    else if(activeKey === 'asn'){
      setAsnData(
        AsnIntialData.filter(
          p =>
            p.asn_num.toLowerCase().includes(q) ||
            p.supplier_name.toLowerCase().includes(q)
        )
      );
    } else {
      setPOData(
        POIntialData.filter(
          p =>
            p.po_number.toLowerCase().includes(q) ||
            p.supplier_name.toLowerCase().includes(q)
        )
      );
    }
  };

  const handleScan = (value) => {
    const code = String(value).trim().toUpperCase();
    const match = POData.find(p => String(p.po_number).toUpperCase() === code);
    const asnmatch = AsnIntialData.find(a =>String(a.asn_num).toUpperCase() ===code);
    console.log(POData,code,"PODataonscanning")
    console.log(asnmatch,"asnmatch");

    if (match) {
      setShowScanner(false);
      Toast.show({
        type: 'success',
        text1: 'PO found',
        text2: `${match.poNumber} • ${match.supplier}`,
        position: 'top',
        visibilityTime: 1000,
      });
      navigation.navigate('NewReceiveScreen', {
        selectedPO: match,
        fromScan: true,
        scannedPoNumber: code,
      });
    }
    else if(asnmatch){
      setShowScanner(false);
      Toast.show({
        type: 'success',
        text1: 'ASN found',
        text2: `${asnmatch.asn_num} • ${asnmatch.supplier_name}`,
        position: 'top',
        visibilityTime: 1000,
      });
      navigation.navigate('AsnReceiptScreen', {
        selectedASN: asnmatch,
        fromScan: true,
        scannedAsnNumber: code,
        scannedAsnId:asnmatch.asn_id,
      });
    } else {
      Toast.show({
        type: 'error',
        text1: 'PO/IR number not found',
        text2: `Scanned PO number ${code} not found`,
        position: 'top',
        visibilityTime: 1500,
      });
      setShowScanner(false);
    }
  };

  const InputRightIcon = useMemo(() => {
    const isReceived = activeKey === 'received';
    return (
      <TouchableOpacity
        onPress={() => {
          if (isReceived) return;
          setShowScanner(true);
        }}
      >
        {isReceived ? (
          <SearchIcon width={20} height={20} fill="#233E55" />
        ) : (
          <BarcodeScannerIcon width={24} height={24} fill="#233E55" />
        )}
      </TouchableOpacity>
    );
  }, [activeKey]);

  const POList = () => (
    <FlatList
      data={POData}
      keyExtractor={(item) => item.id}
          ListEmptyComponent={() => (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 16, color: 'gray' }}>No data found</Text>
      </View>
    )}
      contentContainerStyle={{ paddingBottom: 80 }}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => navigation.navigate('NewReceiveScreen', 
            { selectedPO: item,fromScan: false,scannedPoNumber: null, })}
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
              <Text style={styles.valueText}>{item.supplier_name}</Text>
              </View>
            </View>
            <View style={styles.bottomrow}>
              <View style={styles.bottomcardLeft}>
              <Text style={styles.labelText}>PO Status</Text>
              <Text style={[styles.valueText, styles.openText]}>{item.status}</Text>
              </View>
              <View style={styles.bottomcardRight}>
              <Text style={styles.labelText}>PO Order Date</Text>
              <Text style={styles.valueText}>{formatDate(item.order_date)}</Text>
              </View>
            </View>
            <View style={styles.bottomrow}>
              <View style={styles.bottomcardLeft}>
              <Text style={styles.subLabel}>Received</Text>
              </View>
              <View style={styles.bottomcardRight}>
              <Text style={styles.subLabel}>Billed</Text>
              </View>
            </View>
            <View style={styles.bottomrow}>
              <View style={styles.bottomcardLeft}>
              <View style={styles.progressWrapper}>
                <View style={[styles.progressBarleft, { width: `${item.received}%` }]} />
              </View>
              </View>
              <View style={styles.bottomcardRight}>
              <View style={styles.progressWrapper}>
                <View style={[styles.progressBarright, { width: `40%` }]} />
              </View>
              </View>
            </View>



          </View>
        </TouchableOpacity>
      )}
    />
  );

  const ASNList = () => (
    <FlatList
      data={AsnData}
      keyExtractor={(item) => item.asn_id}
      contentContainerStyle={{ paddingBottom: 80 }}
                ListEmptyComponent={() => (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 16, color: 'gray' }}>No data found</Text>
      </View>
    )}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => navigation.navigate('AsnReceiptScreen', 
            {selectedASN: item,
        fromScan: false,
        scannedAsnId:item.asn_id,
        scannedAsnNumber: item.asn_num, })}
          activeOpacity={0.9}
        >
          <View style={styles.card}>
            <View style={styles.cardLeft}>
              <View style={styles.row}>
                <Text style={styles.labelText}>ASN Number</Text>
                <Text style={styles.valueText}>{item.asn_num}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.labelText}>Status</Text>
                <Text style={[styles.valueText, styles.openText]}>{item.status}</Text>
              </View>
              <Text style={styles.subLabel}>Received</Text>
              <View style={styles.progressWrapper}>
                <View style={[styles.progressBarleft, { width: `40%` }]} />
              </View>
            </View>

            <View style={styles.cardRight}>
              <View style={styles.row}>
                <Text style={styles.labelText}>Supplier</Text>
                <Text style={styles.valueText}>{item.supplier_name}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.labelText}>Shipped Date</Text>
                <Text style={styles.valueText}>{item.shipped_date}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      )}
    />
  );

  const ReceivedList = () => (
    <FlatList
      data={filteredReceived}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ paddingBottom: 80 }}
                ListEmptyComponent={() => (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 16, color: 'gray' }}>No data found</Text>
      </View>
    )}
      renderItem={({ item }) => {
        const statusColor =
          item.status === 'Fully Received' ? '#18A558' :
          item.status === 'Partially Received' ? '#2FB67A' : '#333';
        return (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() =>
              navigation.navigate('ReceiveSummaryScreen', {
                readonly: true,
                id: item.id,
                header: {
                  receiptNumber: item.purchaseReceipt,
                  supplier: item.supplier,
                  poNumber: item.poNumber,
                  receiptDate: item.receivedDate,
                },
                selectedItems: [],
              })
            }
          >
            <View style={styles.rcvCard}>
              <View style={styles.rcvCols}>
                <View style={styles.rcvColLeft}>
                  <View style={styles.infoRow}>
                    <Text style={styles.rcvLabel}>Purchase Receipt</Text>
                    <Text style={[styles.rcvValue, styles.bold]}>{item.purchaseReceipt}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.rcvLabel}>Supplier</Text>
                    <Text style={styles.rcvValue}>{item.supplier}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.rcvLabel}>Status</Text>
                    <Text style={[styles.rcvStatus, { color: statusColor }]}>{item.status}</Text>
                  </View>
                </View>

                <View style={styles.rcvColRight}>
                  <View style={styles.infoRow}>
                    <Text style={styles.rcvLabel}>PO Number</Text>
                    <Text style={styles.rcvValue}>{item.poNumber}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.rcvLabel}>Received Date</Text>
                    <Text style={styles.rcvValue}>{item.receivedDate}</Text>
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        );
      }}
    />
  );

  const renderScene = {
    poir: POList,
    asn: ASNList,
    received: ReceivedList,
    inprogress: POList,
  };

const formatDate = (date) => {
  const d = new Date(date);
  const dd = String(d.getDate()).padStart(2, '0');
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const mmm = monthNames[d.getMonth()];
  const yyyy = d.getFullYear();
  return `${dd} ${mmm} ${yyyy}`;
};

  return (
    <View style={styles.container}>
      <GlobalHeaderComponent
        organizationName={OrgData?.selectedOrgCode}
        screenTitle="Receiving"
        notificationCount={0}
        profileName="Vinoth Umasankar"
        onBack={() => navigation.navigate('Home')}
        onMenu={() => setMenuOpen(true)}
        onNotificationPress={() => navigation.navigate('Home')}
        onProfilePress={() => navigation.navigate('Home')}
      />

      {phase === 'loading' && (
        <View style={styles.loaderWrapper}>
          <ActivityIndicator size="large" color="#233E55" />
          <Text style={styles.statusText}>Loading data…</Text>
        </View>
      )}

      {phase !== 'loading' && (
        <>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Enter PO/IR/ASN"
              placeholderTextColor="#999"
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
              handleSearch(searchText);
            }}
            initialLayout={initialLayout}
            renderTabBar={(props) => (
              <TabBar
                {...props}
                indicatorStyle={{ backgroundColor: '#233E55', height: 3 }}
                style={{ backgroundColor: '#fff', elevation: 0 }}
                scrollEnabled
                tabStyle={{ width: 'auto', paddingHorizontal: 10 }}
                activeColor="#233E55"
                inactiveColor="#444"
                renderLabel={({ route, focused, color }) => (
                  <Text style={{ color, fontWeight: focused ? 'bold' : 'normal', fontSize: 12 }}>
                    {route.title}
                  </Text>
                )}
              />
            )}
          />
        </>
      )}

      <Modal visible={showScanner} animationType="slide" onRequestClose={() => setShowScanner(false)}>
        <BarcodeScanner onScan={handleScan} onClose={() => setShowScanner(false)} />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  loaderWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  statusText: { marginTop: 12, color: '#333', fontSize: 14 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eee',
    margin: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    justifyContent: 'space-between',
  },
  input: { flex: 1, height: 40, fontSize: 14, color: '#333' },
  card: {
    justifyContent: 'space-between',
    backgroundColor: '#FBFBFB',
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 12,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  topcardLeft: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', paddingRight: scale(6), paddingBottom: scale(6), minWidth: 0 },
  topcardRight: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', paddingLeft: scale(6), paddingBottom: scale(6), minWidth: 0 },
  bottomcardLeft: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', paddingRight: scale(6), minWidth: 0 },
  bottomcardRight: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', paddingLeft: scale(6), minWidth: 0 },
  toprow: {
    flex: 1,
    flexDirection: 'row',
    marginBottom: scale(5),
  },
  bottomrow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: scale(5),
  },
  labelText: { fontSize: 10, color: '#555', flex: 1 },
  valueText: { fontSize: 10, fontWeight: 'bold', color: '#1C1C1C', flex: 1, textAlign: 'left' },
  openText: { color: 'green' },
  subLabel: { fontSize: 10, color: '#555', marginTop: 4, marginBottom: 2 },
  progressWrapper: {
    backgroundColor: '#ECF1F7',
    borderRadius: 20,
    height: 12,
    width: '75%',
    justifyContent: 'center',
    elevation: 4,
    marginTop: 4,
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  progressBarleft: { height: 8, backgroundColor: '#233E55', borderRadius: 20, marginHorizontal: 4 },
  rcvCard: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 12,
    padding: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  progressBarright: { height: 8, backgroundColor: '#89ADC9', borderRadius: 20, marginHorizontal: 4 },
  rcvCard: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 12,
    padding: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  rcvCols: { flexDirection: 'row' },
  rcvColLeft: { flex: 1, paddingRight: 10 },
  rcvColRight: { flex: 1, paddingLeft: 10 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  rcvLabel: { fontSize: 12, color: '#7A7A7A' },
  rcvValue: { fontSize: 12, color: '#1C1C1C' },
  rcvStatus: { fontSize: 12, fontWeight: '600' },
  bold: { fontWeight: 'bold' },
});

export default ReceiveScreen;
