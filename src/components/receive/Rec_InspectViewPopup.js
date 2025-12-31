import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { X } from 'lucide-react-native';
import ItemBoxIcon from '../../assets/icons/lotserialitem.svg';
import { MOCK_INSPECTION } from '../../data/Receipt_InspectMockData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BASE_WIDTH = 375;
const rs = v => (SCREEN_WIDTH / BASE_WIDTH) * v;

const safeNum = v => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const Rec_InspectViewPopup = ({
  visible,
  onClose,
  inspectionData,
  itemName,
  itemCode,
  uom = '',
  inspectionIndex = 0,
}) => {
  const mockInspection = useMemo(() => {
    if (inspectionData) {
      return inspectionData;
    }
    return MOCK_INSPECTION[inspectionIndex] || MOCK_INSPECTION[0] || {};
  }, [inspectionData, inspectionIndex]);

  const displayData = useMemo(() => {
    return {
      itemName: mockInspection?.item_name || itemName || 'N/A',
      itemCode: mockInspection?.item_code || itemCode || 'N/A',
      quantity: safeNum(mockInspection?.quantity || 0),
      inspectionStatus: mockInspection?.inspection_status || 'Pending',
      quality: mockInspection?.quality || 'Above Average',
      notes: mockInspection?.notes || 'No notes available',
      uom: mockInspection?.uom || uom || 'Qty',
    };
  }, [mockInspection, itemName, itemCode, uom]);

  if (!visible) return null;

  const formatStatus = (status) => {
    if (status === 'ACCEPT') return 'Accepted';
    if (status === 'REJECT') return 'Rejected';
    return status;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.modalContainer}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>View Inspection</Text>
              <TouchableOpacity onPress={onClose} activeOpacity={0.85}>
                <X size={rs(18)} color="#000000" />
              </TouchableOpacity>
            </View>

            <View style={styles.body}>
               <View style={styles.itemCard}>
                <ItemBoxIcon width={40} height={40} />
                <View style={{ flex: 1, marginLeft: 5 }}>
                  <Text style={styles.itemName}>{displayData.itemName}</Text>
                  <View style={styles.itemRow}>
                    <Text style={styles.smallText}>{displayData.itemCode}</Text>
                  </View>
                </View>
                <View style={styles.qtyBox}>
                  <Text style={styles.qtyLabel}>Qty</Text>
                  <Text style={styles.qtyValue}>
                    {displayData.quantity}
                    {displayData.uom ? ` ${displayData.uom}` : ''}
                  </Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Inspection Qty</Text>
                <Text style={styles.infoValue}>
                  {displayData.quantity} / {displayData.uom}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Status</Text>
                <Text style={styles.infoValue}>
                  {formatStatus(displayData.inspectionStatus)}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Quality</Text>
                <Text style={styles.infoValue}>{displayData.quality}</Text>
              </View>

              <View style={styles.notesSection}>
                <Text style={styles.sectionTitle}>Notes</Text>
                <View style={styles.notesContainer}>
                  <Text style={styles.notesText}>
                    {displayData.notes}
                  </Text>
                </View>
              </View>

              <View style={styles.photosSection}>
                <Text style={styles.sectionTitle}>Photos</Text>
                <View style={styles.photosContainer}>
                  <Text style={styles.photosPlaceholder}>
                    No photos added
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: rs(20),
  },
  modalContainer: {
    width: Math.min(rs(360), SCREEN_WIDTH * 0.92),
    backgroundColor: '#FFFFFF',
    borderRadius: rs(8),
    overflow: 'hidden',
  },
  header: {
    height: rs(56),
    backgroundColor: '#ECF1F7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: rs(16),
  },
  headerTitle: {
    fontSize: rs(16),
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Mulish',
  },
  body: {
    paddingHorizontal: rs(16),
    paddingTop: rs(14),
    paddingBottom: rs(16),
  },
  itemCard: {
    width: '100%',
    minHeight: rs(54),
    backgroundColor: '#4F6577',
    borderRadius: rs(6),
    paddingHorizontal: rs(12),
    paddingVertical: rs(10),
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: rs(16),
  },
  itemName: {
    color: '#FFFFFF',
    fontSize: rs(13),
    fontWeight: '600',
    fontFamily: 'Mulish',
  },
  itemRow: {
    flexDirection: 'row',
    marginTop: rs(2),
  },
  smallText: {
    color: '#DCE3EA',
    fontSize: rs(11),
    marginRight: rs(18),
    fontFamily: 'Mulish',
  },
  qtyBox: {
    alignItems: 'flex-end',
  },
  qtyLabel: {
    color: '#DCE3EA',
    fontSize: rs(11),
    fontFamily: 'Mulish',
  },
  qtyValue: {
    color: '#FFFFFF',
    fontSize: rs(16),
    fontWeight: '700',
    fontFamily: 'Mulish',
  },
  infoRow: {
    paddingTop: rs(16),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: rs(10),
    borderBottomWidth: 0.5,
    borderBottomColor: '#CCCED2',
  },
  infoLabel: {
    fontFamily: 'Mulish-Medium',
    fontSize: rs(12),
    fontWeight: '500',
    lineHeight: rs(12),
    letterSpacing: 0,
    color: '#6C6C6C',
  },
  infoValue: {
    fontFamily: 'Mulish-Medium',
    fontSize: rs(12),
    fontWeight: '500',
    lineHeight: rs(12),
    letterSpacing: 0,
    color: '#111827',
  },
  notesSection: {
    marginTop: rs(16),
  },
  sectionTitle: {
    fontFamily: 'Mulish',
    fontWeight: '600',
    fontSize: rs(12),
    color: '#233E55',
    marginBottom: rs(8),
  },
  notesContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: rs(6),
    padding: rs(12),
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  notesText: {
    fontFamily: 'Mulish',
    fontSize: rs(12),
    color: '#374151',
    lineHeight: rs(18),
  },
  photosSection: {
    marginTop: rs(16),
  },
  photosContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: rs(6),
    padding: rs(12),
    borderWidth: 1,
    borderColor: '#E9ECEF',
    minHeight: rs(80),
    justifyContent: 'center',
    alignItems: 'center',
  },
  photosPlaceholder: {
    fontFamily: 'Mulish',
    fontSize: rs(12),
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
});

export default Rec_InspectViewPopup;