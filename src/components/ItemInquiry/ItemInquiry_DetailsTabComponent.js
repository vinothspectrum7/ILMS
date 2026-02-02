import React from 'react';
import { Dimensions, View, Text, StyleSheet } from 'react-native';
import { Item_Inquiry_Mock_Data } from '../../data/ItemInquiryMockData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BASE_WIDTH = 375;
const scale = size => (SCREEN_WIDTH / BASE_WIDTH) * size;
const ms = (size, factor = 0.35) => size + (scale(size) - size) * factor;

const DetailsTabComponent = ({itemData}) => {
//   const itemDetails = Item_Inquiry_Mock_Data[0]?.itemdetails;
const itemDetails = itemData?.itemdetails;

  if (!itemDetails) return null;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Item Details</Text>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <View style={styles.detailColumn}>
              <Text style={styles.label}>Item Code</Text>
              <Text style={styles.value}>{itemDetails.itemCode}</Text>
            </View>

            <View style={styles.detailColumn}>
              <Text style={styles.label}>UOM</Text>
              <Text style={styles.value}>{itemDetails.uom}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailColumn}>
              <Text style={styles.label}>Category</Text>
              <Text style={styles.value}>{itemDetails.category}</Text>
            </View>

            <View style={styles.detailColumn}>
              <Text style={styles.label}>Description</Text>
              <Text
                style={styles.value}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {itemDetails.description}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailColumn}>
              <Text style={styles.label}>Status</Text>
              <Text style={styles.value}>{itemDetails.Status}</Text>
            </View>

            <View style={styles.detailColumn}>
              <Text style={styles.label}>Last Updated</Text>
              <Text style={styles.value}>{itemDetails.lastUpdated}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: ms(16),
    paddingHorizontal: ms(16),
  },
  card: {
    width: ms(338),
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D5DFFF',
    backgroundColor: '#FBFDFF',
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: ms(12),
    paddingVertical: ms(8),
  },
  headerText: {
    paddingTop:ms(8),
    fontFamily: 'Mulish',
    fontWeight: '700',
    fontSize: ms(10),
    lineHeight: ms(10),
    color: '#233E55',
  },
  detailsContainer: {
    padding: ms(12),
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: ms(12),
  },
  detailColumn: {
    flex: 1,
    marginRight: ms(16),
  },
  label: {
    fontFamily: 'Mulish',
    fontWeight: '600',
    fontSize: ms(10),
    lineHeight: ms(10),
    color: '#9D9FA3',
    marginBottom: ms(4),
  },
  value: {
    fontFamily: 'Mulish',
    fontWeight: '700',
    fontSize: ms(10),
    lineHeight: ms(14),
    color: '#242424',
  },
});

export default DetailsTabComponent;
