import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StatusBar,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Animated
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import GlobalHeaderComponent from '../../components/GlobalHeaderComponent';
import RadioGlossySelected from '../../assets/icons/RadioGlossySelected.svg';
import RadioGlossyUnselected from '../../assets/icons/RadioGlossyUnselected.svg';
import SingleFooterBtnComponent from '../../components/SingleFooterBtnComponent';
import { AUTOPACK_MOCK_DATA } from '../../data/shippingMockData';
import ShipConfirmationModal from '../../components/shipping/Ship_ConfirmationModal';
import DropdownIcon from '../../assets/icons/dropdown.svg';
import { default as Rec_DropDown } from '../../components/receive/Rec_DropDown';
import { useShippingStore } from '../../store/shippingStore';


const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const ManualPack = () => {
  const navigation = useNavigation();

  const cardWidth = screenWidth - 42;
  const newCardWidth = Math.min(372, screenWidth - 42);
  const newCardLeft = (screenWidth - cardWidth) / 2;
  const [showConfirmPackModal, setShowConfirmPackModal] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(false);
  const [animation] = useState(new Animated.Value(0));
  const [selectedLPN, setSelectedLPN] = useState(null);
  const [isPackButtonEnabled, setIsPackButtonEnabled] = useState(false);

  const pickItems =
    useShippingStore(s => s.pickItemsData) || [];

  const packOptions = [
    { id: 'lpn', label: 'Pack with LPN' },
    { id: 'box', label: 'Pack with Box S/N' },
    { id: 'auto', label: 'Auto Pack' }
  ];

  const lpnOptions = [
    { id: '1', name: 'LPN-001', code: '1234677', description: 'ABC PVT LTD' },
    { id: '2', name: 'LPN-002', code: '1234678', description: 'XYZ CORP' },
    { id: '3', name: 'LPN-003', code: '1234679', description: 'DEF INC' },
    { id: '4', name: 'LPN-004', code: '1234680', description: 'GHI LLC' },
    { id: '5', name: 'LPN-005', code: '1234681', description: 'JKL LTD' },
    { id: '6', name: 'LPN-006', code: '1234682', description: 'MNO CORP' },
  ];
  useEffect(() => {
    console.log('PACK ITEMS →', pickItems);
  }, [pickItems]);

  useEffect(() => {
    if (selectedOption === 'Pack with LPN') {
      setIsPackButtonEnabled(selectedLPN !== null);
    } else if (selectedOption === 'Pack with Box S/N' || selectedOption === 'Auto Pack') {
      setIsPackButtonEnabled(true);
    } else {
      setIsPackButtonEnabled(false);
    }
  }, [selectedOption, selectedLPN]);

  const toggleHeader = () => {
    const toValue = isHeaderExpanded ? 0 : 1;

    Animated.timing(animation, {
      toValue,
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

  const handlePackPress = () => {
    if (selectedOption === 'Pack with LPN' && !selectedLPN) {
      return;
    }
    navigation.navigate('Ship_ManConfirmPack');
  };

  const handleLPNChange = (item) => {
    setSelectedLPN(item);
  };

  const handleOptionSelect = (optionLabel) => {
    setSelectedOption(optionLabel);
    if (optionLabel !== 'Pack with LPN') {
      setSelectedLPN(null);
    }
  };

  const renderRadioButton = (option) => {
    const isSelected = selectedOption === option.label;
    const RadioIcon = isSelected ? RadioGlossySelected : RadioGlossyUnselected;

    return (
      <TouchableOpacity
        key={option.id}
        style={styles.radioContainer}
        onPress={() => handleOptionSelect(option.label)}
      >
        <RadioIcon width={16} height={16} />
        <Text style={[
          styles.radioLabel,
          isSelected && styles.radioLabelSelected
        ]}>
          {option.label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderTableRow = (item, index) => {
    if (!item || !item.item) return null;

    return (
      <View key={`${item.item}-${index}`} style={styles.rowCard}>
        <View style={styles.tableRow}>
          <View style={styles.itemCell}>
            <Text style={styles.itemName}>{item.item || ''}</Text>
            <Text style={styles.itemCode}>{item.code || ''}</Text>
          </View>

          <View style={styles.qtyCell}>
            <Text style={styles.qtyText}>{item.quantity || ''}</Text>
            <Text style={styles.eachText}>Each</Text>
            <Text style={styles.statusText}>{item.status || ''}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#233E55" barStyle="light-content" />

      <GlobalHeaderComponent
        screenTitle="Pack"
        organizationName="ENV"
        onBack={() => navigation.goBack()}
      />

      <View style={styles.mainContent}>
        <View style={[styles.cardContainerWrapper, { width: cardWidth }]}>
          <Animated.View style={[styles.cardContainer, { height: cardHeight }]}>
            <LinearGradient
              colors={['#F5F5F6', '#D9E4EE']}
              style={styles.gradientBackground}
            >
              <View style={styles.topRow}>
                <View style={styles.topLeft}>
                  <Text style={styles.label}>Customer Name</Text>
                  <Text style={styles.value}>1100002</Text>
                </View>

                <View style={styles.topRight}>
                  <Text style={styles.label}>Company Name</Text>
                  <Text style={styles.value}>1100002</Text>
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
                  }
                ]}
              >
                <View style={styles.bottomLeft}>
                  <Text style={styles.label}>Ship from location</Text>
                  <Text style={styles.value}>3DIng</Text>
                </View>

                <View style={styles.bottomRight}>
                  <Text style={styles.label}>Pick Slip Number</Text>
                  <Text style={styles.value}>3DIng</Text>
                </View>
              </Animated.View>
            </LinearGradient>
          </Animated.View>

          <TouchableOpacity
            style={styles.toggleCircle}
            onPress={toggleHeader}
            activeOpacity={0.8}
          >
            <View style={styles.circleOuter}>
              <Animated.View style={{ transform: [{ rotate: rotateIcon }] }}>
                <DropdownIcon width={16} height={16} />
              </Animated.View>
            </View>
          </TouchableOpacity>
        </View>

        <View style={[
          styles.newCard,
          {
            width: cardWidth,
            marginLeft: newCardLeft,
          }
        ]}>
          <ScrollView
            style={styles.cardContent}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.radioSection}>
              <View style={styles.radioGroupHorizontal}>
                {packOptions.map(option => renderRadioButton(option))}
              </View>
            </View>
            {selectedOption === 'Pack with LPN' && (
              <View style={styles.searchSection}>
                <Rec_DropDown
                  placeholder="Select or search LPN"
                  value={selectedLPN}
                  onChange={handleLPNChange}
                  items={lpnOptions}
                  displayValue={(item) => item?.name || ''}
                  renderCode={(item) => item?.code || ''}
                  searchKeys={['name', 'code', 'description']}
                  required={false}
                />
              </View>
            )}

            <View style={styles.tableHeaderSection}>
              <View style={styles.tableHeader}>
                <View style={styles.headerContent}>
                  <Text style={styles.headerText}>Items</Text>
                  <Text style={styles.headerText}>Qty To Pick</Text>
                </View>
              </View>
            </View>

            <View style={styles.tableBody}>
              {pickItems.map((item, index) => renderTableRow(item, index))}
            </View>
          </ScrollView>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <SingleFooterBtnComponent
          label="Pack"
          onPress={handlePackPress}
          enabled={isPackButtonEnabled}
          containerStyle={styles.buttonWrapper}
        />
      </View>

      <ShipConfirmationModal
        visible={showConfirmPackModal}
        type="CONFIRM_PACK"
        itemCount={pickItems.length}
        onClose={() => setShowConfirmPackModal(false)}
      />
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
    fontSize: 12,
    color: '#333',
    marginBottom: 2,
  },

  value: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
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
    padding: 20,
    paddingBottom: 24,
  },

  radioSection: {
    marginTop: 0,
    marginBottom: 20,
  },

  radioGroupHorizontal: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
    gap: 15,
  },

  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  radioLabel: {
    fontFamily: 'Mulish',
    fontWeight: '300',
    fontSize: 12,
    lineHeight: 14,
    letterSpacing: 0,
    color: '#6C757D',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },

  radioLabelSelected: {
    color: '#233E55',
    fontWeight: '400',
  },

  searchSection: {
    marginBottom: -9,
  },

  tableHeaderSection: {
    marginTop: 8,
    marginBottom: 12,
  },

  tableHeader: {
    width: '100%',
    height: 32,
    backgroundColor: 'rgba(93, 118, 139, 0.05)',
    borderRadius: 6,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },

  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  headerText: {
    fontFamily: 'Mulish',
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 15,
    letterSpacing: 0,
    color: '#233E55',
  },

  tableBody: {
    marginTop: 0,
  },

  rowCard: {
    width: '100%',
    height: 76,
    borderRadius: 8,
    borderWidth: 0.5,
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
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  itemCell: {
    flex: 1,
  },

  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#233E55',
    marginBottom: 4,
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
    marginBottom: 4,
  },

  statusText: {
    fontSize: 12,
    color: '#28A745',
  },

  buttonContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
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
  }
});

export default ManualPack;