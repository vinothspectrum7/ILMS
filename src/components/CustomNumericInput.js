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
  disabledinput = true,
  onLimit,
}) => {
  const [touched, setTouched] = useState(false);

  const markTouched = () => {
    if (!touched) setTouched(true);
  };

  const safeValue = clamp(Number(value ?? 0) || 0, Number(min) || 0, Number(max) || 0);
  const canDec = safeValue > min;
  const canInc = safeValue < max;

  const apply = (next) => {
    const clamped = clamp(Number(next) || 0, min, max);
    if (clamped !== safeValue) {
      setValue(clamped);
    } else if (onLimit && (next > max || next < min)) {
      onLimit();
    }
  };

  const handleMinus = () => {
    console.log(canDec,safeValue,max,min,"cande")
    if (!canDec) { onLimit?.(); return; }
    markTouched();
    const next = clamp(safeValue - step, min, max);
    console.log(next,"NXTEETESTTET")
    setValue(next);
  };

  const handlePlus = () => {
    if (!canInc) { onLimit?.(); return; }
    markTouched();
    const next = clamp(safeValue + step, min, max);
    setValue(next);
  };

  const handleManualInput = (text) => {
    // if (!isSelected) return;
    markTouched();
    const numeric = parseInt(String(text).replace(/[^0-9]/g, ''), 10);
    apply(isNaN(numeric) ? 0 : numeric);
  };

  const showFilled = isSelected && safeValue > 0;
  const dynamicStyles = disabledinput?styles.disabledvalue:showFilled ? styles.touched : styles.untouched;
  const activeTextColor = disabledinput?'#fff':showFilled ? '#fff' : '#5D768B';

  return (
    <View style={[styles.container, dynamicStyles.border, { width }, { height }]}>
      <TouchableOpacity disabled={!canDec ||disabledinput} onPress={handleMinus}  style={[styles.button, dynamicStyles.bg]}>
        <Text style={[styles.buttonText, { color: activeTextColor, opacity: canDec ? 1 : 0.5 }]}>−</Text>
      </TouchableOpacity>

      <TextInput
        style={[styles.input, dynamicStyles.bg, { color: activeTextColor }]}
        value={String(safeValue)}
        onChangeText={handleManualInput}
        keyboardType="numeric"
        editable={!disabledinput}
      />

      <TouchableOpacity disabled={!canInc||disabledinput} onPress={handlePlus}  style={[styles.button, dynamicStyles.bg]}>
        <Text style={[styles.buttonText, { color: activeTextColor, opacity: canInc ? 1 : 0.5 }]}>＋</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', borderRadius: 6, overflow: 'hidden' },
  button: { width: 20, height: '100%', justifyContent: 'center', alignItems: 'center' },
  buttonText: { fontSize: 14, fontWeight: 'bold' },
  input: { flex: 1, height: '100%', textAlign: 'center', fontSize: 12, paddingVertical: 0,marginRight:-1,marginLeft:-1 },
  untouched: {
    bg: { backgroundColor: '#fff' },
    border: { borderWidth: 1, borderColor: '#00000040' },
  },
  touched: {
    bg: { backgroundColor: '#5D768B' },
    border: { borderWidth: 1, borderColor: '#fff' },
  },
  disabledvalue: {
    bg: { backgroundColor: '#9D9FA3' },
    border: { borderWidth: 1, borderColor: '#fff' },
  },
});

export default CustomNumericInput;
