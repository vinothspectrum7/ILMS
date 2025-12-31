import React, { useMemo, useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import CloseIcon from '../../assets/icons/close.svg';
import ItemBoxIcon from '../../assets/icons/lotserialitem.svg';
import ReceiveAddIcon from '../../assets/icons/receiveaddicon.svg';
import LinearGradient from 'react-native-linear-gradient';
import { GetLotDetails, GetSingleReceipt  } from '../../api/ApiServices';
import Toast from 'react-native-toast-message';
import Rec_LotModalViewPopup from './Rec_LotModalViewPopup';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BASE_WIDTH = 375;
const rs = v => (SCREEN_WIDTH / BASE_WIDTH) * v;

const safeNum = v => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
};

export default function Rec_LotPutawayViewPopup({
    visible,
    onClose,
    rowData,
    itemName = '',
    itemCode = '',
    uom = '',
    transactionId,
    existingLotData = [], 
    subInventory = '',
}) {
    const [loading, setLoading] = useState(false);
    const [lotData, setLotData] = useState(existingLotData);
    const [apiLotData, setApiLotData] = useState([]); 
    const [hasLotSerials, setHasLotSerials] = useState(false);
    const [lotSerialCount, setLotSerialCount] = useState(0);
    const [lotCount, setLotCount] = useState(0);
    const [totalQty, setTotalQty] = useState(0);
    const [apiError, setApiError] = useState(false);

              const [showPutAwayUI, setShowPutAwayUI] = useState(true);
              const [lotSerialVisible, setLotSerialVisible] = useState(false);
            
    const displayData = useMemo(() => {
        if (!rowData) return null;
        
        return {
            qty: safeNum(rowData?.qty || 0),
            lotNumber: rowData?.lotNumber || `Lot ${rowData?.lotIndex + 1}`,
            lotIndex: rowData?.lotIndex || 0,
            itemName: rowData?.itemName || itemName || 'N/A',
            itemCode: rowData?.itemCode || itemCode || 'N/A',
            uom: rowData?.uom || uom || 'Qty',
            subInventory: rowData?.subInventory || 'Not Set',
            targetLocator: rowData?.targetLocator || 'Not Set',
            putAwayQty: safeNum(rowData?.putAwayQty || rowData?.qty || 0),
            mfgDate: rowData?.mfgDate,
            expDate: rowData?.expDate,
            status: rowData?.status || 'Pending',
        };
    }, [rowData, itemName, itemCode, uom]);

    

    useEffect(() => {
        if (visible && transactionId) {
            fetchLotDataFromAPI();
        }
    }, [visible, transactionId]);

    const fetchLotDataFromAPI = async () => {
        if (!transactionId) {
            Toast.show({
                type: 'error',
                text1: 'No transaction ID available',
                text2: 'Cannot fetch lot details',
            });
            return;
        }

        setLoading(true);
        setApiError(false);
        
        try {
            console.log('Fetching lot details for transaction:', transactionId);
            
            const response = await GetLotDetails(transactionId);
            
            console.log('API Response:', response);
            
            if (Array.isArray(response) && response.length > 0) {
                const processedData = response.map((item, index) => ({
                    id: index,
                    lotNumber: String(item?.lot_number || item?.lotNumber || `LOT-${index + 1}`),
                    qty: safeNum(item?.lot_qty || item?.qty || 0),
                    mfgDate: String(item?.mfg_date || item?.mfgDate || ''),
                    expDate: String(item?.exp_date || item?.expDate || ''),
                    serials: Array.isArray(item?.serials) ? item.serials : [],
                    serialCount: Array.isArray(item?.serials) ? item.serials.length : 0,
                 
                }));
                
                setApiLotData(processedData);
                processLotData(processedData);
                
            } else {
                Toast.show({
                    type: 'info',
                    text1: 'No lot data found',
                    text2: 'No lots associated with this transaction',
                });
                setApiLotData([]);
                processLotData([]);
            }
        } catch (error) {
            console.error('Error fetching lot data from API:', error);
            setApiError(true);
            
            Toast.show({
                type: 'error',
                text1: 'Failed to load lot data',
                text2: error.message || 'Please try again',
            });
            
            if (existingLotData.length > 0) {
                processLotData(existingLotData);
                Toast.show({
                    type: 'info',
                    text1: 'Using existing lot data',
                });
            }
        } finally {
            setLoading(false);
        }

        
    };

    const processLotData = (data) => {
        const processedData = data.map(item => ({
            lotNumber: String(item?.lotNumber || ''),
            qty: safeNum(item?.qty || 0),
            mfgDate: String(item?.mfgDate || ''),
            expDate: String(item?.expDate || ''),
            serials: Array.isArray(item?.serials) ? item.serials : [],
            serialCount: Array.isArray(item?.serials) ? item.serials.length : 0,
        }));
        
        setLotData(processedData);
                const total = processedData.reduce((sum, lot) => sum + lot.qty, 0);
        const serialTotal = processedData.reduce((sum, lot) => sum + lot.serialCount, 0);
        const hasSerials = serialTotal > 0;
        
        setTotalQty(total);
        setLotCount(processedData.length);
        setLotSerialCount(serialTotal);
        setHasLotSerials(hasSerials);
    };



    const openPutAwayLotModal = () => {
         setShowPutAwayUI(false);
  setLotSerialVisible(true);
        
       
    };
      const handleLotSerialClose = () => {
          setLotSerialVisible(false);
  setShowPutAwayUI(true);
        
       
    };


    const getButtonText = () => {
        if (loading) {
            return 'Loading...';
        }
        
        if (apiError) {
            return 'Error Loading Lots';
        }
        
        if (lotCount === 0) {
            return 'Add Lot';
        }
        
        if (hasLotSerials) {
            return `${lotCount} Lots+${lotSerialCount} Serials Added - ${totalQty} QTY`;
        } else {
            return `${lotCount} Lots Added - ${totalQty} QTY`;
        }
    };

    const retryApiCall = () => {
        if (transactionId) {
            fetchLotDataFromAPI();
        }
    };

    if (!visible || !displayData) return null;

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <ScrollView
                    style={styles.scrollContainer}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    {showPutAwayUI && (
                    <View style={styles.modalContainer}>
                        <View style={styles.header}>
                            <Text style={styles.headerTitle}>View Put Away</Text>
                            <TouchableOpacity onPress={onClose} activeOpacity={0.85}>
                                <CloseIcon width={rs(18)} height={rs(18)} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.body}>
                            <View style={styles.lotCard}>
                                <ItemBoxIcon width={40} height={40} />
                                <View style={{ flex: 1, marginLeft: 5 }}>
                                    <Text style={styles.lotId}>{displayData.itemName}</Text>
                                    <View style={styles.lotRow}>
                                        <Text style={styles.smallText}>{displayData.itemCode}</Text>
                                    </View>
                                </View>
                                <View style={styles.qtyBox}>
                                    <Text style={styles.qtyLabel}>Qty</Text>
                                    <Text style={styles.qtyValue}>
                                        {displayData.qty}
                                        {displayData.uom ? ` ${displayData.uom}` : ''}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Sub-Inventory</Text>
                                <Text style={styles.infoValue}>{subInventory}</Text>
                            </View>

                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Target Locator</Text>
                                <Text style={styles.infoValue}>{displayData.targetLocator}</Text>
                            </View>

                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Put Away Quantity</Text>
                                <Text style={styles.infoValue}>
                                    {displayData.putAwayQty} {displayData.uom}
                                </Text>
                            </View>

                    
                            
                            {apiError && (
                                <View style={styles.errorContainer}>
                                    <Text style={styles.errorText}>
                                        Failed to load lot data
                                    </Text>
                                    <TouchableOpacity 
                                        style={styles.retryButton}
                                        onPress={retryApiCall}
                                    >
                                        <Text style={styles.retryButtonText}>Retry</Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            <View style={styles.addLotRow}>
                                <TouchableOpacity
                                    style={styles.addLotBtn}
                                    activeOpacity={0.85}
                                    onPress={openPutAwayLotModal }
                                    disabled={loading || apiError || lotCount === 0}
                                >
                                    {loading ? (
                                        <View style={styles.addLotGreen}>
                                            <ActivityIndicator size="small" color="#FFFFFF" />
                                            <Text style={[styles.addLotGreenText, { marginLeft: 8 }]}>
                                                Loading...
                                            </Text>
                                        </View>
                                    ) : apiError ? (
                                        <View style={styles.addLotError}>
                                            <ReceiveAddIcon width={20} height={20} />
                                            <Text style={styles.addLotErrorText}>
                                                Error Loading Lots
                                            </Text>
                                        </View>
                                    ) : lotCount > 0 ? (
                                        <View style={styles.addLotGreen}>
                                            <ReceiveAddIcon width={20} height={20} />
                                            <Text style={styles.addLotGreenText}>
                                                {getButtonText()}
                                            </Text>
                                        </View>
                                    ) : (
                                        <LinearGradient
                                            colors={['#7392AA', '#89ADC9']}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                            style={styles.addLotGrad}
                                        >
                                            <ReceiveAddIcon width={20} height={20} />
                                            <Text style={styles.addLotText}>Add Lot</Text>
                                        </LinearGradient>
                                    )}
                                </TouchableOpacity>
                            </View>

                    
                        </View>
                    </View>
                      )}
                      <Rec_LotModalViewPopup
                                 visible={lotSerialVisible}
                                onClose={handleLotSerialClose}
                                itemName={displayData.itemName}
                                itemCode={displayData.itemid}
                                lineQty={displayData.qty}
                                // lineLabel={displayData.lineLabel}
                                initialLots={apiLotData}
                              />
                </ScrollView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: rs(20),
    },
    modalContainer: {
        width: Math.min(rs(360), SCREEN_WIDTH * 0.92),
        backgroundColor: '#FFFFFF',
        borderRadius: rs(8),
        overflow: 'hidden',
    },
    header: {
        height: rs(56),
        backgroundColor: '#ECF1F7',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: rs(16),
    },
    headerTitle: {
        fontSize: rs(16),
        fontWeight: '600',
        color: '#111827',
    },
    body: {
        paddingHorizontal: rs(16),
        paddingTop: rs(14),
        paddingBottom: rs(16),
    },
    lotCard: {
        width: '100%',
        minHeight: rs(54),
        backgroundColor: '#4F6577',
        borderRadius: rs(6),
        paddingHorizontal: rs(12),
        paddingVertical: rs(10),
        flexDirection: 'row',
        alignItems: 'center',
    },
    lotId: {
        color: '#FFFFFF',
        fontSize: rs(13),
        fontWeight: '600',
    },
    lotRow: {
        flexDirection: 'row',
        marginTop: rs(2),
    },
    smallText: {
        color: '#DCE3EA',
        fontSize: rs(11),
        marginRight: rs(18),
    },
    qtyBox: {
        alignItems: 'flex-end',
    },
    qtyLabel: {
        color: '#DCE3EA',
        fontSize: rs(11),
    },
    qtyValue: {
        color: '#FFFFFF',
        fontSize: rs(16),
        fontWeight: '700',
    },
    infoRow: {
        paddingTop: rs(16),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: rs(10),
        borderBottomWidth: 0.5,
        borderBottomColor: '#CCCED2',
    },
    infoLabel: {
        fontFamily: 'Mulish-Medium',
        fontSize: rs(12),
        fontWeight: '500',
        lineHeight: rs(12),
        letterSpacing: 0,
        color: '#6C6C6C',
    },
    infoValue: {
        fontFamily: 'Mulish-Medium',
        fontSize: rs(12),
        fontWeight: '500',
        lineHeight: rs(12),
        letterSpacing: 0,
        color: '#111827',
    },
    addLotRow: {
        marginTop: rs(14),
    },
    addLotBtn: {
        alignSelf: 'stretch',
    },
    addLotGrad: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: rs(12),
        paddingVertical: rs(10),
        borderRadius: rs(8),
        alignSelf: 'stretch',
        justifyContent: 'center',
    },
    addLotText: {
        marginLeft: rs(6),
        fontSize: rs(14),
        fontWeight: '600',
        color: '#FFFFFF',
    },
    addLotGreen: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: rs(12),
        paddingVertical: rs(10),
        borderRadius: rs(12),
        alignSelf: 'stretch',
        justifyContent: 'center',
        backgroundColor: '#73B386',
    },
    addLotGreenText: {
        marginLeft: rs(6),
        fontSize: rs(11),
        fontWeight: '700',
        color: '#FFFFFF',
    },
    apiStatusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: rs(10),
        backgroundColor: '#F0F7FF',
        borderRadius: rs(6),
        marginTop: rs(10),
    },
    apiStatusText: {
        fontSize: rs(11),
        color: '#5D768B',
        marginLeft: rs(8),
        fontWeight: '500',
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: rs(10),
        backgroundColor: '#FFEFEF',
        borderRadius: rs(6),
        marginTop: rs(10),
        borderWidth: 1,
        borderColor: '#FFCCCC',
    },
    errorText: {
        fontSize: rs(11),
        color: '#D32F2F',
        fontWeight: '500',
    },
    retryButton: {
        paddingHorizontal: rs(12),
        paddingVertical: rs(4),
        backgroundColor: '#D32F2F',
        borderRadius: rs(4),
    },
    retryButtonText: {
        fontSize: rs(10),
        color: '#FFFFFF',
        fontWeight: '600',
    },
    addLotError: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: rs(12),
        paddingVertical: rs(10),
        borderRadius: rs(12),
        alignSelf: 'stretch',
        justifyContent: 'center',
        backgroundColor: '#FF6B6B',
    },
    addLotErrorText: {
        marginLeft: rs(6),
        fontSize: rs(11),
        fontWeight: '700',
        color: '#FFFFFF',
    },
    lotPreviewContainer: {
        marginTop: rs(12),
        padding: rs(10),
        backgroundColor: '#F8F9FA',
        borderRadius: rs(6),
        borderWidth: 1,
        borderColor: '#E9ECEF',
    },
    lotPreviewTitle: {
        fontSize: rs(12),
        fontWeight: '600',
        color: '#233E55',
        marginBottom: rs(6),
    },
    lotPreviewItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: rs(4),
        borderBottomWidth: 0.5,
        borderBottomColor: '#E9ECEF',
    },
    lotPreviewNumber: {
        fontSize: rs(11),
        color: '#6C757D',
        fontWeight: '500',
    },
    lotPreviewQty: {
        fontSize: rs(11),
        color: '#233E55',
        fontWeight: '600',
    },
    lotPreviewMore: {
        fontSize: rs(10),
        color: '#6C757D',
        fontStyle: 'italic',
        marginTop: rs(4),
        textAlign: 'center',
    },
});