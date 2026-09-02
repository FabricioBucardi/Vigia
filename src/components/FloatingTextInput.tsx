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
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../styles/colors';

export const ALTURA_CAMPO = 56;

const FONTE_REPOUSO = 16;
const FONTE_ATIVO = 12;
const TRANSLATE_REPOUSO = -9;
const TRANSLATE_ATIVO = -ALTURA_CAMPO / 2;

type FloatingLabelProps = {
  label: string;
  progress: SharedValue<number>;
  cor: string;
};

function FloatingLabel({ label, progress, cor }: FloatingLabelProps) {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY:
          TRANSLATE_REPOUSO + progress.value * (TRANSLATE_ATIVO - TRANSLATE_REPOUSO),
      },
    ],
    fontSize: FONTE_REPOUSO + progress.value * (FONTE_ATIVO - FONTE_REPOUSO),
    lineHeight: FONTE_REPOUSO + progress.value * (FONTE_ATIVO - FONTE_REPOUSO),
  }));

  return (
    <Animated.Text
      numberOfLines={1}
      style={[styles.label, animatedStyle, { color: cor }]}
    >
      {label}
    </Animated.Text>
  );
}

type FloatingTextInputProps = TextInputProps & {
  label: string;
  value: string;
  error?: string | null;
  secureTextEntry?: boolean;
  showPasswordToggle?: boolean;
  onClearError?: () => void;
};

export default function FloatingTextInput({
  label,
  value,
  error,
  secureTextEntry = false,
  showPasswordToggle = false,
  onClearError,
  onFocus,
  onBlur,
  onChangeText,
  placeholder,
  ...rest
}: FloatingTextInputProps) {
  const [hidden, setHidden] = useState(secureTextEntry);
  const [focused, setFocused] = useState(false);

  const ativo = focused || value.length > 0;

  const progress = useSharedValue(ativo ? 1 : 0);
  const shakeX = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(ativo ? 1 : 0, { duration: 160 });
  }, [ativo, progress]);

  useEffect(() => {
    if (error) {
      dispararShake();
    }
  }, [error, shakeX]);

  function dispararShake() {
    shakeX.value = 0;
    shakeX.value = withSequence(
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(-6, { duration: 50 }),
      withTiming(6, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
  }

  // O label parte do centro do campo e sobe para o topo quando ativo.
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
          placeholder={focused ? placeholder : undefined}
          placeholderTextColor={COLORS.textLight}
          onFocus={(e) => {
            setFocused(true);
            onClearError?.();
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            if (error) {
              dispararShake();
            }
            onBlur?.(e);
          }}
          onChangeText={(t) => {
            onChangeText?.(t);
            onClearError?.();
          }}
          {...rest}
        />
        <FloatingLabel label={label} progress={progress} cor={labelColor} />
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
  label: {
    position: 'absolute',
    left: 14,
    top: ALTURA_CAMPO / 2,
    fontWeight: '500',
    pointerEvents: 'none',
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
    paddingVertical: 0,
    textAlignVertical: 'center',
    includeFontPadding: false,
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
