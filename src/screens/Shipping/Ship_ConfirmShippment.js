import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  ScrollView,
  Platform,
  TextInput,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import CalenderIcon from '../../assets/icons/Ship_Icons/CalenderIcon.svg';
import LocationIcon from '../../assets/icons/Ship_Icons/LocationIcon.svg';
import DocumentIcon from '../../assets/icons/Ship_Icons/DocumentIcon.svg';
import TruckIcon from '../../assets/icons/Ship_Icons/TruckIcon.svg';
import RupeeIcon from '../../assets/icons/Ship_Icons/RupeeIcon.svg';
import ReadyTruckIcon from '../../assets/icons/Ship_Icons/ReadyTruckIcon.svg';
import DateTimePicker from '@react-native-community/datetimepicker';
import GlobalHeaderComponent from '../../components/GlobalHeaderComponent';
import SingleFooterBtnComponent from '../../components/SingleFooterBtnComponent';
import Ship_VolumeWeightModal from '../../components/shipping/Ship_VolumeWeightModal';
import Ship_ShipConfirmPopupModal from '../../components/shipping/Ship_ShipConfirmPopupModal';
import ShippingProgressModal from '../../components/shipping/ShippingProgressModal';
import Ship_ViewDetails from '../../components/shipping/Ship_ViewDetails';
import Rec_DropDown from '../../components/receive/Rec_DropDown';
import { useShippingStore } from '../../store/shippingStore';

