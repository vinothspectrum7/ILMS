import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Dimensions, Alert, StatusBar, Platform } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import EnnVeeLogo from '../assets/icons/EnnVeeLogo.svg';

const { height } = Dimensions.get('window');

export default function ForgetPassword({ navigation }) {
  const [user, setUser] = useState('');

  const onSubmit = () => {
    if (!user?.trim()) {
      Alert.alert('Alert', 'Please enter Email or Username.');
      return;
    }
    Alert.alert('Submitted', 'Password reset link has been sent if the account exists.');
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <View style={styles.top}>
        <EnnVeeLogo width={160} height={40} />
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Forgot Password</Text>
        <Text style={styles.subtitle}>Enter your email or username to reset your password</Text>

        <View style={styles.inputWrapper}>
          <Image source={require('../assets/images/mail.png')} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email or Username"
            placeholderTextColor="#A0A0A0"
            value={user}
            onChangeText={setUser}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <TouchableOpacity style={styles.primaryBtn} onPress={onSubmit}>
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
            <Text style={styles.btnText}>Submit</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.linkBtn}>
          <Text style={styles.linkText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

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
  card: {
    flex: 1,
    paddingHorizontal: 25,
    paddingTop: 24,
  },
  title: { fontSize: rs(22), color: '#233E55', fontWeight: '700', marginBottom: 6 },
  subtitle: { fontSize: rs(14), color: '#5D768B', marginBottom: 20 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F5F5F5', borderRadius: 20, paddingHorizontal: 15, height: 55,
    borderWidth: 1, borderColor: '#E0E0E0', marginBottom: 24
  },
  inputIcon: { width: 20, height: 20, marginRight: 10, tintColor: '#A0A0A0' },
  input: { flex: 1, height: '100%', fontSize: 16, color: '#333' },

  primaryBtn: {
    width: '100%', height: 55, borderRadius: 30, overflow: 'hidden',
    justifyContent: 'center', alignItems: 'center', position: 'relative', marginBottom: 16
  },
  glossWrapper: { ...StyleSheet.absoluteFillObject, borderRadius: 30, zIndex: 1, overflow: 'hidden' },
  glossOverlay: { height: '60%', width: '100%', marginTop: 1, borderTopLeftRadius: 25, borderTopRightRadius: 25 },
  gradientFill: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', borderRadius: 30 },
  btnText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700', zIndex: 2 },

  linkBtn: { alignSelf: 'center', marginTop: 8 },
  linkText: { color: '#233E55', fontSize: 15 },
});
