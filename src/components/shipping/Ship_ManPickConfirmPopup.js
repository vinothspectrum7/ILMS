import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useShippingStore } from '../../store/shippingStore';
import ManDeliveryIcon from '../../assets/icons/Ship_Icons/ManDeliveryIcon';
import ConfirmationTickIcon from '../../assets/icons/Ship_Icons/ConfirmationTickIcon.svg';
import Ship_FooterModalButtonComponent from '../../components/shipping/Ship_FooterModalButtonComponent';

const ManPickConfirmPopup = ({
    visible,
    onCancel,
    selectedCount,
    onYes,
    onNo,
    selectedTransaction,
}) => {
    const navigation = useNavigation();
    const { setTransactionStatus } = useShippingStore();

    const [step, setStep] = useState('confirm');
    const [showPackingConfirm, setShowPackingConfirm] = useState(false);

    const handleConfirm = () => {
        setStep('success');
        setShowPackingConfirm(true);
    };

    const handlePackingConfirm = (proceed) => {
        setShowPackingConfirm(false);
        setStep('confirm');
        onCancel?.(); // Close the main modal

        if (proceed) {
            // If Yes, call onYes
            onYes?.();
        } else {
            // If No, update status to Ready To Pack and navigate to dashboard
            if (selectedTransaction?.deliveryId) {
                setTransactionStatus(selectedTransaction.deliveryId, 'Ready To Pack');
            }
            
            navigation.reset({
                index: 0,
                routes: [
                    {
                        name: 'ShipDashboard',
                        params: {
                            status: 'All',
                            refresh: true,
                            packMode: 'MANUAL',
                        },
                    },
                ],
            });
        }
    };

    // Just close the modal without any action
    const handleSimpleCancel = () => {
        onCancel?.();
    };

    return (
        <>
            <Modal
                visible={visible}
                transparent
                animationType="fade"
                onRequestClose={handleSimpleCancel}
            >
                <View style={styles.overlay}>
                    <View style={styles.popupContainer}>
                        {step === 'confirm' && (
                            <>
                                <View style={styles.topBlueSection}>
                                    <ManDeliveryIcon width={150} height={150} />
                                </View>

                                <View style={styles.textContent}>
                                    <Text style={styles.messageText}>
                                        Totally <Text style={styles.boldText}>{selectedCount} lines</Text> items
                                        {"\n"}
                                        have been selected.
                                    </Text>

                                    <Text style={styles.subText}>
                                        Are you sure want to confirm this pick.
                                    </Text>
                                </View>

                                <View style={styles.footerWrapper}>
                                    <Ship_FooterModalButtonComponent
                                        leftLabel="Cancel"
                                        rightLabel="Confirm"
                                        onLeftPress={handleSimpleCancel}  // Just close, no action
                                        onRightPress={handleConfirm}      // Show 2nd popup
                                        sticky={false}
                                    />
                                </View>
                            </>
                        )}
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

            <Modal
                visible={showPackingConfirm}
                transparent
                animationType="fade"
                onRequestClose={() => {
                    setShowPackingConfirm(false);
                    handleSimpleCancel(); // Just close
                }}
            >
                <View style={styles.overlay}>
                    <View style={styles.secondPopupContainer}>
                        <View style={styles.secondSuccessContainer}>
                            <ConfirmationTickIcon width={160} height={160} />
                            <Text style={styles.successText}>
                                Items picked successfully
                            </Text>
                        </View>

                        <View style={styles.footerSection}>
                            <View style={styles.footerRow}>
                                <View style={styles.questionContainer}>
                                    <Text style={styles.questionText}>Would you proceed the</Text>
                                    <Text style={styles.questionText}>
                                        next to packing
                                    </Text>
                                </View>

                                <View style={styles.buttonContainer}>
                                    <TouchableOpacity
                                        style={[styles.button, styles.yesButton]}
                                        onPress={() => handlePackingConfirm(true)}
                                    >
                                        <Text style={styles.yesButtonText}>Yes</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.button, styles.noButton]}
                                        onPress={() => handlePackingConfirm(false)}
                                    >
                                        <Text style={styles.noButtonText}>No</Text>
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

    secondPopupContainer: {
        width: 372,
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

    textContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 10,
        paddingBottom: 20,
    },

    messageText: {
        fontFamily: 'Mulish',
        fontSize: 16,
        lineHeight: 24,
        color: '#233E55',
        textAlign: 'center',
        marginBottom: 6,
    },

    boldText: {
        fontWeight: '700',
    },

    subText: {
        fontFamily: 'Mulish',
        fontSize: 19,
        lineHeight: 21,
        color: '#667085',
        textAlign: 'center',
    },

    footerWrapper: {
        paddingHorizontal: 24,
        paddingBottom: 16,
        paddingTop: 8,
    },

    successContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },

    secondSuccessContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 30,
        paddingBottom: 20,
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

    // Footer styles for second modal (Yes/No buttons)
    footerSection: {
        backgroundColor: '#ECF1F7',
        paddingHorizontal: 24,
        paddingVertical: 16,
    },

    footerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    questionContainer: {
        flex: 1,
    },

    questionText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#233E55',
        lineHeight: 18,
    },

    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
        marginLeft: 16,
    },

    button: {
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
        fontWeight: '600',
    },

    noButtonText: {
        color: '#5F6B7A',
        fontWeight: '600',
    },
});

export default ManPickConfirmPopup;