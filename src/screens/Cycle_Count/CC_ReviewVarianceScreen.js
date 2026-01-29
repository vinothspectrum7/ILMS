import React, { useCallback, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import CC_HeaderComponent from '../../components/Cycle_Count/CC_HeaderComponent';
import { useReceivingStore } from '../../store/receivingStore';
import { MOCK_CC_REVIEW_VARIANCE } from '../../data/CycleCountMockData';
import GreenTickIcon from '../../assets/icons/Ship_Icons/GreenTickIcon.svg';
import RecountIcon from '../../assets/icons/CycleCount_Icons/RecountIcon.svg';
import AdjustIcon from '../../assets/icons/CycleCount_Icons/AdjustIcon.svg';
import FooterButtonsComponent from '../../components/FooterButtonsComponent'; 

const CC_ReviewVarianceScreen = () => {
    const navigation = useNavigation();
    const { OrgData } = useReceivingStore();

    const [activeTab, setActiveTab] = useState('All');
    const TABS = ['All', 'Storages', 'Overages'];

    const onBack = useCallback(() => navigation.goBack(), [navigation]);
    const onMenu = useCallback(() => navigation.toggleDrawer?.(), [navigation]);

    const filteredData = MOCK_CC_REVIEW_VARIANCE.filter(item => {
        if (activeTab === 'All') return true;
        if (activeTab === 'Storages') return item.item_status === 'storages';
        if (activeTab === 'Overages') return item.item_status === 'overages';
        return true;
    });

    const handleRequestApproval = () => {
        console.log('Request Approval pressed');
    };

    const handleAcceptAll = () => {
        console.log('Accept All pressed');
    };

    return (
        <View style={styles.container}>
            <CC_HeaderComponent
                organizationName={OrgData?.selectedOrgCode}
                screenTitle="Review Variances"
                onBack={onBack}
                onMenu={onMenu}
                showCartIcon={false}
                navRowStyle={{ backgroundColor: '#233E55' }}
            />

            <View style={styles.headerBgExtension}>
                <View style={styles.statsRow}>
                    <View style={styles.smallCard}>
                        <Text style={styles.cardLabel}>Variances</Text>
                        <Text style={styles.cardValue}>34</Text>
                    </View>
                    <View style={styles.bigCard}>
                        <Text style={styles.cardLabel}>Value Impact</Text>
                        <Text style={styles.valueImpact}>$7,368</Text>
                    </View>
                    <View style={styles.smallCard}>
                        <Text style={styles.cardLabel}>Matched</Text>
                        <Text style={styles.cardValue}>34</Text>
                    </View>
                </View>
            </View>

            <View style={styles.tabContainer}>
                <View style={styles.tabsRow}>
                    {TABS.map(tab => {
                        const isActive = activeTab === tab;
                        return (
                            <View key={tab} style={styles.tabItem}>
                                <Text
                                    onPress={() => setActiveTab(tab)}
                                    style={[styles.tabText, isActive && styles.activeTabText]}
                                >
                                    {tab}
                                </Text>
                                {isActive && <View style={styles.activeIndicator} />}
                            </View>
                        );
                    })}
                </View>
                <View style={styles.bottomDivider} />
            </View>

            <View style={styles.contentWrapper}>
                <ScrollView contentContainerStyle={styles.cardsContainer}>
                    {filteredData.map(item => (
                        <View key={item.item_code} style={styles.varianceCard}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.itemCode}>{item.item_code}</Text>
                                <Text
                                    style={[
                                        styles.itemStatus,
                                        item.variance_qty < 0 ? styles.shortage : styles.overage,
                                    ]}
                                >
                                    {item.variance_qty < 0 ? 'Shortage' : 'Overage'}
                                </Text>
                            </View>

                            <Text style={styles.itemDesc}>{item.item_desc}</Text>

                            <View style={styles.quantitySection}>
                                <View style={styles.leftColumn}>
                                    <View style={styles.quantityRow}>
                                        <Text style={styles.quantityLabel}>Expected:</Text>
                                        <Text style={styles.quantityValue}>{item.expected_qty} {item.uom}</Text>
                                    </View>
                                    <View style={styles.quantityRow}>
                                        <Text style={styles.quantityLabel}>Variance:</Text>
                                        <Text style={styles.varianceValue}>
                                            {item.variance_qty > 0 ? '+' : ''}{item.variance_qty} Units
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.rightColumn}>
                                    <View style={styles.quantityRow}>
                                        <Text style={styles.quantityLabel}>Counted:</Text>
                                        <Text style={styles.quantityValue}>{item.counted_qty} {item.uom}</Text>
                                    </View>
                                    <View style={styles.quantityRow}>
                                        <Text style={styles.quantityLabel}>Value:</Text>
                                        <Text style={styles.valueAmount}>
                                            ${item.item_value * Math.abs(item.variance_qty)}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.footerButtons}>
                                <TouchableOpacity style={styles.acceptButton}>
                                    <GreenTickIcon width={12} height={12} />
                                    <Text style={styles.acceptButtonText}>Accept</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.recountButton}>
                                    <RecountIcon width={12} height={12} />
                                    <Text style={styles.recountButtonText}>Recount</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.adjustButton}>
                                    <AdjustIcon width={12} height={12} />
                                    <Text style={styles.adjustButtonText}>Adjust</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </ScrollView>
            </View>

            <FooterButtonsComponent
                leftLabel="Request Approval"
                rightLabel="Accept All"
                onLeftPress={handleRequestApproval}
                onRightPress={handleAcceptAll}
                sticky={true}
                showShadow={true}
            />
        </View>
    );
};

