import React from 'react';
import { Dimensions, View, Text, StyleSheet, ScrollView } from 'react-native';
import { Item_Inquiry_Mock_Data } from '../../data/ItemInquiryMockData';
import POReceiptIcon from '../../assets/icons/CycleCount_Icons/POReceiptIcon.svg';
import SalesIssueIcon from '../../assets/icons/CycleCount_Icons/SalesIssueIcon.svg';
import TransferIcon from '../../assets/icons/CycleCount_Icons/TransferIcon.svg';
import AdjustmentIcon from '../../assets/icons/CycleCount_Icons/AdjustmentIcon.svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BASE_WIDTH = 375;
const scale = size => (SCREEN_WIDTH / BASE_WIDTH) * size;
const ms = (size, factor = 0.35) => size + (scale(size) - size) * factor;

const getStatusStyle = (status) => {
  switch (status) {
    case 'Receipt':
      return { backgroundColor: '#D3FFE0', textColor: '#168035' };
    case 'Issue':
      return { backgroundColor: '#FFF5F4', textColor: '#DA1E28' };
    case 'Adjustment':
      return { backgroundColor: '#FFF9F4', textColor: '#F06000' };
    case 'Transfer':
      return { backgroundColor: '#F4F9FF', textColor: '#145DA0' };
    default:
      return { backgroundColor: '#E0E0E0', textColor: '#595A5C' };
  }
};

const getTransactionIcon = (transactionType) => {
  switch (transactionType) {
    case 'PO Receipt':
      return POReceiptIcon;
    case 'Sales Order Issue':
      return SalesIssueIcon;
    case 'Sub-Inventory Transfer':
      return TransferIcon;
    case 'Cycle Count Adjustment':
      return AdjustmentIcon;
    default:
      return POReceiptIcon; 
  }
};

const TransactionTabComponent = ({itemData}) => {
  const transactions = itemData?.transactions?.recentTransactions || [];

  return (
    <ScrollView style={styles.container}>
      {transactions.map((transaction) => {
        const statusStyle = getStatusStyle(transaction.status);
        const IconComponent = getTransactionIcon(transaction.transactionType);

        return (
          <View key={transaction.id} style={styles.card}>
            <View style={styles.topRow}>
              <View style={styles.leftSection}>
                <View style={styles.iconWrapper}>
                  <IconComponent width={ms(14)} height={ms(14)} />
                </View>
                <Text style={styles.transactionType}>
                  {transaction.transactionType}
                </Text>
              </View>
              
              <Text
                style={[
                  styles.quantity,
                  {
                    color: transaction.quantity >= 0 ? '#168035' : '#DA1E28',
                  },
                ]}
              >
                {transaction.quantity >= 0
                  ? `+${transaction.quantity}`
                  : transaction.quantity}
              </Text>
            </View>

            <View style={styles.middleRow}>
              <View style={styles.orgSection}>
                <Text style={styles.organizationCode}>
                  {transaction.organizationCode}
                </Text>
              </View>
              
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: statusStyle.backgroundColor },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: statusStyle.textColor },
                  ]}
                >
                  {transaction.status}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.bottomRow}>
              <View style={styles.dateSection}>
                <Text style={styles.label}>Date</Text>
                <Text style={styles.dateValue}>
                  {transaction.transactionDate}
                </Text>
              </View>

              <View style={styles.locationSection}>
                <Text style={styles.label}>Location</Text>
                <Text style={styles.locationValue}>
                  {transaction.location}
                </Text>
              </View>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: ms(16),
    paddingTop: ms(10),
  },
  card: {
    width: ms(338),
    minHeight: ms(74),
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    marginBottom: ms(16),
    paddingHorizontal: ms(12),
    paddingVertical: ms(8),
  },
  
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ms(8),
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconWrapper: {
    width: ms(24),
    height: ms(24),
    borderRadius: ms(12),
    backgroundColor: '#ECF1F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: ms(10),
  },
  transactionType: {
    fontFamily: 'Mulish',
    fontWeight: '700',
    fontSize: ms(12),
    lineHeight: ms(12),
    color: '#242424',
    flex: 1,
  },
  quantity: {
    fontFamily: 'Mulish',
    fontWeight: '700',
    fontSize: ms(12),
    lineHeight: ms(12),
  },
  
  middleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ms(8),
  },
  orgSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  organizationCode: {
    fontFamily: 'Mulish',
    fontWeight: '600',
    fontSize: ms(10),
    lineHeight: ms(10),
    color: '#9D9FA3',
    marginLeft: ms(34), 
  },
  statusBadge: {
    paddingHorizontal: ms(8),
    paddingVertical: ms(2),
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    fontFamily: 'Mulish',
    fontWeight: '600',
    fontSize: ms(10),
    lineHeight: ms(10),
  },
  
  divider: {
    width: '100%',
    height: 0.5,
    backgroundColor: '#D9E4EE',
    marginBottom: ms(8),
  },
  
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontFamily: 'Mulish',
    fontWeight: '600',
    fontSize: ms(10),
    lineHeight: ms(10),
    color: '#9D9FA3',
    marginRight: ms(4),
  },
  dateValue: {
    fontFamily: 'Mulish',
    fontWeight: '700',
    fontSize: ms(10),
    lineHeight: ms(10),
    color: '#242424',
  },
  locationValue: {
    fontFamily: 'Mulish',
    fontWeight: '700',
    fontSize: ms(10),
    lineHeight: ms(10),
    color: '#242424',
  },
});

export default TransactionTabComponent;