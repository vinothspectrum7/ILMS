import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import GlobalHeaderComponent from '../../components/GlobalHeaderComponent';
import SingleFooterBtnComponent from '../../components/SingleFooterBtnComponent';
import ShipConfirmationModal from './Ship_ConfirmationModal';
import CONFIRM_DATA from '../../data/shippingMockData'; 
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');


const Ship_ConfirmPack = () => {
  const navigation = useNavigation();
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleConfirm = () => {
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
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={styles.footer}>
        <SingleFooterBtnComponent
          label="Confirm pack"
          onPress={handleConfirm}
          enabled
        />
      </View>

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

export default Ship_ConfirmPack;

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
});