export default CC_ReviewVarianceScreen;

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#F5F5F6' 
    },
    contentWrapper: {
        flex: 1,
    },

    headerBgExtension: { 
        backgroundColor: '#233E55', 
        height: 40 
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 21,
        position: 'absolute',
        bottom: -26,
        left: 0,
        right: 0,
        zIndex: 10,
    },
    smallCard: {
        width: 83,
        height: 53,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#595A5C',
        elevation: 9,
    },
    bigCard: {
        width: 181,
        height: 53,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#595A5C',
        elevation: 9,
    },
    cardLabel: {
        fontSize: 10,
        color: '#6B7280',
        fontWeight: '600',
        fontFamily: 'Mulish',
    },
    cardValue: {
        fontSize: 14,
        fontWeight: '700',
        color: '#233E55',
        fontFamily: 'Mulish',
    },
    valueImpact: {
        fontSize: 16,
        fontWeight: '800',
        color: '#E11D48',
        fontFamily: 'Mulish',
    },

    tabContainer: { 
        backgroundColor: '#F5F5F6', 
        marginTop: 40 
    },
    tabsRow: { 
        flexDirection: 'row', 
        justifyContent: 'space-around', 
        paddingHorizontal: 12 
    },
    tabItem: { 
        alignItems: 'center', 
        paddingBottom: 12 
    },
    tabText: {
        fontFamily: 'Mulish',
        fontSize: 14,
        fontWeight: '600',
        color: '#9D9FA3',
        marginBottom: 1
    },
    activeTabText: {
        color: '#233E55',
        fontWeight: '700',
        fontFamily: 'Mulish',
    },
    activeIndicator: {
        position: 'absolute',
        bottom: 0,
        width: 65,
        height: 3,
        backgroundColor: '#233E55',
        borderRadius: 4
    },
    bottomDivider: { 
        width: '100%', 
        borderWidth: 1, 
        borderColor: '#7392AA' 
    },

    cardsContainer: { 
        paddingHorizontal: 20, 
        paddingTop: 20, 
        paddingBottom: 100 
    },
    varianceCard: {
        width: 373,
        height: 135,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#D9E4EE',
        padding: 12,
        marginBottom: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemCode: {
        fontFamily: 'Mulish',
        fontWeight: '700',
        fontSize: 14,
        color: '#242424',
        lineHeight: 14,
    },
    itemStatus: {
        fontSize: 12,
        fontWeight: '700',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        fontFamily: 'Mulish',
    },
    shortage: {
        backgroundColor: '#FFF8EC',
        color: '#F06000',
    },
    overage: {
        backgroundColor: '#D7E8FE',
        color: '#033EFF',
    },
    itemDesc: {
        fontFamily: 'Mulish',
        fontWeight: '700',
        fontSize: 10,
        color: '#242424',
        marginTop: 4,
        lineHeight: 10,
    },

    quantitySection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
        marginBottom: 12,
    },
    leftColumn: {
        flex: 1,
    },
    rightColumn: {
        flex: 1,
        alignItems: 'flex-start',
        marginLeft: 160, 
    },
    quantityRow: {
        flexDirection: 'row',
        marginBottom: 6,
        alignItems: 'center',
    },
    quantityLabel: {
        fontFamily: 'Mulish',
        fontWeight: '600',
        fontSize: 10,
        color: '#595A5C',
        marginRight: 4,
        lineHeight: 10,
    },
    quantityValue: {
        fontFamily: 'Mulish',
        fontWeight: '600',
        fontSize: 10,
        color: '#595A5C',
        lineHeight: 10,
    },
    varianceValue: {
        fontFamily: 'Mulish',
        fontWeight: '600',
        fontSize: 10,
        color: '#DA1E28',
        lineHeight: 10,
    },
    valueAmount: {
        fontFamily: 'Mulish',
        fontWeight: '600',
        fontSize: 10,
        color: '#DA1E28',
        lineHeight: 10,
    },

    footerButtons: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        borderBottomLeftRadius: 7,
        borderBottomRightRadius: 7,
        overflow: 'hidden',
    },
    acceptButton: {
        width: 118,
        height: 33,
        backgroundColor: '#EEFDF8',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        paddingLeft: 12,
    },
    recountButton: {
        width: 136,
        height: 33,
        backgroundColor: '#D7E8FE',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        paddingLeft: 12,
    },
    adjustButton: {
        flex: 1,
        height: 33,
        backgroundColor: '#FFF8EC',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        paddingLeft: 12,
        borderBottomRightRadius: 7,
    },
    acceptButtonText: {
        fontFamily: 'Mulish',
        fontWeight: '700',
        fontSize: 10,
        color: '#168035',
        lineHeight: 10,
        marginLeft: 8,
    },
    recountButtonText: {
        fontFamily: 'Mulish',
        fontWeight: '700',
        fontSize: 10,
        color: '#1E40AF', 
        lineHeight: 10,
        marginLeft: 8, 
    },
    adjustButtonText: {
        fontFamily: 'Mulish',
        fontWeight: '700',
        fontSize: 10,
        color: '#F06000',
        lineHeight: 10,
        marginLeft: 8, 
    },
});