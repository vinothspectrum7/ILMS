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
} from "react-native";
import { Camera } from "react-native-camera-kit";
import { launchImageLibrary } from 'react-native-image-picker';
import RNQRGenerator from 'rn-qr-generator';
import { Flashlight } from 'lucide-react-native';

export default function BarcodeScanner({ onScan, onClose }) {
  const [hasPermission, setHasPermission] = useState(Platform.OS !== "android");
  const [isScanning, setIsScanning] = useState(true);
  const [torchOn, setTorchOn] = useState(false);
  const BRAND_BG = '#233E55'; 

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
              buttonNegative: "Cancel",
            }
          );
          setHasPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            Alert.alert(
              "Permission denied",
              "Cannot scan barcodes without camera permission"
            );
            onClose();
          }
        } catch (e) {
          console.warn(e);
          onClose();
        }
      }
    }

    if (!hasPermission) {
      requestCameraPermission();
    }
  }, []);

  const onReadCode = (event) => {
    if (!isScanning) return;
    setIsScanning(false);
    const code =
      event?.nativeEvent?.codeStringValue || event?.nativeEvent?.code || null;
    if (code) {
      onScan(code);
    } else {
      Alert.alert("Scan error", "Failed to read barcode. Please try again.");
      setIsScanning(true);
    }
  };

  const scanFromGallery = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 1,
      });

      if (result.didCancel) {
        return;
      }

      if (result.assets && result.assets.length > 0) {
        setIsScanning(false);
        const imageUri = result.assets[0].uri;

        RNQRGenerator.detect({ uri: imageUri })
          .then(response => {
            const { values } = response;
            if (values.length > 0) {
              onScan(values[0]);
            } else {
              Alert.alert("Scan error", "No barcode or QR code found in the image.");
              setIsScanning(true);
            }
          })
          .catch(error => {
            console.error(error);
            Alert.alert("Scan error", "Failed to process the image.");
            setIsScanning(true);
          });
      }
    } catch (e) {
      console.warn(e);
      Alert.alert("Error", "Something went wrong while accessing the gallery.");
    }
  };

  if (!hasPermission) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          Camera permission is required to scan barcodes.
        </Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const toggleTorch = () => {
    setTorchOn(!torchOn);
  };

  return (
    <View style={{ flex: 1 }}>
      <StatusBar translucent={false} barStyle="light-content" backgroundColor={BRAND_BG} />
      {isScanning ? (
        <>
          <Camera
            style={{ flex: 1 }}
            cameraOptions={{
              flashMode: "auto",
              focusMode: "on",
              zoomMode: "on",
            }}
            scanBarcode={true}
            showFrame={true}
            laserColor={'#233E55'} // Updated color for the animating line
            frameColor={'#FFFFFF'} // Updated color for the marked area border
            torchMode={torchOn ? "on" : "off"}
            onReadCode={onReadCode}
          />
          <View style={styles.torchButtonContainer}>
            <TouchableOpacity onPress={toggleTorch} style={styles.torchButton}>
              <Flashlight
                size={30}
                color="white"
                fill={torchOn ? "white" : "transparent"}
              />
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="red" />
          <Text style={styles.loadingText}>Processing...</Text>
        </View>
      )}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={onClose}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={scanFromGallery}>
          <Text style={styles.buttonText}>Scan from Gallery</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  closeButton: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    backgroundColor: "#233E55",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    zIndex: 10,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  permissionText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#233E55",
  },
  loadingText: {
    color: "red",
    marginTop: 10,
    fontSize: 18,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 40,
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  button: {
    backgroundColor: "#233E55",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  torchButtonContainer: {
    position: "absolute",
    top: 60,
    right: 20,
    zIndex: 10,
  },
  torchButton: {
    padding: 10,
  },
});