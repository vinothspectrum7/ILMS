import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import LeftArrow from '../assets/icons/leftarrow.svg';
import RightArrow from '../assets/icons/rightarrow.svg';

const LineItemNavigationHeader = ({ index, total, onPrev, onNext }) => {
  const canPrev = index > 0;
  const canNext = index < total - 1;

  return (
    <View style={styles.wrap}>
      <TouchableOpacity
        onPress={canPrev ? onPrev : undefined}
        disabled={!canPrev}
        style={[styles.arrowBtn, !canPrev && styles.disabled]}
      >
        <LeftArrow width={16} height={16} />
      </TouchableOpacity>

      <Text style={styles.title}>{`Line ${index + 1} of ${total}`}</Text>

      <TouchableOpacity
        onPress={canNext ? onNext : undefined}
        disabled={!canNext}
        style={[styles.arrowBtn, !canNext && styles.disabled]}
      >
        <RightArrow width={16} height={16} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { marginHorizontal: 16, marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  arrowBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: '#F4F5F6',
    alignItems: 'center', justifyContent: 'center',
  },
  disabled: { opacity: 0.4 },
  title: { fontSize: 14, fontWeight: '700', color: '#0A395D' },
});

export default LineItemNavigationHeader;
