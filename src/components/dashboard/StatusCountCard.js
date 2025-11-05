import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { colors } from '../../theme/colors';
import DividerLine from '../../assets/icons/dividerline.svg';

const { width } = Dimensions.get('window');
const base = 375;
const rs = v => Math.round((width / base) * v);
const CARD_H = rs(84);
const DIVIDER_INSET = rs(14);
const DIVIDER_SIDE_GAP = rs(12);

export default function StatusCountCard({ items = [], style }) {
  const data = items.slice(0, 3);
  return (
    <View style={[styles.card, style]}>
      {data.map((it, idx) => {
        const Icon = it.Icon;
        return (
          <React.Fragment key={`k-${idx}`}>
            <View style={styles.section}>
              {Icon ? <Icon width={rs(22)} height={rs(22)} /> : null}
              <Text numberOfLines={1} ellipsizeMode="tail" style={styles.title}>{it.title}</Text>
              <Text style={styles.value}>{String(it.value ?? '')}</Text>
            </View>
            {idx < data.length - 1 && (
              <View style={styles.dividerWrap}>
                <DividerLine width={rs(1)} height="100%" />
              </View>
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    height: CARD_H,
    width: '100%',
    alignSelf: 'stretch',
    backgroundColor: colors.cardBg,
    borderRadius: rs(18),
    elevation: 1,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: rs(2) },
    shadowOpacity: 0.08,
    shadowRadius: rs(6),
    borderColor: colors.cardBorder,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingHorizontal: rs(6)
  },
  section: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: rs(6)
  },
  dividerWrap: {
    width: rs(1),
    marginVertical: DIVIDER_INSET,
    marginLeft: DIVIDER_SIDE_GAP,
    marginRight: DIVIDER_SIDE_GAP,
    alignSelf: 'stretch',
    justifyContent: 'center'
  },
  title: {
    marginTop: rs(6),
    fontSize: rs(10),
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
    fontFamily:'Mulish'
  },
  value: {
    marginTop: rs(4),
    fontSize: rs(16),
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center'
  }
});
