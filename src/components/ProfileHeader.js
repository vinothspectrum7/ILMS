import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity, Dimensions, Modal, TouchableWithoutFeedback, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EnnVeeLogoSmall from '../assets/icons/EnnVeeLogoSmall.svg';
import BellIcon from '../assets/icons/bellnotification.svg';
import BackLeftArrow from '../assets/icons/backleftarrow.svg';
import HamburgerMenu from '../assets/icons/hamburgermenu.svg';
import Home_HM from '../assets/icons/HM/Home_HM.svg';
import Receiving_HM from '../assets/icons/HM/Receiving_HM.svg';
import Inventory_HM from '../assets/icons/HM/Inventory_HM.svg';
import Shiping_HM from '../assets/icons/HM/Shiping_HM.svg';
import CycleCount_HM from '../assets/icons/HM/CycleCount_HM.svg';
import PhysicalInventory_HM from '../assets/icons/HM/PhysicalInventory_HM.svg';
import InventoryTransfer_HM from '../assets/icons/HM/InventoryTransfer_HM.svg';
import ItemInquiry_HM from '../assets/icons/HM/ItemInquiry_HM.svg';
import PickWave_HM from '../assets/icons/HM/PickWave_HM.svg';
import PickConfirmation_HM from '../assets/icons/HM/PickConfirmation_HM.svg';
import PackConfirmation_HM from '../assets/icons/HM/PackConfirmation_HM.svg';
import CancelPO_HM from '../assets/icons/HM/CancelPO_HM.svg';
import ModifyReceiptQty_HM from '../assets/icons/HM/ModifyReceiptQty_HM.svg';
import LPNinquiry_HM from '../assets/icons/HM/LPNinquiry_HM.svg';
import RealTimeInventory_HM from '../assets/icons/HM/RealTimeInventory_HM.svg';
import CarrierManagnt_HM from '../assets/icons/HM/CarrierManagnt_HM.svg';

const BRAND_BG = '#233E55';
const NAV_BG = '#5D768B';
const RED = '#FF0000';
const WHITE = '#FFFFFF';
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BASE_WIDTH = 375;
const scale = size => (SCREEN_WIDTH / BASE_WIDTH) * size;
const ms = (size, factor = 0.35) => size + (scale(size) - size) * factor;

