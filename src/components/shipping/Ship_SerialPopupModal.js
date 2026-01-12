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
import LotsAdd from '../../assets/icons/Ship_Icons/LotsAdd';
import DropdownIcon from '../../assets/icons/Ship_Icons/Whitedropdown.svg';
import CloseIcon from '../../assets/icons/close.svg';
import SerialUpIcon from '../../assets/icons/serialupicon.svg';
import SerialDownIcon from '../../assets/icons/serialdownicon.svg';
import SummaryIcon from '../../assets/icons/Ship_Icons/SummaryIcon';
import SingleFooterBtnComponent from '../../components/SingleFooterBtnComponent';
import SearchIcon from '../../assets/icons/Ship_Icons/SearchIcon';
import EditIcon from '../../assets/icons/Ship_Icons/EditIcon';
import BarcodeScanner from '../../screens/BarCodeScanner';
import BarcodeScannerIcon from '../../assets/icons/barcodescanner.svg';
import { MOCK_SERIALS } from '../../data/shippingMockData';
import CloseRedIcon from '../../assets/icons/Ship_Icons/CloseRedIcon.svg';


const { width: SCREEN_WIDTH, height } = Dimensions.get('window');
const BASE_WIDTH = 375;
const rs = v => (SCREEN_WIDTH / BASE_WIDTH) * v;

