import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const GLOBAL_HEADER_HEIGHT = 120;

const Ship_ViewPack = ({ visible, onClose }) => {
  const packItems = [
    {
      lpn: '1234628',
      deliveryNo: '1300003',
      customer: 'XYZ CORP',
      carrier: 'Firelight',
      packNo: '1300003',
    },
    {
      lpn: '1234679',
      deliveryNo: '1300004',
      customer: 'LMR LLC',
      carrier: 'Firelight',
      packNo: '1300004',
    },
    {
      lpn: '1234680',
      deliveryNo: '1300005',
      customer: 'PDR INC',
      carrier: 'Firelight',
      packNo: '1300005',
    },
    {
      lpn: '1234681',
      deliveryNo: '1300006',
      customer: 'DEF GROUP',
      carrier: 'Firelight',
      packNo: '1300006',
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>View Pack</Text>

            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          >
            {packItems.map((item, index) => (
              <View key={index} style={styles.itemCard}>
                <View style={styles.itemHeader}>
                  <Text style={styles.lpnLabel}>LPN</Text>
                  <Text style={styles.lpnValue}>{item.lpn}</Text>
                </View>

                <View style={styles.itemBody}>
                  <View style={styles.row}>
                    <InfoBlock label="Delivery Number" value={item.deliveryNo} />
                    <InfoBlock label="Customer Name" value={item.customer} />
                  </View>

                  <View style={styles.row}>
                    <InfoBlock label="Carrier" value={item.carrier} />
                    <InfoBlock label="Pack Number" value={item.packNo} />
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>

        </View>
      </View>
    </Modal>
  );
};

const InfoBlock = ({ label, value }) => (
  <View style={styles.infoBlock}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

export default Ship_ViewPack;
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },

  container: {
    marginTop: GLOBAL_HEADER_HEIGHT,
    backgroundColor: '#FFFFFF',
    maxHeight: SCREEN_HEIGHT * 0.75,
  },

  header: {
    height: 43,
    backgroundColor: '#ECF1F7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },

  headerTitle: {
    fontFamily: 'Mulish',
    fontWeight: '700',
    fontSize: 14,
    color: '#233E55',
  },

  closeText: {
    fontSize: 18,
    color: '#233E55',
  },

  listContent: {
    padding: 12,
      alignItems: 'center', 

  },

  itemCard: {
    width: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: '#D1D5DB',
    marginBottom: 12,
    overflow: 'hidden',

  },

  itemHeader: {
    height: 26,
    backgroundColor: '#F5F5F6',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
  },

  lpnLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#233E55',
  },

  lpnValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#233E55',
  },

  itemBody: {
    padding: 12,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  infoBlock: {
    width: '48%',
  },

  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },

  infoValue: {
    fontSize: 10,
    fontWeight: '700',
    color: '#233E55',
  },
});