function Ship_ConfirmShippment({ navigation }) {
  const selectedTransaction = useShippingStore(s => s.selectedTransaction);
  const setSelectedTransaction = useShippingStore(s => s.setSelectedTransaction);
  const setTransactionStatus = useShippingStore(s => s.setTransactionStatus);
  const setShipConfirmPayload = useShippingStore(s => s.setShipConfirmPayload);

  const [selectedDate, setSelectedDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [freightTerm, setFreightTerm] = useState('Prepaid');
  const [showVolumeWeightModal, setShowVolumeWeightModal] = useState(false);

  const [allowPartialShipment, setAllowPartialShipment] = useState(false);
  const [backorderRemainingQty, setBackorderRemainingQty] = useState(false);
  const [autoInterfaceTripStop, setAutoInterfaceTripStop] = useState(false);
  const [printDocuments, setPrintDocuments] = useState(false);

  const [volumeWeightData, setVolumeWeightData] = useState(null);
  const [hasVolumeWeight, setHasVolumeWeight] = useState(false);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showShip_ViewDetails, setShowShip_ViewDetails] = useState(false);
  const [fobValue, setFobValue] = useState(null);
  const [fobLocationValue, setFobLocationValue] = useState(null);
  const [shipMethodValue, setShipMethodValue] = useState(null);
  const [freightTermValue, setFreightTermValue] = useState(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [freightCharges, setFreightCharges] = useState('');

  const deliveryNumberText = useMemo(() => {
    return String(selectedTransaction?.deliveryId ?? selectedTransaction?.deliveryNumber ?? '-') || '-';
  }, [selectedTransaction]);

  const customerNameText = useMemo(() => {
    return String(selectedTransaction?.customer ?? selectedTransaction?.customerName ?? '-') || '-';
  }, [selectedTransaction]);

  const lpnText = useMemo(() => {
    const list = selectedTransaction?.confirm_data;
    if (Array.isArray(list) && list.length > 0) {
      return String(list[0]?.lpn ?? '-') || '-';
    }
    return String(selectedTransaction?.lpn ?? '-') || '-';
  }, [selectedTransaction]);

  const shipToText = useMemo(() => {
    const addr =
      selectedTransaction?.shipToAddress ||
      selectedTransaction?.shipTo ||
      selectedTransaction?.shipToLocation ||
      '';
    return addr ? String(addr) : '-';
  }, [selectedTransaction]);

  const allRequiredFieldsFilled = () => {
    return (
      fobValue &&
      fobLocationValue &&
      shipMethodValue &&
      selectedDate &&
      freightTermValue &&
      trackingNumber.trim() !== ''
    );
  };

  const fobOptions = [
    { id: 1, name: 'FCA, Nogales', code: 'FCA-NOG' },
    { id: 2, name: 'FOB, Mumbai', code: 'FOB-MUM' },
    { id: 3, name: 'EXW, Delhi', code: 'EXW-DEL' },
    { id: 4, name: 'CIF, Chennai', code: 'CIF-CHE' },
  ];

  const fobLocationOptions = [
    { id: 1, name: 'FCA, Nogales', code: 'FCA-NOG' },
    { id: 2, name: 'Warehouse A', code: 'WH-A' },
    { id: 3, name: 'Dock B', code: 'DOCK-B' },
    { id: 4, name: 'Terminal C', code: 'TERM-C' },
  ];

  const shipMethodOptions = [
    { id: 1, name: 'DHL Express', code: 'DHL-EXP' },
    { id: 2, name: 'FedEx Ground', code: 'FDX-GND' },
    { id: 3, name: 'UPS Standard', code: 'UPS-STD' },
    { id: 4, name: 'TNT Express', code: 'TNT-EXP' },
  ];

  const freightTermOptions = [
    { id: 1, name: 'Prepaid', code: 'PRE' },
    { id: 2, name: 'Collect', code: 'COL' },
    { id: 3, name: 'Third Party', code: 'TPP' },
  ];

  const formatDate = date => {
    if (!date) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const onChangeDate = (event, picked) => {
    const currentDate = picked || new Date();
    setShowDatePicker(Platform.OS === 'ios');
    setSelectedDate(currentDate);
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  const handleConfirmShipment = () => {
    if (!allRequiredFieldsFilled()) {
      console.log('Please fill all required fields');
      return;
    }
    setShowConfirmPopup(true);
  };

  const handleAddVolumeWeight = () => {
    setShowVolumeWeightModal(true);
  };

  const handleSaveVolumeWeight = data => {
    setVolumeWeightData(data);
    setHasVolumeWeight(true);
    setShowVolumeWeightModal(false);
  };

  const handleConfirmShipping = () => {
    const payload = {
      deliveryId: selectedTransaction?.deliveryId ?? null,
      deliveryNumber: selectedTransaction?.deliveryNumber ?? selectedTransaction?.deliveryId ?? null,
      customer: selectedTransaction?.customer ?? selectedTransaction?.customerName ?? null,
      lpn: lpnText,
      shipTo: shipToText,
      fob: fobValue,
      fobLocation: fobLocationValue,
      shipMethod: shipMethodValue,
      ultimateShipToDate: selectedDate ? formatDate(selectedDate) : null,
      freightTerms: freightTermValue,
      trackingNumber: trackingNumber,
      freightCharges: freightCharges,
      options: {
        allowPartialShipment,
        backorderRemainingQty,
        autoInterfaceTripStop,
        printDocuments,
      },
      volumeWeight: volumeWeightData,
    };

    setShipConfirmPayload(payload);
    console.log(payload, 'payload');

    const items = Array.isArray(selectedTransaction?.items) ? selectedTransaction.items : [];
    const updatedItems = items.map(it => ({ ...it, status: 'Shipped' }));

    const updatedTransaction = {
      ...(selectedTransaction || {}),
      items: updatedItems,
      status: 'Shipped',
    };

    setSelectedTransaction(updatedTransaction);

    if (updatedTransaction?.deliveryId != null) {
      setTransactionStatus(updatedTransaction.deliveryId, 'Shipped');
    }

    setShowConfirmPopup(false);
    setShowProgressModal(true);
  };

  const Checkbox = ({ checked, onPress }) => (
    <TouchableOpacity
      style={[styles.checkboxSquare, checked && styles.checkboxSquareChecked]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {checked && <Text style={styles.checkboxTick}>✓</Text>}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#233E55" barStyle="light-content" />

      <GlobalHeaderComponent
        screenTitle="Confirm Shipment"
        organizationName="ENV"
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.mainCard}>
          <View style={styles.deliverySection}>
            <View style={styles.topRow}>
              <View style={styles.topItem}>
                <Text style={styles.label}>Delivery Number</Text>
                <Text style={styles.value}>{deliveryNumberText}</Text>
              </View>

              <View style={styles.topItem}>
                <Text style={styles.label}>Customer Name</Text>
                <Text style={styles.value}>{customerNameText}</Text>
              </View>

              <View style={styles.topItem}>
                <Text style={styles.label}>LPN</Text>
                <Text style={styles.value}>{lpnText}</Text>
              </View>
            </View>

            <View style={styles.bottomRow}>
              <View style={styles.shipToContainer}>
                <View style={styles.shipToRow}>
                  <Text style={styles.label}>Ship-To</Text>
                </View>
                <Text style={styles.shipToText}>
                  <LocationIcon width={16} height={16} style={styles.locationIcon} />
                  {shipToText}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.viewItemsBtn}
                activeOpacity={0.8}
                onPress={() => setShowShip_ViewDetails(true)}
              >
                <Text style={styles.viewItemsText}>View items</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.fobSection}>
            <View style={styles.sectionTitleRow}>
              <DocumentIcon width={18} height={18} style={styles.sectionIcon} />
              <Text style={styles.fobTitle}>FOB Details</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.fobFieldsContainer}>
              <View style={styles.fobFieldGroup}>
                <Rec_DropDown
                  label="FOB"
                  required={true}
                  placeholder="Select FOB"
                  placeholderStyle={styles.placeholderLight}
                  value={fobValue}
                  onChange={setFobValue}
                  items={fobOptions}
                  searchKeys={['name', 'code']}
                />
              </View>

              <View style={styles.fobFieldGroup}>
                <Rec_DropDown
                  label="FOB Location"
                  required={true}
                  placeholder="Select Location"
                  placeholderStyle={styles.placeholderLight}
                  value={fobLocationValue}
                  onChange={setFobLocationValue}
                  items={fobLocationOptions}
                  searchKeys={['name', 'code']}
                />
              </View>
            </View>
          </View>

          <View style={styles.shipDetailsSection}>
            <View style={styles.sectionTitleRow}>
              <TruckIcon width={18} height={18} style={styles.sectionIcon} />
              <Text style={styles.shipDetailsTitle}>Ship Details</Text>
            </View>
            <View style={styles.divider} />

            <View style={styles.shipMethodGroup}>
              <Rec_DropDown
                label="Ship Method"
                required={true}
                placeholder="Select Method"
                placeholderStyle={styles.placeholderLight}
                value={shipMethodValue}
                onChange={setShipMethodValue}
                items={shipMethodOptions}
                searchKeys={['name', 'code']}
              />
            </View>

            {shipMethodValue && (
              <View style={[styles.carrierDetailsContainer, styles.carrierDetailsTight]}>
                <View style={styles.carrierHeaderRow}>
                  <Text style={styles.carrierHeaderText}>Carrier</Text>
                  <Text style={styles.carrierHeaderText}>Service Level</Text>
                  <Text style={styles.carrierHeaderText}>Mode Of Transport</Text>
                </View>

                <View style={styles.carrierValuesRow}>
                  <Text style={styles.carrierValueText}>Lorem Ipsum</Text>
                  <Text style={styles.carrierValueText}>Lorem Ipsum</Text>
                  <Text style={styles.carrierValueText}>Lorem Ipsum</Text>
                </View>
              </View>
            )}
          </View>

          <View style={styles.ultimateShipSection}>
            <View style={styles.ultimateShipGroup}>
              <Text style={styles.ultimateShipLabel}>Ultimate Ship to Date*</Text>
              <TouchableOpacity
                style={styles.ultimateShipInputContainer}
                activeOpacity={0.8}
                onPress={showDatepicker}
              >
                <Text style={selectedDate ? styles.ultimateShipValue : styles.datePlaceholder}>
                  {selectedDate ? formatDate(selectedDate) : 'Select Date'}
                </Text>
                <View style={styles.calendarIcon}>
                  <CalenderIcon width={14} height={14} />
                </View>
              </TouchableOpacity>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={selectedDate || new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onChangeDate}
                minimumDate={new Date()}
              />
            )}

            <View style={styles.freightTrackingRow}>
              <View style={styles.freightTermsGroup}>
                <Rec_DropDown
                  label="Freight Terms"
                  required={true}
                  placeholder="Select Terms"
                  placeholderStyle={styles.placeholderLight}
                  value={freightTermValue}
                  onChange={setFreightTermValue}
                  items={freightTermOptions}
                  searchKeys={['name', 'code']}
                />
              </View>

              <View style={styles.trackingGroup}>
                <Text style={styles.trackingLabel}>Tracking*</Text>
                <View style={styles.trackingInputContainer}>
                  <TextInput
                    style={[styles.trackingValue, !trackingNumber && styles.placeholderLight]}
                    placeholder="Enter tracking number"
                    placeholderTextColor="#9D9FA3"
                    value={trackingNumber}
                    onChangeText={setTrackingNumber}
                    keyboardType="default"
                  />
                </View>
              </View>
            </View>
          </View>

          <LinearGradient
            colors={hasVolumeWeight ? ['#73B386', '#73B386'] : ['#7392AA', '#89ADC9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.addVolumeWeightButton, hasVolumeWeight && styles.addVolumeWeightButtonActive]}
          >
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.addVolumeWeightTouchable}
              onPress={handleAddVolumeWeight}
            >
              <Text
                style={[styles.addVolumeWeightText, hasVolumeWeight && styles.addVolumeWeightTextActive]}
              >
                {hasVolumeWeight ? 'Volume and Weight Added' : 'Add Volume and Weight'}
              </Text>
            </TouchableOpacity>
          </LinearGradient>

          <View style={styles.checkboxOptionsRow}>
            <View style={styles.checkboxRow}>
              <View style={styles.checkboxOptionContainer}>
                <View style={styles.checkboxOption}>
                  <Checkbox checked={allowPartialShipment} onPress={() => setAllowPartialShipment(!allowPartialShipment)} />
                  <Text style={styles.checkboxLabel}>Allow Partial Shipment</Text>
                </View>
              </View>

              <View style={styles.checkboxOptionContainer}>
                <View style={styles.checkboxOption}>
                  <Checkbox
                    checked={backorderRemainingQty}
                    onPress={() => setBackorderRemainingQty(!backorderRemainingQty)}
                  />
                  <Text style={styles.checkboxLabel}>Backorder Remaining Qty</Text>
                </View>
              </View>
            </View>

            <View style={[styles.checkboxRow, styles.checkboxRowMargin]}>
              <View style={styles.checkboxOptionContainer}>
                <View style={styles.checkboxOption}>
                  <Checkbox
                    checked={autoInterfaceTripStop}
                    onPress={() => setAutoInterfaceTripStop(!autoInterfaceTripStop)}
                  />
                  <Text style={styles.checkboxLabel}>Auto Interface Trip Stop</Text>
                </View>
              </View>
              <View style={styles.checkboxOptionContainer}>
                <View style={styles.checkboxOption}>
                  <Checkbox checked={printDocuments} onPress={() => setPrintDocuments(!printDocuments)} />
                  <Text style={styles.checkboxLabel}>Print Documents</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.freightChargesContainer}>
            <View style={styles.freightChargesInner}>
              <Text style={styles.freightLabel}>Freight Charges</Text>
              <View style={styles.freightValueContainer}>
                <RupeeIcon width={10} height={10} />
                <TextInput
                  style={[styles.freightValue, !freightCharges && styles.placeholderLight]}
                  placeholder="Enter amount"
                  placeholderTextColor="#9D9FA3"
                  value={freightCharges}
                  onChangeText={setFreightCharges}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {allRequiredFieldsFilled() && (
            <View style={styles.statusSection}>
              <View style={styles.statusContainer}>
                <View style={styles.statusInner}>
                  <View style={styles.statusLeftContainer}>
                    <Text style={styles.statusText}>Status: Ready to Confirm</Text>
                  </View>
                  <ReadyTruckIcon width={24} height={24} style={styles.readyTruckIcon} />
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <Ship_VolumeWeightModal
        visible={showVolumeWeightModal}
        onClose={() => setShowVolumeWeightModal(false)}
        onSubmit={handleSaveVolumeWeight}
      />

      <Ship_ShipConfirmPopupModal
        visible={showConfirmPopup}
        onClose={() => setShowConfirmPopup(false)}
        onConfirm={handleConfirmShipping}
        deliveryNumber={deliveryNumberText}
        customerName={customerNameText}
      />

      <ShippingProgressModal
        visible={showProgressModal}
        onClose={() => setShowProgressModal(false)}
      />

      <Ship_ViewDetails visible={showShip_ViewDetails} onClose={() => setShowShip_ViewDetails(false)} />

      {allRequiredFieldsFilled() && (
        <SingleFooterBtnComponent
          label="Ship Confirm"
          onPress={handleConfirmShipment}
          disabled={!allRequiredFieldsFilled()}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8',
  },

  content: {
    paddingTop: 16,
    paddingBottom: 100,
  },

  mainCard: {
    width: 372,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    alignSelf: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  topItem: {
    flex: 1,
  },

  label: {
    fontSize: 11,
    color: '#667085',
  },

  value: {
    fontSize: 13,
    fontWeight: '700',
    color: '#233E55',
    marginTop: 2,
  },

  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },

  shipToContainer: {
    flex: 1,
    marginRight: 12,
  },

  shipToRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },

  locationIcon: {
    marginRight: 6,
    marginBottom: 2,
  },

  shipToText: {
    fontSize: 12,
    color: '#233E55',
    lineHeight: 16,
  },

  viewItemsBtn: {
    width: 80,
    height: 26,
    borderRadius: 4,
    backgroundColor: '#F4FFFB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 1,
    elevation: 2,
  },

  viewItemsText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#033EFF',
  },

  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },

  sectionIcon: {
    marginRight: 8,
  },

  fobSection: {
    marginTop: 24,
  },

  fobTitle: {
    fontFamily: 'Mulish',
    fontWeight: '700',
    fontSize: 12,
    lineHeight: 12,
    letterSpacing: 0,
    color: '#242424',
  },

  divider: {
    width: 344,
    height: 0,
    borderWidth: 0.2,
    borderColor: '#9D9FA3',
    opacity: 1,
    marginTop: 4,
    alignSelf: 'center',
  },

  fobFieldsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },

  fobFieldGroup: {
    width: 166,
  },

  placeholderLight: {
    fontWeight: '200',
    color: '#9D9FA3',
  },

  shipDetailsSection: {
    marginTop: 16,
  },

  shipDetailsTitle: {
    fontFamily: 'Mulish',
    fontWeight: '700',
    fontSize: 12,
    lineHeight: 12,
    letterSpacing: 0,
    color: '#233E55',
  },

  shipMethodGroup: {
    marginTop: 16,
  },

  carrierDetailsContainer: {
    width: 348,
    borderRadius: 4,
    backgroundColor: '#F5F5F6',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  carrierDetailsTight: {
    marginTop: 1,
  },

  carrierHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },

  carrierHeaderText: {
    fontFamily: 'Mulish',
    fontWeight: '400',
    fontSize: 10,
    lineHeight: 10,
    letterSpacing: 0,
    color: '#667085',
    flex: 1,
  },

  carrierValuesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  carrierValueText: {
    fontFamily: 'Mulish',
    fontWeight: '700',
    fontSize: 12,
    lineHeight: 12,
    letterSpacing: 0,
    color: '#233E55',
    flex: 1,
  },

  ultimateShipSection: {
    marginTop: 16,
  },

  ultimateShipGroup: {
    marginBottom: 16,
  },

  ultimateShipLabel: {
    fontFamily: 'Mulish',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 12,
    letterSpacing: 0,
    color: '#595A5C',
    marginBottom: 8,
  },

  ultimateShipInputContainer: {
    width: 348,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFEFF0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },

  ultimateShipValue: {
    fontFamily: 'Mulish',
    fontWeight: '600',
    fontSize: 12,
    lineHeight: 12,
    letterSpacing: 0,
    color: '#242424',
    flex: 1,
  },

  calendarIcon: {
    marginLeft: 8,
  },

  freightTrackingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  freightTermsGroup: {
    width: 168,
  },

  trackingGroup: {
    width: 168,
  },

  trackingLabel: {
    fontFamily: 'Mulish',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 12,
    letterSpacing: 0,
    color: '#595A5C',
    marginBottom: 8,
  },

  trackingInputContainer: {
    width: 168,
    height: 45,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFEFF0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },

  trackingValue: {
    fontFamily: 'Mulish',
    fontWeight: '600',
    fontSize: 14,
    lineHeight: 14,
    letterSpacing: 0,
    color: '#242424',
    flex: 1,
    padding: 0,
  },

  addVolumeWeightButton: {
    width: 348,
    height: 35,
    borderRadius: 8,
    marginTop: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 1,
    elevation: 2,
  },

  addVolumeWeightButtonActive: {},

  addVolumeWeightTouchable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },

  addVolumeWeightText: {
    fontFamily: 'Mulish',
    fontWeight: '600',
    fontSize: 12,
    lineHeight: 12,
    letterSpacing: 0,
    color: '#FFFFFF',
    textAlign: 'center',
  },

  addVolumeWeightTextActive: {
    textAlign: 'left',
    width: '100%',
    paddingLeft: 16,
  },

  checkboxOptionsRow: {
    marginTop: 16,
  },

  checkboxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  checkboxRowMargin: {
    marginBottom: 0,
  },

  checkboxOptionContainer: {
    width: 165,
    height: 37,
    borderRadius: 8,
    backgroundColor: '#F4F9FF',
  },

  checkboxOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    height: '100%',
  },

  checkboxSquare: {
    width: 16,
    height: 16,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#9D9FA3',
    backgroundColor: 'transparent',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  checkboxSquareChecked: {
    backgroundColor: '#233E55',
    borderColor: '#233E55',
  },

  checkboxTick: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },

  checkboxLabel: {
    fontFamily: 'Mulish',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0,
    color: '#242424',
  },

  freightChargesContainer: {
    width: 348,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFEFF0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: 'center',
    marginTop: 16,
  },

  freightChargesInner: {
    flexDirection: 'column',
  },

  freightLabel: {
    paddingTop: 3,
    fontSize: 12,
    color: '#6B7280',
  },

  freightValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },

  freightValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginLeft: 4,
    padding: 0,
    height: 13,
  },

  statusSection: {
    marginTop: 12,
  },

  statusContainer: {
    width: 348,
    height: 31,
    borderRadius: 4,
    backgroundColor: '#EEFDF8',
    borderWidth: 1,
    borderColor: '#73B386',
    borderStyle: 'solid',
  },

  statusInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 8,
    height: '100%',
  },

  statusLeftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  statusText: {
    fontFamily: 'Mulish',
    fontWeight: '700',
    fontSize: 12,
    lineHeight: 12,
    letterSpacing: 0,
    color: '#168035',
  },

  readyTruckIcon: {},

  datePlaceholder: {
    fontFamily: 'Mulish',
    fontWeight: '200',
    fontSize: 12,
    lineHeight: 12,
    letterSpacing: 0,
    color: '#9D9FA3',
    flex: 1,
  },
});

export default Ship_ConfirmShippment;
