// src/screens/Inventory/Sub_Inv_TransferSummaryScreen.js

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Inv_HeaderComponent from '../../components/inventory/Inv_HeaderComponent';
import FooterButtonsComponent from '../../components/FooterButtonsComponent';
import Inv_LotModalPopup from '../../components/inventory/Inv_LotModalPopup';
import { useReceivingStore } from '../../store/receivingStore';
import ConfirmSubInventoryIcon from '../../assets/icons/confirmsubinventory.svg';
import InventorySuccessIcon from '../../assets/icons/inventorysuccess.svg';
import SummaryDividerIcon from '../../assets/icons/summarydivider.svg';
import SummaryViewEyeIcon from '../../assets/icons/summaryvieweye.svg';

const { width: SCREEN_WIDTH } = require('react-native').Dimensions.get('window');
const BASE_WIDTH = 375;
const rs = v => (SCREEN_WIDTH / BASE_WIDTH) * v;

export default function Sub_Inv_TransferSummaryScreen() {
  const navigation = useNavigation();
  const { OrgData, subInvTransferItems, editSubInvTransferItem } = useReceivingStore();

  const [lotModalVisible, setLotModalVisible] = useState(false);
  const [activeLineIndex, setActiveLineIndex] = useState(null);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);

  const handleOpenLot = index => {
    setActiveLineIndex(index);
    setLotModalVisible(true);
  };

  const handleSaveLots = (lots, totalQty) => {
    if (activeLineIndex == null) return;
    const currentLine = subInvTransferItems[activeLineIndex];
    if (!currentLine) return;
    const updated = {
      ...currentLine,
      lots,
      lotStatus: {
        count: lots.length,
        totalQty,
      },
    };
    editSubInvTransferItem(updated, activeLineIndex);
  };

  const handleAddMore = () => {
    navigation.navigate('SubInvTransfer', { isAddMore: true });
  };

  const handleTransferPress = () => {
    if (!subInvTransferItems || subInvTransferItems.length === 0) return;
    setConfirmVisible(true);
  };

  const handleConfirmTransfer = () => {
    setConfirmVisible(false);
    console.log('SUB_INV_TRANSFER_SUBMIT', subInvTransferItems);
    setSuccessVisible(true);
    setTimeout(() => {
      setSuccessVisible(false);
      navigation.navigate('Inventory');
    }, 1500);
  };

  const hasLines = subInvTransferItems && subInvTransferItems.length > 0;
  const activeLine =
    activeLineIndex != null ? subInvTransferItems[activeLineIndex] : null;

  return (
    <View style={styles.root}>
      <Inv_HeaderComponent
        organizationName={OrgData?.org_name || 'EnnVee'}
        screenTitle="Sub Inventory Transfer"
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: rs(120) }}
        keyboardShouldPersistTaps="handled"
      >
        {hasLines &&
          subInvTransferItems.map((line, index) => (
            <View key={`${line.item?.code || 'line'}-${index}`} style={styles.cardWrapper}>
              <View style={styles.card}>
                <View style={styles.cardTitleRow}>
                  <Text style={styles.cardTitleText}>Line {index + 1}</Text>
                </View>

                <View style={styles.itemInfoRow}>
                  <View style={styles.itemInfoLeft}>
                    <Text style={styles.itemLabel}>Item</Text>
                    <Text style={styles.itemValue}>
                      {line.item?.name || line.item?.code || '-'}
                    </Text>
                  </View>
                  <View style={styles.itemInfoRight}>
                    <Text style={styles.itemLabel}>Qty</Text>
                    <Text style={styles.itemValue}>{line.qty ?? 0}</Text>
                  </View>
                </View>

                <View style={styles.detailsContainer}>
                  <View style={styles.detailsColumn}>
                    <Text style={styles.detailsLabel}>From Sub</Text>
                    <View style={styles.detailsValueBox}>
                      <Text style={styles.detailsValueText}>
                        {line.fromSub?.name || '-'}
                      </Text>
                    </View>

                    <Text style={[styles.detailsLabel, styles.detailsLabelSpacer]}>
                      From Locator
                    </Text>
                    <View style={styles.detailsValueBox}>
                      <Text style={styles.detailsValueText}>
                        {line.fromLocator?.name || '-'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.dividerWrapper}>
                    <SummaryDividerIcon height={rs(24)} width={rs(24)} />
                  </View>

                  <View style={styles.detailsColumn}>
                    <Text style={styles.detailsLabel}>To Sub</Text>
                    <View style={styles.detailsValueBox}>
                      <Text style={styles.detailsValueText}>
                        {line.toSub?.name || '-'}
                      </Text>
                    </View>

                    <Text style={[styles.detailsLabel, styles.detailsLabelSpacer]}>
                      To Locator
                    </Text>
                    <View style={styles.detailsValueBox}>
                      <Text style={styles.detailsValueText}>
                        {line.toLocator?.name || '-'}
                      </Text>
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.viewLotBtn}
                  onPress={() => handleOpenLot(index)}
                >
                  <SummaryViewEyeIcon width={rs(18)} height={rs(18)} />
                  <Text style={styles.viewLotText}>View LOT</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
      </ScrollView>

      <FooterButtonsComponent
        leftLabel="Add More"
        rightLabel="Transfer"
        onLeftPress={handleAddMore}
        onRightPress={handleTransferPress}
        leftEnabled
        rightEnabled={hasLines}
      />

      <Inv_LotModalPopup
        visible={lotModalVisible && !!activeLine}
        onClose={() => setLotModalVisible(false)}
        lineQty={activeLine?.qty || 0}
        itemName={activeLine?.item?.name}
        initialLots={activeLine?.lots || []}
        onSave={handleSaveLots}
        lineLabel={activeLineIndex != null ? `Line ${activeLineIndex + 1}` : undefined}
      />

      <ConfirmModal
        visible={confirmVisible}
        onCancel={() => setConfirmVisible(false)}
        onConfirm={handleConfirmTransfer}
      />

      <SuccessModal
        visible={successVisible}
        onClose={() => setSuccessVisible(false)}
      />
    </View>
  );
}

