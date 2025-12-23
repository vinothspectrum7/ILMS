import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import CloseRedIcon from '../../assets/icons/Ship_Icons/CloseRedIcon.svg';
import LinearGradient from 'react-native-linear-gradient';


function Ship_PickPopupConfirmation({
  visible,
  onClose,
  onManual,
  onYes,
  deliveryId,
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.popupWrapper}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
          >
            <CloseRedIcon width={12} height={12} />
          </TouchableOpacity>
          <View style={styles.outerPopup}>
            <View style={styles.innerPopup}>
              <Text style={styles.message}>
                Would you like to proceed express pick and pack for delivery ID{' '}
                <Text style={styles.boldText}>{deliveryId}</Text>
              </Text>

              <LinearGradient
                colors={['rgba(255,255,255,0.7)', '#EBF7F6']}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={styles.footerContainer}
              >
                <TouchableOpacity
                  style={styles.manualButton}
                  onPress={onManual}
                >
                  <Text style={styles.manualText}>Manual</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.yesButtonWrapper}
                  onPress={onYes}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={[
                      'rgba(255,255,255,0.53)',
                      'rgba(255,255,255,0)',
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.yesGradient}
                  >
                    <Text style={styles.yesText}>Yes</Text>
                  </LinearGradient>
                </TouchableOpacity>

              </LinearGradient>

            </View>
          </View>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  popupWrapper: {
    position: 'relative',
  },

  cancelButton: {
    position: 'absolute',
    top: -30,
    right: -1,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#F8D2D4',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },

  outerPopup: {
    width: 326,
    height: 198,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  innerPopup: {
    width: 314,
    height: 186,
    backgroundColor: '#F5F5F6',
    borderRadius: 8,
    padding: 16,
    justifyContent: 'space-between',
  },

  message: {
    marginTop: 24,
    fontSize: 16,
    lineHeight: 25,
    color: '#233E55',
    textAlign: 'center',
  },

  boldText: {
    fontWeight: '700',
  },

  buttonRow: {
    flexDirection: 'row',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#233E55',
  },

  manualButton: {
    width: '50%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRightWidth: 0.72,
    borderRightColor: '#233E55',
  },
  manualText: {
    color: '#233E55',
    fontSize: 14,
    fontWeight: '600',
  },


  yesButton: {
    width: '50%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#233E55',
  },


  yesText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  yesButtonWrapper: {
    width: '50%',
    height: '100%',
    backgroundColor: '#233E55',
  },
  yesGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },


  footerContainer: {
    width: 268,
    height: 42,
    flexDirection: 'row',
    borderRadius: 30.24,
    borderWidth: 0.72,
    borderColor: '#233E55',
    overflow: 'hidden',
    alignSelf: 'center',
  },

});

export default Ship_PickPopupConfirmation;
