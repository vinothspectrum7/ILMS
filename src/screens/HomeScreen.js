import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, SafeAreaView, BackHandler, Platform, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import Toast from 'react-native-toast-message';
import HeaderComponent, { HEADER_METRICS } from '../components/HeaderComponent';
import { useFocusEffect } from '@react-navigation/native';
import { useReceivingStore } from '../store/receivingStore';
import { GetInventryData, GetLocatorsData, GetTOLocatorData, PriorityTaskList, RecentActivityList } from '../api/ApiServices';
import StatusCountCard from '../components/dashboard/StatusCountCard';
import TabbedCard from '../components/dashboard/TabbedCard';
import DonutChart from '../components/dashboard/DonutChart';
import StatsList from '../components/dashboard/StatsList';
import ActivityItem from '../components/dashboard/ActivityItem';
import TaskItem from '../components/dashboard/TaskItem';
import { colors } from '../theme/colors';
import TodayReceivedIcon from '../assets/icons/Received_icon.svg';
import OrderShippedIcon from '../assets/icons/dash_Order_shipped_icon.svg';
import LowStockIcon from '../assets/icons/Low_stock item_icon.svg';
import ExpandIcon from '../assets/icons/icon_expand.svg';
import MoreIcon from '../assets/icons/icon_more.svg';

const { width: screenWidth } = Dimensions.get('window');
const baseWidth = 375;
const rs = size => Math.round((screenWidth / baseWidth) * size);

