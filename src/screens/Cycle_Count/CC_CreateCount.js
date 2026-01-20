import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import Inv_HeaderComponent from '../../components/inventory/Inv_HeaderComponent';
import { useReceivingStore } from '../../store/receivingStore';
import DocumentIcon from '../../assets/icons/Ship_Icons/DocumentIcon';

const { width } = Dimensions.get('window');

const CC_CreateCount = () => {
  const navigation = useNavigation();
  const { OrgData } = useReceivingStore();

  const onBack = useCallback(() => navigation.goBack(), [navigation]);
  const onMenu = useCallback(() => navigation.toggleDrawer?.(), [navigation]);

  return (
    <View style={styles.container}>
      <Inv_HeaderComponent
        organizationName={OrgData?.selectedOrgCode}
        screenTitle="Create Cycle Count"
        onBack={onBack}
        onMenu={onMenu}
        showCartIcon={false}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <DocumentIcon width={20} height={20} style={styles.headerIcon} />
            <Text style={styles.cardHeaderText}>Count Details</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Count Name / Description</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Q1 Main Warehouse"
              placeholderTextColor="#9D9FA3"
            />
          </View>

        </View>
      </ScrollView>
    </View>
  );
};

export default CC_CreateCount;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F6',
  },
  scrollView: {
    flex: 1,
  },
  card: {
    width: 372,
    minHeight: 746,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginTop: 10,
    marginLeft: 20,
    marginRight: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8, 
  },
  headerIcon: {
    marginRight: 8,
  },
  cardHeaderText: {
    fontFamily: 'Mulish',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 14,
    color: '#242424',
  },
  divider: {
    height: 1,
    backgroundColor: '#EFEFF0',
    marginBottom: 24, 
  },
  section: {
    marginBottom: 32,
  },
  sectionLabel: {
    fontFamily: 'Mulish',
    fontSize: 14,
    fontWeight: '400',
    color: '#233E55',
    lineHeight: 14,
    marginBottom: 6,
  },
  textInput: {
    width: 344,
    height: 45,
    borderWidth: 1,
    borderColor: '#EFEFF0',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontFamily: 'Mulish',
    fontSize: 14,
    color: '#242424',
    backgroundColor: '#FFFFFF',
  },
 
});