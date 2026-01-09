import React from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import CloseRedIcon from '../../assets/icons/Ship_Icons/CloseRedIcon.svg';
import LinearGradient from 'react-native-linear-gradient';
import Ship_ConfirmModalComponent from '../../components/shipping/Ship_ConfirmModalComponent';

function Ship_PickPopupConfirmation({
  visible,
  onClose,
  onYes,
  deliveryId,
}) {
  const navigation = useNavigation(); 
  const handleManualPress = () => {
    onClose();
    navigation.navigate('ManualPick', { deliveryId });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Ship_ConfirmModalComponent
        visible={visible}
        title=""
        message={`Would you like to proceed express pick and pack for delivery ID ${deliveryId}?`}
        confirmAction={onYes}
        onCancel={handleManualPress} 
        cancelText="Manual" 
        confirmText="Yfdses" 
      />
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

  messageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 10,
  },

  message: {
    fontSize: 16,
    lineHeight: 25,
    color: '#233E55',
    textAlign: 'center',
    paddingHorizontal: 10,
  },

  boldText: {
    fontWeight: '700',
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
    marginTop: 10,
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

  yesButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  yesText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default Ship_PickPopupConfirmation;