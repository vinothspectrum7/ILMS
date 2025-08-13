import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const FooterButtonsComponent = memo((props) => {
  const {
    onSave,
    onReceive,
    isReceiveEnabled,
    leftLabel = 'Save',
    rightLabel = 'Receive',
    onLeftPress,
    onRightPress,
    leftEnabled = isReceiveEnabled === undefined ? true : !!isReceiveEnabled,
    rightEnabled = isReceiveEnabled === undefined ? true : !!isReceiveEnabled,
    leftVariant = 'light',
    rightVariant = 'dark',
    containerStyle,
    leftButtonStyle,
    rightButtonStyle,
    labelStyle,
    sticky = true,
    showShadow = false,
  } = props;

  const handleLeft = onLeftPress ?? onSave;
  const handleRight = onRightPress ?? onReceive;

  const renderButton = ({ label, onPress, enabled, variant, extraStyle }) => {
    const isDark = variant === 'dark';
    const isOutline = variant === 'outline';

    const gradientEnabled = isDark
      ? ['#233E55', '#233E55', '#233E55']
      : ['#EBF7F6', '#EBF7F6', '#EBF7F6'];
    const gradientDisabled = isDark
      ? ['#233e5538', '#233e5538', '#233e5538']
      : ['#ebf7f650', '#ebf7f650', '#ebf7f650'];

    const gradientColors = enabled ? gradientEnabled : gradientDisabled;
    const textColor = isDark ? (enabled ? '#FFFFFF' : '#233E55') : '#233E55';

    return (
      <TouchableOpacity
        onPress={enabled ? onPress : undefined}
        style={[styles.buttonBase, extraStyle, isOutline && styles.buttonOutline]}
        activeOpacity={enabled ? 0.8 : 1}
        disabled={!enabled}
      >
        <View style={styles.glossWrapper}>
          <LinearGradient
            colors={['#EBF7F6', 'rgba(255, 255, 255, 0.1)', 'transparent']}
            style={styles.glossOverlay}
            start={{ x: 0.0, y: 0.0 }}
            end={{ x: 0.0, y: 1.0 }}
          />
        </View>

        {!isOutline && (
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0.0, y: 0.5 }}
            end={{ x: 1.0, y: 0.5 }}
            style={styles.shinyGradient}
          />
        )}

        <Text style={[styles.label, { color: textColor }, labelStyle]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={[
        styles.footerContainer,
        sticky && styles.sticky,
        showShadow && styles.shadow,
        containerStyle,
      ]}
    >
      {renderButton({
        label: leftLabel,
        onPress: handleLeft,
        enabled: leftEnabled,
        variant: leftVariant,
        extraStyle: [styles.half, styles.left, leftButtonStyle],
      })}

      {renderButton({
        label: rightLabel,
        onPress: handleRight,
        enabled: rightEnabled,
        variant: rightVariant,
        extraStyle: [styles.half, styles.right, rightButtonStyle],
      })}
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
  sticky: {
    paddingBottom: Platform.select({ ios: 24, android: 12 }),
  },
  shadow: {
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: -2 } },
      android: { elevation: 6 },
    }),
  },
  half: {
    width: '50%',
  },
  left: {
    marginRight: 4,
    borderWidth: 1,
    borderColor: '#233E55',
  },
  right: {
    marginLeft: 4,
  },
  buttonBase: {
    height: 40,
    borderRadius: 30,
    overflow: 'hidden',
    marginBottom: 30,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#233E55',
  },
  shinyGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 30,
  },
  glossWrapper: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 30,
    zIndex: 1,
    overflow: 'hidden',
  },
  glossOverlay: {
    height: '60%',
    width: '100%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  label: {
    zIndex: 2,
    fontWeight: 'bold',
  },
});

export default FooterButtonsComponent;
