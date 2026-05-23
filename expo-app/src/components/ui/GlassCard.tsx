import React from 'react';
import { View, StyleSheet, type ViewProps } from 'react-native';
import { COLORS, SHADOW } from '@/constants/theme';

export const GlassCard: React.FC<ViewProps> = ({ children, style, ...rest }) => {
  return (
    <View style={[styles.card, style]} {...rest}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    ...SHADOW.light,
    overflow: 'hidden',
  },
});
