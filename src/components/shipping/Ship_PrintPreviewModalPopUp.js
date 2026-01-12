import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions } from 'react-native';
import CloseIcon from '../../assets/icons/close.svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BASE_WIDTH = 375;
const rs = v => (SCREEN_WIDTH / BASE_WIDTH) * v;

const PREVIEW_BG = '#F5F5F6';
const CARD_BG = '#FFFFFF';
const CARD_BORDER = '#E0E0E0';

const Ship_PrintPreviewModalPopUp = ({
  isVisible,
  onClose,
  rows = [],
  pulseWidth,
  pulseHeight,
  cardWidth,
}) => {
  const resolvedCardWidth = useMemo(() => {
    const w = Number(cardWidth);
    return Number.isFinite(w) && w > 0 ? w : rs(372);
  }, [cardWidth]);

  const resolvedPulseWidth = useMemo(() => {
    const w = Number(pulseWidth);
    return Number.isFinite(w) && w > 0 ? w : rs(10);
  }, [pulseWidth]);

  const resolvedPulseHeight = useMemo(() => {
    const h = Number(pulseHeight);
    return Number.isFinite(h) && h > 0 ? h : rs(12);
  }, [pulseHeight]);

  const segments = useMemo(() => {
    const count = Math.max(1, Math.ceil(resolvedCardWidth / resolvedPulseWidth));
    return Array.from({ length: count }).map((_, idx) => ({
      key: `seg_${idx}`,
      isCut: idx % 2 === 0,
    }));
  }, [resolvedCardWidth, resolvedPulseWidth]);

  return (
    <Modal visible={!!isVisible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.screen}>
        <TouchableOpacity activeOpacity={0.85} onPress={onClose} style={styles.topRightClose}>
          <CloseIcon width={rs(18)} height={rs(18)} />
        </TouchableOpacity>

        <View style={styles.centerWrap}>
          <View style={[styles.card, { width: resolvedCardWidth }]}>
            <View style={[styles.waveRow, { height: resolvedPulseHeight }]}>
              {segments.map(seg => (
                <View
                  key={`top_${seg.key}`}
                  style={[
                    styles.waveSeg,
                    {
                      width: resolvedPulseWidth,
                      height: resolvedPulseHeight,
                      backgroundColor: seg.isCut ? PREVIEW_BG : CARD_BG,
                    },
                  ]}
                />
              ))}
            </View>

            <View style={styles.cardBody}>
              {(rows || []).map((row, idx) => (
                <View key={`${row?.label ?? 'row'}_${idx}`} style={styles.row}>
                  <Text style={styles.label}>{row?.label ?? ''}</Text>
                  <Text style={styles.value} numberOfLines={2}>
                    {row?.value ?? ''}
                  </Text>
                </View>
              ))}
            </View>

            <View style={[styles.waveRow, { height: resolvedPulseHeight }]}>
              {segments.map(seg => (
                <View
                  key={`bot_${seg.key}`}
                  style={[
                    styles.waveSeg,
                    {
                      width: resolvedPulseWidth,
                      height: resolvedPulseHeight,
                      backgroundColor: seg.isCut ? PREVIEW_BG : CARD_BG,
                    },
                  ]}
                />
              ))}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: PREVIEW_BG,
  },
  topRightClose: {
    position: 'absolute',
    right: rs(16),
    top: rs(16),
    padding: rs(12),
    zIndex: 10,
  },
  centerWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: rs(16),
  },
  card: {
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    borderRadius: rs(4),
    overflow: 'hidden',
  },
  waveRow: {
    flexDirection: 'row',
    width: '100%',
  },
  waveSeg: {
    flexShrink: 0,
  },
  cardBody: {
    paddingVertical: rs(18),
    paddingHorizontal: rs(18),
    backgroundColor: CARD_BG,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: rs(10),
  },
  label: {
    width: '52%',
    color: '#7A7D80',
    fontSize: rs(14),
    fontWeight: '500',
  },
  value: {
    width: '45%',
    color: '#1E1E1E',
    fontSize: rs(16),
    fontWeight: '700',
    textAlign: 'left',
  },
});

export default Ship_PrintPreviewModalPopUp;
