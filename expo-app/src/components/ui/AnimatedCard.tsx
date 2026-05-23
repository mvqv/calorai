import React from 'react';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { GlassCard } from './GlassCard';
import type { ViewProps } from 'react-native';

export const AnimatedCard: React.FC<ViewProps & { delay?: number }> = ({ children, style, delay = 0, ...rest }) => {
  return (
    <Animated.View entering={FadeInUp.duration(400).delay(delay)} style={style} {...rest}>
      <GlassCard style={{ flex: 1 }}>{children}</GlassCard>
    </Animated.View>
  );
};
