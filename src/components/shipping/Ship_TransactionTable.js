import React, { useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { SHIPPING_TABLE_DATA } from '../../data/shippingMockData';

function Ship_TransactionTable({ onPickPress, filters }) {
    const filteredData = useMemo(() => {
        console.log('Filtering with:', filters);

        return SHIPPING_TABLE_DATA.filter(item => {
            if (filters?.selectedPickSlip) {
                const filterPickSlip = filters.selectedPickSlip.name?.trim();
                const itemPickSlip = item.pickSlipNo?.trim();

                console.log('Comparing pick slip:', filterPickSlip, 'vs', itemPickSlip);

                if (filterPickSlip && itemPickSlip !== filterPickSlip) {
                    return false;
                }
            }
            if (filters?.selectedStatus) {
                const filterStatus = filters.selectedStatus.name?.trim();
                const itemStatus = item.status?.trim();

                console.log('Comparing status:', filterStatus, 'vs', itemStatus);

                if (filterStatus && itemStatus !== filterStatus) {
                    return false;
                }
            }
            if (filters?.selectedItem) {
                const filterItem = filters.selectedItem.name?.toLowerCase();
                const itemItems = item.items || [];

                console.log('Filtering by item:', filterItem);
                console.log('Item has items:', itemItems);

                const hasMatchingItem = itemItems.some(itemName =>
                    itemName.toLowerCase().includes(filterItem.toLowerCase())
                );

                if (!hasMatchingItem) {
                    return false;
                }
            }
            if (filters?.selectedException) {
                const filterException = filters.selectedException.name?.toLowerCase();
                const itemException = item.exception?.toLowerCase();

                console.log('Comparing exception:', filterException, 'vs', itemException);

                if (filterException && itemException !== filterException) {
                    return false;
                }
            }
            if (filters?.selectedOrganization) {
                const filterOrg = filters.selectedOrganization.name?.trim();
                const itemOrg = item.organization?.trim();

                console.log('Comparing organization:', filterOrg, 'vs', itemOrg);

                if (filterOrg && itemOrg !== filterOrg) {
                    return false;
                }
            }

            return true;
        });
    }, [filters]);

    const handlePickButtonPress = (item) => {
        if (onPickPress) {
            onPickPress(item);
        }
    };

    console.log('Filtered data count:', filteredData.length);

    if (filteredData.length === 0) {
        return (
            <View style={styles.mainContainer}>
                <View style={styles.headerContainer}>
                    <View style={styles.headerRow}>
                        <Text style={[styles.headerText, styles.colDelivery]}>Delivery</Text>
                        <Text style={[styles.headerText, styles.colSales]}>Sales Order No</Text>
                        <Text style={[styles.headerText, styles.colLines]}>Lines / Qty</Text>
                        <Text style={[styles.headerText, styles.colPick]}>Pick Slip No</Text>
                    </View>
                </View>

                <View style={styles.container}>
                    <View style={styles.noDataContainer}>
                        <Text style={styles.noDataText}>
                            No shipments found matching the selected filters
                        </Text>
                        <Text style={styles.noDataSubText}>
                            Try changing your filter criteria
                        </Text>
                    </View>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.mainContainer}>
            <View style={styles.headerContainer}>
                <View style={styles.headerRow}>
                    <Text style={[styles.headerText, styles.colDelivery]}>Delivery</Text>
                    <Text style={[styles.headerText, styles.colSales]}>Sales Order No</Text>
                    <Text style={[styles.headerText, styles.colLines]}>Lines / Qty</Text>
                    <Text style={[styles.headerText, styles.colPick, styles.centerHeader]}>Pick Slip No</Text>
                </View>
            </View>

            <View style={styles.container}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    style={styles.tableScroll}
                >
                    {filteredData.map((item) => (
                        <View key={item.deliveryId} style={styles.dataRow}>

                            <View style={styles.colDelivery}>
                                <Text style={styles.cellBold} numberOfLines={1}>{item.deliveryId}</Text>
                                <Text style={styles.cellSmall} numberOfLines={1}>{item.customer}</Text>
                            </View>

                            <View style={styles.colSales}>
                                <Text style={styles.cellBold} numberOfLines={1}>{item.salesOrderNo}</Text>
                                <Text style={styles.cellSmall} numberOfLines={1}>{item.carrier}</Text>
                            </View>

                            <View style={styles.colLines}>
                                <Text style={styles.cellSmall} numberOfLines={1}>
                                    Total Lines - {item.lines}
                                </Text>
                                <Text style={styles.cellSmall} numberOfLines={1}>
                                    Total Qty - {item.quantity}
                                </Text>
                            </View>

                            <View style={[styles.colPick, styles.centerColumn]}>
                                <Text style={[styles.cellBold, styles.centerText]} numberOfLines={1}>{item.pickSlipNo}</Text>

                                <TouchableOpacity
                                    style={[
                                        styles.pickBtn,
                                        item.status === 'Ready To Pack' && styles.readyBtn,
                                    ]}
                                    onPress={() => {
                                        if (item.status === 'Pick') {
                                            handlePickButtonPress(item);
                                        }
                                    }}
                                >
                                    <Text
                                        style={[
                                            styles.pickText,
                                            item.status === 'Ready To Pack' && styles.readyText,
                                        ]}
                                        numberOfLines={1}
                                    >
                                        {item.status}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                        </View>
                    ))}
                </ScrollView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        paddingHorizontal: 12,
    },

    headerContainer: {
        marginBottom: 4,
    },

    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        paddingVertical: 10,
        marginBottom: 20,
        minHeight: 300,
    },

    tableScroll: {
        flex: 1,
    },

    headerRow: {
        flexDirection: 'row',
        paddingHorizontal: 8,
        paddingVertical: 10,
    },

    dataRow: {
        flexDirection: 'row',
        paddingHorizontal: 8,
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#000000',
        alignItems: 'flex-start',
    },

    headerText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#7A7A7A',
        textAlign: 'left',
    },

    cellBold: {
        fontSize: 12,
        fontWeight: '700',
        color: '#233E55',
        textAlign: 'left',
    },

    cellSmall: {
        fontSize: 12,
        color: '#242424',
        marginTop: 2,
        textAlign: 'left',
    },

    colDelivery: {
        flex: 1.2,
        paddingHorizontal: 4,
    },
    colSales: {
        flex: 1.2,
        paddingHorizontal: 4,
    },
    colLines: {
        flex: 1,
        paddingHorizontal: 4,
    },
    colPick: {
        flex: 1,
        paddingHorizontal: 4,
    },

    centerHeader: {
        textAlign: 'center',
    },

    centerColumn: {
        alignItems: 'center',
    },

    centerText: {
        textAlign: 'center',
        width: '100%',
    },

    pickBtn: {
        marginTop: 6,
        alignSelf: 'center',
        minWidth: 34,
        minHeight: 13,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 4,
        backgroundColor: '#ECF1F7',
        justifyContent: 'center',
        alignItems: 'center',
    },

    pickText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#145DA0',
        textAlign: 'center',
    },

    readyBtn: {
        minWidth: 64,
        borderRadius: 4,
        backgroundColor: '#E6F4EA',
        paddingHorizontal: 12,
        paddingVertical: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },

    readyText: {
        color: '#188038',
        fontSize: 8,
        fontWeight: '700',
        paddingHorizontal: 0,
        paddingVertical: 0,
    },

    noDataContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 50,
    },

    noDataText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#7A7A7A',
        textAlign: 'center',
        marginBottom: 8,
    },

    noDataSubText: {
        fontSize: 14,
        color: '#9E9E9E',
        textAlign: 'center',
    },
});

export default Ship_TransactionTable;