function getInitials(name = '') {
  const n = String(name).trim().replace(/\s+/g, ' ');
  if (!n) return '';
  const parts = n.split(' ');
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function org3(name = '') {
  return String(name).trim().slice(0, 3).toUpperCase();
}

function MenuItem({ Icon, label, onPress }) {
  return (
    <TouchableOpacity onPress={() => onPress(label)} style={styles.menuItem} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
      {Icon ? <Icon width={12 * 1.8} height={12 * 1.8} /> : null}
      <Text style={styles.menuItemText}>{label}</Text>
    </TouchableOpacity>
  );
}

function SectionTitle({ children }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

export default function ProfileHeader({
//   organizationName = 'EnnVee',
  screenTitle = 'Receive',
  contextInfo = '',
  notificationCount = 0,
  onBack = () => {},
  onMenu = () => {},
  onNotificationPress = () => {},
  onMenuSelect = () => {},
  menuVersion = '25121921',
}) {
  const title = `${screenTitle}${contextInfo ? `(${contextInfo})` : ''}`;
  const showDot = Number(notificationCount) > 0;
  const [profileNames, setprofileName] = useState(null);
  const navigation = useNavigation();
  const [menuOpen, setMenuOpen] = useState(false);

    const loadUserName = useCallback(async () => {
        const raw = await AsyncStorage.getItem('user_name');
        if(raw){
          const initials = getInitials(raw);
          setprofileName(initials);
        }
    }, []);
  
    useEffect(() => {
      loadUserName();
    }, [loadUserName]);
  
    useFocusEffect(
      React.useCallback(() => {
        loadUserName();
      }, [loadUserName])
    );
    const profilePress = async()=>{
      navigation.navigate("settings");
    }
    const NotificationPress = async()=>{
      navigation.navigate("Notification");
    }

  const toggleMenu = () => {
    onMenu?.();
    setMenuOpen(v => !v);
  };

  const handleSelect = name => {
    setMenuOpen(false);
    onMenuSelect?.(name);
    if (name === 'Receiving') navigation.navigate('Receive');
    if (name === 'Inventory') navigation.navigate('Inventory');
  };

  const handleHomePress = () => {
    setMenuOpen(false);
    navigation.navigate('Home');
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <StatusBar translucent={false} barStyle="light-content" backgroundColor={BRAND_BG} />
      <View style={styles.brandingRow}>
        <View style={styles.brandLeft}>
          <EnnVeeLogoSmall width={scale(140)} height={scale(36)} />
        </View>
        <View style={styles.brandRight}>
          {/* <Text style={styles.version}>V: 25102918</Text> */}
          <TouchableOpacity onPress={NotificationPress} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={styles.bellWrap}>
            <BellIcon width={scale(22)} height={scale(22)} />
            {showDot && <View style={styles.dot} />}
          </TouchableOpacity>

          <TouchableOpacity onPress={profilePress} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={styles.avatar}>
            <Text style={styles.avatarText}>{profileNames}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.navRow}>
        <View style={styles.navLeft}>
          <TouchableOpacity onPress={onBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={styles.backBtn}>
            <BackLeftArrow width={scale(20)} height={scale(20)} />
          </TouchableOpacity>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
        </View>
        <TouchableOpacity onPress={toggleMenu} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <HamburgerMenu width={scale(24)} height={scale(24)} />
        </TouchableOpacity>
      </View>

      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <TouchableWithoutFeedback onPress={() => setMenuOpen(false)}>
          <View style={styles.menuBackdrop} />
        </TouchableWithoutFeedback>
        <View style={styles.menuAnchorRow}>
          <View style={styles.menuCard}>
            <View style={styles.menuHeaderRow}>
              <Text style={styles.menuHeaderTitle}>Menus</Text>
              <TouchableOpacity onPress={handleHomePress} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Home_HM width={scale(22)} height={scale(22)} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: SCREEN_HEIGHT * 0.7 }} bounces>
              <SectionTitle>Menus</SectionTitle>
              <MenuItem Icon={Receiving_HM} label="Receiving" onPress={handleSelect} />
              <MenuItem Icon={Inventory_HM} label="Inventory" onPress={handleSelect} />
              <MenuItem Icon={Shiping_HM} label="Shipping" onPress={handleSelect} />
              <SectionTitle>Inventory Operations</SectionTitle>
              <MenuItem Icon={CycleCount_HM} label="Cycle Count" onPress={handleSelect} />
              <MenuItem Icon={PhysicalInventory_HM} label="Physical Inventory" onPress={handleSelect} />
              <MenuItem Icon={InventoryTransfer_HM} label="Inventory Transfer" onPress={handleSelect} />
              <MenuItem Icon={ItemInquiry_HM} label="Item Inquiry" onPress={handleSelect} />
              <SectionTitle>Order Management</SectionTitle>
              <MenuItem Icon={PickWave_HM} label="Pick Wave Management" onPress={handleSelect} />
              <MenuItem Icon={PickConfirmation_HM} label="Pick Confirmation" onPress={handleSelect} />
              <MenuItem Icon={PackConfirmation_HM} label="Pack Confirmation" onPress={handleSelect} />
              <SectionTitle>Quick Actions</SectionTitle>
              <MenuItem Icon={CancelPO_HM} label="Cancel Purchase Order" onPress={handleSelect} />
              <MenuItem Icon={ModifyReceiptQty_HM} label="Modify Receipt Quantity" onPress={handleSelect} />
              <MenuItem Icon={LPNinquiry_HM} label="LPN Inquiry" onPress={handleSelect} />
              <MenuItem Icon={RealTimeInventory_HM} label="Real-time Inventory" onPress={handleSelect} />
              <MenuItem Icon={CarrierManagnt_HM} label="Carrier Management" onPress={handleSelect} />
            </ScrollView>
            <Text style={styles.menuVersion}>Version {menuVersion}</Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const DOT_SIZE = 12;
const AVATAR_SIZE = 30;

const styles = StyleSheet.create({
  safeArea: { backgroundColor: BRAND_BG },
  brandingRow: {
    backgroundColor: BRAND_BG,
    paddingHorizontal: ms(16),
    paddingTop: ms(12),
    paddingBottom: ms(12),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  version: { fontFamily: 'Mulish', fontWeight: 500, fontSize: 10, verticalAlign: 'middle', color: '#FFFFFF' },
  brandLeft: { flexShrink: 1, paddingRight: ms(12) },
  brandRight: { flexDirection: 'row', alignItems: 'center', gap: ms(12) },
  bellWrap: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  dot: { position: 'absolute', right: -ms(0), top: -ms(4), width: DOT_SIZE, height: DOT_SIZE, borderRadius: DOT_SIZE / 2, backgroundColor: RED },
  avatar: { width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2, backgroundColor: WHITE, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: BRAND_BG, fontSize: ms(10), fontWeight: '700' },
  navRow: { backgroundColor: NAV_BG, paddingHorizontal: ms(16), height: ms(50), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  navLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: ms(12) },
  backBtn: { paddingRight: ms(12) },
  title: { fontFamily: 'Mulish', fontWeight: '800', color: WHITE, fontSize: ms(14), letterSpacing: 0.3, flexShrink: 1 },
  menuBackdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  menuAnchorRow: { position: 'absolute', top: ms(99), right: ms(12), left: ms(12), alignItems: 'flex-end' },
  menuCard: {
    width: SCREEN_WIDTH - ms(105),
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  menuHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  menuHeaderTitle: { fontSize: 18, fontWeight: '700', color: '#233E55' },
  sectionTitle: { color: '#8A8A8A', fontSize: 14, marginTop: 10, marginBottom: 6, fontWeight: '700' },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, columnGap: 10 },
  menuItemText: { fontSize: 15, color: '#222' },
  menuVersion: { marginTop: 10, color: '#8A8A8A', fontSize: 12 },
});
