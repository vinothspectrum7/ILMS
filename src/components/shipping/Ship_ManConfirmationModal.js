import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import ConfirmTickIcon from '../../assets/icons/Ship_Icons/ConfirmationTickIcon.svg';
import { useNavigation } from '@react-navigation/native';
import Ship_PrintLabels from './Ship_PrintLabels';

const Ship_ManConfirmationModal = ({
  visible,
  onClose,
  onYes,
  onNo,
  type = 'CONFIRM_PICK',
  itemCount = 0,
}) => {
  const navigation = useNavigation();
  const [showPrintLabelModal, setShowPrintLabelModal] = useState(false);
  const [showLabelPrintedModal, setShowLabelPrintedModal] = useState(false);

  const isConfirmPack = type === 'CONFIRM_PACK';
const displayCount = itemCount;


  const handleYes = () => {
    if (onYes) {
      onYes();
      return;
    }

    onClose();

    if (isConfirmPack) {
      setShowPrintLabelModal(true);
    } else {
      navigation.navigate('AutoPack');
    }
  };

  const handleNo = () => {
    if (onNo) {
      onNo();
      return;
    }
    onClose();
  };

  const handlePrintComplete = () => {
    setShowPrintLabelModal(false);
    setShowLabelPrintedModal(true);
  };

  const handleShippingConfirmYes = () => {
    setShowLabelPrintedModal(false);
    navigation.navigate('ShipConfirmShipment');
  };

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmationModal}>
            <View style={styles.iconWrapper}>
              <ConfirmTickIcon width={160} height={160} />
            </View>

            {isConfirmPack ? (
              <Text style={styles.successText}>
                No. of item <Text style={styles.boldText}>{displayCount}</Text>{'\n'}packed successfully
              </Text>
            ) : (
              <>
                <Text style={styles.successText2}>
                  Totally <Text style={styles.boldText}>{displayCount} lines</Text> items
                </Text>
                <Text style={[styles.successText, styles.successTextBottom]}>
                  have picked successfully.
                </Text>
              </>
            )}

            <View style={styles.footerSection}>
              <View style={styles.footerRow}>
                <View style={styles.questionContainer}>
                  <Text style={styles.questionText}>Would you proceed the</Text>
                  <Text style={styles.questionText}>
                    next to {isConfirmPack ? 'Print labels' : 'Manual pack'}
                  </Text>
                </View>

                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[styles.button, styles.yesButton]}
                    onPress={handleYes}
                  >
                    <Text style={styles.yesButtonText}>Yes</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.button, styles.noButton]}
                    onPress={handleNo}
                  >
                    <Text style={styles.noButtonText}>No</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

          </View>
        </View>
      </Modal>

      <Ship_PrintLabels
        isVisible={showPrintLabelModal}
        onClose={() => setShowPrintLabelModal(false)}
        onPrintComplete={handlePrintComplete}
      />

      <Modal
        visible={showLabelPrintedModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLabelPrintedModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmationModal}>
            <View style={styles.iconWrapper}>
              <ConfirmTickIcon width={120} height={120} />
            </View>

            <Text style={styles.successText}>
              <Text style={styles.boldText}>Label Printed Successfully</Text>
            </Text>

            <View style={styles.footerSection}>
              <View style={styles.footerRow}>
                <View style={styles.questionContainer}>
                  <Text style={styles.questionText}>Would you like to proceed</Text>
                  <Text style={styles.questionText}>
                    <Text style={styles.boldText}>"Shipping Confirm"</Text>
                  </Text>
                </View>

                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[styles.button, styles.yesButton]}
                    onPress={handleShippingConfirmYes}
                  >
                    <Text style={styles.yesButtonText}>Yes</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.button, styles.noButton]}
                    onPress={() => setShowLabelPrintedModal(false)}
                  >
                    <Text style={styles.noButtonText}>No</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

          </View>
        </View>
      </Modal>
    </>
  );
};

export default Ship_ManConfirmationModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  confirmationModal: {
    width: 372,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    overflow: 'hidden',
  },

  iconWrapper: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
  },

  successText: {
    fontSize: 18,
    color: '#233E55',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },

  successText2: {
    fontSize: 18,
    color: '#233E55',
    textAlign: 'center',
    lineHeight: 24,
  },

  successTextBottom: {
    marginBottom: 16,
  },

  boldText: {
    fontWeight: '700',
  },

  footerSection: {
    backgroundColor: '#ECF1F7',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },

  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  questionContainer: {
    flex: 1,
  },

  questionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#233E55',
    lineHeight: 18,
  },

  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginLeft: 16,
  },

  button: {
    width: 64,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  yesButton: {
    backgroundColor: '#233E55',
  },

  noButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D0D5DD',
  },

  yesButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  noButtonText: {
    color: '#5F6B7A',
    fontWeight: '600',
  },
});
