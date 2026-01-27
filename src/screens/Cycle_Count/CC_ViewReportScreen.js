import React, { useCallback, useState } from 'react';
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
import WhiteLocation from '../../assets/icons/CycleCount_Icons/WhiteLocation.svg';
import WhiteDownload from '../../assets/icons/CycleCount_Icons/WhiteDownload.svg';
import Email from '../../assets/icons/CycleCount_Icons/Email.svg';
import PrintIcon from '../../assets/icons/CycleCount_Icons/Print.svg';
import RNPrint from 'react-native-print';

const CC_ViewReportScreen = () => {
    const navigation = useNavigation();
    const { OrgData } = useReceivingStore();
    const { viewReportData } = useCycleCountStore();

    const [isSummaryExpanded, setIsSummaryExpanded] = useState(true);
    const [isVarianceExpanded, setIsVarianceExpanded] = useState(true);

    const topVariances = viewReportData?.top_total_variances || [];

    const onBack = useCallback(() => navigation.goBack(), [navigation]);
    const onMenu = useCallback(() => navigation.toggleDrawer?.(), [navigation]);

    const MAX_VARIANCE_COUNT = 10;

    const getBarWidth = (value) => {
        const safeValue = Number(value) || 0;
        const percentage = Math.min((safeValue / MAX_VARIANCE_COUNT) * 100, 100);
        return `${percentage}%`;
    };

    const buildReportHtml = () => `
  <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <style>
        body { font-family: Arial; background:#F7F9FB; padding:16px; color:#242424 }
        .header { background:linear-gradient(90deg,#5D768B,#233E55); color:#fff;
                  border-radius:12px; padding:12px 16px; margin-bottom:20px }
        .row { display:flex; justify-content:space-between; align-items:center }
        .card { background:#fff; border:1px solid #D9E4EE; border-radius:8px;
                margin-bottom:20px; overflow:hidden }
        .card-h { background:#ECF1F7; padding:8px 16px; font-weight:700; font-size:12px }
        .card-b { padding:16px }
        .grid { display:flex; flex-wrap:wrap }
        .cell { width:33.33%; margin-bottom:12px }
        .label { font-size:10px; color:#9D9FA3; font-weight:600 }
        .value { font-size:14px; font-weight:700 }
        .green { color:#168035 } .red { color:#DA1E28 }

        .bar-wrap { display:flex; align-items:center }
        .bar-bg { width:90px; height:7px; background:#F0F0F0;
                  border-radius:8px; margin-right:8px }
        .bar { height:100%; background:#DA1E28; border-radius:8px }

        table { width:100%; border-collapse:collapse }
        th { font-size:10px; color:#595A5C; border-bottom:1px solid #CCCED2; text-align:left }
        td { font-size:12px; font-weight:700; padding:6px 0 }
        .right { text-align:right }
      </style>
    </head>

    <body>

      <div class="header">
        <div class="row">
          <div>${viewReportData?.count_name || '--'}</div>
          <div>${viewReportData?.location || '--'}</div>
        </div>
      </div>

      <!-- SUMMARY -->
      <div class="card">
        <div class="card-h">Summary Statistics</div>
        <div class="card-b grid">
          <div class="cell"><div class="label">Total Items</div><div class="value">${viewReportData?.summary?.total_items || '--'}</div></div>
          <div class="cell"><div class="label">Items Matched</div><div class="value green">${viewReportData?.summary?.items_matched || '--'}</div></div>
          <div class="cell"><div class="label">Variances</div><div class="value red">${viewReportData?.summary?.total_variances || '--'}</div></div>
          <div class="cell"><div class="label">Accuracy</div><div class="value green">${viewReportData?.summary?.accuracy_percentage || '--'}</div></div>
          <div class="cell"><div class="label">Value Variance</div><div class="value red">${viewReportData?.summary?.value_variance || '--'}</div></div>
          <div class="cell"><div class="label">Duration</div><div class="value">${viewReportData?.summary?.duration || '--'}</div></div>
        </div>
      </div>

      <!-- VARIANCE BREAKDOWN -->
      <div class="card">
        <div class="card-h">Variance Breakdown</div>
        <div class="card-b">
          ${[
            ['Data Entry Error', 'data_entry_error'],
            ['Physical Count Error', 'physical_count_error'],
            ['Damaged / Spoiled', 'damaged_spoiled'],
        ].map(([label, key]) => `
            <div class="row" style="margin-bottom:10px">
              <div>${label}</div>
              <div class="bar-wrap">
                <div class="bar-bg">
                  <div class="bar" style="width:${getBarWidth(viewReportData?.variance_breakdown?.[key])}"></div>
                </div>
                <div>${viewReportData?.variance_breakdown?.[key] || 0}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- TOP VARIANCES -->
      <div class="card">
        <div class="card-h">Top Variances</div>
        <div class="card-b">
          <table>
            <thead><tr><th>Item Code</th><th class="right">Variances</th></tr></thead>
            <tbody>
              ${topVariances.length
            ? topVariances.map(i => `
                      <tr>
                        <td>${i.item_code}</td>
                        <td class="right red">${i.variance}</td>
                      </tr>
                    `).join('')
            : `<tr><td>--</td><td class="right">--</td></tr>`
        }
            </tbody>
          </table>
        </div>
      </div>

    </body>
  </html>
  `;

    const handlePdf = async () => {
        await RNPrint.print({ html: buildReportHtml() });
    };

    const handlePrint = async () => {
        await RNPrint.print({ html: buildReportHtml() });
    };


    // const handleEmail = async () => {
    //     await RNPrint.print({ html: buildReportHtml() });
    //     Alert.alert(
    //         'Email Report',
    //         'To email the report:\n1. Use the print dialog\n2. Choose "Save as PDF"\n3. Then attach the PDF to email'
    //     );
    // };

    // const handleExcel = async () => {
    //     try {
    //         const headers = ['Item Code', 'Variances'];
    //         const rows = viewReportData?.top_total_variances || [];
    //         const csvContent = [
    //             headers.join(','),
    //             ...rows.map(r => `${r.item_code || '--'},${r.variance || 0}`)
    //         ].join('\n');

    //         const path = `${RNFS.DocumentDirectoryPath}/CycleCountReport_${Date.now()}.csv`;
    //         await RNFS.writeFile(path, csvContent, 'utf8');

    //         await Share.open({
    //             url: `file://${path}`,
    //             type: 'text/csv',
    //             title: 'Cycle Count Report',
    //         });

    //         console.log('Excel file created at:', path);

    //     } catch (e) {
    //         console.log('Excel Export Error:', e);
    //     }
    // };



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
                            onPress={handlePdf}
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

                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={styles.primaryButtonTouchable}
                            // onPress={handleExcel}
                        >
                            <LinearGradient
                                colors={['#5D768B', '#233E55']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.primaryButtonGradient}
                            >
                                <View style={styles.buttonContentRow} >
                                    <WhiteDownload width={14} height={14} />
                                    <Text style={styles.primaryButtonText}>Excel</Text>
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.buttonRow}>
                        <TouchableOpacity activeOpacity={0.8} style={styles.secondaryButton}
                            // onPress={handleEmail}
                        >
                            <View style={styles.buttonContentRow}>
                                <Email width={14} height={14} />
                                <Text style={styles.secondaryButtonText}>Email</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={styles.secondaryButton}
                            onPress={handlePrint}
                        >
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
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
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
        padding: 15,
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
        fontSize: 10,
        fontWeight: '600',
        color: '#242424',
        width: 122,
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
        paddingTop: 10,
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
    buttonContentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
});