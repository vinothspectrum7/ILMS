import React, { useCallback, useState, useMemo } from 'react';
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
import SearchIcon from '../../assets/icons/SearchIcon.svg';
import FilterIcon from '../../assets/icons/CycleCount_Icons/FilterIcon.svg';
import WarehouseIcon from '../../assets/icons/CycleCount_Icons/WarehouseIcon.svg';
import CalendarIcon from '../../assets/icons/calendar.svg';
import Inv_HeaderComponent from '../../components/inventory/Inv_HeaderComponent';
import { useReceivingStore } from '../../store/receivingStore';
import { MOCK_ACTIVE_CYCLE_COUNT_LIST } from '../../data/CycleCountMockData';
import { useCycleCountStore } from '../../store/cycleCountStore';

const { width } = Dimensions.get('window');

const computePercent = (received, ordered) => {
  const r = Number(received ?? 0);
  const o = Number(ordered ?? 0);
  if (!Number.isFinite(o) || o <= 0) return 0;
  const pct = (r / o) * 100;
  return Math.ceil(pct);
};

const getProgressColor = (percent, status) => {
  if (status === 'In Progress') return '#033EFF';
  const p = Number(percent || 0);
  if (p > 0 && p <= 25) return '#DA1E28';
  if (p > 25 && p <= 60) return '#F06000';
  if (p > 60 && p <= 90) return '#033EFF';
  if (p > 90) return '#168035';
  if (p === 0) return '#DA1E28';
  return '#2563EB';
};

const getProgressWrapperColor = (percent, status) => {
  if (status === 'In Progress') return '#D9E4EE';

  const p = Number(percent || 0);
  if (p > 0 && p <= 25) return '#F8D2D4';
  if (p > 25 && p <= 60) return '#FCDFCC';
  if (p > 60 && p <= 90) return '#D9E4EE';
  if (p > 90) return '#D0E6D7';
  if (p === 0) return '#F8D2D4';
  return '#F5F5F6';
};

const getStatusStyle = (status) => {
  switch (status) {
    case 'In Progress':
      return {
        bg: '#E8F0FF',
        text: '#033EFF',
        wrapperBg: '#D7E8FE',
        progressFill: '#033EFF',
      };
    case 'Completed':
      return {
        bg: '#E6F9F0',
        text: '#16A34A',
        wrapperBg: '#16A34A',
        progressFill: '#16A34A',
      };
    case 'OverDue':
      return {
        bg: '#FEE2E2',
        text: '#DC2626',
        wrapperBg: '#DC2626',
        progressFill: '#DC2626',
      };
    case 'Open':
    default:
      return {
        bg: '#FFF4E5',
        text: '#DC2626',
        wrapperBg: '#DC2626',
        progressFill: '#DC2626',
      };
  }
};

