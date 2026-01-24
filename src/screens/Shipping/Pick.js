import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Modal,
  FlatList,
  ScrollView,
} from 'react-native';

import GlobalHeaderComponent from '../../components/GlobalHeaderComponent';
import Barcodescanner from '../../assets/icons/barcodescanner.svg';
import BlueTickIcon from '../../assets/icons/Ship_Icons/BlueTickIcon.svg';
import LinearGradient from 'react-native-linear-gradient';
import BarcodeScanner from '../BarCodeScanner';
import SingleFooterBtnComponent from '../../components/shipping/Ship_SingleFooterBtnComponent';
import ConfirmationModal from '../../components/shipping/Ship_ConfirmationModal';
import { useShippingStore } from '../../store/shippingStore';
import { useReceivingStore } from '../../store/receivingStore';

function Pick({ navigation }) {
  const selectedTransaction = useShippingStore(s => s.selectedTransaction);
  const setPickItemsData = useShippingStore(s => s.setPickItemsData);
  const setTransactionStatus = useShippingStore(s => s.setTransactionStatus);
  const setSelectedTransaction = useShippingStore(s => s.setSelectedTransaction);

  const [scannedBarcode, setScannedBarcode] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false); 

    const {
      OrgData,
    } = useReceivingStore();

  const pickLines = useMemo(() => {
    const list = selectedTransaction?.items;
    return Array.isArray(list) ? list : [];
  }, [selectedTransaction]);

  const handleBarcodeScan = barcode => {
    setScannedBarcode(barcode);
    setShowScanner(false);
  };

  const handleScanPress = () => {
    setShowScanner(true);
  };

  const handleScannerClose = () => {
    setShowScanner(false);
  };

  const handleConfirmPick = () => {
    if (!selectedTransaction?.deliveryId) {
      setShowConfirmation(true);
      return;
    }

    const updated = { ...selectedTransaction, status: 'Ready To Pack' };

    setPickItemsData(updated);
    //add lot, serail, lot+serail data here - manualPick

    setSelectedTransaction(updated);
    setTransactionStatus(updated.deliveryId, 'Ready To Pack');
    setShowConfirmation(true);
  };

  const handleConfirmationYes = () => {
    setShowConfirmation(false);
    navigation.navigate('AutoPack', { order: selectedTransaction, status: 'Ready To Pack' });
  };

  const handleConfirmationNo = () => {
    setShowConfirmation(false);
    navigation.navigate('ShipDashboard', { status: 'All' });
  };

  const renderPickItem = ({ item, index }) => (
    <View style={styles.itemContainer} key={index}>
      <View style={styles.fullWidthDottedLine} />

      <View style={styles.itemContent}>
        <View style={styles.leftSection}>
          <View style={styles.itemInfo}>
            <Text style={styles.itemText}>{item.item}</Text>
            <Text style={styles.itemCodeText}>{item.itemCode}</Text>
          </View>

          <View style={styles.locationContainer}>
            <Text style={styles.locationLabel}>Sub Inventory:</Text>
            <Text style={styles.locationValue}>{item.subInventory}</Text>
            <View style={styles.spacer} />
            <Text style={styles.locationLabel}>Locator:</Text>
            <Text style={styles.locationValue}>{item.location}</Text>
          </View>
        </View>

        <View style={styles.rightSection}>
          <View style={styles.detailsQuantityRow}>
            <View style={styles.detailsContainer}>
              <BlueTickIcon width={12} height={12} style={styles.tickIcon} />
              <Text style={styles.detailsText}>Details</Text>
            </View>

            <View style={styles.quantitySection}>
              <Text style={styles.quantityText}>{item.quantity}</Text>
              <Text style={styles.eachText}>{item.uom}</Text>
            </View>
          </View>

          <Text style={styles.pendingText}>{item.status}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#233E55" barStyle="light-content" />
      <GlobalHeaderComponent
        screenTitle="Auto Pick"
        organizationName={OrgData?.selectedOrgCode || 'EnnVee'}
        onBack={() => navigation.goBack()}
      />

      <View style={styles.mainContent}>
        <LinearGradient
          colors={['#F5F5F6', '#D9E4EE']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.infoGradientCard}
        >
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Customer Name</Text>
            <Text style={styles.infoValue}>{selectedTransaction?.customer ?? '-'}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Carrier Name</Text>
            <Text style={styles.infoValue}>{selectedTransaction?.carrier ?? '-'}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Ship from location</Text>
            <Text style={styles.infoValue}>{selectedTransaction?.organization ?? '-'}</Text>
          </View>
        </LinearGradient>

        <View style={styles.whiteCard}>
          <TouchableOpacity
            style={styles.barcodeField}
            onPress={handleScanPress}
            activeOpacity={0.8}
          >
            {scannedBarcode ? (
              <Text style={styles.barcodeScannedText}>{scannedBarcode}</Text>
            ) : (
              <Text style={styles.barcodePlaceholder}>Scan Barcode</Text>
            )}
            <Barcodescanner width={18} height={18} />
          </TouchableOpacity>

          <View style={styles.tableHeader}>
            <View style={[styles.headerColumn, styles.leftColumn]}>
              <Text style={styles.headerText}>Items</Text>
            </View>
            <View style={[styles.headerColumn, styles.rightColumn]}>
              <Text style={styles.headerText}>Qty To Pick</Text>
            </View>
          </View>

          <ScrollView
            style={styles.tableScrollView}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.tableScrollContent}
          >
            <FlatList
              data={pickLines}
              renderItem={renderPickItem}
              keyExtractor={(it, idx) => `${it.itemCode || 'ITEM'}-${idx}`}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
            />
          </ScrollView>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <SingleFooterBtnComponent
          label="Confirm Pick"
          onPress={handleConfirmPick}
          enabled={true}
          containerStyle={styles.buttonWrapper}
        />
      </View>

      <Modal
        visible={showScanner}
        animationType="slide"
        onRequestClose={handleScannerClose}
      >
        <BarcodeScanner
          onScan={handleBarcodeScan}
          onClose={handleScannerClose}
        />
      </Modal>

      <ConfirmationModal
        visible={showConfirmation}
        onClose={handleConfirmationNo}
        onYes={handleConfirmationYes}
        onNo={handleConfirmationNo}
        type="CONFIRM_PICK"
        itemCount={pickLines.length}
      />
    </View>
  );
}

