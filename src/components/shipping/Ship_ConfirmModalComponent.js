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
import LinearGradient from 'react-native-linear-gradient';
import PoSuccess from '../../assets/icons/PoSuccess.svg';
import PoFailure from '../../assets/icons/PoFailure.svg';
import CloseIcon from '../../assets/icons/close.svg';

const { width } = Dimensions.get('window');

const BRAND = '#233E55';
const WHITE = '#FFFFFF';

const RADIUS = 42;
const HEIGHT = 48;

const Ship_ConfirmModalComponent = ({
  visible,
  title = '',
  message = 'Are you sure?',
  backdropColor = 'rgba(0,0,0,0.3)',
  headerBg = '#ECF1F7',
  widthRatio = 0.85,
  confirmAction,
  onCancel,
  onSuccess,
  onFailure,
  successMessage = 'Order receipt created successfully',
  failureMessage = 'Order receipt creation failed',
  SuccessIcon = PoSuccess,
  FailureIcon = PoFailure,
  autoDismissMsSuccess = 1000,
  autoDismissMsFailure = 1500,
}) => {
  const [phase, setPhase] = useState('confirm');
  const [failureText, setFailureText] = useState(failureMessage);

  const modalWidth = useMemo(
    () => Math.max(280, Math.min(520, width * widthRatio)),
    [widthRatio]
  );

  useEffect(() => {
    if (visible) {
      setPhase('confirm');
      setFailureText(failureMessage);
    }
  }, [visible, failureMessage]);

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
  }, [phase, autoDismissMsSuccess, autoDismissMsFailure, onCancel, onSuccess, onFailure]);

  const handleYes = async () => {
    if (!confirmAction) return;

    setPhase('loading');
    try {
      const res = await Promise.resolve(confirmAction());
      const ok = typeof res === 'object' ? !!res?.success : !!res;

      if (!ok) {
        const msg = typeof res === 'object' && res?.message ? String(res.message) : failureMessage;
        setFailureText(msg);
      } else {
        setFailureText(failureMessage);
      }

      setPhase(ok ? 'success' : 'failure');
    } catch {
      setFailureText(failureMessage);
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
        <Pressable style={[styles.modalWrapper, { width: modalWidth }]} onPress={() => {}}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={phase === 'confirm' ? handleNo : undefined}
            style={styles.closeBtn}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <CloseIcon width={16} height={16} />
          </TouchableOpacity>

          <View style={styles.modalBox}>
            {phase === 'confirm' && (
              <>
                <View style={[styles.modalHeader, { backgroundColor: headerBg }]}>
                  <Text style={styles.modalTitle}>{title}</Text>
                </View>

                <View style={[styles.modalBody, { backgroundColor: headerBg }]}>
                  <Text style={styles.modalMessage}>{message}</Text>

                  <View style={styles.buttonGroup}>
                    <TouchableOpacity
                      onPress={handleNo}
                      activeOpacity={0.85}
                      style={[styles.buttonBase, styles.half]}
                    >
                      <LinearGradient
                        colors={['rgba(255,255,255,0.70)', '#EBF7F6']}
                        start={{ x: 0.5, y: 0 }}
                        end={{ x: 0.5, y: 1 }}
                        style={styles.fillGradient}
                      />
                      <Text style={[styles.label, { color: BRAND }]}>Manual</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={handleYes}
                      activeOpacity={0.85}
                      style={[styles.buttonBase, styles.half]}
                    >
                      <View style={styles.fillSolidBrand} />

                      <LinearGradient
                        colors={['rgba(255,255,255,0.53)', 'rgba(255,255,255,0)']}
                        locations={[0, 1]}
                        start={{ x: 0.5, y: 0.5 }}
                        end={{ x: 0.5, y: 1 }}
                        style={styles.topGloss}
                      />

                      <LinearGradient
                        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.23)']}
                        locations={[0.55, 1]}
                        start={{ x: 0.5, y: 0.55 }}
                        end={{ x: 0.5, y: 1 }}
                        style={styles.bottomInnerShadow}
                      />

                      <LinearGradient
                        colors={['rgba(0,0,0,0.16)', 'transparent', 'transparent', 'rgba(0,0,0,0.16)']}
                        locations={[0, 0.2, 0.8, 1]}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        style={styles.sideVignette}
                      />

                      <Text style={[styles.label, { color: WHITE }]}>Yes</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}

            {phase === 'loading' && (
              <View style={styles.statusBody}>
                <ActivityIndicator size="large" />
                <Text style={styles.statusText}>Loading...</Text>
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
                <Text style={styles.statusText}>{failureText}</Text>
              </View>
            )}
          </View>
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

  modalWrapper: {
    position: 'relative',
    overflow: 'visible',
  },

  modalBox: {
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
    padding: 5,
  },

  closeBtn: {
    position: 'absolute',
    top: -18,
    right: -10,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FBE9EA',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
    elevation: 8,
  },

  modalHeader: {
    padding: 20,
    alignItems: 'flex-start',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#242424',
    fontFamily: 'Mulish',
  },

  modalBody: {
    padding: 20,
  },
  modalMessage: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 40,
    color: '#595A5C',
    fontFamily: 'Mulish',
  },

  buttonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: BRAND,
    borderRadius: RADIUS,
    overflow: 'hidden',
    backgroundColor: WHITE,
  },

  buttonBase: {
    height: HEIGHT,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },

  half: { width: '50%' },

  label: {
    zIndex: 5,
    fontWeight: '700',
    fontFamily: 'Mulish',
    fontSize: 16,
  },

  fillGradient: {
    ...StyleSheet.absoluteFillObject,
  },

  fillSolidBrand: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: BRAND,
  },

  topGloss: {
    position: 'absolute',
    top: 0,
    left: 2,
    right: 2,
    height: '52%',
    zIndex: 2,
  },
  bottomInnerShadow: {
    position: 'absolute',
    left: 2,
    right: 2,
    bottom: 0,
    height: '36%',
    zIndex: 1,
  },
  sideVignette: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
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

export default Ship_ConfirmModalComponent;