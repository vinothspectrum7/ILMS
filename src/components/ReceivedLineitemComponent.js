import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Dimensions } from 'react-native';
import Viewdetailsicon from '../assets/icons/Viewdetailsicon.svg';
import ReceiveItemBoxIcon from '../assets/icons/receiveitemboxicon.svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BASE_WIDTH = 375;
const scale = size => (SCREEN_WIDTH / BASE_WIDTH) * size;
const ms = (size, factor = 0.35) => Math.round(size + (scale(size) - size) * factor);
const s = n => (SCREEN_WIDTH / BASE_WIDTH) * n;
const fs = (n, f = 0.35) => n + (s(n) - n) * f;

const ReceivedLineitemComponent = ({
  item,
  qtyLabel = 'Qty',
  qtyValue,
  readOnly = true,
  isSwipe = false,
  onPressViewDetails,
  onPressPendingAction,
  onViewDetails,
  showReceivedBreakdown = false,
  receivedQtyOverride,
}) => {
  const displayQty = String(qtyValue ?? item?.qtyToReceive ?? 0);
  const receivedQty = String(receivedQtyOverride ?? item?.receivedQty ?? item?.qtyToReceive ?? 0);

  const norm = v => String(v ?? '').trim().toLowerCase();
  const isDirect = dt => norm(dt) === 'direct delivery' || norm(dt) === 'direct';
  const isStandard = dt => norm(dt) === 'standard receipt' || norm(dt) === 'standard';
  const isInspection = dt => norm(dt) === 'inspection required' || norm(dt) === 'inspection';

  const deliveryType = item?.deliverytype;

  const actionMode = useMemo(() => {
    if (isDirect(deliveryType)) return 'direct';
    if (isStandard(deliveryType)) return 'standard';
    if (isInspection(deliveryType)) return 'inspection';
    return 'direct';
  }, [deliveryType]);

  const pendingLabel = useMemo(() => {
    if (actionMode === 'standard') return 'Put Away Pending';
    if (actionMode === 'inspection') return 'Inspection Pending';
    return '';
  }, [actionMode]);

  const formatDate = dateStr => {
    if (!dateStr) return '';
    const parts = String(dateStr).trim().split(' ');
    if (parts.length !== 3) return String(dateStr);

    const [day, monthStr, year] = parts;

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

    const monthIndex = months[String(monthStr).toLowerCase()];
    if (monthIndex === undefined) return String(dateStr);

    const dd = String(day).padStart(2, '0');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const mmm = monthNames[monthIndex];

    return `${dd} ${mmm} ${year}`;
  };

  const handleViewDetailsPress = () => {
    if (typeof onPressViewDetails === 'function') return onPressViewDetails(item);
    if (typeof onViewDetails === 'function') return onViewDetails(item);
  };

  const handlePendingPress = () => {
    if (typeof onPressPendingAction === 'function') return onPressPendingAction(item);
    if (typeof onViewDetails === 'function') return onViewDetails(item);
  };

  const showDirectViewDetails = actionMode === 'direct';
  const showPendingPill = actionMode === 'standard' || actionMode === 'inspection';

  return (
    <View style={[styles.cardwrapper, { marginRight: isSwipe ? -20 : scale(15) }]}>
      <View style={styles.rowContainer}>
        <View style={styles.content}>
          <View style={styles.rowBetween}>
            <View style={styles.itemIconWrap}>
              <ReceiveItemBoxIcon width={46} height={46} />
            </View>

            <View style={{ flexDirection: 'column' }}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemdesc}>
                {item.description?.length > 20
                  ? item.description.substring(0, 20) + '...'
                  : item.description}
              </Text>
            </View>

            <View style={{ flex: 1, flexDirection: 'column' }}>
              <TextInput style={styles.qtyInput} editable={false} value={displayQty} />
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

            <Text style={styles.metaText}>Open Qty: {item.openQty}</Text>

            <View style={styles.datesRight}>
              <Text style={styles.dateValue}>Promised Date: {formatDate(item.promisedDate)}</Text>
              <Text style={styles.dateValue}>Need By Date: {formatDate(item.needByDate)}</Text>
            </View>
          </View>

          {showPendingPill && (
            <TouchableOpacity activeOpacity={0.85} style={[styles.buttonBase, styles.half]} onPress={handlePendingPress}>
              <Text style={[styles.pendingLabel]}>{pendingLabel}</Text>
            </TouchableOpacity>
          )}

          {showDirectViewDetails && (
            <TouchableOpacity
              style={[
                styles.enterDetailsBox,
                Number(displayQty) > 0
                  ? { borderWidth: 0, backgroundColor: '#ECF1F7' }
                  : { borderStyle: 'dashed', borderColor: '#D9E4EE' },
              ]}
              onPress={handleViewDetailsPress}
              activeOpacity={0.8}
            >
              <View style={{ flexDirection: 'row' }}>
                <Viewdetailsicon name="view" height={14} width={14} style={{ margin: 1 }} />
                <Text style={styles.enterDetailsText}>View Details</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardwrapper: {
    paddingLeft: 0,
    marginRight: scale(15),
    marginLeft: scale(15),
    height: scale(135),
    backgroundColor: '#FBFBFB',
    borderWidth: 1,
    borderColor: '#FBFBFB',
    borderRadius: scale(10),
    elevation: 3,
  },

  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  content: {
    flex: 1,
    padding: s(10),
  },

  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: s(4),
  },

  rowContainer: { flexDirection: 'row', height: '100%' },

  itemName: {
    fontSize: ms(12),
    fontWeight: '700',
    color: '#111827',
  },

  itemdesc: {
    fontSize: ms(11),
    fontWeight: '700',
    color: '#595A5C',
    marginTop: 2,
  },

  enterDetailsBox: {
    marginTop: s(8),
    padding: s(6),
    borderWidth: 1,
    borderRadius: s(6),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  enterDetailsText: {
    fontSize: fs(11),
    color: '#145DA0',
    fontWeight: '500',
    letterSpacing: 0.1,
    marginLeft: 5,
  },

  qtyInput: {
    height: ms(34),
    borderRadius: ms(6),
    fontSize: ms(14),
    textAlign: 'right',
    marginLeft: 'auto',
    paddingVertical: 0,
    borderColor: '#FFFFFF',
    fontWeight: 'bold',
    borderWidth: 1,
    color: '#000000',
  },

  uomText: {
    fontSize: ms(10),
    color: '#242424',
    marginTop: ms(-2),
    paddingRight: s(4),
    marginLeft: 'auto',
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
  },

  datesRight: {
    marginLeft: 'auto',
  },

  itemIconWrap: {
    width: ms(50),
    height: ms(50),
    borderRadius: ms(10),
  },

  dateValue: {
    fontSize: ms(10),
    color: '#6C6C6C',
    fontWeight: '500',
  },

  half: { width: '50%' },

  buttonBase: {
    borderRadius: 8,
    overflow: 'hidden',
    borderColor: '#F6A066',
    marginTop: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#FDECEC',
  },

  pendingLabel: {
    color: '#F06000',
    fontWeight: '700',
    fontSize: 12,
  },
});

export default ReceivedLineitemComponent;
