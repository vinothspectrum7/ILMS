import React, { useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';

import Inv_HeaderComponent from '../../components/inventory/Inv_HeaderComponent';
import { useReceivingStore } from '../../store/receivingStore';
import { useCycleCountStore } from '../../store/cycleCountStore';
import ExpandDownIcon from '../../assets/icons/CycleCount_Icons/ExpandDownIcon.svg';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import WhiteLocation from '../../assets/icons/CycleCount_Icons/WhiteLocation.svg';
import WhiteDownload from '../../assets/icons/CycleCount_Icons/WhiteDownload.svg';
import Email from '../../assets/icons/CycleCount_Icons/Email.svg';
import PrintIcon from '../../assets/icons/CycleCount_Icons/Print.svg';


const CC_ViewReportScreen = () => {
    const navigation = useNavigation();
    const { OrgData } = useReceivingStore();
    const { viewReportData } = useCycleCountStore();

    const onBack = useCallback(() => navigation.goBack(), [navigation]);
    const onMenu = useCallback(() => navigation.toggleDrawer?.(), [navigation]);

    console.log('View Report Screen Data:', viewReportData);

    const getBarWidth = (value) => {
        const numValue = parseInt(value || 0);
        return (numValue / 10) * 90;
    };

    const topVariances = viewReportData?.top_total_variances || [];

    const [isSummaryExpanded, setIsSummaryExpanded] = React.useState(true);
    const [isVarianceExpanded, setIsVarianceExpanded] = React.useState(true);
    const generatePdf = async () => {
        try {
            const html = `
            <html>
            <head>
                <style>
                    body { font-family: Arial; padding: 16px; }
                    h1 { color: #233E55; }
                    h2 { margin-top: 20px; }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 10px;
                    }
                    th, td {
                        border: 1px solid #ccc;
                        padding: 8px;
                        font-size: 12px;
                    }
                    th {
                        background-color: #ECF1F7;
                    }
                </style>
            </head>
            <body>
                <h1>Count History Report</h1>
                <p><strong>Count Name:</strong> ${viewReportData?.count_name || '--'}</p>
                <p><strong>Location:</strong> ${viewReportData?.location || '--'}</p>
            </body>
            </html>
            `;

            const file = await RNHTMLtoPDF.convert({
                html,
                fileName: `Count_Report_${Date.now()}`,
                base64: false,
                directory: 'Documents',
            });

            console.log('PDF generated at:', file.filePath);
            alert(`PDF saved at:\n${file.filePath}`);


            await Share.open({
                url: `file://${file.filePath}`,
                type: 'application/pdf',
            });

        } catch (error) {
            console.log('PDF generation error:', error);
        }
    };

    return (
        <View style={styles.container}>
            <Inv_HeaderComponent
                organizationName={OrgData?.selectedOrgCode}
                screenTitle="Count History"
                onBack={onBack}
                onMenu={onMenu}
            />

            <ScrollView
                style={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <LinearGradient
                    colors={['#5D768B', '#233E55']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.countNameCard}
                >
                    <View style={styles.cardRow}>
                        <View style={styles.leftSection}>
                            <Text style={styles.countNameText}>
                                {viewReportData?.count_name || '--'}
                            </Text>
                        </View>
                        <View style={styles.locationRow}>
  <WhiteLocation width={12} height={12} />
  <Text style={styles.locationText}>
    {viewReportData?.location || '--'}
  </Text>
</View>

                    </View>
                </LinearGradient>

                <View style={styles.summaryCard}>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => setIsSummaryExpanded(prev => !prev)}
                        style={styles.summaryHeader}
                    >
                        <Text style={styles.summaryHeaderText}>Summary Statistics</Text>
                        <ExpandDownIcon
                            style={{
                                transform: [{ rotate: isSummaryExpanded ? '180deg' : '0deg' }],
                            }}
                        />
                    </TouchableOpacity>

                    {isSummaryExpanded && (
                        <View style={styles.statisticsGrid}>

                            <View style={styles.statColumn}>
                                <Text style={styles.statLabel}>Total Items</Text>
                                <Text style={styles.statValue}>
                                    {viewReportData?.summary?.total_items || '--'}
                                </Text>
                            </View>

                            <View style={styles.statColumn}>
                                <Text style={styles.statLabel}>Items Matched</Text>
                                <Text style={[styles.statValue, styles.matchedText]}>
                                    {viewReportData?.summary?.items_matched || '--'}
                                </Text>
                            </View>


                            <View style={styles.statColumn}>
                                <Text style={styles.statLabel}>Variances</Text>
                                <Text style={[styles.statValue, styles.varianceText]}>
                                    {viewReportData?.summary?.total_variances || '--'}
                                </Text>
                            </View>

                            <View style={styles.statColumn}>
                                <Text style={styles.statLabel}>Accuracy</Text>
                                <Text style={[styles.statValue, styles.accuracyText]}>
                                    {viewReportData?.summary?.accuracy_percentage || '--'}
                                </Text>
                            </View>

                            <View style={styles.statColumn}>
                                <Text style={styles.statLabel}>Value Variance</Text>
                                <Text style={[styles.statValue, styles.valueVarianceText]}>
                                    {viewReportData?.summary?.value_variance || '--'}
                                </Text>
                            </View>

                            <View style={styles.statColumn}>
                                <Text style={styles.statLabel}>Duration</Text>
                                <Text style={styles.statValue}>
                                    {viewReportData?.summary?.duration || '--'}
                                </Text>
                            </View>
                        </View>
                    )}
                </View>

                <View style={styles.varianceCard}>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => setIsVarianceExpanded(prev => !prev)}
                        style={styles.varianceHeader}
                    >
                        <Text style={styles.varianceHeaderText}>Variance Breakdown</Text>
                        <ExpandDownIcon
                            style={{
                                transform: [{ rotate: isVarianceExpanded ? '180deg' : '0deg' }],
                            }}
                        />
                    </TouchableOpacity>

                    {isVarianceExpanded && (
                        <View style={styles.breakdownContainer}>
                            <View style={styles.breakdownRow}>
                                <Text style={styles.breakdownLabel}>Data Entry Error</Text>
                                <View style={styles.barWrapper}>
                                    <View style={styles.barContainer}>
                                        <View
                                            style={[
                                                styles.varianceBar,
                                                { width: getBarWidth(viewReportData?.variance_breakdown?.data_entry_error) }
                                            ]}
                                        />
                                    </View>
                                    <Text style={styles.breakdownValue}>
                                        {viewReportData?.variance_breakdown?.data_entry_error || '0'}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.breakdownRow}>
                                <Text style={styles.breakdownLabel}>Physical Count Error</Text>
                                <View style={styles.barWrapper}>
                                    <View style={styles.barContainer}>
                                        <View
                                            style={[
                                                styles.varianceBar,
                                                { width: getBarWidth(viewReportData?.variance_breakdown?.physical_count_error) }
                                            ]}
                                        />
                                    </View>
                                    <Text style={styles.breakdownValue}>
                                        {viewReportData?.variance_breakdown?.physical_count_error || '0'}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.breakdownRow}>
                                <Text style={styles.breakdownLabel}>Damaged/Spoiled</Text>
                                <View style={styles.barWrapper}>
                                    <View style={styles.barContainer}>
                                        <View
                                            style={[
                                                styles.varianceBar,
                                                { width: getBarWidth(viewReportData?.variance_breakdown?.damaged_spoiled) }
                                            ]}
                                        />
                                    </View>
                                    <Text style={styles.breakdownValue}>
                                        {viewReportData?.variance_breakdown?.damaged_spoiled || '0'}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    )}
                </View>

                <View style={styles.topVariancesCard}>
                    <View style={styles.topVariancesHeader}>
                        <Text style={styles.topVariancesHeaderText}>Top Variances</Text>
                    </View>

                    <View style={styles.tableHeaderContainer}>
                        <View style={styles.tableHeader}>
                            <Text style={styles.tableHeaderLabel}>Item Code</Text>
                            <Text style={styles.tableHeaderLabel}>Variances</Text>
                        </View>
                        <View style={styles.headerDivider} />
                    </View>

                    <View style={styles.variancesList}>
                        {topVariances.map((item, index) => (
                            <View key={index} style={styles.varianceRow}>
                                <Text style={styles.itemCodeValue}>{item.item_code || '--'}</Text>
                                <Text style={styles.varianceAmountValue}>
                                    {item.variance || '--'}
                                </Text>
                            </View>
                        ))}

                        {topVariances.length === 0 && (
                            <View style={styles.varianceRow}>
                                <Text style={styles.itemCodeValue}>--</Text>
                                <Text style={styles.varianceAmountValue}>--</Text>
                            </View>
                        )}
                    </View>
                </View>

                <View style={styles.actionButtonsContainer}>
                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={styles.primaryButtonTouchable}
                            onPress={generatePdf}
                        >

                           <LinearGradient
  colors={['#5D768B', '#233E55']}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 0 }}
  style={styles.primaryButtonGradient}
