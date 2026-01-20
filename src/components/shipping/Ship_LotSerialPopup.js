import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    Animated,
    TextInput,
} from 'react-native';

import CloseIcon from '../../assets/icons/close.svg';
import SummaryIcon from '../../assets/icons/Ship_Icons/SummaryIcon';
import LotsAdd from '../../assets/icons/Ship_Icons/LotsAdd';
import DropdownIcon from '../../assets/icons/Ship_Icons/Whitedropdown.svg';
import SearchIcon from '../../assets/icons/Ship_Icons/SearchIcon';
import EditIcon from '../../assets/icons/Ship_Icons/EditIcon';
import SerialUpIcon from '../../assets/icons/serialupicon.svg';
import SerialDownIcon from '../../assets/icons/serialdownicon.svg';
import SingleFooterBtnComponent from '../../components/SingleFooterBtnComponent';
import { LOTSERIAL, MOCK_SERIALS } from '../../data/shippingMockData';
import BarcodeScanner from '../../screens/BarCodeScanner';
import BarcodeScannerIcon from '../../assets/icons/barcodescanner.svg';

const { width: SCREEN_WIDTH, height } = Dimensions.get('window');
const BASE_WIDTH = 375;
const rs = v => (SCREEN_WIDTH / BASE_WIDTH) * v;

