import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from 'react-native';
import Time from '../../assets/icons/CycleCount_Icons/Time';
import CC_Ship_FooterModalButtonComponent from './CC_Ship_FooterModalButtonComponent';

const CC_CreScheduleConfirmationPopupModal = ({
  visible,
  onClose,
  onConfirm,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.confirmationModal}>
          <View style={styles.headerSection}>
            <View style={styles.iconWrapper}>
              <Time width={140} height={140} />
            </View>
          </View>

          <View style={styles.contentSection}>
            <Text style={styles.confirmationTitle}>Confirmation</Text>
            <Text style={styles.confirmationMessage}>
              Are you sure want to
            </Text>
            <Text style={styles.confirmationMessage}>
              Create this Cycle Count
            </Text>
          </View>

          <View style={styles.footerSection}>
            <CC_Ship_FooterModalButtonComponent
              leftLabel="Cancel"
              rightLabel="Confirm"
              onLeftPress={onClose}
              onRightPress={onConfirm}
              leftEnabled={true}
              rightEnabled={true}
              containerStyle={styles.footerContainerStyle}
              showShadow={false}
            />
          </View>
        </View>
      </View>
    </Modal>

    
  );
};

export default CC_CreScheduleConfirmationPopupModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmationModal: {
    width: 372,
    height: 373,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    overflow: 'hidden',
  },
  headerSection: {
    width: 372,
    height: 165,
    backgroundColor: '#ECF1F7',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentSection: {
    padding: 20,
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  confirmationTitle: {
    fontSize: 18,
    color: '#233E55',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 8,
  },
  confirmationMessage: {
    fontSize: 14,
    color: '#233E55',
    textAlign: 'center',
    lineHeight: 20,
  },
 
});