export default function HomeScreen({ navigation }) {
  const [openPeriod, setOpenPeriod] = useState(false);
  const [period, setPeriod] = useState('today');
  const [periodItems] = useState([
    { label: 'Today', value: 'today' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' }
  ]);

  const [openInventoryOrgDropdown, setOpenInventoryOrgDropdown] = useState(false);
  const [Defaultorg, setDefaultorg] = useState(null);
  const [loadingRecent, setLoadingRecent] = useState(false);
  const [OrgCode, setOrgCode] = useState(null);
  const [BusinessName,setBusinessName] = useState(null);
  const [RecentList,setRecentList] = useState([]);
  const [PriorityList,setPriorityList] = useState([]);
  const [loadingPriority, setloadingPriority] = useState(false);
  const [defaultinventory, Setdefaultinventory] = useState(null);
  const { setOrgData, setInventoryList, setLocatorList, setLocatorInCache } = useReceivingStore();
  const resetReceiving = useReceivingStore(s => s.resetReceiving);
  const resetTab = useReceivingStore(s => s.resetTab);

  const [analyticsTab, setAnalyticsTab] = useState('shipping');
  const [listTab, setListTab] = useState('recent');

  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [activeFilterRecent, setActiveFilterRecent] = useState(null);
  const [activeFilterTasks, setActiveFilterTasks] = useState(null);

  useFocusEffect(React.useCallback(() => { resetReceiving(); return () => {}; }, [resetReceiving]));
  useFocusEffect(React.useCallback(() => { resetTab(); return () => {}; }, [resetTab]));
  useFocusEffect(
    React.useCallback(() => {
      if (Platform.OS !== 'android') return;
      let lastPress = 0;
      const onBackPress = () => {
        const now = Date.now();
        if (now - lastPress < 500) { BackHandler.exitApp(); return true; }
        lastPress = now;
        Toast.show({ type: 'info', text1: 'Press back again to exit', position: 'top', visibilityTime: 1000 });
        return true;
      };
      const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => sub.remove();
    }, [navigation])
  );

  const handleOrganizationChange = org => {
    setDefaultorg(org.value);
    setOrgCode(org.org_code);
    setBusinessName(org.business_unit_name);
  };

useEffect(() => {
  // Alert.alert(OrgCode)
  if (!OrgCode) return;
  // setLoadingRecent(true);
  // setloadingPriority(true);
  console.log(OrgCode,"OrgCodeOrgCode")
  Setdefaultinventory(null);
    setOrgData({
    selectedOrg: Defaultorg,
    selectedinventory: null,
    selectedOrgCode: OrgCode,
    BusinessName: BusinessName
  });
  const loadinventrydata = async () => {
    try {
      const inventrydata = await GetInventryData(OrgCode);
      if (inventrydata) {
        const inventoryList = inventrydata.map(d => ({
          id: d.sub_inv_id,
          name: d.sub_inv_name,
          enabled: d.sub_inv_enabled,
          is_default: d.is_default?d.is_default:null
        }));
        console.log(inventoryList,"inventoryLISTTTTTTTTT")

        setInventoryList(inventoryList);
        const di = inventoryList.find(o => o.is_default);
        Setdefaultinventory(di??null);   // ✔ set the new default inventory
    setOrgData({
    selectedOrg: Defaultorg,
    selectedinventory: null,
    selectedOrgCode: OrgCode,
    BusinessName: BusinessName
  });
      } else {
    Setdefaultinventory(null);
    setOrgData({
    selectedOrg: Defaultorg,
    selectedinventory: null,
    selectedOrgCode: OrgCode,
    BusinessName: BusinessName
  });
      }
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load SubInventories.' });
    }
  };
    const loadrecentactivity = async () => {
      setRecentList([]);
      // try {
      //   const recentdata = await RecentActivityList(Defaultorg,50);
      //   if (recentdata) {
      //     const recentList = recentdata.map(d => ({ id: `${d.type=='asn'?`ASN-${d.asn_num}`:`PO-${d.po_num}`}`, status:capitalizeFirstLetter(d.status), ago:getTimeAgo(d.time), value:d.units,unit: 'Units Scanned' }));
      //     // recentList.push({ id: 'PO-24596', status: 'Shipped', ago: '2 mins', value: 150, unit: 'Units Scanned' });
      //     setRecentList(recentList);
      //     setLoadingRecent(false);
      //   } else {
      //     setRecentList([]);
      //     setLoadingRecent(false);
      //   }
      // } catch (err) {
      //   setLoadingRecent(false);
      //   Toast.show({ type: 'error', text1: 'Error', text2: err, position: 'top', visibilityTime: 5000 });
      // }
    };
    const loadpriorityList = async () => {
      setPriorityList([]);
      // try {
      //   const prioritydata = await PriorityTaskList(Defaultorg,50);
      //   if (prioritydata) {
      //     const priorityList = prioritydata.map(d => ({ 
      //       id: d.type=='asn'?d.asn_num:d.po_num,
      //       label:`Receive ${d.type=='asn'?`ASN-${d.asn_num}`:`PO-${d.po_num}`}`, 
      //       value:d.units,
      //       unit: 'Items',
      //       priority:capitalizeFirstLetter(d.priority),
      //       due:getTimeAgo(d.time) }));
      //     setPriorityList(priorityList);
      //     setloadingPriority(false);
      //   } else {
      //     setPriorityList([]);
      //     setloadingPriority(false);
      //   }
      // } catch (err) {
      //   setLoadingRecent(false);
      //   Toast.show({ type: 'error', text1: 'Error', text2: err, position: 'top', visibilityTime: 5000 });
      // }
    };
  //   Setdefaultinventory(null);
  //   setOrgData({
  //   selectedOrg: Defaultorg,
  //   selectedinventory: null,
  //   selectedOrgCode: OrgCode,
  //   BusinessName: BusinessName
  // });
  // loadinventrydata();
  // loadrecentactivity();
  // loadpriorityList();

}, [Defaultorg, OrgCode, setInventoryList, setOrgData,BusinessName]);

useEffect(() => {
  if (defaultinventory) {
    loadlocatordata(OrgCode,defaultinventory);
  }
}, [defaultinventory]);


  // helper function
function getTimeAgo(isoTime) {
  const now = new Date();
  const past = new Date(isoTime);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  const minutes = Math.floor(diffInSeconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (diffInSeconds < 60) return `${diffInSeconds} sec${diffInSeconds !== 1 ? 's' : ''} ago`;
  if (minutes < 60) return `${minutes} min${minutes !== 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  return `${days} day${days !== 1 ? 's' : ''} ago`;
}

// Helper to capitalize first letter
function capitalizeFirstLetter(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

  const loadlocatordata = async (org_id,sub_inv) => {
    if (!sub_inv) return;
    try {
      const locdata = await GetTOLocatorData(org_id,sub_inv?.id);
      if (locdata) {
        const LocatorList = locdata.map(d => ({ id: d.locator, name: d.locator, code:d.locator }));
        setLocatorList(LocatorList);
        console.log(LocatorList,"LocatorList");
        console.log(locdata,"locdatalocdata");
        setLocatorInCache(sub_inv?.id, LocatorList);
      }
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load Locators. Please try again.', position: 'top', visibilityTime: 5000 });
    }
  };

  const STATUSCOUNT = [
    { Icon: TodayReceivedIcon, title: 'Today Received', value: 287 },
    { Icon: OrderShippedIcon, title: 'Order Shipped', value: 287 },
    { Icon: LowStockIcon, title: 'Low Stock Items', value: 287 }
  ];

  const SHIPPING_STATUS = {
    today: { total: 239, shipped: 156, processing: 28, ready: 43, hold: 12 },
    weekly: { total: 540, shipped: 340, processing: 68, ready: 96, hold: 36 },
    monthly: { total: 2100, shipped: 1400, processing: 220, ready: 360, hold: 120 },
    yearly: { total: 24000, shipped: 16200, processing: 2100, ready: 4200, hold: 1500 }
  };

  const stats = [
    { label: 'Shipped', value: SHIPPING_STATUS[period].shipped, color: colors.statGreen },
    { label: 'Processing', value: SHIPPING_STATUS[period].processing, color: colors.statBlue },
    { label: 'Ready to ship', value: SHIPPING_STATUS[period].ready, color: colors.statRed },
    { label: 'On Hold', value: SHIPPING_STATUS[period].hold, color: colors.statOrange }
  ];

  const segments = [
    { value: SHIPPING_STATUS[period].shipped, color: colors.statGreen },
    { value: SHIPPING_STATUS[period].processing, color: colors.statBlue },
    { value: SHIPPING_STATUS[period].ready, color: colors.statRed },
    { value: SHIPPING_STATUS[period].hold, color: colors.statOrange }
  ];

  // const recentActivity = [
  //   { id: 'PO-24596', status: 'Received', ago: '2 mins', value: 150, unit: 'Units Scanned' },
  //   { id: 'PO-24597', status: 'Shipped', ago: '2 mins', value: 150, unit: 'Units Scanned' },
  //   { id: 'PO-24598', status: 'Received', ago: '2 mins', value: 150, unit: 'Units Scanned' }
  // ];

  const priorityTasks = [
    { label: 'Receive PO-24596', priority: 'High', due: '10am', value: 125, unit: 'Items' },
    { label: 'Ship-24596', priority: 'Critical', due: '10am', value: 150, unit: 'Items' },
    { label: 'Receive PO-24599', priority: 'Medium', due: '10am', value: 125, unit: 'Items' }
  ];

  const visibleRecent = useMemo(() => {
    if (!activeFilterRecent) return RecentList;
    const key = String(activeFilterRecent).toLowerCase();
    return RecentList.filter(r => String(r.status).toLowerCase() === key);
  }, [RecentList, activeFilterRecent]);

  const visibleTasks = useMemo(() => {
    if (!activeFilterTasks) return PriorityList;
    const key = String(activeFilterTasks).toLowerCase();
    return PriorityList.filter(t => String(t.priority).toLowerCase() === key);
  }, [PriorityList, activeFilterTasks]);

  const toggleFilterMenu = () => setFilterMenuOpen(v => !v);

  const pickRecent = key => {
    setActiveFilterRecent(prev => (prev === key ? null : key));
    setFilterMenuOpen(false);
  };

  const pickTask = key => {
    setActiveFilterTasks(prev => (prev === key ? null : key));
    setFilterMenuOpen(false);
  };

  const onChangeListTab = key => {
    setListTab(key);
    setActiveFilterRecent(null);
    setActiveFilterTasks(null);
    setFilterMenuOpen(false);
  };

  const isRecentTab = listTab === 'recent';
  const menuItems = isRecentTab ? ['Received', 'Shipped'] : ['Critical', 'High', 'Medium'];
  const activeKey = isRecentTab ? activeFilterRecent : activeFilterTasks;

  const sectionZStyle = filterMenuOpen ? styles.zTop : null;

  const handleHeaderMenuSelect = name => {
    if (name === 'Receiving') {
      navigation.navigate('Receive');
      return;
    }
    if (name === 'Inventory') {
      navigation.navigate('Inventory');
      return;
    }
    Toast.show({ type: 'info', text1: name, text2: 'Navigation will be added soon.', position: 'top', visibilityTime: 1200 });
  };

  return (
    <SafeAreaView style={styles.container}>
      <HeaderComponent
        notificationCount={1}
        onNotificationPress={() => {}}
        onOrganizationChange={handleOrganizationChange}
        Defaultorg={v => setDefaultorg(v)}
        OrgCode={v => setOrgCode(v)}
        BusinessName={v=>setBusinessName(v)}
        // onCardPress={screen => navigation.navigate(screen)}
          onCardPress={(screen) => {
    // console.log('Navigation card clicked:', screen);
    if (screen === 'Shipping') {
      navigation.navigate('Ship_Entry'); 
      
    } else {
      navigation.navigate(screen); 
    }
  }}
        onMenuSelect={handleHeaderMenuSelect}
        menuVersion="26020407"
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: rs(40) }}>
        <View style={{ height: HEADER_METRICS.CONTENT_SPACER }} />
        <View style={styles.statussection}>
          <StatusCountCard items={STATUSCOUNT} />
        </View>
        <View style={styles.section}>
          <TabbedCard
            tabs={[{ key: 'shipping', label: 'Shipping Status' }, { key: 'inventory', label: 'Inventory Trends' }]}
            activeKey={analyticsTab}
            onChange={setAnalyticsTab}
            right={
              <DropDownPicker
                open={openPeriod}
                value={period}
                items={periodItems}
                setOpen={setOpenPeriod}
                setValue={setPeriod}
                containerStyle={styles.periodContainer}
                style={styles.periodStyle}
                labelStyle={styles.periodLabel}
                textStyle={styles.periodText}
                dropDownContainerStyle={styles.periodMenuContainer}
                ArrowUpIconComponent={({ style }) => <Text style={[style, { color: colors.textSecondary }]}>▲</Text>}
                ArrowDownIconComponent={({ style }) => <Text style={[style, { color: colors.textSecondary }]}>▼</Text>}
              />
            }
          >
            {analyticsTab === 'shipping' ? (
              <View style={styles.analyticsBody}>
                <DonutChart
                  size={rs(150)}
                  stroke={rs(18)}
                  segments={segments}
                  total={SHIPPING_STATUS[period].total}
                  centerTop={'Total No. of\nOrders'}
                  centerBottom={SHIPPING_STATUS[period].total}
                />
                <StatsList items={stats} />
              </View>
            ) : (
              <View style={styles.inventoryTrendsStub}>
                <Text style={styles.stubText}>Inventory Trends</Text>
              </View>
            )}
          </TabbedCard>
        </View>
        <View style={[styles.section, sectionZStyle]}>
          <TabbedCard
            tabs={[
              { key: 'recent', label: 'Recent Activity' },
              { key: 'tasks', label: 'Priority Tasks' }
            ]}
            activeKey={listTab}
            onChange={onChangeListTab}
            right={
              <View style={styles.headerIcons}>
                <ExpandIcon width={rs(20)} height={rs(20)} style={{ marginRight: rs(10) }} />
                <View style={styles.filterAnchor}>
                  <TouchableOpacity onPress={toggleFilterMenu} activeOpacity={0.8}>
                    <MoreIcon width={rs(20)} height={rs(20)} />
                  </TouchableOpacity>
                  {filterMenuOpen && (
                    <View style={styles.menuAnchored}>
                      {menuItems.map(m => {
                        const isActive = activeKey && String(activeKey).toLowerCase() === String(m).toLowerCase();
                        return (
                          <TouchableOpacity
                            key={m}
                            style={[styles.menuItem, isActive && styles.menuItemActive]}
                            activeOpacity={0.9}
                            onPress={() => (isRecentTab ? pickRecent(m) : pickTask(m))}
                          >
                            <Text style={[styles.menuText, isActive && styles.menuTextActive]}>{m}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </View>
              </View>
            }
          >
      {listTab === 'recent' ? (
        <View>
          {loadingRecent ? (
            <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 30 }}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : visibleRecent.length > 0 ? (
            visibleRecent.map(a => (
              <ActivityItem
                key={a.id}
                refId={a.id}
                status={a.status}
                ago={a.ago}
                value={a.value}
                unit={a.unit}
              />
            ))
          ) : (
            <Text style={{ textAlign: 'center', color: colors.textSecondary, marginVertical: 20 }}>
              No recent activity found
            </Text>
          )}
        </View>
      ) : (
        <View>
        {loadingPriority ? (
            <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 30 }}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : visibleTasks.length > 0 ? (
          visibleTasks.map((t, i) => (
            <TaskItem
              key={`${t.label}-${i}`}
              label={t.label}
              priority={t.priority}
              due={t.due}
              value={t.value}
              unit={t.unit}
            />
          ))
          ) : (
            <Text style={{ textAlign: 'center', color: colors.textSecondary, marginVertical: 20 }}>
              Data Not Found
            </Text>
          )
          }
        </View>
      )}
          </TabbedCard>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.pageBg },
  section: { paddingHorizontal: rs(16), marginBottom: rs(16), position: 'relative', overflow: 'visible' },
  zTop: { zIndex: 1000, elevation: 1000 },
  statussection: { paddingHorizontal: rs(16), marginBottom: rs(16), marginTop: rs(60) },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between' },
  analyticsBody: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: rs(6), paddingVertical: rs(8) },
  inventoryTrendsStub: { padding: rs(20), alignItems: 'center', justifyContent: 'center' },
  stubText: { color: colors.textSecondary },
  periodContainer: { width: rs(90), height: rs(30), marginStart: rs(5) },
  periodStyle: { backgroundColor: colors.cardBg, borderColor: colors.cardBorder, borderRadius: rs(8), minHeight: rs(10) },
  periodLabel: { color: colors.textSecondary, fontSize: rs(11), textAlign: 'center' },
  periodText: { color: colors.textSecondary, fontSize: rs(12) },
  periodMenuContainer: { backgroundColor: '#FFFFFF', borderColor: colors.cardBorder, borderRadius: rs(8), elevation: 1 },
  headerIcons: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'flex-end', marginBottom: 5, position: 'relative', zIndex: 1 },
  filterAnchor: { position: 'relative', overflow: 'visible' },
  menuAnchored: { position: 'absolute', top: rs(24), right: 0, backgroundColor: '#FFFFFF', borderRadius: rs(12), paddingVertical: rs(6), minWidth: rs(180), shadowColor: '#000000', shadowOpacity: 0.12, shadowOffset: { width: 0, height: 4 }, shadowRadius: 12, zIndex: 1, elevation: 2, overflow: 'visible' },
  menuItem: { paddingVertical: rs(12), paddingHorizontal: rs(14), borderRadius: rs(8) },
  menuItemActive: { backgroundColor: '#E6F0FA' },
  menuText: { fontSize: rs(14), color: colors.textPrimary || '#111' },
  menuTextActive: { fontWeight: '600' }
});
