import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Dimensions,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import GlobalHeaderComponent from '../GlobalHeaderComponent';
import SingleFooterBtnComponent from '../SingleFooterBtnComponent';
import ShipConfirmationModal from './Ship_ConfirmationModal';
import SipBoxIcon from '../../assets/icons/Ship_Icons/SipBoxIcon.svg';
import Ship_FooterModalButtonComponent from '../../components/shipping/Ship_FooterModalButtonComponent';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const CONFIRM_DATA = [
  {
    lpn: '1234677',
    deliveryNo: '1100002',
    customer: 'ABC PVT LTD',
    carrier: 'Freight',
    packNo: '1100002',
  },
  {
    lpn: '1234678',
    deliveryNo: '1100003',
    customer: 'XYZ CORP',
    carrier: 'Freight',
    packNo: '1100003',
  },
  {
    lpn: '1234679',
    deliveryNo: '1100004',
    customer: 'DEF INC',
    carrier: 'Shipping Cost',
    packNo: '1100003',
  },
  {
    lpn: '1234680',
    deliveryNo: '1100054',
    customer: 'GHI LLC',
    carrier: 'Delivery Fee',
    packNo: '1100005',
  },
];

const Ship_ManConfirmPack = () => {
  const navigation = useNavigation();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSecondPopup, setShowSecondPopup] = useState(false);

  const handleConfirm = () => {
    setShowSecondPopup(true);
  };

  const handleSecondPopupLeft = () => {
    setShowSecondPopup(false);
  };

  const handleSecondPopupRight = () => {
    setShowSecondPopup(false);
    setShowConfirmModal(true);
  };

  const mainCardWidth = Math.min(372, screenWidth - 42);
  const itemCardWidth = Math.min(309, mainCardWidth - 32);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#233E55" barStyle="light-content" />

      <GlobalHeaderComponent
        screenTitle="Confirm"
        organizationName="ENV"
        onBack={() => navigation.goBack()}
      />

      <View
        style={[
          styles.mainCard,
          { width: mainCardWidth, maxHeight: screenHeight * 0.72 },
        ]}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.mainCardContent}
        >
          {CONFIRM_DATA.map((item, index) => (
            <View
              key={index}
              style={[styles.itemCard, { width: itemCardWidth }]}
            >
              <View style={styles.itemHeader}>
                <Text style={styles.headerLabel}>LPN</Text>
                <Text style={styles.headerValue}>{item.lpn}</Text>
              </View>

              <View style={styles.itemBody}>
                <View style={styles.twoColRow}>
                  <InfoBlock label="Delivery Number" value={item.deliveryNo} />
                  <InfoBlock label="Customer Name" value={item.customer} />
                </View>

                <View style={styles.twoColRow}>
                  <InfoBlock label="Carrier" value={item.carrier} />
                  <InfoBlock label="Pack Number" value={item.packNo} />
                </View>
              </View>
              <View style={styles.modifyBar}>
                <Text style={styles.modifyBarText}>Modify</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={styles.footer}>
        <SingleFooterBtnComponent
          label="Confirm"
          onPress={handleConfirm}
          enabled
        />
      </View>

      <Modal
        visible={showSecondPopup}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSecondPopup(false)}
      >
        <View style={styles.secondPopupOverlay}>
          <View style={styles.secondPopupContainer}>
            <View style={styles.secondPopupHeader}>
              <SipBoxIcon width={150} height={150} />
            </View>
            <View style={styles.secondPopupContent}>
              <Text style={styles.confirmationTitle}>Confirmation</Text>

              <Text style={styles.confirmationText}>
                Are you sure want to confirm
              </Text>
              <Text style={styles.confirmationText}>
                these line items to pack.
              </Text>
              <View style={styles.footerButtonsWrapper}>
                <Ship_FooterModalButtonComponent
                  leftLabel="Cancel"
                  rightLabel="Confirm"
                  onLeftPress={handleSecondPopupLeft}
                  onRightPress={handleSecondPopupRight}
                  leftEnabled={true}
                  rightEnabled={true}
                  containerStyle={styles.footerModalContainer}
                  showShadow={false}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <ShipConfirmationModal
        visible={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        type="CONFIRM_PACK"
        itemCount={CONFIRM_DATA.length}
      />
    </View>
  );
};

const InfoBlock = ({ label, value }) => (
  <View style={styles.infoBlock}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

export default Ship_ManConfirmPack;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8',
  },

  mainCard: {
    alignSelf: 'center',
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#00000040',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 1,
    elevation: 2,
  },

  mainCardContent: {
    paddingVertical: 14,
  },

  itemCard: {
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: '#D1D5DB',
    marginBottom: 14,
    overflow: 'hidden',
    shadowColor: '#00000040',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 1,
    elevation: 2,
  },

  itemHeader: {
    height: 26,
    backgroundColor: '#F5F5F6',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
  },

  headerLabel: {
    fontFamily: 'Mulish',
    fontWeight: '600',
    fontSize: 12,
    color: '#233E55',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },

  headerValue: {
    fontFamily: 'Mulish',
    fontWeight: '700',
    fontSize: 12,
    color: '#233E55',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },

  itemBody: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },

  twoColRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  infoBlock: {
    width: '48%',
  },

  infoLabel: {
    fontFamily: 'Mulish',
    fontWeight: '400',
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },

  infoValue: {
    fontFamily: 'Mulish',
    fontWeight: '700',
    fontSize: 10,
    lineHeight: 10,
    letterSpacing: 0,
    color: '#233E55',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },

  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F4F6F8',
  },

  modifyBar: {
    width: 309,
    height: 26,
    backgroundColor: '#D9E4EE',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 8,
  },

  modifyBarText: {
    fontFamily: 'Mulish',
    fontWeight: '700',
    fontSize: 12,
    lineHeight: 26,
    textAlign: 'center',
    color: '#233E55',
  },

secondPopupOverlay: {
  ...StyleSheet.absoluteFillObject,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  justifyContent: 'center',
  alignItems: 'center',
},

  secondPopupContainer: {
    width: 372,
    height: 370,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },

  secondPopupHeader: {
    width: '100%',
    height: 165,
    backgroundColor: '#ECF1F7',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },

  secondPopupContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },

  confirmationTitle: {
    fontFamily: 'Mulish',
    fontSize: 18,
    fontWeight: '700',
    color: '#233E55',
    textAlign: 'center',
    marginBottom: 8,
  },

  confirmationText: {
    fontFamily: 'Mulish',
    fontSize: 16,
    fontWeight: '400',
    color: '#233E55',
    textAlign: 'center',
    lineHeight: 22,
  },

  footerButtonsWrapper: {
    width: '100%',
    marginTop: 24,
  },

  footerModalContainer: {
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    paddingVertical: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
});