import React, { useState, useCallback } from 'react';
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
import { Organization_Dropdown_Mock_Data } from '../../data/ItemInquiryMockData';
import ItemInquiry_Dropdown from '../../components/ItemInquiry/ItemInquiry_Dropdown';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BASE_WIDTH = 375;
const scale = size => (SCREEN_WIDTH / BASE_WIDTH) * size;
const ms = (size, factor = 0.35) => size + (scale(size) - size) * factor;

const ItemOnHandScreen = () => {
  const navigation = useNavigation();
  const { OrgData } = useReceivingStore();
  const [showScanner, setShowScanner] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [selectedOrganization, setSelectedOrganization] = useState(Organization_Dropdown_Mock_Data[0]);

  const onBack = useCallback(() => navigation.goBack(), [navigation]);
  const onMenu = useCallback(() => navigation.toggleDrawer?.(), [navigation]);

  const handleOrganizationChange = (org) => {
    setSelectedOrganization(org);
    console.log('Selected Organization:', org);
  };

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
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
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

              <View style={styles.contentWrapper}>
                
                <View style={styles.organizationDropdownSection}>
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
            </View>
          </View>
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
  contentWrapper: {
    width: '100%',
  },
  organizationDropdownSection: {
    width: '100%',
    marginBottom: ms(20),
  },
});

export default ItemOnHandScreen;