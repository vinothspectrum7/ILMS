import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  StatusBar,
  PermissionsAndroid,
  ActivityIndicator,
  Linking
} from "react-native";
import { Camera } from "react-native-camera-kit";
import { launchImageLibrary } from "react-native-image-picker";
import RNQRGenerator from "rn-qr-generator";
import { Images, Zap, ZapOff } from "lucide-react-native";
import GlobalHeaderComponent from "../components/GlobalHeaderComponent";

export default function BarcodeScanner({ onScan, onClose }) {
  const [hasCameraPermission, setHasCameraPermission] = useState(Platform.OS !== "android");
  const [isScanning, setIsScanning] = useState(true);
  const [torchOn, setTorchOn] = useState(false);

  const BRAND_BG = "#000000";

  useEffect(() => {
    
    if (Platform.OS === "android") {
      StatusBar.setBackgroundColor(BRAND_BG);
      StatusBar.setBarStyle("light-content");
    }

    
    return () => {
      if (Platform.OS === "android") {
        StatusBar.setBackgroundColor(BRAND_BG); 
        StatusBar.setBarStyle("light-content"); 
      }
    };
  }, []);

  useEffect(() => {
    async function requestCameraPermission() {
      if (Platform.OS === "android") {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA,
            {
              title: "Camera Permission",
              message: "App needs camera access to scan barcodes",
              buttonPositive: "OK",
              buttonNegative: "Cancel"
            }
          );
          setHasCameraPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            Alert.alert("Permission denied", "Cannot scan barcodes without camera permission");
          }
        } catch (e) {
          console.warn(e);
        }
      }
    }
    if (!hasCameraPermission) {
      requestCameraPermission();
    }
  }, [hasCameraPermission]);

  const onReadCode = (event) => {
    if (!isScanning) return;
    setIsScanning(false);
    const code = event?.nativeEvent?.codeStringValue || event?.nativeEvent?.code || null;
    if (code) {
      onScan(code);
    } else {
      Alert.alert("Scan error", "Failed to read barcode. Please try again.");
      setIsScanning(true);
    }
  };

  async function requestGalleryPermission() {
    if (Platform.OS !== "android") return true;

    const sdk = Platform.Version;
    const perms = [];

    if (sdk >= 34) {
      if (PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES) {
        perms.push(PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES);
      }
      if (PermissionsAndroid.PERMISSIONS.READ_MEDIA_VISUAL_USER_SELECTED) {
        perms.push(PermissionsAndroid.PERMISSIONS.READ_MEDIA_VISUAL_USER_SELECTED);
      }
    } else if (sdk >= 33) {
      if (PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES) {
        perms.push(PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES);
      }
    } else {
      if (PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE) {
        perms.push(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
      }
    }

    if (perms.length === 0) return true;

    try {
      const result = await PermissionsAndroid.requestMultiple(perms);
      const granted = perms.every((p) => result[p] === PermissionsAndroid.RESULTS.GRANTED);
      if (!granted) {
        Alert.alert(
          "Permission Denied",
          "Storage permission is required to access your gallery. Please enable it in Settings.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Go to Settings", onPress: () => Linking.openSettings() }
          ]
        );
      }
      return granted;
    } catch (e) {
      console.warn(e);
      return false;
    }
  }

  const checkAndScanFromGallery = async () => {
    const allowed = await requestGalleryPermission();
    if (!allowed) return;

    try {
      const result = await launchImageLibrary({ mediaType: "photo", quality: 1, selectionLimit: 1 });
      if (result?.didCancel) return;

      const imageUri = result?.assets?.[0]?.uri;
      if (!imageUri) return;

      setIsScanning(false);
      RNQRGenerator.detect({ uri: imageUri })
        .then((response) => {
          const { values } = response;
          if (values?.length > 0) {
            onScan(values[0]);
          } else {
            Alert.alert("Scan error", "No barcode or QR code found in the image.");
            setIsScanning(true);
          }
        })
        .catch((error) => {
          console.error(error);
          Alert.alert("Scan error", "Failed to process the image.");
          setIsScanning(true);
        });
    } catch (e) {
      console.warn(e);
      Alert.alert("Error", "Something went wrong while accessing the gallery.");
    }
  };

  if (!hasCameraPermission) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Camera permission is required to scan barcodes.</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const toggleTorch = () => {
    setTorchOn(!torchOn);
  };

  const formatToday = () => {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};

  return (
    <View style={{ flex: 1 }}>
      <GlobalHeaderComponent title="Barcode Scanner" dateText={formatToday()} onBack={onClose} onMenu={() => {}} />
      {isScanning ? (
        <View style={styles.scannerContainer}>
          <Camera
            style={StyleSheet.absoluteFill}
            cameraOptions={{ flashMode: "auto", focusMode: "on", zoomMode: "on" }}
            scanBarcode
            // showFrame
            laserColor="#233E55"
            frameColor="#FFFFFF"
            torchMode={torchOn ? "on" : "off"}
            onReadCode={onReadCode}
          />
          <View style={styles.uiOverlay}>
            <View style={styles.torchButtonContainer}>
              <TouchableOpacity onPress={toggleTorch} style={styles.torchButton}>
                {torchOn ? <Zap size={24} color="#FFFFFF" fill="#FFFFFF" /> : <ZapOff size={24} color="#FFFFFF" />}
              </TouchableOpacity>
            </View>
            <View style={styles.bottomInfoContainer}>
              <Text style={styles.scanText}>Scan ILMS Barcode</Text>
              <Text style={styles.infoText}>PO/IR, ASN, Line Item</Text>
            </View>
            <View style={styles.bottomButtonsContainer}>
              <TouchableOpacity style={styles.iconButton} onPress={checkAndScanFromGallery}>
                <Images size={24} color="#FFFFFF" />
                <Text style={styles.iconButtonText}>Scan from Gallery</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Processing...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF"
  },
  permissionText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20
  },
  closeButton: {
    backgroundColor: "#233E55",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#233E55"
  },
  loadingText: {
    color: "#FFFFFF",
    marginTop: 10,
    fontSize: 18
  },
  scannerContainer: {
    flex: 1,
    backgroundColor: "#233E55"
  },
  uiOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 40
  },
  torchButtonContainer: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 10
  },
  torchButton: {
    padding: 10
  },
  bottomInfoContainer: {
    position: "absolute",
    bottom: 80,
    alignItems: "center"
  },
  scanText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600"
  },
  infoText: {
    color: "#CCCCCC",
    fontSize: 12,
    marginTop: 4
  },
  bottomButtonsContainer: {
    position: "absolute",
    bottom: 20,
    flexDirection: "row"
  },
  iconButton: {
    flexDirection: "column",
    alignItems: "center"
  },
  iconButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    marginTop: 8
  }
});