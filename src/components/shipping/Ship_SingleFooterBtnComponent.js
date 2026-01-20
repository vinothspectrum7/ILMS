import React, { memo } from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const BRAND = '#233E55';
const WHITE = '#FFFFFF';
const MUTED_WHITE = 'rgba(255,255,255,0.85)';

const RADIUS = 42;
const HEIGHT = 48;

const Ship_SingleFooterBtnComponent = memo(({
  label = 'Submit',
  onPress,
  enabled = true,
  containerStyle,
  buttonStyle,
  labelStyle,
}) => {
  return (
    <TouchableOpacity
      onPress={enabled ? onPress : undefined}
      activeOpacity={enabled ? 0.85 : 1}
      disabled={!enabled}
      style={[styles.buttonBase, buttonStyle, !enabled && styles.disabled]}
    >
      {enabled ? (
        <>
          <View style={styles.fillSolidBrand} />
          <View style={styles.glossWrapper}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.6)', 'transparent', 'transparent', 'transparent', 'transparent', 'rgba(255, 255, 255, 0.3)']}
              style={styles.glossOverlay}
              start={{ x: 0.0, y: 0.0 }}
              end={{ x: 0.0, y: 1.0 }}
            />
          </View>
        </>
      ) : (
        <LinearGradient
          colors={['#D9D9D9', '#C2C2C2', '#A9A9A9']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.fillGradient}
        />
      )}
      <Text style={[styles.label, { color: enabled ? WHITE : MUTED_WHITE }, labelStyle]}>{label}</Text>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  buttonBase: {
    height: HEIGHT,
    borderRadius: RADIUS,
    overflow: 'hidden',
    marginBottom: 30,
    justifyContent: 'space-around',
    alignItems: 'center',
    position: 'relative',
    width: '100%',
    marginStart: 0,
  },
  fillSolidBrand: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: RADIUS,
    backgroundColor: BRAND,
  },
  glossWrapper: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: RADIUS,
    zIndex: 1,
    overflow: 'hidden',
  },
  glossOverlay: {
    height: '97%',
    width: '100%',
    marginTop: 1,
    marginBottom: 1,
    borderTopLeftRadius: 95,
    borderTopRightRadius: 95,
    borderBottomLeftRadius: 45,
    borderBottomRightRadius: 45,
  },
  fillGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: RADIUS,
  },
  label: {
    zIndex: 5,
    fontWeight: 'bold',
    fontSize: 16,
  },
  disabled: {
    // no extra style needed here but placeholder for any needed disabled state styling
  },
});

export default Ship_SingleFooterBtnComponent;
