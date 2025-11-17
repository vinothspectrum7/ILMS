import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ImageBackground,
  Dimensions,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import EnnVeeLogo from '../assets/icons/EnnVeeLogo.svg';
import MailIcon from '../assets/icons/mail.svg';

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
    <View style={styles.fullScreenContainer}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <View style={styles.topSection}>
        <ImageBackground
          source={require('../assets/images/login_bg.jpg')}
          style={styles.imageBackground}
          resizeMode="stretch"
        >
          <Image
            source={require('../assets/images/login_bg_blue.jpg')}
            style={styles.watermark}
            resizeMode="stretch"
          />
        </ImageBackground>
        <View style={styles.headerContent}>
          <EnnVeeLogo width={160} height={40} />
        </View>
      </View>

      <View style={styles.bottomSection}>
        <View style={styles.inputContainer}>
          <Text style={styles.title}>Forgot Password</Text>
          <Text style={styles.subtitle}>
            Enter your email or username to reset your password
          </Text>

          <View style={styles.inputWrapper}>
            <MailIcon width={24} height={24} />
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

          <TouchableOpacity style={styles.loginButton} onPress={onSubmit}>
            <View style={styles.glossWrapper}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.6)', 'transparent', 'transparent', 'transparent', 'transparent', 'rgba(255, 255, 255, 0.3)']}
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
              <Text style={styles.loginButtonText}>Submit</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topSection: {
    height: height * 0.45,
    overflow: 'hidden',
    position: 'relative',
  },
  headerContent: {
    position: 'absolute',
    top: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 20 : 60,
    left: 20,
    zIndex: 2,
  },
  bottomSection: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 25,
    paddingTop: 40,
    alignItems: 'center',
    marginTop: 0.1,
  },
  imageBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
  },
  watermark: {
    width: '100%',
    height: '100%',
    opacity: 0.3,
    position: 'absolute',
  },
  inputContainer: {
    width: '100%',
    maxWidth: 400,
  },
  title: {
    color: '#233E55',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 6,
  },
  subtitle: {
    color: '#5D768B',
    fontSize: 14,
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 15,
    height: 55,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  inputIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
    tintColor: '#A0A0A0',
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#333',
  },
  loginButton: {
    width: '100%',
    height: 55,
    borderRadius: 30,
    overflow: 'hidden',
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  shinyGradient: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
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
    height: '97%',
    width: '100%',
    marginTop: 1,
    marginBottom: 1,
    borderTopLeftRadius: 95,
    borderTopRightRadius: 95,
    borderBottomLeftRadius: 45, 
    borderBottomRightRadius: 45,
  },
  backButton: {
    alignSelf: 'center',
    marginTop: 8,
  },
  backText: {
    color: '#233E55',
    fontSize: 15,
  },
});
