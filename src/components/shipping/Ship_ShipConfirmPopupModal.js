import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
} from 'react-native';
import SipBoxIcon from '../../assets/icons/Ship_Icons/SipBoxIcon.svg';
import FooterButtonsComponent from '../../components/shipping/Ship_FooterModalButtonComponent';

const Ship_ShipConfirmPopupModal = ({ 
  visible, 
  onClose, 
  onConfirm, 
  onNo, 
  deliveryNumber 
}) => {
  
  const handleYesPress = () => {
    console.log('Yes button pressed in modal');
    if (onConfirm) {
      onConfirm(); 
    }
  };

  const handleNoPress = () => {
    console.log('No button pressed in modal');
    if (onNo) {
      onNo(); 
    } else {
      onClose?.(); 
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={handleNoPress} 
    >
      <View style={styles.overlay}>
        <View style={styles.popup}>
          
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <SipBoxIcon width={100} height={100} style={styles.icon}/>
            </View>
          </View>

          <View style={styles.content}>
            <Text style={styles.confirmationText}>Confirmation</Text>

            <Text style={styles.messageText}>
              Are you sure you want to confirm{'\n'}shipping for ID {deliveryNumber || '1100002'}
            </Text>
            
            <View style={styles.footerContainer}>
              <FooterButtonsComponent
                onSave={handleNoPress}  
                onReceive={handleYesPress}   
                leftLabel="No"
                rightLabel="Yes"
                leftEnabled={true}
                rightEnabled={true}
                sticky={false}
                showShadow={false}
                containerStyle={styles.footerContainerStyle}
                leftButtonStyle={styles.noButtonStyle}
                rightButtonStyle={styles.yesButtonStyle}
              />
            </View>
          </View>

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 15,
  },

  popup: {
    width: 372,
    height: 373,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },

  header: {
    width: '100%',
    height: 165,
    backgroundColor: '#ECF1F7',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerContent: {
    alignItems: 'center',
  },

  icon: {
    marginBottom: 16,
  },

  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },

  confirmationText: {
    fontFamily: 'Mulish',
    fontWeight: '700',
    fontSize: 19,
    lineHeight: 19,
    letterSpacing: 0,
    color: '#242424',
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
    marginTop: 10,
  },

  messageText: {
    fontFamily: 'Mulish',
    fontWeight: '600',
    fontSize: 18,
    lineHeight: 27,
    letterSpacing: 0,
    color: '#242424',
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
    marginBottom: 20,
    marginTop: 10,
  },

  footerContainer: {
    height: 48,
    marginBottom: 10,
  },

  footerContainerStyle: {
    paddingVertical: 0,
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    marginBottom: 0,
  },

  noButtonStyle: {
    marginBottom: 0,
  },

  yesButtonStyle: {
    marginBottom: 0,
  },
});

export default Ship_ShipConfirmPopupModal;