function Ship_SerialPopupModal({
    visible,
    onClose,
    onConfirm,
    item,
    totalQuantity = 0,
}) {
    const slideAnim = useState(new Animated.Value(height))[0];
    const [selectedSerials, setSelectedSerials] = useState([]);
    const [showSerialList, setShowSerialList] = useState(false);
    const [scannerVisible, setScannerVisible] = useState(false);
    const [scanTargetId, setScanTargetId] = useState(null);
    const [editingSerialId, setEditingSerialId] = useState(null);
    const [barcodeValue, setBarcodeValue] = useState('');
    const [fromValue, setFromValue] = useState("");
    const [toValue, setToValue] = useState('');

    const [serialsData, setSerialsData] = useState(() => {
        if (MOCK_SERIALS && MOCK_SERIALS.length > 0) {
            return MOCK_SERIALS;
        }
        return Array.from({ length: totalQuantity }, (_, i) => ({
            id: `serial-${i + 1}`,
            serialNo: `SR-${item?.itemCode || 'ITEM'}-${i + 1}`,
        }));
    });

    const [reallocateVisible, setReallocateVisible] = useState(false);
    const [startNumberText, setStartNumberText] = useState('');
    const [endNumberText, setEndNumberText] = useState('');

    const clearError = useCallback(() => {
    }, []);

    const incStart = useCallback(() => {
        clearError();
        const base = Number(startNumberText || 0) || 0;
        const next = Math.max(1, base + 1);
        setStartNumberText(String(next));
    }, [clearError, startNumberText]);

    const incEnd = useCallback(() => {
        clearError();
        const base = Number(endNumberText || 0) || 0;
        const next = Math.max(1, base + 1);
        setEndNumberText(String(next));
    }, [clearError, endNumberText]);

    const decStart = useCallback(() => {
        clearError();
        const base = Number(startNumberText || 0) || 0;
        const next = Math.max(1, base - 1);
        setStartNumberText(String(next));
    }, [clearError, startNumberText]);

    const decEnd = useCallback(() => {
        clearError();
        const base = Number(endNumberText || 0) || 0;
        const next = Math.max(1, base - 1);
        setEndNumberText(String(next));
    }, [clearError, endNumberText]);

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

    const closeModal = () => {
        Animated.timing(slideAnim, {
            toValue: height,
            duration: 300,
            useNativeDriver: true,
        }).start(onClose);
    };

    const openScannerForSerial = (id) => {
        setEditingSerialId(id);
        setScanTargetId(id);
        setScannerVisible(true);
    };

    const handleSerialScanned = (codeString) => {
        const scannedRaw = String(codeString || '').trim();

        if (scannedRaw && scanTargetId) {
            setSerialsData(prev =>
                prev.map(serial =>
                    serial.id === scanTargetId
                        ? { ...serial, serialNo: scannedRaw }
                        : serial
                )
            );
        }

        setScannerVisible(false);
        setScanTargetId(null);
        setEditingSerialId(null);
    };

    const onEditIconPress = (id) => {
        setEditingSerialId(id);
    };

    const onScannerIconPress = (id) => {
        setScanTargetId(id);
        setScannerVisible(true);
    };

    const handleSearchPress = () => {
        console.log('Search icon pressed');
    };

    const handleSerialSelect = (serialNo) => {
        setSelectedSerials(prev => {
            if (prev.includes(serialNo)) {
                return prev.filter(s => s !== serialNo);
            } else {
                return [...prev, serialNo];
            }
        });
    };

    // const pickedQuantity = selectedSerials.length;

    const handleConfirm = () => {
        onConfirm({
            ...item,
            serials: selectedSerials,
        });
    };

    const handleUpdateSerial = () => {
        const start = parseInt(startNumberText) || 0;
        const end = parseInt(endNumberText) || 0;

        if (start <= end) {
            const newSerials = [];
            for (let i = start; i <= end; i++) {
                newSerials.push({
                    id: `serial-${i}`,
                    serialNo: `${item?.itemCode || 'ITEM'}-${i}`,
                });
            }

            setSerialsData(newSerials);
            setReallocateVisible(false);
        }
    };

    const deleteSerialRow = (id) => {
        setSerialsData(prev => prev.filter(serial => serial.id !== id));

        setSelectedSerials(prev =>
            prev.filter(s => s !== serialsData.find(x => x.id === id)?.serialNo)
        );

        if (editingSerialId === id) {
            setEditingSerialId(null);
        }
    };


    return (
        <Modal visible={visible} transparent animationType="none">
            {scannerVisible ? (
                <BarcodeScanner
                    onScan={handleSerialScanned}
                    onClose={() => setScannerVisible(false)}
                />
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
                                {item?.lineNumber || 'Line'}
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
                                        <Text style={styles.itemTitle}>{item?.item}</Text>
                                        <Text style={styles.itemSku}>SKU #{item?.itemCode}</Text>
                                    </View>

                                    <View>
                                        <Text style={styles.qtyLabel}>Selected</Text>
                                        <Text style={styles.qtyValue}>
                                            {totalQuantity}/{totalQuantity}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.banner}>
                                    <View style={styles.bannerLeft}>
                                        <LotsAdd width={22} height={22} />
                                        <Text style={styles.bannerText}>
                                            Serials Added
                                        </Text>
                                    </View>

                                    <TouchableOpacity
                                        onPress={() => setShowSerialList(prev => !prev)}
                                    >
                                        <DropdownIcon
                                            width={16}
                                            height={16}
                                            fill="#FFFFFF"
                                            style={{
                                                transform: [{
                                                    rotate: showSerialList ? '180deg' : '0deg'
                                                }],
                                            }}
                                        />
                                    </TouchableOpacity>
                                </View>

                                {showSerialList && (
                                    <View style={styles.serialDropdownContainer}>
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

                                        {serialsData.map(serial => (
                                            <View key={serial.id} style={styles.serialItemRow}>
                                                <TouchableOpacity
                                                    style={styles.serialTextContainer}
                                                    onPress={() => handleSerialSelect(serial.serialNo)}
                                                >
                                                    <Text style={[
                                                        styles.serialItemText,
                                                        selectedSerials.includes(serial.serialNo) && styles.serialItemTextSelected
                                                    ]}>
                                                        {editingSerialId === serial.id ? '' : serial.serialNo}
                                                    </Text>
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
                                                                <CloseRedIcon width={16} height={16} />
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
                                        ))}
                                    </View>
                                )}
                            </View>
                        </ScrollView>

                        <View style={styles.footer}>
                            <SingleFooterBtnComponent
                                label="Confirm Serial"
                                onPress={handleConfirm}
                                enabled={true}
                            />
                        </View>
                    </Animated.View>

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
                </View>
            )}
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: { flex: 1 },
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
    serialDropdownContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        overflow: 'hidden',
    },
    serialHeader: {
        height: 36,
        backgroundColor: '#E9F0F8',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
    },
    serialHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    serialHeaderText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#233E55',
    },
    searchIconWrapper: {
        padding: 2,
    },
    serialItemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#E4E7EC',
    },
    serialTextContainer: {
        flexDirection: 'row',
        alignItems: 'center',
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
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        backgroundColor: '#FFF',
    },
    serialHeaderActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    editHeaderIcon: {
        padding: 2,
    },
    reallocateOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    reallocateCard: {
        width: 372,
        height: 287,
        backgroundColor: '#FFFFFF',
        borderRadius: 4,
    },
    reallocateHeader: {
        height: 53,
        backgroundColor: '#ECF1F7',
        paddingHorizontal: 16,
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
        padding: 16,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#233E55',
        marginBottom: 12,
    },
    rangeRow: {
        flexDirection: 'row',
        gap: 12,
    },
    fieldBox: {
        flex: 1,
    },
    fieldLabel: {
        fontSize: 12,
        color: '#667085',
        marginBottom: 6,
    },
    spinnerBox: {
        height: 40,
        backgroundColor: '#F2F6FA',
        borderRadius: 6,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
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
        marginTop: 12,
    },
    updateBtn: {
        marginTop: 20,
        height: 44,
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

export default Ship_SerialPopupModal;