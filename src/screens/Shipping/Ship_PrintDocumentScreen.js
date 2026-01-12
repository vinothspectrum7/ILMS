import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import GlobalHeaderComponent from '../../components/GlobalHeaderComponent';
import Rec_DropDown from '../../components/receive/Rec_DropDown';
import BarcodeScanner from '../../screens/BarCodeScanner';
import Ship_ViewPack from '../../components/shipping/Ship_ViewPack'; 
// import EyeIcon from '../../assets/icons/Ship_Icons/EyeIcon.svg'
    
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BASE_WIDTH = 375;
const rs = v => (SCREEN_WIDTH / BASE_WIDTH) * v;

function Ship_PrintDocument({ navigation }) {
  const DELIVERY_IDS = [
    { id: 'DEL-1001', name: '1100002' },
    { id: 'DEL-1002', name: '1100003' },
    { id: 'DEL-1003', name: '1100004' },
  ];

  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [scannerVisible, setScannerVisible] = useState(false);
  const [viewPackVisible, setViewPackVisible] = useState(false);

  const handleBarcodePress = () => {
    setScannerVisible(true);
  };

  const handleBarcodeScanned = codeString => {
    const scanned = String(codeString || '').trim().toUpperCase();
    const matched = DELIVERY_IDS.find(d => d.id === scanned);
    if (matched) setSelectedDelivery(matched);
    setScannerVisible(false);
  };

  const handleViewPack = () => {
    console.log('View Pack clicked, setting visible to true');
    setViewPackVisible(true);
  };

  const handleCloseViewPack = () => {
    console.log('Closing view pack');
    setViewPackVisible(false);
  };

  const packData = selectedDelivery ? {
    deliveryNumber: selectedDelivery.name,
    packNumber: selectedDelivery.name,
    customerName: 'ABC PVT LTD',
    totalLines: '30',
    totalQuantity: '300',
    items: [
      { itemCode: 'ITEM001', description: 'Product A', quantity: 50, uom: 'PCS' },
      { itemCode: 'ITEM002', description: 'Product B', quantity: 100, uom: 'PCS' },
      { itemCode: 'ITEM003', description: 'Product C', quantity: 150, uom: 'PCS' },
    ]
  } : null;

  if (scannerVisible) {
    return (
      <BarcodeScanner
        onScan={handleBarcodeScanned}
        onClose={() => setScannerVisible(false)}
      />
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar backgroundColor="#233E55" barStyle="light-content" />

      <Ship_ViewPack
        visible={viewPackVisible}
        onClose={handleCloseViewPack}
        packData={packData}
      />

      <GlobalHeaderComponent
        screenTitle="Print Document"
        organizationName="ENV"
        onBack={() => navigation.goBack()}
        navRowStyle={{ backgroundColor: '#233E55' }}
      />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cardWrapper}>
          <View style={styles.card}>
            <Rec_DropDown
              label="Select Delivery ID"
              required
              placeholder="Select"
              value={selectedDelivery}
              onChange={setSelectedDelivery}
              items={DELIVERY_IDS}
              displayValue={item => item?.name || ''}
              searchKeys={['id', 'name']}
              showBarcodeIcon
              onBarcodePress={handleBarcodePress}
            />
            
            {selectedDelivery && (
              <>
                <View style={styles.packCardContainer}>
                  <LinearGradient
                    colors={['#5D768B', '#233E55']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.packCardGradient}
                  >
                    <View style={styles.packCardContent}>
                      <View style={styles.packRow}>
                        <View style={styles.packCol}>
                          <Text style={styles.packLabel}>Delivery Number</Text>
                          <Text style={styles.packValue}>{selectedDelivery.name}</Text>
                        </View>

                        <View style={styles.packCol}>
                          <Text style={styles.packLabel}>Pack Number</Text>
                          <Text style={styles.packValue}>{selectedDelivery.name}</Text>
                        </View>
                      </View>

                      <View style={[styles.packRow, { marginTop: rs(12) }]}>
                        <View style={styles.packCol}>
                          <Text style={styles.packLabel}>Customer Name</Text>
                          <Text style={styles.packValue}>ABC PVT LTD</Text>
                        </View>

                        <View style={styles.packCol}>
                          <Text style={styles.packLabel}>Total Lines/Qty</Text>
                          <Text style={styles.packValue}>30/300</Text>
                        </View>
                      </View>
                    </View>

                    <TouchableOpacity 
                      style={styles.viewPackBtn}
                      onPress={handleViewPack}
                      activeOpacity={0.7}
                    >
                      <EyeIcon width={16} height={16} />
                      <Text style={styles.viewPackText}>View Pack</Text>
                    </TouchableOpacity>
                  </LinearGradient>
                </View>

                <View style={styles.docsWrapper}>
                  <Text style={styles.docsTitle}>Available Documents</Text>

                  <TouchableOpacity style={styles.docItem}>
                    <Text style={styles.docText}>BOL Document</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.docItem}>
                    <Text style={styles.docText}>Pack List Document</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.docItem}>
                    <Text style={styles.docText}>
                      Commercial Invoice Document
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.printAllBtn}>
                    <Text style={styles.printAllText}>
                      Print All Documents
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
        
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

export default Ship_PrintDocument;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F5F6F8',
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: rs(100),
  },

  bottomSpacer: {
    height: rs(80),
  },

  cardWrapper: {
    marginHorizontal: rs(16),
    marginTop: rs(24),
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: rs(8),
    padding: rs(16),
    marginBottom: rs(20),
  },

  packCardContainer: {
    marginTop: rs(20),
    alignSelf: 'center',
  },

  packCardGradient: {
    width: rs(300),
    minHeight: rs(145),
    borderRadius: rs(12),
    overflow: 'hidden',
  },

  packCardContent: {
    padding: rs(16),
    paddingBottom: rs(50),
  },

  packRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  packCol: {
    flex: 1,
  },

  packLabel: {
    fontSize: rs(11),
    color: '#E3ECF5',
    marginBottom: rs(4),
    fontFamily: 'Mulish',
    opacity: 0.9,
  },

  packValue: {
    fontSize: rs(14),
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Mulish',
  },

  viewPackBtn: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F2F6FA',
    height: rs(37),
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: rs(12),
    borderBottomRightRadius: rs(12),
  },

  viewPackText: {
    fontFamily: 'Mulish',
    fontWeight: '700',
    fontSize: rs(12),
    color: '#5D768B',
  },

  docsWrapper: {
    marginTop: rs(24),
    marginBottom: rs(20),
  },

  docsTitle: {
    fontSize: rs(14),
    fontWeight: '600',
    color: '#233E55',
    marginBottom: rs(12),
    fontFamily: 'Mulish',
  },

  docItem: {
    backgroundColor: '#ECF1F7',
    borderRadius: rs(8),
    paddingVertical: rs(10),
    paddingHorizontal: rs(12),
    marginBottom: rs(10),
    alignItems: 'center',
  },

  docText: {
    fontSize: rs(12),
    fontWeight: '600',
    color: '#1E5AA7',
    fontFamily: 'Mulish',
  },

  printAllBtn: {
    marginTop: rs(14),
    backgroundColor: '#233E55',
    borderRadius: rs(8),
    paddingVertical: rs(12),
    alignItems: 'center',
  },

  printAllText: {
    fontSize: rs(13),
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Mulish',
  },
});