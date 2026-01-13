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
import CheckBox from '@react-native-community/checkbox';
import GlobalHeaderComponent from '../../components/GlobalHeaderComponent';
import Barcodescanner from '../../assets/icons/barcodescanner.svg';
import BlueTickIcon from '../../assets/icons/Ship_Icons/BlueTickIcon.svg';
import LinearGradient from 'react-native-linear-gradient';
import BarcodeScanner from '../BarCodeScanner';
// import { PICK_TABLE_DATA } from '../../data/shippingMockData';
import SingleFooterBtnComponent from '../../components/SingleFooterBtnComponent';
import Ship_LotPopupModal from '../../components/shipping/Ship_LotPopupModal';
import Ship_SerialPopupModal from '../../components/shipping/Ship_SerialPopupModal';
import Ship_LotSerialPopup from '../../components/shipping/Ship_LotSerialPopup';
import ManPickConfirmPopup from '../../components/shipping/Ship_ManPickConfirmPopup';
import { useShippingStore } from '../../store/shippingStore';
import { useMemo } from 'react';

function ManualPick({ route, navigation }) {
    const [scannedBarcode, setScannedBarcode] = useState('');
    const [showScanner, setShowScanner] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [checkedItems, setCheckedItems] = useState({});
    const [allSelected, setAllSelected] = useState(false);
    const [showLotPopup, setShowLotPopup] = useState(false);
    const [showSerialPopup, setShowSerialPopup] = useState(false);
    const [showLotSerialPopup, setShowLotSerialPopup] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [confirmedItems, setConfirmedItems] = useState({});
    const selectedCount = Object.values(checkedItems).filter(Boolean).length;
    const handleBarcodeScan = (barcode) => {
        setScannedBarcode(barcode);
        setShowScanner(false);
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

    const toggleCheckbox = (itemCode) => {
        setCheckedItems(prev => ({
            ...prev,
            [itemCode]: !prev[itemCode]
        }));
    };

    const toggleAllCheckboxes = () => {
        if (allSelected) {
            setCheckedItems({});
        } else {
            const allChecked = {};
            pickItems.forEach(item => {
                allChecked[item.itemCode] = true;
            });

            setCheckedItems(allChecked);
        }
        setAllSelected(!allSelected);
    };

    const handleDetailsPress = (item) => {
        const lotTransactionId = selectedTransaction?.lot_transaction_id;

        const itemWithTransaction = {
            ...item,
            lot_transaction_id: lotTransactionId,
        };

        setSelectedItem(itemWithTransaction);

        if (item.itemType === 'Lot') {
            setShowLotPopup(true);
            setShowSerialPopup(false);
            setShowLotSerialPopup(false);
        } else if (item.itemType === 'Serial') {
            setShowSerialPopup(true);
            setShowLotPopup(false);
            setShowLotSerialPopup(false);
        } else if (item.itemType === 'Lot+Serial') {
            setShowLotSerialPopup(true);
            setShowLotPopup(false);
            setShowSerialPopup(false);
        }
    };

    const handleLotConfirm = (item) => {
        setConfirmedItems(prev => ({
            ...prev,
            [item.itemCode]: true
        }));
        setCheckedItems(prev => ({
            ...prev,
            [item.itemCode]: true
        }));
        closeLotPopup();
    };

    const handleSerialConfirm = (itemWithSerials) => {
        setConfirmedItems(prev => ({
            ...prev,
            [itemWithSerials.itemCode]: true
        }));
        setCheckedItems(prev => ({
            ...prev,
            [itemWithSerials.itemCode]: true
        }));
        closeSerialPopup();
    };
   const handleLotSerialConfirm = (itemWithData) => {
    setConfirmedItems(prev => ({
        ...prev,
        [itemWithData.itemCode]: true
    }));
    setCheckedItems(prev => ({
        ...prev,
        [itemWithData.itemCode]: true
    }));
    closeLotSerialPopup();
};
    const closeLotPopup = () => {
        setShowLotPopup(false);
        setSelectedItem(null);
    };

    const closeSerialPopup = () => {
        setShowSerialPopup(false);
        setSelectedItem(null);
    };

    const closeLotSerialPopup = () => {
        setShowLotSerialPopup(false);
        setSelectedItem(null);
    };

    const selectedTransaction =
        useShippingStore(s => s.selectedTransaction);
    const pickItems = useMemo(() => {
        const list = selectedTransaction?.items;
        return Array.isArray(list) ? list : [];
    }, [selectedTransaction]);

    const setPickItemsData =
        useShippingStore(s => s.setPickItemsData);
    const getPickedItems = () => {
        return pickItems.filter(
            item => checkedItems[item.itemCode]
        );
    };

    const renderPickItem = ({ item, index }) => {
        const isChecked = checkedItems[item.itemCode] || false;
        const isConfirmed = confirmedItems[item.itemCode] || false;
        return (
            <View style={styles.itemContainer} key={index}>
                <View style={styles.fullWidthDottedLine} />

                <View style={styles.itemContent}>
                    <View style={styles.greyBackgroundArea}>
                        <CheckBox
                            value={isChecked || isConfirmed}
                            onValueChange={() => toggleCheckbox(item.itemCode)}
                            tintColors={{ true: '#145DA0', false: '#667085' }}
                            boxType="square"
                            style={styles.checkbox}
                        />
                    </View>

                    <View style={styles.contentArea}>
                        <View style={styles.itemInfoRow}>
                            <View style={styles.itemInfo}>
                                <Text style={styles.itemText}>{item.item}</Text>
                                <Text style={styles.itemCodeText}>{item.itemCode}</Text>
                            </View>

                            <View style={styles.rightContent}>
                                <TouchableOpacity
                                    style={[
                                        styles.detailsContainer,
                                        (isChecked || isConfirmed) ? styles.detailsContainerSelected : styles.detailsContainerNormal
                                    ]}
                                    activeOpacity={0.7}
                                    onPress={() => handleDetailsPress(item)}
                                >
                                    {(isChecked || isConfirmed) && (
                                        <BlueTickIcon
                                            width={12}
                                            height={12}
                                            style={styles.tickIcon}
                                        />
                                    )}
                                    <Text style={[
                                        styles.detailsText,
                                        (isChecked || isConfirmed) ? styles.detailsTextSelected : styles.detailsTextNormal
                                    ]}>
                                        Details
                                    </Text>
                                </TouchableOpacity>

                                <View style={styles.quantitySection}>
                                    <Text style={styles.quantityText}>{item.quantity}</Text>
                                    <Text style={styles.eachText}>{item.uom}</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.locationRow}>
                            <View style={styles.locationContainer}>
                                <Text style={styles.locationLabel}>Sub Inventory:</Text>
                                <Text style={styles.locationValue}>{item.subInventory}</Text>
                                <View style={styles.spacer} />
                                <Text style={styles.locationLabel}>Locator:</Text>
                                <Text style={styles.locationValue}>{item.location}</Text>
                            </View>

                            <Text style={styles.pendingText}>{item.status}</Text>
                        </View>
                    </View>
                </View>
            </View>
        );
    };

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
                        <View style={styles.headerGreyArea}>
                            <CheckBox
                                value={allSelected}
                                onValueChange={toggleAllCheckboxes}
                                tintColors={{ true: '#145DA0', false: '#667085' }}
                                boxType="square"
                                style={styles.headerCheckbox}
                            />
                        </View>

                        <View style={[styles.headerColumn, styles.leftColumn]}>
                            <Text style={styles.headerText}>Items</Text>
                        </View>
                        <View style={[styles.headerColumn, styles.rightColumn]}>
                            <Text style={styles.headerText}>Qty To Pick</Text>
                        </View>
                    </View>

                    <ScrollView
                        style={styles.tableScrollView}
                        showsVerticalScrollIndicator={true}
                        contentContainerStyle={styles.tableScrollContent}
                    >
                        <FlatList
                            data={pickItems}
                            renderItem={renderPickItem}
                            keyExtractor={(item, index) => `${item.itemCode}-${index}`}
                            scrollEnabled={false}
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

            {/* <ConfirmationModal
                visible={showConfirmation}
                onClose={handleConfirmationNo}
                onYes={handleConfirmationYes}
                onNo={handleConfirmationNo}
            /> */}
            <ManPickConfirmPopup
                visible={showConfirmation}
                selectedCount={selectedCount}
                onCancel={() => setShowConfirmation(false)}
                onNo={() => setShowConfirmation(false)}
                onYes={() => {
                    const pickedItems = getPickedItems();

                    setPickItemsData(pickedItems);

                    setShowConfirmation(false);
                    navigation.navigate('ManualPack');
                }}

            />
            {selectedItem && selectedItem.itemType === 'Lot' && (
                <Ship_LotPopupModal
                    visible={showLotPopup}
                    onClose={closeLotPopup}
                    onConfirm={handleLotConfirm}
                    item={selectedItem}
                    pickedQuantity={0}
                    totalQuantity={selectedItem.quantity}
                    lotTransactionId={selectedItem.lot_transaction_id}
                />
            )}

            {selectedItem && selectedItem.itemType === 'Serial' && (
                <Ship_SerialPopupModal
                    visible={showSerialPopup}
                    onClose={closeSerialPopup}
                    item={selectedItem}
                    pickedQuantity={0}
                    totalQuantity={selectedItem.quantity}
                    onConfirm={handleSerialConfirm}
                            lotTransactionId={selectedItem.lot_transaction_id} 

                />
            )}
            {selectedItem && selectedItem.itemType === 'Lot+Serial' && (
                <Ship_LotSerialPopup
                    visible={showLotSerialPopup}
                    onClose={closeLotSerialPopup}
                    onConfirm={handleLotSerialConfirm}
                    item={selectedItem}
                    totalQuantity={selectedItem.quantity}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F4F6F8',
    },
    mainContent: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 12,
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
        fontFamily: 'Mulish',
        fontWeight: '500',
        fontSize: 10,
        lineHeight: 10,
        letterSpacing: 0,
        color: '#233E55',
        marginBottom: 2,
        includeFontPadding: false,
        textAlignVertical: 'center',
    },
    infoValue: {
        fontFamily: 'Mulish',
        fontWeight: '700',
        fontSize: 13,
        color: '#233E55',
        includeFontPadding: false,
        textAlignVertical: 'center',
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
        alignItems: 'center',
        borderRadius: 4,
        marginBottom: 12,
        alignSelf: 'center',
        overflow: 'hidden',
    },
    headerGreyArea: {
        width: 40,
        height: '100%',
        backgroundColor: '#F5F5F6',
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingLeft: 8,
    },
    headerCheckbox: {
        width: 18,
        height: 18,
        transform: [{ translateX: -5 }],
    },
    headerColumn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
    },
    leftColumn: {
        justifyContent: 'flex-start',
    },
    rightColumn: {
        justifyContent: 'flex-end',
    },
    headerText: {
        fontFamily: 'Mulish',
        fontWeight: '600',
        fontSize: 12,
        color: '#233E55',
        includeFontPadding: false,
        textAlignVertical: 'center',
    },
    tableScrollView: {
        flex: 1,
    },
    tableScrollContent: {
        paddingBottom: 10,
    },
    itemContainer: {
        width: 346,
        height: 80,
        borderRadius: 8,
        borderWidth: 0.2,
        borderColor: '#CCCED2',
        backgroundColor: '#FFFFFF',
        alignSelf: 'center',
        position: 'relative',
        marginBottom: 8,
        overflow: 'hidden',
    },
    fullWidthDottedLine: {
        position: 'absolute',
        bottom: 25,
        left: 38,
        right: 0,
        height: 1,
        borderBottomWidth: 1,
        borderBottomColor: '#EFEFF0',
        borderStyle: 'dotted',
    },
    itemContent: {
        flex: 1,
        flexDirection: 'row',
    },
    greyBackgroundArea: {
        width: 40,
        height: '100%',
        backgroundColor: '#F5F5F6',
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingLeft: 8,
    },
    checkbox: {
        width: 18,
        height: 18,
        transform: [{ translateX: -5 }],
    },
    contentArea: {
        flex: 1,
        padding: 12,
        justifyContent: 'space-between',
    },
    itemInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    itemInfo: {
        flex: 1,
    },
    itemText: {
        fontFamily: 'Mulish',
        fontWeight: '600',
        fontSize: 14,
        color: '#233E55',
        marginBottom: 2,
    },
    itemCodeText: {
        fontFamily: 'Mulish',
        fontSize: 12,
        color: '#667085',
    },
    rightContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    detailsContainer: {
        width: 64,
        height: 22,
        borderRadius: 4,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        paddingHorizontal: 8,
        borderWidth: 1,
    },
    detailsContainerNormal: {
        backgroundColor: '#FFFFFF',
        borderColor: '#D9E4EE',
    },
    detailsContainerSelected: {
        backgroundColor: '#D9E4EE',
        borderColor: '#D9E4EE',
    },
    tickIcon: {
        marginRight: 4,
    },
    detailsText: {
        fontFamily: 'Mulish',
        fontWeight: '600',
        fontSize: 10,
        lineHeight: 10,
    },
    detailsTextNormal: {
        color: '#145DA0',
    },
    detailsTextSelected: {
        color: '#145DA0',
    },
    quantitySection: {
        alignItems: 'flex-end',
    },
    quantityText: {
        fontFamily: 'Mulish',
        fontWeight: '700',
        fontSize: 15,
        color: '#233E55',
        marginBottom: 2,
    },
    eachText: {
        fontFamily: 'Mulish',
        fontSize: 12,
        color: '#667085',
    },
    locationRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        flex: 1,
    },
    locationLabel: {
        fontFamily: 'Mulish',
        fontSize: 10,
        color: '#5F6B7A',
        marginRight: 4,
    },
    locationValue: {
        fontFamily: 'Mulish',
        fontWeight: '500',
        fontSize: 10,
        color: '#233E55',
        marginRight: 12,
    },
    spacer: {
        width: 12,
    },
    pendingText: {
        fontFamily: 'Mulish',
        fontWeight: '600',
        fontSize: 10,
        color: '#F06000',
        textAlign: 'right',
        marginLeft: 8,
    },
    itemSeparator: {
        height: 12,
    },
    buttonContainer: {
        paddingHorizontal: 16,
        paddingBottom: 12,
        paddingTop: 12,
        backgroundColor: '#F4F6F8',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    buttonWrapper: {
        width: '100%',
    },
});

export default ManualPick;