import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BASE_WIDTH = 375;
const scale = (size) => (SCREEN_WIDTH / BASE_WIDTH) * size;
const ms = (size, factor = 0.35) => Math.round(size + (scale(size) - size) * factor);

const ConfirmLineItemComponent = ({
  item,
  qtyLabel = 'Qty',
  qtyValue,
  readOnly = true,
  onViewDetails = () => {},
  showReceivedBreakdown = false,
  receivedQtyOverride,
}) => {
  const displayQty = String(qtyValue ?? item?.qtyToReceive ?? 0);
  const receivedQty = String(receivedQtyOverride ?? item?.receivedQty ?? item?.qtyToReceive ?? 0);

  const MONTH_IDX = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };

  const parseDate = (s) => {
    if (!s) return null;
    const t = String(s).trim();
    let m = t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (m) return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
    m = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    m = t.match(/^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/);
    if (m) {
      const dd = Number(m[1]);
      const mon = MONTH_IDX[m[2].toLowerCase()];
      const yy = Number(m[3]);
      if (mon != null) return new Date(yy, mon, dd);
    }
    const d = new Date(t);
    return isNaN(d) ? null : d;
  };

  const formatDDMMYYYY = (s) => {
    const d = parseDate(s);
    if (!d) return s || '';
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  return (
    <View style={styles.cardwrapper}>
      <View style={styles.rowContainer}>
        <View style={styles.section2}>
          <Text style={styles.itemName} numberOfLines={2} ellipsizeMode="tail">
            {item.name}
          </Text>

          <View style={styles.qtyBreakdownRow}>
            <Text style={styles.metaText}>Ordered Qty: {item.orderedQty}</Text>
            <View style={styles.vertDivider} />
            {showReceivedBreakdown && (
              <>
                <Text style={styles.metaText}>Received Qty: {receivedQty}</Text>
                <View style={styles.vertDivider} />
              </>
            )}
            <Text style={styles.metaText}>Open Qty: {item.openQty}</Text>
          </View>

          <TouchableOpacity onPress={onViewDetails} activeOpacity={0.7}>
            <Text style={styles.viewDetails}>View Details</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section3}>
          <View style={styles.qtyBox}>
            <TextInput
              style={styles.qtyInput}
              editable={false}
              value={displayQty}
            />
          </View>
          <Text style={styles.uomText}>{qtyLabel}</Text>
          <View style={styles.dateRowtop}>
            <Text style={styles.dateLabel}>Promised Date: </Text>
            <Text style={styles.dateValue} numberOfLines={1} ellipsizeMode="tail">
              {formatDDMMYYYY(item.promisedDate)}
            </Text>
          </View>
          <View style={styles.dateRowbottom}>
            <Text style={styles.dateLabel}>Need By Date: </Text>
            <Text style={styles.dateValue} numberOfLines={1} ellipsizeMode="tail">
              {formatDDMMYYYY(item.needByDate)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardwrapper: {
    paddingRight: scale(12),
    paddingLeft: 0,
    marginRight: scale(15),
    marginLeft: scale(15),
    height: scale(110),
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: scale(10),
  },
  rowContainer: { flexDirection: 'row', height: '100%' },
  section2: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'space-around',
    // marginTop:scale(5),
    marginBottom:scale(10),
    paddingLeft: scale(12),
    paddingTop: scale(8),
    minWidth: 0,
  },
  section3: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingLeft: scale(8),
    minWidth: scale(110),
  },
  itemName: {
    fontSize: ms(12),
    fontWeight: '700',
    color: '#111827',
    
  },
  qtyBox: {
    justifyContent: 'center',
    alignItems: 'center',
    height: ms(36),
  },
  qtyInput: {
    width: Math.max(ms(64), SCREEN_WIDTH * 0.18),
    height: ms(34),
    borderRadius: ms(6),
    fontSize: ms(14),
    textAlign: 'right',
    paddingVertical: 0,
    paddingHorizontal: ms(10),
    borderColor: '#FFFFFF',
    fontWeight: 'bold',
    borderWidth: 1,
    color: '#000000',
    backgroundColor: '#FFFFFF',
  },
  uomText: {
    fontSize: ms(8),
    color: '#000000',
    marginTop: ms(-6),
    marginBottom: ms(10),
    marginRight: ms(8),
  },
  qtyBreakdownRow: { flexDirection: 'row', alignItems: 'center' },
    vertDivider: {
      width: Math.max(StyleSheet.hairlineWidth, scale(1)),
      height: scale(18),
      backgroundColor: '#DADADA',
      marginHorizontal: scale(12),
      borderRadius: scale(0.5),
      opacity: 0.9,
    },
  metaText: {
    fontSize: ms(8),
    color: '#6B7280',
  },
  viewDetails: {
    
    fontSize: ms(10),
    color: '#033EFF',
    textDecorationLine: 'underline',
    textDecorationColor: '#033EFF',
  },
    dateRowbottom: { flexDirection: 'row', marginTop: scale(2) },
    dateRowtop: { flexDirection: 'row', marginTop: scale(2), marginTop: ms(16), },
  dateLabel: { fontSize: ms(8), color: '#6C6C6C' },
  dateValue: { fontSize: ms(8), color: '#6C6C6C', fontWeight: '500' },
});

export default ConfirmLineItemComponent;
