import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions } from 'react-native';
import CloseIcon from '../../assets/icons/close.svg';
import InventorySuccessIcon from '../../assets/icons/inventorysuccess.svg';
import Ship_SingleFooterBtnComponent from '../../components/shipping/Ship_SingleFooterBtnComponent';
import Ship_DropDown from '../../components/shipping/Ship_DropDown';
import { MOCK_SHIPPING_DATA } from '../../data/shippingMockData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BASE_WIDTH = 375;
const rs = v => (SCREEN_WIDTH / BASE_WIDTH) * v;

const Rec_LabelPrintModalPopUp = ({
  isVisible,
  onClose,
  onPrintComplete,
  initialPrinter,
}) => {
  const [selectedPrinter, setSelectedPrinter] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const timerRef = useRef(null);
  const didPrefillRef = useRef(false);

  const printerItems = MOCK_SHIPPING_DATA?.printableSelectionList || [];

  const isFormValid = useMemo(() => {
    return !!selectedPrinter;
  }, [selectedPrinter]);

  const closeAll = () => {
    setShowSuccess(false);
    onClose?.();
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isVisible) {
      setSelectedPrinter(null);
      setShowSuccess(false);
      didPrefillRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    }
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;
    if (didPrefillRef.current) return;

    if (initialPrinter) {
      const pid = String(initialPrinter);
      const found = (Array.isArray(printerItems) ? printerItems : []).find(
        p => String(p?.id ?? p?.name ?? '') === pid || String(p?.name ?? '') === pid,
      );
      if (found) setSelectedPrinter(found);
    }

    didPrefillRef.current = true;
  }, [isVisible, initialPrinter, printerItems]);

  const handlePrint = () => {
    if (!isFormValid) return;

    setShowSuccess(true);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setShowSuccess(false);
      onPrintComplete?.({
        printstatus: 'Label Printed',
        printer: selectedPrinter,
      });
      closeAll();
    }, 2500);
  };

  const mainVisible = isVisible && !showSuccess;
  const successVisible = isVisible && showSuccess;

  return (
    <>
      <Modal visible={mainVisible} transparent animationType="slide" onRequestClose={closeAll}>
        <View style={styles.overlay}>
          <View style={styles.popup}>
            <View style={styles.header}>
              <Text style={styles.headerText}>Print Label</Text>
              <TouchableOpacity onPress={closeAll} style={styles.closeButton}>
                <CloseIcon width={rs(16)} height={rs(16)} />
              </TouchableOpacity>
            </View>

            <View style={styles.content}>
              <Ship_DropDown
                label="Printer Selection"
                required
                placeholder="Select"
                value={selectedPrinter}
                onChange={setSelectedPrinter}
                items={printerItems}
                searchKeys={['name']}
                displayValue={it => String(it?.name ?? '')}
              />

              <View style={styles.printButtonContainer}>
                <Ship_SingleFooterBtnComponent
                  label="Print"
                  onPress={handlePrint}
                  enabled={isFormValid}
                  containerStyle={styles.singleFooterBtnStyle}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={successVisible} transparent animationType="fade" onRequestClose={() => {}}>
        <View style={styles.successOverlay}>
          <View style={styles.successCard}>
            <View style={styles.successTop}>
              <InventorySuccessIcon width={rs(100)} height={rs(100)} />
            </View>
            <View style={styles.successBottom}>
              <Text style={styles.successText}>Printed Successfully</Text>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start',
    paddingTop: rs(178),
    alignItems: 'center',
  },
  popup: {
    width: rs(372),
    borderRadius: rs(4),
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  header: {
    width: '100%',
    height: rs(49),
    backgroundColor: '#ECF1F7',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: rs(16),
    borderBottomWidth: 1,
    borderBottomColor: '#D1D9E6',
  },
  headerText: {
    fontSize: rs(16),
    fontWeight: '600',
    color: '#233E55',
    fontFamily: 'Mulish',
  },
  closeButton: {
    padding: rs(8),
  },
  content: {
    padding: rs(20),
    paddingBottom: rs(24),
  },
  printButtonContainer: {
    marginTop: rs(28),
    alignItems: 'center',
  },
  singleFooterBtnStyle: {
    width: '100%',
    marginBottom: 0,
    marginStart: 0,
  },
  successOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successCard: {
    width: rs(300),
    height: rs(300),
    borderRadius: rs(4),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  successTop: {
    flex: 1,
    backgroundColor: '#ECF1F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successBottom: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successText: {
    color: '#000000',
    fontSize: rs(20),
    fontWeight: '700',
  },
});

export default Rec_LabelPrintModalPopUp;
