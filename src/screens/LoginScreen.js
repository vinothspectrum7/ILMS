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

import axios from 'axios';
import { BASE_URL } from '../config/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserLogin } from '../api/ApiServices';


const { height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
  if (employeeId === '' || password === '') {
    Alert.alert('Alert', 'Please enter both Employee ID and password.');
    return;
  }
  else {
      try {
    const formData = new FormData();
    formData.append('grant_type', "password");
    formData.append('username', employeeId);
    formData.append('password', password);

    const response = await UserLogin(formData);
    console.log('responseresponseresponseresponse',response);

    if (response.status === 200 && response.data.access_token) {
      await AsyncStorage.setItem('access_token', response.data.access_token);
      navigation.replace('Home');
    } else {
      navigation.replace('Home');
      // Alert.alert('Login failed', 'Incorrect credentials or unexpected response.');
    }
  } catch (error) {
        console.log('errror response login',error);
    // navigation.replace('Home');
    // if (error.response && error.response.data) {
    //   navigation.replace('Home');
    //   // Alert.alert('Login failed', JSON.stringify(error.response.data));
    // } else {
    //   navigation.replace('Home');
    //   // Alert.alert('Error', 'An unexpected error occurred.');
    // }
  }
  }

};


  const handleForgotPassword = () => {
    navigation.replace('Home');
    // Alert.alert('Forgot Password', 'Navigating to password reset screen...');
  };

  const handleTouchIdLogin = () => {
    Alert.alert('Touch ID Login', 'Initiating biometric authentication...');
  };

  return (
    <View style={styles.fullScreenContainer}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent={true}
      />
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
          <View style={styles.inputWrapper}>
            <Image
              source={require('../assets/images/mail.png')}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Employee_101"
              placeholderTextColor="#A0A0A0"
              value={employeeId}
              onChangeText={setEmployeeId}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputWrapper}>
            <Image
              source={require('../assets/images/lock.png')}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#A0A0A0"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIconContainer}>
              <Image
                source={showPassword
                  ? require('../assets/images/eye.png')
                  : require('../assets/images/eye.png')
                }
                style={styles.eyeIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPasswordButton}>
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          </TouchableOpacity>

          
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
  
  <View style={styles.glossWrapper}>
    <LinearGradient
      colors={['rgba(255, 255, 255, 0.6)', 'rgba(255, 255, 255, 0.1)', 'transparent']}
      style={styles.glossOverlay}
      start={{ x: 0.0, y: 0.0 }}
      end={{ x: 0.0, y: 1.0 }}
    />
  </View>

  {/* Main gradient background */}
  <LinearGradient
    colors={['#233E55', '#233E55', '#233E55']}
    start={{ x: 0.0, y: 0.5 }}
    end={{ x: 1.0, y: 0.5 }}
    style={styles.shinyGradient}
  >
    <Text style={styles.loginButtonText}>Log In</Text>
  </LinearGradient>
</TouchableOpacity>

          <TouchableOpacity style={styles.touchIdButton} onPress={handleTouchIdLogin}>
            <Image
              source={require('../assets/images/fingerprint.png')}
              style={styles.fingerprintIcon}
            />
          </TouchableOpacity>
          <Text style={styles.touchIdText}>Log In with touch ID</Text>
        </View>
      </View>
    </View>
  );
};

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
    top: Platform.OS === 'android' ? StatusBar.currentHeight + 20 : 60,
    left: 20,
    zIndex: 2,
  },
  logo: {
    width: 120,
    height: 40,
    marginBottom: 5,
  },
  tagline: {
    color: '#FFFFFF',
    fontSize: 14,
  },

  bottomSection: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 25,
    paddingTop: 40,
    alignItems: 'center',
    marginTop: 0.1,
  },
  inputContainer: {
    width: '100%',
    maxWidth: 400,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 15,
    height: 55,
    marginBottom: 20,
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
  eyeIconContainer: {
    paddingLeft: 10,
    paddingVertical: 5,
  },
  eyeIcon: {
    width: 20,
    height: 20,
    tintColor: '#A0A0A0',
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 30,
  },
  forgotPasswordText: {
    color: '#233E55',
    fontSize: 15,
  },
  loginButton: {
  width: '100%',
  height: 55,
  borderRadius: 30,
  overflow: 'hidden',
  marginBottom: 30,
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

  gradientButton: {
  width: '100%',
  height: 55,
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: 30,
  overflow: 'hidden', // Ensure corners are clipped properly
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

  touchIdButton: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  fingerprintIcon: {
    width: 30,
    height: 30,
    tintColor: '#233E55',
  },
  touchIdText: {
    color: '#666',
    fontSize: 14,
    alignSelf: 'center',
  },
  container: {
    flex: 1,
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
    opacity: 0.6,
    position: 'absolute',
  },
});

export default LoginScreen;