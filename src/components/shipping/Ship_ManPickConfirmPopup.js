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
    selectedCount,
    onYes,
    onNo,
}) => {

    const [step, setStep] = useState('confirm');
    const [showPackingConfirm, setShowPackingConfirm] = useState(false);

    const handleConfirm = () => {
        setStep('success');
        setShowPackingConfirm(true);
    };

    const handlePackingConfirm = (proceed) => {
        setShowPackingConfirm(false);
        setStep('confirm');
        onCancel?.();

        if (proceed) {
            onYes?.();
        } else {
            onNo?.();
        }
    };

    return (
        <>
            <Modal
                visible={visible}
                transparent
                animationType="fade"
                onRequestClose={onCancel}
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
                                        onLeftPress={onCancel}
                                        onRightPress={handleConfirm}
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
                onRequestClose={() => setShowPackingConfirm(false)}
            >
                <View style={styles.overlay}>
                    <View style={styles.secondPopupContainer}>
                        <View style={styles.secondSuccessContainer}>
                            <ConfirmationTickIcon width={160} height={160} />
                            <Text style={styles.successText}>
                                Items picked successfully
                            </Text>
                        </View>

                        <View style={styles.secondFooter}>
                            <Text style={styles.packingQuestionText}>
                                Would you proceed the next to packing
                            </Text>
                            
                            <View style={styles.secondButtonWrapper}>
                                <Ship_FooterModalButtonComponent
                                    leftLabel="No"
                                    rightLabel="Yes"
                                    onLeftPress={() => handlePackingConfirm(false)}
                                    onRightPress={() => handlePackingConfirm(true)}
                                    sticky={false}
                                />
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

    secondFooter: {
        paddingHorizontal: 24,
        paddingTop: 10,
        paddingBottom: 20,
        alignItems: 'center',
    },

    packingQuestionText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#233E55',
        lineHeight: 21,
        fontFamily: 'Mulish',
        textAlign: 'center',
        marginBottom: 12,
    },

    secondButtonWrapper: {
        width: '100%',
    },
});

export default ManPickConfirmPopup;