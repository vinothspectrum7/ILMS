import React from 'react';
import { View, Text, StyleSheet, Dimensions, Platform } from 'react-native';

const dash = '—';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BASE_WIDTH = 375;
const scale = (size) => (SCREEN_WIDTH / BASE_WIDTH) * size;
const ms = (size, factor = 0.35) => size + (scale(size) - size) * factor;

const ASNinfoCardComponent = ({ receiptNumber, supplier, asnnumber, shippeddate }) => {
  const rn = (receiptNumber ?? '').toString().trim() || dash;
  const sup = (supplier ?? '').toString().trim() || dash;
  const asn = (asnnumber ?? '').toString().trim() || dash;

  const formatDate = (input) => {
  const monthShort = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const monthMap = {
    jan:0, january:0, feb:1, february:1, mar:2, march:2, apr:3, april:3,
    may:4, jun:5, june:5, jul:6, july:6, aug:7, august:7, sep:8, sept:8,
    september:8, oct:9, october:9, nov:10, november:10, dec:11, december:11,
  };

  const out = (y,m,d) => `${String(d).padStart(2,'0')} ${monthShort[m]} ${y}`;

  if (input == null) return dash;
  const v = String(input).trim();
  if (!v) return dash;

  
  {
    const m = /^(\d{4})[-/](\d{2})[-/](\d{2})$/.exec(v);
    if (m) {
      const [, y, mm, dd] = m;
      const mi = Math.max(0, Math.min(11, Number(mm) - 1));
      return out(Number(y), mi, Number(dd));
    }
  }

  
  {
    const m = /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/.exec(v);
    if (m) {
      const [, dd, mm, y] = m;
      const mi = Math.max(0, Math.min(11, Number(mm) - 1));
      return out(Number(y), mi, Number(dd));
    }
  }

  
  {
    const parts = v.split(/\s+/);
    if (parts.length === 3) {
      const [dStr, monStr, yStr] = parts;
      const mi = monthMap[(monStr || '').toLowerCase()];
      if (mi !== undefined && /^\d{1,2}$/.test(dStr) && /^\d{4}$/.test(yStr)) {
        return out(Number(yStr), mi, Number(dStr));
      }
    }
  }

  
  {
    const n = Number(v);
    const dt = !Number.isNaN(n) && n > 0 ? new Date(n) : new Date(v);
    if (!Number.isNaN(dt.getTime())) {
      const y = dt.getUTCFullYear();
      const m = dt.getUTCMonth();      
      const d = dt.getUTCDate();
      return out(y, m, d);
    }
  }

  
  return v || dash;
};
  return (
    <View style={styles.card}>
      
        <View style={styles.toprow}>
          <View style={styles.topcardLeft}>
          <Text style={styles.labelText}>Receipt Number</Text>
          <Text style={styles.valueText}>{rn}</Text>
          </View>
          <View style={styles.topcardRight}>
          <Text style={styles.labelText}>Supplier</Text>
          <Text style={styles.valueText}>{sup}</Text>
          </View>
        </View>
        <View style={styles.bottomrow}>
          <View style={styles.bottomcardLeft}>
          <Text style={styles.labelText}>ASN Number</Text>
          <Text style={styles.valueText}>{asn}</Text>
          </View>
          <View style={styles.bottomcardRight}>
          <Text style={styles.labelText}>Shipped Date</Text>
          <Text style={styles.valueText}>{formatDate(shippeddate)}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    marginTop: scale(24),
    marginHorizontal: scale(12),
    marginVertical: scale(6),
    borderRadius: scale(12),
    padding: scale(12),
    ...Platform.select({
      android: { elevation: 2 },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: scale(3),
      },
    }),
  },
  topcardLeft: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', paddingRight: scale(6), paddingBottom: scale(6), minWidth: 0 },
  topcardRight: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', paddingLeft: scale(6), paddingBottom: scale(6), minWidth: 0 },
  bottomcardLeft: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', paddingRight: scale(6), minWidth: 0 },
  bottomcardRight: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', paddingLeft: scale(6), minWidth: 0 },
  toprow: {
    flex: 1,
    flexDirection: 'row',
    marginBottom: scale(0),
  },
  bottomrow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 0,
  },
  labelText: {
    fontSize: ms(10),
    color: '#666666',
    flex: 1,
    marginRight: scale(6),
  },
  valueText: {
    fontSize: ms(10),
    fontWeight: 'bold',
    color: '#1C1C1C',
    flex: 1,
    textAlign: 'left',
  },
  openText: { color: 'green' },
  subLabel: { fontSize: ms(10), color: '#666666', marginTop: scale(4), marginBottom: scale(2) },
  column: { flex: 1 },
});

export default ASNinfoCardComponent;
