import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Dimensions, Alert, StatusBar, Platform } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import EnnVeeLogo from '../../assets/icons/EnnVeeLogo.svg';

export default function ChangePassword({ navigation }) {
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [show3, setShow3] = useState(false);

  const onChange = () => {
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
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <View style={styles.top}>
        <EnnVeeLogo width={160} height={40} />
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Change Password</Text>

        <View style={styles.inputWrapper}>
          <Image source={require('../../assets/images/lock.png')} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Old Password"
            placeholderTextColor="#A0A0A0"
            value={oldPwd}
            onChangeText={setOldPwd}
            secureTextEntry={!show1}
          />
          <TouchableOpacity onPress={() => setShow1(!show1)} style={styles.eyeIconContainer}>
            <Image source={require('../../assets/images/eye.png')} style={styles.eyeIcon} />
          </TouchableOpacity>
        </View>

        <View style={styles.inputWrapper}>
          <Image source={require('../../assets/images/lock.png')} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="New Password"
            placeholderTextColor="#A0A0A0"
            value={newPwd}
            onChangeText={setNewPwd}
            secureTextEntry={!show2}
          />
          <TouchableOpacity onPress={() => setShow2(!show2)} style={styles.eyeIconContainer}>
            <Image source={require('../../assets/images/eye.png')} style={styles.eyeIcon} />
          </TouchableOpacity>
        </View>

        <View style={styles.inputWrapper}>
          <Image source={require('../../assets/images/lock.png')} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Re-enter Password"
            placeholderTextColor="#A0A0A0"
            value={confirmPwd}
            onChangeText={setConfirmPwd}
            secureTextEntry={!show3}
          />
          <TouchableOpacity onPress={() => setShow3(!show3)} style={styles.eyeIconContainer}>
            <Image source={require('../../assets/images/eye.png')} style={styles.eyeIcon} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.primaryBtn} onPress={onChange}>
          <View style={styles.glossWrapper}>
            <LinearGradient
              colors={['rgba(255,255,255,0.6)','rgba(255,255,255,0.1)','transparent']}
              style={styles.glossOverlay}
              start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
            />
          </View>
          <LinearGradient
            colors={['#233E55','#233E55','#233E55']}
            start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
            style={styles.gradientFill}
          >
            <Text style={styles.btnText}>Change Password</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.secondaryText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const { height } = Dimensions.get('window');
const base = 375;
const rs = v => Math.round((Dimensions.get('window').width / base) * v);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  top: {
    height: height * 0.22,
    backgroundColor: '#233E55',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 20 : 60,
    paddingHorizontal: 20,
    justifyContent: 'flex-start',
  },
  card: { flex: 1, paddingHorizontal: 25, paddingTop: 24 },
  title: { fontSize: rs(22), color: '#233E55', fontWeight: '700', marginBottom: 16 },

  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F5F5F5', borderRadius: 20, paddingHorizontal: 15, height: 55,
    borderWidth: 1, borderColor: '#E0E0E0', marginBottom: 16
  },
  inputIcon: { width: 20, height: 20, marginRight: 10, tintColor: '#A0A0A0' },
  input: { flex: 1, height: '100%', fontSize: 16, color: '#333' },
  eyeIconContainer: { paddingLeft: 10, paddingVertical: 5 },
  eyeIcon: { width: 20, height: 20, tintColor: '#A0A0A0' },

  primaryBtn: {
    width: '100%', height: 55, borderRadius: 30, overflow: 'hidden',
    justifyContent: 'center', alignItems: 'center', position: 'relative', marginTop: 8, marginBottom: 12
  },
  glossWrapper: { ...StyleSheet.absoluteFillObject, borderRadius: 30, zIndex: 1, overflow: 'hidden' },
  glossOverlay: { height: '60%', width: '100%', marginTop: 1, borderTopLeftRadius: 25, borderTopRightRadius: 25 },
  gradientFill: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', borderRadius: 30 },
  btnText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700', zIndex: 2 },

  secondaryBtn: {
    width: '100%', height: 55, borderRadius: 30, borderWidth: 1, borderColor: '#5D768B',
    alignItems: 'center', justifyContent: 'center'
  },
  secondaryText: { color: '#233E55', fontSize: 16, fontWeight: '600' },
});
