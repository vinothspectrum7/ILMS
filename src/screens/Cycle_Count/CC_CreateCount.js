import React, { useCallback, useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Modal,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';

import Inv_HeaderComponent from '../../components/inventory/Inv_HeaderComponent';
import { useReceivingStore } from '../../store/receivingStore';
import DocumentIcon from '../../assets/icons/Ship_Icons/DocumentIcon';
import CC_Dropdown from '../../components/Cycle_Count/CC_Dropdown';
import CalendarIcon from '../../assets/icons/calendar.svg';
import ItemSelection from '../../assets/icons/CycleCount_Icons/ItemSelection.svg';
import HumanIcon from '../../assets/icons/CycleCount_Icons/HumanIcon';
import CC_SingleFooterBtnComponent from '../../components/Cycle_Count/CC_SingleFooterBtnComponent';
import CC_CreScheduleConfirmationPopupModal from '../../components/Cycle_Count/CC_CreScheduleConfirmationPopupModal';
import ConfirmationTickIcon from '../../assets/icons/Ship_Icons/ConfirmationTickIcon.svg';
import { useCycleCountStore } from '../../store/cycleCountStore';

const { width } = Dimensions.get('window');

const CC_CreateCount = () => {
  const navigation = useNavigation();
  const { OrgData } = useReceivingStore();

  const onBack = useCallback(() => navigation.goBack(), [navigation]);
  const onMenu = useCallback(() => navigation.toggleDrawer?.(), [navigation]);
  const [countName, setCountName] = useState('');
  const [subInventory, setSubInventory] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedClasses, setSelectedClasses] = useState({
    classA: false,
    classB: false,
    classC: false,
  });
  const [selectedScope, setSelectedScope] = useState('');
  const [autoApprove, setAutoApprove] = useState(false);
  const [assignTo, setAssignTo] = useState(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const subInventoryList = [
    { id: 1, name: 'FGI 1', code: 'FGI-001' },
    { id: 2, name: 'FGI 2', code: 'FGI-002' },
    { id: 3, name: 'FGI 3', code: 'FGI-003' },
    { id: 4, name: 'FGI 4', code: 'FGI-004' },
    { id: 5, name: 'FGI 5', code: 'FGI-005' },
  ];
  const assignToList = [
    { id: 1, name: 'Manager', code: 'EMP-001' },
    { id: 2, name: 'Supervisor', code: 'EMP-002' },
    { id: 3, name: 'Clerk', code: 'EMP-003' },
    { id: 4, name: 'QC', code: 'EMP-004' },
    { id: 5, name: 'Admin Role', code: 'EMP-005' },
  ];

  const addCreatedSchedule = useCycleCountStore(
  state => state.addCreatedSchedule
);


  const formatDate = (date) => {
    if (!date) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const onChangeDate = (event, picked) => {
    const currentDate = picked || new Date();
    setShowDatePicker(Platform.OS === 'ios');
    setSelectedDate(currentDate);
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  const isFormValid = useMemo(() => {
    const isSubInventoryValid = subInventory &&
      (Array.isArray(subInventory) ? subInventory.length > 0 : true);
    const isScheduleDateValid = selectedDate !== null;
    return isSubInventoryValid && isScheduleDateValid;
  }, [subInventory, selectedDate]);

  const toggleClassSelection = (classType) => {
    setSelectedClasses(prev => ({
      ...prev,
      [classType]: !prev[classType]
    }));
  };

  const handleScopeSelection = (scope) => {
    setSelectedScope(scope);
  };

  const toggleAutoApprove = () => {
    setAutoApprove(!autoApprove);
  };

const handleCreateSchedule = () => {
  if (!isFormValid) return;
  setShowConfirmationModal(true);
};

const handleModalClose = () => {
    setShowConfirmationModal(false);
  };
  
const handleModalConfirm = () => {
  const payload = {
    id: Date.now(),
    countName,
    subInventory,
    scheduleDate: selectedDate ? formatDate(selectedDate) : '',
    selectedClasses,
    selectedScope,
    autoApprove,
    assignTo,
    createdAt: new Date().toISOString(),
    status: 'Open',
  };

  console.log('Confirmed Schedule Payload:', payload);

  addCreatedSchedule(payload);

  setShowConfirmationModal(false);
  setShowSuccessModal(true);

  setTimeout(() => {
    setShowSuccessModal(false);
    navigation.navigate('CycleCount');
  }, 2000);
};


  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    navigation.navigate('CycleCount');
  };

  const Checkbox = ({ checked, onPress }) => (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <View style={[
        styles.checkboxBox,
        checked && styles.checkboxBoxChecked
      ]}>
        {checked && <View style={styles.tick} />}
      </View>
    </TouchableOpacity>
  );

  const RadioButton = ({ checked, onPress }) => (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <View style={styles.radioOuter}>
        <View style={[
          styles.radioInner,
          checked && styles.radioInnerChecked
        ]}>
          {checked && <View style={styles.radioDot} />}
        </View>
      </View>
    </TouchableOpacity>
  );

  const ToggleSwitch = ({ value, onToggle }) => (
    <TouchableOpacity
      style={[styles.toggleContainer, value && styles.toggleContainerActive]}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <View style={[styles.toggleCircle, value && styles.toggleCircleActive]} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Inv_HeaderComponent
        organizationName={OrgData?.selectedOrgCode}
        screenTitle="Create Cycle Count"
        onBack={onBack}
        onMenu={onMenu}
        showCartIcon={false}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
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
              value={countName}
              onChangeText={setCountName}
            />
          </View>

          <View style={styles.sectionSmall}>
            <CC_Dropdown
              label="Sub-Inventory"
              required
              multiple
              placeholder="Select Sub-Inventory"
              items={subInventoryList}
              value={subInventory}
              onChange={setSubInventory}
              searchKeys={['name', 'code']}
              displayValue={item => item?.name || ''}
              renderCode={item => item?.code || ''}
            />
          </View>

          <View style={styles.sectionSmall}>
            <Text style={styles.sectionLabel}>
              Schedule Date
              <Text style={styles.required}>*</Text>
            </Text>

            <TouchableOpacity
              style={styles.dateInputContainer}
              activeOpacity={0.8}
              onPress={showDatepicker}
            >
              <Text style={selectedDate ? styles.dateInput : styles.datePlaceholder}>
                {selectedDate ? formatDate(selectedDate) : 'DD/MM/YYYY'}
              </Text>
              <CalendarIcon width={24} height={24} style={styles.calendarIcon} />
            </TouchableOpacity>
          </View>

          <View style={styles.cardHeader}>
            <ItemSelection width={20} height={20} style={styles.headerIcon} />
            <Text style={styles.cardHeaderText}>Item Selection</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>ABC Classification</Text>

            <View style={styles.checkboxContainer}>
              <View style={styles.checkboxRow}>
                <Checkbox
                  checked={selectedClasses.classA}
                  onPress={() => toggleClassSelection('classA')}
                />
                <Text style={styles.checkboxLabel}>Class A</Text>
              </View>

              <View style={styles.checkboxRow}>
                <Checkbox
                  checked={selectedClasses.classB}
                  onPress={() => toggleClassSelection('classB')}
                />
                <Text style={styles.checkboxLabel}>Class B</Text>
              </View>

              <View style={styles.checkboxRow}>
                <Checkbox
                  checked={selectedClasses.classC}
                  onPress={() => toggleClassSelection('classC')}
                />
                <Text style={styles.checkboxLabel}>Class C</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Scope</Text>

            <View style={styles.scopeContainer}>
              <View style={styles.scopeLeftColumn}>
                <View style={styles.radioRow}>
                  <RadioButton
                    checked={selectedScope === 'allItems'}
                    onPress={() => handleScopeSelection('allItems')}
                  />
                  <Text style={styles.radioLabel}>All Items</Text>
                </View>

                <View style={[styles.radioRow, styles.negativeBalanceRow]}>
                  <RadioButton
                    checked={selectedScope === 'negativeBalances'}
                    onPress={() => handleScopeSelection('negativeBalances')}
                  />
                  <Text style={styles.radioLabel}>Negative Balances</Text>
                </View>
              </View>

              <View style={styles.zeroQtyColumn}>
                <View style={styles.radioRow}>
                  <RadioButton
                    checked={selectedScope === 'zeroQty'}
                    onPress={() => handleScopeSelection('zeroQty')}
                  />
                  <Text style={styles.radioLabel}>Zero Qty Only</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.cardHeader}>
            <HumanIcon width={20} height={20} style={styles.headerIcon} />
            <Text style={styles.cardHeaderText}>Assignment & Rules</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.sectionSmall}>
            <View style={styles.autoApproveContainer}>
              <View style={styles.autoApproveContent}>
                <View style={styles.autoApproveLeft}>
                  <Text style={styles.autoApproveTitle}>Auto-Approve Matches</Text>
                  <Text style={styles.autoApproveDescription}>
                    Skip review if count matches system qty
                  </Text>
                </View>
                <ToggleSwitch value={autoApprove} onToggle={toggleAutoApprove} />
              </View>
            </View>
          </View>

          <View style={styles.sectionSmall}>
            <CC_Dropdown
              label="Assign To (Optional)"
              placeholder="Select Employee OR Role"
              items={assignToList}
              value={assignTo}
              onChange={setAssignTo}
              searchKeys={['name', 'code']}
              displayValue={item => item?.name || ''}
              renderCode={item => item?.code || ''}
            />
          </View>

        </View>

        <View style={styles.footerContainer}>
          <CC_SingleFooterBtnComponent
            label="Create Schedule"
            onPress={handleCreateSchedule}
            enabled={isFormValid}
          />
        </View>
      </ScrollView>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onChangeDate}
          minimumDate={new Date()}
        />
      )}

      <CC_CreScheduleConfirmationPopupModal
        visible={showConfirmationModal}
        onClose={handleModalClose}
        onConfirm={handleModalConfirm}
      />

      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={handleSuccessModalClose}
      >
        <View style={styles.successModalOverlay}>
          <View style={styles.successModalContainer}>
            <View style={styles.successHeaderSection}>
              <View style={styles.successIconWrapper}>
                <ConfirmationTickIcon width={150} height={150} />
              </View>
            </View>

            <View style={styles.successContentSection}>
              <Text style={styles.successText}>
                Cycle Count created successfully
              </Text>
            </View>

            <View style={styles.successFooterSection}>
              <TouchableOpacity
                style={styles.successOkButton}
                onPress={handleSuccessModalClose}
                activeOpacity={0.7}
              >
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  scrollContent: {
    paddingBottom: 30,
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
    marginBottom: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionSmall: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontFamily: 'Mulish',
    fontSize: 14,
    fontWeight: '400',
    color: '#233E55',
    lineHeight: 14,
    marginBottom: 6,
  },
  required: {
    color: '#E53935',
  },
  textInput: {
    width: '100%',
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
  dateInputContainer: {
    width: '100%',
    height: 45,
    borderWidth: 1,
    borderColor: '#EFEFF0',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  dateInput: {
    flex: 1,
    fontFamily: 'Mulish',
    fontSize: 14,
    color: '#242424',
  },
  datePlaceholder: {
    flex: 1,
    fontFamily: 'Mulish',
    fontSize: 14,
    color: '#9D9FA3',
  },
  calendarIcon: {
    marginLeft: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  checkboxLabel: {
    fontFamily: 'Mulish',
    fontSize: 14,
    color: '#242424',
    marginLeft: 8,
    fontWeight:'700',
  },
  checkboxBox: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: '#9D9FA3',
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxBoxChecked: {
    backgroundColor: '#233E55',
    borderColor: '#233E55',
  },
  tick: {
    width: 6,
    height: 10,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#FFFFFF',
    transform: [{ rotate: '45deg' }],
  },
  scopeContainer: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  scopeLeftColumn: {
    flex: 1,
  },
  zeroQtyColumn: {
    marginLeft: 100,
    flexShrink: 1,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  negativeBalanceRow: {
    marginTop: 8,
  },
  radioLabel: {
    fontFamily: 'Mulish',
    fontSize: 14,
    color: '#242424',
    marginRight: 8,
        fontWeight:'700',

  },
  radioOuter: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 14,
    height: 14,
    borderWidth: 1,
    borderColor: '#9D9FA3',
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInnerChecked: {
    borderColor: '#233E55',
  },
  radioDot: {
    width: 10.5,
    height: 10.5,
    backgroundColor: '#233E55',
    borderRadius: 5.25,
  },
  autoApproveContainer: {
    width: '100%',
    height: 43,
    borderWidth: 1,
    borderColor: '#CCCED2',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  autoApproveContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '100%',
  },
  autoApproveLeft: {
    flex: 1,
    marginRight: 10,
  },
  autoApproveTitle: {
    fontFamily: 'Mulish',
    fontWeight: '700',
    fontSize: 12,
    color: '#242424',
    lineHeight: 12,
    marginBottom: 2,
  },
  autoApproveDescription: {
    fontFamily: 'Mulish',
    fontWeight: '400',
    fontSize: 12,
    color: '#9D9FA3',
    lineHeight: 12,
  },
  toggleContainer: {
    width: 36,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#9D9FA3',
    padding: 2,
    justifyContent: 'center',
  },
  toggleContainerActive: {
    backgroundColor: '#233E55',
  },
  toggleCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    transform: [{ translateX: 0 }],
  },
  toggleCircleActive: {
    transform: [{ translateX: 16 }],
  },
  footerContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 30,
  },
  successModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successModalContainer: {
    width: 372,
    height: 373,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    overflow: 'hidden',
  },
  successHeaderSection: {
    width: 372,
    height: 193,
    backgroundColor: '#ECF1F7',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIconWrapper: {
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successContentSection: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  successText: {
    fontFamily: 'Mulish',
    fontWeight: '700',
    fontSize: 18,
    lineHeight: 24.66,
    textAlign: 'center',
    color: '#233E55',
  },


});