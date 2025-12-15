import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Toast from 'react-native-toast-message';
import CloseIcon from '../../assets/icons/close.svg';
import PhotoUploadIcon from '../../assets/icons/photouploadicon.svg';
import PhotoCaptureIcon from '../../assets/icons/photocaptureicon.svg';
import DeleteAttachmentIcon from '../../assets/icons/deleteattachmenticon.svg';
import ErrorIcon from '../../assets/icons/error.svg';
import Rec_CustomNumericInput from '../../components/receive/Rec_CustomNumericInput';
import Rec_DropDown from '../../components/receive/Rec_DropDown';
import SingleFooterBtnComponent from '../../components/SingleFooterBtnComponent';
import InspectTickIcon from '../../assets/icons/inspectlotserialtickicon.svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BASE_WIDTH = 375;
const rs = v => (SCREEN_WIDTH / BASE_WIDTH) * v;

const toUriList = imgs => {
  if (!Array.isArray(imgs)) return [];
  return imgs
    .map(x => {
      if (typeof x === 'string') return x;
      if (x && typeof x === 'object') return String(x.uri || '');
      return '';
    })
    .filter(Boolean);
};

const normalizeSerialArray = list => {
  if (!Array.isArray(list)) return [];
  return list
    .map(s => {
      if (typeof s === 'string') return s.trim();
      if (s && typeof s === 'object') {
        return String(s.serialNo ?? s.serial ?? '').trim();
      }
      return '';
    })
    .filter(Boolean);
};

