import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import { useNavigation } from '@react-navigation/native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BASE_WIDTH = 375;
const s = (n) => (SCREEN_WIDTH / BASE_WIDTH) * n;
const dash = '—';

const STATUS_CONFIG = {
  OPEN: { label: 'Yet to receive', color: '#FB6969' },
  'PARTLY RECEIVED': { label: 'Partly Received', color: '#007BFF' },
  'FULLY RECEIVED': { label: 'Fully Received', color: '#2ECC71' },
};

const ASNListCardComponent = ({ item, isSelected, onCheckToggle }) => {
  const [touched, setTouched] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    setTouched(!!isSelected);
  }, [isSelected]);

  const formatDate = (input) => {
    if (!input) return dash;
    const d = new Date(input);
    if (Number.isNaN(d.getTime())) return String(input);
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${String(d.getUTCDate()).padStart(2, '0')} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
  };

  const apiKey = String(item?.po_status || 'OPEN').toUpperCase();
  const base = STATUS_CONFIG[apiKey] || STATUS_CONFIG.OPEN;
  const isFullyReceived = apiKey === 'FULLY RECEIVED';
  const displayLabel = !isFullyReceived && isSelected ? 'Receive In progress' : base.label;
  const displayColor = !isFullyReceived && isSelected ? '#FF9B00' : base.color;

  return (
    <View style={[styles.cardwrapper, isFullyReceived && styles.disabledCard]}>
      <View style={styles.rowContainer}>
        <View style={styles.section1}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={() => {
              if (isFullyReceived) return;
              onCheckToggle();
            }}
            activeOpacity={0.8}
          />
          <CheckBox
            value={isSelected}
            onValueChange={() => {
              if (isFullyReceived) return;
              onCheckToggle();
            }}
            disabled={isFullyReceived}
            tintColors={{ true: '#233E55', false: '#233E55' }}
            style={styles.checkbox}
          />
        </View>

        <View style={styles.section2}>
          <Text style={styles.labelText}>Purchase order</Text>
          <Text style={styles.itemName}>{item.Poid}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('poviewitems', { selectedPO: item })}>
            <Text style={styles.viewDetails}>View Items</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.rightSection}>
          <View style={styles.statusRow}>
            <Text style={[styles.statusname, { color: displayColor }]}>{displayLabel}</Text>
          </View>
          <Text style={styles.datelabel}>
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
  disabledCard: {
    opacity: 0.6,
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
    justifyContent: 'space-evenly',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    color: '#000000',
    fontFamily: 'Mulish',
  },
  statusname: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
    textAlign:'left',    
    color: '#6C6C6C',
    fontFamily: 'Mulish',
  },
  viewDetails: {
    fontSize: 10,
    color: '#033EFF',
    marginTop: 4,
    textDecorationLine: 'underline',
  },
  datelabel: {
    fontSize: 10,
    fontWeight: '500',
    marginBottom: 4,
    textAlign:'left',    
    color: '#595A5C',
    fontFamily: 'Mulish',
    marginTop: 4,
  },
  dateText: {
    fontSize: 10,
    fontWeight: '500',
    marginBottom: 4,
    textAlign:'left',    
    color: '#242424',
    fontFamily: 'Mulish',
    marginTop: 4,
  },
  rightSection: {
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  labelText: { fontSize: 12, color: '#595A5C', fontFamily: 'Mulish', fontWeight: '500' },
});

export default ASNListCardComponent;
