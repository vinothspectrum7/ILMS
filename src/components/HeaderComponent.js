import React, { useState,useEffect } from 'react';
import { View, Text, StatusBar, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Bell } from 'lucide-react-native';
import DropDownPicker from 'react-native-dropdown-picker';

import OrganizationIcon from '../assets/icons/Organization_icon.svg';
import ProfileIcon from '../assets/icons/Profile_icon.svg';
import ReceiveIcon from '../assets/icons/Receive_icon.svg';
import InventoryIcon from '../assets/icons/Inventory_icon.svg';
import ShippingIcon from '../assets/icons/Shipping_icon.svg';
import { NavigationCard } from './NavigationCard';
import { GetOrgsData } from '../api/ApiServices';
import Toast from 'react-native-toast-message';
import { useReceivingStore } from '../store/receivingStore';

import EnnVeeLogoSmall from '../assets/icons/EnnVeeLogoSmall.svg';
import BellIcon from '../assets/icons/bellnotification.svg';
import HamburgerMenu from '../assets/icons/hamburgermenu.svg';


const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BASE_WIDTH = 375;
const scale = (size) => (SCREEN_WIDTH / BASE_WIDTH) * size;         
const ms = (size, factor = 0.35) => size + (scale(size) - size) * factor; 
const rs = (size) => Math.round(scale(size));                        


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
  NAV_CARDS_OVERLAP: rs(40),
  CONTENT_SPACER: rs(160),
};

export default function HeaderComponent({
  onNotificationPress,
  onProfilePress,
  onOrganizationChange,
  Defaultorg,
  notificationCount = 0,
  profileName = 'User',
  onMenu = () => {},
  onCardPress = () => {},
}) {
  const [openOrgDropdown, setOpenOrgDropdown] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState(null);
  const [organizations,setOrganizations] = useState([]);
      const {
        OrgData
      } = useReceivingStore();
  // First effect: load PO data
  useEffect(() => {
    const loadPoData = async () => {
      try {
        const orgsdata = await GetOrgsData();
        console.log(orgsdata,"GetOrgsData")
        if (orgsdata) {
          const orgformatdata = maporgdata(orgsdata);
          setOrganizations(orgformatdata);
          const defaultOrg = orgformatdata.find(o => o.is_default);
          if (OrgData?.selectedOrg){
          setSelectedOrganization(OrgData?.selectedOrg);
          }else{
          setSelectedOrganization(defaultOrg?.value ?? orgformatdata[0]?.value);
          }
          Defaultorg?.(defaultOrg?.value ?? orgformatdata[0]?.value);
        } else {
          setOrganizations([]);
        }
      } catch (err) {
        console.error("Error loading ORG data:", err);
                Toast.show({
                  type: 'error',
                  text1: 'Error',
                  text2: 'Failed to load organizations. Please try again.',
                  position: 'top',
                });
      }
    };
  
    loadPoData();
  }, []);

const maporgdata = (data) => {
  return data.map((element) => ({
    label: element.org_name,
    value: element.org_id,
    is_default: element.is_default,
  }));
};
  const initials = getInitials(profileName);
  const showDot = Number(notificationCount) > 0;

  return (
    <View style={styles.headerContainer}>
      <StatusBar translucent={false} barStyle="light-content" backgroundColor={BRAND_BG} />

      <View style={styles.brandingRow}>
        <View style={styles.brandLeft}>
          <EnnVeeLogoSmall width={rs(140)} height={rs(36)} />
        </View>

        <View style={styles.brandRight}>
          <TouchableOpacity onPress={onNotificationPress} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={styles.bellWrap}>
            <BellIcon width={rs(22)} height={rs(22)} />
            {showDot && <View style={styles.dot} />}
          </TouchableOpacity>

          <TouchableOpacity onPress={onProfilePress} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.headerContent}>
        <View style={styles.organizationSection}>
          <OrganizationIcon width={rs(21)} height={rs(21)} />
          <DropDownPicker
            open={openOrgDropdown}
            value={selectedOrganization}
            items={organizations}
            setOpen={setOpenOrgDropdown}
            setValue={setSelectedOrganization}
            containerStyle={styles.dropdownContainer}
            style={styles.dropdownStyle}
            labelStyle={styles.dropdownLabel}
            textStyle={styles.dropdownText}
            dropDownContainerStyle={styles.dropdownMenuContainer}
            itemSeparator
            itemSeparatorStyle={styles.itemSeparatorStyle}
            listItemLabelStyle={styles.listItemLabelStyle}
            selectedItemLabelStyle={styles.selectedItemLabelStyle}
            onSelectItem={(item) => onOrganizationChange?.(item.value)}
            renderBadge={() => null}
            ArrowUpIconComponent={({ style }) => <Text style={[style, { color: '#FFFFFF' }]}>▲</Text>}
            ArrowDownIconComponent={({ style }) => <Text style={[style, { color: '#FFFFFF' }]}>▼</Text>}
          />
        </View>

        <View style={styles.iconSection}>
        <TouchableOpacity onPress={onMenu} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <HamburgerMenu width={scale(24)} height={scale(24)} />
        </TouchableOpacity>
        </View>
      </View>

      <View style={styles.navigationCardsRow}>
        <NavigationCard title="Receive"   icon={ReceiveIcon}   onPress={() => onCardPress('Receive')} />
        <NavigationCard title="Inventory" icon={InventoryIcon} onPress={() => onCardPress('Inventory')} />
        <NavigationCard title="Shipping"  icon={ShippingIcon}  onPress={() => onCardPress('Shipping')} />
      </View>
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
  dot: {
    position: 'absolute',
    right: -ms(0),
    top: -ms(4),
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: RED,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: WHITE,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
    paddingTop: rs(0),
  },
  organizationSection: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 100,
  },
  dropdownContainer: {
    width: rs(103),
    height: rs(21),
    marginLeft: rs(5),
  },
  dropdownStyle: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    minHeight: rs(21),
  },
  dropdownLabel: { color: '#FFFFFF', fontSize: rs(14), fontWeight: '600' },
  dropdownText: { color: '#FFFFFF', fontSize: rs(14) },
  dropdownMenuContainer: { backgroundColor: BRAND_BG, borderColor: '#FFFFFF', borderWidth: 0 },
  itemSeparatorStyle: { backgroundColor: '#3b5266' },
  listItemLabelStyle: { color: '#FFFFFF' },
  selectedItemLabelStyle: { fontWeight: 'bold', color: '#FFFFFF' },

  iconSection: { flexDirection: 'row', alignItems: 'center' },
  notificationButton: { padding: rs(8), position: 'relative', marginRight: rs(10) },
  notificationBadge: {
    position: 'absolute',
    top: rs(4),
    right: rs(4),
    backgroundColor: '#f5b951ff',
    borderRadius: rs(10),
    width: rs(20),
    height: rs(20),
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  notificationBadgeText: { color: '#ffffff', fontSize: rs(12), fontWeight: '600' },
  profileButton: { padding: rs(8) },

  navigationCardsRow: {
    position: 'absolute',
    bottom: -HEADER_METRICS.NAV_CARDS_OVERLAP,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: rs(20),
    zIndex: 10,
  },
});
