import React, { useState } from 'react';
import { View, Text, StatusBar, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Bell } from 'lucide-react-native';
import DropDownPicker from 'react-native-dropdown-picker';

import OrganizationIcon from '../assets/icons/Organization_icon.svg';
import ProfileIcon from '../assets/icons/Profile_icon.svg';
import ReceiveIcon from '../assets/icons/Receive_icon.svg';
import InventoryIcon from '../assets/icons/Inventory_icon.svg';
import ShippingIcon from '../assets/icons/Shipping_icon.svg';
import { NavigationCard } from './NavigationCard';

const { width: screenWidth } = Dimensions.get('window');
const baseWidth = 375;
const scale = screenWidth / baseWidth;
const responsiveSize = (size) => Math.round(size * scale);
const BRAND_BG = '#233E55'; 

export const HEADER_METRICS = {
  HEADER_HEIGHT: responsiveSize(140),
  NAV_CARDS_OVERLAP: responsiveSize(40),
  CONTENT_SPACER: responsiveSize(160),
};

export default function HeaderComponent({
  onNotificationPress,
  onProfilePress,
  onOrganizationChange,
  onCardPress = () => {},
}) {
  const [openOrgDropdown, setOpenOrgDropdown] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState('EnnVee');
  const [organizations] = useState([
    { label: 'EnnVee', value: 'EnnVee' },
    { label: 'S7', value: 'S7' },
  ]);

  return (
    <View style={styles.headerContainer}>
      <StatusBar translucent={false} barStyle="light-content" backgroundColor={BRAND_BG} />
      <View style={styles.headerContent}>
        <View style={styles.organizationSection}>
          <OrganizationIcon width={responsiveSize(21)} height={responsiveSize(21)} />
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
          <TouchableOpacity style={styles.notificationButton} onPress={onNotificationPress}>
            <Bell size={responsiveSize(24)} color="#ffffff" strokeWidth={2} />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>5</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.profileButton} onPress={onProfilePress}>
            <ProfileIcon width={responsiveSize(24)} height={responsiveSize(24)} />
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

const styles = StyleSheet.create({
  headerContainer: {
    width: '100%',
    height: HEADER_METRICS.HEADER_HEIGHT,
    backgroundColor: '#233E55',
    borderBottomLeftRadius: responsiveSize(10),
    borderBottomRightRadius: responsiveSize(10),
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 5,
    paddingBottom: responsiveSize(20),
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: responsiveSize(20),
    paddingTop: responsiveSize(50),
  },
  organizationSection: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 100,
  },
  dropdownContainer: {
    width: responsiveSize(103),
    height: responsiveSize(21),
    marginLeft: responsiveSize(5),
  },
  dropdownStyle: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    minHeight: responsiveSize(21),
  },
  dropdownLabel: {
    color: '#FFFFFF',
    fontSize: responsiveSize(14),
    fontWeight: '600',
  },
  dropdownText: {
    color: '#FFFFFF',
    fontSize: responsiveSize(14),
  },
  dropdownMenuContainer: {
    backgroundColor: '#233E55',
    borderColor: '#FFFFFF',
    borderWidth: 0,
  },
  itemSeparatorStyle: { backgroundColor: '#3b5266' },
  listItemLabelStyle: { color: '#FFFFFF' },
  selectedItemLabelStyle: { fontWeight: 'bold', color: '#FFFFFF' },
  iconSection: { flexDirection: 'row', alignItems: 'center' },
  notificationButton: {
    padding: responsiveSize(8),
    position: 'relative',
    marginRight: responsiveSize(10),
  },
  notificationBadge: {
    position: 'absolute',
    top: responsiveSize(4),
    right: responsiveSize(4),
    backgroundColor: '#f5b951ff',
    borderRadius: responsiveSize(10),
    width: responsiveSize(20),
    height: responsiveSize(20),
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  notificationBadgeText: {
    color: '#ffffff',
    fontSize: responsiveSize(12),
    fontWeight: '600',
  },
  profileButton: { padding: responsiveSize(8) },
  navigationCardsRow: {
    position: 'absolute',
    bottom: -HEADER_METRICS.NAV_CARDS_OVERLAP,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: responsiveSize(20),
    zIndex: 10,
  },
});
