import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Dimensions } from 'react-native';
import DocumentIcon from '../../assets/icons/Ship_Icons/DocumentIcon.svg';
import { Item_Inquiry_Mock_Data } from '../../data/ItemInquiryMockData';
import LinearGradient from 'react-native-linear-gradient';
import WhiteEyeIcon from '../../assets/icons/CycleCount_Icons/WhiteEyeIcon.svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BASE_WIDTH = 375;
const scale = size => (SCREEN_WIDTH / BASE_WIDTH) * size;
const ms = (size, factor = 0.35) => size + (scale(size) - size) * factor;

const StockTabContent = ({ itemData }) => {
  const stockSummaryData = itemData?.overview?.stockSummary || Item_Inquiry_Mock_Data[0].overview.stockSummary;
  const stockStatusData = itemData?.overview?.stockStatus || Item_Inquiry_Mock_Data[0].overview.stockStatus;

  const stockItems = [
    {
      label: 'Total On Hand',
      value: stockSummaryData.totalOnHand,
      color: '#168035'
    },
    {
      label: 'Available',
      value: stockSummaryData.available,
      color: '#033EFF'
    },
    {
      label: 'Reserved',
      value: stockSummaryData.reserved,
      color: '#DA1E28'
    },
    {
      label: 'Allocated',
      value: stockSummaryData.allocated,
      color: '#603F8B'
    },
    {
      label: 'In Transit',
      value: stockSummaryData.inTransit,
      color: '#033EFF'
    },
    {
      label: 'On Order',
      value: stockSummaryData.onOrder,
      color: '#168035'
    },
  ];

  const progressPercentage = (stockStatusData.currentStock / stockStatusData.maxStock) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.stockSection}>
        <View style={styles.stockHeader}>
          <DocumentIcon width={ms(18)} height={ms(18)} />
          <Text style={styles.stockHeaderText}>Stock Summary</Text>
        </View>

        <View style={styles.stockDivider} />

        <View style={styles.stockContainer}>
          {stockItems.map((item, index) => (
            <View key={index} style={styles.stockRow}>
              <Text style={styles.stockLabel}>{item.label}</Text>
              <Text style={[styles.stockValue, { color: item.color }]}>{item.value}</Text>
            </View>
          ))}

          {stockSummaryData.viewDetailedLocationBreakdown && (
            <LinearGradient
              colors={['#5D768B', '#233E55']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.footerContainer}
            >
              <View style={styles.footerContent}>
                <WhiteEyeIcon width={ms(18)} height={ms(18)} />
                <Text style={styles.footerText}>View Detailed Location Breakdown</Text>
              </View>
            </LinearGradient>
          )}
        </View>
      </View>

      <View style={styles.stockSection}>
        <View style={styles.stockHeader}>
          <DocumentIcon width={ms(18)} height={ms(18)} />
          <Text style={styles.stockHeaderText}>Stock Status</Text>
        </View>

        <View style={styles.stockDivider} />
        <View style={styles.statusContainer}>
          <View style={styles.currentStockContainer}>
            <View style={styles.currentStockHeader}>
              <Text style={styles.currentStockLabel}>Current Stock</Text>
              <Text style={styles.currentStockValue}>
                {stockStatusData.currentStock}/{stockStatusData.maxStock}
              </Text>
            </View>

            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBackground}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${progressPercentage}%` }
                  ]}
                />
              </View>
            </View>

            <View style={styles.stockMetricsRow}>
              <View style={styles.metricContainer}>
                <Text style={styles.metricLabel}>Min</Text>
                <Text style={styles.metricValue}>: {stockStatusData.minStock}</Text>
              </View>
              <View style={styles.metricContainer}>
                <Text style={styles.metricLabel}>Reorder</Text>
                <Text style={styles.metricValue}>: {stockStatusData.reorderPoint}</Text>
              </View>
              <View style={styles.metricContainer}>
                <Text style={styles.metricLabel}>Max</Text>
                <Text style={styles.metricValue}>: {stockStatusData.maxStock}</Text>
              </View>
            </View>
          </View>

          <View style={styles.statusCardsRow}>
            <View style={styles.inTransitCard}>
              <Text style={styles.inTransitValue}>{stockStatusData.inTransit}</Text>
              <Text style={styles.inTransitLabel}>In Transit</Text>
            </View>

            <View style={styles.cardGap} />

            <View style={styles.onOrderCard}>
              <Text style={styles.onOrderValue}>{stockStatusData.onOrder}</Text>
              <Text style={styles.onOrderLabel}>On Order</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  stockSection: {
    width: '100%',
    marginTop: ms(16),
  },
  stockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: ms(20),
    paddingTop: ms(16),
    paddingBottom: ms(8),
    backgroundColor: '#FFFFFF',
  },
  stockHeaderText: {
    marginLeft: ms(8),
    fontFamily: 'Mulish',
    fontSize: ms(12),
    fontWeight: '700',
    lineHeight: ms(12),
    color: '#233E55',
  },
  stockDivider: {
    width: '100%',
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#233E55',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#9D9FA3',
  },
  stockContainer: {
    width: ms(352),
    minHeight: ms(192),
    marginTop: ms(16),
    marginHorizontal: ms(12),
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: '#F4F9FF',
    borderColor: '#D5DFFF',
    alignSelf: 'center',
    overflow: 'hidden',
  },
  stockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: ms(16),
    paddingVertical: ms(8),
  },
  stockLabel: {
    fontFamily: 'Mulish',
    fontSize: ms(10),
    fontWeight: '600',
    lineHeight: ms(10),
    color: '#242424',
  },
  stockValue: {
    fontFamily: 'Mulish',
    fontSize: ms(12),
    fontWeight: '700',
    lineHeight: ms(12),
  },
  footerContainer: {
    width: '100%',
    height: ms(37),
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    fontFamily: 'Mulish',
    fontSize: ms(12),
    fontWeight: '700',
    lineHeight: ms(12),
    color: '#FFFFFF',
    marginLeft: ms(8),
  },
  // Stock Status Styles
  statusContainer: {
    width: '100%',
    paddingHorizontal: ms(12),
    marginTop: ms(16),
  },
  currentStockContainer: {
    width: ms(338),
    height: ms(62),
    borderRadius: 10,
    backgroundColor: '#F0FDF4',
    padding: ms(10),
    alignSelf: 'center',
  },
  currentStockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ms(8),
  },
  currentStockLabel: {
    fontFamily: 'Mulish',
    fontSize: ms(10),
    fontWeight: '600',
    lineHeight: ms(10),
    color: '#168035',
  },
  currentStockValue: {
    fontFamily: 'Mulish',
    fontSize: ms(12),
    fontWeight: '700',
    lineHeight: ms(12),
    color: '#168035',
  },
  progressBarContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: ms(8),
  },
  progressBarBackground: {
    width: ms(318),
    height: ms(7),
    borderRadius: 8,
    backgroundColor: '#D0E6D7',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#168035',
    borderRadius: 8,
  },
  stockMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: ms(4),
  },
  metricContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricLabel: {
    fontFamily: 'Mulish',
    fontSize: ms(8),
    fontWeight: '700',
    lineHeight: ms(8),
    color: '#595A5C',
  },
  metricValue: {
    fontFamily: 'Mulish',
    fontSize: ms(8),
    fontWeight: '700',
    lineHeight: ms(8),
    color: '#595A5C',
  },
  statusCardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: ms(16),
    paddingHorizontal: ms(12),
  },
  cardGap: {
    width: ms(16),
  },
  inTransitCard: {
    width: ms(155),
    height: ms(51),
    borderRadius: 4,
    backgroundColor: '#E2E8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  onOrderCard: {
    width: ms(155),
    height: ms(51),
    borderRadius: 4,
    backgroundColor: '#F4F9FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inTransitValue: {
    fontFamily: 'Mulish',
    fontSize: ms(12),
    fontWeight: '700',
    lineHeight: ms(12),
    color: '#033EFF',
    marginBottom: ms(3),
  },
  inTransitLabel: {
    fontFamily: 'Mulish',
    fontSize: ms(10),
    fontWeight: '600',
    lineHeight: ms(10),
    color: '#242424',
  },
  onOrderValue: {
    fontFamily: 'Mulish',
    fontSize: ms(12),
    fontWeight: '700',
    lineHeight: ms(12),
    color: '#168035',
    marginBottom: ms(3),
  },
  onOrderLabel: {
    fontFamily: 'Mulish',
    fontSize: ms(10),
    fontWeight: '600',
    lineHeight: ms(10),
    color: '#242424',
  },
});

export default StockTabContent;