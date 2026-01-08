import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions } from 'react-native';
import CloseIcon from '../../assets/icons/close.svg';
import InventorySuccessIcon from '../../assets/icons/inventorysuccess.svg';
import Ship_SingleFooterBtnComponent from '../../components/shipping/Ship_SingleFooterBtnComponent';
import Ship_CustomNumericInput from '../../components/shipping/Ship_CustomNumericInput';
import Ship_DropDown from '../../components/shipping/Ship_DropDown';
import { MOCK_SHIPPING_DATA } from '../../data/shippingMockData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BASE_WIDTH = 375;
const rs = v => (SCREEN_WIDTH / BASE_WIDTH) * v;

const toNumberOrZero = v => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const Ship_LabelPrintModalPopUp = ({
  isVisible,
  onClose,
  onPrintComplete,
  initialDeliveryId,
  initialCopies,
}) => {
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [selectedLabelType, setSelectedLabelType] = useState(null);
  const [selectedPrintableSelection, setSelectedPrintableSelection] = useState(null);
  const [copies, setCopies] = useState(0);

  const [showPreview, setShowPreview] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const timerRef = useRef(null);
  const didPrefillRef = useRef(false);

  const deliveryItems = MOCK_SHIPPING_DATA?.deliveryList || [];
  const labelTypeItems = MOCK_SHIPPING_DATA?.labelTypeList || [];
  const printableItems = MOCK_SHIPPING_DATA?.printableSelectionList || [];

  const isFormValid = useMemo(() => {
    return !!selectedDelivery && !!selectedLabelType && !!selectedPrintableSelection && Number(copies) > 0;
  }, [selectedDelivery, selectedLabelType, selectedPrintableSelection, copies]);

  const closeAll = () => {
    setShowPreview(false);
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
      setSelectedDelivery(null);
      setSelectedLabelType(null);
      setSelectedPrintableSelection(null);
      setCopies(0);
      setShowPreview(false);
      setShowSuccess(false);
      didPrefillRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    }
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    if (!didPrefillRef.current) {
      if (initialDeliveryId) {
        const did = String(initialDeliveryId);
        const found = (Array.isArray(deliveryItems) ? deliveryItems : []).find(
          d => String(d?.deliveryId ?? '') === did,
        );
        if (found) setSelectedDelivery(found);
      }

      if (initialCopies !== undefined && initialCopies !== null) {
        setCopies(toNumberOrZero(initialCopies));
      } else {
        setCopies(0);
      }

      didPrefillRef.current = true;
    }
  }, [isVisible, initialDeliveryId, initialCopies, deliveryItems]);

  const handleDeliveryChange = item => {
    setSelectedDelivery(item);
    if (showPreview) setShowPreview(false);

    const deliveryCopies = toNumberOrZero(item?.noOfCopies);
    setCopies(deliveryCopies > 0 ? deliveryCopies : 0);
  };

  const handlePreview = () => {
    if (!isFormValid) return;
    setShowPreview(true);
  };

  const handlePrint = () => {
    if (!isFormValid) return;

    setShowPreview(false);
    setShowSuccess(true);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setShowSuccess(false);
      onPrintComplete?.();
      closeAll();
    }, 3000);
  };

  const mainVisible = isVisible && !showPreview && !showSuccess;
  const previewVisible = isVisible && showPreview;
  const successVisible = isVisible && showSuccess;

  const previewRows = useMemo(() => {
    if (!selectedDelivery) return [];
    return [
      { label: 'SCAC Code', value: selectedDelivery.scacCode || '' },
      { label: 'Pallet Number/\nBox Number', value: selectedDelivery.palletOrBoxNumber || '' },
      { label: 'Package Weight', value: selectedDelivery.packageWeight || '' },
      { label: 'Item Number', value: selectedDelivery.itemNumber || '' },
      { label: 'Consignee', value: selectedDelivery.consignee || '' },
      { label: 'Country of Origin', value: selectedDelivery.countryOfOrigin || '' },
      { label: 'Final Destination', value: selectedDelivery.finalDestination || '' },
      { label: 'Total LPN Weight', value: selectedDelivery.totalLpnWeight || '' },
    ];
  }, [selectedDelivery]);

  return (
    <>
      <Modal visible={mainVisible} transparent animationType="slide" onRequestClose={closeAll}>
        <View style={styles.overlay}>
          <View style={styles.popup}>
            <View style={styles.header}>
              <Text style={styles.headerText}>Label Print</Text>
              <TouchableOpacity onPress={closeAll} style={styles.closeButton}>
                <CloseIcon width={rs(14.73)} height={rs(14.73)} />
              </TouchableOpacity>
            </View>

            <View style={styles.content}>
              <Ship_DropDown
                label="Delivery Number"
                required
                placeholder="Select"
                value={selectedDelivery}
                onChange={handleDeliveryChange}
                items={deliveryItems}
                searchKeys={['name', 'deliveryNumber', 'deliveryId', 'scacCode', 'finalDestination']}
                displayValue={it => String(it?.deliveryNumber ?? it?.name ?? '')}
              />

              <Ship_DropDown
                label="Label Type"
                required
                placeholder="Select"
                value={selectedLabelType}
                onChange={setSelectedLabelType}
                items={labelTypeItems}
                searchKeys={['name']}
                displayValue={it => String(it?.name ?? '')}
              />

              <Ship_DropDown
                label="Printable Selection"
                required
                placeholder="Select"
                value={selectedPrintableSelection}
                onChange={setSelectedPrintableSelection}
                items={printableItems}
                searchKeys={['name']}
                displayValue={it => String(it?.name ?? '')}
              />

              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  No. Of Copies<Text style={styles.required}>*</Text>
                </Text>

                <View style={styles.numericInputWrapper}>
                  <Ship_CustomNumericInput
                    value={copies}
                    setValue={setCopies}
                    min={0}
                    max={1000000}
                    step={1}
                    width={rs(337)}
                    height={rs(45)}
                    isSelected={Number(copies) > 0}
                    disabledinput={false}
                  />
                </View>

                {isFormValid ? (
                  <TouchableOpacity activeOpacity={0.85} onPress={handlePreview} style={styles.previewLinkWrap}>
                    <Text style={styles.previewLinkText}>Preview</Text>
                  </TouchableOpacity>
                ) : null}
              </View>

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

      <Modal visible={previewVisible} transparent animationType="fade" onRequestClose={() => setShowPreview(false)}>
        <View style={styles.previewOverlay}>
          <View style={styles.previewCard}>
            <TouchableOpacity onPress={() => setShowPreview(false)} style={styles.previewClose}>
              <CloseIcon width={rs(16)} height={rs(16)} />
            </TouchableOpacity>

            <View style={styles.previewInner}>
              {previewRows.map((row, idx) => (
                <View key={`${row.label}_${idx}`} style={styles.previewRow}>
                  <Text style={styles.previewLabel}>{row.label}</Text>
                  <Text style={styles.previewValue} numberOfLines={2}>
                    {row.value}
                  </Text>
                </View>
              ))}
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
    height: rs(580),
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
    flex: 1,
  },
  formGroup: {
    marginTop: rs(2),
    marginBottom: rs(10),
  },
  label: {
    fontSize: rs(14),
    fontWeight: '400',
    color: '#233E55',
    marginBottom: rs(8),
    fontFamily: 'Mulish',
  },
  required: {
    color: '#E53935',
  },
  numericInputWrapper: {
    alignItems: 'center',
  },
  previewLinkWrap: {
    marginTop: rs(10),
    alignSelf: 'flex-start',
  },
  previewLinkText: {
    color: '#1E5DD3',
    fontSize: rs(14),
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  printButtonContainer: {
    marginTop: rs(24),
    alignItems: 'center',
  },
  singleFooterBtnStyle: {
    width: '100%',
    marginBottom: 0,
    marginStart: 0,
  },

  previewOverlay: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewCard: {
    width: rs(372),
    borderRadius: rs(4),
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingVertical: rs(18),
    paddingHorizontal: rs(18),
  },
  previewClose: {
    position: 'absolute',
    right: rs(14),
    top: rs(14),
    padding: rs(10),
    zIndex: 10,
  },
  previewInner: {
    paddingTop: rs(18),
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: rs(10),
  },
  previewLabel: {
    width: '52%',
    color: '#7A7D80',
    fontSize: rs(14),
    fontWeight: '500',
  },
  previewValue: {
    width: '45%',
    color: '#1E1E1E',
    fontSize: rs(16),
    fontWeight: '700',
    textAlign: 'left',
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

export default Ship_LabelPrintModalPopUp;
