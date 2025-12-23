import React, { useEffect, useMemo, useState } from 'react';
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
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Toast from 'react-native-toast-message';
import CloseIcon from '../../assets/icons/close.svg';
import PhotoUploadIcon from '../../assets/icons/photouploadicon.svg';
import ItemBoxIcon from '../../assets/icons/lotserialitem.svg';
import PhotoCaptureIcon from '../../assets/icons/photocaptureicon.svg';
import DeleteAttachmentIcon from '../../assets/icons/deleteattachmenticon.svg';
import ErrorIcon from '../../assets/icons/error.svg';
import Rec_CustomNumericInput from '../../components/receive/Rec_CustomNumericInput';
import Rec_DropDown from '../../components/receive/Rec_DropDown';
import SingleFooterBtnComponent from '../../components/SingleFooterBtnComponent';

const { width } = Dimensions.get('window');
const rs = v => (width / 375) * v;

const toUriList = assets =>
  Array.isArray(assets)
    ? assets.map(a => a?.uri).filter(u => typeof u === 'string' && u.length > 0)
    : [];

export default function Rec_InspectModalPopup({
  visible,
  onClose,
  rowQty = 0,
  rowId,
  itemName,
  itemCode,
  onComplete,
}) {
  const [inspectQty, setInspectQty] = useState(0);
  const [status, setStatus] = useState(null);
  const [quality, setQuality] = useState(null);
  const [notes, setNotes] = useState('');
  const [images, setImages] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!visible) return;
    setInspectQty(0);
    setStatus(null);
    setQuality(null);
    setNotes('');
    setImages([]);
    setErrorMsg('');
  }, [visible, rowId]);

  const statusOptions = useMemo(
    () => [
      { id: 'Accepted', name: 'Accepted' },
      { id: 'Rejected', name: 'Rejected' },
    ],
    [],
  );

  const qualityOptions = useMemo(
    () => [
      { id: 1, name: 'Above Average' },
      { id: 2, name: 'Average' },
      { id: 3, name: 'Below Average' },
      { id: 4, name: 'Excellent' },
    ],
    [],
  );

  const clearError = () => setErrorMsg('');

  const addImages = uris => {
    if (!Array.isArray(uris) || !uris.length) return;
    setImages(prev => [...prev, ...uris]);
    Toast.show({ type: 'success', text1: 'Image Attached' });
  };

  const handleUpload = async () => {
    clearError();
    const res = await launchImageLibrary({ mediaType: 'photo', selectionLimit: 0 });
    if (!res?.didCancel && !res?.errorCode) {
      addImages(toUriList(res?.assets));
    }
  };

  const handleCamera = async () => {
    clearError();
    const res = await launchCamera({ mediaType: 'photo' });
    if (!res?.didCancel && !res?.errorCode) {
      addImages(toUriList(res?.assets));
    }
  };

  const maxQty = Number(rowQty ?? 0);

  const isValid =
    Number(inspectQty ?? 0) > 0 &&
    Number(inspectQty ?? 0) <= maxQty &&
    !!status &&
    !!quality;

  const handleConfirm = () => {
    if (!isValid) {
      setErrorMsg('Fill all mandatory fields');
      return;
    }

    const payload = {
      rowId,
      inspectQty: Number(inspectQty ?? 0),
      status,
      quality,
      notes: String(notes ?? ''),
      images: Array.isArray(images) ? images : [],
    };

    onComplete?.(payload);
    onClose?.();
  };

  if (!visible) return null;

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Inspection</Text>
            <TouchableOpacity onPress={onClose} activeOpacity={0.8}>
              <CloseIcon width={18} height={18} />
            </TouchableOpacity>
          </View>

          {errorMsg ? (
            <View style={styles.errorRow}>
              <ErrorIcon width={14} height={14} />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
            <View style={styles.itemCard}>            
              <View style={styles.itemTop}>
                <ItemBoxIcon width={40} height={40} />
                <View style={styles.itemTextCol}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {itemName || 'Item'}
                  </Text>
                  <Text style={styles.itemCode} numberOfLines={1}>
                    {itemCode || '-'}
                  </Text>
                </View>

                <View style={styles.qtyPill}>
                  <Text style={styles.qtyPillLabel}>Qty</Text>
                  <Text style={styles.qtyPillValue}>{maxQty || 0}</Text>
                </View>
              </View>
            </View>

            <Text style={styles.label}>Inspection Qty*</Text>
            <Rec_CustomNumericInput
              value={inspectQty}
              setValue={setInspectQty}
              max={maxQty}
              min={0}
              width="100%"
              height={rs(46)}
              isSelected
              bgColor="#5D768B"
              borderColor="#5D768B"
              textColor="#FFFFFF"
              disabledinput={maxQty <= 0}
            />

            <View style={styles.dropWrap}>
              <Text style={styles.mandLabel}>Select Status*</Text>
              <Rec_DropDown
                placeholder="Select Status"
                items={statusOptions}
                value={status}
                onChange={setStatus}
                width="100%"
                height={32}
              />
            </View>

            <View style={styles.dropWrap}>
              <Text style={styles.mandLabel}>Select Quality*</Text>
              <Rec_DropDown
                placeholder="Select Quality"
                items={qualityOptions}
                value={quality}
                onChange={setQuality}
                width="100%"
                height={32}
              />
            </View>

            <View style={styles.notesWrap}>
              <Text style={styles.mandLabel}>Inspection Notes</Text>
              <View style={styles.notesBox}>
                <TextInput
                  style={styles.notes}
                  placeholder="Maximum 100 characters"
                  placeholderTextColor="#9CA3AF"
                  multiline
                  maxLength={100}
                  value={notes}
                  onChangeText={setNotes}
                />
                <Text style={styles.counter}>{String(notes || '').length}/100</Text>
              </View>
            </View>

            <View style={styles.photosWrap}>
              <Text style={styles.mandLabel}>Photos</Text>
              <View style={styles.photoRow}>
                <TouchableOpacity style={styles.photoBtn} onPress={handleUpload} activeOpacity={0.85}>
                  <PhotoUploadIcon width={20} height={20} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.photoBtn} onPress={handleCamera} activeOpacity={0.85}>
                  <PhotoCaptureIcon width={20} height={20} />
                </TouchableOpacity>
              </View>

              {images.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbList}>
                  {images.map(uri => (
                    <View key={uri} style={styles.thumb}>
                      <Image source={{ uri }} style={styles.thumbImg} />
                      <TouchableOpacity
                        style={styles.thumbDel}
                        activeOpacity={0.85}
                        onPress={() => setImages(prev => prev.filter(x => x !== uri))}
                      >
                        <DeleteAttachmentIcon width={14} height={14} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>
          </ScrollView>

          <SingleFooterBtnComponent label="Confirm Inspect" enabled={isValid} onPress={handleConfirm} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    paddingHorizontal: rs(16),
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: rs(10),
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: rs(16),
    paddingVertical: rs(14),
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: rs(14),
    fontWeight: '800',
    color: '#111827',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: rs(12),
    paddingVertical: rs(10),
    backgroundColor: '#FDECEC',
  },
  errorText: {
    marginLeft: rs(6),
    color: '#C62828',
    fontSize: rs(11),
    fontWeight: '700',
  },
  body: {
    paddingHorizontal: rs(16),
    paddingBottom: rs(12),
    maxHeight: rs(520),
  },
  itemCard: {
    backgroundColor: '#5D768B',
    padding: rs(12),
    borderRadius: rs(10),
    marginBottom: rs(12),
  },
  itemTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemTextCol: {
    flex: 1,
    paddingRight: rs(10),
    paddingLeft: rs(10),
  },
  itemName: {
    color: '#fff',
    fontWeight: '800',
    fontSize: rs(13),
  },
  itemCode: {
    color: '#E5E7EB',
    fontSize: rs(11),
    fontWeight: '700',
    marginTop: rs(4),
  },
  qtyPill: {
    minWidth: rs(70),
    borderRadius: rs(10),
    backgroundColor: '#5D768B',
    paddingVertical: rs(8),
    paddingHorizontal: rs(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyPillLabel: {
    color: '#E5E7EB',
    fontSize: rs(10),
    fontWeight: '700',
  },
  qtyPillValue: {
    color: '#FFFFFF',
    fontSize: rs(14),
    fontWeight: '900',
    marginTop: rs(2),
  },
  label: {
    marginTop: rs(6),
    marginBottom: rs(6),
    fontWeight: '800',
    color: '#111827',
    fontSize: rs(12),
  },
  mandLabel: {
    fontSize: rs(12),
    color: '#595A5C',
    marginBottom: rs(6),
    fontWeight: '700',
  },
  dropWrap: {
    marginTop: rs(12),
  },
  notesWrap: {
    marginTop: rs(12),
  },
  notesBox: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: rs(10),
    paddingHorizontal: rs(10),
    paddingTop: rs(8),
    paddingBottom: rs(6),
    backgroundColor: '#FFFFFF',
  },
  notes: {
    minHeight: rs(72),
    fontSize: rs(12),
    color: '#111827',
    textAlignVertical: 'top',
  },
  counter: {
    alignSelf: 'flex-end',
    marginTop: rs(4),
    color: '#9CA3AF',
    fontSize: rs(10),
    fontWeight: '700',
  },
  photosWrap: {
    marginTop: rs(12),
    marginBottom: rs(10),
  },
  photoRow: {
    flexDirection: 'row',
    gap: rs(8),
  },
  photoBtn: {
    width: rs(44),
    height: rs(44),
    backgroundColor: '#233E55',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: rs(500),
  },
  thumbList: {
    marginTop: rs(10),
  },
  thumb: {
    width: rs(56),
    height: rs(56),
    marginRight: rs(8),
    borderRadius: rs(10),
    overflow: 'hidden',
  },
  thumbImg: {
    width: '100%',
    height: '100%',
  },
  thumbDel: {
    position: 'absolute',
    top: rs(2),
    right: rs(2),
    width: rs(18),
    height: rs(18),
    borderRadius: rs(9),
    alignItems: 'center',
    justifyContent: 'center',
  },
});
