import { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
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
import { FONT_SIZE, FONT_WEIGHT, ICON_SIZE, LAYOUT, RADIUS, SPACING } from '../../styles/tokens';
import { useReports } from '../../context/ReportsContext';
import {
  SUBCATEGORIAS_SEGURANCA,
  SUBCATEGORIAS_INSEGURANCA,
  rotuloSubcategoria,
} from '../../data';
import { ApiError } from '../../services/api';
import { obterEndereco } from '../../services/geocodingService';
import type {
  TipoCategoriaReporte,
  TipoSubcategoriaReporte,
} from '../../types/report';
import type { Coordenada } from '../../types/coordenada';
import type { MainStackParamList } from '../../navigation/MainStack';
import FloatingTextInput from '../../components/FloatingTextInput';
import PrimaryButton from '../../components/PrimaryButton';
import SeletorLocal from '../../components/SeletorLocal';
import { useTeclado } from '../../hooks/useTeclado';

type Nav = NativeStackNavigationProp<MainStackParamList, 'CriarReporte'>;

const LOCALIZACAO_PADRAO = {
  latitude: -23.62,
  longitude: -46.563,
} as const;

export default function CriarReporteScreen() {
  const navigation = useNavigation<Nav>();
  const { adicionarReporte } = useReports();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const { tecladoAberto } = useTeclado();
  const [campoFocado, setCampoFocado] = useState<'titulo' | 'descricao' | null>(null);

  const [tipoCategoria, setTipoCategoria] = useState<TipoCategoriaReporte>('Insegurança');
  const [tipoSubcategoria, setTipoSubcategoria] = useState<TipoSubcategoriaReporte>(
    SUBCATEGORIAS_INSEGURANCA[0],
  );
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [erros, setErros] = useState<{ titulo?: string; descricao?: string }>({});
  const [enviando, setEnviando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState<string | null>(null);
  const [localizacao, setLocalizacao] = useState<Coordenada>(LOCALIZACAO_PADRAO);
  const [seletorLocalAberto, setSeletorLocalAberto] = useState(false);
  const [endereco, setEndereco] = useState<string | null>(null);
  const [buscandoEndereco, setBuscandoEndereco] = useState(false);

  useEffect(() => {
    let ativo = true;

    async function buscarEndereco() {
      setBuscandoEndereco(true);
      try {
        const resultado = await obterEndereco(localizacao);
        if (ativo) setEndereco(resultado);
      } finally {
        if (ativo) setBuscandoEndereco(false);
      }
    }

    void buscarEndereco();

    return () => {
      ativo = false;
    };
  }, [localizacao]);

  useEffect(() => {
    if (!tecladoAberto) {
      setCampoFocado(null);
      return;
    }

    if (campoFocado) {
      const timer = setTimeout(() => {
        if (campoFocado === 'descricao') {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        } else if (campoFocado === 'titulo') {
          scrollViewRef.current?.scrollTo({ y: 240, animated: true });
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [tecladoAberto, campoFocado]);

  const subcategorias =
    tipoCategoria === 'Segurança' ? SUBCATEGORIAS_SEGURANCA : SUBCATEGORIAS_INSEGURANCA;

  function trocarCategoria(cat: TipoCategoriaReporte) {
    setTipoCategoria(cat);
    const subs = cat === 'Segurança' ? SUBCATEGORIAS_SEGURANCA : SUBCATEGORIAS_INSEGURANCA;
    setTipoSubcategoria(subs[0]);
  }

  function validar(): boolean {
    const novosErros: { titulo?: string; descricao?: string } = {};
    const tituloLimpo = titulo.trim();
    const descricaoLimpa = descricao.trim();

    if (tituloLimpo.length < 5 || tituloLimpo.length > 30) {
      novosErros.titulo = 'Título deve ter entre 5 e 30 caracteres.';
    }
    if (descricaoLimpa.length < 20 || descricaoLimpa.length > 500) {
      novosErros.descricao = 'Descrição deve ter entre 20 e 500 caracteres.';
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  async function handleSubmit() {
    if (!validar() || enviando) return;

    setEnviando(true);
    setErroEnvio(null);

    try {
      await adicionarReporte({
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        latitude: localizacao.latitude,
        longitude: localizacao.longitude,
        tipoCategoria,
        tipoSubcategoria,
      });
      navigation.goBack();
    } catch (erro) {
      setErroEnvio(
        erro instanceof ApiError
          ? erro.message
          : 'Não foi possível publicar a ocorrência. Tente novamente.',
      );
    } finally {
      setEnviando(false);
    }
  }

  const rotuloLocalizacao = buscandoEndereco
    ? 'Buscando endereço...'
    : endereco ?? 'Localização selecionada';

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: Math.max(insets.bottom, SPACING.lg),
        },
      ]}
    >
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={{ top: SPACING.md, bottom: SPACING.md, left: SPACING.md, right: SPACING.md }}
          style={styles.botaoVoltar}
        >
          <MaterialCommunityIcons name="arrow-left" size={ICON_SIZE.lg} color={COLORS.textDark} />
        </Pressable>
        <Text style={styles.tituloHeader}>Nova Ocorrência</Text>
        <View style={styles.espacador} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior="padding"
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.secao, styles.primeiraSecao]}>Categoria</Text>
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
                  {rotuloSubcategoria(sub)}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.campoTitulo}>
            <FloatingTextInput
              label="Título da ocorrência"
              value={titulo}
              onChangeText={setTitulo}
              maxLength={30}
              error={erros.titulo}
              onClearError={() => {
                setErros((e) => ({ ...e, titulo: undefined }));
                if (erroEnvio) setErroEnvio(null);
              }}
              onFocus={() => setCampoFocado('titulo')}
            />
          </View>

          <Text style={styles.label}>Descrição detalhada do ocorrido</Text>
          <TextInput
            value={descricao}
            onChangeText={(t) => {
              setDescricao(t);
              if (erros.descricao) setErros((e) => ({ ...e, descricao: undefined }));
              if (erroEnvio) setErroEnvio(null);
            }}
            onFocus={() => setCampoFocado('descricao')}
            multiline
            numberOfLines={4}
            maxLength={500}
            placeholder="Descreva o que aconteceu..."
            placeholderTextColor={COLORS.textLight}
            style={[styles.textArea, erros.descricao && styles.textAreaErro]}
          />
          {erros.descricao ? <Text style={styles.erroTexto}>{erros.descricao}</Text> : null}

          <Pressable
            onPress={() => setSeletorLocalAberto(true)}
            accessibilityRole="button"
            accessibilityLabel="Alterar localização da ocorrência"
            style={styles.localizacaoCard}
          >
            <MaterialCommunityIcons name="map-marker-outline" size={ICON_SIZE.md} color={COLORS.primary} />
            <View style={styles.localizacaoInfo}>
              <Text style={styles.localizacaoTitulo}>{rotuloLocalizacao}</Text>
              <Text style={styles.localizacaoTexto}>
                Toque para escolher no mapa
              </Text>
            </View>
            <View style={styles.localizacaoAcao}>
              <Text style={styles.localizacaoAcaoTexto}>Alterar</Text>
              <MaterialCommunityIcons name="chevron-right" size={ICON_SIZE.md} color={COLORS.secondary} />
            </View>
          </Pressable>

          {erroEnvio ? <Text style={styles.erroEnvio}>{erroEnvio}</Text> : null}

          <PrimaryButton
            title="Publicar Ocorrência"
            onPress={() => {
              void handleSubmit();
            }}
            loading={enviando}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <SeletorLocal
        visivel={seletorLocalAberto}
        localInicial={localizacao}
        onConfirmar={(coordenada) => {
          setLocalizacao(coordenada);
          setSeletorLocalAberto(false);
        }}
        onFechar={() => setSeletorLocalAberto(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    paddingHorizontal: LAYOUT.headerPaddingX,
    paddingVertical: LAYOUT.headerPaddingY,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  botaoVoltar: {
    width: LAYOUT.iconButton,
    alignItems: 'center',
  },
  espacador: {
    width: LAYOUT.iconButton,
  },
  tituloHeader: {
    fontSize: FONT_SIZE.title,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textDark,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: LAYOUT.screenPaddingX,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xxl,
  },
  primeiraSecao: {
    marginTop: SPACING.none,
  },
  secao: {
    fontSize: FONT_SIZE.body,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textDark,
    marginBottom: SPACING.sm,
    marginTop: SPACING.lg,
  },
  categoriaRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  categoriaBotao: {
    flex: 1,
    paddingVertical: LAYOUT.buttonPaddingY,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  categoriaInativo: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoriaTexto: {
    fontSize: FONT_SIZE.bodyLg,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textDark,
  },
  categoriaTextoAtivo: {
    color: COLORS.surface,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  campoTitulo: {
    marginTop: SPACING.lg,
  },
  chip: {
    paddingHorizontal: LAYOUT.chipPaddingX,
    paddingVertical: LAYOUT.chipPaddingY,
    borderRadius: RADIUS.lg,
  },
  chipInativo: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipTexto: {
    fontSize: FONT_SIZE.label,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textDark,
  },
  chipTextoAtivo: {
    color: COLORS.surface,
  },
  erroEnvio: {
    color: COLORS.danger,
    fontSize: FONT_SIZE.label,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZE.body,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textDark,
    marginBottom: SPACING.sm,
    marginTop: SPACING.lg,
  },
  textArea: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    padding: LAYOUT.fieldPadding,
    fontSize: FONT_SIZE.bodyLg,
    color: COLORS.textDark,
    minHeight: LAYOUT.textAreaMinHeight,
    textAlignVertical: 'top',
  },
  textAreaErro: {
    borderColor: COLORS.danger,
  },
  erroTexto: {
    color: COLORS.danger,
    fontSize: FONT_SIZE.caption,
    marginTop: SPACING.xs,
    marginLeft: SPACING.xs,
  },
  localizacaoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: LAYOUT.infoGap,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: LAYOUT.cardPaddingCompact,
    marginTop: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  localizacaoInfo: {
    flex: 1,
    gap: SPACING.hairline,
  },
  localizacaoTitulo: {
    fontSize: FONT_SIZE.body,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textDark,
  },
  localizacaoTexto: {
    fontSize: FONT_SIZE.label,
    color: COLORS.textLight,
  },
  localizacaoAcao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.hairline,
  },
  localizacaoAcaoTexto: {
    fontSize: FONT_SIZE.label,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.secondary,
  },
});
