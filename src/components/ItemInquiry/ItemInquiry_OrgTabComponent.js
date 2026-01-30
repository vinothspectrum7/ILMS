import React from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { Item_Inquiry_Mock_Data } from '../../data/ItemInquiryMockData';
import GreenOutlineTick from '../../assets/icons/CycleCount_Icons/GreenOutlineTick.svg';
import GreyEyeIcon from '../../assets/icons/CycleCount_Icons/GreyEyeIcon.svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BASE_WIDTH = 375;
const scale = size => (SCREEN_WIDTH / BASE_WIDTH) * size;
const ms = (size, factor = 0.35) => size + (scale(size) - size) * factor;

const OrgTabComponent = ({ itemData }) => {
    const orgData = itemData?.organization || Item_Inquiry_Mock_Data[0].organization;

    return (
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.container}>
                <View style={styles.assignmentsContainer}>
                    <Text style={styles.assignmentsTitle}>Item Assignments</Text>
                    <Text style={styles.orgDescription}>{orgData.desc}</Text>
                </View>

                {orgData.organizations.map((org) => (
                    <View key={org.id} style={styles.cardWrapper}>
                        <View style={styles.orgCard}>
                            <View style={styles.orgHeader}>
                                <View style={styles.orgInfo}>
                                    <Text style={styles.orgName}>{org.organizationName}</Text>
                                    <View style={styles.spacing} />
                                    <Text style={styles.orgCode}>{org.orgCode}</Text>
                                </View>
                                <View style={styles.statusContainer}>
                                    {Array.isArray(org.status) ? (
                                        org.status.map((statusItem, index) => (
                                            <View key={index} style={[
                                                styles.statusBadge,
                                                statusItem === 'Primary' ? styles.primaryBadge : styles.activeBadge
                                            ]}>
                                                <Text style={styles.statusText}>{statusItem}</Text>
                                            </View>
                                        ))
                                    ) : (
                                        <View style={[
                                            styles.statusBadge,
                                            org.status === 'Primary' ? styles.primaryBadge : styles.activeBadge
                                        ]}>
                                            <Text style={styles.statusText}>{org.status}</Text>
                                        </View>
                                    )}
                                </View>
                            </View>

                            <View style={styles.attributesContainer}>
                                {org.attributes.map((attr, index) => (
                                    <View key={index} style={styles.attributeBadge}>
                                        <GreenOutlineTick width={ms(12)} height={ms(12)} />
                                        <Text style={styles.attributeText} numberOfLines={1}>
                                            {attr}
                                        </Text>
                                    </View>
                                ))}
                            </View>

                            <View style={styles.detailsRow}>
                                <View style={styles.detailBadge}>
                                    <Text style={styles.detailLabel}>Lead Time</Text>
                                    <Text style={styles.detailValue}>{org.leadTime}</Text>
                                </View>

                                <View style={styles.detailBadge}>
                                    <Text style={styles.detailLabel}>Safety Stock</Text>
                                    <Text style={styles.detailValue}>{org.safetyStock}</Text>
                                </View>

                                <View style={styles.detailBadge}>
                                    <Text style={styles.detailLabel}>Min / Max</Text>
                                    <Text style={styles.detailValue}>
                                        {org.minQuantity}/{org.maxQuantity}
                                    </Text>
                                </View>
                            </View>
                        </View>
                        {org.viewDetails && (
                            <View style={styles.cardFooter}>
                                <View style={styles.viewDetailsRow}>
                                    <GreyEyeIcon width={ms(14)} height={ms(14)} />
                                    <Text style={styles.viewDetailsText}>View Details</Text>
                                </View>
                            </View>
                        )}
                    </View>
                ))}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollContainer: {
        flex: 1,
    },
    container: {
        width: '100%',
        paddingHorizontal: ms(12),
        marginTop: ms(16),
        paddingBottom: ms(20),
    },
    assignmentsContainer: {
        width: ms(338),
        minHeight: ms(52),
        borderRadius: 8,
        borderWidth: 1,
        backgroundColor: '#E5F6FF',
        borderColor: '#D5DFFF',
        padding: ms(12),
        alignSelf: 'center',
        marginBottom: ms(16),
    },
    assignmentsTitle: {
        fontFamily: 'Mulish',
        fontSize: ms(12),
        fontWeight: '700',
        lineHeight: ms(12),
        color: '#233E55',
        marginBottom: ms(4),
    },
    orgDescription: {
        fontFamily: 'Mulish',
        fontSize: ms(12),
        fontWeight: '400',
        color: '#242424',
    },
    cardWrapper: {
        width: ms(338),
        borderRadius: 8,
        borderWidth: 0.5,
        borderColor: '#D9E4EE',
        marginBottom: ms(12),
        alignSelf: 'center',
        overflow: 'hidden',
    },
    orgCard: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        padding: ms(12),
    },
    orgHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: ms(12),
    },
    orgInfo: {
        flex: 1,
    },
    orgName: {
        fontFamily: 'Mulish',
        fontSize: ms(12),
        fontWeight: '700',
        lineHeight: ms(12),
        color: '#242424',
    },
    spacing: {
        height: ms(4),
    },
    orgCode: {
        fontFamily: 'Mulish',
        fontSize: ms(10),
        fontWeight: '600',
        lineHeight: ms(10),
        color: '#595A5C',
    },
    statusContainer: {
        flexDirection: 'row',
        marginLeft: ms(8),
        gap: ms(4),
    },
    statusBadge: {
        width: ms(41),
        height: ms(18),
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeBadge: {
        backgroundColor: '#15D54D',
    },
    primaryBadge: {
        backgroundColor: '#145DA0',
    },
    statusText: {
        fontFamily: 'Mulish',
        fontSize: ms(10),
        fontWeight: '600',
        color: '#FFFFFF',
    },
    attributesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: ms(12),
        gap: ms(6),
    },
    attributeBadge: {
        minWidth: ms(100),
        maxWidth: ms(100),
        height: ms(22),
        borderRadius: 4,
        backgroundColor: '#EEF6FF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: ms(8),
        gap: ms(3),
    },
    attributeText: {
        fontFamily: 'Mulish',
        fontSize: ms(10),
        fontWeight: '600',
        lineHeight: ms(10),
        color: '#168035',
        flexShrink: 1,
    },
    detailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: ms(2),
    },
    detailBadge: {
        width: ms(100),
        height: ms(22),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },

    detailItem: {
        width: ms(100),
        alignItems: 'center',
        justifyContent: 'center',
    },
    detailLabel: {
        fontFamily: 'Mulish',
        fontSize: ms(9),
        fontWeight: '600',
        color: '#595A5C',
        marginRight: ms(3),
        maxWidth: '55%',
    },
    detailValue: {
        fontFamily: 'Mulish',
        fontSize: ms(10),
        fontWeight: '700',
        color: '#242424',
        maxWidth: '45%',
    },
    cardFooter: {
        width: ms(338),
        height: ms(30),
        backgroundColor: '#ECF1F7',
        borderBottomRightRadius: 8,
        borderBottomLeftRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },

    viewDetailsText: {
        fontFamily: 'Mulish',
        fontSize: ms(10),
        fontWeight: '700',
        lineHeight: ms(10),
        color: '#5D768B',
    },
    viewDetailsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: ms(6),
    },

});

export default OrgTabComponent;