export default Pick;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8',
  },

  mainContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  infoGradientCard: {
    height: 49,
    width: '100%',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 1,
    elevation: 2,
    marginBottom: 16,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontFamily: 'Mulish',
    fontWeight: '500',
    fontSize: 9,
    lineHeight: 10,
    letterSpacing: 0,
    color: '#233E55',
    marginBottom: 5,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  infoValue: {
    fontFamily: 'Mulish',
    fontWeight: '700',
    fontSize: 10,
    color: '#233E55',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },

  whiteCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },

  barcodeField: {
    width: '100%',
    height: 35,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D0D5DD',
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 10,
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  barcodePlaceholder: {
    fontSize: 13,
    color: '#667085',
  },
  barcodeScannedText: {
    fontSize: 13,
    color: '#233E55',
    fontWeight: '500',
  },

  tableHeader: {
    width: '100%',
    height: 31.26,
    backgroundColor: 'rgba(93, 118, 139, 0.05)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: 4,
    marginBottom: 12,
    alignSelf: 'center',
  },
  headerColumn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftColumn: {
    justifyContent: 'flex-start',
  },
  rightColumn: {
    justifyContent: 'flex-end',
  },
  headerText: {
    fontFamily: 'Mulish',
    fontWeight: '600',
    fontSize: 12,
    color: '#233E55',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },

  tableScrollView: {
    flex: 1,
  },

  tableScrollContent: {
    paddingBottom: 10,
  },

  itemContainer: {
    width: '100%',
    height: 80,
    borderRadius: 8,
    borderWidth: 0.2,
    borderColor: '#CCCED2',
    backgroundColor: '#FFFFFF',
    alignSelf: 'center',
    position: 'relative',
  },

  fullWidthDottedLine: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    height: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFF0',
    borderStyle: 'dotted',
    marginHorizontal: 12,
  },

  itemContent: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },

  leftSection: {
    flex: 1.5,
    justifyContent: 'space-between',
    paddingRight: 8,
    paddingBottom: 4,
  },
  itemInfo: {
    marginBottom: 8,
  },
  itemText: {
    fontFamily: 'Mulish',
    fontWeight: '600',
    fontSize: 14,
    color: '#233E55',
    marginBottom: 2,
  },
  itemCodeText: {
    fontFamily: 'Mulish',
    fontSize: 12,
    color: '#667085',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  locationLabel: {
    fontFamily: 'Mulish',
    fontSize: 10,
    color: '#5F6B7A',
    marginRight: 4,
  },
  locationValue: {
    fontFamily: 'Mulish',
    fontWeight: '500',
    fontSize: 10,
    color: '#233E55',
    marginRight: 12,
  },
  spacer: {
    width: 12,
  },

  rightSection: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingLeft: 8,
    paddingBottom: 4,
  },
  detailsQuantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  detailsContainer: {
    width: 64,
    height: 22,
    backgroundColor: '#D9E4EE',
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    paddingHorizontal: 8,
  },
  tickIcon: {
    marginRight: 4,
  },
  detailsText: {
    fontFamily: 'Mulish',
    fontWeight: '600',
    fontSize: 10,
    color: '#145DA0',
  },
  quantitySection: {
    alignItems: 'flex-end',
  },
  quantityText: {
    fontFamily: 'Mulish',
    fontWeight: '700',
    fontSize: 15,
    color: '#233E55',
    marginBottom: 2,
  },
  eachText: {
    fontFamily: 'Mulish',
    fontSize: 12,
    color: '#667085',
  },
  pendingText: {
    fontFamily: 'Mulish',
    fontWeight: '600',
    fontSize: 10,
    color: '#F06000',
    textAlign: 'right',
    marginTop: 10,
  },

  itemSeparator: {
    height: 12,
  },

  buttonContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 12,
    backgroundColor: '#F4F6F8',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  buttonWrapper: {
    width: '100%',
  },
});
