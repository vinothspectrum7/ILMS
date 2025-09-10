import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  Dimensions,
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import { useNavigation } from '@react-navigation/native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BASE_WIDTH = 375;
const s = (n) => (SCREEN_WIDTH / BASE_WIDTH) * n;             // size scale
const fs = (n, f = 0.35) => n + (s(n) - n) * f;               // font moderate scale


const ASNListCardComponent = ({
  item,
  isSelected,
  onCheckToggle,
}) => {
  const [touched, setTouched] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    if (isSelected) {
      setTouched(true);
    } else {
      setTouched(false);
    }
  }, [isSelected]);

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
    <View style={styles.cardwrapper}>
      <View style={styles.rowContainer}>
        <View style={styles.section1}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={() => onCheckToggle(item)}
            activeOpacity={0.8}
          />
          <CheckBox
            value={isSelected}
            onValueChange={() => onCheckToggle(item)}
            tintColors={{ true: '#233E55', false: '#233E55' }}
            style={styles.checkbox}
          />
        </View>

        <View style={styles.section2}>
          <Text style={styles.labelText}>Purchase order</Text>
          <Text style={styles.itemName}>{item.Poid}</Text>
          {/* <View style={styles.qtyBreakdownRow}>
            <Text style={styles.metaText}>Ordered Qty: {item.orderedQty}</Text>
            <Text style={styles.metaText}>|</Text>
            <Text style={styles.metaText}>Open Qty: {item.openQty}</Text>
          </View> */}
          <TouchableOpacity onPress={() => navigation.navigate('poviewitems', { selectedPO: item })}>
            <Text style={styles.viewDetails}>View Items</Text>
          </TouchableOpacity>
        </View>

        {/* <View style={styles.section3}>
          <Text style={styles.dateText}>Promised Date: {item.promisedDate}</Text>
          <Text style={styles.dateText}>Need By Date: {item.needByDate}</Text>
        </View> */}

              {/* Right Section */}
      <View style={styles.rightSection}>
        <View style={styles.statusRow}>
          <View style={[
    styles.redDot,
    { backgroundColor: item.status=='Yet to Receive' ? '#FB6969' : '#FF9B00' }
  ]} />
          <Text style={styles.statusname}>{item.status}</Text>
        </View>
        <Text style={styles.dateText}>
          Ordered Date: <Text style={styles.dateText}>{formatDate(item.orderedByDate)}</Text>
        </Text>
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
    height: s(80),
    backgroundColor: '#FBFBFB',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: s(10),
  },
  rowContainer: {
    flexDirection: 'row',
    height: '100%',
  },
  section1: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ECF1F7',
    width: s(30),
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
    zIndex: 1,
  },
  section2: {
    flex: 1,
    paddingLeft: 8,
    marginTop: 8,
    justifyContent:'space-evenly'
  },
  section3: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingLeft: 8,
    minWidth: 100,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    color:'#000000',
    fontFamily:'Mulish'
  },
  statusname: {
    fontSize: 10,
    fontWeight: '500',
    marginBottom: 4,
    color:'#6C6C6C',
    fontFamily:'Mulish'
  },
  numericInputWrapper: {
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  btn: {
    width: 28,
    height: 30,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnUntouched: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#233E55',
  },
  btnTouched: {
    backgroundColor: '#233E55',
    borderWidth: 1,
    borderColor: '#fff',
  },
  qtyInput: {
    width: 50,
    height: 30,
    borderRadius: 4,
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 0,
  },
  inputUntouched: {
    backgroundColor: '#fff',
    borderColor: '#233E55',
    borderWidth: 1,
  },
  inputTouched: {
    backgroundColor: '#233E55',
    borderColor: '#fff',
    borderWidth: 1,
  },
  uomText: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
  },
  qtyBreakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 4,
  },
  metaText: {
    fontSize: 10,
    color: '#666',
    marginHorizontal: 15,
    marginLeft: -1,
    marginBottom: 10,
    marginTop: 5,
  },
  viewDetails: {
    fontSize: 10,
    color: '#0A395D',
    marginTop: 4,
    textDecorationLine: 'underline',
  },
  dateText: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
  },
rightSection: {
    alignItems: 'flex-end',
    justifyContent:'space-evenly'
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  redDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'red',
    marginRight: 5,
  },
  labelText: { fontSize: 12, color: '#595A5C', fontFamily:'Mulish', fontWeight: '300' },
});

export default ASNListCardComponent;
