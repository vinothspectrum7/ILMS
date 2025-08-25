import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  Alert,
  BackHandler,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { QrCode } from 'lucide-react-native';
import HeaderComponent, { HEADER_METRICS } from '../components/HeaderComponent';
import { ShippingStatusCard } from '../components/ShippingStatusCard';
import OrderShippedIcon from '../assets/icons/Order_Shipped_icon.svg';
import OrderScheduledTodayIcon from '../assets/icons/Order_Scheduled_today_icon.svg';
import BackOrderedIcon from '../assets/icons/Back_ordered_icon.svg';
import { useReceivingStore } from '../store/receivingStore';

import { useFocusEffect } from '@react-navigation/native';
import { GetInventryData, GetLocatorsData } from '../api/ApiServices';

const { width: screenWidth } = Dimensions.get('window');
const baseWidth = 375;
const scale = screenWidth / baseWidth;
const responsiveSize = (size) => Math.round(size * scale);

export default function HomeScreen({ navigation }) {
  const [openInventoryOrgDropdown, setOpenInventoryOrgDropdown] = useState(false);
  const [Defaultorg,setDefaultorg] = useState(null);
  const [OrgCode,setOrgCode] = useState(null);
  const [defaultinventory,Setdefaultinventory] = useState(null);
    const {
      OrgData, setOrgData,setInventoryList,setLocatorList
    } = useReceivingStore();
  const [selectedInventoryOrg, setSelectedInventoryOrg] = useState('Inventory ORG1');
  const [inventoryOrganizations] = useState([
    { label: 'Inventory ORG1', value: 'Inventory ORG1' },
    { label: 'Inventory ORG2', value: 'Inventory ORG2' },
    { label: 'Inventory ORG3', value: 'Inventory ORG3' },
  ]);

  const handleNotificationPress = () => Alert.alert('Notification', 'Notification button pressed!');
  const handleProfilePress = () => navigation.navigate('Login');
  const handleOrganizationChange = (org) =>{
    setDefaultorg(org.value);
    setOrgCode(org.org_code);
  };

    useEffect(() => {
      // Alert.alert(Defaultorg);
  if (!Defaultorg) return;
    const loadinventrydata = async () => {
      try {
        const inventrydata = await GetInventryData(Defaultorg);
        console.log(inventrydata,"inventrydata")
        if (inventrydata) {
          const inventoryList = inventrydata.map(d => ({
  id: d.sub_inv_id,
  name: d.sub_inv_name,
  enabled: d.sub_inv_enabled,
  is_default: d.is_default,
}));      
          setInventoryList(inventoryList);
          const defaultinventry = inventrydata.find(o => o.is_default);
          loadlocatordata(defaultinventory);
          console.log(defaultinventry,"defaultinventrydefaultinventrydefaultinventry")
          Setdefaultinventory(defaultinventry?.sub_inv_id ?? inventrydata[0]?.sub_inv_id);
        } else {
          Setdefaultinventory(null);
        }
      } catch (err) {
        console.error("Error loading SubInventory data:", err);
                Toast.show({
                  type: 'error',
                  text1: 'Error',
                  text2: 'Failed to load SubInventories. Please try again.',
                  position: 'top',
                });
      }
    };
    let obj = {selectedOrg:Defaultorg,selectedinventory:defaultinventory,selectedOrgCode:OrgCode} 
  setOrgData(obj);
    loadinventrydata();
  }, [Defaultorg,OrgCode]);

          const loadlocatordata = async (sub_id) => {
                    if (!sub_id) return;
                        try {
                          const locdata = await GetLocatorsData(sub_id);
                          console.log(locdata,"locdatalocdatalocdata")
                          if (locdata) {
                            const LocatorList = locdata.map(d => ({
                    id: d.locator_id,
                    name: d.locator_name,
                    enabled: d.locator_enabled,
                  }));      
                  setLocatorList(LocatorList);
                          }
                        } catch (err) {
                          console.error("Error loading Locator data:", err);
                                  Toast.show({
                                    type: 'error',
                                    text1: 'Error',
                                    text2: 'Failed to load Locators. Please try again.',
                                    position: 'top',
                                  });
                        }
          }
          
  const handleQrScanPress = () => navigation.navigate('QrScanner');

  const chartData = [
    { value: 35, label: 'Item 1', color: '#6398D5' },
    { value: 42, label: 'Item 2', color: '#88C152' },
    { value: 78, label: 'Item 3', color: '#F1A938' },
    { value: 65, label: 'Item 4', color: '#F8824A' },
    { value: 90, label: 'Item 5', color: '#566A7D' },
    { value: 35, label: 'Item 6', color: '#8C98A6' },
    { value: 75, label: 'Item 7', color: '#F2A091' },
  ];

  const resetReceiving = useReceivingStore(s => s.resetReceiving);

  useFocusEffect(
    React.useCallback(() => {
      resetReceiving();
      return () => {};
    }, [resetReceiving])
  );

  useFocusEffect(
        React.useCallback(() => {
          const onBackPress = () => {
            navigation.navigate('Login');
            return true;
          };
  
          const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
          return () => sub.remove();
        }, [navigation])
      );

  return (
    <SafeAreaView style={styles.container}>
      <HeaderComponent
        notificationCount={0}
        profileName="Vinoth Umasankar"
        onNotificationPress={handleNotificationPress}
        onOrganizationChange={handleOrganizationChange}
        Defaultorg={(value)=>setDefaultorg(value)}
        OrgCode={(value)=>{
          // Alert.alert(value)
          setOrgCode(value)}}
        onCardPress={(screen) => navigation.navigate(screen)}
        onMenu={handleProfilePress}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ height: HEADER_METRICS.CONTENT_SPACER }} />

        <View style={styles.section}>
          <Text style={styles.sectionShippingTitle}>Shipping Status</Text>
          <View style={styles.shippingStatusCardsContainer}>
            <ShippingStatusCard label="Order Shipped" count="8" icon={OrderShippedIcon} iconColor="#033EFF" onPress={() => {}} />
            <ShippingStatusCard label={
                  <>
                    Order{"\n"}
                    Scheduled today
                  </>
                } count="15" icon={OrderScheduledTodayIcon} iconColor="#10b981" onPress={() => {}} />
            <ShippingStatusCard label="Backordered" count="9" icon={BackOrderedIcon} iconColor="#f59e0b" onPress={() => {}} />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.chartHeader}>
            <Text style={styles.sectionTitle}>Inventory Chart</Text>
            <DropDownPicker
              open={openInventoryOrgDropdown}
              value={selectedInventoryOrg}
              items={inventoryOrganizations}
              setOpen={setOpenInventoryOrgDropdown}
              setValue={setSelectedInventoryOrg}
              containerStyle={styles.inventoryOrgDropdownContainer}
              style={styles.inventoryOrgDropdownStyle}
              labelStyle={styles.inventoryOrgDropdownLabel}
              textStyle={styles.inventoryOrgDropdownText}
              dropDownContainerStyle={styles.inventoryOrgDropdownMenuContainer}
              listMode="SCROLLVIEW"
              renderBadge={() => null}
              ArrowUpIconComponent={({ style }) => <Text style={[style, { color: '#6b7280' }]}>▲</Text>}
              ArrowDownIconComponent={({ style }) => <Text style={[style, { color: '#6b7280' }]}>▼</Text>}
            />
          </View>

          <View style={styles.inventoryChartContainer}>
            <View style={styles.yAxisWithGrid}>
              <View style={styles.yAxisLine} />
              {[90, 80, 70, 60, 50, 40, 30, 20, 10, 0].map((val) => (
                <View key={val} style={styles.gridRow}>
                  <Text style={styles.yAxisLabel}>{val}</Text>
                  <View style={styles.gridLine} />
                </View>
              ))}
              <Text style={styles.yAxisTitle}>No. of Items</Text>
            </View>

            <View style={styles.chartBarsSection}>
              <View style={styles.chartBarsContainer}>
                {chartData.map((item, index) => (
                  <View key={index} style={styles.barContainer}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: (item.value / 90) * responsiveSize(160),
                          backgroundColor: item.color,
                        },
                      ]}
                    />
                  </View>
                ))}
              </View>
              <View style={styles.xAxisLine} />
              <View style={styles.xAxisLabelsContainer}>
                {chartData.map((item, index) => (
                  <Text key={index} style={styles.xAxisLabel}>
                    {item.label}
                  </Text>
                ))}
              </View>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* <TouchableOpacity style={styles.fab} onPress={handleQrScanPress}>
        <QrCode size={responsiveSize(28)} color="#ffffff" strokeWidth={2} />
      </TouchableOpacity> */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  section: { paddingHorizontal: responsiveSize(20), marginBottom: responsiveSize(24) },
  sectionTitle: {
    fontSize: responsiveSize(16),
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: responsiveSize(16),
    marginTop: responsiveSize(0),
  },
  sectionShippingTitle: {
    fontSize: responsiveSize(16),
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: responsiveSize(16),
    marginTop: responsiveSize(60),
  },
  shippingStatusCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: responsiveSize(8),
    flexWrap: 'wrap',
    marginTop: responsiveSize(5),
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: responsiveSize(16),
  },
  inventoryOrgDropdownContainer: { width: responsiveSize(150), height: responsiveSize(30), zIndex: 10 },
  inventoryOrgDropdownStyle: {
    backgroundColor: '#FFFFFF',
    borderColor: '#e5e7eb',
    borderRadius: responsiveSize(8),
    minHeight: responsiveSize(30),
  },
  inventoryOrgDropdownLabel: { color: '#6b7280', fontSize: responsiveSize(14), textAlign: 'right' },
  inventoryOrgDropdownText: { color: '#6b7280', fontSize: responsiveSize(14) },
  inventoryOrgDropdownMenuContainer: {
    backgroundColor: '#FFFFFF',
    borderColor: '#e5e7eb',
    borderWidth: 1,
    borderRadius: responsiveSize(8),
  },
  inventoryChartContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: responsiveSize(16),
    paddingHorizontal: responsiveSize(16),
    paddingVertical: responsiveSize(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: responsiveSize(2) },
    shadowOpacity: 0.1,
    shadowRadius: responsiveSize(4),
    elevation: 2,
    minHeight: responsiveSize(270),
  },
  yAxisWithGrid: {
    width: responsiveSize(40),
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    position: 'relative',
    marginBottom: 11,
  },
  yAxisLine: {
    position: 'absolute',
    top: 0,
    bottom: 5,
    left: responsiveSize(40),
    width: 1,
    backgroundColor: '#d1d5db',
    zIndex: 1,
  },
  gridRow: { flexDirection: 'row', alignItems: 'center', height: responsiveSize(18) },
  yAxisLabel: {
    fontSize: responsiveSize(10),
    color: '#6b7280',
    width: responsiveSize(30),
    textAlign: 'right',
    marginRight: responsiveSize(4),
    marginBottom: responsiveSize(4),
  },
  gridLine: { height: 1, backgroundColor: '#e5e7eb', flex: 1, marginBottom: 1 },
  yAxisTitle: {
    position: 'absolute',
    left: responsiveSize(-20),
    top: '50%',
    transform: [{ rotate: '-90deg' }, { translateY: -responsiveSize(20) }],
    fontSize: responsiveSize(10),
    color: '#6b7280',
    fontWeight: '600',
    width: responsiveSize(90),
    textAlign: 'center',
  },
  chartBarsSection: { flex: 1, justifyContent: 'flex-end', position: 'relative', paddingBottom: -16 },
  chartBarsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: responsiveSize(180),
    paddingBottom: 0,
  },
  barContainer: { alignItems: 'center', justifyContent: 'flex-end', width: responsiveSize(32) },
  bar: { marginStart: 4, width: responsiveSize(12), borderRadius: responsiveSize(4), marginBottom: responsiveSize(3) },
  xAxisLine: { position: 'absolute', bottom: responsiveSize(16), left: 0, right: 0, height: 1, backgroundColor: '#d1d5db' },
  xAxisLabelsContainer: { flexDirection: 'row', justifyContent: 'space-around', marginTop: responsiveSize(4), paddingHorizontal: responsiveSize(6) },
  xAxisLabel: { fontSize: responsiveSize(8), color: '#6b7280', textAlign: 'center', width: responsiveSize(32) },
  bottomSpacing: { height: responsiveSize(100) },
  fab: {
    position: 'absolute',
    bottom: responsiveSize(30),
    left: '50%',
    marginLeft: responsiveSize(-28),
    width: responsiveSize(56),
    height: responsiveSize(56),
    borderRadius: responsiveSize(28),
    backgroundColor: '#233E55',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: responsiveSize(4) },
    shadowOpacity: 0.3,
    shadowRadius: responsiveSize(12),
    elevation: 8,
    zIndex: 5,
  },
});
