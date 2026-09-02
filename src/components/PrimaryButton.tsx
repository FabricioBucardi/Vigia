import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  PressableProps,
} from 'react-native';
import { COLORS } from '../styles/colors';

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
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  botaoDesabilitado: {
    opacity: 0.7,
  },
  texto: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: '700',
  },
});