export default function Rec_InspectLotSerialModalPopup({
  visible,
  onClose,
  lot,
  lotIndex,
  itemName = '',
  itemCode = '',
  onComplete,
  initialInspectionData = null,
  onAddSerial,
  hasSerialInspection,
}) {
  const lotQty = useMemo(() => Number(lot?.qty || 0), [lot]);

  const [inspectQty, setInspectQty] = useState(0);
  const [status, setStatus] = useState(null);
  const [notes, setNotes] = useState('');
  const [images, setImages] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  const didInitRef = useRef(false);

  const statusList = useMemo(
    () => [
      { id: 1, name: 'Above Average' },
      { id: 2, name: 'Average' },
      { id: 3, name: 'Below Average' },
      { id: 4, name: 'Excellent' },
      { id: 5, name: 'Reject and Notify' },
      { id: 6, name: 'Unacceptable' },
    ],
    [],
  );

  const clearError = useCallback(() => setErrorMsg(''), []);

  const addUris = useCallback(uris => {
    const list = (uris || []).map(String).filter(Boolean);
    if (!list.length) return;

    setImages(prev => {
      const existing = new Set((prev || []).map(x => String(x)));
      const next = [...(prev || [])];
      list.forEach(u => {
        if (!existing.has(u)) next.push(u);
      });
      return next;
    });

    Toast.show({ type: 'success', text1: 'Image Attached' });
  }, []);

  const handleUpload = useCallback(async () => {
    clearError();
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.85,
      selectionLimit: 0,
    });
    if (result?.didCancel || result?.errorCode) return;
    const uris = (result?.assets || []).map(a => a?.uri).filter(Boolean);
    addUris(uris);
  }, [addUris, clearError]);

  const handleCamera = useCallback(async () => {
    clearError();
    const result = await launchCamera({
      mediaType: 'photo',
      quality: 0.85,
      saveToPhotos: true,
    });
    if (result?.didCancel || result?.errorCode) return;
    const uris = (result?.assets || []).map(a => a?.uri).filter(Boolean);
    addUris(uris);
  }, [addUris, clearError]);

  const handleRemoveImage = useCallback(
    uri => {
      clearError();
      setImages(prev => (prev || []).filter(x => x !== uri));
    },
    [clearError],
  );

  const resolveStatusValue = useCallback(
    preStatus => {
      if (!preStatus) return null;
      if (typeof preStatus === 'string') {
        const found = statusList.find(s => String(s.name) === String(preStatus));
        return found || null;
      }
      if (typeof preStatus === 'object' && preStatus?.name) {
        const found = statusList.find(s => String(s.name) === String(preStatus.name));
        return found || preStatus;
      }
      return null;
    },
    [statusList],
  );

  useEffect(() => {
    if (!visible) {
      didInitRef.current = false;
      setErrorMsg('');
      return;
    }

    if (didInitRef.current) return;
    didInitRef.current = true;

    const pre = initialInspectionData || null;
    const preQty = Number(pre?.inspectQty ?? pre?.qty ?? 0);
    const preNotes = String(pre?.notes ?? '');
    const preImgs = toUriList(pre?.images ?? pre?.attachments);

    setInspectQty(preQty > 0 ? preQty : 0);
    setStatus(resolveStatusValue(pre?.status));
    setNotes(preNotes);
    setImages(preImgs);
    setErrorMsg('');
  }, [visible, initialInspectionData, resolveStatusValue]);

  const canConfirm = useMemo(() => {
    const qtyOk = lotQty > 0 && Number(inspectQty) === lotQty;
    const statusOk = !!status;
    return qtyOk && statusOk && !!hasSerialInspection;
  }, [inspectQty, lotQty, status, hasSerialInspection]);

  const handleConfirm = useCallback(() => {
    clearError();

    if (!canConfirm) {
      setErrorMsg('Complete Qty, Status and Serial Inspection');
      return;
    }

    const serials = normalizeSerialArray(initialInspectionData?.serials);

    if (serials.length !== lotQty) {
      setErrorMsg('Complete Qty, Status and Serial Inspection');
      return;
    }

    if (onComplete) {
      onComplete({
        inspectQty: lotQty,
        qty: lotQty,
        status,
        notes,
        images,
        attachments: images,
        serials,
        lotIndex,
        lotDetails: lot,
      });
    }

    if (onClose) onClose();
  }, [canConfirm, clearError, images, initialInspectionData, lot, lotIndex, lotQty, notes, onClose, onComplete, status]);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.modalContainer}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Inspection</Text>
              <TouchableOpacity onPress={onClose} activeOpacity={0.85}>
                <CloseIcon width={rs(18)} height={rs(18)} />
              </TouchableOpacity>
            </View>

            {!!errorMsg && (
              <View style={styles.errorBanner}>
                <ErrorIcon width={rs(16)} height={rs(16)} />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            )}

            <View style={styles.body}>
              <View style={styles.lotCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.lotId}>{lot?.lotNumber || 'N/A'}</Text>
                  <View style={styles.lotRow}>
                    <Text style={styles.smallText}>Mfg: {lot?.mfgDate || '-'}</Text>
                    <Text style={styles.smallText}>Exp: {lot?.expDate || '-'}</Text>
                  </View>
                </View>
                <View style={styles.qtyBox}>
                  <Text style={styles.qtyLabel}>Qty</Text>
                  <Text style={styles.qtyValue}>{lotQty}</Text>
                </View>
              </View>

              <View style={styles.sectionBlock}>
                <Text style={styles.sectionTitle}>Inspection Qty</Text>
                <Rec_CustomNumericInput
                  value={inspectQty}
                  setValue={v => {
                    clearError();
                    const raw = typeof v === 'function' ? v(inspectQty) : v;
                    setInspectQty(Number(raw || 0));
                  }}
                  min={0}
                  max={lotQty}
                  step={1}
                  width="100%"
                  height={rs(42)}
                  isSelected={true}
                  disabledinput={false}
                />
              </View>

              <View style={styles.sectionBlock}>
                <Rec_DropDown
                  label=""
                  placeholder="Select Status"
                  value={status}
                  onChange={val => {
                    clearError();
                    setStatus(val);
                  }}
                  items={statusList}
                />
              </View>

              <View style={styles.sectionBlock}>
                <View style={styles.outerNotesBox}>
                  <Text style={styles.outerLabel}>Inspection Notes</Text>
                  <View style={styles.innerNotesBox}>
                    <TextInput
                      style={styles.innerNotesInput}
                      placeholder="Maximum 100 characters"
                      maxLength={100}
                      multiline
                      value={notes}
                      onChangeText={t => {
                        clearError();
                        setNotes(t);
                      }}
                      placeholderTextColor="#A0A0A0"
                      textAlignVertical="top"
                    />
                    <Text style={styles.charCount}>{notes.length}/100</Text>
                  </View>
                </View>
              </View>

              <View style={styles.sectionBlock}>
                <Text style={styles.photosLabel}>Photos</Text>

                <View style={styles.photoButtonsWrap}>
                  <TouchableOpacity style={styles.photoBtn} onPress={handleUpload} activeOpacity={0.85}>
                    <PhotoUploadIcon width={rs(20)} height={rs(20)} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.photoBtn, { marginLeft: rs(10) }]}
                    onPress={handleCamera}
                    activeOpacity={0.85}
                  >
                    <PhotoCaptureIcon width={rs(20)} height={rs(20)} />
                  </TouchableOpacity>
                </View>

                {images.length > 0 && (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.imagesScroll}
                    contentContainerStyle={styles.imagesScrollContent}
                  >
                    {images.map(uri => (
                      <View key={uri} style={styles.thumbWrap}>
                        <Image source={{ uri }} style={styles.thumbImg} resizeMode="cover" />
                        <TouchableOpacity
                          style={styles.thumbDeleteBtn}
                          onPress={() => handleRemoveImage(uri)}
                          activeOpacity={0.85}
                        >
                          <DeleteAttachmentIcon width={rs(16)} height={rs(16)} />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </ScrollView>
                )}
              </View>

              <View style={styles.footerWrap}>
                <TouchableOpacity
                  style={[styles.addSerialBtn, hasSerialInspection && styles.serialAdded]}
                  activeOpacity={0.9}
                  onPress={onAddSerial}
                >
                  {hasSerialInspection && <InspectTickIcon width={16} height={16} />}
                  <Text style={[styles.addSerialText, hasSerialInspection && styles.addedText]}>
                    {hasSerialInspection ? 'Serial Added' : 'Add Serial'}
                  </Text>
                </TouchableOpacity>

                <SingleFooterBtnComponent
                  label="Confirm Inspect"
                  onPress={handleConfirm}
                  enabled={canConfirm}
                  containerStyle={{ marginBottom: 0 }}
                  buttonStyle={{ width: '100%', marginStart: 0 }}
                  labelStyle={{ fontSize: 14 }}
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  scrollContainer: { flex: 1 },
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
  headerTitle: { fontSize: rs(16), fontWeight: '600', color: '#111827' },
  errorBanner: {
    marginTop: rs(10),
    marginHorizontal: rs(16),
    borderRadius: rs(8),
    backgroundColor: '#FDE3E3',
    paddingVertical: rs(8),
    paddingHorizontal: rs(10),
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: { color: '#D32F2F', fontSize: rs(12), fontWeight: '600', marginLeft: rs(6), flex: 1 },
  body: { paddingHorizontal: rs(16), paddingTop: rs(14), paddingBottom: rs(16) },
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
  lotId: { color: '#FFFFFF', fontSize: rs(13), fontWeight: '600' },
  lotRow: { flexDirection: 'row', marginTop: rs(2) },
  smallText: { color: '#DCE3EA', fontSize: rs(11), marginRight: rs(18) },
  qtyBox: { alignItems: 'flex-end' },
  qtyLabel: { color: '#DCE3EA', fontSize: rs(11) },
  qtyValue: { color: '#FFFFFF', fontSize: rs(16), fontWeight: '700' },
  sectionBlock: { width: '100%', marginTop: rs(16) },
  sectionTitle: { fontSize: rs(16), fontWeight: '600', marginBottom: rs(10), color: '#111827' },
  outerNotesBox: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: rs(6),
    padding: rs(14),
    backgroundColor: '#FFFFFF',
    width: '100%',
  },
  outerLabel: { fontSize: rs(14), fontWeight: '600', color: '#111827', marginBottom: rs(12) },
  innerNotesBox: {
    width: '100%',
    height: rs(90),
    borderRadius: rs(10),
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9E4EE',
    position: 'relative',
    overflow: 'hidden',
  },
  innerNotesInput: { fontSize: rs(12), color: '#111827', padding: rs(10), height: '100%', textAlignVertical: 'top' },
  charCount: { position: 'absolute', bottom: rs(8), right: rs(12), fontSize: rs(10), color: '#9CA3AF' },
  photosLabel: { fontSize: rs(14), fontWeight: '600', color: '#111827', marginBottom: rs(12) },
  photoButtonsWrap: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' },
  photoBtn: { flex: 1, height: rs(44), backgroundColor: '#ECF1F7', borderRadius: rs(10), justifyContent: 'center', alignItems: 'center' },
  imagesScroll: { marginTop: rs(12) },
  imagesScrollContent: { paddingBottom: rs(4) },
  thumbWrap: {
    width: rs(62),
    height: rs(62),
    borderRadius: rs(8),
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    marginRight: rs(10),
    ...Platform.select({
      android: { elevation: 1 },
      ios: { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 3, shadowOffset: { width: 0, height: 2 } },
    }),
  },
  thumbImg: { width: '100%', height: '100%' },
  thumbDeleteBtn: { position: 'absolute', right: rs(-2), top: rs(-2), width: rs(22), height: rs(22), borderRadius: rs(11), alignItems: 'center', justifyContent: 'center' },
  footerWrap: { width: '100%', marginTop: rs(18) },
  addSerialBtn: {
    borderWidth: 1,
    borderColor: '#5D768B',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 12,
    marginTop: 6,
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  serialAdded: { backgroundColor: '#D0E6D7', borderColor: '#73B386' },
  addSerialText: { color: '#5D768B', fontWeight: '700', fontSize: 12 },
  addedText: { color: '#168035' },
});
