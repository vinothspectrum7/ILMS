import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const BRAND = '#233E55';
const WHITE = '#FFFFFF';
const MUTED_WHITE = 'rgba(255,255,255,0.85)';
const MUTED_TEAL  = '#7A8C99';

const GREY_TOP = '#D9D9D9';
const GREY_MID = '#C2C2C2';
const GREY_DARK = '#A9A9A9';

const RADIUS = 42;
const TOPGLOSSRADIUS = 112;
const BOTTOMGLOSSRADIUS = 62;
const HEIGHT = 48;

const Inv_SingleFooterBtnComponent = memo(({
  onSave,
  onReceive,
  
  rightLabel = 'Add',  
  onRightPress,  
  rightEnabled = true,
  containerStyle,  
  rightButtonStyle,
  labelStyle,
  sticky = true,
  showShadow = false,
}) => {
  
  const handleRight = onRightPress ?? onReceive;

  return (
    <View style={[styles.footerContainer, sticky && styles.sticky, showShadow && styles.shadow, containerStyle]}>
      <TouchableOpacity
        onPress={rightEnabled ? handleRight : undefined}
        activeOpacity={rightEnabled ? 0.85 : 1}
        disabled={!rightEnabled}
        style={[styles.buttonBase, styles.half, styles.right, rightButtonStyle]}
      >
        {rightEnabled ? (
          <View style={styles.fillSolidBrand} />
        ) : (
          <LinearGradient
            colors={[GREY_TOP, GREY_MID, GREY_DARK]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.fillGradient}
          />
        )}

        <LinearGradient
          colors={['rgba(255,255,255,0.53)', 'rgba(255,255,255,0)']}
          locations={[0, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.topGloss}
        />

        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.23)']}
          locations={[0.55, 1]}
          start={{ x: 0.5, y: 0.55 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.bottomInnerShadow}
        />

        <LinearGradient
          colors={['rgba(0,0,0,0.16)', 'transparent', 'transparent', 'rgba(0,0,0,0.16)']}
          locations={[0, 0.2, 0.8, 1]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.sideVignette}
        />

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
  half: { width: '95%' },
  left: { marginRight: 4, borderWidth: 1, borderColor: BRAND, backgroundColor: WHITE },
  leftDisabledBorder: { borderColor: '#A0AEB8' },
  right: { marginLeft: 4 },
  buttonBase: {
    height: HEIGHT,
    borderRadius: RADIUS,
    overflow: 'hidden',
    marginBottom: 22,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  label: { zIndex: 5, fontWeight: 'bold', fontSize: 16 },
  fillGradient: { ...StyleSheet.absoluteFillObject, borderRadius: RADIUS },
  fillSolidBrand: { ...StyleSheet.absoluteFillObject, borderRadius: RADIUS, backgroundColor: BRAND },
  topGloss: {
    position: 'absolute',
    top: 0,
    left: 2,
    right: 2,
    height: '52%',
    marginTop: 1,
    marginBottom: 1,  
    borderTopLeftRadius: TOPGLOSSRADIUS,
    borderTopRightRadius: TOPGLOSSRADIUS,
    borderBottomLeftRadius: BOTTOMGLOSSRADIUS, 
    borderBottomRightRadius: BOTTOMGLOSSRADIUS,
    zIndex: 2,
  },
  bottomInnerShadow: {
    position: 'absolute',
    left: 2,
    right: 2,
    bottom: 0,
    height: '36%',
    marginTop: 1,
    marginBottom: 1,  
    borderTopLeftRadius: TOPGLOSSRADIUS,
    borderTopRightRadius: TOPGLOSSRADIUS,
    borderBottomLeftRadius: BOTTOMGLOSSRADIUS, 
    borderBottomRightRadius: BOTTOMGLOSSRADIUS,
    zIndex: 1,
  },
  sideVignette: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: RADIUS,
    zIndex: 1,
  },
});

export default Inv_SingleFooterBtnComponent;
