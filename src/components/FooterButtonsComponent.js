import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

const FooterButtonsComponent = ({ onSave, onReceive, isReceiveEnabled }) => {
  return (
    <View style={styles.footerContainer}>
      <TouchableOpacity
        onPress={onSave}
        style={styles.saveButton}
        activeOpacity={isReceiveEnabled ? 0.8 : 1}
        disabled={!isReceiveEnabled}
      >
        <View style={styles.glossWrapper}>
          <LinearGradient
            colors={['#EBF7F6', 'rgba(255, 255, 255, 0.1)', 'transparent']}
            style={styles.glossOverlay}
            start={{ x: 0.0, y: 0.0 }}
            end={{ x: 0.0, y: 1.0 }}
          />
        </View>

        <LinearGradient
          colors={
            isReceiveEnabled
              ? ['#EBF7F6', '#EBF7F6', '#EBF7F6']
              : ['#ebf7f650', '#ebf7f650', '#ebf7f650']
          }
          start={{ x: 0.0, y: 0.5 }}
          end={{ x: 1.0, y: 0.5 }}
          style={styles.shinyGradient}
        >
          <Text
            style={[
              styles.saveText,
              { color: isReceiveEnabled ? '#233E55' : '#233E55' },
            ]}
          >
            Save
          </Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={isReceiveEnabled ? onReceive : null}
        style={styles.loginButton}
        activeOpacity={isReceiveEnabled ? 0.8 : 1}
        disabled={!isReceiveEnabled}
      >
        <View style={styles.glossWrapper}>
          <LinearGradient
            colors={['#EBF7F6', 'rgba(255, 255, 255, 0.1)', 'transparent']}
            style={styles.glossOverlay}
            start={{ x: 0.0, y: 0.0 }}
            end={{ x: 0.0, y: 1.0 }}
          />
        </View>

        <LinearGradient
          colors={
            isReceiveEnabled
              ? ['#233E55', '#233E55', '#233E55']
              : ['#233e5538', '#233e5538', '#233e5538']
          }
          start={{ x: 0.0, y: 0.5 }}
          end={{ x: 1.0, y: 0.5 }}
          style={styles.shinyGradient}
        >
          <Text
            style={[
              styles.saveText,
              { color: isReceiveEnabled ? '#FFFFFF' : '#233E55' },
            ]}
          >
            Receive
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  footerContainer: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    marginBottom: 12,
    elevation: 0,
  },
  saveWrapper: {
    flex: 1,
    marginRight: 8,
  },
  saveButton: {
    width: '50%',
    height: 40,
    borderRadius: 30,
    overflow: 'hidden',
    marginBottom: 30,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    margin: 2,
    borderWidth: 1,
    borderColor: '#233E55',
  },
  saveText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  receiveButton: {
    flex: 1,
    marginLeft: 8,
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: 'center',
  },
  receiveText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  shinyGradient: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
  },
  glossOverlay: {
    height: '60%',
    width: '100%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  loginButton: {
    width: '50%',
    height: 40,
    borderRadius: 30,
    overflow: 'hidden',
    marginBottom: 30,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    margin: 2,
  },
  glossWrapper: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 30,
    zIndex: 1,
    overflow: 'hidden',
  },
});

export default FooterButtonsComponent;
