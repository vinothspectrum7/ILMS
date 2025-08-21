import React from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import EnnVeeLogoSmall from '../assets/icons/EnnVeeLogoSmall.svg';
import BellIcon from '../assets/icons/bellnotification.svg';
import BackLeftArrow from '../assets/icons/backleftarrow.svg';
import HamburgerMenu from '../assets/icons/hamburgermenu.svg';

const BRAND_BG = '#233E55';
const NAV_BG = '#5D768B';
const RED = '#FF0000';
const WHITE = '#FFFFFF';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BASE_WIDTH = 375;
const scale = (size) => (SCREEN_WIDTH / BASE_WIDTH) * size;
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

export default function GlobalHeaderComponent({
  organizationName = 'EnnVee',
  screenTitle = 'Receive',
  contextInfo = '',
  notificationCount = 0,
  profileName = 'User',
  onBack = () => {},
  onMenu = () => {},
  onNotificationPress = () => {},
  onProfilePress = () => {},
}) {
  const title = `${org3(organizationName)} – ${screenTitle}${contextInfo ? `(${contextInfo})` : ''}`;
  const initials = getInitials(profileName);
  const showDot = Number(notificationCount) > 0;

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <StatusBar translucent={false} barStyle="light-content" backgroundColor={BRAND_BG} />

      <View style={styles.brandingRow}>
        <View style={styles.brandLeft}>
          <EnnVeeLogoSmall width={scale(140)} height={scale(36)} />
        </View>

        <View style={styles.brandRight}>
          <TouchableOpacity onPress={onNotificationPress} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={styles.bellWrap}>
            <BellIcon width={scale(22)} height={scale(22)} />
            {showDot && <View style={styles.dot} />}
          </TouchableOpacity>

          <TouchableOpacity onPress={onProfilePress} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
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

        <TouchableOpacity onPress={onMenu} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <HamburgerMenu width={scale(24)} height={scale(24)} />
        </TouchableOpacity>
      </View>
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
  brandLeft: { flexShrink: 1, paddingRight: ms(12) },
  brandRight: { flexDirection: 'row', alignItems: 'center', gap: ms(12) },
  bellWrap: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
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

  navRow: {
    backgroundColor: NAV_BG,
    paddingHorizontal: ms(16),
    height: ms(50),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: ms(12) },
  backBtn: { paddingRight: ms(12) },
  title: { color: WHITE, fontSize: ms(18), fontWeight: '800', letterSpacing: 0.3, flexShrink: 1 },
});