>
  <View style={styles.buttonContentRow}>
    <WhiteDownload width={14} height={14} />
    <Text style={styles.primaryButtonText}>PDF</Text>
  </View>
</LinearGradient>

                        </TouchableOpacity>

                        <TouchableOpacity activeOpacity={0.8} style={styles.primaryButtonTouchable}>
                           <LinearGradient
  colors={['#5D768B', '#233E55']}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 0 }}
  style={styles.primaryButtonGradient}
>
  <View style={styles.buttonContentRow}>
    <WhiteDownload width={14} height={14} />
    <Text style={styles.primaryButtonText}>Excel</Text>
  </View>
</LinearGradient>

                        </TouchableOpacity>
                    </View>

                    <View style={styles.buttonRow}>
                       <TouchableOpacity activeOpacity={0.8} style={styles.secondaryButton}>
  <View style={styles.buttonContentRow}>
    <Email width={14} height={14} />
    <Text style={styles.secondaryButtonText}>Email</Text>
  </View>
</TouchableOpacity>

<TouchableOpacity activeOpacity={0.8} style={styles.secondaryButton}>
  <View style={styles.buttonContentRow}>
    <PrintIcon width={14} height={14} />
    <Text style={styles.secondaryButtonText}>Print</Text>
  </View>
</TouchableOpacity>

                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

