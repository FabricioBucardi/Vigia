import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  PressableProps,
} from 'react-native';
import { COLORS } from '../styles/colors';
import { FONT_SIZE, FONT_WEIGHT, LAYOUT, RADIUS } from '../styles/tokens';

type PrimaryButtonProps = PressableProps & {
  title: string;
  loading?: boolean;
};

export default function PrimaryButton({ title, loading = false, disabled, ...rest }: PrimaryButtonProps) {
  const inativo = disabled || loading;
  return (
    <Pressable
      style={[styles.botao, inativo && styles.botaoDesabilitado]}
      disabled={inativo}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={COLORS.surface} />
      ) : (
        <Text style={styles.texto}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  botao: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: LAYOUT.buttonPaddingY,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: LAYOUT.touchTarget,
  },
  botaoDesabilitado: {
    opacity: 0.7,
  },
  texto: {
    color: COLORS.surface,
    fontSize: FONT_SIZE.input,
    fontWeight: FONT_WEIGHT.bold,
  },
});
