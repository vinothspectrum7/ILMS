import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';

const CustomNumericInput = ({
  value,
  setValue,
  max = 999,
  min = 0,
  step = 1,
  width = 120,
  isSelected = true,
}) => {
  const [touched, setTouched] = useState(false);

  const handleInteraction = () => {
    if (!touched) {
      setTouched(true);
      setValue(max);
    }
  };

  const handleMinus = () => {
    if (!isSelected) return;
    handleInteraction();
    setValue(prev => Math.max(min, prev - step));
  };

  const handlePlus = () => {
    if (!isSelected) return;
    handleInteraction();
    setValue(prev => Math.min(max, prev + step));
  };

  const handleManualInput = (text) => {
    if (!isSelected) return;
    handleInteraction();
    const numeric = parseInt(text.replace(/[^0-9]/g, ''), 10);
    const clamped = isNaN(numeric) ? 0 : Math.min(max, Math.max(min, numeric));
    setValue(clamped);
  };

  const dynamicStyles = touched ? styles.touched : styles.untouched;
  const textColor = touched ? '#fff' : '#233E55';

  return (
    <View style={[styles.container, dynamicStyles.border, { width }]}>
      <TouchableOpacity
        onPress={handleMinus}
        disabled={!isSelected}
        style={[styles.button, dynamicStyles.bg]}
      >
        <Text style={[styles.buttonText, { color: textColor }]}>−</Text>
      </TouchableOpacity>

      <TextInput
        style={[styles.input, dynamicStyles.bg, { color: textColor }]}
        value={String(value)}
        onChangeText={handleManualInput}
        keyboardType="numeric"
        editable={isSelected}
      />

      <TouchableOpacity
        onPress={handlePlus}
        disabled={!isSelected}
        style={[styles.button, dynamicStyles.bg]}
      >
        <Text style={[styles.buttonText, { color: textColor }]}>＋</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 6,
    overflow: 'hidden',
  },
  button: {
    width: 40,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 20,
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
    bg: {
      backgroundColor: '#fff',
    },
    border: {
      borderWidth: 1,
      borderColor: '#233E55',
    },
  },
  touched: {
    bg: {
      backgroundColor: '#233E55',
    },
    border: {
      borderWidth: 1,
      borderColor: '#fff',
    },
  },
});

export default CustomNumericInput;
