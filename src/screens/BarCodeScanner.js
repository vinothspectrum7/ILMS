import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  PermissionsAndroid,
  ActivityIndicator,
} from "react-native";
import { Camera } from "react-native-camera-kit";

export default function BarcodeScanner({ onScan, onClose }) {
  const [hasPermission, setHasPermission] = useState(Platform.OS !== "android");
  const [isScanning, setIsScanning] = useState(true);

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

    // Safely get scanned value
    const code =
      event?.nativeEvent?.codeStringValue || event?.nativeEvent?.code || null;

    if (code) {
      onScan(code);
    } else {
      Alert.alert("Scan error", "Failed to read barcode. Please try again.");
      setIsScanning(true);
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

  return (
    <View style={{ flex: 1 }}>
      {isScanning ? (
        <Camera
          style={{ flex: 1 }}
          cameraOptions={{
            flashMode: "auto", // off, auto, on
            focusMode: "on", // off, on
            zoomMode: "on", // off, on
          }}
          scanBarcode={true}
          showFrame={false} // Hide default frame
        laserColor={'red'}
        frameColor={'white'}
          onReadCode={onReadCode}
        />
      ) : (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="red" />
          <Text style={styles.loadingText}>Processing...</Text>
        </View>
      )}
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Text style={styles.closeButtonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  closeButton: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    backgroundColor: "#000",
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
    backgroundColor: "#000",
  },
  loadingText: {
    color: "red",
    marginTop: 10,
    fontSize: 18,
  },
});
