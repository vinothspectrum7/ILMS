import React, { useMemo, useCallback, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  Image,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Toast from 'react-native-toast-message';
import Inv_HeaderComponent from '../../components/inventory/Inv_HeaderComponent';
import FooterButtonsComponent from '../../components/FooterButtonsComponent';
import { useReceivingStore } from '../../store/receivingStore';
import { MOCK_ACTIVE_CYCLE_COUNT_DETAILS } from '../../data/CycleCountMockData';
import WhiteLocation from '../../assets/icons/CycleCount_Icons/Container.svg';
import UploadIcon from '../../assets/icons/CycleCount_Icons/Upload.svg';
import CameraIcon from '../../assets/icons/CycleCount_Icons/Camera.svg';
import DeleteAttachmentIcon from '../../assets/icons/deleteattachmenticon.svg';
import Ship_CustomNumericInput from '../../components/shipping/Ship_CustomNumericInput';
import CC_Dropdown from '../../components/Cycle_Count/CC_Dropdown';
import GreenTickIcon from '../../assets/icons/Ship_Icons/GreenTickIcon.svg';
import { useCycleCountStore } from '../../store/cycleCountStore';
const { width } = Dimensions.get('window');

const toUriList = assets =>
  Array.isArray(assets)
    ? assets.map(a => a?.uri).filter(u => typeof u === 'string' && u.length > 0)
    : [];

const CC_CreateActiveCount = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { OrgData } = useReceivingStore();

  const { countId, itemId } = route.params || {};

  const [countedQty, setCountedQty] = useState(0);
  const [showVariance, setShowVariance] = useState(false);
  const [selectedCondition, setSelectedCondition] = useState(null);
  const [isInputTouched, setIsInputTouched] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [comment, setComment] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const successAnim = useState(new Animated.Value(0))[0];
  const [errorMsg, setErrorMsg] = useState('');

  const mergeSelectedListItemDetails = useCycleCountStore(
    state => state.mergeSelectedListItemDetails
  );

  const { cycleCount: storeCycleCount } = useCycleCountStore();

  const savedItem = useMemo(() => {
    return storeCycleCount?.selectedListItemDetails?.find(
      i => i.itemId === itemId
    );
  }, [storeCycleCount?.selectedListItemDetails, itemId]);


  const onBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const onMenu = useCallback(() => {
    navigation.toggleDrawer?.();
  }, [navigation]);

  const cycleCount = useMemo(() => {
    return MOCK_ACTIVE_CYCLE_COUNT_DETAILS.find(cc => cc.id === countId);
  }, [countId]);

  const currentItem = useMemo(() => {
    return cycleCount?.items?.find(item => item.item_id === itemId);
  }, [cycleCount, itemId]);

  const conditionOptions = useMemo(() => [
    { id: 'excellent', name: 'Excellent' },
    { id: 'above_average', name: 'Above Average' },
    { id: 'average', name: 'Average' },
    { id: 'below_average', name: 'Below Average' },
  ], []);

  useEffect(() => {
    if (!currentItem) return;

    if (savedItem) {
      setCountedQty(savedItem.countedQty ?? 0);
      setSelectedCondition(savedItem.selectedCondition ?? null);
      setPhotos(savedItem.photos ?? []);
      setComment(savedItem.comment ?? '');
      setShowVariance(savedItem.countedQty > 0);
    } else {
      setCountedQty(0);
      setSelectedCondition(null);
      setPhotos([]);
      setComment('');
      setShowVariance(false);
    }

    setIsInputTouched(false);
    setErrorMsg('');
  }, [currentItem, savedItem]);


  const clearError = () => setErrorMsg('');

  const addImages = (uris) => {
    if (!Array.isArray(uris) || !uris.length) return;

    const maxPhotos = 10;
    if (photos.length + uris.length > maxPhotos) {
      Toast.show({
        type: 'error',
        text1: `Maximum ${maxPhotos} photos allowed`,
        text2: `You have ${photos.length} photos already`,
      });
      return;
    }

    setPhotos(prev => [...prev, ...uris]);
    Toast.show({
      type: 'success',
      text1: 'Image attached successfully',
      position: 'bottom',
    });
  };

  const handleUploadPhoto = async () => {
    clearError();
    try {
      const res = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 0,
        quality: 0.7,
        maxWidth: 1024,
        maxHeight: 1024,
      });

      if (!res?.didCancel && !res?.errorCode) {
        addImages(toUriList(res?.assets));
      } else if (res?.errorCode) {
        console.log('Image library error:', res.errorCode, res.errorMessage);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to access photo library',
        });
      }
    } catch (error) {
      console.error('Upload photo error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to access photo library',
      });
    }
  };

  const handleTakePhoto = async () => {
    clearError();
    try {
      const res = await launchCamera({
        mediaType: 'photo',
        quality: 0.7,
        maxWidth: 1024,
        maxHeight: 1024,
        cameraType: 'back',
        saveToPhotos: Platform.OS === 'ios',
      });

      if (!res?.didCancel && !res?.errorCode) {
        addImages(toUriList(res?.assets));
      } else if (res?.errorCode) {
        console.log('Camera error:', res.errorCode, res.errorMessage);
        Toast.show({
          type: 'error',
          text1: 'Camera Error',
          text2: 'Failed to capture photo',
        });
      }
    } catch (error) {
      console.error('Camera error:', error);
      Toast.show({
        type: 'error',
        text1: 'Camera Error',
        text2: 'Please check camera permissions',
      });
    }
  };

  const handleRemovePhoto = (index) => {
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    setPhotos(newPhotos);
    Toast.show({
      type: 'info',
      text1: 'Photo removed',
      position: 'bottom',
    });
  };

  const handleCommentChange = (text) => {
    setComment(text);
  };

  const isConfirmEnabled = useMemo(() => {
    const isQtyValid = typeof countedQty === 'number' && countedQty >= 0;
    const isConditionSelected = selectedCondition !== null && selectedCondition !== undefined;

    return isQtyValid && isConditionSelected;
  }, [countedQty, selectedCondition]);

  const handleCancel = () => {
    setPhotos([]);
    setComment('');
    setErrorMsg('');
    navigation.goBack();
  };

  const handleConfirm = () => {
    if (!isConfirmEnabled) {
      setErrorMsg('Please fill all mandatory fields');
      return;
    }

    const expectedQty = currentItem?.expected_quantity || 0;
    const variance = countedQty - expectedQty;
    const variancePercent = expectedQty > 0 ? ((variance / expectedQty) * 100).toFixed(1) : 0;

    const payload = {
      countId,
      itemId: currentItem?.item_id,
      itemCode: currentItem?.item_code,
      countedQty,
      expectedQty,
      variance,
      variancePercent: `${variancePercent}%`,
      selectedCondition,
      photos,
      comment,
      timestamp: new Date().toISOString(),
    };

    mergeSelectedListItemDetails(payload);


    console.log('Updated store with user input:', payload);

    setShowSuccessMessage(true);
    Animated.timing(successAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      Animated.timing(successAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setShowSuccessMessage(false);
        navigation.goBack();
      });
    }, 2000);
  };

  const handleQtyChange = (val) => {
    const expectedQty = currentItem?.expected_quantity ?? 0;
    const clampedValue = Math.min(val, expectedQty);

    setCountedQty(clampedValue);
    setShowVariance(isInputTouched || clampedValue > 0);
    setIsInputTouched(true);
    clearError();
  };


  const handleConditionChange = (condition) => {
    setSelectedCondition(condition);
    clearError();
  };

  if (!cycleCount || !currentItem) {
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
          <Text style={styles.notFoundText}>Item not found</Text>
        </View>
      </View>
    );
  }

  const getLocation = (subInventory) => {
    const locationMap = {
      MAIN_WAREHOUSE: 'Warehouse A - Shelf B3',
      SECURE_CAGE: 'Secure Cage - Rack C1',
      PICK_FACE: 'Pick Face - Bay D2',
      RACK_STORAGE: 'Rack Storage - Level E3',
      RECEIVING_BAY: 'Receiving Bay - Area F4',
      DAMAGED_AREA: 'Damaged Area - Section G5',
    };
    return locationMap[subInventory] || subInventory;
  };

  const isInputModified = countedQty !== (currentItem.expected_quantity || 0);

  return (
    <View style={styles.container}>
      <Inv_HeaderComponent
        organizationName={OrgData?.selectedOrgCode}
        screenTitle="Item Details"
        onBack={onBack}
        onMenu={onMenu}
        showCartIcon={false}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          {showSuccessMessage && (
            <Animated.View
              style={[
                styles.successBanner,
                { opacity: successAnim }
              ]}
            >
              <GreenTickIcon width={16} height={16} />
              <Text style={styles.successBannerText}>
                Cycle Count for {currentItem.item_code} made successfully
              </Text>
            </Animated.View>
          )}

          {errorMsg ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{errorMsg}</Text>
            </View>
          ) : null}

          <LinearGradient
            colors={['#5D768B', '#233E55']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[
              styles.gradientCard,
              (showSuccessMessage || errorMsg) && { marginTop: 10 }
            ]}
          >
            <View style={styles.cardContent}>
              <View style={styles.iconContainer}>
                <WhiteLocation width={24} height={24} />
              </View>

              <View style={styles.detailsGrid}>
                <View style={styles.row}>
                  <View style={styles.column}>
                    <Text style={styles.detailLabel}>Item Code</Text>
                    <Text style={styles.detailValue}>{currentItem.item_code}</Text>
                  </View>
                  <View style={styles.column}>
                    <Text style={styles.detailLabel}>Expected Qty</Text>
                    <Text style={styles.detailValue}>
                      {currentItem.expected_quantity} Units
                    </Text>
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={styles.column}>
                    <Text style={styles.detailLabel}>Location</Text>
                    <Text style={styles.detailValue}>
                      {getLocation(cycleCount.sub_inventory)}
                    </Text>
                  </View>
                  <View style={styles.column}>
                    <Text style={styles.detailLabel}>Description</Text>
                    <Text style={styles.detailValue}>{currentItem.desc}</Text>
                  </View>
                </View>
              </View>
            </View>
          </LinearGradient>

          <View style={styles.mainWhiteCard}>
            <View style={styles.countedQtySection}>
              <Text style={styles.countedQtyLabel}>
                Counted Qty* (Units)
              </Text>

              <View style={styles.numericInputWrapper}>
                <Ship_CustomNumericInput
                  value={countedQty}
                  setValue={handleQtyChange}
                  min={0}
                  max={currentItem.expected_quantity}
                  step={1}
                  width={'100%'}
                  height={41.57}
                  isSelected={isInputModified || countedQty > 0}
                  disabledinput={false}
                  bgColor="#5D768B"
                  borderColor="#5D768B"
                  textColor="#FFFFFF"
                />
              </View>
            </View>

            {showVariance && (
              <View style={styles.staticVariance}>
                <Text style={styles.staticVarianceText}>
                  Variance Detected
                </Text>

                <View style={styles.staticVarianceBadge}>
                  <Text style={styles.staticVarianceBadgeText}>
                    Difference: -5 Units (-1.0%)
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.conditionSection}>
              <CC_Dropdown
                label="Condition*"
                required={true}
                placeholder="Select"
                value={selectedCondition}
                onChange={handleConditionChange}
                items={conditionOptions}
                displayValue={(item) => item?.name || ''}
                searchKeys={['name']}
                disabled={false}
                showBarcodeIcon={false}
                multiple={false}
              />
            </View>

            <View style={styles.uploadSection}>
              <Text style={styles.uploadLabel}>
                Upload Photos
              </Text>

              <View style={styles.uploadIconsContainer}>
                <TouchableOpacity
                  style={styles.uploadIconButton}
                  onPress={handleUploadPhoto}
                  activeOpacity={0.7}
                >
                  <UploadIcon width={40} height={40} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.uploadIconButton}
                  onPress={handleTakePhoto}
                  activeOpacity={0.7}
                >
                  <CameraIcon width={40} height={40} />
                </TouchableOpacity>
              </View>
            </View>

            {photos.length > 0 && (
              <View style={styles.photosContainer}>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.photosScroll}
                >
                  <View style={styles.photosList}>
                    {photos.map((photoUri, index) => (
                      <View key={`photo-${index}`} style={styles.photoItem}>
                        <Image
                          source={{ uri: photoUri }}
                          style={styles.photoPreview}
                          resizeMode="cover"
                        />
                        <TouchableOpacity
                          style={styles.removeButton}
                          onPress={() => handleRemovePhoto(index)}
                          activeOpacity={0.8}
                        >
                          <DeleteAttachmentIcon width={12} height={12} />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}

            <View style={styles.notesOuterBorder}>
              <Text style={styles.notesLabel}>Notes</Text>
              <View style={styles.notesInnerBorder}>
                <TextInput
                  style={styles.notesInput}
                  value={comment}
                  onChangeText={handleCommentChange}
                  placeholder="Maximum 100 characters"
                  placeholderTextColor="#9CA3AF"
                  multiline
                  maxLength={100}
                  textAlignVertical="top"
                />
                <Text style={styles.notesCounter}>
                  {String(comment || '').length}/100
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <FooterButtonsComponent
        onLeftPress={handleCancel}
        onRightPress={handleConfirm}
        leftLabel="Cancel"
        rightLabel="Confirm"
        leftEnabled={true}
        rightEnabled={isConfirmEnabled}
        sticky={true}
        showShadow={true}
      />
    </View>
  );
};

export default CC_CreateActiveCount;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F6',
  },
  scrollContent: {
    paddingBottom: 100,
    alignItems: 'center',
  },
  content: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 20,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    fontSize: 16,
    color: '#595A5C',
    fontFamily: 'Mulish',
  },
  errorBanner: {
    width: width * 0.9,
    maxWidth: '100%',
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FDECEC',
    borderWidth: 1,
    borderColor: '#C62828',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  errorBannerText: {
    fontSize: 12,
    color: '#C62828',
    fontWeight: '600',
    fontFamily: 'Mulish',
  },
  successBanner: {
    width: width * 0.9,
    maxWidth: '100%',
    height: 32,
    borderRadius: 16,
    backgroundColor: '#D9FFE4',
    borderWidth: 1,
    borderColor: '#168035',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  successBannerText: {
    fontSize: 12,
    color: '#168035',
    fontWeight: '600',
    fontFamily: 'Mulish',
  },
  gradientCard: {
    width: width * 0.9,
    maxWidth: '100%',
    height: 110,
    borderRadius: 12,
    marginBottom: 20,
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  iconContainer: {
    width: 49,
    height: 42,
    borderRadius: 6.81,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
  },
  detailsGrid: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  column: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 10,
    color: '#FFFFFF',
    opacity: 0.8,
    marginBottom: 4,
    fontWeight: '600',
    fontFamily: 'Mulish',
  },
  detailValue: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '700',
    fontFamily: 'Mulish',
  },
  mainWhiteCard: {
    width: width * 0.9,
    maxWidth: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  countedQtySection: {
    width: '100%',
    marginBottom: 16,
  },
  countedQtyLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#595A5C',
    marginBottom: 12,
    fontFamily: 'Mulish',
  },
  numericInputWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  staticVariance: {
    width: '100%',
    height: 35,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#F6A066',
    paddingHorizontal: 10,
    backgroundColor: '#FFF7F1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  staticVarianceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E65100',
    fontFamily: 'Mulish',
  },
  staticVarianceBadge: {
    backgroundColor: '#FFE3CF',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  staticVarianceBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#E65100',
    fontFamily: 'Mulish',
  },
  conditionSection: {
    width: '100%',
    marginBottom: 20,
  },
  uploadSection: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  uploadLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#595A5C',
    fontFamily: 'Mulish',
  },
  uploadIconsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  uploadIconButton: {
    width: 50,
    height: 50,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',

  },
  photosContainer: {
    width: '100%',
    marginBottom: 20,
  },

  photosScroll: {
    width: '100%',
  },
  photosList: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  photoItem: {
    marginRight: 12,
    position: 'relative',
  },
  photoPreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  removeButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  notesOuterBorder: {
    width: '100%',
    height: 130,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    padding: 10,
    opacity: 1,
  },
  notesLabel: {
    fontFamily: 'Mulish',
    fontSize: 14,
    fontWeight: '600',
    color: '#595A5C',
    marginBottom: 6,
  },
  notesInnerBorder: {
    flex: 1,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D9E4EE',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  notesInput: {
    flex: 1,
    fontFamily: 'Mulish',
    fontSize: 14,
    color: '#374151',
    padding: 0,
    textAlignVertical: 'top',
    minHeight: 60,
  },
  notesCounter: {
    alignSelf: 'flex-end',
    marginTop: 4,
    color: '#9CA3AF',
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'Mulish',
  },
});