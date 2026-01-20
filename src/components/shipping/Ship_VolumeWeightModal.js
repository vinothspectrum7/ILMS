import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import SingleFooterBtnComponent from '../../components/SingleFooterBtnComponent';
import DeliveryBoxIcon from '../../assets/icons/Ship_Icons/DeliveryBoxIcon';
import WeightIcon from '../../assets/icons/Ship_Icons/WeightIcon.svg';

const VolumeWeightModal = ({ visible, onClose, onSubmit }) => {
  const [volume, setVolume] = useState('');
  const [netWeight, setNetWeight] = useState('');
  const [tareWeight, setTareWeight] = useState('');
  const [grossWeight, setGrossWeight] = useState('');

  const areAllFieldsFilled = () => {
    return (
      volume.trim() !== '' &&
      netWeight.trim() !== '' &&
      tareWeight.trim() !== '' &&
      grossWeight.trim() !== ''
    );
  };

  const handleSubmit = () => {
    if (!areAllFieldsFilled()) return; 
    
    const data = {
      volume,
      netWeight,
      tareWeight,
      grossWeight
    };

    if (onSubmit) {
      onSubmit(data);
    }
    onClose();
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.popup}>
          <View style={styles.header}>
            <Text style={styles.headerText}>Volume and Weight</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.formGroup}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <DeliveryBoxIcon width={20} height={20} />
                  <Text style={styles.sectionTitle}>Volume</Text>
                </View>
                <View style={styles.uomBadge}>
                  <Text style={styles.uomText}>UOM (Cubic Cm)</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <Text style={styles.label}>Volume*</Text>

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter volume"
                  keyboardType="numeric"
                  value={volume}
                  onChangeText={setVolume}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <WeightIcon width={20} height={20} />
                  <Text style={styles.sectionTitle}>Weight</Text>
                </View>
                <View style={styles.uomBadge}>
                  <Text style={styles.uomText}>UOM (Kg)</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.weightRow}>
                <View style={styles.weightItem}>
                  <Text style={styles.label}>Net Weight*</Text>
                  <View style={styles.weightInputContainer}>
                    <TextInput
                      style={styles.weightInput}
                      placeholder="Enter"
                      keyboardType="numeric"
                      value={netWeight}
                      onChangeText={setNetWeight}
                    />
                  </View>
                </View>

                <View style={styles.weightItem}>
                  <Text style={styles.label}>Tare Weight*</Text>
                  <View style={styles.weightInputContainer}>
                    <TextInput
                      style={styles.weightInput}
                      placeholder="Enter"
                      keyboardType="numeric"
                      value={tareWeight}
                      onChangeText={setTareWeight}
                    />
                  </View>
                </View>

                <View style={styles.weightItem}>
                  <Text style={styles.label}>Gross Weight*</Text>
                  <View style={styles.weightInputContainer}>
                    <TextInput
                      style={styles.weightInput}
                      placeholder="Enter"
                      keyboardType="numeric"
                      value={grossWeight}
                      onChangeText={setGrossWeight}
                    />
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.submitButtonContainer}>
              <SingleFooterBtnComponent
                label="Submit"
                onPress={handleSubmit}
                enabled={areAllFieldsFilled()} 
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
  },

  popup: {
    width: 372,
    height: 380,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },

  header: {
    width: '100%',
    height: 49,
    backgroundColor: '#ECF1F7',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },

  headerText: {
    fontFamily: 'Mulish',
    fontWeight: '700',
    fontSize: 16,
    lineHeight: 16,
    letterSpacing: 0,
    color: '#233E55',
  },

  closeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#233E55',
    justifyContent: 'center',
    alignItems: 'center',
  },

  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 20,
  },

  content: {
    padding: 20,
    flex: 1,
    justifyContent: 'space-between',
  },

  formGroup: {
    marginBottom: 20,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#233E55',
    fontFamily: 'Mulish',
  },

  uomBadge: {
    backgroundColor: '#ECF1F7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },

  uomText: {
    fontSize: 11,
    color: '#233E55',
    fontFamily: 'Mulish',
  },

  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginBottom: 12,
  },

  label: {
    fontSize: 12,
    fontWeight: '400',
    color: '#233E55',
    marginBottom: 6,
    fontFamily: 'Mulish',
  },

  inputContainer: {
    borderWidth: 1,
    borderColor: '#D0D0D0',
    borderRadius: 8,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },

  input: {
    fontSize: 14,
    color: '#233E55',
    flex: 1,
    fontFamily: 'Mulish',
  },

  weightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },

  weightItem: {
    flex: 1,
  },

  weightInputContainer: {
    borderWidth: 1,
    borderColor: '#D0D0D0',
    borderRadius: 8,
    height: 40,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },

  weightInput: {
    fontSize: 14,
    color: '#233E55',
    width: '100%',
    fontFamily: 'Mulish',
  },

  submitButtonContainer: {
    marginTop: 'auto',
    alignItems: 'center',
  },
});

export default VolumeWeightModal;