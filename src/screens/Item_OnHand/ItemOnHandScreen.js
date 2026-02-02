import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  Dimensions,
  Modal,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Inv_HeaderComponent from '../../components/inventory/Inv_HeaderComponent';
import { useReceivingStore } from '../../store/receivingStore';
import BarcodeScanner from '../../screens/BarCodeScanner';
import BarcodescannerIcon from '../../assets/icons/barcodescanner.svg';
import ContainerIcon from '../../assets/icons/CycleCount_Icons/Container.svg';
import LocationIcon from '../../assets/icons/Ship_Icons/LocationIcon.svg';
import CloseIcon from '../../assets/icons/close.svg';
import {Organization_Dropdown_Mock_Data,  Item_OnHand_Mock_Data,} from '../../data/ItemInquiryMockData';
import ItemInquiry_Dropdown from '../../components/ItemInquiry/ItemInquiry_Dropdown';
import { useRoute } from '@react-navigation/native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BASE_WIDTH = 375;
const scale = size => (SCREEN_WIDTH / BASE_WIDTH) * size;
const ms = (size, factor = 0.35) =>
  size + (scale(size) - size) * factor;

const ItemOnHandScreen = () => {
  const navigation = useNavigation();
  const { OrgData } = useReceivingStore();

  const [showScanner, setShowScanner] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [itemOnHandData, setItemOnHandData] = useState(null);
  const [selectedOrganization, setSelectedOrganization] = useState(
    Organization_Dropdown_Mock_Data[0]
  );
  const [expandedLocation, setExpandedLocation] = useState(null);
  const [showSerialsModal, setShowSerialsModal] = useState(false);
  const [selectedLotSerials, setSelectedLotSerials] = useState([]);
  const [selectedLotNumber, setSelectedLotNumber] = useState('');

  const route = useRoute();
const passedItemCode = route.params?.itemCode;


  const onBack = useCallback(() => navigation.goBack(), [navigation]);
  const onMenu = useCallback(
    () => navigation.toggleDrawer?.(),
    [navigation]
  );

  const findItem = (code) => {
    if (!code) return null;

    const searchCode = code.trim().toLowerCase();

    return (
      Item_OnHand_Mock_Data.find(
        item =>
          item.itemHeader?.itemCode?.toLowerCase() === searchCode
      ) || null
    );
  };

  const handleScan = (code) => {
    setBarcodeInput(code);
    setShowScanner(false);

    const foundItem = findItem(code);

    if (foundItem) {
      setItemOnHandData(foundItem);
      setExpandedLocation(null);
    } else {
      Alert.alert('Not Found', 'Item not found');
      setItemOnHandData(null);
      setExpandedLocation(null);
    }
  };

  const handleSearch = (text) => {
    setBarcodeInput(text);
    const foundItem = findItem(text);
    setItemOnHandData(foundItem);
    setExpandedLocation(null);
  };

  const toggleLocationExpand = (locationIndex) => {
    if (expandedLocation === locationIndex) {
      setExpandedLocation(null);
    } else {
      setExpandedLocation(locationIndex);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).replace(',', '');
  };

  const handleGenealogyPress = (lotNumber, serials) => {
    setSelectedLotNumber(lotNumber);
    setSelectedLotSerials(serials || []);
    setShowSerialsModal(true);
  };

  const closeSerialsModal = () => {
    setShowSerialsModal(false);
    setSelectedLotSerials([]);
    setSelectedLotNumber('');
  };

  const renderSerialItem = ({ item, index }) => (
    <View style={styles.serialItem}>
      <Text style={styles.serialText} numberOfLines={1}>
        {item}
      </Text>
    </View>
  );

  useEffect(() => {
  if (passedItemCode) {
    setBarcodeInput(passedItemCode);

    const foundItem = findItem(passedItemCode);
    if (foundItem) {
      setItemOnHandData(foundItem);
      setExpandedLocation(null);
    }
  }
}, [passedItemCode]);

  return (
    <View style={styles.container}>
      <Inv_HeaderComponent
        organizationName={OrgData?.selectedOrgCode}
        screenTitle="Item On-Hand"
        onBack={onBack}
        onMenu={onMenu}
        showCartIcon={false}
      />

      {showScanner ? (
        <BarcodeScanner
          onScan={handleScan}
          onClose={() => setShowScanner(false)}
        />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.mainContainer}>
            <View style={styles.scannerSection}>

              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.inputField}
                  placeholder="Enter item code or scan"
                  placeholderTextColor="#999"
                  value={barcodeInput}
                  onChangeText={handleSearch}
                />
                <TouchableOpacity
                  style={styles.scanButton}
                  onPress={() => setShowScanner(true)}
                >
                  <BarcodescannerIcon width={ms(20)} height={ms(20)} />
                </TouchableOpacity>
              </View>

              {itemOnHandData && (
                <>
                  <View style={styles.orgHeaderContainer}>
                    <View style={styles.itemInfoContainer}>
                      <ContainerIcon width={ms(25)} height={ms(25)} />
                      <View style={styles.textContainer}>
                        <Text style={styles.itemNameText}>
                          {itemOnHandData.itemHeader.itemName}
                        </Text>
                        <Text style={styles.itemCodeText}>
                          {itemOnHandData.itemHeader.itemCode}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.onHandContainer}>
                      <View style={styles.onHandCircle}>
                        <Text style={styles.onHandValue}>
                          {itemOnHandData.onHandSummary.totalOnHand}
                        </Text>
                      </View>
                      <Text style={styles.onHandLabel}>Total On Hand</Text>
                    </View>
                  </View>

                  <View style={styles.orgStickyContainer}>
                    <ItemInquiry_Dropdown
                      value={selectedOrganization}
                      onChange={setSelectedOrganization}
                      items={Organization_Dropdown_Mock_Data}
                      displayValue={(item) => item?.name || ''}
                      renderCode={(item) => item?.code || ''}
                      searchKeys={['name', 'code']}
                      placeholder="Select Organization"
                      showOrganizationIcon
                    />
                  </View>

                  <View style={styles.metricsSection}>
                    <View style={styles.metricsRow}>
                      <View style={[styles.metricCard, styles.availableCard]}>
                        <Text style={styles.metricValue}>
                          {itemOnHandData.onHandSummary.totalAvailable}
                        </Text>
                        <Text style={styles.metricLabel}>Available</Text>
                      </View>

                      <View style={[styles.metricCard, styles.reservedCard]}>
                        <Text style={[styles.metricValue, styles.reservedValue]}>
                          {itemOnHandData.onHandSummary.totalReserved}
                        </Text>
                        <Text style={[styles.metricLabel, styles.reservedLabel]}>
                          Reserved
                        </Text>
                      </View>

                      <View style={[styles.metricCard, styles.transitCard]}>
                        <Text style={[styles.metricValue, styles.transitValue]}>
                          {itemOnHandData.onHandSummary.totalAvailableToTransit}
                        </Text>
                        <Text style={[styles.metricLabel, styles.transitLabel]}>
                          Avail. to Transit
                        </Text>
                      </View>

                      <View style={[styles.metricCard, styles.reserveCard]}>
                        <Text style={[styles.metricValue, styles.reserveValue]}>
                          {itemOnHandData.onHandSummary.totalAvailableToReserve}
                        </Text>
                        <Text style={[styles.metricLabel, styles.reserveLabel]}>
                          Avail. to Reserve
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.locationsSection}>
                    <View style={styles.locationsHeader}>
                      <Text style={styles.locationsTitle}>
                        Locations ({itemOnHandData.locations.length})
                      </Text>
                    </View>

                    {itemOnHandData.locations.map((location, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.locationCard}
                        onPress={() => toggleLocationExpand(index)}
                      >
                        <View style={styles.locationHeader}>
                          <View style={styles.locationLeftContent}>
                            <View style={styles.locationIconContainer}>
                              <LocationIcon width={ms(17)} height={ms(17)} />
                            </View>
                            <View>
                              <Text style={styles.locationName}>
                                {location.locationName}
                              </Text>
                              <Text style={styles.locationCode}>
                                {location.locationCode}
                              </Text>
                            </View>
                          </View>
                          <View style={styles.countContainer}>
                            <Text style={styles.locationCount}>
                              {location.metrics.count}
                            </Text>
                            <Text style={styles.availableText}>
                              {location.metrics.available} available
                            </Text>
                          </View>
                        </View>

                        <View style={styles.badgesContainer}>
                          <View style={styles.badgeReserved}>
                            <Text style={styles.badgeReservedValue}>
                              {location.metrics.reserved}
                            </Text>
                            <Text style={styles.badgeReservedLabel}>
                              Reserved
                            </Text>
                          </View>

                          <View style={styles.badgeAtt}>
                            <Text style={styles.badgeAttValue}>
                              {location.metrics.availableToTransit}
                            </Text>
                            <Text style={styles.badgeAttLabel}>
                              ATT
                            </Text>
                          </View>

                          <View style={styles.badgeAtr}>
                            <Text style={styles.badgeAtrValue}>
                              {location.metrics.availableToReserve}
                            </Text>
                            <Text style={styles.badgeAtrLabel}>
                              ATR
                            </Text>
                          </View>
                        </View>

                        {expandedLocation === index && location.lots && (
                          <View style={styles.lotContainer}>
                            <View style={styles.lotInnerContainer}>
                           
                              <View style={styles.lotHeaderWrapper}>
                                <View style={styles.lotHeaderBackground} />

                                <View style={styles.lotHeaderRow}>
                                  <View style={styles.lotHeaderCell}>
                                    <Text style={styles.lotHeaderText}>Lot Number</Text>
                                  </View>
                                  <View style={styles.lotHeaderCell}>
                                    <Text style={styles.lotHeaderText}>ATT</Text>
                                  </View>
                                  <View style={styles.lotHeaderCell}>
                                    <Text style={styles.lotHeaderText}>ATR</Text>
                                  </View>
                                  <View style={styles.lotHeaderCell}>
                                    <Text style={styles.lotHeaderText}>Reserved</Text>
                                  </View>
                                  <View style={styles.lotHeaderCell} />
                                </View>
                              </View>

                              {location.lots.map((lot, lotIndex) => (
                                <View key={lotIndex} style={styles.lotRow}>
                                  <View style={styles.lotCell}>
                                    <Text style={styles.lotNumber}>{lot.lotNumber}</Text>
                                    <TouchableOpacity 
                                      style={styles.genealogyButton}
                                      onPress={() => handleGenealogyPress(lot.lotNumber, lot.serials)}
                                    >
                                      <Text style={styles.genealogyButtonText}>Genealogy</Text>
                                    </TouchableOpacity>
                                  </View>

                                  <View style={styles.lotCell}>
                                    <Text style={styles.lotAttValue}>{lot.availableToTransit}</Text>
                                  </View>

                                  <View style={styles.lotCell}>
                                    <Text style={styles.lotAtrValue}>{lot.availableToReserve}</Text>
                                  </View>

                                  <View style={styles.lotCell}>
                                    <Text style={styles.lotReservedValue}>{lot.reserved}</Text>
                                  </View>

                                  <View style={styles.lotCellRight}>
                                    <Text style={styles.lotUnitsValue}>
                                      {lot.totalUnits} <Text style={styles.lotUom}>Each</Text>
                                    </Text>

                                    <Text style={styles.dateTextRight}>
                                      MFG: {formatDate(lot.mfgDate)}
                                    </Text>
                                    <Text style={styles.dateTextRight}>
                                      EXP: {formatDate(lot.expDate)}
                                    </Text>
                                  </View>
                                </View>
                              ))}
                            </View>
                          </View>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

            </View>
          </View>
        </ScrollView>
      )}

      {/* Serials Modal */}
      <Modal
        visible={showSerialsModal}
        transparent={true}
        animationType="fade"
        onRequestClose={closeSerialsModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Serials</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={closeSerialsModal}
              >
                <CloseIcon width={ms(13.15)} height={ms(13.98)} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              
              {selectedLotSerials.length > 0 ? (
                <FlatList
                  data={selectedLotSerials}
                  renderItem={renderSerialItem}
                  keyExtractor={(item, index) => index.toString()}
                  numColumns={4}
                  columnWrapperStyle={styles.serialRow}
                  contentContainerStyle={styles.serialList}
                  showsVerticalScrollIndicator={false}
                  ItemSeparatorComponent={() => <View style={styles.serialSeparator} />}
                />
              ) : (
                <View style={styles.noSerialsContainer}>
                  <Text style={styles.noSerialsText}>No serials available for this lot</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F6',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: ms(20),
  },
  mainContainer: {
    width: ms(372),
    backgroundColor: '#FFFFFF',
    borderRadius: ms(8),
    elevation: 3,
    marginTop: ms(20),
    marginBottom: ms(20),
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    paddingBottom: ms(20),
  },
  scannerSection: {
    width: '100%',
    paddingTop: ms(20),
    paddingHorizontal: ms(20),
  },
  inputWrapper: {
    width: '100%',
    height: ms(38),
    borderRadius: ms(4),
    borderWidth: 1,
    borderColor: '#E0E0E0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: ms(10),
    marginBottom: ms(16),
    backgroundColor: '#FFFFFF',
  },
  inputField: {
    flex: 1,
    fontSize: ms(14),
    fontFamily: 'Mulish',
    color: '#242424',
  },
  scanButton: {
    padding: ms(5),
  },

 orgHeaderContainer: {
  width: ms(338),
  height: ms(58),
  backgroundColor: '#145DA0',
  borderTopLeftRadius: ms(4),
  borderTopRightRadius: ms(4),
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: ms(12),
  alignSelf: 'center',
  position: 'relative',
},

  itemInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  textContainer: {
    marginLeft: ms(10),
  },
  itemNameText: {
    color: '#FFFFFF',
    fontSize: ms(14),
    fontFamily: 'Mulish',
    fontWeight: '700',
  },
  itemCodeText: {
    color: '#E6EEF8',
    fontSize: ms(12),
    fontFamily: 'Mulish',
    marginTop: ms(2),
  },

onHandContainer: {
  position: 'absolute',  
  right: ms(12),           
  top: '50%',
  transform: [{ translateY: -ms(12) }],
  alignItems: 'center',
},
  onHandCircle: {
    width: ms(23),
    height: ms(23),
    borderRadius: ms(23) / 2,
    backgroundColor: '#15D54D',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: ms(2),
  },
  onHandValue: {
    fontFamily: 'Mulish',
    fontWeight: '700',
    fontSize: ms(12),
    color: '#FFFFFF',
    lineHeight: ms(12),
  },
  onHandLabel: {
    fontFamily: 'Mulish',
    fontWeight: '700',
    fontSize: ms(8),
    color: '#FFFFFF',
    lineHeight: ms(8),
  },

  orgStickyContainer: {
    width: ms(338),
    height: ms(55),
    backgroundColor: '#F3F8FF',
    borderBottomLeftRadius: ms(4),
    borderBottomRightRadius: ms(4),
    borderWidth: 1,
    borderColor: '#ECF1F7',
    justifyContent: 'center',
    paddingHorizontal: ms(8),
    alignSelf: 'center',
    marginBottom: ms(16),
  },

  metricsSection: {
    width: '100%',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: ms(10),
    gap: ms(7),
  },
  metricCard: {
    width: ms(79),
    height: ms(48),
    borderRadius: ms(4),
    padding: ms(10),
    gap: ms(2),
    alignItems: 'center',
    justifyContent: 'center',
  },
  availableCard: {
    backgroundColor: '#F4F9FF',
  },
  reservedCard: {
    backgroundColor: '#FFF5F4',
  },
  transitCard: {
    backgroundColor: '#E8F5E9',
  },
  reserveCard: {
    backgroundColor: '#ECF1F7',
  },
  metricValue: {
    fontFamily: 'Mulish',
    fontWeight: '700',
    fontSize: ms(12),
    lineHeight: ms(12),
    color: '#145DA0',
  },
  metricLabel: {
    fontFamily: 'Mulish',
    fontWeight: '600',
    fontSize: ms(8),
    lineHeight: ms(8),
    color: '#145DA0',
  },
  reservedValue: {
    color: '#DA1E28',
  },
  reservedLabel: {
    color: '#DA1E28',
  },
  transitValue: {
    color: '#168035',
  },
  transitLabel: {
    color: '#168035',
  },
  reserveValue: {
    color: '#7392AA',
  },
  reserveLabel: {
    color: '#7392AA',
  },

  locationsSection: {
    width: '100%',
    marginTop: ms(20),
  },
  locationsHeader: {
    marginBottom: ms(12),
  },
  locationsTitle: {
    fontFamily: 'Mulish',
    fontWeight: '700',
    fontSize: ms(11),
    color: '#233E55',
  },
  locationCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: '#D9E4EE',
    borderRadius: ms(4),
    padding: ms(12),
    marginBottom: ms(10),
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: ms(12),
  },
  locationLeftContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIconContainer: {
    width: ms(24),
    height: ms(24),
    backgroundColor: '#ECF1F7',
    borderRadius: ms(4),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: ms(10),
  },
  locationName: {
    fontFamily: 'Mulish',
    fontWeight: '700',
    fontSize: ms(12),
    color: '#242424',
    marginBottom: ms(2),
  },
  locationCode: {
    fontFamily: 'Mulish',
    fontWeight: '600',
    fontSize: ms(10),
    color: '#9D9FA3',
  },
  countContainer: {
    alignItems: 'flex-end',
  },
  locationCount: {
    fontFamily: 'Mulish',
    fontWeight: '700',
    fontSize: ms(12),
    color: '#242424',
  },
  availableText: {
    fontFamily: 'Mulish',
    fontWeight: '600',
    fontSize: ms(10),
    color: '#168035',
    marginTop: ms(2),
  },
  badgesContainer: {
    flexDirection: 'row',
    gap: ms(7),
  },
  badgeReserved: {
    width: ms(61),
    height: ms(18),
    borderRadius: ms(4),
    paddingHorizontal: ms(10),
    backgroundColor: '#FFF5F4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badgeReservedValue: {
    fontFamily: 'Mulish',
    fontWeight: '600',
    fontSize: ms(8),
    color: '#DA1E28',
  },
  badgeReservedLabel: {
    fontFamily: 'Mulish',
    fontWeight: '600',
    fontSize: ms(8),
    color: '#DA1E28',
  },
  badgeAtt: {
    width: ms(49),
    height: ms(18),
    borderRadius: ms(4),
    paddingHorizontal: ms(10),
    backgroundColor: '#EEF6FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badgeAttValue: {
    fontFamily: 'Mulish',
    fontWeight: '600',
    fontSize: ms(8),
    color: '#145DA0',
  },
  badgeAttLabel: {
    fontFamily: 'Mulish',
    fontWeight: '600',
    fontSize: ms(8),
    color: '#145DA0',
  },
  badgeAtr: {
    width: ms(49),
    height: ms(18),
    borderRadius: ms(4),
    paddingHorizontal: ms(10),
    backgroundColor: '#F3F8FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badgeAtrValue: {
    fontFamily: 'Mulish',
    fontWeight: '600',
    fontSize: ms(8),
    color: '#7392AA',
  },
  badgeAtrLabel: {
    fontFamily: 'Mulish',
    fontWeight: '600',
    fontSize: ms(8),
    color: '#7392AA',
  },

  lotContainer: {
    marginTop: ms(12),
    backgroundColor: '#ECF1F7',
    borderRadius: ms(8),
    padding: ms(8),
  },
  lotInnerContainer: {
    backgroundColor: '#ffffff',
    borderRadius: ms(8),
    padding: ms(12),
  },
  lotHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: ms(8),
    zIndex: 1,
  },
  lotHeaderCell: {
    flex: 1,
    alignItems: 'center',
  },
  lotHeaderText: {
    fontFamily: 'Mulish',
    fontWeight: '600',
    fontSize: ms(8),
    color: '#595A5C',
    textAlign: 'center',
  },
  lotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: ms(6),
    paddingHorizontal: ms(4),
    borderBottomWidth: 0.5,
    borderBottomColor: '#ECF1F7',
  },
  lotCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: ms(4),
  },
  lotNumber: {
    fontFamily: 'Mulish',
    fontWeight: '700',
    fontSize: ms(8),
    color: '#242424',
    marginBottom: ms(4),
    textAlign: 'center',
  },
  genealogyButton: {
    width: ms(50),
    height: ms(14),
    backgroundColor: '#F1E6FF',
    borderRadius: ms(4),
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: ms(2),
  },
  genealogyButtonText: {
    fontFamily: 'Mulish',
    fontWeight: '700',
    fontSize: ms(7),
    color: '#603F8B',
    textAlign: 'center',
  },
  dateText: {
    fontFamily: 'Mulish',
    fontWeight: '700',
    fontSize: ms(6),
    color: '#9D9FA3',
    marginTop: ms(1),
  },
  lotAttValue: {
    fontFamily: 'Mulish',
    fontWeight: '700',
    fontSize: ms(8),
    color: '#168035',
    marginTop: ms(4),
    textAlign: 'center',
  },
  lotAtrValue: {
    fontFamily: 'Mulish',
    fontWeight: '700',
    fontSize: ms(8),
    color: '#145DA0',
    marginTop: ms(4),
    textAlign: 'center',
  },
  lotReservedValue: {
    fontFamily: 'Mulish',
    fontWeight: '700',
    fontSize: ms(8),
    color: '#DA1E28',
    marginTop: ms(4),
    textAlign: 'center',
  },
  lotUnitsValue: {
    fontFamily: 'Mulish',
    fontWeight: '700',
    fontSize: ms(8),
    color: '#033EFF',
    textAlign: 'right',
  },
  lotUom: {
    fontFamily: 'Mulish',
    fontWeight: '600',
    fontSize: ms(7),
    color: '#033EFF',
  },
  lotHeaderBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: ms(15),
    backgroundColor: '#5D768B',
    borderRadius: ms(2),
    opacity: 0.05,
  },
  lotCellRight: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  dateTextRight: {
    fontFamily: 'Mulish',
    fontWeight: '700',
    fontSize: ms(6),
    color: '#9D9FA3',
    textAlign: 'right',
    marginTop: ms(1),
  },
  lotHeaderWrapper: {
    position: 'relative',
    marginBottom: ms(8),
    height: ms(15),
    justifyContent: 'center',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: ms(20),
  },
  modalContainer: {
    width: '100%',
    maxWidth: ms(372),
    height: ms(272),
    borderRadius: ms(4),
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  modalHeader: {
    width: '100%',
    height: ms(48),
    backgroundColor: '#ECF1F7',
    borderTopLeftRadius: ms(4),
    borderTopRightRadius: ms(4),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: ms(16),
    position: 'relative',
  },
  modalTitle: {
    fontFamily: 'Mulish',
    fontWeight: '600',
    fontSize: ms(14),
    color: '#000000',
    textAlign: 'left',
    flex: 1,
  },
  closeButton: {
    padding: ms(4),
    marginLeft: ms(8),
  },
  modalContent: {
    flex: 1,
    padding: ms(16),
  },
  serialList: {
    flexGrow: 1,
  },
  serialRow: {
    justifyContent: 'flex-start',
    marginBottom: ms(8),
    gap: ms(8),
  },
  serialItem: {
    width: ms(70), 
    height: ms(29),
    backgroundColor: '#F5F5F6',
    borderRadius: ms(4),
    paddingHorizontal: ms(8),
    paddingVertical: ms(6),
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 1,
  },
  serialText: {
    fontFamily: 'Mulish',
    fontWeight: '600',
    fontSize: ms(12),
    color: '#242424',
    textAlign: 'center',
    flexShrink: 1,
  },
  serialSeparator: {
    width: '100%',
    height: ms(8),
  },
  noSerialsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noSerialsText: {
    fontFamily: 'Mulish',
    fontWeight: '600',
    fontSize: ms(14),
    color: '#9D9FA3',
    textAlign: 'center',
  },
});

export default ItemOnHandScreen;