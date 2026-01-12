import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import CloseIcon from '../../assets/icons/close.svg';
import DropDown from '../../assets/icons/Ship_Icons/DropDown.svg';
import SingleFooterBtnComponent from '../../components/SingleFooterBtnComponent';
import Rec_CustomNumericInput from '../../components/receive/Rec_CustomNumericInput';

const Ship_PrintLabels = ({ isVisible, onClose, onPrintComplete }) => {
  const [copies, setCopies] = useState(1);
  const [deliveryNumber, setDeliveryNumber] = useState('DN01213');
  const [selectedLabelType, setSelectedLabelType] = useState('Template 3');
  const [selectedPrintOption, setSelectedPrintOption] = useState('Print 3');

  const labelTypes = ['Template 1', 'Template 2', 'Template 3', 'Template 4'];
  const printOptions = ['Print 1', 'Print 2', 'Print 3', 'Print All'];

  const handlePrint = () => {
    console.log('Printing:', {
      deliveryNumber,
      labelType: selectedLabelType,
      printOption: selectedPrintOption,
      copies,
    });
    
    if (onPrintComplete) {
      onPrintComplete();
    } else {
      onClose();
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.popup}>
          <View style={styles.header}>
            <Text style={styles.headerText}>Label Print</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <CloseIcon width={14.73} height={14.73} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Delivery Number*</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={deliveryNumber}
                  onChangeText={setDeliveryNumber}
                  placeholder="Enter delivery number"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Label Type*</Text>
              <View style={styles.dropdownContainer}>
                <TouchableOpacity style={styles.dropdown}>
                  <Text style={styles.dropdownText}>{selectedLabelType}</Text>
                  <DropDown width={12} height={12} style={styles.dropdownIcon} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Printable Selection*</Text>
              <View style={styles.dropdownContainer}>
                <TouchableOpacity style={styles.dropdown}>
                  <Text style={styles.dropdownText}>{selectedPrintOption}</Text>
                  <DropDown width={12} height={12} style={styles.dropdownIcon} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>No. Of Copies*</Text>
              <View style={styles.numericInputWrapper}>
                <Rec_CustomNumericInput
                  value={copies}
                  setValue={setCopies}
                  min={1}
                  max={999}
                  step={1}
                  width={337} 
                  height={45} 
                  isSelected={copies > 0}
                  disabledinput={false}
                  onLimit={() => console.log('Limit reached')}
                />
              </View>
            </View>

            <View style={styles.printButtonContainer}>
              <SingleFooterBtnComponent
                label="Print"
                onPress={handlePrint}
                enabled={true}
                containerStyle={styles.singleFooterBtnStyle}
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
    justifyContent: 'flex-start',
    paddingTop: 178,
    alignItems: 'center',
  },

  popup: {
    width: 372,
    height: 480, 
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },

  header: {
    width: 372,
    height: 49,
    backgroundColor: '#ECF1F7',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },

  headerText: {
    fontFamily: 'Mulish',
    fontWeight: '700',
    fontSize: 16,
    lineHeight: 16,
    letterSpacing: 0,
    color: '#233E55',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },

  closeButton: {
    padding: 8,
  },

  content: {
    padding: 20,
    flex: 1,
    justifyContent: 'space-between', 
  },

  formGroup: {
    marginBottom: 16,
  },

  label: {
    fontSize: 14,
    fontWeight: '400',
    color: '#233E55',
    marginBottom: 6,
    fontFamily: 'Mulish',
  },

  inputContainer: {
    borderWidth: 1,
    borderColor: '#D0D0D0',
    borderRadius: 8,
    height: 45,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },

  input: {
    fontSize: 14,
    color: '#233E55',
    padding: 0,
    height: '100%',
  },

  dropdownContainer: {
    borderWidth: 1,
    borderColor: '#D0D0D0',
    borderRadius: 8,
    height: 45,
  },

  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: '100%',
  },

  dropdownText: {
    fontSize: 14,
    color: '#233E55',
    fontFamily: 'Mulish',
  },

  dropdownIcon: {
    color: '#6C757D',
  },

  numericInputWrapper: {
    alignItems: 'center', 
  },

  printButtonContainer: {
    marginTop: 0, 
    alignItems: 'center',
  },

  singleFooterBtnStyle: {
    width: '100%',
    marginBottom: 0,
    marginStart: 0,
  },

  totalOrdersContainer: {
    marginTop: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    alignItems: 'center',
  },

  totalOrdersText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#233E55',
    fontFamily: 'Mulish',
  },
});

export default Ship_PrintLabels;