import React, { useEffect, useRef, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal,
  SafeAreaView,
  StatusBar,
  Animated
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';

const ShippingProgressModal = ({ visible, onClose }) => {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const [progressPercent, setProgressPercent] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigation = useNavigation(); 

  useEffect(() => {
    if (visible) {
      progressAnim.setValue(0);
      setProgressPercent(0);
      setShowSuccess(false);
      
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (finished) {
          setShowSuccess(true);
          
          setTimeout(() => {
            onClose && onClose();
            
            navigation.navigate('ShipDashboard');
          }, 2000); 
        }
      });

      const progressListener = progressAnim.addListener(({ value }) => {
        setProgressPercent(Math.floor(value * 100));
      });

      return () => {
        progressAnim.removeListener(progressListener);
      };
    }
  }, [visible, navigation]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%']
  });

  const GreenTickIcon = () => (
    <Svg width={60} height={60} viewBox="0 0 60 60" fill="none">
      <Path
        d="M30 55C43.8071 55 55 43.8071 55 30C55 16.1929 43.8071 5 30 5C16.1929 5 5 16.1929 5 30C5 43.8071 16.1929 55 30 55Z"
        fill="#168035"
        stroke="#168035"
        strokeWidth="2"
      />
      <Path
        d="M22 30.5L27.5 36L38 25"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <SafeAreaView style={styles.modalContainer}>
        <StatusBar backgroundColor="rgba(0,0,0,0.5)" barStyle="light-content" />
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <View style={styles.centerContent}>
              
              {!showSuccess ? (
                <View style={styles.progressBarSection}>
                  <View style={styles.progressBarContainer}>
                    <Animated.View style={[styles.progressBar, { width: progressWidth }]}>
                      <LinearGradient
                        colors={['#DA1E28', '#F06000', '#168035', '#033EFF']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.gradient}
                      />
                    </Animated.View>
                  </View>
                  <Text style={styles.progressingText}>Progressing</Text>
                </View>
              ) : (
                <View style={styles.successSection}>
                  <GreenTickIcon />
                  <Text style={styles.successText}>
                    Selected Shipment{'\n'}are confirmed successfully
                  </Text>
                </View>
              )}

            </View>

          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: 372,
    height: 739,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBarSection: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 32,
  },
  progressBarContainer: {
    height: 8,
    width: '100%',
    backgroundColor: '#EAECF0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    width: '100%',
  },
  progressingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#233E55',
    fontFamily: 'Mulish',
    textAlign: 'center',
  },
  successSection: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  successText: {
    marginTop: 20,
    fontSize: 19,
    fontWeight: '600',
    color: '#168035',
    fontFamily: 'Mulish',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default ShippingProgressModal;