import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Pressable,
} from 'react-native';
import GlobalHeaderComponent from '../../components/GlobalHeaderComponent';
import GrowthIcon from '../../assets/icons/Ship_Icons/GrowthIcon.svg';
import ReleasedIcon from '../../assets/icons/Ship_Icons/ReleasedIcon.svg';
import UnreleasedIcon from '../../assets/icons/Ship_Icons/UnreleasedIcon.svg';
import PickedIcon from '../../assets/icons/Ship_Icons/PickedIcon.svg';
import TransitIcon from '../../assets/icons/Ship_Icons/TransitIcon.svg';
import Ship_MainFilter from '../../components/shipping/Ship_MainFilter';
import Ship_TransactionTable from '../../components/shipping/Ship_TransactionTable';
import SearchIcon from '../../assets/icons/Ship_Icons/SearchIcon.svg';
import PrintIcon from '../../assets/icons/Ship_Icons/PrintIcon.svg';
import Ship_PickPopupConfirmation from '../../components/shipping/Ship_PickPopupConfirmation';
import { useShippingStore } from '../../store/shippingStore';

function Ship_Dashboard({ navigation, route }) {
  const status = route?.params?.status;
  const resetShippingStore = useShippingStore(s => s.resetShippingStore);
  const [showPrintMenu, setShowPrintMenu] = useState(false);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filters, setFilters] = useState({
    pickType: 'Sales Order',
    selectedPickSlip: null,
    selectedStatus: null,
    selectedItem: null,
    selectedException: null,
    selectedOrganization: null,
  });
const packMode = route.params?.packMode || 'AUTO';


  useEffect(() => {
    if (!status) return;

    const incoming = String(status).trim();
    const desiredSelectedStatus = incoming === 'All' ? null : incoming;

    setFilters(prev => {
      if (prev.selectedStatus === desiredSelectedStatus) {
        return prev;
      }
      return { ...prev, selectedStatus: desiredSelectedStatus };
    });
  }, [status]);

 const handlePickPress = order => {
  setSelectedOrder(order);

  if (packMode === 'MANUAL') {
    setSelectedTransaction(order);
    navigation.navigate('ManualPick');
  } else {
    setIsPopupVisible(true);
  }
};


  const handleClosePopup = () => {
    setIsPopupVisible(false);
    setSelectedOrder(null);
  };

  const setSelectedTransaction =
    useShippingStore(s => s.setSelectedTransaction);

  const handleManualPick = () => {
    setIsPopupVisible(false);
    setSelectedTransaction(selectedOrder);
    navigation.navigate('ManualPick');
  };


  const handleExpressPick = () => {
    setIsPopupVisible(false);
    navigation.navigate('Pick', { order: selectedOrder });
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const handleBack = () => {
    resetShippingStore();
    navigation.goBack();
  };

  const handleLabelPrint = () => {
    setShowPrintMenu(false);
    navigation.navigate('Ship_LabelPrintListScreen');

  };

  const handlePrintDocument = () => {
    setShowPrintMenu(false);

    navigation.navigate('Ship_PrintDocumentScreen');
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#233E55" barStyle="light-content" />

      <GlobalHeaderComponent
        screenTitle="Shipping"
        organizationName="ENV"
        onBack={handleBack}
        navRowStyle={{ backgroundColor: '#233E55' }}
      />

      <View style={styles.fixedContent}>
        <View style={styles.shippingSummaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>
              Total Orders Delivered - 269
            </Text>
            <View style={styles.growthBox}>
              <Text style={styles.growthText}>10%</Text>
              <GrowthIcon width={16} height={16} />
            </View>
          </View>
        </View>

        <View style={styles.cardsContainer}>
          <View style={styles.cardRow}>
            <StatusCard title="Released Orders" value="34" Icon={ReleasedIcon} />
            <StatusCard title="Unreleased Orders" value="34" Icon={UnreleasedIcon} />
            <StatusCard title="Picked Orders" value="34" Icon={PickedIcon} />
            <StatusCard title="In Transit" value="34" Icon={TransitIcon} />
          </View>
        </View>

        <View style={styles.shippingTransactionHeader}>
          <Text style={styles.shippingTransactionTitle}>
            Shipping Transaction
          </Text>
          <View style={styles.transactionIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <SearchIcon width={20} height={20} />
            </TouchableOpacity>

            <View style={styles.printWrapper}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => setShowPrintMenu(prev => !prev)}
              >
                <PrintIcon width={20} height={20} />
              </TouchableOpacity>

              {showPrintMenu && (
                <View style={styles.printDropdown}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.printOption,
                      pressed && styles.printOptionPressed,
                    ]}
                    onPress={handleLabelPrint}
                  >
                    <Text style={styles.printText}>Label Print</Text>
                  </Pressable>

                  <Pressable
                    style={({ pressed }) => [
                      styles.printOption,
                      pressed && styles.printOptionPressed,
                    ]}
                    onPress={handlePrintDocument}
                  >
                    <Text style={styles.printText}>Print Document</Text>
                  </Pressable>
                </View>
              )}
            </View>
          </View>
        </View>

        <Ship_MainFilter
          filters={filters}
          onFilterChange={handleFilterChange}
        />
      </View>

      <ScrollView
        style={styles.tableScrollView}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={styles.tableScrollContent}
      >
        <Ship_TransactionTable
          filters={filters}
          onPickPress={handlePickPress}
        />
      </ScrollView>

      <Ship_PickPopupConfirmation
        visible={isPopupVisible}
        onClose={handleClosePopup}
        onManual={handleManualPick}
        onYes={handleExpressPick}
        deliveryId={selectedOrder?.deliveryId}
      />
    </View>
  );
}

