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
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../styles/colors';
import { FONT_SIZE, FONT_WEIGHT, LAYOUT, RADIUS, SPACING } from '../styles/tokens';

type FloatingLabelProps = {
  label: string;
  progress: SharedValue<number>;
  cor: string;
};

function FloatingLabel({ label, progress, cor }: FloatingLabelProps) {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(progress.value, [0, 1], [0, -14]),
      },
      {
        scale: interpolate(progress.value, [0, 1], [1, 0.75]),
      },
    ],
    transformOrigin: 'left center',
  }));

  return (
    <View pointerEvents="none" style={styles.labelContainer}>
      <Animated.Text
        numberOfLines={1}
        style={[styles.labelText, animatedStyle, { color: cor }]}
      >
        {label}
      </Animated.Text>
    </View>
  );
}

type FloatingTextInputProps = TextInputProps & {
  label: string;
  value: string;
  error?: string | null;
  secureTextEntry?: boolean;
  showPasswordToggle?: boolean;
  onClearError?: () => void;
  disableShake?: boolean;
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
  disableShake = false,
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
    if (error && !disableShake) {
      dispararShake();
    }
  }, [error, shakeX, disableShake]);

  function dispararShake() {
    shakeX.value = withSequence(
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(-6, { duration: 50 }),
      withTiming(6, { duration: 50 }),
      withTiming(0, { duration: 50 }),
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
          style={[styles.input, ativo && styles.inputAtivo]}
          placeholder={focused ? placeholder : undefined}
          placeholderTextColor={COLORS.textLight}
          onFocus={(e) => {
            setFocused(true);
            onClearError?.();
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            if (error && !disableShake) {
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
    marginBottom: SPACING.xs,
  },
  labelContainer: {
    position: 'absolute',
    left: LAYOUT.fieldPadding,
    top: SPACING.none,
    bottom: SPACING.none,
    justifyContent: 'center',
  },
  labelText: {
    fontSize: FONT_SIZE.input,
    fontWeight: FONT_WEIGHT.medium,
    includeFontPadding: false,
  },
  border: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    paddingHorizontal: LAYOUT.fieldPadding,
    height: LAYOUT.fieldHeight,
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
    height: LAYOUT.fieldHeight,
    fontSize: FONT_SIZE.input,
    color: COLORS.textDark,
    paddingVertical: SPACING.none,
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  inputAtivo: {
    paddingTop: LAYOUT.fieldPadding,
    paddingBottom: SPACING.hairline,
  },
  olho: {
    paddingHorizontal: SPACING.xs,
  },
  erroTexto: {
    color: COLORS.danger,
    fontSize: FONT_SIZE.caption,
    marginTop: SPACING.xs,
    marginLeft: SPACING.xs,
  },
});
