import React, { useMemo, useCallback, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Inv_HeaderComponent from '../../components/inventory/Inv_HeaderComponent';
import FooterButtonsComponent from '../../components/FooterButtonsComponent';
import { useReceivingStore } from '../../store/receivingStore';
import { MOCK_ACTIVE_CYCLE_COUNT_DETAILS } from '../../data/CycleCountMockData';
import WhiteLocation from '../../assets/icons/CycleCount_Icons/WhiteLocation.svg';
import WhiteCalendar from '../../assets/icons/CycleCount_Icons/WhiteCalendar.svg';
import SearchIcon from '../../assets/icons/SearchIcon.svg';
import BarcodeScannerIcon from '../../assets/icons/barcodescanner.svg';
import FilterIcon from '../../assets/icons/CycleCount_Icons/FilterIcon.svg';
import BarcodeScanner from '../../screens/BarCodeScanner';
import ItemBoxIcon from '../../assets/icons/Ship_Icons/ItemBoxIcon.svg';
import { useCycleCountStore } from '../../store/cycleCountStore';

const { width } = Dimensions.get('window');

const CC_ViewActiveCount = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { OrgData } = useReceivingStore();

  const [showScanner, setShowScanner] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { selectedList, cycleCount } = useCycleCountStore();
  const selectedListItemDetails = cycleCount?.selectedListItemDetails || [];
  const selectedCountId = selectedList?.id;

  console.log('CC_ViewActiveCount → selectedList from store:', selectedList);
  console.log('CC_ViewActiveCount → selectedListItemDetails from store:', selectedListItemDetails);

  const countDetails = useMemo(() => {
    if (!selectedCountId) return null;
    return MOCK_ACTIVE_CYCLE_COUNT_DETAILS.find(item => item.id === selectedCountId);
  }, [selectedCountId]);

  const onBack = useCallback(() => navigation.goBack(), [navigation]);
  const onMenu = useCallback(() => navigation.toggleDrawer?.(), [navigation]);

  const handleBarcodeScan = (scannedCode) => {
    setShowScanner(false);
    setSearchQuery(scannedCode);
    Alert.alert('Barcode Scanned', `Scanned code: ${scannedCode}\n\nSearching for item...`);
  };

  const handleItemPress = (item) => {
    navigation.navigate('CC_CreateActiveCount', {
      countId: countDetails.id,
      itemId: item.item_id,
      itemData: item,
    });
  };

const calculateOverallProgress = useMemo(() => {
  if (!countDetails || !countDetails.items) {
    return {
      completedCount: 0,
      totalCount: 0,
      progressPercent: 0,
    };
  }

  const totalCount = countDetails.items.length;
  
  const completedCount = countDetails.items.filter(item => {
    const updatedItem = selectedListItemDetails?.find(
      storeItem => storeItem.itemId === item.item_id || storeItem.item_id === item.item_id
    );
    
    if (updatedItem) {
      return (updatedItem.countedQty > 0 || updatedItem.counted_quantity > 0);
    }
        return (item.counted_quantity > 0);
  }).length;

  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return {
    completedCount,
    totalCount,
    progressPercent,
  };
}, [countDetails, selectedListItemDetails]);

  const itemsWithUpdates = useMemo(() => {
    if (!countDetails || !countDetails.items) return [];

    return countDetails.items.map(item => {
      const updatedItem = selectedListItemDetails.find(
        storeItem => storeItem.itemId === item.item_id || storeItem.item_id === item.item_id
      );

      if (updatedItem) {
        return {
          ...item,
          counted_quantity: updatedItem.countedQty || updatedItem.counted_quantity || 0,
          condition: updatedItem.selectedCondition?.id || updatedItem.condition,
          photos: updatedItem.photos || [],
          comment: updatedItem.comment || '',
        };
      }
      return {
        ...item,
        counted_quantity: item.counted_quantity || 0,
      };
    });
  }, [countDetails, selectedListItemDetails]);

  const filteredItems = searchQuery
    ? itemsWithUpdates.filter((item, index) => {
        const itemNumber = `Item ${index + 1}`;
        return (
          item.item_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.desc?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          itemNumber.toLowerCase().includes(searchQuery.toLowerCase())
        );
      })
    : itemsWithUpdates;

  const allItemsCompleted = useMemo(() => {
    if (!countDetails || !countDetails.items) return false;
    return selectedListItemDetails.length > 0;
  }, [countDetails, selectedListItemDetails]);

  const saveCountProgress = useCycleCountStore(s => s.saveCountProgress);

  const handleSave = () => {
    saveCountProgress(countDetails.id, countDetails.items.length);
    navigation.goBack();
  };

  const handleSubmit = () => {
    if (!allItemsCompleted) {
      return;
    }
    
    saveCountProgress(countDetails.id, countDetails.items.length);
    navigation.navigate('CC_ActiveCount');
  };

  if (showScanner) {
    return (
      <BarcodeScanner
        onScan={handleBarcodeScan}
        onClose={() => setShowScanner(false)}
      />
    );
  }

  if (!countDetails) {
    return (
      <View style={styles.container}>
        <Inv_HeaderComponent
          organizationName={OrgData?.selectedOrgCode}
          screenTitle="Cycle Count"
          onBack={onBack}
          onMenu={onMenu}
          showCartIcon={false}
        />
        <View style={styles.centerContent}>
          <Text style={styles.notFoundText}>Count not found</Text>
        </View>
      </View>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  };

  return (
    <View style={styles.container}>
      <Inv_HeaderComponent
        organizationName={OrgData?.selectedOrgCode}
        screenTitle="Cycle Count"
        onBack={onBack}
        onMenu={onMenu}
        showCartIcon={false}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <LinearGradient
          colors={['#5D768B', '#233E55']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientCard}
        >
          <View style={styles.gradientCardContent}>
            <View style={styles.locationDateRow}>
              <View style={styles.locationContainer}>
                <WhiteLocation width={15} height={15} style={styles.locationIcon} />
                <Text style={styles.gradientSubInventory}>
                  {countDetails.sub_inventory}
                </Text>
              </View>

              <View style={styles.dateContainer}>
                <WhiteCalendar width={15} height={15} style={styles.calendarIcon} />
                <Text style={styles.gradientDate}>
                  {formatDate(countDetails.schedule_date)}
                </Text>
              </View>
            </View>

            <View style={styles.totalRemainingRow}>
              <Text style={styles.totalText}>
                Total: {calculateOverallProgress.totalCount}
              </Text>
              <Text style={styles.remainingText}>
                Remaining: {calculateOverallProgress.totalCount - calculateOverallProgress.completedCount}
              </Text>
            </View>

            <View style={styles.progressContainer}>
              <View style={styles.progressBarBackground}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${calculateOverallProgress.progressPercent}%`,
                    },
                  ]}
                />
              </View>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.searchContainer}>
          <View style={styles.searchRow}>
            <View style={styles.searchInputContainer}>
              <SearchIcon width={16} height={16} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search Item"
                placeholderTextColor="#9D9FA3"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              <TouchableOpacity
                style={styles.scannerButton}
                onPress={() => setShowScanner(true)}
              >
                <BarcodeScannerIcon width={20} height={20} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.filterButton}>
              <FilterIcon width={15} height={15} style={styles.filterIcon} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.itemsContainer}>
          {filteredItems.map((item, index) => {
            const countedQty = Number(item.counted_quantity) || 0;
            const expectedQty = Number(item.expected_quantity) || 0;

            let itemProgressPercent = expectedQty > 0
              ? Math.min((countedQty / expectedQty) * 100, 100)
              : 0;
            
            if (itemProgressPercent === 0 && expectedQty > 0) {
              itemProgressPercent = 2;
            }

            let progressStyle = '';
            let countStyle = '';

            if (countedQty === 0) {
              progressStyle = styles.zeroProgressLabel;
              countStyle = styles.zeroProgressCount;
            } else if (countedQty === expectedQty) {
              progressStyle = styles.completedProgressLabel;
              countStyle = styles.completedProgressCount;
            } else if (countedQty > expectedQty) {
              progressStyle = styles.overcountProgressLabel;
              countStyle = styles.overcountProgressCount;
            } else if (countedQty > 0 && countedQty < expectedQty) {
              progressStyle = styles.partialProgressLabel;
              countStyle = styles.partialProgressCount;
            }

            let progressBarColor = '#2563EB';
            let progressBgColor = '#FEF3C7';
            let itemStatus = '';

            if (countedQty === 0) {
              progressBarColor = '#DA1E28';
              progressBgColor = '#FFEBEE';
            } else if (countedQty === expectedQty) {
              progressBarColor = '#10B981';
              progressBgColor = '#F0FDF4';
            } else if (countedQty > expectedQty) {
              progressBarColor = '#FF9800';
              progressBgColor = '#FFF3E0';
              itemStatus = '';
            } else if (countedQty > 0 && countedQty < expectedQty) {
              progressBarColor = '#F06000';
              progressBgColor = '#FEF3C7';
            }

            return (
              <TouchableOpacity
                key={item.item_id}
                style={styles.itemCard}
                onPress={() => handleItemPress(item)}
                activeOpacity={0.7}
              >
                <View style={styles.itemTopRow}>
                  <View style={styles.leftIconBox}>
                    <ItemBoxIcon width={25} height={25} />
                  </View>

                  <View style={styles.itemTextBlock}>
                    <View style={styles.itemHeaderRow}>
                      <Text style={styles.itemNumber}>Item {index + 1}</Text>
                      {itemStatus ? (
                        <Text style={[styles.itemStatus, { color: progressBarColor }]}>
                          {itemStatus}
                        </Text>
                      ) : null}
                    </View>

                    <Text style={styles.itemDescription}>{item.desc}</Text>
                  </View>
                </View>

                <View style={styles.progressWrapper}>
                  <View
                    style={[
                      styles.progressWrapperBg,
                      { backgroundColor: progressBgColor }
                    ]}
                  />

                  <View style={styles.progressTextRow}>
                    <Text style={[styles.progressLabel, progressStyle]}>
                      Progress
                    </Text>
                    <Text style={[styles.progressCount, countStyle]}>
                      {countedQty}/{expectedQty} Each
                    </Text>
                  </View>

                  <View style={styles.progressBarContainer}>
                    <View style={styles.itemProgressBarBackground}>
                      <View
                        style={[
                          styles.itemProgressBarFill,
                          {
                            width: `${itemProgressPercent}%`,
                            backgroundColor: progressBarColor,
                          },
                        ]}
                      />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <FooterButtonsComponent
        onLeftPress={handleSave}
        onRightPress={handleSubmit}
        leftLabel="Save"
        rightLabel="Submit"
        leftEnabled={true}
        rightEnabled={allItemsCompleted}
        sticky={true}
        showShadow={true}
      />
    </View>
  );
};

export default CC_ViewActiveCount;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F6',
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    fontFamily: 'Mulish',
    fontSize: 16,
    color: '#595A5C',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  gradientCard: {
    width: 373,
    height: 100,
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 16,
  },
  gradientCardContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'space-between',
  },
  locationDateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    marginRight: 4,
  },
  calendarIcon: {
    marginRight: 4,
  },
  gradientSubInventory: {
    fontFamily: 'Mulish',
    fontWeight: '700',
    fontSize: 14,
    lineHeight: 10,
    letterSpacing: 0,
    color: '#FFFFFF',
  },
  gradientDate: {
    fontFamily: 'Mulish',
    fontWeight: '700',
    fontSize: 14,
    lineHeight: 10,
    letterSpacing: 0,
    color: '#FFFFFF',
  },
  totalRemainingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 6,
  },
  totalText: {
    fontFamily: 'Mulish',
    fontWeight: '700',
    fontSize: 14,
    lineHeight: 10,
    letterSpacing: 0,
    color: '#FFFFFF',
  },
  remainingText: {
    fontFamily: 'Mulish',
    fontWeight: '700',
    fontSize: 14,
    lineHeight: 10,
    letterSpacing: 0,
    color: '#FFFFFF',
  },
  progressContainer: {
    width: 332,
    height: 7,
    borderRadius: 8,
    alignSelf: 'center',
  },
  progressBarBackground: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgb(255, 255, 255)',
    borderRadius: 8,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#89ADC9',
    borderRadius: 8,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInputContainer: {
    width: 331,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9E4EE',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    flex: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Mulish',
    fontSize: 14,
    color: '#242424',
    padding: 0,
  },
  scannerButton: {
    padding: 4,
    marginLeft: 8,
  },
  filterButton: {
    width: 35,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9E4EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterIcon: {
    opacity: 1,
  },
  itemsContainer: {
    paddingHorizontal: 20,
  },
  itemCard: {
    width: 373,
    minHeight: 117,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D9E4EE',
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 12,
    alignSelf: 'center',
  },
  itemTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  leftIconBox: {
    width: 42,
    height: 36,
    borderRadius: 5,
    backgroundColor: 'rgba(177, 202, 222, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  itemTextBlock: {
    flex: 1,
  },
  itemHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemNumber: {
    fontFamily: 'Mulish',
    fontWeight: '700',
    fontSize: 14,
    color: '#233E55',
  },
  itemStatus: {
    fontFamily: 'Mulish',
    fontWeight: '600',
    fontSize: 12,
  },
  itemDescription: {
    fontFamily: 'Mulish',
    fontWeight: '400',
    fontSize: 14,
    color: '#233E55',
  },
  progressWrapper: {
    width: '100%',
    height: 60,
    borderRadius: 15,
    overflow: 'hidden',
    position: 'relative',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 12,
  },
  progressWrapperBg: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.23,
    borderRadius: 10,
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    zIndex: 1,
  },
  progressLabel: {
    fontFamily: 'Mulish',
    fontWeight: '600',
    fontSize: 12,
    color: '#233E55', 
  },
  zeroProgressLabel: {
    color: '#DA1E28',
  },
  completedProgressLabel: {
    color: '#168035',
  },
  overcountProgressLabel: {
    color: '#FF9800',
  },
  partialProgressLabel: {
    color: '#F06000',
  },
  progressCount: {
    fontFamily: 'Mulish',
    fontWeight: '700',
    fontSize: 12,
    color: '#233E55', 
  },
  zeroProgressCount: {
    color: '#DA1E28',
  },
  completedProgressCount: {
    color: '#168035',
  },
  overcountProgressCount: {
    color: '#FF9800',
  },
  partialProgressCount: {
    color: '#F06000',
  },
  progressBarContainer: {
    position: 'relative',
    height: 6,
    zIndex: 1,
  },
  itemProgressBarBackground: {
    width: '100%',
    height: '100%',
    backgroundColor: '#ECF1F7',
    borderRadius: 3,
    overflow: 'hidden',
  },
  itemProgressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
});