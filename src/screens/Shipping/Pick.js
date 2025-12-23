import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Modal,
    FlatList,
} from 'react-native';

import GlobalHeaderComponent from '../../components/GlobalHeaderComponent';
import Barcodescanner from '../../assets/icons/barcodescanner.svg';
import BlueTickIcon from '../../assets/icons/Ship_Icons/BlueTickIcon.svg';
import LinearGradient from 'react-native-linear-gradient';
import BarcodeScanner from '../BarCodeScanner';
import { PICK_TABLE_DATA } from '../../data/shippingMockData';
import SingleFooterBtnComponent from '../../components/SingleFooterBtnComponent';
import ConfirmationModal from '../../components/shipping/Ship_ConfirmationModal';

function Pick({ route, navigation }) {
    const [scannedBarcode, setScannedBarcode] = useState('');
    const [showScanner, setShowScanner] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);

    const handleBarcodeScan = (barcode) => {
        console.log('Scanned barcode:', barcode);
        setScannedBarcode(barcode);
        setShowScanner(false);
        processScannedBarcode(barcode);
    };

    const handleScanPress = () => {
        setShowScanner(true);
    };

    const handleScannerClose = () => {
        setShowScanner(false);
    };

    const handleConfirmPick = () => {
        setShowConfirmation(true);
    };

    const handleConfirmationYes = () => {
        setShowConfirmation(false);
    };

    const handleConfirmationNo = () => {
        setShowConfirmation(false);
    };

    const renderPickItem = ({ item, index }) => (
        <View style={styles.itemContainer} key={index}>
            <View style={styles.leftSection}>
                <View style={styles.itemInfo}>
                    <Text style={styles.itemText}>{item.item}</Text>
                    <Text style={styles.itemCodeText}>{item.itemCode}</Text>
                </View>

                <View style={styles.locationContainer}>
                    <Text style={styles.locationLabel}>Sub Inventory:</Text>
                    <Text style={styles.locationValue}>{item.subInventory}</Text>
                    <View style={styles.spacer} />
                    <Text style={styles.locationLabel}>Locator:</Text>
                    <Text style={styles.locationValue}>{item.location}</Text>
                </View>
            </View>

            <View style={styles.rightSection}>
                <View style={styles.detailsQuantityRow}>
                    <View style={styles.detailsContainer}>
                        <BlueTickIcon width={12} height={12} style={styles.tickIcon} />
                        <Text style={styles.detailsText}>Details</Text>
                    </View>

                    <View style={styles.quantitySection}>
                        <Text style={styles.quantityText}>{item.quantity}</Text>
                        <Text style={styles.eachText}>{item.uom}</Text>
                    </View>
                </View>
                <Text style={styles.pendingText}>{item.status}</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor="#233E55" barStyle="light-content" />
            <GlobalHeaderComponent
                screenTitle="Pick"
                organizationName="ENV"
                onBack={() => navigation.goBack()}
            />

            <View style={styles.mainContent}>
                <LinearGradient
                    colors={['#F5F5F6', '#D9E4EE']}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    style={styles.infoGradientCard}
                >
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Customer Name</Text>
                        <Text style={styles.infoValue}>1100002</Text>
                    </View>

                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Carrier Name</Text>
                        <Text style={styles.infoValue}>1100002</Text>
                    </View>

                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Ship from location</Text>
                        <Text style={styles.infoValue}>3Ding</Text>
                    </View>
                </LinearGradient>

                <View style={styles.whiteCard}>
                    <TouchableOpacity
                        style={styles.barcodeField}
                        onPress={handleScanPress}
                        activeOpacity={0.8}
                    >
                        {scannedBarcode ? (
                            <Text style={styles.barcodeScannedText}>
                                {scannedBarcode}
                            </Text>
                        ) : (
                            <Text style={styles.barcodePlaceholder}>
                                Scan Barcode
                            </Text>
                        )}
                        <Barcodescanner width={18} height={18} />
                    </TouchableOpacity>

                    <View style={styles.tableHeader}>
                        <View style={styles.headerLeft}>
                            <Text style={styles.headerText}>Items</Text>
                        </View>
                        <View style={styles.headerRight}>
                            <Text style={styles.headerText}>Qty To Pick</Text>
                        </View>
                    </View>

                    <ScrollView
                        style={styles.tableScrollView}
                        showsVerticalScrollIndicator={true}
                        contentContainerStyle={styles.tableScrollContent}
                    >
                        <FlatList
                            data={PICK_TABLE_DATA}
                            renderItem={renderPickItem}
                            keyExtractor={(item, index) => `${item.itemCode}-${index}`}
                            scrollEnabled={false}
                            showsVerticalScrollIndicator={false}
                            ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
                        />
                    </ScrollView>
                </View>
            </View>

            <View style={styles.buttonContainer}>
                <SingleFooterBtnComponent
                    label="Confirm Pick"
                    onPress={handleConfirmPick}
                    enabled={true}
                    containerStyle={styles.buttonWrapper}
                />
            </View>

            <Modal
                visible={showScanner}
                animationType="slide"
                onRequestClose={handleScannerClose}
            >
                <BarcodeScanner
                    onScan={handleBarcodeScan}
                    onClose={handleScannerClose}
                />
            </Modal>

            <ConfirmationModal
                visible={showConfirmation}
                onClose={handleConfirmationNo}
                onYes={handleConfirmationYes}
                onNo={handleConfirmationNo}
            />
        </View>
    );
}

