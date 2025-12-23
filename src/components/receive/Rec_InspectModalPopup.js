import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import PhotoCaptureIcon from '../../assets/icons/photocaptureicon.svg';
import DeleteAttachmentIcon from '../../assets/icons/deleteattachmenticon.svg';
import ErrorIcon from '../../assets/icons/error.svg';
import Rec_CustomNumericInput from '../../components/receive/Rec_CustomNumericInput';
import Rec_DropDown from '../../components/receive/Rec_DropDown';
import SingleFooterBtnComponent from '../../components/SingleFooterBtnComponent';

const { width } = Dimensions.get('window');
const rs = v => (width / 375) * v;

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

  const statusOptions = [
    { id: 'Accepted', name: 'Accepted' },
    { id: 'Rejected', name: 'Rejected' },
  ];

  const qualityOptions = [
    { id: 1, name: 'Above Average' },
    { id: 2, name: 'Average' },
    { id: 3, name: 'Below Average' },
    { id: 4, name: 'Excellent' },
  ];

  const clearError = () => setErrorMsg('');

  const addImages = uris => {
    if (!uris.length) return;
    setImages(prev => [...prev, ...uris]);
    Toast.show({ type: 'success', text1: 'Image Attached' });
  };

  const handleUpload = async () => {
    clearError();
    const res = await launchImageLibrary({ mediaType: 'photo', selectionLimit: 0 });
    if (!res.didCancel && !res.errorCode) {
      addImages(res.assets.map(a => a.uri));
    }
  };

  const handleCamera = async () => {
    clearError();
    const res = await launchCamera({ mediaType: 'photo' });
    if (!res.didCancel && !res.errorCode) {
      addImages(res.assets.map(a => a.uri));
    }
  };

  const isValid =
    inspectQty > 0 &&
    inspectQty <= rowQty &&
    !!status &&
    !!quality;

  const handleConfirm = () => {
    if (!isValid) {
      setErrorMsg('Fill all mandatory fields');
      return;
    }

    onComplete({
      rowId,
      inspectQty,
      status,
      quality,
      notes,
      images,
    });
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Inspection</Text>
            <TouchableOpacity onPress={onClose}>
              <CloseIcon width={18} height={18} />
            </TouchableOpacity>
          </View>

          {errorMsg ? (
            <View style={styles.errorRow}>
              <ErrorIcon width={14} height={14} />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          <ScrollView style={styles.body}>
            <View style={styles.itemCard}>
              <Text style={styles.itemName}>{itemName}</Text>
              <Text style={styles.itemCode}>{itemCode}</Text>
              <Text style={styles.qtyText}>Qty: {rowQty}</Text>
            </View>

            <Text style={styles.label}>Inspection Qty</Text>
            <Rec_CustomNumericInput
              value={inspectQty}
              setValue={setInspectQty}
              max={rowQty}
              min={0}
              width="100%"
              height={42}
              isSelected
            />

            <Rec_DropDown
              placeholder="Select Status"
              items={statusOptions}
              value={status}
              onChange={setStatus}
            />

            <Rec_DropDown
              placeholder="Select Quality"
              items={qualityOptions}
              value={quality}
              onChange={setQuality}
            />

            <TextInput
              style={styles.notes}
              placeholder="Inspection Notes"
              multiline
              maxLength={100}
              value={notes}
              onChangeText={setNotes}
            />

            <View style={styles.photoRow}>
              <TouchableOpacity style={styles.photoBtn} onPress={handleUpload}>
                <PhotoUploadIcon width={20} height={20} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.photoBtn} onPress={handleCamera}>
                <PhotoCaptureIcon width={20} height={20} />
              </TouchableOpacity>
            </View>

            {images.length > 0 && (
              <ScrollView horizontal>
                {images.map(uri => (
                  <View key={uri} style={styles.thumb}>
                    <Image source={{ uri }} style={styles.thumbImg} />
                    <TouchableOpacity
                      style={styles.thumbDel}
                      onPress={() =>
                        setImages(prev => prev.filter(x => x !== uri))
                      }
                    >
                      <DeleteAttachmentIcon width={14} height={14} />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}
          </ScrollView>

          <SingleFooterBtnComponent
            label="Confirm Inspect"
            enabled={isValid}
            onPress={handleConfirm}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center' },
  container: { backgroundColor: '#fff', margin: 20, borderRadius: 8 },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 16 },
  title: { fontSize: 16, fontWeight: '700' },
  errorRow: { flexDirection: 'row', padding: 10, backgroundColor: '#FDECEC' },
  errorText: { marginLeft: 6, color: '#C62828', fontSize: 12 },
  body: { padding: 16 },
  itemCard: { backgroundColor: '#5D768B', padding: 12, borderRadius: 6 },
  itemName: { color: '#fff', fontWeight: '700' },
  itemCode: { color: '#E5E7EB', fontSize: 12 },
  qtyText: { color: '#fff', marginTop: 6 },
  label: { marginTop: 16, marginBottom: 6, fontWeight: '600' },
  notes: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 6, padding: 8, marginTop: 12 },
  photoRow: { flexDirection: 'row', marginTop: 12 },
  photoBtn: { flex: 1, height: 44, backgroundColor: '#ECF1F7', alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
  thumb: { width: 56, height: 56, marginRight: 8 },
  thumbImg: { width: '100%', height: '100%' },
  thumbDel: { position: 'absolute', top: 0, right: 0 },
});
