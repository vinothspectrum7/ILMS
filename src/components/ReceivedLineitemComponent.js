import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Dimensions } from 'react-native';
import Enterdetailsicon from '../assets/icons/enter_details.svg';
import Viewdetailsicon from '../assets/icons/Viewdetailsicon.svg';
import ReceiveItemBoxIcon from '../assets/icons/receiveitemboxicon.svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BASE_WIDTH = 375;
const scale = (size) => (SCREEN_WIDTH / BASE_WIDTH) * size;
const ms = (size, factor = 0.35) => Math.round(size + (scale(size) - size) * factor);
const s = (n) => (SCREEN_WIDTH / BASE_WIDTH) * n;             // size scale
const fs = (n, f = 0.35) => n + (s(n) - n) * f;      

const ReceivedLineitemComponent = ({
  item,
  qtyLabel = 'Qty',
  qtyValue,
  readOnly = true,
  isSwipe = false,
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
    <View style={[styles.cardwrapper,
      { marginRight: isSwipe ? -20 : scale(15) } // ✅ per-item margin
    ]}>
      <View style={styles.rowContainer}>
    <View style={styles.content}>

  <View style={styles.rowBetween}>
                      <View style={styles.itemIconWrap}>
                        <ReceiveItemBoxIcon width={46} height={46} />
                      </View>
                      <View style={{flexDirection:'column'}}>
    <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemdesc}>
    {item.description?.length > 20 ? item.description.substring(0, 20) + '...' : item.description}
        </Text>
</View>
                      <View style={{flex:1,flexDirection:'column'}}>

                <TextInput
              style={styles.qtyInput}
              editable={false}
              value={displayQty}
            />
        <Text style={styles.uomText}>{item.uom}</Text>
        </View>
  </View>
            <View style={styles.qtyRow}>
              <Text style={styles.metaText}>Ordered Qty: {item.orderedQty}</Text>
                      <View style={styles.vertDivider} />
            {showReceivedBreakdown && (
              <>
                <Text style={styles.metaText}>Received Qty: {receivedQty}</Text>
                <View style={styles.vertDivider} />
              </>
            )}
              {/* <View style={styles.vertDivider} /> */}
          
              <Text style={styles.metaText}>Open Qty: {item.openQty}</Text>
                <View style={styles.datesRight}>
          <Text style={styles.dateValue}>
            Promised Date: {formatDate(item.promisedDate)}
          </Text>
          <Text style={styles.dateValue}>
            Need By Date:   {formatDate(item.needByDate)}
          </Text>
        </View>
          
            </View>

          {/* <TouchableOpacity onPress={onViewDetails} activeOpacity={0.7}>
            <Text style={styles.viewDetails}>View Details</Text>
          </TouchableOpacity> */}
                    {item.deliverystatus=='Pending'?(
                  <TouchableOpacity
                    // activeOpacity={0.85}
                    style={[styles.buttonBase, styles.half]}
                  >
                    <Text style={[styles.label, { color: '#F06000' }]}>{item.deliverystatusdesc}</Text>
                  </TouchableOpacity>
        ):(
      <TouchableOpacity
        style={[
  styles.enterDetailsBox,
  displayQty>0
    ? { borderWidth:0,backgroundColor:'#ECF1F7' }
    : { borderStyle: 'dashed', borderColor: '#D9E4EE' },
]}

        onPress={onViewDetails}
        activeOpacity={0.8}
      >
        <View style={{flexDirection:'row'}}>
            <Viewdetailsicon name="view" height={14} width={14} style={{margin:1}}  />
        <Text style={styles.enterDetailsText}>View Details</Text>
        </View>
      </TouchableOpacity>)}
      </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardwrapper: {
    // paddingRight: scale(12),
    paddingLeft: 0,
    marginRight: scale(15),
    marginLeft: scale(15),
    height: scale(135),
    backgroundColor: '#FBFBFB',
    borderWidth: 1,
    borderColor: '#FBFBFB',
    borderRadius: scale(10),
    elevation:3
  },
    rowBetween: {
  flexDirection: 'row',
//   justifyContent: 'space-between',
  alignItems: 'center',
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
qtyRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: s(4),
  // paddingBottom:5,
  // borderBottomWidth: 1,
  // borderColor: '#BFD3FF',
  // borderStyle: 'dashed',
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
    itemdesc: {
    fontSize: ms(11),
    fontWeight: '700',
    color: '#595A5C',
    marginTop:2
  },
    qtyBreakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: s(4),
  },
  qtyBox: {
    justifyContent: 'center',
    alignItems: 'center',
    height: ms(36),
  },
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
  qtyInput: {
    // width: Math.max(ms(64), SCREEN_WIDTH * 0.18),
    height: ms(34),
    borderRadius: ms(6),
    fontSize: ms(14),
    textAlign: 'right',
    marginLeft:'auto',
    paddingVertical: 0,
    // paddingHorizontal: ms(10),
    borderColor: '#FFFFFF',
    fontWeight: 'bold',
    borderWidth: 1,
    color: '#000000',
    // marginLeft:'auto'
  },
  uomText: {
    fontSize: ms(10),
    color: '#242424',
    marginTop: ms(-2),
    paddingRight: s(4),
    // marginBottom: ms(10),
    // marginRight: ms(10),
        marginLeft:'auto'

  },
    vertDivider: {
      width: Math.max(StyleSheet.hairlineWidth, scale(1)),
      height: scale(18),
      backgroundColor: '#9D9FA3',
      marginHorizontal: scale(12),
      borderRadius: scale(0.5),
      opacity: 0.9,
    },
  metaText: {
    fontSize: ms(10),
    color: '#595A5C',
    // fontWeight:500
  },
  viewDetails: {
    
    fontSize: ms(10),
    color: '#033EFF',
    textDecorationLine: 'underline',
    textDecorationColor: '#033EFF',
  },
    datesRight: {
    marginLeft:'auto',
  },
    itemIconWrap: {
    width: ms(50),
    height: ms(50),
    borderRadius: ms(10),
    // alignItems: 'center',
    // justifyContent: 'center',
    // marginRight: ms(10),
  },
    dateRowbottom: { flexDirection: 'row', marginTop: scale(2) },
    dateRowtop: { flexDirection: 'row', marginTop: scale(2), marginTop: ms(16), },
  dateLabel: { fontSize: ms(10), color: '#6C6C6C' },
  dateValue: { fontSize: ms(10), color: '#6C6C6C', fontWeight: '500' },
    half: { width: '50%' },
  leftDisabledBorder: { borderColor: '#A0AEB8' },
  buttonBase: {
    borderRadius: 8,
    overflow: 'hidden',
    borderColor:'#F6A066',
    // marginBottom: 22,
    borderWidth:1,
    justifyContent: 'center',
    alignItems: 'center',
    // height:28,
    padding:8,
    backgroundColor:'#FDECEC'
    // position: 'relative',
  },
});

export default ReceivedLineitemComponent;
