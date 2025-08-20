import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StyleSheet as RNStyleSheet,
  Platform,
  Dimensions,
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import CustomNumericInput from '../components/CustomNumericInput';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BASE_WIDTH = 375;
const s = (n) => (SCREEN_WIDTH / BASE_WIDTH) * n;             // size scale
const fs = (n, f = 0.35) => n + (s(n) - n) * f;               // font moderate scale

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
          <Text style={styles.itemName}></Text>
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
              width={s(80)}
              height={s(28)}
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
    paddingRight: s(12),
    paddingLeft: 0,
    marginRight: s(15),
    marginLeft: s(15),
    height: s(110),
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: s(10),
  },
  rowContainer: { flexDirection: 'row', height: '100%' },
  section1: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F6FAFA',
    width: s(35),
    height: '100%',
    borderRadius: s(10),
    borderBottomEndRadius: 0,
    borderTopRightRadius: 0,
    position: 'relative',
  },
  checkbox: {
    width: s(16),
    height: s(16),
    transform: [{ scaleX: 0.75 }, { scaleY: 0.75 }],
    marginLeft: -s(15),
  },
  section2: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingLeft: s(12),
    paddingTop: s(8),
    minWidth: 0,
  },
  section3: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingLeft: s(8),
    minWidth: s(110),
  },
  itemName: {
    fontSize: fs(12),
    fontWeight: '700',
    color: '#111827',
    paddingBottom:s(16),
  },
  numericInputWrapper: {
    marginBottom: s(10),
    alignItems: 'center',
  },
  qtyBreakdownRow: { flexDirection: 'row', alignItems: 'center', paddingBottom:15, },
  vertDivider: {
    width: Math.max(StyleSheet.hairlineWidth, s(1)),
    height: s(18),
    backgroundColor: '#DADADA',
    marginHorizontal: s(12),
    borderRadius: s(0.5),
    opacity: 0.9,
  },
  metaText: { fontSize: fs(8), color: '#6B7280' },
  viewDetails: {
    
    fontSize: fs(10),
    color: '#033EFF',
    textDecorationLine: 'underline',
    textDecorationColor: '#033EFF',
  },
  dateRow: { flexDirection: 'row', marginTop: s(2) },
  dateLabel: { fontSize: fs(8), color: '#6C6C6C' },
  dateValue: { fontSize: fs(8), color: '#6C6C6C', fontWeight: '500' },
});

export default LineItemListCardComponent;
