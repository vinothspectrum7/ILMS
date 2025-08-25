import React, { useEffect } from 'react';
import { Modal, View, Text, Pressable, Dimensions, StyleSheet } from 'react-native';
import ConfirmSuccess from '../assets/icons/ConfirmSuccess.svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BASE_WIDTH = 375;
const scale = (size) => (SCREEN_WIDTH / BASE_WIDTH) * size;
const ms = (size, factor = 0.35) => size + (scale(size) - size) * factor;

export default function SuccessModal({
  visible,
  message = 'Submitted Successfully',
  onDismiss = () => {},
  autoHideMs = 1800,
}) {
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(onDismiss, autoHideMs);
    return () => clearTimeout(t);
  }, [visible, autoHideMs, onDismiss]);

  
  const CARD_W = Math.min(scale(372), SCREEN_WIDTH - scale(44));
  const CARD_H = scale(184);

  return (
    <Modal transparent visible={visible} animationType="fade">
      <Pressable style={styles.backdrop} onPress={onDismiss}>
        <View style={[styles.card, { width: CARD_W, height: CARD_H }]}>
          <ConfirmSuccess width={scale(64)} height={scale(64)} />
          <Text style={styles.msg}>{message}</Text>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: ms(20),
    paddingHorizontal: ms(24),
    paddingVertical: ms(24),
    alignItems: 'center',
    justifyContent: 'center',
    // shadow
    elevation: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
  },
  msg: {
    marginTop: ms(14),
    fontSize: ms(16),
    fontWeight: '600',
    color: '#0F172A', 
    textAlign: 'center',
  },
});
