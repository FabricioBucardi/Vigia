import { useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../styles/colors';
import { useReports } from '../../context/ReportsContext';
import { useAuth } from '../../context/AuthContext';
import {
  SUBCATEGORIAS_SEGURANCA,
  SUBCATEGORIAS_INSEGURANCA,
} from '../../data';
import type { AvaliacaoGravidade, TipoCategoriaReporte } from '../../types/report';
import type { MainStackParamList } from '../../navigation/MainStack';
import FloatingTextInput from '../../components/FloatingTextInput';
import PrimaryButton from '../../components/PrimaryButton';

type Nav = NativeStackNavigationProp<MainStackParamList, 'CriarReporte'>;

export default function CriarReporteScreen() {
  const navigation = useNavigation<Nav>();
  const { adicionarReporte } = useReports();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const [tecladoAltura, setTecladoAltura] = useState(0);
  const [campoFocado, setCampoFocado] = useState<'titulo' | 'descricao' | null>(null);

  const [tipoCategoria, setTipoCategoria] = useState<TipoCategoriaReporte>('Insegurança');
  const [tipoSubcategoria, setTipoSubcategoria] = useState<string>(
    SUBCATEGORIAS_INSEGURANCA[0],
  );
  const [avaliacaoGravidade, setAvaliacaoGravidade] = useState<AvaliacaoGravidade>(3);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [erros, setErros] = useState<{ titulo?: string; descricao?: string }>({});

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setTecladoAltura(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setTecladoAltura(0);
      setCampoFocado(null);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    if (tecladoAltura > 0 && campoFocado) {
      const timer = setTimeout(() => {
        if (campoFocado === 'descricao') {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        } else if (campoFocado === 'titulo') {
          scrollViewRef.current?.scrollTo({ y: 240, animated: true });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [tecladoAltura, campoFocado]);

  const subcategorias =
    tipoCategoria === 'Segurança' ? SUBCATEGORIAS_SEGURANCA : SUBCATEGORIAS_INSEGURANCA;

  const rotuloEstrelas =
    tipoCategoria === 'Segurança' ? 'Nível de Proteção' : 'Nível de Gravidade';

  function trocarCategoria(cat: TipoCategoriaReporte) {
    setTipoCategoria(cat);
    const subs = cat === 'Segurança' ? SUBCATEGORIAS_SEGURANCA : SUBCATEGORIAS_INSEGURANCA;
    setTipoSubcategoria(subs[0]);
    setAvaliacaoGravidade(3);
  }

  function validar(): boolean {
    const novosErros: { titulo?: string; descricao?: string } = {};
    if (!titulo.trim()) novosErros.titulo = 'Título é obrigatório';
    if (!descricao.trim()) novosErros.descricao = 'Descrição é obrigatória';
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  function handleSubmit() {
    if (!validar()) return;

    adicionarReporte({
      idUsuario: user?.idUsuario ?? 101,
      autorNome: user?.nome ?? 'Cidadão',
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      latitude: -23.6182 + (Math.random() - 0.5) * 0.01,
      longitude: -46.5645 + (Math.random() - 0.5) * 0.01,
      endereco: 'Centro, São Caetano do Sul - SP',
      tipoCategoria,
      tipoSubcategoria: tipoSubcategoria as any,
      avaliacaoGravidade,
      bairroNome: 'Centro',
    });

    navigation.goBack();
  }

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: tecladoAltura > 0 ? tecladoAltura : Math.max(insets.bottom, 16),
        },
      ]}
    >
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.botaoVoltar}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.textDark} />
        </Pressable>
        <Text style={styles.tituloHeader}>Nova Ocorrência</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
          <Text style={styles.secao}>Categoria</Text>
          <View style={styles.categoriaRow}>
            <Pressable
              onPress={() => trocarCategoria('Segurança')}
              style={[
                styles.categoriaBotao,
                tipoCategoria === 'Segurança'
                  ? { backgroundColor: COLORS.success }
                  : styles.categoriaInativo,
              ]}
            >
              <Text
                style={[
                  styles.categoriaTexto,
                  tipoCategoria === 'Segurança' && styles.categoriaTextoAtivo,
                ]}
              >
                Segurança
              </Text>
            </Pressable>
            <Pressable
              onPress={() => trocarCategoria('Insegurança')}
              style={[
                styles.categoriaBotao,
                tipoCategoria === 'Insegurança'
                  ? { backgroundColor: COLORS.danger }
                  : styles.categoriaInativo,
              ]}
            >
              <Text
                style={[
                  styles.categoriaTexto,
                  tipoCategoria === 'Insegurança' && styles.categoriaTextoAtivo,
                ]}
              >
                Insegurança
              </Text>
            </Pressable>
          </View>

          <Text style={styles.secao}>Subcategoria</Text>
          <View style={styles.chipsContainer}>
            {subcategorias.map((sub) => (
              <Pressable
                key={sub}
                onPress={() => setTipoSubcategoria(sub)}
                style={[
                  styles.chip,
                  tipoSubcategoria === sub
                    ? {
                        backgroundColor:
                          tipoCategoria === 'Segurança' ? COLORS.success : COLORS.danger,
                      }
                    : styles.chipInativo,
                ]}
              >
                <Text
                  style={[
                    styles.chipTexto,
                    tipoSubcategoria === sub && styles.chipTextoAtivo,
                  ]}
                >
                  {sub}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.secao}>{rotuloEstrelas}</Text>
          <View style={styles.estrelasRow}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Pressable key={i} onPress={() => setAvaliacaoGravidade(i as AvaliacaoGravidade)}>
                <MaterialCommunityIcons
                  name={i <= avaliacaoGravidade ? 'star' : 'star-outline'}
                  size={32}
                  color={
                    i <= avaliacaoGravidade
                      ? tipoCategoria === 'Segurança'
                        ? COLORS.success
                        : COLORS.danger
                      : COLORS.border
                  }
                />
              </Pressable>
            ))}
          </View>

          <FloatingTextInput
            label="Título da ocorrência"
            value={titulo}
            onChangeText={setTitulo}
            error={erros.titulo}
            onClearError={() => setErros((e) => ({ ...e, titulo: undefined }))}
            onFocus={() => setCampoFocado('titulo')}
          />

          <Text style={styles.label}>Descrição detalhada do ocorrido</Text>
          <TextInput
            value={descricao}
            onChangeText={(t) => {
              setDescricao(t);
              if (erros.descricao) setErros((e) => ({ ...e, descricao: undefined }));
            }}
            onFocus={() => setCampoFocado('descricao')}
            multiline
            numberOfLines={4}
            placeholder="Descreva o que aconteceu..."
            placeholderTextColor={COLORS.textLight}
            style={[styles.textArea, erros.descricao && styles.textAreaErro]}
          />
          {erros.descricao ? <Text style={styles.erroTexto}>{erros.descricao}</Text> : null}

          <View style={styles.localizacaoCard}>
            <MaterialCommunityIcons name="map-marker-outline" size={20} color={COLORS.primary} />
            <Text style={styles.localizacaoTexto}>Centro, São Caetano do Sul - SP</Text>
          </View>

          <PrimaryButton title="Publicar Ocorrência" onPress={handleSubmit} />
        </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  botaoVoltar: {
    width: 40,
    alignItems: 'center',
  },
  tituloHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 32,
  },
  secao: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 8,
    marginTop: 16,
  },
  categoriaRow: {
    flexDirection: 'row',
    gap: 12,
  },
  categoriaBotao: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  categoriaInativo: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoriaTexto: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  categoriaTextoAtivo: {
    color: COLORS.surface,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  chipInativo: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipTexto: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  chipTextoAtivo: {
    color: COLORS.surface,
  },
  estrelasRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 8,
    marginTop: 16,
  },
  textArea: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    padding: 14,
    fontSize: 15,
    color: COLORS.textDark,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  textAreaErro: {
    borderColor: COLORS.danger,
  },
  erroTexto: {
    color: COLORS.danger,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  localizacaoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 14,
    marginTop: 20,
    marginBottom: 20,
  },
  localizacaoTexto: {
    fontSize: 14,
    color: COLORS.textDark,
  },
});
