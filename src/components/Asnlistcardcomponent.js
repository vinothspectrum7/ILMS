import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import { useNavigation } from '@react-navigation/native';

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
          Ordered Date: <Text style={styles.dateText}>{item.orderedByDate}</Text>
        </Text>
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
    height: 80,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 2,
  },
  rowContainer: {
    flexDirection: 'row',
    height: '100%',
  },
  section1: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F6FAFA',
    width: 40,
    height: '100%',
    position: 'relative',
  },
  checkbox: {
    width: 16,
    height: 16,
    marginLeft: -15,
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
});

export default ASNListCardComponent;
