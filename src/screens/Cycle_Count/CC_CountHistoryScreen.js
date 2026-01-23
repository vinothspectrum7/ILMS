import React, { useCallback, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Dimensions,
    TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import Inv_HeaderComponent from '../../components/inventory/Inv_HeaderComponent';
import { useReceivingStore } from '../../store/receivingStore';
import FilterIcon from '../../assets/icons/CycleCount_Icons/FilterIcon.svg';
import { MOCK_CYCLE_COUNT_HISTORY } from '../../data/CycleCountMockData';
import GreenItemBox from '../../assets/icons/CycleCount_Icons/GreenItemBox.svg';
import Accuracy from '../../assets/icons/CycleCount_Icons/Accuracy.svg';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');
const TABS = ['All', 'Pending', 'In Progress', 'Completed'];

const CC_CountHistoryScreen = () => {
    const navigation = useNavigation();
    const { OrgData } = useReceivingStore();

    const [activeTab, setActiveTab] = useState('All');

    const onBack = useCallback(() => navigation.goBack(), [navigation]);
    const onMenu = useCallback(() => navigation.toggleDrawer?.(), [navigation]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const filteredHistory = MOCK_CYCLE_COUNT_HISTORY.filter(item => {
        if (activeTab === 'All') return true;
        if (activeTab === 'Pending') return item.cc_status === 'Pending';
        if (activeTab === 'In Progress') return item.cc_status === 'InProgress';
        if (activeTab === 'Completed') return item.cc_status === 'Completed';
        return true;
    });

    return (
        <View style={styles.container}>
            <Inv_HeaderComponent
                organizationName={OrgData?.selectedOrgCode}
                screenTitle="Count History"
                onBack={onBack}
                onMenu={onMenu}
                showCartIcon={false}
            />

            <View style={styles.tabContainer}>
                <View style={styles.tabsRow}>
                    {TABS.map(tab => {
                        const isActive = activeTab === tab;
                        return (
                            <View key={tab} style={styles.tabItem}>
                                <Text
                                    onPress={() => setActiveTab(tab)}
                                    style={[
                                        styles.tabText,
                                        isActive && styles.activeTabText,
                                    ]}
                                >
                                    {tab}
                                </Text>
                                {isActive && <View style={styles.activeIndicator} />}
                            </View>
                        );
                    })}
                </View>

                <View style={styles.bottomDivider} />

                <View style={styles.filterRow}>
                    <TouchableOpacity style={styles.filterButton}>
                        <FilterIcon width={14} height={14} fill="#595A5C" />
                        <Text style={styles.filterText}>Filter</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {filteredHistory.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyTitle}>No History Available</Text>
                        <Text style={styles.emptySubText}>
                            Completed cycle counts will appear here
                        </Text>
                    </View>
                ) : (
                    filteredHistory.map(item => (
                        <View key={item.id} style={styles.historyCard}>
                            <View style={styles.cardContent}>
                                <View style={styles.cardHeader}>
                                    <Text style={styles.countName}>{item.count_name}</Text>
                                    <View style={[
                                        styles.statusBadge,
                                        item.cc_status === 'Completed' ? styles.completedStatus :
                                            item.cc_status === 'InProgress' ? styles.inProgressStatus :
                                                item.cc_status === 'Pending' ? styles.pendingStatus :
                                                    styles.completedStatus
                                    ]}>
                                        <Text style={[
                                            styles.statusText,
                                            item.cc_status === 'Completed' ? styles.completedText :
                                                item.cc_status === 'InProgress' ? styles.inProgressText :
                                                    item.cc_status === 'Pending' ? styles.pendingText :
                                                        styles.completedText
                                        ]}>{item.cc_status}</Text>
                                    </View>
                                </View>

                                <View style={styles.cardSubHeader}>
                                    <Text style={styles.subInventoryText}>
                                        {item.sub_inventory.replace('_', ' ')}
                                    </Text>
                                    <Text style={styles.dateText}>
                                        Completed: {formatDate(item.completed_date)}
                                    </Text>
                                </View>

                                <View style={styles.statsContainer}>
                                    <View style={[styles.statItem, styles.itemsStat]}>
                                        <View style={styles.iconContainer}>
                                            <GreenItemBox width={12} height={12} fill="#168035" />
                                        </View>
                                        <View style={styles.statTextContainer}>
                                            <Text style={[styles.statLabel, styles.itemsLabel]}>Items</Text>
                                            <Text style={[styles.statValue, styles.itemsValue]}>{item.summary.total_items}</Text>
                                        </View>
                                    </View>

                                    <View style={[styles.statItem, styles.variancesStat]}>
                                        <View style={styles.iconContainer}>
                                        </View>
                                        <View style={styles.statTextContainer}>
                                            <Text style={[styles.statLabel, styles.variancesLabel]}>Variances</Text>
                                            <Text style={[styles.statValue, styles.variancesValue]}>{item.summary.total_variances}</Text>
                                        </View>
                                    </View>

                                    <View style={[styles.statItem, styles.accuracyStat]}>
                                        <View style={styles.iconContainer}>
                                            <Accuracy width={12} height={12} fill="#033EFF" />
                                        </View>
                                        <View style={styles.statTextContainer}>
                                            <Text style={[styles.statLabel, styles.accuracyLabel]}>Accuracy</Text>
                                            <Text style={[styles.statValue, styles.accuracyValue]}>{item.summary.accuracy_percentage}%</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.cardFooter}>
                                <TouchableOpacity
                                    style={[styles.footerButton, styles.exportButton]}
                                    disabled={!item.actions.can_export}
                                >
                                    <Text style={styles.exportButtonText}>Export</Text>
                                </TouchableOpacity>


                                <LinearGradient
                                    colors={['#5D768B', '#233E55']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={[styles.footerButton, styles.viewReportButton]}
                                >
                                    <TouchableOpacity
                                        style={styles.gradientTouchable}
                                        disabled={!item.actions.can_view_report}
                                        onPress={() => console.log('View Report pressed')}
                                    >
                                        <Text style={styles.viewReportButtonText}>View Report</Text>
                                    </TouchableOpacity>
                                </LinearGradient>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>
        </View>
    );
};

export default CC_CountHistoryScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F9FB',
    },
    content: {
        padding: 16,
        paddingBottom: 32,
    },
    emptyState: {
        marginTop: 80,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyTitle: {
        fontFamily: 'Mulish',
        fontSize: 16,
        fontWeight: '700',
        color: '#233E55',
        marginBottom: 6,
    },
    emptySubText: {
        fontFamily: 'Mulish',
        fontSize: 14,
        color: '#9D9FA3',
        textAlign: 'center',
    },
    tabContainer: {
        backgroundColor: '#F7F9FB',
        paddingTop: 22,
    },
    tabsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 12,
    },
    tabItem: {
        alignItems: 'center',
        paddingBottom: 12,
    },
    tabText: {
        fontFamily: 'Mulish',
        fontSize: 14,
        fontWeight: '600',
        color: '#9D9FA3',
        marginBottom: 1,
    },
    activeTabText: {
        color: '#233E55',
        fontWeight: '700',
    },
    activeIndicator: {
        position: 'absolute',
        bottom: 0,
        width: 65,
        height: 3,
        backgroundColor: '#233E55',
        borderRadius: 4,
    },
    bottomDivider: {
        width: width,
        borderWidth: 1,
        borderColor: '#7392AA',
    },
    filterRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingHorizontal: 16,
        paddingTop: 12,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#D9E4EE',
        gap: 8,
        marginBottom: 14
    },
    filterText: {
        fontFamily: 'Mulish',
        fontWeight: '700',
        fontSize: 12,
        color: '#595A5C',
    },
    historyCard: {
        width: 373,
        height: 165,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E1E3E5',
        backgroundColor: '#FFFFFF',
        marginBottom: 16,
        overflow: 'hidden',
    },
    cardContent: {
        padding: 16,
        paddingBottom: 0,
        flex: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    countName: {
        fontFamily: 'Mulish',
        fontSize: 14,
        fontWeight: '700',
        color: '#242424',
        flex: 1,
    },
    statusBadge: {
        width: 72,
        height: 21,
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 4,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    statusText: {
        fontFamily: 'Mulish',
        fontSize: 10,
        fontWeight: '700',
        lineHeight: 10,
        textTransform: 'capitalize',
    },
    completedText: {
        color: '#168035',
    },
    inProgressText: {
        color: '#033EFF',
    },
    pendingText: {
        color: '#F06000',
    },
    cardSubHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    subInventoryText: {
        fontFamily: 'Mulish',
        fontSize: 10,
        fontWeight: '600',
        color: '#595A5C',
    },
    dateText: {
        fontFamily: 'Mulish',
        fontSize: 8,
        fontWeight: '600',
        color: '#595A5C',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        gap: 8,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        width: 102,
        height: 34,
        borderRadius: 8,
        justifyContent: 'flex-start',
        paddingHorizontal: 8,
        gap: 6,
    },
    itemsStat: {
        backgroundColor: '#EEFDF8',
    },
    itemsLabel: {
        color: '#168035',
    },
    itemsValue: {
        color: '#168035',
    },
    variancesStat: {
        backgroundColor: '#FFF8EC',
    },
    variancesLabel: {
        color: '#F06000',
    },
    variancesValue: {
        color: '#F06000',
    },
    accuracyStat: {
        backgroundColor: '#D7E8FE',
    },
    accuracyLabel: {
        color: '#033EFF',
    },
    accuracyValue: {
        color: '#033EFF',
    },
    statLabel: {
        fontFamily: 'Mulish',
        fontSize: 8,
        fontWeight: '600',
        lineHeight: 8,
        marginBottom: 2,
    },
    statValue: {
        fontFamily: 'Mulish',
        fontSize: 10,
        fontWeight: '700',
        lineHeight: 10,
    },
    iconContainer: {
        width: 12,
        height: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statTextContainer: {
        flex: 1,
    },
    cardFooter: {
        flexDirection: 'row',
        height: 37,
        width: '100%',
        position: 'absolute',
        bottom: 0,
    },
    footerButton: {
        width: 186,
        height: 37,
        alignItems: 'center',
        justifyContent: 'center',
    },
    exportButton: {
        backgroundColor: '#ECF1F7',
        borderBottomLeftRadius: 8,
    },
    viewReportButton: {
        borderBottomRightRadius: 8,
        overflow: 'hidden',
    },
    gradientTouchable: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    exportButtonText: {
        fontFamily: 'Mulish',
        fontSize: 14,
        fontWeight: '600',
        color: '#5D768B',
    },
    viewReportButtonText: {
        fontFamily: 'Mulish',
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    completedStatus: {
        backgroundColor: '#EEFDF8',
    },
    inProgressStatus: {
        backgroundColor: '#D7E8FE',
    },
    pendingStatus: {
        backgroundColor: '#FFF8EC',
    },
});