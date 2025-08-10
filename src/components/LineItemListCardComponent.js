import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';

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
      setTouched(true);
    } else {
      setTouched(false);
    }
  }, [isSelected]);

  const handleInteraction = () => {
    if (!touched && isSelected) {
      setTouched(true);
      onQtyChange(item.id, item.openQty);
    }
  };

  const handleMinus = () => {
    handleInteraction();
    onQtyChange(item.id, Math.max(0, (item.qtyToReceive ?? 0) - 1));
  };

  const handlePlus = () => {
    handleInteraction();
    onQtyChange(item.id, Math.min(item.openQty, (item.qtyToReceive ?? 0) + 1));
  };

  const handleManualInput = (text) => {
    handleInteraction();
    const numeric = parseInt(text.replace(/[^0-9]/g, ''), 10);
    const value = !isNaN(numeric) ? Math.min(item.openQty, numeric) : 0;
    onQtyChange(item.id, value);
  };

  const isActive = touched && isSelected;

  const inputStyles = [
    styles.qtyInput,
    isActive ? styles.inputTouched : styles.inputUntouched,
  ];
  const textColor = isActive ? '#fff' : '#233E55';

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
          <Text style={styles.itemName}>{item.name}</Text>
          <View style={styles.qtyBreakdownRow}>
            <Text style={styles.metaText}>Ordered Qty: {item.orderedQty}</Text>
            <Text style={styles.metaText}>|</Text>
            <Text style={styles.metaText}>Open Qty: {item.openQty}</Text>
          </View>
           <TouchableOpacity onPress={() => onViewDetails?.(item, index)}>
              <Text style={styles.viewDetails}>View Details</Text>
           </TouchableOpacity>
        </View>

        <View style={styles.section3}>
          <View style={styles.numericInputWrapper}>
            <TouchableOpacity
              onPress={handleMinus}
              disabled={!isSelected}
              style={[
                styles.btn,
                isActive ? styles.btnTouched : styles.btnUntouched,
              ]}
            >
              <Text style={{ color: textColor, fontSize: 18 }}>−</Text>
            </TouchableOpacity>

            <TextInput
              style={[...inputStyles, { color: textColor }]}
              value={String(item.qtyToReceive ?? 0)}
              onChangeText={handleManualInput}
              keyboardType="numeric"
              editable={isSelected}
            />

            <TouchableOpacity
              onPress={handlePlus}
              disabled={!isSelected}
              style={[
                styles.btn,
                isActive ? styles.btnTouched : styles.btnUntouched,
              ]}
            >
              <Text style={{ color: textColor, fontSize: 18 }}>＋</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.dateText}>Promised Date: {item.promisedDate}</Text>
          <Text style={styles.dateText}>Need By Date: {item.needByDate}</Text>
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
  },
  section3: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingLeft: 8,
    minWidth: 100,
  },
  itemName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
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
});

export default LineItemListCardComponent;
