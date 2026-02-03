import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Inv_HeaderComponent from '../../components/inventory/Inv_HeaderComponent';
import { useReceivingStore } from '../../store/receivingStore';
import BarcodeScanner from '../../screens/BarCodeScanner';
import BarcodescannerIcon from '../../assets/icons/barcodescanner.svg';
import ContainerIcon from '../../assets/icons/CycleCount_Icons/Container.svg';
import OrgbuildingIcon from '../../assets/icons/CycleCount_Icons/OrgbuildingIcon.svg';
import { Item_Inquiry_Mock_Data } from '../../data/ItemInquiryMockData';
import { Organization_Dropdown_Mock_Data } from '../../data/ItemInquiryMockData';
import DocumentIcon from '../../assets/icons/Ship_Icons/DocumentIcon.svg';
import GreenOutlineTick from '../../assets/icons/CycleCount_Icons/GreenOutlineTick.svg';
import WhiteLocationIcon from '../../assets/icons/CycleCount_Icons/WhiteLocation.svg';
import LinearGradient from 'react-native-linear-gradient';
import ItemInquiry_Dropdown from '../../components/ItemInquiry/ItemInquiry_Dropdown';
import StockTabContent from '../../components/ItemInquiry/ItemInquiry_StockTabComponent';
import OrgTabComponent from '../../components/ItemInquiry/ItemInquiry_OrgTabComponent';
import TransactionTabComponent from '../../components/ItemInquiry/ItemInquiry_TransactionTabComponent';
import DetailsTabComponent from '../../components/ItemInquiry/ItemInquiry_DetailsTabComponent';
import BlueOutlineTick from '../../assets/icons/CycleCount_Icons/BlueOutlineTick.svg';
import PurpleOutlineTick from '../../assets/icons/CycleCount_Icons/PurpleOutlineTick.svg';
import DownloadIcon from '../../assets/icons/CycleCount_Icons/Download.svg';
import ClipboardIcon from '../../assets/icons/CycleCount_Icons/ClipboardIcon.svg'
import ShareIcon from '../../assets/icons/CycleCount_Icons/ShareIcon.svg';
import Share from 'react-native-share';
import ItemInquiry_PrintComponent from '../../components/ItemInquiry/ItemInquiry_PrintComponent';
import Clipboard from '@react-native-clipboard/clipboard';
import ViewShot from 'react-native-view-shot';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BASE_WIDTH = 375;
const scale = size => (SCREEN_WIDTH / BASE_WIDTH) * size;
const ms = (size, factor = 0.35) => size + (scale(size) - size) * factor;

const TABS = ['Overview', 'Stock', 'Organization', 'Transactions', 'Details'];

const getAttributeIcon = (attributeValue) => {
  const value = attributeValue?.toLowerCase() || '';

  if (value.includes('lot')) {
    return PurpleOutlineTick;
  } else if (value.includes('serial')) {
    return BlueOutlineTick;
  } else if (value.includes('electronic') || value.includes('purchasable') ||
    value.includes('stockable') || value.includes('transactable')) {
    return GreenOutlineTick;
  }
  return GreenOutlineTick;
};

const AttributeCapsule = ({ value, backgroundColor, textColor = '#233E55' }) => {
  const IconComponent = getAttributeIcon(value);
  return (
    <View style={[styles.attributeCapsule, { backgroundColor }]}>
      <Text style={[styles.attributeValueOnly, { color: textColor }]}>
        {value}
      </Text>
      <IconComponent width={ms(16)} height={ms(16)} />
    </View>
  );
};