const CC_ActiveCount = () => {
  const navigation = useNavigation();
  const { OrgData } = useReceivingStore();

  const onBack = useCallback(() => navigation.goBack(), [navigation]);
  const onMenu = useCallback(() => navigation.toggleDrawer?.(), [navigation]);
  const [searchQuery, setSearchQuery] = useState('');
  const setSelectedList = useCycleCountStore(s => s.setSelectedList);

  const getProgressPercent = (completed, total) => {
    if (!total) return 0;
    return (Number(completed) / Number(total)) * 100;
  };

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return MOCK_ACTIVE_CYCLE_COUNT_LIST;
    
    const query = searchQuery.toLowerCase().trim();
    
    return MOCK_ACTIVE_CYCLE_COUNT_LIST.filter(item => {
      return (
        item.count_name?.toLowerCase().includes(query) ||
        item.cc_code?.toLowerCase().includes(query) ||
        item.sub_inventory?.toLowerCase().includes(query) ||
        item.schedule_date?.toLowerCase().includes(query) ||
        item.cc_status?.toLowerCase().includes(query)
      );
    });
  }, [searchQuery]);

  const handleCardPress = (item) => {
    const progressPercent = computePercent(
      item.completed_item_count,
      item.total_item_count
    );
    const progressColor = getProgressColor(progressPercent, item.cc_status);
    const wrapperColor = getProgressWrapperColor(progressPercent, item.cc_status);
    const enhancedItem = {
      ...item,
      progressColor,
      wrapperColor,
      progressPercent
    };

    setSelectedList(enhancedItem);
    navigation.navigate('CC_ViewActiveCount', { countId: item.id });
  };

  const selectedListItemDetails = useCycleCountStore(
    state => state.cycleCount.selectedListItemDetails
  );
  const getCompletedCountForCycle = (countId, submittedItems) => {
    return submittedItems.filter(
      item => item.countId === countId
    ).length;
  };
  const resetCyclecountStore = useCycleCountStore(s => s.resetStore);

    const handleBack = () => {
    resetCyclecountStore();
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Inv_HeaderComponent
        organizationName={OrgData?.selectedOrgCode}
        screenTitle="Cycle Count"
        onBack={handleBack}
        onMenu={onMenu}
        showCartIcon={false}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.searchContainer}>
          <View style={styles.searchRow}>
            <View style={styles.searchInputContainer}>
              <SearchIcon width={16} height={16} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search Counts"
                placeholderTextColor="#9D9FA3"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <TouchableOpacity style={styles.filterButton}>
              <FilterIcon width={15} height={15} style={styles.filterIcon} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.assignedTaskContainer}>
          <Text style={styles.assignedTaskTitle}>
            Assigned Task
          </Text>
        </View>

        <View style={styles.cardList}>
          {filteredItems.map((item) => {
            const completed_item_count = getCompletedCountForCycle(
              item.id,
              selectedListItemDetails
            );

            const total_item_count = item.total_item_count;

            const progressPercent = computePercent(
              completed_item_count,
              total_item_count
            );

            const progressColor = getProgressColor(progressPercent, item.cc_status);
            const wrapperColor = getProgressWrapperColor(progressPercent, item.cc_status);

            const statusStyle = getStatusStyle(item.cc_status);

            return (
              <TouchableOpacity
                key={item.id}
                style={styles.card}
                onPress={() => handleCardPress(item)}
                activeOpacity={0.7}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.countName}>{item.count_name}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: statusStyle.bg },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBadgeText,
                        { color: statusStyle.text },
                      ]}
                    >
                      {item.cc_status}
                    </Text>
                  </View>
                </View>

                <View style={styles.ccCodeContainer}>
                  <Text style={styles.ccCode}>{item.cc_code}</Text>
                </View>

                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <WarehouseIcon width={12} height={12} style={styles.metaIcon} />
                    <Text style={styles.metaText}>{item.sub_inventory}</Text>
                  </View>
                  <View style={styles.spacer} />
                  <View style={styles.metaItem}>
                    <CalendarIcon width={12} height={12} style={styles.metaIcon} />
                    <Text style={styles.metaText}>{item.schedule_date}</Text>
                  </View>
                </View>

                <View style={styles.progressWrapper}>
                  <View
                    style={[
                      styles.progressWrapperBg,
                      { backgroundColor: wrapperColor }
                    ]}
                  />
                  <View style={styles.progressContent}>
                    <View style={styles.progressTopRow}>
                      <Text style={[styles.progressLabel, { color: progressColor }]}>
                        Progress
                      </Text>
                      <Text style={[styles.progressCount, { color: progressColor }]}>
                        {completed_item_count}/{total_item_count} Items
                      </Text>
                    </View>
                    <View style={styles.progressBarBg}>
                      <View
                        style={[
                          styles.progressBarFill,
                          {
                            width: `${progressPercent}%`,
                            backgroundColor: progressColor,
                          },
                        ]}
                      />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

export default CC_ActiveCount;

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
  searchContainer: {
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 20,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInputContainer: {
    width: 331,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9E4EE',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    flex: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Mulish',
    fontSize: 14,
    color: '#242424',
    padding: 0,
  },
  filterButton: {
    width: 35,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9E4EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterIcon: {
    opacity: 1,
  },
  assignedTaskContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  assignedTaskTitle: {
    fontFamily: 'Mulish-Bold',
    fontWeight: '700',
    fontSize: 14,
    lineHeight: 14,
    letterSpacing: 0,
    color: '#233E55',
  },
  cardList: {
    paddingHorizontal: 20,
  },
  card: {
    width: '100%',
    minHeight: 130,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D9E4EE',
    padding: 14,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  countName: {
    fontFamily: 'Mulish-Bold',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 14,
    letterSpacing: 0,
    color: '#233E55',
    flex: 1,
  },
  ccCodeContainer: {
    marginBottom: 13,
  },
  ccCode: {
    fontFamily: 'Mulish-SemiBold',
    fontWeight: '600',
    fontSize: 10,
    lineHeight: 10,
    letterSpacing: 0,
    color: '#595A5C',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaIcon: {
    marginRight: 4,
  },
  metaText: {
    fontFamily: 'Mulish-Bold',
    fontWeight: '700',
    fontSize: 12,
    lineHeight: 12,
    letterSpacing: 0,
    color: '#595A5C',
    paddingRight: 3,
  },
  spacer: {
    width: 22,
  },
  progressWrapper: {
    width: 338,
    height: 44,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    marginTop: 8,
  },
  progressWrapperBg: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.23,
    borderRadius: 10,
  },
  progressContent: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  progressTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressLabel: {
    fontFamily: 'Mulish',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 0,
  },
  progressCount: {
    fontFamily: 'Mulish-Bold',
    fontSize: 12,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#ECF1F7',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusBadgeText: {
    fontFamily: 'Mulish-Bold',
    fontSize: 12,
    fontWeight: '700',
  },
});