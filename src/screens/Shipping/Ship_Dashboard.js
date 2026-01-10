import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
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

function Ship_Dashboard({ navigation, route }) {
  const status = route?.params?.status;

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

  useEffect(() => {
    if (!status) return;

    const incoming = String(status).trim();
    const desiredSelectedStatus =
      incoming === 'All' ? null : incoming;

    setFilters(prev => {
      if (prev.selectedStatus === desiredSelectedStatus) {
        return prev;
      }
      return { ...prev, selectedStatus: desiredSelectedStatus };
    });
  }, [status]);

  const handlePickPress = order => {
    setSelectedOrder(order);
    setIsPopupVisible(true);
  };

  const handleClosePopup = () => {
    setIsPopupVisible(false);
    setSelectedOrder(null);
  };

  const handleManualPick = () => {
    setIsPopupVisible(false);
  };

  const handleExpressPick = () => {
    setIsPopupVisible(false);
    navigation.navigate('Pick', { order: selectedOrder });
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#233E55" barStyle="light-content" />

      <GlobalHeaderComponent
        screenTitle="Shipping"
        organizationName="ENV"
        onBack={() => navigation.goBack()}
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
            <TouchableOpacity style={styles.iconButton}>
              <PrintIcon width={20} height={20} />
            </TouchableOpacity>
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
        <View style={{ height: 80 }} />
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
    elevation: 8,
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
  },

  cardTitle: {
    fontSize: 9,
    color: '#595A5C',
    marginTop: 4
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
  },

  shippingTransactionTitle: {
    color: '#233E55',
    fontWeight: '700',
    fontSize: 18,
  },

  transactionIcons: {
    flexDirection: 'row',
    gap: 12
  },

  iconButton: {
    padding: 8
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
