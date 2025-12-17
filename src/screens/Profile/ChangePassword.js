import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, Alert, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import GlobalHeaderComponent from '../../components/GlobalHeaderComponent';
import FooterButtonsComponent from '../../components/FooterButtonsComponent';
import { useReceivingStore } from '../../store/receivingStore';
import LockIcon from '../../assets/icons/lock.svg';
import EyeIcon from '../../assets/icons/eye.svg';
import ProfileHeader from '../../components/ProfileHeader';

const { width } = Dimensions.get('window');
const base = 375;
const rs = v => Math.round((width / base) * v);

export default function ChangePassword() {
  const navigation = useNavigation();
  const { OrgData } = useReceivingStore();

  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [show3, setShow3] = useState(false);

  const onBack = useCallback(() => navigation.goBack(), [navigation]);
  const onMenu = useCallback(() => navigation.toggleDrawer?.(), [navigation]);

  const onSubmit = () => {
    if (!oldPwd || !newPwd || !confirmPwd) {
      Alert.alert('Alert', 'Please fill all fields.');
      return;
    }
    if (newPwd.length < 6) {
      Alert.alert('Alert', 'New password must be at least 6 characters.');
      return;
    }
    if (newPwd !== confirmPwd) {
      Alert.alert('Alert', 'New password and confirmation do not match.');
      return;
    }
    Alert.alert('Success', 'Password updated successfully.');
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ProfileHeader
        organizationName={OrgData?.selectedOrgCode}
        screenTitle="Change Password"
        notificationCount={0}
        onBack={onBack}
        onMenu={onMenu}
        showCartIcon={false}
        cartCount={0}
      />

      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Update your password</Text>

          <View style={styles.inputWrapper}>
            <LockIcon width={24} height={24} />
            <TextInput
              style={styles.input}
              placeholder="Old Password"
              placeholderTextColor="#A0A0A0"
              value={oldPwd}
              onChangeText={setOldPwd}
              secureTextEntry={!show1}
            />
            <TouchableOpacity onPress={() => setShow1(!show1)} style={styles.eyeIconContainer}>
              <EyeIcon width={24} height={24} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputWrapper}>
            <LockIcon width={24} height={24} />
            <TextInput
              style={styles.input}
              placeholder="New Password"
              placeholderTextColor="#A0A0A0"
              value={newPwd}
              onChangeText={setNewPwd}
              secureTextEntry={!show2}
            />
            <TouchableOpacity onPress={() => setShow2(!show2)} style={styles.eyeIconContainer}>
              <EyeIcon width={24} height={24} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputWrapper}>
            <LockIcon width={24} height={24} />
            <TextInput
              style={styles.input}
              placeholder="Re-enter Password"
              placeholderTextColor="#A0A0A0"
              value={confirmPwd}
              onChangeText={setConfirmPwd}
              secureTextEntry={!show3}
            />
            <TouchableOpacity onPress={() => setShow3(!show3)} style={styles.eyeIconContainer}>
              <EyeIcon width={24} height={24} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <FooterButtonsComponent
        leftLabel="Cancel"
        rightLabel="Submit"
        onLeftPress={onBack}
        onRightPress={onSubmit}
        showShadow
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1, backgroundColor: '#F7F9FC' },
  content: { paddingHorizontal: 20, paddingTop: 20 },
  title: { fontSize: rs(18), color: '#233E55', fontWeight: '700', marginBottom: 14 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 15,
    height: 55,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  inputIcon: { width: 20, height: 20, marginRight: 10, tintColor: '#A0A0A0' },
  input: { flex: 1, height: '100%', fontSize: 16, color: '#333' },
  eyeIconContainer: { paddingLeft: 10, paddingVertical: 5 },
  eyeIcon: { width: 20, height: 20, tintColor: '#A0A0A0' },
});
