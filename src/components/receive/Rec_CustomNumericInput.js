import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

const Rec_CustomNumericInput = ({
  value,
  setValue,
  max = 10000,
  min = 0,
  step = 1,
  width = 100,
  height = 80,
  isSelected = true,
  disabledinput = true,
  onLimit,
  bgColor,       // optional override for background color
  borderColor,   // optional override for border color
  textColor,     // optional override for text color
}) => {
  const [touched, setTouched] = useState(false);

  const markTouched = () => {
    if (!touched) setTouched(true);
  };

  const safeValue = clamp(Number(value ?? 0) || 0, Number(min) || 0, Number(max) || 0);
  const canDec = safeValue > min;
  const canInc = safeValue < max;

  const apply = next => {
    const clamped = clamp(Number(next) || 0, min, max);
    if (clamped !== safeValue) {
      setValue(clamped);
    } else if (onLimit && (next > max || next < min)) {
      onLimit();
    }
  };

  const handleMinus = () => {
    if (!canDec) {
      onLimit?.();
      return;
    }
    markTouched();
    const next = clamp(safeValue - step, min, max);
    setValue(next);
  };

  const handlePlus = () => {
    if (!canInc) {
      onLimit?.();
      return;
    }
    markTouched();
    const next = clamp(safeValue + step, min, max);
    setValue(next);
  };

  const handleManualInput = text => {
    markTouched();
    const numeric = parseInt(String(text).replace(/[^0-9]/g, ''), 10);
    apply(isNaN(numeric) ? 0 : numeric);
  };

  const showFilled = isSelected && safeValue > 0;

  const baseStateStyles = disabledinput
    ? styles.disabledvalue
    : showFilled
    ? styles.touched
    : styles.untouched;

  const activeTextColor = disabledinput ? '#595A5C' : showFilled ? '#FFFFFF' : '#5D768B';
  const appliedTextColor = textColor || activeTextColor;

  const containerBorderStyle = [
    baseStateStyles.border,
    borderColor && { borderColor },
  ];

  const containerBgStyle = [
    baseStateStyles.bg,
    bgColor && { backgroundColor: bgColor },
  ];

  const innerBgStyle = containerBgStyle; // use same bg for buttons & input

  return (
    <View
      style={[
        styles.container,
        containerBorderStyle,
        containerBgStyle,
        { width, height },
      ]}
    >
      <TouchableOpacity
        disabled={!canDec || disabledinput}
        onPress={handleMinus}
        style={[styles.button, innerBgStyle]}
      >
        <Text
          style={[
            styles.buttonText,
            { color: appliedTextColor, opacity: canDec && !disabledinput ? 1 : 0.5 },
          ]}
        >
          —
        </Text>
      </TouchableOpacity>

      <TextInput
        style={[styles.input, innerBgStyle, { color: appliedTextColor }]}
        value={String(safeValue)}
        onChangeText={text => {
          const onlyDigits = text.replace(/[^0-9]/g, '');
          handleManualInput(onlyDigits);
        }}
        onKeyPress={({ nativeEvent }) => {
          const { key } = nativeEvent;
          if (!/^[0-9]$/.test(key) && key !== 'Backspace') {
            return;
          }
        }}
        keyboardType="numeric"
        editable={!disabledinput}
      />

      <TouchableOpacity
        disabled={!canInc || disabledinput}
        onPress={handlePlus}
        style={[styles.button, innerBgStyle]}
      >
        <Text
          style={[
            styles.buttonText,
            { color: appliedTextColor, opacity: canInc && !disabledinput ? 1 : 0.5 },
          ]}
        >
          ＋
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    overflow: 'hidden',
  },
  button: {
    width: 36,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  input: {
    flex: 1,
    height: '100%',
    textAlign: 'center',
    fontSize: 16,
    paddingVertical: 0,
  },
  untouched: {
    bg: { backgroundColor: '#FFFFFF' },
    border: { borderWidth: 1, borderColor: '#00000040' },
  },
  touched: {
    bg: { backgroundColor: '#5D768B' },
    border: { borderWidth: 1, borderColor: '#FFFFFF' },
  },
  disabledvalue: {
    bg: { backgroundColor: '#EFEFF0' },
    border: { borderWidth: 1, borderColor: '#FFFFFF' },
  },
});

export default Rec_CustomNumericInput;
