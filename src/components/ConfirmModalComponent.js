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
import PoSuccess from '../assets/icons/PoSuccess.svg';
import PoFailure from '../assets/icons/PoFailure.svg';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');
const BRAND = '#233E55';
const WHITE = '#FFFFFF';

const RADIUS = 42;
const HEIGHT = 48;

const ConfirmModalComponent = ({
  visible,
  title = 'Confirmation',
  message = 'Are you sure?',
  backdropColor = 'rgba(0,0,0,0.3)',
  headerBg = '#ECF1F7',
  widthRatio = 0.85,
  deliveryType,
  onInspect,
  onPutaway,
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
  const [receiptPayload, setReceiptPayload] = useState(null);

  const modalWidth = useMemo(
    () => Math.max(280, Math.min(520, width * widthRatio)),
    [widthRatio]
  );

  useEffect(() => {
    if (visible) {
      setPhase('confirm');
      setReceiptPayload(null);
    }
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

    return undefined;
  }, [phase, autoDismissMsSuccess, autoDismissMsFailure, onCancel, onSuccess, onFailure]);

  const norm = v => String(v ?? '').trim().toLowerCase();

  const isInspectionRequired = dt => norm(dt) === 'inspection required';
  const isStandardReceipt = dt => norm(dt) === 'standard receipt';

  const shouldAskPost = dt => isInspectionRequired(dt) || isStandardReceipt(dt);

  const postQuestionText = isStandardReceipt(deliveryType)
    ? 'Do you want to Put Away?'
    : 'Do you want to Inspect?';

  const receiptNum =
    receiptPayload?.receipt_num ??
    receiptPayload?.receiptNumber ??
    receiptPayload?.data?.receipt_num ??
    receiptPayload?.data?.receiptNumber ??
    null;

  const dynamicSuccessMessage = receiptNum
    ? `Order Receipt ${receiptNum} created successfully`
    : successMessage;

  const handleConfirm = async () => {
    if (!confirmAction) return;
    setPhase('loading');

    try {
      const res = await Promise.resolve(confirmAction());
      const ok = typeof res === 'object' ? !!res.success : !!res;

      if (!ok) {
        setPhase('failure');
        return;
      }

      if (typeof res === 'object') setReceiptPayload(res);

      if (shouldAskPost(deliveryType)) {
        setPhase('postSuccess');
      } else {
        setPhase('success');
      }
    } catch {
      setPhase('failure');
    }
  };

  const handleCancelPress = () => {
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
                    onPress={handleCancelPress}
                    activeOpacity={0.85}
                    style={[styles.buttonBase, styles.half, styles.left]}
                  >
                    <LinearGradient
                      colors={['rgba(255,255,255,0.70)', '#EBF7F6']}
                      start={{ x: 0.5, y: 0 }}
                      end={{ x: 0.5, y: 1 }}
                      style={styles.fillGradient}
                    />
                    <Text style={[styles.label, { color: BRAND }]}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleConfirm}
                    activeOpacity={0.85}
                    style={[styles.buttonBase, styles.half, styles.right]}
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
                      colors={[
                        'rgba(0,0,0,0.16)',
                        'transparent',
                        'transparent',
                        'rgba(0,0,0,0.16)',
                      ]}
                      locations={[0, 0.2, 0.8, 1]}
                      start={{ x: 0, y: 0.5 }}
                      end={{ x: 1, y: 0.5 }}
                      style={styles.sideVignette}
                    />

                    <Text style={[styles.label, { color: WHITE }]}>Confirm</Text>
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
              <Text style={styles.statusText}>{dynamicSuccessMessage}</Text>
            </View>
          )}

          {phase === 'failure' && (
            <View style={styles.statusBody}>
              <FailureIcon width={96} height={96} />
              <Text style={styles.statusText}>{failureMessage}</Text>
            </View>
          )}

          {phase === 'postSuccess' && (
            <View style={styles.postSuccessWrapper}>
              <View style={styles.postSuccessContent}>
                <SuccessIcon width={96} height={96} />
                <Text style={styles.statusText}>{dynamicSuccessMessage}</Text>
              </View>

              <View style={styles.postQuestionBar}>
                <Text style={styles.postQuestionBarText}>{postQuestionText}</Text>

                <View style={styles.postButtonsWrap}>
                  <TouchableOpacity
                    activeOpacity={0.9}
                    style={styles.postYesBtn}
                    onPress={() => {
                      if (isStandardReceipt(deliveryType)) onPutaway?.(receiptPayload);
                      if (isInspectionRequired(deliveryType)) onInspect?.(receiptPayload);
                      onCancel?.();
                    }}
                  >
                    <Text style={styles.postYesText}>Yes</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.9}
                    style={styles.postNoBtn}
                    onPress={() => {
                      onCancel?.();
                      onSuccess?.();
                    }}
                  >
                    <Text style={styles.postNoText}>No</Text>
                  </TouchableOpacity>
                </View>
              </View>
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
    backgroundColor: WHITE,
    borderRadius: 10,
    overflow: 'hidden',
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
    textAlign: 'flex-start',
    marginBottom: 20,
    color: '#595A5C',
    fontFamily: 'Mulish',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonBase: {
    height: HEIGHT,
    borderRadius: RADIUS,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  half: { width: '48%' },
  left: { marginRight: 5, borderWidth: 1, borderColor: BRAND, backgroundColor: WHITE },
  right: { marginLeft: 5 },
  label: { zIndex: 5, fontWeight: '700', fontFamily: 'Mulish', fontSize: 16 },
  fillGradient: { ...StyleSheet.absoluteFillObject, borderRadius: RADIUS },
  fillSolidBrand: { ...StyleSheet.absoluteFillObject, borderRadius: RADIUS, backgroundColor: BRAND },
  sideVignette: { ...StyleSheet.absoluteFillObject, borderRadius: RADIUS, zIndex: 1 },
  topGloss: {
    position: 'absolute',
    top: 0,
    left: 2,
    right: 2,
    height: '52%',
    borderTopLeftRadius: RADIUS,
    borderTopRightRadius: RADIUS,
    zIndex: 2,
  },
  bottomInnerShadow: {
    position: 'absolute',
    left: 2,
    right: 2,
    bottom: 0,
    height: '36%',
    borderBottomLeftRadius: RADIUS,
    borderBottomRightRadius: RADIUS,
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
    fontFamily: 'Mulish',
  },
  postSuccessWrapper: {
    backgroundColor: WHITE,
  },
  postSuccessContent: {
    paddingVertical: 28,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  postQuestionBar: {
    width: '100%',
    backgroundColor: '#ECF1F7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  postQuestionBarText: {
    flex: 1,
    fontSize: 14,
    color: '#242424',
    fontFamily: 'Mulish',
  },
  postButtonsWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  postYesBtn: {
    height: 38,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: BRAND,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  postYesText: {
    color: WHITE,
    fontFamily: 'Mulish',
    fontWeight: '700',
    fontSize: 14,
  },
  postNoBtn: {
    height: 38,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BRAND,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postNoText: {
    color: BRAND,
    fontFamily: 'Mulish',
    fontWeight: '700',
    fontSize: 14,
  },
});

export default ConfirmModalComponent;
