import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

const CustomNumericInput = ({
  value,
  setValue,
  max = 999,
  min = 0,
  step = 1,
  width = 120,
  isSelected = true,
  onLimit,             // optional: () => {} when hitting a limit
}) => {
  const [touched, setTouched] = useState(false);

  const markTouched = () => {
    if (!touched) setTouched(true);
  };

  const safeValue = clamp(Number(value ?? 0) || 0, min, max);
  const canDec = isSelected && safeValue > min;
  const canInc = isSelected && safeValue < max;

  const apply = (next) => {
    const clamped = clamp(Number(next) || 0, min, max);
    if (clamped !== safeValue) {
      setValue(clamped);
    } else if (onLimit && (next > max || next < min)) {
      onLimit();
    }
  };

  const handleMinus = () => {
    if (!canDec) { onLimit?.(); return; }
    markTouched();
    setValue(prev => clamp((Number(prev) || 0) - step, min, max));
  };

  const handlePlus = () => {
    if (!canInc) { onLimit?.(); return; }
    markTouched();
    setValue(prev => clamp((Number(prev) || 0) + step, min, max));
  };

  const handleManualInput = (text) => {
    if (!isSelected) return;
    markTouched();
    const numeric = parseInt(String(text).replace(/[^0-9]/g, ''), 10);
    apply(isNaN(numeric) ? 0 : numeric);
  };

  const dynamicStyles = touched ? styles.touched : styles.untouched;
  const textColor = touched ? '#fff' : '#233E55';

  return (
    <View style={[styles.container, dynamicStyles.border, { width }]}>
      <TouchableOpacity
        onPress={handleMinus}
        disabled={!canDec}
        style={[styles.button, dynamicStyles.bg, !canDec && styles.disabled]}
      >
        <Text style={[styles.buttonText, { color: textColor }]}>−</Text>
      </TouchableOpacity>

      <TextInput
        style={[styles.input, dynamicStyles.bg, { color: textColor }]}
        value={String(safeValue)}     // always show clamped value
        onChangeText={handleManualInput}
        keyboardType="numeric"
        editable={isSelected}
      />

      <TouchableOpacity
        onPress={handlePlus}
        disabled={!canInc}
        style={[styles.button, dynamicStyles.bg, !canInc && styles.disabled]}
      >
        <Text style={[styles.buttonText, { color: textColor }]}>＋</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { height: 40, flexDirection: 'row', alignItems: 'center', borderRadius: 6, overflow: 'hidden' },
  button: { width: 40, height: '100%', justifyContent: 'center', alignItems: 'center' },
  buttonText: { fontSize: 20, fontWeight: 'bold' },
  input: { flex: 1, height: '100%', textAlign: 'center', fontSize: 16, paddingVertical: 0 },
  disabled: { opacity: 0.5 },
  untouched: {
    bg: { backgroundColor: '#fff' },
    border: { borderWidth: 1, borderColor: '#233E55' },
  },
  touched: {
    bg: { backgroundColor: '#233E55' },
    border: { borderWidth: 1, borderColor: '#fff' },
  },
});

export default CustomNumericInput;
