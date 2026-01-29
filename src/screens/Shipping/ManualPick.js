import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Modal,
    FlatList, 
    ActivityIndicator,
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import GlobalHeaderComponent from '../../components/GlobalHeaderComponent';
import Barcodescanner from '../../assets/icons/barcodescanner.svg';
import BlueTickIcon from '../../assets/icons/Ship_Icons/BlueTickIcon.svg';
import LinearGradient from 'react-native-linear-gradient';
import BarcodeScanner from '../BarCodeScanner';
import SingleFooterBtnComponent from '../../components/SingleFooterBtnComponent';
import Ship_LotPopupModal from '../../components/shipping/Ship_LotPopupModal';
import Ship_SerialPopupModal from '../../components/shipping/Ship_SerialPopupModal';
import Ship_LotSerialPopup from '../../components/shipping/Ship_LotSerialPopup';
import ManPickConfirmPopup from '../../components/shipping/Ship_ManPickConfirmPopup';
import { useShippingStore } from '../../store/shippingStore';
import { useReceivingStore } from '../../store/receivingStore';
import { useMemo } from 'react';
import {
    GetShippingPickOrderData,
    GetShippingPickItemsData,
} from '../../api/ApiServices';

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
    const [itemTransactionData, setItemTransactionData] = useState({});

    const [phase, setPhase] = useState('idle');
    const [PickListItems, setPickListItems] = useState([]);
    const [PickListOrders, setPickListOrders] = useState();

    const selectedCount = Object.values(checkedItems).filter(Boolean).length;

    const {
        OrgData,
    } = useReceivingStore();

    const getOrgCode = () => {
        const val = useReceivingStore.getState()?.OrgData?.selectedOrg;
        return parseInt(val, 10);
    };

    const maptopickItemslist = data =>
        data.map(backend => ({
            id: `${backend.item_code}|${backend.sub_inventory}`,
            item_code: backend.item_code || '-',
            qty_to_pick: backend.qty_to_pick || '-',
            unit_of_measure: backend.unit_of_measure,
            sub_inventory: backend.sub_inventory || '-',
            locator: backend.locator || '-',
        }));

    useEffect(() => {
        console.log(selectedTransaction, "selectedTransaction_delivery_id")
        const orgCode = getOrgCode();
        console.log(orgCode, "orgCodeorgCodeorgCodeorgCode")
        if (!selectedTransaction?.deliveryId) return;
        setPhase('loading');
        const loadPickItemsData = async () => {
            try {
                console.log(selectedTransaction?.deliveryId, "selectedTransaction_delivery_id")
                const pickitemsdata = await GetShippingPickItemsData(orgCode, selectedTransaction?.deliveryId);
                if (pickitemsdata?.pick_items) {
                    console.log(pickitemsdata, "pickitemsdatapickitemsdatapickitemsdatapickitemsdata")
                    const frontendArray = maptopickItemslist(pickitemsdata?.pick_items);
                    setPickListItems(frontendArray);
                } else {
                    setPickListItems([]);
                }
                setPhase('success');
            } catch (error) {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: `${error}`,
                    position: 'top',
                    visibilityTime: 10000,
                });
                setPhase('error');
                navigation.navigate('Ship_Entry');
            }
        };
        loadPickItemsData();

        if (!selectedTransaction?.deliveryId) return;
        setPhase('loading');
        const loadPickOrderData = async () => {
            try {
                console.log(selectedTransaction?.deliveryId, "selectedTransaction_delivery_id")
                const pickorderdata = await GetShippingPickOrderData(orgCode, selectedTransaction?.deliveryId);
                if (pickorderdata?.pick_order_header) {
                    console.log(pickorderdata, "pickorderdatapickorderdatapickorderdatapickorderdata")
                    setPickListOrders(pickorderdata?.pick_order_header);
                } else {
                    setPickListOrders([]);
                }
                setPhase('success');
            } catch (error) {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: `${error}`,
                    position: 'top',
                    visibilityTime: 10000,
                });
                setPhase('error');
                navigation.navigate('Ship_Entry');
            }
        };
        loadPickOrderData();
    }, [selectedTransaction?.deliveryId]);

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


        console.log('Transaction data stored:', itemTransactionData);
        const pickedItems = getPickedItems();
        console.log('Picked items to store:', pickedItems);
        setPickItemsData(pickedItems);
        setShowConfirmation(true);
    };

    const handleConfirmationYes = () => {
        setShowConfirmation(false);
    };

    const handleConfirmationNo = () => {
        setShowConfirmation(false);
    };

    //    const toggleCheckbox = (itemCode) => {
    //     setCheckedItems(prev => ({
    //         ...prev,
    //         [itemCode]: !prev[itemCode],
    //     }));
    // };

    const toggleCheckbox = (id) => {
        setCheckedItems(prev => ({
            ...prev,
            [id]: !prev[id],
        }));
    };


    // const toggleAllCheckboxes = () => {
    //     if (allSelected) {
    //         setCheckedItems({});
    //     } else {
    //         const allChecked = {};
    //         PickListItems.forEach(item => {
    //             allChecked[item.item_code] = true;
    //         });
    //         setCheckedItems(allChecked);
    //     }
    //     setAllSelected(!allSelected);
    // };
    const toggleAllCheckboxes = () => {
        if (allSelected) {
            setCheckedItems({});
        } else {
            const allChecked = {};
            PickListItems.forEach(item => {
                allChecked[item.id] = true;
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

    const handleLotConfirm = (itemData) => {
        console.log('Lot confirm data received:', itemData);

        const itemCode = itemData.itemCode || (itemData.item && itemData.item.item_code);

        if (!itemCode) {
            console.error('No itemCode found in lot confirm data');
            return;
        }

        setConfirmedItems(prev => ({
            ...prev,
            [itemCode]: true
        }));
        setCheckedItems(prev => ({
            ...prev,
            [itemCode]: true
        }));

        setItemTransactionData(prev => ({
            ...prev,
            [itemCode]: {
                type: 'lot',
                data: itemData,
            }
        }));

        console.log('Stored lot transaction for:', itemCode);
        closeLotPopup();
    };

    const handleSerialConfirm = (itemData) => {
        console.log('Serial confirm data received:', itemData);

        const itemCode = itemData.itemCode || (itemData.item && itemData.item.item_code);

        if (!itemCode) {
            console.error('No itemCode found in serial confirm data');
            return;
        }

        setConfirmedItems(prev => ({
            ...prev,
            [itemCode]: true
        }));
        setCheckedItems(prev => ({
            ...prev,
            [itemCode]: true
        }));

        setItemTransactionData(prev => ({
            ...prev,
            [itemCode]: {
                type: 'serial',
                data: itemData,
            }
        }));

        console.log('Stored serial transaction for:', itemCode);
        closeSerialPopup();
    };

    const handleLotSerialConfirm = (itemData) => {
        console.log('LotSerial confirm data received:', itemData);
        const itemCode = itemData.itemCode || (itemData.item && itemData.item.item_code);

        if (!itemCode) {
            console.error('No itemCode found in lotserial confirm data');
            return;
        }

        setConfirmedItems(prev => ({
            ...prev,
            [itemCode]: true
        }));
        setCheckedItems(prev => ({
            ...prev,
            [itemCode]: true
        }));

        setItemTransactionData(prev => ({
            ...prev,
            [itemCode]: {
                type: 'lot+serial',
                data: {
                    lotTransactions: itemData.lotTransactions || [],
                    serialTransactions: itemData.serialTransactions || [],
                    ...itemData
                },
            }
        }));

        console.log('Stored lot+serial transaction for:', itemCode);
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

    const selectedTransaction = useShippingStore(s => s.selectedTransaction);
    const pickItems = useMemo(() => {
        const list = selectedTransaction?.items;
        return Array.isArray(list) ? list : [];
    }, [selectedTransaction]);

    const setPickItemsData = useShippingStore(s => s.setPickItemsData);

    const getPickedItems = () => {
        return PickListItems
            .filter(item => checkedItems[item.id])
            .map(item => ({
                ...item,
                transactionData: itemTransactionData[item.id] || null,
                isConfirmed: confirmedItems[item.id] || false,
            }));
    };


    const renderPickItem = ({ item, index }) => {
        // const isChecked = checkedItems[item.item_code] || false;
        // const isConfirmed = confirmedItems[item.item_code] || false;
        const isChecked = checkedItems[item.id] || false;
        const isConfirmed = confirmedItems[item.id] || false;
        const hasTransactionData = itemTransactionData[item.item_code];

        return (
            <View style={styles.itemContainer} key={index}>
                <View style={styles.fullWidthDottedLine} />

                <View style={styles.itemContent}>
                    <View style={styles.greyBackgroundArea}>
                        <CheckBox
                            value={isChecked || isConfirmed}
                            onValueChange={() => toggleCheckbox(item.id)}
                            tintColors={{ true: '#145DA0', false: '#667085' }}
                            boxType="square"
                            style={styles.checkbox}
                        />
                    </View>

                    <View style={styles.contentArea}>
                        <View style={styles.itemInfoRow}>
                            <View style={styles.itemInfo}>
                                <Text style={styles.itemText}>{item.item_code || '-'}</Text>
                                <Text style={styles.itemCodeText}>{item.item_id || '-'}</Text>

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
                                    <Text style={styles.quantityText}>{item.qty_to_pick || '-'}</Text>
                                    <Text style={styles.eachText}>{item.unit_of_measure || '-'}</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.locationRow}>
                            <View style={styles.locationContainer}>
                                <Text style={styles.locationLabel}>Sub Inventory:</Text>
                                <Text style={styles.locationValue}>{item.sub_inventory || '-'}</Text>
                                <View style={styles.spacer} />
                                <Text style={styles.locationLabel}>Locator:</Text>
                                <Text style={styles.locationValue}>{item.locator || '-'}</Text>
                            </View>

                            <Text style={styles.pendingText}>{item.status || '-'}</Text>
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
                screenTitle="Manual Pick"
                organizationName={OrgData?.selectedOrgCode || 'EnnVee'}
                onBack={() => navigation.goBack()}
            />

            {phase === 'loading' && (
                <View style={styles.loaderWrapper}>
                    <ActivityIndicator size="large" color="#233E55" />
                </View>
            )}
            {phase !== 'loading' && (
                <>

                    <View style={styles.mainContent}>
                        <LinearGradient
                            colors={['#F5F5F6', '#D9E4EE']}
                            start={{ x: 0.5, y: 0 }}
                            end={{ x: 0.5, y: 1 }}
                            style={styles.infoGradientCard}
                        >
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Customer Name</Text>
                                <Text style={styles.infoValue}>{PickListOrders?.customer_name ?? '-'}</Text>
                            </View>

                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Carrier Name</Text>
                                <Text style={styles.infoValue}>{PickListOrders?.carrier_name ?? '-'}</Text>
                            </View>

                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Ship from location</Text>
                                <Text style={styles.infoValue}>{PickListOrders?.ship_from_location ?? '-'}</Text>
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
                                    data={PickListItems}
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
                            enabled={selectedCount > 0}
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


                    <ManPickConfirmPopup
                        visible={showConfirmation}
                        selectedCount={selectedCount}
                        onCancel={() => setShowConfirmation(false)}
                        onYes={() => {
                            const pickedItems = getPickedItems();
                            setPickItemsData(pickedItems);
                            setShowConfirmation(false);
                            navigation.navigate('ManualPack');
                        }}
                        onNo={() => {
                            setShowConfirmation(false);
                            navigation.navigate('ShipDashboard', {
                                status: 'All',
                                refresh: true,
                                packMode: 'MANUAL',
                            });
                        }}
                        selectedTransaction={selectedTransaction}
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
                </>
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
        fontSize: 9,
        lineHeight: 10,
        letterSpacing: 0,
        color: '#233E55',
        marginBottom: 5,
        includeFontPadding: false,
        textAlignVertical: 'center',
    },
    infoValue: {
        fontFamily: 'Mulish',
        fontWeight: '700',
        fontSize: 10,
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
        width: '100%',
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
        width: '40',
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
        width: '100%',
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
    transactionIndicator: {
        fontFamily: 'Mulish',
        fontSize: 10,
        color: '#059669',
        marginTop: 2,
        fontStyle: 'italic',
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
    loaderWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default ManualPick;