function Ship_LotSerialPopup({
    visible,
    onClose,
    onConfirm,
    item,
    pickedQuantity = 0,
    totalQuantity = 0,
    orderId = null,
    lineNumber = null,
}) {
    const slideAnim = useState(new Animated.Value(height))[0];
    const [showLotCard, setShowLotCard] = useState(true);
    const [scannerVisible, setScannerVisible] = useState(false);
    const [activeLotIndex, setActiveLotIndex] = useState(null);
    const [scannedLots, setScannedLots] = useState({});
    const [scanTargetIdx, setScanTargetIdx] = useState(null);
    const [serialModalVisible, setSerialModalVisible] = useState(false);
    const [selectedLotForSerials, setSelectedLotForSerials] = useState(null);
    const [selectedSerialNumbers, setSelectedSerialNumbers] = useState([]);
    const [scannerSerialVisible, setScannerSerialVisible] = useState(false);
    const [scanSerialTargetId, setScanSerialTargetId] = useState(null);
    const [editingSerialId, setEditingSerialId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [reallocateVisible, setReallocateVisible] = useState(false);
    const [startNumberText, setStartNumberText] = useState('');
    const [endNumberText, setEndNumberText] = useState('');
    const [serialsData, setSerialsData] = useState([]);
    const [lotTransactions, setLotTransactions] = useState({});
    const [serialTransactions, setSerialTransactions] = useState({});

    useEffect(() => {
        if (visible) {
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();
        } else {
            slideAnim.setValue(height);
        }
    }, [visible]);

    useEffect(() => {
        if (visible && item) {
            const filteredLots = LOTSERIAL.filter(lot => {
                const lotCodeStr = String(lot.itemCode || '').trim();
                const itemCodeStr = String(item?.itemCode || '').trim();
                return lotCodeStr === itemCodeStr;
            });
            const initialLotTransactions = {};
            filteredLots.forEach((lot, index) => {
                const transactionId = `lot_txn_${item?.itemCode}_${index}_${Date.now()}`;
                initialLotTransactions[index] = {
                    transactionId,
                    itemCode: item?.itemCode,
                    itemDescription: item?.item,
                    lotNumber: lot.lotNumber,
                    scannedLotNumber: null,
                    mfgDate: lot.mfgDate,
                    expDate: lot.expDate,
                    quantity: lot.qty,
                    uom: item?.uom || 'Each',
                    orderId: orderId || 'ORD_' + Date.now(),
                    lineNumber: lineNumber || item?.lineNumber,
                    timestamp: new Date().toISOString(),
                };
            });
            setLotTransactions(initialLotTransactions);
        }
    }, [visible, item]);

    const closeModal = () => {
        Animated.timing(slideAnim, {
            toValue: height,
            duration: 300,
            useNativeDriver: true,
        }).start(onClose);
    };

const handleConfirmLot = () => {
    const confirmedTransactions = Object.values(lotTransactions).map(lotTxn => {
        const serialsForLot = serialTransactions[lotTxn.lotNumber] || [];
        
        return {
            ...lotTxn,
            serials: serialsForLot,
            confirmedTimestamp: new Date().toISOString()
        };
    });

    const allSerialTransactions = Object.values(serialTransactions).flat();

    if (onConfirm && item) {
        onConfirm({
            ...item,  
            lotTransactions: confirmedTransactions,
            serialTransactions: allSerialTransactions,
            confirmedTimestamp: new Date().toISOString()
        });
    }
};

    const openScannerForLot = idx => {
        setScanTargetIdx(idx);
        setScannerVisible(true);
    };

    const handleLotScanned = codeString => {
        const scannedRaw = String(codeString || '').trim();
        if (scannedRaw && scanTargetIdx != null) {
            setScannedLots(prev => ({
                ...prev,
                [scanTargetIdx]: scannedRaw,
            }));
            setLotTransactions(prev => ({
                ...prev,
                [scanTargetIdx]: {
                    ...prev[scanTargetIdx],
                    scannedLotNumber: scannedRaw,
                    scanTimestamp: new Date().toISOString(),
                }
            }));
        }
        setScannerVisible(false);
        setScanTargetIdx(null);
    };

    const openSerialModal = (lot, lotIndex) => {
        setSelectedLotForSerials({
            ...lot,
            index: lotIndex
        });

        let initialSerials = [];
        if (lot.serials && lot.serials.length > 0) {
            initialSerials = lot.serials.map((serial, idx) => ({
                ...serial,
                id: serial.id || `serial-${lotIndex}-${idx + 1}`,
                lotNumber: lot.lotNumber,
                itemCode: item?.itemCode,
                transactionId: `serial_txn_${item?.itemCode}_${lot.lotNumber}_${idx + 1}_${Date.now()}`
            }));
        } else {
            initialSerials = Array.from({ length: lot.qty || totalQuantity }, (_, i) => ({
                id: `serial-${lotIndex}-${i + 1}`,
                serialNo: `SR-${item?.itemCode || 'ITEM'}-${i + 1}`,
                status: 'Active',
                lotNumber: lot.lotNumber,
                itemCode: item?.itemCode,
                transactionId: `serial_txn_${item?.itemCode}_${lot.lotNumber}_${i + 1}_${Date.now()}`
            }));
        }

        setSerialsData(initialSerials);
        
        const initialSerialTransactions = {};
        initialSerials.forEach(serial => {
            initialSerialTransactions[serial.id] = {
                transactionId: serial.transactionId,
                serialNo: serial.serialNo,
                lotNumber: lot.lotNumber,
                itemCode: item?.itemCode,
                itemDescription: item?.item,
                orderId: orderId || 'ORD_' + Date.now(),
                lineNumber: lineNumber || item?.lineNumber,
                timestamp: new Date().toISOString(),
                scannedSerialNo: null
            };
        });

        setSerialTransactions(prev => ({
            ...prev,
            [lot.lotNumber]: initialSerialTransactions
        }));

        setSelectedSerialNumbers([]);
        setSearchQuery('');
        setSerialModalVisible(true);
    };

    const closeSerialModal = () => {
        setSerialModalVisible(false);
        setSelectedLotForSerials(null);
        setSelectedSerialNumbers([]);
        setSearchQuery('');
        setReallocateVisible(false);
    };

    const openScannerForSerial = (id) => {
        setEditingSerialId(id);
        setScanSerialTargetId(id);
        setScannerSerialVisible(true);
    };

    const handleSerialScanned = (codeString) => {
        const scannedRaw = String(codeString || '').trim();

        if (scannedRaw && scanSerialTargetId) {
            setSerialsData(prev =>
                prev.map(serial =>
                    serial.id === scanSerialTargetId
                        ? { ...serial, serialNo: scannedRaw }
                        : serial
                )
            );

            const serial = serialsData.find(s => s.id === scanSerialTargetId);
            if (serial && serial.lotNumber) {
                setSerialTransactions(prev => ({
                    ...prev,
                    [serial.lotNumber]: {
                        ...prev[serial.lotNumber],
                        [scanSerialTargetId]: {
                            ...prev[serial.lotNumber][scanSerialTargetId],
                            scannedSerialNo: scannedRaw,
                            scanTimestamp: new Date().toISOString(),
                        }
                    }
                }));
            }
        }

        setScannerSerialVisible(false);
        setScanSerialTargetId(null);
        setEditingSerialId(null);
    };

    const onEditIconPress = (id) => {
        setEditingSerialId(id);
    };

    const onScannerIconPress = (id) => {
        setScanSerialTargetId(id);
        setScannerSerialVisible(true);
    };

    const handleSearchPress = () => {
        console.log('Search icon pressed');
    };

    const handleSerialSelect = (serialId, serialNo) => {
        setSelectedSerialNumbers(prev => {
            if (prev.some(s => s.id === serialId)) {
                return prev.filter(s => s.id !== serialId);
            } else {
                return [...prev, { id: serialId, serialNo }];
            }
        });

        const serial = serialsData.find(s => s.id === serialId);
        if (serial && serial.lotNumber) {
            setSerialTransactions(prev => ({
                ...prev,
                [serial.lotNumber]: {
                    ...prev[serial.lotNumber],
                    [serialId]: {
                        ...prev[serial.lotNumber][serialId],
                        selectedTimestamp: new Date().toISOString()
                    }
                }
            }));
        }
    };

    const incStart = useCallback(() => {
        const base = Number(startNumberText || 0) || 0;
        const next = Math.max(1, base + 1);
        setStartNumberText(String(next));
    }, [startNumberText]);

    const incEnd = useCallback(() => {
        const base = Number(endNumberText || 0) || 0;
        const next = Math.max(1, base + 1);
        setEndNumberText(String(next));
    }, [endNumberText]);

    const decStart = useCallback(() => {
        const base = Number(startNumberText || 0) || 0;
        const next = Math.max(1, base - 1);
        setStartNumberText(String(next));
    }, [startNumberText]);

    const decEnd = useCallback(() => {
        const base = Number(endNumberText || 0) || 0;
        const next = Math.max(1, base - 1);
        setEndNumberText(String(next));
    }, [endNumberText]);

    const handleUpdateSerial = () => {
        const start = parseInt(startNumberText) || 0;
        const end = parseInt(endNumberText) || 0;

        if (start <= end && selectedLotForSerials) {
            const newSerials = [];
            const lotNumber = selectedLotForSerials.lotNumber;
            
            for (let i = start; i <= end; i++) {
                const serialId = `serial-${selectedLotForSerials.index}-${i}`;
                const serialNo = `${item?.itemCode || 'ITEM'}-${i}`;
                
                newSerials.push({
                    id: serialId,
                    serialNo: serialNo,
                    status: 'Active',
                    lotNumber: lotNumber,
                    itemCode: item?.itemCode,
                    transactionId: `serial_txn_${item?.itemCode}_${lotNumber}_${i}_${Date.now()}`
                });

                setSerialTransactions(prev => ({
                    ...prev,
                    [lotNumber]: {
                        ...prev[lotNumber],
                        [serialId]: {
                            transactionId: `serial_txn_${item?.itemCode}_${lotNumber}_${i}_${Date.now()}`,
                            serialNo: serialNo,
                            lotNumber: lotNumber,
                            itemCode: item?.itemCode,
                            itemDescription: item?.item,
                            orderId: orderId || 'ORD_' + Date.now(),
                            lineNumber: lineNumber || item?.lineNumber,
                            timestamp: new Date().toISOString(),
                            scannedSerialNo: null
                        }
                    }
                }));
            }

            setSerialsData(newSerials);
            setReallocateVisible(false);
            setStartNumberText('');
            setEndNumberText('');
        }
    };

    const deleteSerialRow = (id) => {
        const serial = serialsData.find(s => s.id === id);
        
        if (serial && serial.lotNumber) {
            setSerialTransactions(prev => {
                const lotSerials = { ...prev[serial.lotNumber] };
                delete lotSerials[id];
                
                return {
                    ...prev,
                    [serial.lotNumber]: lotSerials
                };
            });
        }

        setSerialsData(prev => prev.filter(serial => serial.id !== id));
        setSelectedSerialNumbers(prev => prev.filter(s => s.id !== id));

        if (editingSerialId === id) {
            setEditingSerialId(null);
        }
    };

    const filteredSerials = serialsData.filter(serial =>
        serial.serialNo.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredLots = LOTSERIAL.filter(lot => {
        const lotCode = String(lot.itemCode || '').trim();
        const itemCode = String(item?.itemCode || '').trim();
        return lotCode === itemCode;
    });

    return (
        <>
            <Modal
                visible={visible}
                animationType="slide"
                transparent
                onRequestClose={onClose}
            >
                {scannerVisible ? (
                    <BarcodeScanner onScan={handleLotScanned} onClose={() => setScannerVisible(false)} />
                ) : (
                    <View style={styles.modalOverlay}>
                        <TouchableOpacity
                            style={styles.backdrop}
                            activeOpacity={1}
                            onPress={closeModal}
                        />

                        <Animated.View
                            style={[
                                styles.bottomSheet,
                                { transform: [{ translateY: slideAnim }] },
                            ]}
                        >
                            <View style={styles.header}>
                                <Text style={styles.headerTitle}>
                                   Line
                                </Text>
                                <TouchableOpacity onPress={closeModal}>
                                    <CloseIcon width={18} height={18} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView contentContainerStyle={styles.scrollContent}>
                                <View style={styles.innerCard}>
                                    <View style={styles.itemSummary}>
                                        <SummaryIcon width={44} height={44} />
                                        <View style={styles.itemInfo}>
                                            <Text style={styles.itemTitle}>
                                                {item?.item || 'No Item Name'}
                                            </Text>
                                            <Text style={styles.itemSku}>
                                                SKU #{item?.itemCode || 'No SKU'}
                                            </Text>
                                        </View>
                                        <View>
                                            <Text style={styles.qtyLabel}>Qty Selected</Text>
                                            <Text style={styles.qtyValue}>
                                                {pickedQuantity}/{totalQuantity}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={styles.banner}>
                                        <View style={styles.bannerLeft}>
                                            <LotsAdd width={22} height={22} />
                                            <Text style={styles.bannerText}>
                                                Lots Added 
                                            </Text>
                                        </View>

                                        <TouchableOpacity
                                            onPress={() => setShowLotCard(p => !p)}
                                        >
                                            <DropdownIcon
                                                width={16}
                                                height={16}
                                                fill="#FFFFFF"
                                                style={{
                                                    transform: [{
                                                        rotate: showLotCard ? '180deg' : '0deg'
                                                    }],
                                                }}
                                            />
                                        </TouchableOpacity>
                                    </View>

                                    {showLotCard && filteredLots.length > 0 ? (
                                        filteredLots.map((lot, index) => {
                                            const hasSerials = lot.serials && lot.serials.length > 0;

                                            return (
                                                <View style={styles.lotCard} key={`lot-${index}`}>
                                                    <Text style={styles.fieldLabel}>Lot Number*</Text>
                                                    <TouchableOpacity
                                                        style={styles.lotNumberBox}
                                                        onPress={() => openScannerForLot(index)}
                                                    >
                                                        <Text style={styles.valueText}>
                                                            {scannedLots[index] || lot.lotNumber}
                                                        </Text>
                                                        <BarcodeScannerIcon width={18} height={18} />
                                                    </TouchableOpacity>

                                                    <View style={styles.dateRow}>
                                                        <View style={styles.dateCol}>
                                                            <Text style={styles.fieldLabel}>Mfg Date*</Text>
                                                            <Text style={styles.valueText}>{lot.mfgDate}</Text>
                                                        </View>

                                                        <View style={styles.dateCol}>
                                                            <Text style={styles.fieldLabel}>Exp Date*</Text>
                                                            <Text style={styles.valueText}>{lot.expDate}</Text>
                                                        </View>

                                                        <View style={styles.qtyCol}>
                                                            <Text style={styles.qtyBig}>{lot.qty}</Text>
                                                            <Text style={styles.uom}>{item?.uom || 'Each'}</Text>
                                                        </View>
                                                    </View>

                                                    {hasSerials && (
                                                        <TouchableOpacity
                                                            style={styles.viewSerialButton}
                                                            onPress={() => openSerialModal(lot, index)}
                                                            activeOpacity={0.7}
                                                        >
                                                            <Text style={styles.viewSerialText}>
                                                                View Serial 
                                                            </Text>
                                                        </TouchableOpacity>
                                                    )}
                                                </View>
                                            );
                                        })
                                    ) : showLotCard ? (
                                        <View style={styles.noDataContainer}>
                                            <Text style={styles.noDataText}>
                                                No lots found for item code: {item?.itemCode}
                                            </Text>
                                        </View>
                                    ) : null}
                                </View>
                            </ScrollView>

                            <View style={styles.footer}>
                                <SingleFooterBtnComponent
                                    label="Confirm Lot & Serial"
                                    onPress={handleConfirmLot}
                                    enabled={filteredLots.length > 0}
                                />
                            </View>
                        </Animated.View>
                    </View>
                )}
            </Modal>

            {scannerSerialVisible && (
                <BarcodeScanner
                    onScan={handleSerialScanned}
                    onClose={() => setScannerSerialVisible(false)}
                />
            )}

            <Modal
                visible={serialModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={closeSerialModal}
            >
                <View style={styles.serialModalOverlay}>
                    <View style={styles.serialModalContainer}>
                        <View style={styles.serialModalHeader}>
                            <Text style={styles.serialModalTitle}>
                                View Serials 
                            </Text>
                            <TouchableOpacity onPress={closeSerialModal}>
                                <CloseIcon width={18} height={18} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.serialModalContent}>
                            <View style={styles.serialHeader}>
                                <Text style={styles.serialHeaderText}>Serial No</Text>
                                <View style={styles.serialHeaderActions}>
                                    <TouchableOpacity
                                        style={styles.searchIconWrapper}
                                        onPress={handleSearchPress}
                                    >
                                        <SearchIcon width={16} height={16} />
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.editHeaderIcon}
                                        onPress={() => setReallocateVisible(true)}
                                    >
                                        <EditIcon width={16} height={16} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <ScrollView style={styles.serialsScrollView}>
                                {filteredSerials.length > 0 ? (
                                    <View style={styles.serialsListContainer}>
                                        {filteredSerials.map((serial, idx) => {
                                            const isSelected = selectedSerialNumbers.some(s => s.id === serial.id);

                                            return (
                                                <View key={serial.id || idx} style={styles.serialItemRow}>
                                                    <TouchableOpacity
                                                        style={styles.serialTextContainer}
                                                        onPress={() => handleSerialSelect(serial.id, serial.serialNo)}
                                                    >
                                                        <View style={styles.serialInfo}>
                                                            <Text style={[
                                                                styles.serialItemText,
                                                                isSelected && styles.serialItemTextSelected
                                                            ]}>
                                                                {editingSerialId === serial.id ? '' : serial.serialNo}
                                                            </Text>
                                                        </View>
                                                    </TouchableOpacity>
                                                    <View style={styles.serialActionContainer}>
                                                        {editingSerialId === serial.id ? (
                                                            <>
                                                                <TouchableOpacity
                                                                    style={styles.actionIcon}
                                                                    onPress={() => onScannerIconPress(serial.id)}
                                                                >
                                                                    <BarcodeScannerIcon width={18} height={18} />
                                                                </TouchableOpacity>

                                                                <TouchableOpacity
                                                                    style={styles.actionIcon}
                                                                    onPress={() => deleteSerialRow(serial.id)}
                                                                >
                                                                    <CloseIcon width={16} height={16} fill="#E11D48" />
                                                                </TouchableOpacity>
                                                            </>
                                                        ) : (
                                                            <TouchableOpacity
                                                                style={styles.actionIcon}
                                                                onPress={() => onEditIconPress(serial.id)}
                                                            >
                                                                <EditIcon width={16} height={16} />
                                                            </TouchableOpacity>
                                                        )}
                                                    </View>
                                                </View>
                                            );
                                        })}
                                    </View>
                                ) : (
                                    <View style={styles.noSerialsContainer}>
                                        <Text style={styles.noSerialsText}>
                                            No serial numbers found
                                        </Text>
                                    </View>
                                )}
                            </ScrollView>
                        </View>
                        <View style={styles.serialModalFooter}>
                            <TouchableOpacity
                                style={styles.closeSerialButton}
                                onPress={closeSerialModal}
                            >
                                <Text style={styles.closeSerialButtonText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                <Modal
                    visible={reallocateVisible}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setReallocateVisible(false)}
                >
                    <View style={styles.reallocateOverlay}>
                        <View style={styles.reallocateCard}>
                            <View style={styles.reallocateHeader}>
                                <Text style={styles.reallocateTitle}>Reallocate Serials</Text>
                                <TouchableOpacity onPress={() => setReallocateVisible(false)}>
                                    <CloseIcon width={16} height={16} />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.reallocateBody}>
                                <Text style={styles.sectionTitle}>Select Range</Text>

                                <View style={styles.rangeRow}>
                                    <View style={styles.fieldBox}>
                                        <Text style={styles.fieldLabel}>From</Text>
                                        <View style={styles.spinnerBox}>
                                            <TextInput
                                                value={startNumberText}
                                                onChangeText={setStartNumberText}
                                                keyboardType="number-pad"
                                                style={styles.spinnerInput}
                                            />
                                            <View style={styles.spinnerBtns}>
                                                <TouchableOpacity onPress={incStart} style={styles.spinnerBtn}>
                                                    <SerialUpIcon width={16} height={16} />
                                                </TouchableOpacity>
                                                <TouchableOpacity onPress={decStart} style={styles.spinnerBtn}>
                                                    <SerialDownIcon width={16} height={16} />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </View>

                                    <View style={styles.fieldBox}>
                                        <Text style={styles.fieldLabel}>To</Text>
                                        <View style={styles.spinnerBox}>
                                            <TextInput
                                                value={endNumberText}
                                                onChangeText={setEndNumberText}
                                                keyboardType="number-pad"
                                                style={styles.spinnerInput}
                                            />
                                            <View style={styles.spinnerBtns}>
                                                <TouchableOpacity onPress={incEnd} style={styles.spinnerBtn}>
                                                    <SerialUpIcon width={16} height={16} />
                                                </TouchableOpacity>
                                                <TouchableOpacity onPress={decEnd} style={styles.spinnerBtn}>
                                                    <SerialDownIcon width={16} height={16} />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </View>
                                </View>

                                <Text style={styles.helperText}>
                                    We will add serial from the selected range automatically
                                </Text>

                                <TouchableOpacity style={styles.updateBtn} onPress={handleUpdateSerial}>
                                    <Text style={styles.updateBtnText}>Update Serial</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    bottomSheet: {
        position: 'absolute',
        top: rs(100),
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#FFF',
    },
    header: {
        height: 44,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        backgroundColor: '#ECF1F7',
    },
    headerTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#233E55',
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 100,
    },
    innerCard: {
        backgroundColor: '#EEF3FF',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    itemSummary: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    itemInfo: {
        flex: 1,
        marginLeft: 12
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: '600'
    },
    itemSku: {
        fontSize: 13,
        color: '#667085'
    },
    qtyLabel: {
        fontSize: 11,
        color: '#667085'
    },
    qtyValue: {
        fontSize: 16,
        fontWeight: '700'
    },
    banner: {
        height: 32,
        backgroundColor: '#7392AA',
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    bannerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    bannerText: {
        color: '#FFF',
        fontWeight: '600'
    },
    lotCard: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        position: 'relative',
        overflow: 'hidden',
    },
    viewSerialButton: {
        width: '100%',
        height: 25,
        backgroundColor: '#ECF1F7',
        borderBottomRightRadius: 14,
        borderBottomLeftRadius: 14,
        padding: 10,
        marginTop: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    viewSerialText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#021322',
    },
    fieldLabel: {
        fontSize: 12,
        color: '#667085',
        marginBottom: 4,
        fontWeight: '500',
    },
    lotNumberBox: {
        height: 36,
        borderWidth: 1,
        borderColor: '#E4E7EC',
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        marginBottom: 8,
    },
    valueText: {
        fontSize: 14,
        color: '#233E55',
        fontWeight: '500',
    },
    dateRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
    },
    dateCol: {
        flex: 1,
    },
    qtyCol: {
        alignItems: 'center',
    },
    qtyBig: {
        fontSize: 18,
        fontWeight: '700'
    },
    uom: {
        fontSize: 12,
        color: '#667085'
    },
    noDataContainer: {
        backgroundColor: '#FFF',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    noDataText: {
        fontSize: 14,
        color: '#667085',
        textAlign: 'center',
        marginBottom: 8,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFF',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    // SERIAL MODAL STYLES
    serialModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    serialModalContainer: {
        width: rs(350),
        height: rs(600),
        backgroundColor: '#FFFFFF',
        borderRadius: 4,
        overflow: 'hidden',
    },
    serialModalHeader: {
        width: '100%',
        height: rs(40),
        backgroundColor: '#D9E4EE',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: rs(12),
        borderRadius: 4,
    },
    serialModalTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#233E55',
    },
    serialModalContent: {
        flex: 1,
    },
    serialHeader: {
        height: 36,
        backgroundColor: '#E9F0F8',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: rs(16),
        marginTop: rs(12),
    },
    serialHeaderText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#233E55',
    },
    serialHeaderActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: rs(12),
    },
    searchIconWrapper: {
        padding: 2,
    },
    editHeaderIcon: {
        padding: 2,
    },
    serialsScrollView: {
        flex: 1,
        paddingHorizontal: rs(16),
    },
    serialsListContainer: {
        flex: 1,
    },
    serialItemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: rs(10),
        borderBottomWidth: 1,
        borderBottomColor: '#E4E7EC',
    },
    serialTextContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    serialInfo: {
        flex: 1,
    },
    serialItemText: {
        fontSize: 14,
        color: '#233E55',
        fontWeight: '500',
    },
    serialItemTextSelected: {
        color: '#007AFF',
        fontWeight: '600',
    },
    editButton: {
        padding: 4,
    },
    noSerialsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: rs(40),
    },
    noSerialsText: {
        fontSize: 14,
        color: '#667085',
        textAlign: 'center',
    },
    serialModalFooter: {
        paddingHorizontal: rs(16),
        paddingVertical: rs(12),
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    closeSerialButton: {
        backgroundColor: '#5F778E',
        height: rs(44),
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeSerialButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 14,
    },
    reallocateOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    reallocateCard: {
        width: rs(372),
        height: rs(287),
        backgroundColor: '#FFFFFF',
        borderRadius: 4,
    },
    reallocateHeader: {
        height: rs(53),
        backgroundColor: '#ECF1F7',
        paddingHorizontal: rs(16),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    reallocateTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#233E55',
    },
    reallocateBody: {
        flex: 1,
        padding: rs(16),
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#233E55',
        marginBottom: rs(12),
    },
    rangeRow: {
        flexDirection: 'row',
        gap: rs(12),
    },
    fieldBox: {
        flex: 1,
    },
    fieldLabel: {
        fontSize: 12,
        color: '#667085',
        marginBottom: rs(6),
    },
    spinnerBox: {
        height: rs(40),
        backgroundColor: '#F2F6FA',
        borderRadius: 6,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: rs(12),
    },
    spinnerInput: {
        flex: 1,
        fontSize: 14,
        fontWeight: '600',
        color: '#233E55',
    },
    spinnerBtns: {
        justifyContent: 'center',
    },
    spinnerBtn: {
        paddingVertical: 2,
    },
    helperText: {
        fontSize: 11,
        color: '#667085',
        marginTop: rs(12),
    },
    updateBtn: {
        marginTop: rs(20),
        height: rs(44),
        backgroundColor: '#5F778E',
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    updateBtnText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 14,
    },
    serialActionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    actionIcon: {
        padding: 4,
    },
});

export default Ship_LotSerialPopup;