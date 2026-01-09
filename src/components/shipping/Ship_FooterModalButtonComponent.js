import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const BRAND = '#233E55';
const WHITE = '#FFFFFF';
const MUTED_WHITE = 'rgba(255,255,255,0.85)';
const MUTED_TEAL  = '#7A8C99';

const RADIUS = 42;
const HEIGHT = 48;

const Ship_FooterModalButtonComponent = memo(({
  onSave,
  onReceive,
  leftLabel = 'Manual',
  rightLabel = 'Yes',
  onLeftPress,
  onRightPress,
  leftEnabled = true,
  rightEnabled = true,
  containerStyle,
  leftButtonStyle,
  rightButtonStyle,
  labelStyle,
  sticky = true,
  showShadow = false,
}) => {
  const handleLeft = onLeftPress ?? onSave;
  const handleRight = onRightPress ?? onReceive;

  return (
    <View style={[styles.footerContainer, sticky && styles.sticky, showShadow && styles.shadow, containerStyle]}>
      <TouchableOpacity
        onPress={leftEnabled ? handleLeft : undefined}
        activeOpacity={leftEnabled ? 0.85 : 1}
        disabled={!leftEnabled}
        style={[styles.buttonBaseleft, styles.half, styles.left, leftButtonStyle, !leftEnabled && styles.leftDisabledBorder]}
      >
        <LinearGradient
          colors={leftEnabled ? ['rgba(255,255,255,0.70)', '#EBF7F6'] : ['rgba(255,255,255,0.55)', '#EBF7F6']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.fillGradient}
        />
        <Text style={[styles.label, { color: leftEnabled ? BRAND : MUTED_TEAL }, labelStyle]}>{leftLabel}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={rightEnabled ? handleRight : undefined}
        activeOpacity={rightEnabled ? 0.85 : 1}
        disabled={!rightEnabled}
        style={[styles.buttonBaseRight, styles.half, rightButtonStyle]}
      >
        {rightEnabled ? (
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
        <Text style={[styles.label, { color: rightEnabled ? WHITE : MUTED_WHITE }, labelStyle]}>{rightLabel}</Text>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  footerContainer: {
    backgroundColor: '#F6F8FA',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  sticky: { paddingBottom: Platform.select({ ios: 24, android: 12 }) },
  shadow: {
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: -2 } },
      android: { elevation: 6 },
    }),
  },
  half: { width: '50%' },
  left: { marginRight: 4, borderWidth: 1, borderColor: BRAND, backgroundColor: WHITE },
  leftDisabledBorder: { borderColor: '#A0AEB8' },
  buttonBaseRight: {
    height: HEIGHT,
    // borderRadius: RADIUS,
    borderTopRightRadius: RADIUS,
    borderBottomRightRadius: RADIUS,
    overflow: 'hidden',
    marginBottom: 22,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
   buttonBaseLeft: {
    height: HEIGHT,
    // borderRadius: RADIUS,
      borderTopLeftRadius: RADIUS,
    borderBottomLeftRadius: RADIUS,
    overflow: 'hidden',
    marginBottom: 22,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  label: { zIndex: 5, fontWeight: 'bold', fontSize: 16 },
  fillGradient: { ...StyleSheet.absoluteFillObject, borderRadius: RADIUS },
  fillSolidBrand: { ...StyleSheet.absoluteFillObject, borderRadius: RADIUS, backgroundColor: BRAND },
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
});

export default Ship_FooterModalButtonComponent;
