import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const BRAND = '#233E55';
const WHITE = '#FFFFFF';
const MUTED_WHITE = 'rgba(255,255,255,0.85)';
const MUTED_TEAL = '#7A8C99';

const RADIUS = 28;   
const HEIGHT = 44;  

const Ship_FooterModalButtonComponent = memo(({
  onSave,
  onReceive,
  leftLabel = 'Cancel',
  rightLabel = 'Confirm',
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
    <View
      style={[
        styles.footerContainer,
        sticky && styles.sticky,
        showShadow && styles.shadow,
        containerStyle,
      ]}
    >
      <TouchableOpacity
        onPress={leftEnabled ? handleLeft : undefined}
        activeOpacity={0.85}
        disabled={!leftEnabled}
        style={[
          styles.buttonBase,
          styles.leftButton,
          leftButtonStyle,
          !leftEnabled && styles.leftDisabledBorder,
        ]}
      >
        <LinearGradient
          colors={
            leftEnabled
              ? ['#FFFFFF', '#F1F5F8']
              : ['#F2F2F2', '#E6E6E6']
          }
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.fill}
        />
        <Text
          style={[
            styles.label,
            { color: leftEnabled ? BRAND : MUTED_TEAL },
            labelStyle,
          ]}
        >
          {leftLabel}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={rightEnabled ? handleRight : undefined}
        activeOpacity={0.85}
        disabled={!rightEnabled}
        style={[
          styles.buttonBase,
          styles.rightButton,
          rightButtonStyle,
        ]}
      >
        {rightEnabled ? (
          <>
            <LinearGradient
              colors={['#2A4B63', '#1E3548']}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={styles.fill}
            />
            <LinearGradient
              colors={['rgba(255,255,255,0.25)', 'transparent']}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={styles.subtleGloss}
            />
          </>
        ) : (
          <LinearGradient
            colors={['#DADADA', '#BEBEBE']}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.fill}
          />
        )}

        <Text
          style={[
            styles.label,
            { color: rightEnabled ? WHITE : MUTED_WHITE },
            labelStyle,
          ]}
        >
          {rightLabel}
        </Text>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  footerContainer: {
    // backgroundColor: '#F6F8FA',
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },

  sticky: {
    paddingBottom: Platform.select({ ios: 24, android: 12 }),
  },

  shadow: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: -2 },
      },
      android: { elevation: 6 },
    }),
  },

  buttonBase: {
    flex: 1,
    height: HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },

  leftButton: {
    borderTopLeftRadius: RADIUS,
    borderBottomLeftRadius: RADIUS,
    borderWidth: 1,
    borderColor: BRAND,
    backgroundColor: WHITE,
  },

  rightButton: {
    borderTopRightRadius: RADIUS,
    borderBottomRightRadius: RADIUS,
  },

  leftDisabledBorder: {
    borderColor: '#A0AEB8',
  },

  label: {
    fontSize: 15,
    fontWeight: '600',
    zIndex: 2,
  },

  fill: {
    ...StyleSheet.absoluteFillObject,
  },

  subtleGloss: {
    position: 'absolute',
    top: 0,
    height: '45%',
    width: '100%',
  },
});

export default Ship_FooterModalButtonComponent;
