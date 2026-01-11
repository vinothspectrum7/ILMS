import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
} from 'react-native';
import ManDeliveryIcon from '../../assets/icons/Ship_Icons/ManDeliveryIcon';
import ConfirmationTickIcon from '../../assets/icons/Ship_Icons/ConfirmationTickIcon.svg';
import Ship_FooterModalButtonComponent from '../../components/shipping/Ship_FooterModalButtonComponent';

const ManPickConfirmPopup = ({
    visible,
    onCancel,
    onConfirm,
    selectedCount,
}) => {
    const [step, setStep] = useState('confirm'); // confirm | success | packingConfirm
    const [showPackingConfirm, setShowPackingConfirm] = useState(false);

    const handleConfirm = () => {
        onConfirm?.();
        setStep('success');

        // Show packing confirmation after success
        setTimeout(() => {
            setStep('confirm');
            setShowPackingConfirm(true);
        }, 1500);
    };

    const handlePackingConfirm = (proceed) => {
        setShowPackingConfirm(false);
        if (proceed) {
            // Handle proceeding to packing
            console.log('Proceeding to packing...');
        } else {
            // Handle not proceeding
            console.log('Not proceeding to packing...');
            onCancel?.();
        }
    };

    return (
        <>
            {/* Main Pick Confirmation Modal */}
            <Modal
                visible={visible}
                transparent
                animationType="fade"
                onRequestClose={onCancel}
            >
                <View style={styles.overlay}>
                    <View style={styles.popupContainer}>

                        {/* ================= CONFIRM VIEW ================= */}
                        {step === 'confirm' && (
                            <>
                                <View style={styles.topBlueSection}>
                                    <ManDeliveryIcon width={150} height={150} />
                                </View>

                                <Text style={styles.messageText}>
                                    Totally <Text style={styles.boldText}>{selectedCount} lines</Text> items{"\n"}
                                    have been selected.
                                </Text>

                                <Text style={styles.subText}>
                                    Are you sure want to confirm this pick.
                                </Text>

                                <View style={styles.footerWrapper}>
                                    <Ship_FooterModalButtonComponent
                                        leftLabel="Cancel"
                                        rightLabel="Confirm"
                                        onLeftPress={onCancel}
                                        onRightPress={handleConfirm}
                                        sticky={false}
                                    />
                                </View>
                            </>
                        )}

                        {/* ================= SUCCESS VIEW ================= */}
                        {step === 'success' && (
                            <View style={styles.successContainer}>
                                <ConfirmationTickIcon width={160} height={160} />

                                <Text style={styles.successText}>
                                    Items picked successfully
                                </Text>
                            </View>
                        )}

                    </View>
                </View>
            </Modal>

            {/* Packing Confirmation Modal */}
          <Modal
    visible={showPackingConfirm}
    transparent
    animationType="fade"
    onRequestClose={() => setShowPackingConfirm(false)}
>
    <View style={styles.overlay}>
        <View style={[styles.popupContainer, { height: 373 }]}>
            <View style={styles.successContainer}>
                <ConfirmationTickIcon width={160} height={160} />
                
                <Text style={styles.successText}>
                    Items picked successfully
                </Text>
                
                {/* Add this spacing view */}
                <View style={{ height: 40 }} />
            </View>
            
            {/* FOOTER SECTION */}
            <View style={styles.packingFooter}>
                <View style={styles.packingFooterContent}>
                    <View style={styles.packingQuestionContainer}>
                        <Text style={styles.packingQuestionText}>
                            Would you proceed the next to packing
                        </Text>
                    </View>
                    
                    <View style={styles.packingButtonContainer}>
                        <TouchableOpacity 
                            style={[styles.packingButton, styles.noButton]}
                            onPress={() => handlePackingConfirm(false)}
                        >
                            <Text style={styles.noButtonText}>No</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={[styles.packingButton, styles.yesButton]}
                            onPress={() => handlePackingConfirm(true)}
                        >
                            <Text style={styles.yesButtonText}>Yes</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    </View>
</Modal>
        </>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    popupContainer: {
        width: 372,
        height: 373,
        backgroundColor: '#FFFFFF',
        borderRadius: 4,
        overflow: 'hidden',
    },

    topBlueSection: {
        width: '100%',
        height: 165,
        backgroundColor: '#ECF1F7',
        justifyContent: 'center',
        alignItems: 'center',
    },

    messageText: {
        marginTop: 12,
        fontFamily: 'Mulish',
        fontSize: 16,
        lineHeight: 24,
        color: '#233E55',
        textAlign: 'center',
    },

    boldText: {
        fontWeight: '700',
    },

    subText: {
        marginTop: 6,
        fontFamily: 'Mulish',
        fontSize: 19,
        lineHeight: 21,
        color: '#667085',
        textAlign: 'center',
    },

    footerWrapper: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
    },

    /* SUCCESS */
    successContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },

    successText: {
        marginTop: 16,
        fontFamily: 'Mulish',
        fontWeight: '700',
        fontSize: 18,
        lineHeight: 25,
        color: '#233E55',
        textAlign: 'center',
    },
 

    /* PACKING CONFIRM FOOTER */
    packingFooter: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        height: 75,
        backgroundColor: '#ECF1F7',
        borderBottomRightRadius: 4,
        borderBottomLeftRadius: 4,
        justifyContent: 'center',
    },

    packingFooterContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingVertical: 16,
    },

    packingQuestionContainer: {
        flex: 1,
    },

    packingQuestionText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#233E55',
        lineHeight: 21,
    },

    packingButtonContainer: {
        flexDirection: 'row',
        gap: 12,
        marginLeft: 16,
    },

    packingButton: {
        width: 64,
        height: 40,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },

    yesButton: {
        backgroundColor: '#233E55',
    },

    noButton: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#D0D5DD',
    },

    yesButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },

    noButtonText: {
        color: '#5F6B7A',
        fontSize: 14,
        fontWeight: '600',
    },
});

export default ManPickConfirmPopup;