import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StatusBar,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import GlobalHeaderComponent from '../../components/GlobalHeaderComponent';
import RadioGlossySelected from '../../assets/icons/RadioGlossySelected.svg';
import RadioGlossyUnselected from '../../assets/icons/RadioGlossyUnselected.svg';
import SingleFooterBtnComponent from '../../components/SingleFooterBtnComponent';
import ShipConfirmationModal from '../../components/shipping/Ship_ConfirmationModal';
import DropdownIcon from '../../assets/icons/dropdown.svg';
import { useShippingStore } from '../../store/shippingStore';
import { useReceivingStore } from '../../store/receivingStore';
import {
  GetShippingPackOrderData,
  GetShippingPackItemsData,
  GetShippingPackConfirmData,
} from '../../api/ApiServices';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const AutoPack = () => {


  const setPackItemsData = useShippingStore(s => s.setPickItemsData);
  const setTransactionStatus = useShippingStore(s => s.setTransactionStatus);
  const setSelectedTransaction = useShippingStore(s => s.setSelectedTransaction);

  const navigation = useNavigation();
  const selectedTransaction = useShippingStore(s => s.selectedTransaction);
  const { OrgData } = useReceivingStore();

  const getOrgCode = () => {
    const val = useReceivingStore.getState()?.OrgData?.selectedOrg;
    return parseInt(val, 10);
  };

  const cardWidth = screenWidth - 42;
  const newCardLeft = (screenWidth - cardWidth) / 2;

  const [showConfirmPackModal, setShowConfirmPackModal] = useState(false);
  const [selectedOption, setSelectedOption] = useState('Auto Pack');
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(false);
  const [animation] = useState(new Animated.Value(0));
  const [phase, setPhase] = useState('idle');
  const [PackListItems, setPackListItems] = useState([]);
  const [PackListOrders, setPackListOrders] = useState(null);

  const PackItems = useMemo(() => {
    const list = selectedTransaction?.items;
    return Array.isArray(list) ? list : [];
  }, [selectedTransaction]);

  const maptoPackItemslist = data =>
    data.map(backend => ({
      item_code: backend.item_code || '-',
      qty_to_pick: backend.qty_to_pick || '-',
      unit_of_measure: backend.unit_of_measure || '-',
      sub_inventory: backend.sub_inventory || '-',
      locator: backend.locator || '-',
      item_status: backend.status || '-',
    }));

  const mapToPickOrderHeader = backend => ({
    customer_name: backend?.customer_name || '-',
    carrier_name: backend?.carrier_name || '-',
    ship_from_location: backend?.ship_from_location || '-',
    pick_slip_number: backend?.pick_slip_number || '-',
  });

  useEffect(() => {
    if (!selectedTransaction?.deliveryId) return;

    const orgCode = getOrgCode();
    setPhase('loading');

    const loadPackItemsData = async () => {
      try {
        const Packitemsdata = await GetShippingPackItemsData(
          orgCode,
          selectedTransaction.deliveryId
        );

        if (Packitemsdata?.pick_items?.length) {
          setPackListItems(maptoPackItemslist(Packitemsdata.pick_items));
        } else {
          setPackListItems([]);
        }

        setPhase('success');
      } catch (error) {
        setPhase('error');
        navigation.navigate('Ship_Entry');
      }
    };

    const loadPackOrderData = async () => {
      try {
        const Packorderdata = await GetShippingPackOrderData(
          orgCode,
          selectedTransaction.deliveryId
        );

        if (Packorderdata?.pack_order_result?.length) {
          setPackListOrders(
            mapToPickOrderHeader(Packorderdata.pack_order_result[0])
          );
        } else {
          setPackListOrders(null);
        }

        setPhase('success');
      } catch (error) {
        setPhase('error');
        navigation.navigate('Ship_Entry');
      }
    };

    loadPackItemsData();
    loadPackOrderData();
  }, [selectedTransaction?.deliveryId]);

  const packOptions = [
    { id: 'lpn', label: 'Pack with LPN' },
    { id: 'box', label: 'Pack with Box S/N' },
    { id: 'auto', label: 'Auto Pack' },
  ];

  const toggleHeader = () => {
    Animated.timing(animation, {
      toValue: isHeaderExpanded ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();

    setIsHeaderExpanded(!isHeaderExpanded);
  };

  const cardHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [52, 102],
  });

  const rotateIcon = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const handlePackPress = async () => {
  if (!selectedTransaction?.deliveryId) return;

  setPhase('loading');
  const orgCode = getOrgCode();

  try {
    const packconfirmdata = await GetShippingPackConfirmData(
      orgCode,
      selectedTransaction.deliveryId
    );

    if (packconfirmdata?.status === null) {
      Toast.show({
        type: 'error',
        text1: packconfirmdata?.message || 'Auto Pack failed',
        position: 'top',
      });
      setPhase('success');
      return;
    }

    if (packconfirmdata?.status === 'Success') {
      Toast.show({
        type: 'success',
        text1: packconfirmdata?.message || 'Packed successfully',
        position: 'top',
      });

      const updated = {
        ...selectedTransaction,
        status: 'Ready To Ship',
      };

      setPackItemsData(updated);
      setSelectedTransaction(updated);
      setTransactionStatus(updated.deliveryId, 'Ready To Ship');

      setPhase('success');
      navigation.navigate('Ship_ConfirmPack');
      return;
    }

    Toast.show({
      type: 'error',
      text1: packconfirmdata?.message || 'Unexpected response',
      position: 'top',
    });

    setPhase('success');
  } catch (error) {
    Toast.show({
      type: 'error',
      text1: 'Error',
      text2: String(error),
      position: 'top',
      visibilityTime: 10000,
    });

    setPhase('error');
    navigation.navigate('Ship_Entry');
  }
};


  const renderRadioButton = option => {
    const isSelected = selectedOption === option.label;
    const isEnabled = option.label === 'Auto Pack';
    const RadioIcon = isSelected ? RadioGlossySelected : RadioGlossyUnselected;

    return (
      <TouchableOpacity
        key={option.id}
        style={styles.radioContainer}
        disabled={!isEnabled}
        activeOpacity={0.8}
        onPress={() => isEnabled && setSelectedOption(option.label)}
      >
        <RadioIcon width={16} height={16} />
        <Text
          style={[
            styles.radioLabel,
            isSelected && styles.radioLabelSelected,
            !isEnabled && { opacity: 0.35 },
          ]}
        >
          {option.label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderTableRow = (item, index) => (
    <View key={index} style={styles.rowCard}>
      <View style={styles.tableRow}>
        <View style={styles.itemCell}>
          <Text style={styles.itemName}>{item.item_code}</Text>
        </View>
        <View style={styles.qtyCell}>
          <Text style={styles.qtyText}>{item.qty_to_pick}</Text>
          <Text style={styles.eachText}>{item.unit_of_measure}</Text>
          <Text style={styles.statusText}>{item.item_status}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#233E55" barStyle="light-content" />

      <GlobalHeaderComponent
        screenTitle="Auto Pack"
        organizationName={OrgData?.selectedOrgCode || 'EnnVee'}
        onBack={() => navigation.goBack()}
      />

      {phase === 'loading' && (
        <View style={styles.loaderWrapper}>
          <ActivityIndicator size="large" color="#233E55" />
        </View>
      )}

      {phase !== 'loading' && (
        <>
          <View style={styles.mainContent}>
            <View style={[styles.cardContainerWrapper, { width: cardWidth }]}>
              <Animated.View style={[styles.cardContainer, { height: cardHeight }]}>
                <LinearGradient colors={['#F5F5F6', '#D9E4EE']} style={styles.gradientBackground}>
                  <View style={styles.topRow}>
                    <View style={styles.topLeft}>
                      <Text style={styles.label}>Customer Name</Text>
                      <Text style={styles.value}>{PackListOrders?.customer_name ?? '-'}</Text>
                    </View>
                    <View style={styles.topRight}>
                      <Text style={styles.label}>Carrier Name</Text>
                      <Text style={styles.value}>{PackListOrders?.carrier_name ?? '-'}</Text>
                    </View>
                  </View>

                  <Animated.View
                    style={[
                      styles.bottomRow,
                      {
                        opacity: animation,
                        height: animation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 40],
                        }),
                      },
                    ]}
                  >
                    <View style={styles.bottomLeft}>
                      <Text style={styles.label}>Ship from location</Text>
                      <Text style={styles.value}>{PackListOrders?.ship_from_location ?? '-'}</Text>
                    </View>
                    <View style={styles.bottomRight}>
                      <Text style={styles.label}>Pick Slip Number</Text>
                      <Text style={styles.value}>{PackListOrders?.pick_slip_number ?? '-'}</Text>
                    </View>
                  </Animated.View>
                </LinearGradient>
              </Animated.View>

              <TouchableOpacity style={styles.toggleCircle} onPress={toggleHeader}>
                <View style={styles.circleOuter}>
                  <Animated.View style={{ transform: [{ rotate: rotateIcon }] }}>
                    <DropdownIcon width={16} height={16} />
                  </Animated.View>
                </View>
              </TouchableOpacity>
            </View>

            <View style={[styles.newCard, { width: cardWidth, marginLeft: newCardLeft }]}>
              <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.radioGroupHorizontal}>
                  {packOptions.map(renderRadioButton)}
                </View>

                <View style={styles.tableHeader}>
                  <View style={styles.headerContent}>
                    <Text style={styles.headerText}>Items</Text>
                    <Text style={styles.headerText}>Qty To Pack</Text>
                  </View>
                </View>

                <View style={styles.tableBody}>
                  {PackListItems.map(renderTableRow)}
                </View>
              </ScrollView>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <SingleFooterBtnComponent
              label="Pack"
              onPress={handlePackPress}
              enabled
            />
          </View>

          <ShipConfirmationModal
            visible={showConfirmPackModal}
            type="CONFIRM_PACK"
            itemCount={PackListItems.length}
            onClose={() => setShowConfirmPackModal(false)}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8',
  },

  mainContent: {
    flex: 1,
  },

  cardContainerWrapper: {
    marginTop: 16,
    marginHorizontal: 21,
    borderRadius: 8,
    position: 'relative',
  },

  cardContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 1,
    elevation: 2,
  },

  gradientBackground: {
    flex: 1,
    padding: 12,
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  topLeft: {
    flex: 1,
  },

  topRight: {
    flex: 1,
    alignItems: 'flex-start',
  },

  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },

  bottomLeft: {
    flex: 1,
  },

  bottomRight: {
    flex: 1,
    alignItems: 'flex-start',
  },

  toggleCircle: {
    position: 'absolute',
    right: -10,
    top: '50%',
    marginTop: -10,
    zIndex: 10,
  },

  circleOuter: {
    width: 20,
    height: 20,
    backgroundColor: '#D9E4EE',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 1,
    elevation: 3,
  },

  label: {
    fontFamily: 'Mulish',
    fontSize: 10,
    color: '#667085',    
  },

  value: {
    fontFamily: 'Mulish',
    fontWeight: '800',
    fontSize: 12,
    color: '#233E55',
    marginBottom: 2,
  },

  newCard: {
    marginTop: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    shadowColor: '#00000040',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 1,
    elevation: 1,
    height: 542,
    maxHeight: screenHeight * 0.6,
  },

  cardContent: {
    flex: 1,
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 20,
  },

  radioSection: {
    marginTop: 5,
    marginBottom: 20,
  },

  radioGroupHorizontal: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },

  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },

  radioLabel: {
    fontFamily: 'Mulish',
    fontWeight: '300',
    fontSize: 10,
    lineHeight: 10,
    letterSpacing: 0,
    color: '#6C757D',
    includeFontPadding: false,
    textAlignVertical: 'center',
    marginRight: 20,
  },

  radioLabelSelected: {
    color: '#233E55',
    fontWeight: '300',
  },

  tableHeader: {
    width: '100%',
    height: 27,
    backgroundColor: 'rgba(93, 118, 139, 0.05)',
    borderRadius: 4,
    justifyContent: 'center',
    paddingHorizontal: 15,
    marginBottom: 12,
  },

  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  headerText: {
    fontFamily: 'Mulish-Light',
    fontSize: 12,
    fontWeight: '300',
    lineHeight: 12,
    letterSpacing: 0,
    color: '#233E55',
  },

  tableBody: {
    marginTop: 5,
  },

  rowCard: {
    width: '100%',
    height: 73,
    borderRadius: 8,
    borderWidth: 0.2,
    borderColor: '#CCCED2',
    backgroundColor: '#FFFFFF',
    opacity: 1,
    marginBottom: 10,
  },

  tableRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
  },

  itemCell: {
    flex: 1,
  },

  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#233E55',
    marginBottom: 2,
  },

  itemCode: {
    fontSize: 12,
    color: '#6C757D',
  },

  qtyCell: {
    alignItems: 'flex-end',
  },

  qtyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#233E55',
    marginBottom: 2,
  },

  statusText: {
    fontSize: 12,
    color: '#28A745',
  },

  buttonContainer: {
    paddingHorizontal: 16,
    paddingBottom: 30,
    paddingTop: 16,
    backgroundColor: '#F4F6F8',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },

  buttonWrapper: {
    width: '100%',
  },

  eachText: {
    fontSize: 12,
    color: '#595A5C',
  },
  loaderWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default AutoPack;
