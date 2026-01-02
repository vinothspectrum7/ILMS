import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import CloseIcon from '../../assets/icons/close.svg';
import LotSerialItemIcon from '../../assets/icons/lotserialitem.svg';

const { width: SCREEN_WIDTH } = require('react-native').Dimensions.get('window');
const BASE_WIDTH = 375;
const rs = v => (SCREEN_WIDTH / BASE_WIDTH) * v;

export default function Rec_LotModalViewPopup({
  visible,
  onClose,
  lineQty = 0,
  itemName = '',
  itemCode = '',
  initialLots = [],
  lineLabel,
}) {
  const [lots, setLots] = React.useState([]);

  useEffect(() => {
    if (!visible) return;
    if (Array.isArray(initialLots) && initialLots.length > 0) {
      setLots(
        initialLots.map((l, index) => ({
          idx: Number.isFinite(l.idx) ? l.idx : index,
          lotNumber: l.lotNumber || '',
          mfgDate: l.mfgDate || '',
          expDate: l.expDate || '',
          qty: Number(l.qty) || 0,
        })),
      );
    } else {
      setLots([]);
    }
  }, [visible, initialLots]);

  const totalQty = useMemo(
    () => lots.reduce((sum, l) => sum + (Number(l.qty) || 0), 0),
    [lots],
  );

  console.log('lotslotslotslotslotslotslotslotslots',lineQty)

  if (!visible) return null;

  const qtySelectedActive = totalQty > 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <View style={styles.content}>
          <View style={styles.headerBar}>
            <Text style={styles.headerTitle}>
              {lineLabel ? `${lineLabel} - Lot Number Details` : 'Lot Number Details'}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: rs(10), bottom: rs(10), left: rs(10), right: rs(10) }}
            >
              <CloseIcon width={rs(20)} height={rs(20)} />
            </TouchableOpacity>
          </View>

          <View style={styles.topInfoWrapper}>
            <LinearGradient
              colors={['#5D7688', '#233655']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.topInfo}
            >
              <View style={styles.topLeft}>
                <View style={styles.iconBox}>
                  <LotSerialItemIcon width={rs(32)} height={rs(32)} />
                </View>
                <View style={styles.itemTextBlock}>
                  <Text style={styles.itemLabel}>Item Name</Text>
                  <Text style={styles.itemValue} numberOfLines={1}>
                    {itemName || itemCode || '-'}
                  </Text>
                </View>
              </View>
              <View style={styles.qtyInfo}>
                <Text style={styles.topQtyLabel}>Qty Selected</Text>
                <Text style={styles.qtyValue}>
                  <Text style={[styles.qtySelected, qtySelectedActive && styles.qtySelectedActive]}>
                    {totalQty}
                  </Text>
                  <Text style={styles.qtySlash}>/</Text>
                  <Text style={styles.qtyTotal}>{lineQty}</Text>
                </Text>
              </View>
            </LinearGradient>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={{ paddingBottom: rs(100) }}
            keyboardShouldPersistTaps="handled"
          >
            {lots.length === 0 ? (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>No lot details available</Text>
              </View>
            ) : (
              lots.map((lot, index) => {
                return (
                  <View key={lot.idx || index} style={styles.lotGroup}>
                    <View style={styles.lotCard}>
                      <View style={styles.lotHeaderRow}>
                        <Text style={styles.lotTitle}>Lot {index + 1}</Text>
                      </View>

                      <Text style={styles.fieldLabel}>
                        Lot Number<Text style={styles.required}>*</Text>
                      </Text>

                      <View style={styles.lotNumberRow}>
                        <View style={styles.lotNumberInputWrap}>
                          <TextInput
                            style={[styles.lotNumberInput, styles.readOnlyInput]}
                            value={lot.lotNumber}
                            placeholder="Enter Lot Number"
                            placeholderTextColor="#000000ff"
                            editable={false}
                          />
                        </View>
                      </View>

                      <View style={styles.row2}>
                        <View style={styles.col}>
                          <Text style={styles.fieldLabel}>
                            Mfg Date<Text style={styles.required}>*</Text>
                          </Text>
                          <View style={styles.dateRow}>
                            <TextInput
                              style={[styles.dateInput, styles.readOnlyDateInput]}
                              value={lot.mfgDate || '-'}
                              placeholder="DD/MM/YYYY"
                              numberOfLines={1}
                              placeholderTextColor="#999999"
                              editable={false}
                            />
                          </View>
                        </View>

                        <View style={styles.col}>
                          <Text style={styles.fieldLabel}>
                            Exp Date<Text style={styles.required}>*</Text>
                          </Text>
                          <View style={styles.dateRow}>
                            <TextInput
                              style={[styles.dateInput, styles.readOnlyDateInput]}
                              value={lot.expDate || '-'}
                              placeholder="DD/MM/YYYY"
                              numberOfLines={1}
                              placeholderTextColor="#999999"
                              editable={false}
                            />
                          </View>
                        </View>

                        {/* Updated Qty section - right aligned */}
                        <View style={styles.colQty}>
                          <View style={styles.qtyValueContainer}>
                            <Text style={styles.qtyValueText}>{lot.qty}</Text>
                            <Text style={styles.eachText}>Each</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'transparent' },
  content: { flex: 1, backgroundColor: '#FFFFFF', marginTop: rs(102) },
  headerBar: {
    height: rs(42),
    paddingHorizontal: rs(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E6EEF7',
  },
  headerTitle: { fontSize: rs(14), fontWeight: '600', color: '#242424' },
  topInfoWrapper: { marginTop: rs(8), marginHorizontal: rs(16) },
  topInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: rs(12),
    paddingVertical: rs(10),
    borderRadius: rs(8),
    alignItems: 'center',
  },
  topLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconBox: {
    width: rs(40),
    height: rs(40),
    borderRadius: rs(8),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: rs(10),
  },
  itemTextBlock: { flex: 1 },
  itemLabel: { fontSize: rs(11), color: '#FFFFFF', opacity: 0.8 },
  itemValue: { fontSize: rs(14), fontWeight: '600', color: '#FFFFFF', marginTop: rs(2) },
  qtyInfo: { alignItems: 'flex-end' },
  topQtyLabel: { fontSize: rs(11), color: '#FFFFFF', opacity: 0.8 },
  qtyValue: { marginTop: rs(2) },
  qtySelected: { fontSize: rs(14), fontWeight: '600', color: '#FFFFFF' },
  qtySelectedActive: { fontSize: rs(16) },
  qtySlash: { fontSize: rs(14), color: '#FFFFFF' },
  qtyTotal: { fontSize: rs(14), fontWeight: '600', color: '#FFFFFF' },
  scroll: { flex: 1, paddingHorizontal: rs(16), paddingTop: rs(16) },
  noDataContainer: {
    paddingVertical: rs(40),
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataText: {
    fontSize: rs(14),
    color: '#666666',
    fontStyle: 'italic',
  },
  lotGroup: { marginBottom: rs(20) },
  lotCard: {
    borderRadius: rs(8),
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: rs(12),
    backgroundColor: '#FFFFFF',
  },
  lotHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ECF1F7',
    paddingHorizontal: rs(10),
    paddingVertical: rs(6),
    marginHorizontal: -rs(12),
    marginTop: -rs(12),
    marginBottom: rs(12),
    borderTopLeftRadius: rs(8),
    borderTopRightRadius: rs(8),
  },
  lotTitle: { fontSize: rs(14), fontWeight: '600', color: '#5D768B' },
  fieldLabel: { fontSize: rs(12), color: '#595A5C', marginBottom: rs(6) },
  required: { color: '#595A5C' },
  lotNumberRow: { flexDirection: 'row', alignItems: 'center', marginBottom: rs(12) },
  lotNumberInputWrap: { flex: 1, position: 'relative' },
  lotNumberInput: {
    width: '100%',
    borderRadius: rs(10),
    borderWidth: 1,
    borderColor: '#D8DEE6',
    height: rs(44),
    paddingHorizontal: rs(12),
    fontSize: rs(12),
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  readOnlyInput: {
    backgroundColor: '#ffffffff',
    color: '#000000ff',
    borderColor: '#E0E0E0',
  },
  readOnlyDateInput: {
    backgroundColor: '#FFFFFF', 
    color: '#666666',
    borderWidth: 0, 
    borderBottomColor: '#E0E0E0', 
    borderRadius: 0, 
  },
  row2: { 
    flexDirection: 'row', 
    marginTop: rs(4),
    alignItems: 'flex-start',
  },
  col: { 
    flex: 1, 
    marginRight: rs(10) 
  },
  colQty: { 
    width: rs(100), 
    marginStart: rs(1),
    alignItems: 'flex-end',
  },
  dateRow: { width: '100%', position: 'relative' },
  dateInput: {
    width: '100%',
    borderRadius: rs(8),
    borderWidth: 1,
    height: rs(40),
    paddingHorizontal: rs(12),
    fontSize: rs(12),
    color: '#222222',
    backgroundColor: '#FFFFFF',
  },
  qtyLabelText: {
    fontSize: rs(12),
    color: '#595A5C',
    marginBottom: rs(6),
    textAlign: 'right',
    width: '100%',
  },
  qtyValueContainer: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  qtyValueText: {
    fontSize: rs(14),
    color: '#666666',
    fontWeight: '600',
    marginBottom: rs(2),
    textAlign: 'right',
  },
  eachText: {
    fontSize: rs(12),
    color: '#595A5C',
    textAlign: 'right',
  },
});