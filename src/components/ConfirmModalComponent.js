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
// import ConfirmSuccess from '../assets/icons/ConfirmSuccess.svg';
// import cancel from '../assets/icons/cancel.svg';
import PoFailure from '../assets/icons/PoFailure.svg';
// import ConfirmIcon from '../assets/icons/confirm.svg';
// import CancelIcon from '../assets/icons/cancel.svg';
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
  confirmColor = 'green',
  cancelColor = 'red',
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
    // autoDismissMsSuccess,
    // autoDismissMsFailure,
    // onCancel,
    // onSuccess,
    // onFailure,
  ]);

  const handleYes = async () => {
    if (!confirmAction) return;
    setPhase('loading');

    try {
      const res = await Promise.resolve(confirmAction());
      console.log(res,"reserererererererrergrefegfregrrgefef")
      const ok = typeof res === 'object' ? !!res.success : !!res;
      console.log(ok,"OKOKOKOKOKOKOKOKO")
      if (!ok) {
  failureMessage = res.message;
}
      setPhase(ok?"success":"failure");
      console.log(phase,"OKADSNDIIDIH")
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
        onPress={handleNo}
        activeOpacity={0.85}
        style={[styles.buttonBase, styles.half, styles.left]}
      >
        <LinearGradient
          colors={['rgba(255,255,255,0.70)', '#EBF7F6']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.fillGradient}
        />
        <Text style={[styles.label, { color: '#233E55' }]}>Cancel</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={handleYes}
        activeOpacity={0.85}
        // disabled={!rightEnabled}
        style={[styles.buttonBase, styles.half, styles.right]}
      >
        {/* {rightEnabled ? ( */}
          <View style={styles.fillSolidBrand} />
        {/* ) : ( */}
        {/* )} */}

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

        <Text style={[styles.label, { color: '#FFFFFF' }]}>Confirm</Text>
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
              <SuccessIcon width={96} height={96}  />
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
    padding: 20,
    alignItems: 'flex-start',
  },
  buttonBase: {
    height: HEIGHT,
    borderRadius: RADIUS,
    overflow: 'hidden',
    // marginBottom: 22,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
    sideVignette: {
      ...StyleSheet.absoluteFillObject,
      borderRadius: RADIUS,
      zIndex: 1,
    },
  fillGradient: { ...StyleSheet.absoluteFillObject, borderRadius: RADIUS },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#242424',
    fontFamily:'Mulish'
  },
  modalBody: {
    padding: 20,
    // alignItems: 'center',
  },
  modalMessage: {
    fontSize: 18,
    textAlign: 'flex-start',
    marginBottom: 20,
    color: '#595A5C',
    fontFamily:'Mulish'
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    // width: '40%',
    alignItems:'center'
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
  half: { width: '48%' },
  label: { zIndex: 5, fontWeight: '700',fontFamily:'Mulish', fontSize: 16 },
  left: { marginRight:5,borderWidth: 1, borderColor: BRAND, backgroundColor: WHITE },
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
  fillSolidBrand: { ...StyleSheet.absoluteFillObject, borderRadius: RADIUS, backgroundColor: BRAND },
});

export default ConfirmModalComponent;
