import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';

const ConfirmLineItemComponent = ({
  item,
  qtyLabel = 'Qty',
  qtyValue,
  readOnly = true,
  onViewDetails = () => {},
}) => {
  const displayQty = String(qtyValue ?? item?.qtyToReceive ?? 0);

  return (
    <View style={styles.cardwrapper}>
      <View style={styles.rowContainer}>
        <View style={styles.section2}>
          <Text style={styles.itemName}>{item.name}</Text>
          <View style={styles.qtyBreakdownRow}>
            <Text style={styles.metaText}>Ordered Qty: {item.orderedQty}</Text>
            <Text style={styles.metaText}>|</Text>
            <Text style={styles.metaText}>Open Qty: {item.openQty}</Text>
          </View>
          <TouchableOpacity onPress={onViewDetails}>
            <Text style={styles.viewDetails}>View Details</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section3}>
          <View style={{ justifyContent: 'center', alignItems: 'center', height: 34 }}>
            <TextInput
              style={[styles.qtyInput, { backgroundColor: '#F4F5F6' }]}
              editable={false}
              value={displayQty}
            />
          </View>
          <Text style={styles.uomText}>{qtyLabel}</Text>
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
  qtyInput: {
    width: 50,
    height: 30,
    borderRadius: 4,
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 0,
    borderColor: '#233E55',
    borderWidth: 1,
    color: '#233E55',
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

export default ConfirmLineItemComponent;
