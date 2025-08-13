import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import ConfirmSuccess from '../assets/icons/ConfirmSuccess.svg';
import ConfirmIcon from '../assets/icons/confirm.svg';
import CancelIcon from '../assets/icons/cancel.svg';

const { width } = Dimensions.get('window');

const ConfirmModalComponent = ({
  visible,
  title = 'Confirmation',
  message = 'Are you sure?',
  confirmColor = 'green',
  cancelColor = 'red',
  backdropColor = 'rgba(0,0,0,0.3)',
  headerBg = '#5D768B1A',
  widthRatio = 0.85,
  confirmAction,
  onCancel,
  onSuccess,
  onFailure,
  successMessage = 'Order receipt created successfully',
  failureMessage = 'Something went wrong. Please try again.',
  SuccessIcon = ConfirmSuccess,
  FailureIcon = ConfirmSuccess,
  autoDismissMsSuccess = 1500,
  autoDismissMsFailure = 1500,
  buttonSize = 50,
}) => {
  const [phase, setPhase] = useState('confirm');

  const modalWidth = useMemo(
    () => Math.max(280, Math.min(520, width * widthRatio)),
    [widthRatio]
  );

  useEffect(() => {
    if (visible) setPhase('confirm');
  }, [visible]);

  useEffect(() => {
    if (phase === 'success' && autoDismissMsSuccess > 0) {
      const t = setTimeout(() => {
        onCancel?.();
        onSuccess?.();
      }, autoDismissMsSuccess);
      return () => clearTimeout(t);
    }

    if (phase === 'failure' && autoDismissMsFailure > 0) {
      const t = setTimeout(() => {
        onCancel?.();
        onFailure?.();
      }, autoDismissMsFailure);
      return () => clearTimeout(t);
    }
  }, [
    phase,
    autoDismissMsSuccess,
    autoDismissMsFailure,
    onCancel,
    onSuccess,
    onFailure,
  ]);

  const handleYes = async () => {
    if (!confirmAction) return;
    setPhase('loading');

    try {
      const res = await Promise.resolve(confirmAction());
      const ok = typeof res === 'object' ? !!res.success : !!res;
      setPhase(ok ? 'success' : 'failure');
    } catch {
      setPhase('failure');
    }
  };

  const handleNo = () => {
    onCancel?.();
  };

  if (!visible) return null;

  return (
    <Modal transparent visible animationType="fade">
      <Pressable
        style={[styles.modalOverlay, { backgroundColor: backdropColor }]}
        onPress={phase === 'confirm' ? onCancel : undefined}
      >
        <Pressable style={[styles.modalBox, { width: modalWidth }]} onPress={() => {}}>
          {phase === 'confirm' && (
            <>
              <View style={[styles.modalHeader, { backgroundColor: headerBg }]}>
                <Text style={styles.modalTitle}>{title}</Text>
              </View>

              <View style={styles.modalBody}>
                <Text style={styles.modalMessage}>{message}</Text>

                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handleYes}
                    style={[
                      styles.circleButton,
                      {
                        borderColor: confirmColor,
                        width: buttonSize,
                        height: buttonSize,
                        borderRadius: buttonSize / 2,
                      },
                    ]}
                  >
                    <ConfirmIcon
                      width={buttonSize - 2}
                      height={buttonSize - 2}
                      fill={confirmColor}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handleNo}
                    style={[
                      styles.circleButton,
                      {
                        borderColor: cancelColor,
                        width: buttonSize,
                        height: buttonSize,
                        borderRadius: buttonSize / 2,
                      },
                    ]}
                  >
                    <CancelIcon
                      width={buttonSize - 2}
                      height={buttonSize - 2}
                      fill={cancelColor}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}

          {phase === 'loading' && (
            <View style={styles.statusBody}>
              <ActivityIndicator size="large" />
              <Text style={styles.statusText}>Processing…</Text>
            </View>
          )}

          {phase === 'success' && (
            <View style={styles.statusBody}>
              <SuccessIcon width={96} height={96} />
              <Text style={styles.statusText}>{successMessage}</Text>
            </View>
          )}

          {phase === 'failure' && (
            <View style={styles.statusBody}>
              <FailureIcon width={96} height={96} />
              <Text style={styles.statusText}>{failureMessage}</Text>
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  modalBox: {
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
  },
  modalHeader: {
    padding: 12,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  modalBody: {
    padding: 20,
    alignItems: 'center',
  },
  modalMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#555',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '60%',
  },
  circleButton: {
    justifyContent: 'center',
    alignItems: 'center',
    // borderWidth: 2,
    backgroundColor: 'white',
  },
  statusBody: {
    paddingVertical: 28,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  statusText: {
    marginTop: 16,
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
});

export default ConfirmModalComponent;