const ItemInquiryScreen = () => {
  const navigation = useNavigation();
  const { OrgData } = useReceivingStore();
  const [showScanner, setShowScanner] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [itemData, setItemData] = useState(null);
  const [activeTab, setActiveTab] = useState('Overview');
  const [selectedOrganization, setSelectedOrganization] = useState(Organization_Dropdown_Mock_Data[0]);

  const onBack = useCallback(() => navigation.goBack(), [navigation]);
  const onMenu = useCallback(() => navigation.toggleDrawer?.(), [navigation]);

  const handleOrganizationChange = (org) => {
    setSelectedOrganization(org);
    console.log('Selected Organization:', org);
  };

  const viewShotRef = useRef(null);

  useEffect(() => {
    if (itemData?.itemHeader?.organizationName) {
      const org = Organization_Dropdown_Mock_Data.find(
        org => org.name === itemData.itemHeader.organizationName
      );
      if (org) {
        setSelectedOrganization(org);
      }
    }
    handleSearch('ITEM-2024-001');
  }, [itemData]);

  const handleScan = (code) => {
    setBarcodeInput(code);
    setShowScanner(false);

    const scannedCode = code.trim().toLowerCase();

    const foundItem = Item_Inquiry_Mock_Data.find(
      item =>
        item.itemHeader.itemCode?.toLowerCase() === scannedCode
    );

    if (foundItem) {
      setItemData(foundItem);
    } else {
      Alert.alert('Not Found', 'Item not found for this code');
      setItemData(null);
    }
  };


  const handleSearch = (text) => {
    setBarcodeInput(text);

    const searchText = text.trim().toLowerCase();

    const foundItem = Item_Inquiry_Mock_Data.find(
      item =>
        item.itemHeader.itemCode?.toLowerCase() === searchText
    );

    if (foundItem) {
      setItemData(foundItem);
    } else {
      setItemData(null);
    }
  };

  const handlePrintPreview = async () => {
    await ItemInquiry_PrintComponent.printItemInquiry(itemData, activeTab, selectedOrganization);
  };

  const handleCopyToClipboard = () => {
    if (!itemData) {
      Alert.alert('Error', 'No item data to copy');
      return;
    }

    if (activeTab === 'Stock') {
      const stockSummaryData = itemData?.overview?.stockSummary || Item_Inquiry_Mock_Data[0].overview.stockSummary;

      const clipboardText = `
STOCK SUMMARY - ${itemData.itemHeader.itemName}
Item Code: ${itemData.itemHeader.itemCode}
SKU: ${itemData.itemHeader.sku}
Organization: ${selectedOrganization?.name || 'N/A'}

• Total On Hand: ${stockSummaryData.totalOnHand}
• Available: ${stockSummaryData.available}
• Reserved: ${stockSummaryData.reserved}
• Allocated: ${stockSummaryData.allocated}
• In Transit: ${stockSummaryData.inTransit}
• On Order: ${stockSummaryData.onOrder}

Copied on: ${new Date().toLocaleDateString()}
    `.trim();

      Clipboard.setString(clipboardText);
      Alert.alert('Copied', 'Stock summary copied to clipboard');
    }
  };

  const handleScreenshotShare = async () => {
    try {
      const uri = await viewShotRef.current.capture();

      await Share.open({
        url: uri,
        type: 'image/png',
      });
    } catch (error) {
      console.log('Screenshot share error:', error);
    }
  };


  return (

    <View style={styles.container}>
      <Inv_HeaderComponent
        organizationName={OrgData?.selectedOrgCode}
        screenTitle="Item Inquiry"
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
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <ViewShot
            ref={viewShotRef}
            options={{ format: 'png', quality: 0.9 }}
          >
            <View style={styles.mainContainer}>
              <View style={styles.scannerSection}>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.inputField}
                    placeholder="Enter barcode or scan"
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

                {itemData && (
                  <View style={styles.itemCard}>
                    <View style={styles.blueContainer}>
                      <View style={styles.blueRow}>
                        <View style={styles.iconWrapper}>
                          <ContainerIcon width={ms(45)} height={ms(45)} />
                        </View>

                        <View style={styles.contentWrapper}>
                          <View style={styles.topRow}>
                            <Text style={styles.itemName}>
                              {itemData.itemHeader.itemName}
                            </Text>
                            <View style={styles.statusBadge}>
                              <Text style={styles.statusText}>
                                {itemData.itemHeader.status}
                              </Text>
                            </View>
                          </View>

                          <Text style={styles.skuText}>
                            {itemData.itemHeader.sku}
                          </Text>

                          <View style={styles.attributesRow}>
                            {itemData.itemHeader.attributes.map((attr, index) => {
                              let bgColor = '#329AFB';
                              if (attr === 'Lot') bgColor = '#0055D5';
                              else if (attr === 'Serial') bgColor = '#C767FF';
                              else if (attr === 'Electronic') bgColor = '#329AFB';
                              return (
                                <View
                                  key={index}
                                  style={[styles.attributeBadge, { backgroundColor: bgColor }]}
                                >
                                  <Text style={styles.attributeText}>{attr}</Text>
                                </View>
                              );
                            })}
                          </View>
                        </View>
                      </View>
                    </View>

                    <View style={styles.whiteContainer}>
                      <ItemInquiry_Dropdown
                        value={selectedOrganization}
                        onChange={handleOrganizationChange}
                        items={Organization_Dropdown_Mock_Data}
                        displayValue={(item) => item?.name || ''}
                        renderCode={(item) => item?.code || ''}
                        searchKeys={['name', 'code']}
                        placeholder="Select Organization"
                        disabled={false}
                        showBarcodeIcon={false}
                        multiple={false}
                        showOrganizationIcon={true}
                      />
                    </View>
                  </View>
                )}
              </View>

              <View style={styles.tabSection}>
                <View style={styles.tabContainer}>
                  <View style={styles.tabsRow}>
                    {TABS.map(tab => {
                      const isActive = activeTab === tab;
                      return (
                        <TouchableOpacity
                          key={tab}
                          style={styles.tabItem}
                          onPress={() => setActiveTab(tab)}
                        >
                          <Text style={[
                            styles.tabText,
                            isActive && styles.activeTabText,
                          ]}>
                            {tab}
                          </Text>
                          {isActive && <View style={styles.activeIndicator} />}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  <View style={styles.bottomDivider} />
                </View>
              </View>

              <View style={styles.tabContent}>
                {activeTab === 'Overview' && itemData && (
                  <>
                    <View style={styles.overviewWrapper}>
                      <View style={styles.overviewCard}>
                        <View style={styles.viewingRow}>
                          <OrgbuildingIcon width={ms(17)} height={ms(17)} />
                          <Text style={styles.viewingForOrgText}>
                            Viewing for Organization
                          </Text>
                        </View>
                        <View style={styles.overviewRow}>
                          <View style={styles.overviewTextWrapper}>
                            <Text style={styles.overviewOrgName}>
                              {itemData.overview.organizationInfo.organizationName}
                            </Text>
                            <Text style={styles.overviewDesc}>
                              {itemData.overview.organizationInfo.desc}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    <View style={styles.itemInfoSection}>
                      <View style={styles.itemInfoHeader}>
                        <DocumentIcon width={ms(18)} height={ms(18)} />
                        <Text style={styles.itemInfoText}>Item Information</Text>
                      </View>

                      <View style={styles.itemInfoDivider} />
                      <View style={styles.itemInfoGrid}>
                        <View style={styles.itemInfoRow}>
                          <View style={styles.itemInfoCell}>
                            <Text style={styles.itemInfoLabel}>Item Class</Text>
                            <Text style={styles.itemInfoValue}>
                              {itemData.overview.itemInformation.itemClass}
                            </Text>
                          </View>
                          <View style={styles.itemInfoCell}>
                            <Text style={styles.itemInfoLabel}>Item Type</Text>
                            <Text style={styles.itemInfoValue}>
                              {itemData.overview.itemInformation.itemType}
                            </Text>
                          </View>
                          <View style={styles.itemInfoCell}>
                            <Text style={styles.itemInfoLabel}>Unit of Measure</Text>
                            <Text style={styles.itemInfoValue}>
                              {itemData.overview.itemInformation.unitOfMeasure}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.itemInfoRow}>
                          <View style={styles.itemInfoCell}>
                            <Text style={styles.itemInfoLabel}>Secondary UOM</Text>
                            <Text style={styles.itemInfoValue}>
                              {itemData.overview.itemInformation.secondaryUOM}
                            </Text>
                          </View>
                          <View style={styles.itemInfoCell}>
                            <Text style={styles.itemInfoLabel}>Version/Revision</Text>
                            <Text style={styles.itemInfoValue}>
                              {itemData.overview.itemInformation.revision}
                            </Text>
                          </View>
                          <View style={styles.itemInfoCell}>
                            <Text style={styles.itemInfoLabel}>Created By / Date</Text>
                            <View style={styles.createdInfoWrapper}>
                              <Text style={styles.createdByText}>
                                {itemData.overview.itemInformation.createdBy}
                              </Text>
                              <Text style={styles.createdDateText}>
                                {itemData.overview.itemInformation.createdDate}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    </View>

                    <View style={styles.orgAttributesSection}>
                      <View style={styles.orgAttributesHeader}>
                        <DocumentIcon width={ms(18)} height={ms(18)} />
                        <Text style={styles.orgAttributesText}>Organization Attributes</Text>
                      </View>
                      <View style={styles.orgAttributesDivider} />
                      <View style={styles.orgAttributesGrid}>

                        <View style={styles.orgAttributesRow}>
                          <AttributeCapsule
                            value={itemData.overview.organizationAttributes.purchasable}
                            backgroundColor="#E8F5E9"
                          />
                          <AttributeCapsule
                            value={itemData.overview.organizationAttributes.stockable}
                            backgroundColor="#E8F5E9"
                          />
                        </View>

                        <View style={styles.orgAttributesRow}>
                          <AttributeCapsule
                            value={itemData.overview.organizationAttributes.transactable}
                            backgroundColor="#E8F5E9"
                          />
                          <AttributeCapsule
                            value={itemData.overview.organizationAttributes.serialControlled}
                            backgroundColor="#EEF6FF"
                            textColor="#033EFF"
                          />
                        </View>

                        <View style={styles.orgAttributesRow}>
                          <AttributeCapsule
                            value={itemData.overview.organizationAttributes.lotControlled}
                            backgroundColor="#E9D8FF"
                          />
                          <AttributeCapsule
                            value={itemData.overview.organizationAttributes.leadTime}
                            backgroundColor="#ECF1F7"
                          />
                        </View>
                      </View>
                    </View>

                    <View style={styles.planningSection}>
                      <View style={styles.planningHeader}>
                        <DocumentIcon width={ms(18)} height={ms(18)} />
                        <Text style={styles.planningText}>Planning Parameters</Text>
                      </View>
                      <View style={styles.planningDivider} />
                      <View style={styles.planningGrid}>
                        <View style={styles.planningRow}>
                          <View style={styles.planningCell}>
                            <Text style={styles.planningLabel}>Safety Stock</Text>
                            <Text style={styles.planningValue}>
                              {itemData.overview.planningParameters.safetyStock}
                            </Text>
                          </View>
                          <View style={styles.planningCell}>
                            <Text style={styles.planningLabel}>Min Order Qty</Text>
                            <Text style={styles.planningValue}>
                              {itemData.overview.planningParameters.minOrderQuantity}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.planningRow}>
                          <View style={styles.planningCell}>
                            <Text style={styles.planningLabel}>Max Order Qty</Text>
                            <Text style={styles.planningValue}>
                              {itemData.overview.planningParameters.maxOrderQuantity}
                            </Text>
                          </View>
                          <View style={styles.planningCell}>
                            <Text style={styles.planningLabel}>Self Life</Text>
                            <Text style={styles.planningValue}>
                              {itemData.overview.planningParameters.selfLife}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    <View style={styles.costSection}>
                      <View style={styles.costHeader}>
                        <DocumentIcon width={ms(18)} height={ms(18)} />
                        <Text style={styles.costText}>Cost Information</Text>
                      </View>
                      <View style={styles.costDivider} />
                      <View style={styles.costGrid}>
                        <View style={styles.costRow}>
                          <View style={styles.costCell}>
                            <Text style={styles.costLabel}>Average Cost</Text>
                            <Text style={styles.costValue}>
                              {itemData.overview.costInformation.averageCost}
                            </Text>
                          </View>
                          <View style={styles.costCell}>
                            <Text style={styles.costLabel}>Standard Cost</Text>
                            <Text style={styles.costValue}>
                              {itemData.overview.costInformation.standardCost}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => {
                        if (itemData?.itemHeader?.itemCode) {
                          navigation.navigate('ItemOnHandScreen', {
                            itemCode: itemData.itemHeader.itemCode
                          });
                        } else {
                          Alert.alert('Error', 'Item code not found');
                        }
                      }}
                      style={styles.onHandBtnWrapper}
                    >
                      <LinearGradient
                        colors={['#5D768B', '#233E55']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.onHandBtn}
                      >
                        <View style={styles.onHandBtnContent}>
                          <WhiteLocationIcon width={ms(16)} height={ms(16)} />
                          <Text style={styles.onHandBtnText}>View On-Hand by Location</Text>
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
                  </>
                )}

                {activeTab === 'Stock' && itemData && (
                  <StockTabContent itemData={itemData} />
                )}
                {activeTab === 'Organization' && itemData && (
                  <OrgTabComponent itemData={itemData} />
                )}
                {activeTab === 'Transactions' && itemData && (
                  <TransactionTabComponent itemData={itemData} />
                )}
                {activeTab === 'Details' && itemData && (
                  <DetailsTabComponent itemData={itemData} />
                )}
              </View>
            </View>
          </ViewShot>

          {itemData && (
            <View style={styles.footerContainer}>
              <View style={styles.footerButtons}>
                {activeTab !== 'Overview' && (
                  <>
                    <TouchableOpacity
                      style={styles.footerButton}
                      onPress={handlePrintPreview}
                    >
                      <View style={styles.buttonCircle}>
                        <DownloadIcon width={ms(24)} height={ms(24)} fill="#FFFFFF" />
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.footerButton}
                      onPress={handleScreenshotShare}
                    >
                      <View style={styles.buttonCircle}>
                        <ShareIcon width={ms(24)} height={ms(24)} />
                      </View>
                    </TouchableOpacity>
                    {activeTab === 'Stock' && (
                      <TouchableOpacity
                        style={styles.footerButton}
                        onPress={handleCopyToClipboard}
                      >
                        <View style={styles.buttonCircle}>
                          <ClipboardIcon width={ms(24)} height={ms(24)} fill="#FFFFFF" />
                        </View>
                      </TouchableOpacity>
                    )}
                  </>
                )}
              </View>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F6'
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
  itemCard: {
    width: '100%',
    borderRadius: ms(4),
    overflow: 'hidden',
    marginBottom: ms(12),
  },
  blueContainer: {
    backgroundColor: '#145DA0',
    padding: ms(12),
  },
  blueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    width: ms(48),
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentWrapper: {
    flex: 1,
    paddingLeft: ms(8),
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ms(4),
  },
  itemName: {
    fontFamily: 'Mulish-Bold',
    fontSize: ms(12),
    fontWeight: '700',
    lineHeight: ms(12),
    color: '#FFFFFF',
    flex: 1,
  },
  statusBadge: {
    backgroundColor: '#15D54D',
    paddingHorizontal: ms(10),
    paddingVertical: ms(4),
    borderRadius: ms(4),
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: ms(12),
    fontWeight: '600',
    fontFamily: 'Mulish',
  },
  skuText: {
    fontFamily: 'Mulish-Bold',
    fontSize: ms(10),
    fontWeight: '700',
    lineHeight: ms(10),
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: ms(8),
  },
  attributesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ms(8),
  },
  attributeBadge: {
    paddingHorizontal: ms(10),
    paddingVertical: ms(4),
    borderRadius: ms(12),
    alignSelf: 'flex-start',
  },

  attributeText: {
    color: '#FFFFFF',
    fontSize: ms(11),
    fontWeight: '600',
    fontFamily: 'Mulish',
  },
  whiteContainer: {
    width: '100%',
    backgroundColor: '#F3F8FF',
    borderWidth: 1,
    borderColor: '#ECF1F7',
    borderBottomLeftRadius: ms(4),
    borderBottomRightRadius: ms(4),
    paddingHorizontal: ms(12),
    paddingVertical: ms(8),
  },
  tabSection: {
    width: '100%',
    backgroundColor: '#ffffff',
  },
  tabContainer: {
    width: '100%',
  },
  tabsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: ms(4),
  },
  tabItem: {
    alignItems: 'center',
    paddingBottom: ms(12),
    minWidth: ms(51),
  },
  tabText: {
    fontFamily: 'Mulish',
    fontSize: ms(12),
    fontWeight: '600',
    color: '#9D9FA3',
    marginBottom: ms(1),
  },
  activeTabText: {
    color: '#233E55',
    fontWeight: '700',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: ms(3),
    backgroundColor: '#233E55',
    borderTopRightRadius: ms(4),
    borderTopLeftRadius: ms(4),
  },
  bottomDivider: {
    width: '100%',
    borderWidth: ms(1),
    borderColor: '#7392AA',
  },
  overviewWrapper: {
    paddingTop: ms(12),
    alignItems: 'center',
  },
  overviewCard: {
    width: ms(338),
    height: ms(75),
    backgroundColor: '#E5F6FF',
    borderRadius: ms(8),
    borderWidth: 1,
    borderColor: '#D5DFFF',
    paddingHorizontal: ms(12),
    paddingVertical: ms(8),
  },
  viewingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: ms(6),
  },
  viewingForOrgText: {
    marginLeft: ms(6),
    fontFamily: 'Mulish',
    fontSize: ms(10),
    fontWeight: '500',
    lineHeight: ms(10),
    color: '#233E55',
  },
  overviewRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  overviewTextWrapper: {
    flex: 1,
  },
  overviewOrgName: {
    fontFamily: 'Mulish',
    fontSize: ms(12),
    fontWeight: '700',
    lineHeight: ms(12),
    color: '#233E55',
    marginBottom: ms(4),
  },
  overviewDesc: {
    fontFamily: 'Mulish',
    fontSize: ms(10),
    fontWeight: '400',
    lineHeight: ms(10),
    color: '#233E55',
  },
  itemInfoSection: {
    width: '100%',
    marginTop: ms(8),
  },
  itemInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: ms(20),
    paddingTop: ms(16),
    paddingBottom: ms(8),
    backgroundColor: '#FFFFFF',
  },
  itemInfoText: {
    marginLeft: ms(8),
    fontFamily: 'Mulish',
    fontSize: ms(12),
    fontWeight: '700',
    lineHeight: ms(12),
    color: '#233E55',
  },
  itemInfoDivider: {
    width: '100%',
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#233E55',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#9D9FA3',
  },
  itemInfoGrid: {
    paddingHorizontal: ms(20),
    paddingTop: ms(12),
    paddingBottom: ms(16),
    backgroundColor: '#FFFFFF',
  },
  itemInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: ms(16),
  },
  itemInfoCell: {
    width: ms(105),
  },
  itemInfoLabel: {
    fontFamily: 'Mulish',
    fontSize: ms(10),
    fontWeight: '600',
    lineHeight: ms(10),
    color: '#9D9FA3',
    marginBottom: ms(4),
  },
  itemInfoValue: {
    fontFamily: 'Mulish',
    fontSize: ms(12),
    fontWeight: '700',
    lineHeight: ms(12),
    color: '#242424',
  },
  createdInfoWrapper: {
    marginTop: ms(2),
  },
  createdByText: {
    fontFamily: 'Mulish',
    fontSize: ms(12),
    fontWeight: '700',
    lineHeight: ms(14),
    color: '#242424',
  },
  createdDateText: {
    fontFamily: 'Mulish',
    fontSize: ms(10),
    fontWeight: '400',
    lineHeight: ms(12),
    color: '#595A5C',
    marginTop: ms(2),
  },
  orgAttributesSection: {
    width: '100%',
    marginTop: ms(-17),
  },
  orgAttributesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: ms(20),
    paddingTop: ms(16),
    paddingBottom: ms(8),
    backgroundColor: '#FFFFFF',
  },
  orgAttributesText: {
    marginLeft: ms(8),
    fontFamily: 'Mulish',
    fontSize: ms(12),
    fontWeight: '700',
    lineHeight: ms(12),
    color: '#233E55',
  },
  orgAttributesDivider: {
    width: '100%',
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#233E55',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#9D9FA3',
  },
  orgAttributesGrid: {
    paddingHorizontal: ms(20),
    paddingTop: ms(12),
    paddingBottom: ms(10),
    backgroundColor: '#FFFFFF',
  },
  orgAttributesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: ms(6),
  },

  attributeCapsule: {
    width: ms(155),
    height: ms(21),
    borderRadius: ms(4),
    paddingHorizontal: ms(10),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  attributeValueOnly: {
    fontFamily: 'Mulish',
    fontSize: ms(10),
    fontWeight: '700',
    color: '#233E55',
  },
  stockContent: {
    padding: ms(20),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: ms(200),
  },
  organizationContent: {
    padding: ms(20),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: ms(200),
  },
  transactionsContent: {
    padding: ms(20),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: ms(200),
  },
  detailsContent: {
    padding: ms(20),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: ms(200),
  },
  tabTitle: {
    fontFamily: 'Mulish',
    fontSize: ms(16),
    fontWeight: '700',
    color: '#233E55',
  },
  planningSection: {
    width: '100%',
    marginTop: ms(4),
  },

  planningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: ms(20),
    paddingTop: ms(16),
    paddingBottom: ms(8),
    backgroundColor: '#FFFFFF',
  },

  planningText: {
    marginLeft: ms(8),
    fontFamily: 'Mulish',
    fontSize: ms(12),
    fontWeight: '700',
    lineHeight: ms(12),
    color: '#233E55',
  },

  planningDivider: {
    width: '100%',
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#233E55',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#9D9FA3',
  },

  planningGrid: {
    paddingHorizontal: ms(20),
    paddingTop: ms(12),
    paddingBottom: ms(16),
    backgroundColor: '#FFFFFF',
  },

  planningRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: ms(16),
  },

  planningCell: {
    width: ms(150),
  },

  planningLabel: {
    fontFamily: 'Mulish',
    fontSize: ms(10),
    fontWeight: '600',
    lineHeight: ms(10),
    color: '#9D9FA3',
    marginBottom: ms(4),
  },

  planningValue: {
    fontFamily: 'Mulish',
    fontSize: ms(12),
    fontWeight: '700',
    lineHeight: ms(12),
    color: '#242424',
  },
  costSection: {
    width: '100%',
    marginTop: ms(-8),
  },

  costHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: ms(20),
    paddingTop: ms(16),
    paddingBottom: ms(8),
    backgroundColor: '#FFFFFF',
  },

  costText: {
    marginLeft: ms(8),
    fontFamily: 'Mulish',
    fontSize: ms(12),
    fontWeight: '700',
    lineHeight: ms(12),
    color: '#233E55',
  },

  costDivider: {
    width: '100%',
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#233E55',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#9D9FA3',
  },

  costGrid: {
    paddingHorizontal: ms(20),
    paddingTop: ms(12),
    paddingBottom: ms(16),
    backgroundColor: '#FFFFFF',
  },

  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  costCell: {
    width: ms(150),
  },

  costLabel: {
    fontFamily: 'Mulish',
    fontSize: ms(10),
    fontWeight: '600',
    lineHeight: ms(10),
    color: '#9D9FA3',
    marginBottom: ms(4),
  },

  costValue: {
    fontFamily: 'Mulish',
    fontSize: ms(12),
    fontWeight: '700',
    lineHeight: ms(12),
    color: '#242424',
  },
  onHandBtnWrapper: {
    paddingHorizontal: ms(20),
    marginTop: ms(12),
  },

  onHandBtn: {
    width: '100%',
    height: ms(36),
    borderRadius: ms(8),
    justifyContent: 'center',
  },

  onHandBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: ms(10),
  },

  onHandBtnText: {
    marginLeft: ms(8),
    fontFamily: 'Mulish',
    fontSize: ms(12),
    fontWeight: '600',
    lineHeight: ms(12),
    color: '#FFFFFF',
  },
  footerContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: ms(20),
    marginBottom: ms(40),
  },
  footerButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: ms(20),
  },
  footerButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonCircle: {
    width: ms(47.76),
    height: ms(47.76),
    borderRadius: ms(47.76) / 2,
    backgroundColor: '#233E55',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
});

export default ItemInquiryScreen;