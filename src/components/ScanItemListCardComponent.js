import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Barcode } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import ConfirmLineItemComponent from './ConfirmLineItemComponent';
import BarcodeScannerIcon from '../assets/icons/barcodescanner.svg';

const ScanItemListCardComponent = ({
  dummyItems = [],
  scannedItems = [],
  onChange = () => {},
  onViewDetails = () => {},
  header = null,
}) => {
  const [showScanRow, setShowScanRow] = useState(scannedItems.length === 0);
  const [showAddMore, setShowAddMore] = useState(scannedItems.length > 0);
  const scanIndexRef = useRef(0);

  useEffect(() => {
    const any = scannedItems.length > 0;
    setShowScanRow(!any);
    setShowAddMore(any);
  }, [scannedItems.length]);

  const handleScanTap = () => {
    if (!dummyItems.length) return;
    const source = dummyItems[scanIndexRef.current % dummyItems.length];
    scanIndexRef.current += 1;

    const existing = scannedItems.find((it) => it.id === source.id);
    if (existing) {
      const maxOpen = source.openQty ?? existing.openQty ?? 0;
      const updated = scannedItems.map((it) =>
        it.id === source.id ? { ...it, qtyToReceive: maxOpen } : it
      );
      onChange(updated);
    } else {
      const fullReceiving = Math.max(0, source.openQty ?? 0);
      onChange([...scannedItems, { ...source, qtyToReceive: fullReceiving }]);
    }

    setShowScanRow(false);
    setShowAddMore(true);

    Toast.show({
      type: 'success',
      text1: 'Scanned item added successfully to the list',
      position: 'top',
      visibilityTime: 1200,
    });
  };

  const handleAddMore = () => {
    setShowAddMore(false);
    setShowScanRow(true);
  };

  const hasItems = scannedItems.length > 0;

  return (
    <View style={styles.container}>
      {hasItems && header}

      {hasItems ? (
        <FlatList
          data={scannedItems}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <View style={styles.cardWrap}>
              <ConfirmLineItemComponent
                item={item}
                qtyLabel="Qty To Receive"
                qtyValue={item.qtyToReceive}
                readOnly
                onViewDetails={() => onViewDetails(item)}
              />
            </View>
          )}
          scrollEnabled={false}
          ListFooterComponent={<View style={{ height: 8 }} />}
        />
      ) : null}

      {showScanRow && (
        <TouchableOpacity
        style={styles.scanRow}
        onPress={handleScanTap}
        activeOpacity={0.8}
        >
        <Text style={styles.scanText}>Scan your item</Text>
        <BarcodeScannerIcon width={20} height={20} fill="#7A7A7A" />
        </TouchableOpacity>
      )}

      {showAddMore && (
        <TouchableOpacity onPress={handleAddMore} style={styles.addMore} activeOpacity={0.8}>
          <Text style={styles.addMoreText}>Add more items</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingHorizontal: 0, marginTop:15 },
  cardWrap: { marginBottom: 12 },
  scanRow: {
    backgroundColor: '#FFFFFF',
    borderColor: '#00000040',
    borderWidth: 1,
    borderRadius: 10,
    height: 40,
    marginHorizontal: 15,
    marginTop: 6,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scanText: { color: '#777' },
  addMore: { alignSelf: 'flex-start', marginTop: 8, marginLeft: 15 },
  addMoreText: { color: '#0A395D', textDecorationLine: 'underline', fontSize: 12 },
});

export default ScanItemListCardComponent;
