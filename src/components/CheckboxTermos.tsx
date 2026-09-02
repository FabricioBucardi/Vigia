import { Pressable, StyleSheet, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../styles/colors';

type CheckboxTermosProps = {
  aceito: boolean;
  onChange: () => void;
};

export default function CheckboxTermos({ aceito, onChange }: CheckboxTermosProps) {
  return (
    <Pressable
      style={styles.termos}
      onPress={onChange}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: aceito }}
    >
      <MaterialCommunityIcons
        name={aceito ? 'checkbox-marked' : 'checkbox-blank-outline'}
        size={20}
        color={aceito ? COLORS.primary : COLORS.textLight}
      />
      <Text style={styles.termosTexto}>
        Li e aceito os Termos de Uso e a Política de Privacidade.
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  termos: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  termosTexto: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textDark,
  },
});