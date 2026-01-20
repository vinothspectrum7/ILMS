import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StatusBar, StyleSheet, TouchableOpacity, Dimensions, Modal, TouchableWithoutFeedback, ScrollView } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import OrganizationIcon from '../assets/icons/Organization_icon.svg';
import ReceiveIcon from '../assets/icons/Receive_icon.svg';
import InventoryIcon from '../assets/icons/Inventory_icon.svg';
import ShippingIcon from '../assets/icons/Shipping_icon.svg';
import EnnVeeLogoSmall from '../assets/icons/EnnVeeLogoSmall.svg';
import BellIcon from '../assets/icons/bellnotification.svg';
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
import { NavigationCard } from './NavigationCard';
import { GetOrgsData } from '../api/ApiServices';
import { useReceivingStore } from '../store/receivingStore';
import Header_DropDown from '../components/Header_DropDown';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BASE_WIDTH = 375;
const scale = size => (SCREEN_WIDTH / BASE_WIDTH) * size;
const ms = (size, factor = 0.35) => size + (scale(size) - size) * factor;
const rs = size => Math.round(scale(size));
const BRAND_BG = '#233E55';
const NAV_BG = '#5D768B';
const RED = '#FF0000';
const WHITE = '#FFFFFF';

function getInitials(name = '') {
  const n = String(name).trim().replace(/\s+/g, ' ');
  if (!n) return '';
  const parts = n.split(' ');
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export const HEADER_METRICS = {
  HEADER_HEIGHT: rs(170),
  DROPDOWN_HEIGHT: rs(80),
  NAV_CARDS_OVERLAP: rs(40),
  CONTENT_SPACER: rs(160),
};

function MenuItem({ Icon, label, onPress }) {
  return (
    <TouchableOpacity onPress={() => onPress(label)} style={styles.menuItem} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
      {Icon ? <Icon width={rs(20)} height={rs(20)} /> : null}
      <Text style={styles.menuItemText}>{label}</Text>
    </TouchableOpacity>
  );
}

function SectionTitle({ children }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

export default function HeaderComponent({
  onNotificationPress,
  onOrganizationChange,
  Defaultorg,
  OrgCode,
  notificationCount = 0,
  onCardPress = () => { },
  onMenuSelect = () => { },
  menuVersion = '25121921',
}) {
  const [selectedOrganization, setSelectedOrganization] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const navigation = useNavigation();
  const { OrgData, setSelectedOrg } = useReceivingStore();
  const [profileNames, setprofileName] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const loadPoData = async () => {
      try {
        const orgsdata = await GetOrgsData();
        if (orgsdata) {
          const orgformatdata = maporgdata(orgsdata);
          setOrganizations(orgformatdata);
          
          if (OrgData?.selectedOrg) {
            setSelectedOrganization(OrgData.selectedOrg);
            Defaultorg?.(OrgData.selectedOrg.value);
            OrgCode?.(OrgData.selectedOrg.org_code);
          } else {
            const defaultOrg = orgformatdata.find(o => o.is_default);
            const orgToSelect = defaultOrg || orgformatdata[0];
            
            if (orgToSelect) {
              setSelectedOrganization(orgToSelect);
              Defaultorg?.(orgToSelect.value);
              OrgCode?.(orgToSelect.org_code);
              setSelectedOrg({
                selectedOrg: orgToSelect,
                selectedOrgCode: orgToSelect.org_code
              });
            }
          }
        } else {
          setOrganizations([]);
        }
      } catch (err) {
        Toast.show({ 
          type: 'error', 
          text1: 'Error', 
          text2: 'Failed to load organizations. Please try again.', 
          position: 'top', 
          visibilityTime: 5000 
        });
      }
    };
    loadPoData();
  }, []);

  const maporgdata = data =>
    data.map(element => ({
      label: element.ORG_CODE,
      name: element.ORG_CODE,
      value: element.ORG_ID,
      org_code: element.ORG_CODE,
      is_default: element.is_default,
    }));

  const handleOrganizationChange = (item) => {
    if (!item) return;
    
    setSelectedOrganization(item);
    Defaultorg?.(item.value);
    OrgCode?.(item.org_code);
    onOrganizationChange?.(item);
    
    if (setSelectedOrg) {
      setSelectedOrg({
        selectedOrg: item,
        selectedOrgCode: item.org_code
      });
    }
  };

  const showDot = Number(notificationCount) > 0;

  const loadUserName = useCallback(async () => {
    const raw = await AsyncStorage.getItem('user_name');
    if (raw) {
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

  const profilePress = async () => {
    navigation.navigate("settings");
  }

  const NotificationPress = async () => {
    navigation.navigate("Notification");
  }

  const toggleMenu = () => setMenuOpen(v => !v);

  const handleSelect = name => {
    setMenuOpen(false);
    onMenuSelect?.(name);
    if (name === 'Receiving') navigation.navigate('Receive');
    if (name === 'Inventory') navigation.navigate('Inventory');
    if (name === 'Shipping') navigation.navigate('Ship_Entry');
  };

  const handleHomePress = () => {
    setMenuOpen(false);
    navigation.navigate('Home');
  };

  return (
    <View style={styles.headerContainer}>
      <StatusBar translucent={false} barStyle="light-content" backgroundColor={BRAND_BG} />
      <View style={styles.brandingRow}>
        <View style={styles.brandLeft}>
          <EnnVeeLogoSmall width={rs(140)} height={rs(36)} />
        </View>
        <View style={styles.brandRight}>
          <TouchableOpacity onPress={NotificationPress} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={styles.bellWrap}>
            <BellIcon width={rs(22)} height={rs(22)} />
            {showDot && <View style={styles.dot} />}
          </TouchableOpacity>

          <TouchableOpacity onPress={profilePress} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={styles.avatar}>
            <Text style={styles.avatarText}>{profileNames}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.headerContent}>
        <View style={styles.organizationSection}>
          <OrganizationIcon width={rs(21)} height={rs(21)} style={styles.orgIcon} />
          
          <Header_DropDown
            label=""
            placeholder="Select Org"
            value={selectedOrganization}
            items={organizations}
            onChange={handleOrganizationChange}
            renderDropdownIcon={(isOpen) => (
              <Text style={styles.dropdownArrow}>
                {isOpen ? '▲' : '▼'}
              </Text>
            )}
            displayValue={(item) => item?.label || item?.name || item?.org_code || ''}
            containerStyle={styles.dropdownContainer}
          />
        </View>

        <View style={styles.iconSection}>
          <TouchableOpacity onPress={toggleMenu} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <HamburgerMenu width={scale(24)} height={scale(24)} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.navigationCardsRow}>
        <NavigationCard title="Receiving" icon={ReceiveIcon} onPress={() => onCardPress('Receive')} />
        <NavigationCard title="Inventory" icon={InventoryIcon} onPress={() => onCardPress('Inventory')} />
        <NavigationCard title="Shipping" icon={ShippingIcon} onPress={() => onCardPress('Ship_Entry')} />
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
                <Home_HM width={rs(22)} height={rs(22)} />
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
    </View>
  );
}

const DOT_SIZE = rs(12);
const AVATAR_SIZE = rs(30);

const styles = StyleSheet.create({
  brandingRow: {
    backgroundColor: BRAND_BG,
    paddingHorizontal: ms(16),
    paddingTop: ms(40),
    paddingBottom: ms(12),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandLeft: { flexShrink: 1, paddingRight: ms(12) },
  brandRight: { flexDirection: 'row', alignItems: 'center' },
  bellWrap: { position: 'relative', alignItems: 'center', justifyContent: 'center', marginRight: ms(12) },
  dot: { position: 'absolute', right: -ms(0), top: -ms(4), width: DOT_SIZE, height: DOT_SIZE, borderRadius: DOT_SIZE / 2, backgroundColor: RED },
  avatar: { width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2, backgroundColor: WHITE, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: BRAND_BG, fontSize: ms(10), fontWeight: '700' },
  headerContainer: {
    width: '100%',
    height: HEADER_METRICS.HEADER_HEIGHT,
    backgroundColor: BRAND_BG,
    borderBottomLeftRadius: rs(10),
    borderBottomRightRadius: rs(10),
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 5,
    paddingBottom: rs(20),
  },
  headerContent: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingHorizontal: rs(15), 
    paddingTop: rs(5),
  },
  organizationSection: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    flex: 1,
  },
  orgIcon: {
    marginRight: rs(8),
    marginTop: 5,
  },
  dropdownContainer: {
    width: rs(120),
  },
  dropdownArrow: {
    color: WHITE,
    fontSize: rs(10),
    marginLeft: rs(2),
  },
  iconSection: { 
    marginLeft: rs(20),
  },
  navigationCardsRow: {
    position: 'absolute',
    bottom: -HEADER_METRICS.NAV_CARDS_OVERLAP,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: rs(10),
    zIndex: 10,
  },
  menuBackdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  menuAnchorRow: { position: 'absolute', top: ms(80), right: ms(12), left: ms(12), alignItems: 'flex-end' },
  menuCard: {
    width: SCREEN_WIDTH - ms(105),
    backgroundColor: '#FFFFFF',
    borderRadius: rs(16),
    paddingHorizontal: rs(16),
    paddingTop: rs(14),
    paddingBottom: rs(10),
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  menuHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: rs(8) },
  menuHeaderTitle: { fontSize: rs(18), fontWeight: '700', color: '#233E55' },
  sectionTitle: { color: '#8A8A8A', fontSize: rs(14), marginTop: rs(10), marginBottom: rs(6), fontWeight: '700' },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: rs(8), gap: rs(10) },
  menuItemText: { fontSize: rs(15), color: '#222' },
  menuVersion: { marginTop: rs(10), color: '#8A8A8A', fontSize: rs(12) },
});