export default Pick;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F4F6F8',
    },

    mainContent: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 16,
    },

    infoGradientCard: {
        height: 49,
        width: '100%',
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.25,
        shadowRadius: 1,
        elevation: 2,
        marginBottom: 16,
    },
    infoItem: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 11,
        color: '#5F6B7A',
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 13,
        fontWeight: '700',
        color: '#233E55',
    },

    whiteCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 2,
        elevation: 2,
    },

    barcodeField: {
        width: '100%',
        height: 35,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#D0D5DD',
        borderRadius: 4,
        paddingVertical: 4,
        paddingHorizontal: 10,
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    barcodePlaceholder: {
        fontSize: 13,
        color: '#667085',
    },
    barcodeScannedText: {
        fontSize: 13,
        color: '#233E55',
        fontWeight: '500',
    },

    tableHeader: {
        width: 346,
        height: 31.26,
        backgroundColor: 'rgba(93, 118, 139, 0.05)',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        borderRadius: 4,
        marginBottom: 12,
        alignSelf: 'center',
    },
    headerLeft: {
        flex: 1,
    },
    headerRight: {
        flex: 1,
        alignItems: 'flex-end',
    },
    headerText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#233E55',
    },

    tableScrollView: {
        flex: 1,
    },

    tableScrollContent: {
        paddingBottom: 10,
    },

    itemContainer: {
        width: 325,
        height: 80,
        borderRadius: 8,
        borderWidth: 0.2,
        borderColor: '#CCCED2',
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        alignSelf: 'center',
        paddingVertical: 10,
        paddingHorizontal: 12,
    },

    leftSection: {
        flex: 1.5,
        justifyContent: 'space-between',
    },
    itemInfo: {
        marginBottom: 8,
    },
    itemText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#233E55',
        marginBottom: 2,
    },
    itemCodeText: {
        fontSize: 12,
        color: '#667085',
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    locationLabel: {
        fontSize: 10,
        color: '#5F6B7A',
        marginRight: 4,
    },
    locationValue: {
        fontSize: 10,
        fontWeight: '500',
        color: '#233E55',
        marginRight: 12,
    },
    spacer: {
        width: 12,
    },

    rightSection: {
        flex: 1,
        alignItems: 'flex-end',
        justifyContent: 'space-between',
    },
    detailsQuantityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    detailsContainer: {
        width: 64,
        height: 22,
        backgroundColor: '#D9E4EE',
        borderRadius: 4,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        paddingHorizontal: 8,
    },
    tickIcon: {
        marginRight: 4,
    },
    detailsText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#145DA0',
    },
    quantitySection: {
        alignItems: 'flex-end',
    },
    quantityText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#233E55',
        marginBottom: 2,
    },
    eachText: {
        fontSize: 12,
        color: '#667085',
    },
    pendingText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#F06000',
        textAlign: 'right',
    },

    itemSeparator: {
        height: 12,
    },

    buttonContainer: {
        paddingHorizontal: 16,
        paddingBottom: 30,
        paddingTop: 16,
        backgroundColor: '#F4F6F8',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    buttonWrapper: {
        width: '100%',
    },
});