import React, { useState, useEffect } from 'react';
import { Modal, View, Text, Pressable, ScrollView, TextInput, TouchableOpacity, StyleSheet, Dimensions, Image } from 'react-native';
import TotalInspectedIcon from '../../assets/icons/totalInspected.svg';
import LinearGradient from 'react-native-linear-gradient';
import PassedIcon from '../../assets/icons/passed.svg';
import FailedIcon from '../../assets/icons/failed.svg';
import OnHoldIcon from '../../assets/icons/onhold.svg';
import UploadIcon from '../../assets/icons/upload.svg';
import CameraIcon from '../../assets/icons/camera.svg';
import TickIcon from '../../assets/icons/tick.svg';
import { useNavigation } from '@react-navigation/native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';


const Rec_InspectPopup = ({
    visible,
    onClose,
    lineLabel = 'Line 1',
    onComplete,
    lineQty = 0,
    
}) => {
   const navigation = useNavigation();
    const [passedQty, setPassedQty] = useState(0);
    const [failedQty, setFailedQty] = useState(0);
    const [holdQty, setHoldQty] = useState(0);
    const [notes, setNotes] = useState('');
    const [images, setImages] = useState([]);
    const [isEditingPassed, setIsEditingPassed] = useState(false);
    const [isEditingFailed, setIsEditingFailed] = useState(false);
    const [isEditingHold, setIsEditingHold] = useState(false);

     

    const handlePassedInput = (text) => {
        const num = parseInt(text) || 0;
        setPassedQty(num);
    };

    const handleFailedInput = (text) => {
        const num = parseInt(text) || 0;
        setFailedQty(num);
    };

    const handleHoldInput = (text) => {
        const num = parseInt(text) || 0;
        setHoldQty(num);
    };

    const handleUpload = () => {
        launchImageLibrary({ mediaType: "photo", quality: 0.8 }, (res) => {
            if (res.didCancel || res.errorCode) return;
            const uri = res.assets?.[0]?.uri;
            if (uri) setImages(prev => [...prev, uri]);
        });
    };

    const handleCamera = () => {
        launchCamera({ mediaType: "photo", saveToPhotos: true, quality: 0.8 }, (res) => {
            if (res.didCancel || res.errorCode) return;
            const uri = res.assets?.[0]?.uri;
            if (uri) setImages(prev => [...prev, uri]);
        });
    };

    const inspected = passedQty + failedQty + holdQty;
    const isMaxReached = inspected >= lineQty;

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.popup}>
                    <View style={styles.header}>
                        <Text style={styles.headerText}>{lineLabel} - Inspection</Text>
                        <Pressable onPress={onClose} style={{ padding: 8 }}>
                            <Text style={[styles.closeText, { fontSize: 20, fontWeight: '700', color: '#000' }]}>X</Text>
                        </Pressable>
                    </View>
                    <ScrollView contentContainerStyle={styles.content}>
                        <View style={styles.totalCard}>
                            <View style={styles.totalCardHeader}>
                                <View style={styles.leftBox}>
                                    <TotalInspectedIcon width={24} height={24} />
                                </View>
                                <View style={{ flex: 1, flexDirection: 'column' }}>
                                    <Text style={styles.totalLabel}>Total Inspected</Text>
                                    <Text style={styles.progressLabel}>Inspection Progress</Text>
                                </View>
                                <View style={{ justifyContent: 'flex-start', alignItems: 'flex-end' }}>
                                    <Text style={styles.progressNumber}>
                                        <Text style={styles.progressNumberValue}>
                                            {passedQty + failedQty + holdQty}
                                        </Text>
                                        <Text style={styles.progressNumberText}>/{lineQty}</Text>
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.progressTextBox}>
                                <Text style={styles.progressText}>Progress</Text>
                            </View>

                            <View style={styles.progressRow}>
                                <View style={styles.progressContainer}>
                                    <View style={styles.progressBackground}>
                                        <LinearGradient
                                            colors={['#73B386', '#168035']}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                            style={{
                                                width: `${((passedQty + failedQty + holdQty) / lineQty) * 100}%`,
                                                height: '100%',
                                            }}
                                        />
                                    </View>
                                </View>
                            </View>
                        </View>

                        <View style={{
                            flexDirection: 'row', alignItems: 'center', width: 371, height: 56, borderRadius: 8, backgroundColor: '#EEFDF8',
                            shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 2, elevation: 3,
                            paddingHorizontal: 16, marginBottom: 12,
                        }}>
                            <PassedIcon width={24} height={24} style={{ marginRight: 12 }} />
                            <Text style={{ color: '#168035', fontSize: 16, fontWeight: '700', flex: 1 }}>Passed Qty</Text>

                            <View style={styles.qtyControl}>

                                <Pressable
                                    onPress={() => setPassedQty(Math.max(0, passedQty - 1))}
                                    style={[styles.qtyBtn, styles.qtyBtnLeft, { backgroundColor: '#168035' }]}
                                >
                                    <Text style={[styles.qtyBtnText, { color: '#fff' }]}>-</Text>
                                </Pressable>

                                {isEditingPassed ? (
                                    <TextInput
                                        style={[styles.qtyInput, { color: '#168035' }]}
                                        value={passedQty.toString()}
                                        onChangeText={handlePassedInput}
                                        onBlur={() => setIsEditingPassed(false)}
                                        keyboardType="numeric"
                                        autoFocus
                                        maxLength={3}
                                        selectTextOnFocus
                                    />
                                ) : (
                                    <Pressable
                                        style={[styles.qtyValueContainer, { backgroundColor: '#168035' }]}
                                        onPress={() => setIsEditingPassed(true)}
                                    >
                                        <Text style={[styles.qtyValue, { color: '#fff' }]}>{passedQty}</Text>
                                    </Pressable>
                                )}

                                <Pressable
                                    onPress={() => {
                                        const total = passedQty + failedQty + holdQty;
                                        if (total >= lineQty) return;
                                        setPassedQty(passedQty + 1);
                                    }}
                                    style={[styles.qtyBtn, styles.qtyBtnRight, { backgroundColor: '#168035' }]}
                                >
                                    <Text style={[styles.qtyBtnText, { color: '#fff' }]}>+</Text>
                                </Pressable>

                            </View>
                        </View>

                        <View style={{
                            flexDirection: 'row', alignItems: 'center', width: 371, height: 56, borderRadius: 8, backgroundColor: '#FDF2F7', shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 2, elevation: 3, paddingHorizontal: 16, marginBottom: 12,
                        }}>
                            <FailedIcon width={24} height={24} style={{ marginRight: 12 }} />
                            <Text style={{ color: '#DA1E28', fontSize: 16, fontWeight: '700', flex: 1 }}>Failed Qty</Text>

                            <View style={styles.qtyControl}>
                                <Pressable
                                    onPress={() => setFailedQty(Math.max(0, failedQty - 1))}
                                    style={[styles.qtyBtn, styles.qtyBtnLeft, { backgroundColor: '#DA1E28' }]}
                                >
                                    <Text style={[styles.qtyBtnText, { color: '#fff' }]}>-</Text>
                                </Pressable>

                                {isEditingFailed ? (
                                    <TextInput
                                        style={[styles.qtyInput, { color: '#DA1E28' }]}
                                        value={failedQty.toString()}
                                        onChangeText={handleFailedInput}
                                        onBlur={() => setIsEditingFailed(false)}
                                        keyboardType="numeric"
                                        autoFocus
                                        maxLength={3}
                                        selectTextOnFocus
                                    />
                                ) : (
                                    <Pressable
                                        style={[styles.qtyValueContainer, { backgroundColor: '#DA1E28' }]}
                                        onPress={() => setIsEditingFailed(true)}
                                    >
                                        <Text style={[styles.qtyValue, { color: '#fff' }]}>{failedQty}</Text>
                                    </Pressable>
                                )}

                                <Pressable
                                    onPress={() => {
                                        const total = passedQty + failedQty + holdQty;
                                        if (total >= lineQty) return;
                                        setFailedQty(failedQty + 1);
                                    }}
                                    style={[styles.qtyBtn, styles.qtyBtnRight, { backgroundColor: '#DA1E28' }]}
                                >
                                    <Text style={[styles.qtyBtnText, { color: '#fff' }]}>+</Text>
                                </Pressable>
                            </View>
                        </View>


                        <View style={{
                            flexDirection: 'row', alignItems: 'center', width: 371, height: 56, borderRadius: 8, backgroundColor: '#FFF8EC', shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 2, elevation: 3, paddingHorizontal: 16, marginBottom: 12,
                        }}>
                            <OnHoldIcon width={24} height={24} style={{ marginRight: 12 }} />
                            <Text style={{ color: '#F06000', fontSize: 16, fontWeight: '700', flex: 1 }}>
                                On Hold Qty
                            </Text>

                            <View style={styles.qtyControl}>
                                <Pressable
                                    onPress={() => setHoldQty(Math.max(0, holdQty - 1))}
                                    style={[styles.qtyBtn, styles.qtyBtnLeft, { backgroundColor: '#F06000' }]}
                                >
                                    <Text style={[styles.qtyBtnText, { color: '#fff' }]}>-</Text>
                                </Pressable>

                                {isEditingHold ? (
                                    <TextInput
                                        style={[styles.qtyInput, { color: '#F06000' }]}
                                        value={holdQty.toString()}
                                        onChangeText={handleHoldInput}
                                        onBlur={() => setIsEditingHold(false)}
                                        keyboardType="numeric"
                                        autoFocus
                                        maxLength={3}
                                        selectTextOnFocus
                                    />
                                ) : (
                                    <Pressable
                                        style={[styles.qtyValueContainer, { backgroundColor: '#F06000' }]}
                                        onPress={() => setIsEditingHold(true)}
                                    >
                                        <Text style={[styles.qtyValue, { color: '#fff' }]}>{holdQty}</Text>
                                    </Pressable>
                                )}

                                <Pressable
                                    onPress={() => {
                                        const total = passedQty + failedQty + holdQty;
                                        if (total >= lineQty) return;
                                        setHoldQty(holdQty + 1);
                                    }}
                                    style={[styles.qtyBtn, styles.qtyBtnRight, { backgroundColor: '#F06000' }]}
                                >
                                    <Text style={[styles.qtyBtnText, { color: '#fff' }]}>+</Text>
                                </Pressable>
                            </View>
                        </View>


                        <View style={styles.notesBox}>
                            <View style={styles.outerNotesBox}>
                                <Text style={styles.outerLabel}>Inspection Notes</Text>
                                <View style={styles.innerNotesBox}>
                                    <TextInput
                                        style={styles.innerNotesInput}
                                        placeholder="Maximum 100 characters"
                                        maxLength={100}
                                        multiline
                                        value={notes}
                                        onChangeText={setNotes}
                                        placeholderTextColor="#A0A0A0"
                                    />
                                </View>
                            </View>
                        </View>

                        <View style={styles.photosOuterBox}>
                            <Text style={styles.photosLabel}>Photos</Text>

                            <View style={[styles.photosInnerBox, { marginBottom: images.length > 0 ? 16 : 0 }]}>
                                <TouchableOpacity style={styles.photoBtnLeft} onPress={handleUpload}>
                                    <UploadIcon width={20} height={20} />
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.photoBtnRight} onPress={handleCamera}>
                                    <CameraIcon width={20} height={20} />
                                </TouchableOpacity>
                            </View>
                            {images.length > 0 && (
                                <View style={{ marginTop: 12, marginBottom: 20 }}>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                        {images.map((img, index) => (
                                            <View key={index} style={{ marginRight: 8, position: 'relative' }}>
                                                <View style={{
                                                    width: 60,
                                                    height: 60,
                                                    borderRadius: 8,
                                                    overflow: 'hidden',
                                                }}>
                                                    <Image
                                                        source={{ uri: img }}
                                                        style={{ width: "100%", height: "100%" }}
                                                        resizeMode="cover"
                                                    />
                                                </View>
                                                <Pressable
                                                    onPress={() => {
                                                        setImages(images.filter((_, i) => i !== index));
                                                    }}
                                                    style={{
                                                        position: "absolute",
                                                        top: -5,
                                                        right: -5,
                                                        backgroundColor: "#DA1E28",
                                                        width: 20,
                                                        height: 20,
                                                        borderRadius: 10,
                                                        justifyContent: "center",
                                                        alignItems: "center",
                                                        borderWidth: 1.5,
                                                        borderColor: '#FFFFFF'
                                                    }}
                                                >
                                                    <Text style={{
                                                        color: "#fff",
                                                        fontSize: 10,
                                                        fontWeight: "800",
                                                        lineHeight: 10
                                                    }}>X</Text>
                                                </Pressable>
                                            </View>
                                        ))}
                                    </ScrollView>

                                    <TouchableOpacity
                                        onPress={() => console.log("Open View All")}
                                        style={{ marginTop: 8, }}
                                    >
                                        <Text style={{ color: "#033EFF", fontWeight: "700" }}>View All</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                        <Pressable
                            style={styles.completeBtn}
                            onPress={() => {
                                const inspectionData = {
                                    passedQty,
                                    failedQty,
                                    holdQty,    
                                    notes,
                                    images,
                                      lineLabel: lineLabel, 
      lineQty: lineQty, 
                                };

                                if (onComplete) {
                                    onComplete(inspectionData);
                                }
                            }}
                        >
                            <TickIcon width={16} height={16} style={styles.tickIcon} />
                            <Text style={styles.completeText}>Complete Inspection</Text>
                        </Pressable>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'transparent',
        justifyContent: 'flex-start'
    },
    popup: {
        width: 410,
        alignSelf: 'center',
        marginTop: 120,
        marginHorizontal: 21,
        backgroundColor: '#fff',
        borderRadius: 8,
        maxHeight: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 10,
        overflow: 'hidden'
    },
    header: {
        height: 43,
        backgroundColor: '#ECF1F7',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16
    },
    headerText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#233E55'
    },
    closeText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#233E55'
    },
    content: {
        padding: 16
    },

    totalCard: {
        width: 371,
        height: 133,
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 5,
        marginBottom: 20
    },
    totalCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16
    },
    leftBox: {
        width: 44,
        height: 36,
        borderRadius: 9,
        backgroundColor: '#033EFF',
        opacity: 0.15,
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center'
    },
    totalLabel: {
        fontWeight: '700',
        fontSize: 14,
        color: '#000'
    },
    progressLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#F06000',
        marginTop: 2
    },
    progressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    progressContainer: {
        flex: 1,
        marginRight: 12
    },
    progressBackground: {
        height: 11,
        borderRadius: 8,
        backgroundColor: '#EFEFF0',
        overflow: 'hidden'
    },
    progressNumber: {
        fontSize: 13,
        fontWeight: '600',
        color: '#111827'
    },
    progressNumberValue: {
        fontSize: 20,
        fontWeight: '700',
        color: '#F06000',
    },
    progressNumberText: {
        fontSize: 17,
        fontWeight: '600',
        color: '#111827',
    },
    progressTextBox: {
        marginBottom: 6
    },
    progressText: {
        fontWeight: '700',
        fontSize: 14,
        color: '#111827'
    },

    qtyControl: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 32,
        borderRadius: 4,
        overflow: 'hidden',
    },
    qtyBtn: {
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    qtyBtnLeft: {
        borderTopLeftRadius: 4,
        borderBottomLeftRadius: 4,
    },
    qtyBtnRight: {
        borderTopRightRadius: 4,
        borderBottomRightRadius: 4,
    },
    qtyBtnText: {
        fontSize: 16,
        fontWeight: '600'
    },
    qtyValueContainer: {
        width: 40,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    qtyValue: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
    qtyInput: {
        width: 40,
        height: 32,
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
        backgroundColor: 'transparent',
        borderWidth: 0,
        borderColor: '#D9E4EE',
        borderRadius: 0,
    },

    notesBox: {
        marginVertical: 16
    },
    outerNotesBox: {
        width: 367,
        height: 141,
        marginTop: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#EFEFF0',
        padding: 12
    },
    outerLabel: {
        fontWeight: '700',
        fontSize: 12,
        color: '#595A5C',
        marginBottom: 8
    },
    innerNotesBox: {
        width: 321,
        height: 91,
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#D9E4EE',
        padding: 8
    },
    innerNotesInput: {
        fontWeight: '700',
        fontSize: 12,
        height: '100%',
        textAlignVertical: 'top',
        color: '#000000'
    },

    photosOuterBox: {
        width: 368,
        // height: 85,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#EFEFF0',
        padding: 12,
        marginBottom: 16
    },
    photosLabel: {
        fontWeight: '700',
        fontSize: 12,
        color: '#595A5C',
        marginBottom: 8
    },
    photosInnerBox: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    photoBtnLeft: {
        width: 157,
        height: 35,
        backgroundColor: '#ECF1F7',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center'
    },
    photoBtnRight: {
        width: 157,
        height: 35,
        backgroundColor: '#ECF1F7',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#EFEFF0'
    },

    completeBtn: {
        backgroundColor: '#5D768B',
        width: 352,
        height: 35,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        flexDirection: 'row',
        padding: 10,
        gap: 10,
    },
    completeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '700',
        fontFamily: 'Mulish',
    },
    tickIcon: {
        marginRight: 4,
    },
});

export default Rec_InspectPopup;