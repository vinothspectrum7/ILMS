import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

const CustomNumericInput = ({
  value,
  setValue,
  max = 999,
  min = 0,
  step = 1,
  width = 100,
  height= 32,
  isSelected = true,
  onLimit,
}) => {
  const [touched, setTouched] = useState(false);

  const markTouched = () => {
    if (!touched) setTouched(true);
  };

  const safeValue = clamp(Number(value ?? 0) || 0, Number(min) || 0, Number(max) || 0);
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
    const next = clamp(safeValue - step, min, max);
    setValue(next);
  };

  const handlePlus = () => {
    if (!canInc) { onLimit?.(); return; }
    markTouched();
    const next = clamp(safeValue + step, min, max);
    setValue(next);
  };

  const handleManualInput = (text) => {
    if (!isSelected) return;
    markTouched();
    const numeric = parseInt(String(text).replace(/[^0-9]/g, ''), 10);
    apply(isNaN(numeric) ? 0 : numeric);
  };

  const showFilled = isSelected && safeValue > 0;
  const dynamicStyles = showFilled ? styles.touched : styles.untouched;
  const activeTextColor = showFilled ? '#fff' : '#5D768B';

  return (
    <View style={[styles.container, dynamicStyles.border, { width }, { height }]}>
      <TouchableOpacity onPress={handleMinus} disabled={!canDec} style={[styles.button, dynamicStyles.bg]}>
        <Text style={[styles.buttonText, { color: activeTextColor, opacity: canDec ? 1 : 0.5 }]}>−</Text>
      </TouchableOpacity>

      <TextInput
        style={[styles.input, dynamicStyles.bg, { color: activeTextColor }]}
        value={String(safeValue)}
        onChangeText={handleManualInput}
        keyboardType="numeric"
        editable={isSelected}
      />

      <TouchableOpacity onPress={handlePlus} disabled={!canInc} style={[styles.button, dynamicStyles.bg]}>
        <Text style={[styles.buttonText, { color: activeTextColor, opacity: canInc ? 1 : 0.5 }]}>＋</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', borderRadius: 6, overflow: 'hidden' },
  button: { width: 28, height: '100%', justifyContent: 'center', alignItems: 'center' },
  buttonText: { fontSize: 20, fontWeight: 'bold' },
  input: { flex: 1, height: '100%', textAlign: 'center', fontSize: 16, paddingVertical: 0 },
  untouched: {
    bg: { backgroundColor: '#fff' },
    border: { borderWidth: 1, borderColor: '#00000040' },
  },
  touched: {
    bg: { backgroundColor: '#5D768B' },
    border: { borderWidth: 1, borderColor: '#fff' },
  },
});

export default CustomNumericInput;
