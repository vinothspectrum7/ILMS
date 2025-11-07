import React, { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { useReceivingStore } from '../../store/receivingStore';
import LinearGradient from 'react-native-linear-gradient';
// Import your SVG icons here
import UserIcon from '../../assets/icons/personal_icon.svg';
import LockIcon from '../../assets/icons/change_password_icon.svg';
import ScanIcon from '../../assets/icons/scanner_icon.svg';
import BellIcon from '../../assets/icons/notification_color_icon.svg';
import ChartIcon from '../../assets/icons/performance_icon.svg';
import CalendarIcon from '../../assets/icons/schedule_icon.svg';
import ShieldIcon from '../../assets/icons/security_icon.svg';
import HelpIcon from '../../assets/icons/support_icon.svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GlobalHeaderComponent from '../../components/GlobalHeaderComponent';

const BG = '#FFFFFF';
const { width } = Dimensions.get('window');
const cardWidth = (width - 60) / 3; // 3 columns with margin between them

const SettingsScreen = () => {
  const { OrgData } = useReceivingStore();
  const navigation = useNavigation();

    const settings = [
    { title: 'Personal Information', icon: <UserIcon width={28} height={28} /> },
    { title: 'Change Password', icon: <LockIcon width={28} height={28} /> },
    { title: 'Scanner Settings', icon: <ScanIcon width={28} height={28} /> },
    { title: 'Notification Preferences', icon: <BellIcon width={28} height={28} /> },
    { title: 'Performance Dashboard', icon: <ChartIcon width={28} height={28} /> },
    { title: 'Work Schedule', icon: <CalendarIcon width={28} height={28} /> },
    { title: 'Security Access', icon: <ShieldIcon width={28} height={28} /> },
    { title: 'Help & Support', icon: <HelpIcon width={28} height={28} /> },
  ];

  const onBack = useCallback(() => navigation.navigate('Home'), [navigation]);
  const onMenu = useCallback(() => navigation.toggleDrawer?.(), [navigation]);
  const handlelogout = async () => {
    await AsyncStorage.removeItem('access_token');
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <GlobalHeaderComponent
        organizationName={OrgData?.selectedOrgCode}
        screenTitle="Settings"
        notificationCount={0}
        onBack={onBack}
        onMenu={onMenu}
        showCartIcon={false}
        cartCount={0}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        {/* User Info Card */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>JD</Text>
          </View>
          <View>
            <Text style={styles.userName}>John Doe</Text>
            <Text style={styles.userRole}>
              Warehouse Supervisor | Facility: WH-001
            </Text>
          </View>
        </View>

        {/* Other Settings */}
        <Text style={styles.sectionTitle}>Other Settings</Text>
        <View style={styles.gridContainer}>
          {settings.map((item, index) => (
            <TouchableOpacity key={index} style={styles.gridItem} activeOpacity={0.8}>
              <View style={styles.icon}>{item.icon}</View>
              <Text style={styles.gridText}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.versionText}>Version 25110719</Text>
      </ScrollView>
        {/* Log Out Button (Fixed SafeArea Padding + Bottom Alignment) */}
        <View style={styles.logoutContainer}>
              <TouchableOpacity
              onPress={handlelogout}
              >
                  <View style={styles.glossWrapper}>
                    <LinearGradient
                      colors={['rgba(255, 255, 255, 0.6)', 'rgba(255, 255, 255, 0.1)', 'transparent']}
                      style={styles.glossOverlay}
                      start={{ x: 0.0, y: 0.0 }}
                      end={{ x: 0.0, y: 1.0 }}
                    />
                  </View>
          <LinearGradient
            colors={['#233E55', '#233E55', '#233E55']}
            start={{ x: 0.0, y: 0.5 }}
            end={{ x: 1.0, y: 0.5 }}
            style={styles.shinyGradient}
          >
            <Text style={styles.loginButtonText}>Log Out</Text>
          </LinearGradient>
          </TouchableOpacity>
        </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
    logoutContainer: {
    paddingHorizontal: 20, // aligns with cards
    paddingBottom: 15, // safe area space
    backgroundColor: '#F7F9FC',
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 20,
  },
  avatar: {
    backgroundColor: '#233E55',
    borderRadius: 50,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#242424',
    fontFamily:'Mulish'
  },
  userRole: {
    color: '#595A5C',
    fontSize: 13,
    marginTop: 3,
    fontWeight:500,
    fontFamily:'Mulish'
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#242424',
    marginBottom: 10,
    fontFamily:'Mulish'
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start', // center the entire grid
    gap: 13, // consistent spacing between cards
  },
  gridItem: {
    backgroundColor: '#fff',
    width: (width - 70) / 3, // responsive 3 columns with gap
    borderRadius: 12,
    paddingVertical: 22,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    // marginBottom: 1,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  icon: {
    marginBottom: 8,
  },
  gridText: {
    fontSize: 13,
    color: '#242424',
    textAlign: 'center',
    fontWeight:'700',
    fontFamily:'Mulish'
  },
  logoutBtn: {
    backgroundColor: '#003366',
    borderRadius: 50,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 25,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  versionText: {
    textAlign: 'left',
    color: '#595A5C',
    fontSize: 12,
    marginTop: 10,
    fontWeight:500,
    fontFamily:'Mulish'
  },
  shinyGradient: {
  padding:15,
//   justifyContent: 'flex-end',
  alignItems: 'center',
  borderRadius: 30,
},
  loginButtonText: {
  color: '#FFFFFF',
  fontSize: 18,
  fontWeight: 'bold',
  zIndex: 2,
},
glossWrapper: {
  ...StyleSheet.absoluteFillObject,
  borderRadius: 30,
  zIndex: 1,
  overflow: 'hidden',
},
glossOverlay: {
  height: '60%', // Top part
  width: '100%',
  borderTopLeftRadius: 30,
  borderTopRightRadius: 30,
},
});

export default SettingsScreen;
