import React, { useEffect, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../styles/colors';

type FloatingTextInputProps = TextInputProps & {
  label: string;
  value: string;
  error?: string | null;
  secureTextEntry?: boolean;
  showPasswordToggle?: boolean;
};

const ALTURA_CAMPO = 56;

export default function FloatingTextInput({
  label,
  value,
  error,
  secureTextEntry = false,
  showPasswordToggle = false,
  onFocus,
  onBlur,
  ...rest
}: FloatingTextInputProps) {
  const [hidden, setHidden] = useState(secureTextEntry);
  const [focused, setFocused] = useState(false);

  const ativo = focused || value.length > 0;

  const progress = useSharedValue(ativo ? 1 : 0);
  const shakeX = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(ativo ? 1 : 0, { duration: 180 });
  }, [ativo, progress]);

  useEffect(() => {
    if (error) {
      shakeX.value = 0;
      shakeX.value = withSequence(
        withTiming(-8, { duration: 50 }),
        withTiming(8, { duration: 50 }),
        withTiming(-6, { duration: 50 }),
        withTiming(6, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
    }
  }, [error, shakeX]);

  // O label parte do centro do campo e sobe para o topo quando ativo.
  // `top` fixo = centro (28); translateY -9 centraliza o texto de 16px
  // em repouso e diminui para -28 quando o label flutua para o topo.
  const labelStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -9 + progress.value * -19 }],
    fontSize: 16 - progress.value * 4,
  }));

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const labelColor = error ? COLORS.danger : focused ? COLORS.primary : COLORS.textLight;

  return (
    <View style={styles.group}>
      <Animated.View
        style={[
          styles.border,
          shakeStyle,
          error && styles.borderErro,
          focused && !error && styles.borderFoco,
        ]}
      >
        <TextInput
          value={value}
          secureTextEntry={hidden}
          style={styles.input}
          placeholderTextColor={COLORS.textLight}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />
        <Animated.Text
          pointerEvents="none"
          style={[styles.label, labelStyle, { color: labelColor }]}
        >
          {label}
        </Animated.Text>
        {showPasswordToggle && (
          <Pressable onPress={() => setHidden((h) => !h)} style={styles.olho}>
            <MaterialCommunityIcons
              name={hidden ? 'eye-off' : 'eye'}
              size={24}
              color={COLORS.textLight}
            />
          </Pressable>
        )}
      </Animated.View>
      {error ? <Text style={styles.erroTexto}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    marginBottom: 4,
  },
  border: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 14,
    height: ALTURA_CAMPO,
    flexDirection: 'row',
    alignItems: 'center',
  },
  borderFoco: {
    borderColor: COLORS.primary,
  },
  borderErro: {
    borderColor: COLORS.danger,
  },
  input: {
    flex: 1,
    height: ALTURA_CAMPO,
    fontSize: 16,
    color: COLORS.textDark,
  },
  label: {
    position: 'absolute',
    left: 14,
    top: ALTURA_CAMPO / 2,
    transform: [{ translateY: -9 }],
    fontWeight: '500',
  },
  olho: {
    paddingHorizontal: 4,
  },
  erroTexto: {
    color: COLORS.danger,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});
