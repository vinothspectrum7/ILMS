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
import Enterdetailsicon from '../assets/icons/enter_details.svg';
import Viewdetailsicon from '../assets/icons/Viewdetailsicon.svg';

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
        onQtyChange(item.id, item.max_open_qty);
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

const formatDate = (dateStr) => {
  if (!dateStr) return "";

  // Split input like "05 july 2025"
  const parts = dateStr.trim().split(" ");
  if (parts.length !== 3) return dateStr; // fallback if unexpected format

  const [day, monthStr, year] = parts;

  // Map month names (full & short → index)
  const months = {
    jan: 0, january: 0,
    feb: 1, february: 1,
    mar: 2, march: 2,
    apr: 3, april: 3,
    may: 4,
    jun: 5, june: 5,
    jul: 6, july: 6,
    aug: 7, august: 7,
    sep: 8, sept: 8, september: 8,
    oct: 9, october: 9,
    nov: 10, november: 10,
    dec: 11, december: 11,
  };

  const monthIndex = months[monthStr.toLowerCase()];
  if (monthIndex === undefined) return dateStr; // fallback if unknown month

  // Always format back to dd MMM yyyy
  const dd = day.padStart(2, "0");
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const mmm = monthNames[monthIndex];

  return `${dd} ${mmm} ${year}`;
};


  return (
<View style={styles.cardwrapper}>
  <View style={styles.rowContainer}>

    {/* LEFT CHECKBOX */}
    <View style={styles.section1}>
      <CheckBox
        value={isSelected}
        onValueChange={() => onCheckToggle(item)}
        style={styles.checkbox}
        disabled={item.openQty === 0}
      />
    </View>

    {/* MAIN CONTENT */}
    <View style={styles.content}>

      {/* TOP ROW */}
{/* <View style={styles.topRow}> */}

  {/* ROW 1 */}
  <View style={styles.rowBetween}>
    <Text style={styles.itemName}>{item.name}</Text>

    <CustomNumericInput
      value={item.qtyToReceive ?? 0}
      setValue={(v) => onQtyChange(item.id, v)}
      min={0}
      max={item.max_open_qty}
      width={s(72)}
      height={s(28)}
      disabledinput={item.openQty === 0}
    />
  </View>

  {/* ROW 2 */}
  <View style={styles.qtyRow}>
    <Text style={styles.metaText}>Ordered Qty: {item.orderedQty}</Text>

    <View style={styles.vertDivider} />

    <Text style={styles.metaText}>Open Qty: {item.openQty}</Text>


    <Text style={styles.uomText}>{item.uom}</Text>
  </View>

{/* </View> */}


      {/* ENTER DETAILS (DOTTED) */}
      <TouchableOpacity
        style={[
  styles.enterDetailsBox,
  item.qtyToReceive>0
    ? { borderWidth:0,backgroundColor:'#ECF1F7' }
    : { borderStyle: 'dashed', borderColor: '#D9E4EE' },
]}

        onPress={() => onViewDetails?.(item, index)}
        activeOpacity={0.8}
      >
          {item.qtyToReceive==0?(<View style={{flexDirection:'row'}}>
            <Enterdetailsicon name="edit" size={14}  />
        <Text style={styles.enterDetailsText}>Enter Details</Text>
        </View>):(
        <View style={{flexDirection:'row'}}>
            <Viewdetailsicon name="view" height={14} />
        <Text style={styles.enterDetailsText}>View Details</Text>
        </View>)}
        <View style={styles.datesRight}>
          <Text style={styles.dateValue}>
            Promised Date: {formatDate(item.promisedDate)}
          </Text>
          <Text style={styles.dateValue}>
            Need By Date: {formatDate(item.needByDate)}
          </Text>
        </View>
      </TouchableOpacity>

    </View>
  </View>
</View>

  );
};

const styles = StyleSheet.create({
  cardwrapper: {
    marginHorizontal: s(15),
    height: s(110),
    backgroundColor: '#FFFFFF',
    borderRadius: s(10),
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  rowBetween: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
},

qtyRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: s(4),
  // paddingBottom:5,
  // borderBottomWidth: 1,
  // borderColor: '#BFD3FF',
  // borderStyle: 'dashed',
},

  rowContainer: {
    flexDirection: 'row',
    height: '100%',
  },

  section1: {
    width: s(36),
    backgroundColor: '#ECF1F7',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: s(10),
    borderBottomLeftRadius: s(10),
  },

  checkbox: {
    transform: [{ scale: 0.8 }],
  },

  content: {
    flex: 1,
    padding: s(10),
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',

  },

  rightTop: {
    alignItems: 'flex-end',
  },

  itemName: {
    fontSize: fs(12),
    fontWeight: '700',
    color: '#111827',
  },

  qtyBreakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: s(4),
  },

  metaText: {
    fontSize: fs(9),
    color: '#595A5C',
  },

  vertDivider: {
    width: 1,
    height: s(14),
    backgroundColor: '#CCCED2',
    marginHorizontal: s(8),
  },

  uomText: {
    fontSize: fs(9),
    color: '#6B7280',
    // marginTop: s(5),
    marginLeft:'auto'
  },

  /* 🔹 DOTTED ENTER DETAILS */
  enterDetailsBox: {
    marginTop: s(8),
    padding: s(6),
    borderWidth: 1,
    // borderColor: '#D9E4EE',
    // borderStyle: 'dashed',
    borderRadius: s(6),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  enterDetailsText: {
    fontSize: fs(11),
    color: '#145DA0',
    fontWeight: '500',
    letterSpacing:0.1,
    marginLeft:5
  },

  datesRight: {
    alignItems: 'flex-end',
  },

  dateValue: {
    fontSize: fs(8),
    color: '#595A5C',
  },
});


export default LineItemListCardComponent;
