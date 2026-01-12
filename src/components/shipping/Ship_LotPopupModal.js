import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    Animated,
} from 'react-native';

import CloseIcon from '../../assets/icons/close.svg';
import SummaryIcon from '../../assets/icons/Ship_Icons/SummaryIcon';
import LotsAdd from '../../assets/icons/Ship_Icons/LotsAdd';
import DropdownIcon from '../../assets/icons/Ship_Icons/DropdownIcon';
import SingleFooterBtnComponent from '../../components/SingleFooterBtnComponent';
import { LOT_DATA } from '../../data/shippingMockData';
import BarcodeScanner from '../../screens/BarCodeScanner';
import BarcodeScannerIcon from '../../assets/icons/barcodescanner.svg';

const { width: SCREEN_WIDTH, height } = Dimensions.get('window');
const BASE_WIDTH = 375;
const rs = v => (SCREEN_WIDTH / BASE_WIDTH) * v;

function Ship_LotPopupModal({
    visible,
    onClose,
    onConfirm,
    item,
    pickedQuantity = 0,
    totalQuantity = 0,
}) {
    const slideAnim = useState(new Animated.Value(height))[0];
    const [showLotCard, setShowLotCard] = useState(true);
    const [showScanner, setShowScanner] = useState(false);
    const [scannerVisible, setScannerVisible] = useState(false);
    const [activeLotIndex, setActiveLotIndex] = useState(null);
    const [scannedLots, setScannedLots] = useState({});
      const [scanTargetIdx, setScanTargetIdx] = useState(null);
    


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

    const handleConfirmLot = () => {
        if (onConfirm && item) {
            onConfirm(item);
        }
    };

    const handleClose = () => {
        setShowScanner(false)
        setShowLotCard(true)
    };

    
  const openScannerForLot = idx => {
    setScanTargetIdx(idx);
    setScannerVisible(true);
  };

  const handleLotScanned = codeString => {
    const scannedRaw = String(codeString || '').trim();
    if (scannedRaw && scanTargetIdx != null) {
      updateLot(scanTargetIdx, { lotNumber: scannedRaw });
    }
    setScannerVisible(false);
  };

    const handleScanResult = (code) => {
        if (activeLotIndex !== null) {
            setScannedLots(prev => ({
                ...prev,
                [activeLotIndex]: code
            }));
        }
        setShowScanner(false);
    };
    const filteredLots = LOT_DATA.filter(
        lot => lot.itemCode === item?.itemCode
    );

    if (showScanner) {
        return (
            <BarcodeScanner
                onScan={handleScanResult}
                onClose={handleClose}
            />
        );
    }
    return (
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
                                        <Text style={styles.itemTitle}>
                                            {item?.item}
                                        </Text>
                                        <Text style={styles.itemSku}>
                                            SKU #{item?.itemCode}
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
                                        <Text style={styles.bannerText}>Lots Added</Text>
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

                                {
                                    filteredLots.map((lot, index) => (
                                        <View key={lot.lotNumber} style={styles.lotCard}>
                                            <Text style={styles.fieldLabel}>Lot Number*</Text>
                                            <TouchableOpacity
                                                style={styles.lotNumberBox}
                                                onPress={() => openScannerForLot(lot.idx)}

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
                                        </View>
                                    ))
                                }
                            </View>
                        </ScrollView>

                        <View style={styles.footer}>
                            <SingleFooterBtnComponent
                                label="Confirm Lot"
                                onPress={handleConfirmLot}
                                enabled={pickedQuantity < totalQuantity}
                            />
                        </View>
                    </Animated.View>
                </View>
            )}
        </Modal>
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

    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
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
    confirmButtonContainer: {
        width: '100%',
        alignSelf: 'center',
    },

});

export default Ship_LotPopupModal;