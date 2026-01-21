import React, { useCallback, useState } from 'react';
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
import Inv_HeaderComponent from '../../components/inventory/Inv_HeaderComponent';
import { useReceivingStore } from '../../store/receivingStore';
import { MOCK_ACTIVE_CYCLE_COUNT_LIST } from '../../data/CycleCountMockData';

const { width } = Dimensions.get('window');

const CC_ActiveCount = () => {
  const navigation = useNavigation();
  const { OrgData } = useReceivingStore();

  const onBack = useCallback(() => navigation.goBack(), [navigation]);
  const onMenu = useCallback(() => navigation.toggleDrawer?.(), [navigation]);
  const [searchQuery, setSearchQuery] = useState('');
  const getStatusStyle = (status) => {
  switch (status) {
    case 'In Progress':
      return {
        bg: '#E8F0FF',
        text: '#2563EB',
      };
    case 'Completed':
      return {
        bg: '#E6F9F0',
        text: '#16A34A',
      };
    case 'Open':
    default:
      return {
        bg: '#FFF4E5',
        text: '#F97316',
      };
  }
};

const getProgressPercent = (completed, total) => {
  if (!total) return 0;
  return (Number(completed) / Number(total)) * 100;
};


  return (
    <View style={styles.container}>
      <Inv_HeaderComponent
        organizationName={OrgData?.selectedOrgCode}
        screenTitle="Cycle Counts"
        onBack={onBack}
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
  {MOCK_ACTIVE_CYCLE_COUNT_LIST.map((item) => {
    const statusStyle = getStatusStyle(item.cc_status);
    const progress = getProgressPercent(
      item.completed_CC_count,
      item.total_CC_count
    );

    return (
      <View key={item.id} style={styles.card}>
        {/* Header Row */}
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
                styles.statusText,
                { color: statusStyle.text },
              ]}
            >
              {item.cc_status}
            </Text>
          </View>
        </View>

        {/* CC Code */}
        <Text style={styles.ccCode}>{item.cc_code}</Text>

        {/* Meta Row */}
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>{item.sub_inventory}</Text>
          <Text style={styles.metaDot}>•</Text>
          <Text style={styles.metaText}>{item.schedule_date}</Text>
        </View>

        {/* Progress */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressLabel}>Progress</Text>

          <Text style={styles.progressCount}>
            {item.completed_CC_count}/{item.total_CC_count} Items
          </Text>
        </View>

        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${progress}%` },
            ]}
          />
        </View>
      </View>
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
    backgroundColor: 'transparent', 
  },
  contentArea: {
    paddingHorizontal: 20,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
  },
  placeholderText: {
    fontFamily: 'Mulish',
    fontSize: 14,
    color: '#9D9FA3',
    textAlign: 'center',
  },
  cardList: {
  paddingHorizontal: 20,
},

card: {
  width: '100%',
  height: 157,
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
},

countName: {
  fontFamily: 'Mulish-Bold',
  fontSize: 14,
  color: '#233E55',
  flex: 1,
  marginRight: 10,
},

statusBadge: {
  paddingHorizontal: 10,
  paddingVertical: 4,
  borderRadius: 12,
},

statusText: {
  fontFamily: 'Mulish-Bold',
  fontSize: 12,
},

ccCode: {
  fontFamily: 'Mulish',
  fontSize: 12,
  color: '#6B7280',
  marginTop: 4,
},

metaRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: 6,
},

metaText: {
  fontFamily: 'Mulish',
  fontSize: 12,
  color: '#6B7280',
},

metaDot: {
  marginHorizontal: 6,
  color: '#6B7280',
},

progressContainer: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 14,
},

progressLabel: {
  fontFamily: 'Mulish',
  fontSize: 12,
  color: '#6B7280',
},

progressCount: {
  fontFamily: 'Mulish-Bold',
  fontSize: 12,
  color: '#2563EB',
},

progressBarBg: {
  height: 6,
  backgroundColor: '#E5E7EB',
  borderRadius: 6,
  marginTop: 6,
  overflow: 'hidden',
},

progressBarFill: {
  height: '100%',
  backgroundColor: '#2563EB',
  borderRadius: 6,
},

});