function ConfirmModal({ visible, onCancel, onConfirm }) {
  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <View style={styles.modalTop}>
            <ConfirmSubInventoryIcon width={rs(80)} height={rs(80)} />
          </View>
          <View style={styles.modalBody}>
            <Text style={styles.modalTitle}>Confirmation</Text>
            <Text style={styles.modalText}>
              Are you sure want to transfer this Inventory
            </Text>
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancel]}
                onPress={onCancel}
              >
                <Text style={[styles.modalButtonText, styles.modalCancelText]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalConfirm]}
                onPress={onConfirm}
              >
                <Text style={[styles.modalButtonText, styles.modalConfirmText]}>
                  Confirm
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function SuccessModal({ visible, onClose }) {
  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <View style={styles.modalTop}>
            <InventorySuccessIcon width={rs(80)} height={rs(80)} />
          </View>
          <View style={styles.modalBody}>
            <Text style={styles.modalTitle}>
              Sub Inventory Transfer created successfully
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F5F6F8',
  },
  scroll: {
    flex: 1,
  },
  cardWrapper: {
    marginHorizontal: rs(16),
    marginTop: rs(16),
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: rs(10),
    paddingBottom: rs(12),
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: rs(4),
    shadowOffset: { width: 0, height: rs(2) },
    elevation: 2,
    overflow: 'hidden',
  },
  cardTitleRow: {
    backgroundColor: '#5D768B',
    paddingHorizontal: rs(16),
    paddingVertical: rs(6),
  },
  cardTitleText: {
    color: '#FFFFFF',
    fontSize: rs(13),
    fontWeight: '600',
  },
  itemInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: rs(16),
    paddingTop: rs(12),
    paddingBottom: rs(8),
  },
  itemInfoLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemInfoRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    minWidth: rs(80),
  },
  itemLabel: {
    fontSize: rs(11),
    color: '#555555',
  },
  itemValue: {
    marginLeft: rs(6),
    fontSize: rs(14),
    fontWeight: '600',
    color: '#233E55',
  },
  detailsContainer: {
    flexDirection: 'row',
    backgroundColor: '#ECF1F7',
    marginHorizontal: rs(12),
    borderRadius: rs(10),
    paddingHorizontal: rs(12),
    paddingVertical: rs(10),
    marginTop: rs(4),
    elevation: 2,
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: rs(3),
    shadowOffset: { width: 0, height: rs(1) },
  },
  detailsColumn: {
    flex: 1,
  },
  dividerWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: rs(8),
  },
  detailsLabel: {
    fontSize: rs(11),
    color: '#555555',
  },
  detailsLabelSpacer: {
    marginTop: rs(10),
  },
  detailsValueBox: {
    marginTop: rs(4),
    backgroundColor: '#D9E4EE',
    borderRadius: rs(8),
    paddingHorizontal: rs(10),
    paddingVertical: rs(6),
  },
  detailsValueText: {
    fontSize: rs(13),
    color: '#233E55',
    fontWeight: '500',
  },
  viewLotBtn: {
    marginTop: rs(12),
    marginHorizontal: rs(12),
    backgroundColor: '#89ADC9',
    borderRadius: rs(8),
    height: rs(40),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: rs(8),
  },
  viewLotText: {
    color: '#FFFFFF',
    fontSize: rs(13),
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: rs(24),
  },
  modalCard: {
    width: '100%',
    borderRadius: rs(16),
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  modalTop: {
    backgroundColor: '#ECF1F7',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: rs(24),
  },
  modalBody: {
    paddingHorizontal: rs(20),
    paddingVertical: rs(20),
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: rs(16),
    fontWeight: '700',
    color: '#233E55',
    textAlign: 'center',
  },
  modalText: {
    marginTop: rs(8),
    fontSize: rs(14),
    color: '#555555',
    textAlign: 'center',
  },
  modalButtonsRow: {
    marginTop: rs(20),
    flexDirection: 'row',
    columnGap: rs(12),
    width: '100%',
  },
  modalButton: {
    flex: 1,
    height: rs(44),
    borderRadius: rs(30),
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancel: {
    borderWidth: 1,
    borderColor: '#233E55',
    backgroundColor: '#FFFFFF',
  },
  modalConfirm: {
    backgroundColor: '#233E55',
  },
  modalButtonText: {
    fontSize: rs(14),
    fontWeight: '600',
  },
  modalCancelText: {
    color: '#233E55',
  },
  modalConfirmText: {
    color: '#FFFFFF',
  },
});