function StatusCard({ title, value, Icon }) {
  return (
    <TouchableOpacity style={styles.card}>
      <Icon width={24} height={24} />
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardValue}>{value}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8'
  },

  fixedContent: {
    paddingBottom: 16,
  },

  shippingSummaryCard: {
    backgroundColor: '#233E55',
    padding: 16,
    paddingBottom: 30,
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  summaryText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 15,
    paddingBottom: 30,
  },

  growthBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#233E55',
    padding: 8,
    borderRadius: 8,
    shadowColor: '#ffffffff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
    alignSelf: 'flex-start',
  },

  growthText: {
    color: '#FFF',
    fontWeight: '700',
    marginRight: 6
  },

  cardsContainer: {
    paddingHorizontal: 21,
    marginTop: -30,
    paddingBottom: 30,
  },

  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },

  card: {
    width: 83,
    height: 77,
    backgroundColor: '#FFF',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  cardTitle: {
    fontSize: 9,
    color: '#595A5C',
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '600',
  },

  cardValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#233E55'
  },

  shippingTransactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 21,
    marginBottom: 16,
    alignItems: 'center',
  },

  shippingTransactionTitle: {
    color: '#233E55',
    fontWeight: '700',
    fontSize: 18,
  },

  transactionIcons: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },

  iconButton: {
    padding: 8
  },

  printWrapper: {
    position: 'relative',
  },

  printDropdown: {
    position: 'absolute',
    top: 40,
    right: 0,
    width: 173,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 8,
    zIndex: 1000,
  },

  printOption: {
    width: '100%',
    height: 36,
    borderRadius: 4,
    justifyContent: 'center',
    paddingHorizontal: 12,
    marginBottom: 4,
  },

  printText: {
    fontFamily: 'Mulish',
    fontWeight: '700',
    fontSize: 12,
    lineHeight: 12,
    color: '#233E55',
  },

  printOptionPressed: {
    backgroundColor: '#ECF1F7',
  },

  tableScrollView: {
    flex: 1,
    backgroundColor: '#F4F6F8',
  },

  tableScrollContent: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
});

export default Ship_Dashboard;