import { StyleSheet } from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';

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

export default function FloatingLabel({ label, progress, cor }: FloatingLabelProps) {
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

const styles = StyleSheet.create({
  label: {
    position: 'absolute',
    left: 14,
    top: ALTURA_CAMPO / 2,
    fontWeight: '500',
    pointerEvents: 'none',
  },
});