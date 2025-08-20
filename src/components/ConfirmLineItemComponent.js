import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';

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
  const receivedQty = String(
    receivedQtyOverride ?? item?.receivedQty ?? item?.qtyToReceive ?? 0
  );

  const MONTH_IDX = {
        jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
        jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
      };

      const parseDate = (s) => {
        if (!s) return null;
        const t = String(s).trim();

        // DD/MM/YYYY
        let m = t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (m) return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));

        // YYYY-MM-DD
        m = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
        if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));

        // DD MMM YYYY  (e.g., 22 Jul 2025, 21 JUL 2025)
        m = t.match(/^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/);
        if (m) {
          const dd = Number(m[1]);
          const mon = MONTH_IDX[m[2].toLowerCase()];
          const yy = Number(m[3]);
          if (mon != null) return new Date(yy, mon, dd);
        }

        // Fallback
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
          <Text style={styles.itemName}>{item.name}</Text>

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

          <TouchableOpacity onPress={onViewDetails}>
            <Text style={styles.viewDetails}>View Details</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section3}>
          <View style={{ justifyContent: 'center', alignItems: 'center', height: 34 }}>
            <TextInput
              style={[styles.qtyInput, { backgroundColor: '#FFFFFF' }]}
              editable={false}
              value={displayQty}
            />
          </View>
          <Text style={styles.uomText}>{qtyLabel}</Text>
          <View style={styles.dateRow}>
            <Text style={styles.dateLabel}>Promised Date: </Text>
            <Text style={styles.dateValue}>{formatDDMMYYYY(item.promisedDate)}</Text>
          </View>
          <View style={styles.dateRow}>
            <Text style={styles.dateLabel}>Need By Date: </Text>
            <Text style={styles.dateValue}>{formatDDMMYYYY(item.needByDate)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardwrapper: {
    paddingRight: 12,
    paddingLeft: 0,
    paddingTop: 0,
    paddingBottom: 0,
    marginRight: 15,
    marginLeft: 15,
    height: 120,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 2,
  },
  rowContainer: { flexDirection: 'row', height: '100%' },
  section2: { flex: 1, paddingLeft: 8, marginTop: 8 },
  section3: { alignItems: 'flex-end', justifyContent: 'center', paddingLeft: 8, minWidth: 100 },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
    marginBottom: 22,
  },
  qtyInput: {
    width: 50,
    height: 30,
    borderRadius: 4,
    fontSize: 14,
    textAlign: 'right',
    paddingVertical: 0,
    borderColor: '#FFFFFF',
    fontWeight: 'bold',
    borderWidth: 1,
    color: '#000000',
  },
  uomText: { fontSize: 10, color: '#000000', marginTop: -9, marginRight:4, marginBottom:28 },
  qtyBreakdownRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  vertDivider: {
    width: 1,
    height: 18,
    backgroundColor: '#DADADA',
    marginHorizontal: 12,
    borderRadius: 0.5,
    opacity: 0.9,
  },
  metaText: { fontSize: 10, color: '#6B7280' },
  viewDetails: {
    marginTop: 10,
    fontSize: 10,
    color: '#033EFF',
    textDecorationLine: 'underline',
    textDecorationColor: '#033EFF',
  },
  dateText: { fontSize: 10, color: '#999', marginTop: 4 },
  dateRow: {
  flexDirection: 'row',
  marginTop: 2,
},
dateLabel: {
  fontSize: 10,
  color: '#6C6C6C',
},
dateValue: {
  fontSize: 10,
  color: '#6C6C6C',
  fontWeight: '500',
},
});

export default ConfirmLineItemComponent;