export default CC_ViewReportScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F9FB',
    },
    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    countNameCard: {
        width: 373,
        height: 47,
        marginTop: 16,
        marginLeft: 20,
        borderRadius: 12,
        justifyContent: 'center',
        paddingHorizontal: 16,
    },
    countNameText: {
        fontFamily: 'Mulish',
        fontSize: 14,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    cardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    leftSection: {
        flex: 1,
    },
    locationText: {
        fontFamily: 'Mulish',
        fontSize: 10,
        fontWeight: '600',
        color: '#FFFFFF',
        textAlign: 'right',
        marginLeft: 4,
    },
    summaryCard: {
        width: 372,
        marginTop: 20,
        marginLeft: 20,
        borderWidth: 1,
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
        borderColor: '#D9E4EE',
        overflow: 'hidden',
    },
    summaryHeader: {
        width: 372,
        height: 32,
        backgroundColor: '#ECF1F7',
        borderTopLeftRadius: 7,
        borderTopRightRadius: 7,
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    summaryHeaderText: {
        fontFamily: 'Mulish',
        fontWeight: '700',
        fontSize: 12,
        color: '#242424',
        lineHeight: 12,
    },
    statisticsGrid: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 16,
    },
    statColumn: {
        width: '33.33%',
        height: 40,
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    statLabel: {
        fontFamily: 'Mulish',
        fontSize: 10,
        fontWeight: '600',
        color: '#9D9FA3',
        marginBottom: 2,
    },
    statValue: {
        fontFamily: 'Mulish',
        fontSize: 14,
        fontWeight: '700',
        color: '#242424',
    },
    varianceText: {
        color: '#E74C3C',
    },
    accuracyText: {
        color: '#168035',
    },
    valueVarianceText: {
        color: '#E74C3C',
    },
    matchedText: {
        color: '#168035',
    },
    varianceCard: {
        width: 372,
        marginTop: 20,
        marginLeft: 20,
        borderWidth: 1,
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
        borderColor: '#D9E4EE',
        overflow: 'hidden',
    },
    varianceHeader: {
        width: 372,
        height: 32,
        backgroundColor: '#ECF1F7',
        borderTopLeftRadius: 7,
        borderTopRightRadius: 7,
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    varianceHeaderText: {
        fontFamily: 'Mulish',
        fontWeight: '700',
        fontSize: 12,
        color: '#242424',
        lineHeight: 12,
    },
    breakdownContainer: {
        padding: 16,
    },
    breakdownRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 24,
        marginBottom: 0,

    },
    breakdownLabel: {
        fontFamily: 'Mulish',
        fontSize: 12,
        fontWeight: '600',
        color: '#242424',
        width: 120,
    },
    barWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        width: 120,
    },
    barContainer: {
        width: 90,
        height: 7,
        backgroundColor: '#F0F0F0',
        borderRadius: 8,
        overflow: 'hidden',
        marginRight: 8,
    },
    varianceBar: {
        height: '100%',
        backgroundColor: '#DA1E28',
        borderRadius: 8,
    },
    breakdownValue: {
        fontFamily: 'Mulish',
        fontSize: 12,
        fontWeight: '700',
        color: '#242424',
        width: 20,
        textAlign: 'right',
    },
    topVariancesCard: {
        width: 372,
        marginTop: 20,
        marginLeft: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
        borderColor: '#D9E4EE',
        overflow: 'hidden',
    },
    topVariancesHeader: {
        width: 372,
        height: 32,
        borderTopLeftRadius: 7,
        borderTopRightRadius: 7,
        justifyContent: 'center',
        paddingHorizontal: 16,
    },
    topVariancesHeaderText: {
        fontFamily: 'Mulish',
        fontWeight: '700',
        fontSize: 14,
        color: '#242424',
        lineHeight: 14,
    },
    tableHeaderContainer: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 8,
    },
    tableHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    tableHeaderLabel: {
        fontFamily: 'Mulish',
        fontSize: 10,
        fontWeight: '600',
        color: '#595A5C',
    },
    headerDivider: {
        width: 342,
        height: 1,
        backgroundColor: '#CCCED2',
        marginTop: 8,
        alignSelf: 'center',
    },
    variancesList: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    varianceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 22,
    },
    itemCodeValue: {
        fontFamily: 'Mulish',
        fontSize: 12,
        fontWeight: '700',
        color: '#242424',
    },
    varianceAmountValue: {
        fontFamily: 'Mulish',
        fontSize: 12,
        fontWeight: '700',
        color: '#DA1E28',
    },
    actionButtonsContainer: {
        marginTop: 12,
        marginLeft: 20,
        marginBottom: 30,
        width: 372,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    primaryButtonTouchable: {
        width: 180,
        height: 35,
        borderRadius: 8,
        overflow: 'hidden',
    },
    primaryButtonGradient: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    primaryButtonText: {
        fontFamily: 'Mulish',
        fontSize: 12,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    secondaryButton: {
        width: 180,
        height: 35,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ECF1F7',
        elevation: 2,

    },
    secondaryButtonText: {
        fontFamily: 'Mulish',
        fontSize: 12,
        fontWeight: '700',
        color: '#5D768B',
    },
    locationRow: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6,
},
buttonContentRow: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
},


});