import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Pressable,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import CloseIcon from '../../assets/icons/close.svg';
import UploadIcon from '../../assets/icons/upload.svg';
import CameraIcon from '../../assets/icons/camera.svg';
import CustomNumericInput from '../../components/CustomNumericInput';
import Rec_DropDown from '../../components/receive/Rec_DropDown';
import SingleFooterBtnComponent from '../../components/SingleFooterBtnComponent';

export default function Rec_InspectLotModalPopup({
  visible,
  onClose,
  lot,
  lotIndex,
  itemName = '',
  itemCode = '',
  onComplete,
}) {
  const [inspectQty, setInspectQty] = useState(0);
  const [status, setStatus] = useState(null);
  const [notes, setNotes] = useState('');
  const [images, setImages] = useState([]);

  const statusList = [
    { id: 1, name: 'Above Average' },
    { id: 2, name: 'Average' },
    { id: 3, name: 'Below Average' },
    { id: 4, name: 'Excellent' },
    { id: 5, name: 'Reject and Notify' },
    { id: 6, name: 'Unacceptable' },
  ];

  const handleUpload = () => {
    launchImageLibrary(
      {
        mediaType: "photo",
        quality: 0.8,
        selectionLimit: 1
      },
      (response) => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.errorCode) {
          console.log('ImagePicker Error: ', response.errorMessage);
        } else if (response.assets && response.assets.length > 0) {
          const uri = response.assets[0].uri;
          if (uri) {
            setImages([...images, uri]);
          }
        }
      }
    );
  };

  const handleCamera = () => {
    launchCamera(
      {
        mediaType: "photo",
        quality: 0.8,
        saveToPhotos: true
      },
      (response) => {
        if (response.didCancel) {
          console.log('User cancelled camera');
        } else if (response.errorCode) {
          console.log('Camera Error: ', response.errorMessage);
        } else if (response.assets && response.assets.length > 0) {
          const uri = response.assets[0].uri;
          if (uri) {
            setImages([...images, uri]);
          }
        }
      }
    );
  };

  const handleRemoveImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleViewAll = () => {
    console.log("View all photos:", images);
  };

  const handleConfirmInspect = () => {
    const inspectionData = {
      inspectQty,
      status,
      notes,
      images,
      lotDetails: lot,
      lotIndex: lotIndex,
      itemName,
      itemCode,
    };

    console.log('Sending inspection data to parent:', inspectionData);

    if (onComplete) {
      onComplete(inspectionData);
    }

    onClose();
  };

  const isInspectionComplete = inspectQty > 0 && status !== null;

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
          <View style={styles.modalContainer}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Inspection</Text>
              <TouchableOpacity onPress={onClose}>
                <CloseIcon width={20} height={20} />
              </TouchableOpacity>
            </View>

            <View style={styles.lotCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.lotId}>{lot?.lotNumber || 'N/A'}</Text>
                <View style={styles.row}>
                  <Text style={styles.smallText}>Mfg: {lot?.mfgDate || '-'}</Text>
                  <Text style={styles.smallText}>Exp: {lot?.expDate || '-'}</Text>
                </View>
              </View>
              <View style={styles.qtyBox}>
                <Text style={styles.qtyLabel}>Qty</Text>
                <Text style={styles.qtyValue}>{lot?.qty || 0}</Text>
              </View>
            </View>

            <View style={styles.body}>
              <Text style={styles.sectionTitle}>Inspection Qty</Text>
              <CustomNumericInput
                value={inspectQty}
                setValue={setInspectQty}
                min={0}
                max={lot?.qty || 0}
                step={1}
                width={339}
                height={42}
                isSelected={true}
                disabledinput={false}
              />

              <View style={styles.dropdownContainer}>
                <Rec_DropDown
                  label=""
                  placeholder="Select Status"
                  value={status}
                  onChange={setStatus}
                  items={statusList}
                />
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
                      textAlignVertical="top"
                    />
                    <Text style={styles.charCount}>{notes.length}/100</Text>
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
                          <View style={styles.imageContainer}>
                            <Image
                              source={{ uri: img }}
                              style={styles.image}
                              resizeMode="cover"
                            />
                          </View>
                          <Pressable
                            onPress={() => handleRemoveImage(index)}
                            style={styles.removeButton}
                          >
                            <Text style={styles.removeButtonText}>×</Text>
                          </Pressable>
                        </View>
                      ))}
                    </ScrollView>

                    <TouchableOpacity
                      onPress={handleViewAll}
                      style={styles.viewAllButton}
                    >
                      <Text style={styles.viewAllText}>View All</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

            </View>

            <View style={{ paddingHorizontal: 20, paddingVertical: 12 }}>
              <SingleFooterBtnComponent
                label="Confirm Inspection"
                onPress={handleConfirmInspect}
                enabled={isInspectionComplete}
                containerStyle={{ marginBottom: 0 }}
                buttonStyle={{ width: '100%', marginStart: 0 }}
                labelStyle={{ fontSize: 14 }}
              />
            </View>

          </View>
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
    paddingVertical: 20,
  },
  modalContainer: {
    width: 372,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    overflow: 'hidden',
  },

  header: {
    width: 372,
    height: 56.34,
    backgroundColor: '#ECF1F7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },

  lotCard: {
    width: 340,
    height: 54,
    backgroundColor: '#4F6577',
    borderRadius: 4,
    alignSelf: 'center',
    marginTop: 20,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  lotId: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: 18,
  },
  smallText: {
    color: '#DCE3EA',
    fontSize: 11,
    marginTop: 2,
  },
  qtyBox: {
    alignItems: 'flex-end',
  },
  qtyLabel: {
    color: '#DCE3EA',
    fontSize: 11,
  },
  qtyValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  body: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#111827',
  },
  dropdownContainer: {
    marginTop: 20,
  },

  notesBox: {
    marginTop: 20,
  },
  outerNotesBox: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 4,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  outerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  innerNotesBox: {
    width: 306,
    height: 65,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#D9E4EE',
    position: 'relative',
  },
  innerNotesInput: {
    fontSize: 12,
    color: '#111827',
    padding: 8,
    height: '100%',
    textAlignVertical: 'top',
  },
  charCount: {
    position: 'absolute',
    bottom: 8,
    right: 12,
    fontSize: 10,
    color: '#9CA3AF',
  },

  photosOuterBox: {
    marginTop: 24,
    borderWidth: 0,
    borderRadius: 4,
    padding: 0,
    backgroundColor: 'transparent',
  },
  photosLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  photosInnerBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  photoBtnLeft: {
    flex: 1,
    height: 35,
    backgroundColor: '#ECF1F7',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 0,
  },
  photoBtnRight: {
    flex: 1,
    height: 35,
    backgroundColor: '#ECF1F7',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    borderWidth: 0,
  },
  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#DA1E28',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  removeButtonText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 10,
  },
  viewAllButton: {
    marginTop: 8,
  },
  viewAllText: {
    color: '#033EFF',
    fontWeight: '700',
    fontSize: 12,
  },
});