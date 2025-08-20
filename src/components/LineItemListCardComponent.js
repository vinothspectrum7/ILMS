import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StyleSheet as RNStyleSheet, Platform } from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import CustomNumericInput from '../components/CustomNumericInput';

const LineItemListCardComponent = ({
  item,
  index,
  isSelected,
  onCheckToggle,
  onQtyChange,
  onViewDetails,
}) => {
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (isSelected) {
      if (!touched) setTouched(true);

      if ((item.qtyToReceive ?? 0) === 0) {
        onQtyChange(item.id, item.openQty);
      }
    } else {
      setTouched(false);
    }
  }, [isSelected]);

  const MONTH_IDX = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
  };

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
        <View style={styles.section1}>
          <TouchableOpacity
            style={RNStyleSheet.absoluteFill}
            onPress={() => onCheckToggle(item)}
            activeOpacity={0.8}
          />
          <CheckBox
            value={isSelected}
            onValueChange={() => onCheckToggle(item)}
            style={styles.checkbox}
            tintColors={{ true: '#233E55', false: '#666666' }}
            onCheckColor={Platform.OS === 'ios' ? '#FFFFFF' : undefined}
            onFillColor={Platform.OS === 'ios' ? '#233E55' : undefined}
            onTintColor={Platform.OS === 'ios' ? '#666666' : undefined}
            boxType={Platform.OS === 'ios' ? 'square' : undefined}
            lineWidth={Platform.OS === 'ios' ? 1.5 : undefined}
          />
        </View>

        <View style={styles.section2}>
          <Text style={styles.itemName}>{item.name}</Text>
          <View style={styles.qtyBreakdownRow}>
            <Text style={styles.metaText}>Ordered Qty: {item.orderedQty}</Text>
            <View style={styles.vertDivider} />
            <Text style={styles.metaText}>Open Qty: {item.openQty}</Text>
          </View>
          <TouchableOpacity onPress={() => onViewDetails?.(item, index)}>
            <Text style={styles.viewDetails}>View Details</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section3}>
          <View style={styles.numericInputWrapper}>
            <CustomNumericInput
              value={item.qtyToReceive ?? 0}
              setValue={(v) => {
                if (!touched && isSelected) setTouched(true);
                onQtyChange(item.id, v);
              }}
              min={0}
              max={item.openQty}
              step={1}
              width={100}
              isSelected={isSelected}
              onLimit={() => {}}
            />
          </View>

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
    marginRight: 15,
    marginLeft: 15,
    height: 120,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 10,
  },
  rowContainer: { flexDirection: 'row', height: '100%' },
  section1: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F6FAFA',
    width: 35,
    height: '100%',
    borderRadius: 10,
    borderBottomEndRadius:0,
    borderTopRightRadius:0,
    position: 'relative',
  },
  checkbox: {
    width: 16,
    height: 16,
    transform: [{ scaleX: 0.75 }, { scaleY: 0.75 }],
    marginLeft: -15,
  },
  section2: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    paddingLeft: 12,
    paddingTop: 8,
  },
  section3: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingLeft: 8,
    minWidth: 100,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
    marginBottom: 22,
  },
  numericInputWrapper: {
    marginBottom: 10,
    alignItems: 'center',
  },
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
  dateRow: { flexDirection: 'row', marginTop: 2 },
  dateLabel: { fontSize: 10, color: '#6C6C6C' },
  dateValue: { fontSize: 10, color: '#6C6C6C', fontWeight: '500' },
});

export default LineItemListCardComponent;
