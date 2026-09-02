import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { COLORS } from '../styles/colors';

export type RequisitosSenha = {
  minimo8: boolean;
  maiuscula: boolean;
  minuscula: boolean;
  numero: boolean;
  especial: boolean;
};

export function checarRequisitosSenha(senha: string): RequisitosSenha {
  return {
    minimo8: senha.length >= 8,
    maiuscula: /[A-Z]/.test(senha),
    minuscula: /[a-z]/.test(senha),
    numero: /\d/.test(senha),
    especial: /[^A-Za-z0-9]/.test(senha),
  };
}

type RegraSenha = { chave: keyof RequisitosSenha; rotulo: string };

export const REGRAS_SENHA: RegraSenha[] = [
  { chave: 'minimo8', rotulo: 'Mínimo de 8 caracteres' },
  { chave: 'maiuscula', rotulo: 'Pelo menos 1 letra maiúscula' },
  { chave: 'minuscula', rotulo: 'Pelo menos 1 letra minúscula' },
  { chave: 'numero', rotulo: 'Pelo menos 1 número' },
  { chave: 'especial', rotulo: 'Pelo menos 1 caractere especial' },
];

type RequisitoSenhaProps = {
  texto: string;
  atendida: boolean;
};

export default function RequisitoSenha({ texto, atendida }: RequisitoSenhaProps) {
  const progresso = useSharedValue(atendida ? 1 : 0);

  useEffect(() => {
    progresso.value = withTiming(atendida ? 1 : 0, {
      duration: 300,
      easing: Easing.out(Easing.cubic),
    });
  }, [atendida, progresso]);

  const estiloBolinha = useAnimatedStyle(() => ({
    opacity: 1 - progresso.value,
    transform: [{ scale: 1 - progresso.value * 0.25 }],
  }));
  const estiloCheck = useAnimatedStyle(() => ({
    opacity: progresso.value,
    transform: [{ scale: 0.4 + progresso.value * 0.6 }],
  }));
  const estiloTexto = useAnimatedStyle(() => ({
    color: interpolateColor(
      progresso.value,
      [0, 1],
      [COLORS.textLight, COLORS.success]
    ),
  }));

  return (
    <View style={styles.regra}>
      <View style={styles.icone}>
        <Animated.View style={[StyleSheet.absoluteFill, estiloBolinha]}>
          <MaterialCommunityIcons
            name="circle-outline"
            size={18}
            color={COLORS.textLight}
          />
        </Animated.View>
        <Animated.View style={[StyleSheet.absoluteFill, estiloCheck]}>
          <MaterialCommunityIcons
            name="check-circle"
            size={18}
            color={COLORS.success}
          />
        </Animated.View>
      </View>
      <Animated.Text style={[styles.regraTexto, estiloTexto]}>{texto}</Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  regra: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icone: {
    width: 18,
    height: 18,
  },
  regraTexto: {
    fontSize: 13,
    fontWeight: '500',
  },
});