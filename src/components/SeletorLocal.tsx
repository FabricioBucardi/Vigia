import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { COLORS } from '../styles/colors';
import {
  buscarEnderecos,
  TAMANHO_MINIMO_BUSCA,
  type SugestaoEndereco,
} from '../services/geocodingService';
import { FONT_SIZE, FONT_WEIGHT, ICON_SIZE, LAYOUT, RADIUS, SHADOWS, SPACING } from '../styles/tokens';
import scsGeoJSON from '../data/saoCaetanoGeoJSON.json';
import type { Coordenada } from '../types/coordenada';
import PrimaryButton from './PrimaryButton';

type SeletorLocalProps = {
  visivel: boolean;
  localInicial: Coordenada;
  onConfirmar: (coordenada: Coordenada) => void;
  onFechar: () => void;
};

type MensagemMapa = {
  type?: string;
  payload?: { latitude?: number; longitude?: number };
};

function montarHtml(latitude: number, longitude: number): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body { margin: 0; padding: 0; height: 100%; width: 100%; }
    #map { height: 100%; width: 100%; }
    .leaflet-control-attribution { display: none !important; }
    .leaflet-control-zoom { display: none !important; }
    .custom-pin { background: transparent; border: none; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    var map = L.map('map', {
      zoomControl: false,
      minZoom: 13,
      maxZoom: 18
    }).setView([-23.6200, -46.5630], 13.6);

    var rawGeoData = ${JSON.stringify(scsGeoJSON)};
    var scsFeature = rawGeoData.features ? rawGeoData.features[0] : rawGeoData;

    var tempLayer = L.geoJSON(scsFeature);
    var scsBounds = tempLayer.getBounds();

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18
    }).addTo(map);

    L.geoJSON(scsFeature, {
      style: {
        color: '#0a2369',
        weight: 2.5,
        dashArray: '4, 6',
        fillOpacity: 0,
        interactive: false
      }
    }).addTo(map);

    map.fitBounds(scsBounds, { padding: [20, 20] });
    map.setMaxBounds(scsBounds.pad(0.05));

    var iconePonto = L.divIcon({
      className: 'custom-pin',
      html: '<div style="background-color:#0a2369; width:26px; height:26px; border-radius:50%; border:3px solid #ffffff; box-shadow:0 2px 6px rgba(0,0,0,0.4); display:flex; align-items:center; justify-content:center;"><div style="background-color:#ffffff; width:7px; height:7px; border-radius:50%;"></div></div>',
      iconSize: [26, 26],
      iconAnchor: [13, 13]
    });

    var marcador = L.marker([${latitude}, ${longitude}], {
      icon: iconePonto,
      draggable: false
    }).addTo(map);

    function sendToHost(data) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify(data));
      } else if (window.parent !== window) {
        window.parent.postMessage(data, '*');
      }
    }

    function aplicarPonto(lat, lng, centralizar) {
      marcador.setLatLng([lat, lng]);
      if (centralizar) {
        map.setView([lat, lng], Math.max(map.getZoom(), 15), { animate: true });
      }
    }

    function selecionarPonto(lat, lng, centralizar) {
      aplicarPonto(lat, lng, centralizar);
      sendToHost({
        type: 'PONTO_SELECIONADO',
        payload: { latitude: lat, longitude: lng }
      });
    }

    map.on('click', function(e) {
      selecionarPonto(e.latlng.lat, e.latlng.lng, false);
    });

    window.receberComando = function(msg) {
      if (!msg || msg.type !== 'SET_PONTO' || !msg.payload) return;
      aplicarPonto(
        msg.payload.latitude,
        msg.payload.longitude,
        msg.payload.centralizar !== false
      );
    };

    window.addEventListener('message', function(event) {
      window.receberComando(event.data);
    });
  </script>
</body>
</html>
`;
}

function MapaSelecao({
  iframeRef,
  html,
  onLoad,
}: {
  iframeRef: RefObject<HTMLIFrameElement | null>;
  html: string;
  onLoad: () => void;
}) {
  return (
    <iframe
      ref={iframeRef}
      title="Selecionar localização"
      srcDoc={html}
      onLoad={onLoad}
      style={{ border: 'none', width: '100%', height: '100%', flex: 1 }}
    />
  );
}

const TEMPO_LIMITE_GPS = 12000;
const TEMPO_LIMITE_CACHE = 2500;
const TEMPO_DEBOUNCE_BUSCA = 200;

class TempoLimiteGpsError extends Error {
  constructor() {
    super('TEMPO_LIMITE_GPS');
    this.name = 'TempoLimiteGpsError';
  }
}

function comLimiteDeTempo<T>(promessa: Promise<T>, milissegundos: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const temporizador = setTimeout(
      () => reject(new TempoLimiteGpsError()),
      milissegundos,
    );
    promessa.then(
      (valor) => {
        clearTimeout(temporizador);
        resolve(valor);
      },
      (erro) => {
        clearTimeout(temporizador);
        reject(erro);
      },
    );
  });
}

export default function SeletorLocal({
  visivel,
  localInicial,
  onConfirmar,
  onFechar,
}: SeletorLocalProps) {
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<WebView>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [ponto, setPonto] = useState<Coordenada>(localInicial);
  const [carregandoGps, setCarregandoGps] = useState(false);
  const [erroGps, setErroGps] = useState<string | null>(null);
  const [termoBusca, setTermoBusca] = useState('');
  const [consulta, setConsulta] = useState('');
  const [sugestoes, setSugestoes] = useState<SugestaoEndereco[]>([]);
  const [buscandoEndereco, setBuscandoEndereco] = useState(false);
  const [erroBusca, setErroBusca] = useState<string | null>(null);
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);

  const html = useMemo(
    () => montarHtml(localInicial.latitude, localInicial.longitude),
    [localInicial.latitude, localInicial.longitude],
  );

  useEffect(() => {
    if (visivel) {
      setPonto(localInicial);
      setErroGps(null);
      setTermoBusca('');
      setConsulta('');
      setSugestoes([]);
      setErroBusca(null);
      setMostrarSugestoes(false);
    }
  }, [visivel, localInicial]);

  useEffect(() => {
    if (!visivel) return;

    const termo = consulta.trim();
    if (termo.length < TAMANHO_MINIMO_BUSCA) {
      setSugestoes([]);
      setErroBusca(null);
      setBuscandoEndereco(false);
      return;
    }

    const controlador = new AbortController();
    setBuscandoEndereco(true);
    setErroBusca(null);
    setMostrarSugestoes(true);

    const temporizador = setTimeout(() => {
      buscarEnderecos(termo, controlador.signal)
        .then((resultados) => {
          if (controlador.signal.aborted) return;
          setSugestoes(resultados);
          setMostrarSugestoes(true);
        })
        .catch(() => {
          if (controlador.signal.aborted) return;
          setSugestoes([]);
          setErroBusca('Não foi possível buscar o endereço. Verifique sua conexão.');
        })
        .finally(() => {
          if (!controlador.signal.aborted) setBuscandoEndereco(false);
        });
    }, TEMPO_DEBOUNCE_BUSCA);

    return () => {
      clearTimeout(temporizador);
      controlador.abort();
    };
  }, [consulta, visivel]);

  const enviarComando = useCallback(
    (tipo: string, payload: unknown) => {
      if (Platform.OS === 'web') {
        iframeRef.current?.contentWindow?.postMessage({ type: tipo, payload }, '*');
        return;
      }
      webViewRef.current?.injectJavaScript(
        `window.receberComando(${JSON.stringify({ type: tipo, payload })}); true;`,
      );
    },
    [],
  );

  const centralizarNoPonto = useCallback(() => {
    enviarComando('SET_PONTO', { ...ponto, centralizar: true });
  }, [enviarComando, ponto]);

  const selecionarSugestao = useCallback(
    (sugestao: SugestaoEndereco) => {
      setPonto(sugestao.coordenada);
      enviarComando('SET_PONTO', { ...sugestao.coordenada, centralizar: true });
      setTermoBusca(sugestao.descricao);
      setConsulta('');
      setSugestoes([]);
      setErroBusca(null);
      setBuscandoEndereco(false);
      setMostrarSugestoes(false);
      Keyboard.dismiss();
    },
    [enviarComando],
  );

  const processarMensagem = useCallback((dados: MensagemMapa) => {
    if (dados?.type !== 'PONTO_SELECIONADO') return;
    const { latitude, longitude } = dados.payload ?? {};
    if (typeof latitude === 'number' && typeof longitude === 'number') {
      setPonto({ latitude, longitude });
      setErroGps(null);
      setTermoBusca('');
      setConsulta('');
      setMostrarSugestoes(false);
    }
  }, []);

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        processarMensagem(JSON.parse(event.nativeEvent.data));
      } catch {
        // Mensagem não é JSON válido, ignorar
      }
    },
    [processarMensagem],
  );

  useEffect(() => {
    if (Platform.OS !== 'web' || !visivel) return;
    const handler = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow) return;
      processarMensagem(event.data as MensagemMapa);
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [processarMensagem, visivel]);

  function aplicarPosicao(posicao: Location.LocationObject) {
    const coordenada: Coordenada = {
      latitude: posicao.coords.latitude,
      longitude: posicao.coords.longitude,
    };

    setPonto(coordenada);
    enviarComando('SET_PONTO', { ...coordenada, centralizar: true });
  }

  async function usarLocalizacaoAtual() {
    if (carregandoGps) return;
    setCarregandoGps(true);
    setErroGps(null);

    try {
      if (Platform.OS === 'web') {
        if (typeof navigator === 'undefined' || !navigator.geolocation) {
          setErroGps('Este navegador não oferece geolocalização. Toque no mapa para escolher.');
          return;
        }
        if (typeof window !== 'undefined' && !window.isSecureContext) {
          setErroGps(
            'No navegador, a localização exige HTTPS ou localhost. Use o celular ou toque no mapa.',
          );
          return;
        }
      } else {
        const { status, canAskAgain } =
          await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErroGps(
            canAskAgain
              ? 'Permissão de localização não concedida.'
              : 'Permissão negada. Libere a localização nas configurações do aparelho.',
          );
          return;
        }

        const servicosAtivos = await Location.hasServicesEnabledAsync();
        if (!servicosAtivos) {
          setErroGps('Ative o GPS/localização do aparelho e tente novamente.');
          return;
        }
      }

      const ultimaPosicao = await comLimiteDeTempo(
        Location.getLastKnownPositionAsync({ maxAge: 5 * 60 * 1000 }),
        TEMPO_LIMITE_CACHE,
      ).catch(() => null);

      if (ultimaPosicao) {
        aplicarPosicao(ultimaPosicao);
        return;
      }

      try {
        const posicao = await comLimiteDeTempo(
          Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          }),
          TEMPO_LIMITE_GPS,
        );
        aplicarPosicao(posicao);
      } catch (erroAtual) {
        const fallback = await Location.getLastKnownPositionAsync().catch(
          () => null,
        );
        if (fallback) {
          aplicarPosicao(fallback);
          return;
        }
        throw erroAtual;
      }
    } catch (erro) {
      setErroGps(
        erro instanceof TempoLimiteGpsError
          ? 'O GPS demorou para responder. Verifique se a localização está ativa ou toque no mapa.'
          : 'Não foi possível obter sua localização. Toque no mapa para escolher.',
      );
    } finally {
      setCarregandoGps(false);
    }
  }

  if (!visivel) return null;

  return (
    <Modal visible animationType="slide" onRequestClose={onFechar}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable
            onPress={onFechar}
            hitSlop={{ top: SPACING.md, bottom: SPACING.md, left: SPACING.md, right: SPACING.md }}
            style={styles.botaoFechar}
          >
            <MaterialCommunityIcons name="close" size={ICON_SIZE.lg} color={COLORS.textDark} />
          </Pressable>
          <Text style={styles.tituloHeader}>Selecionar localização</Text>
          <View style={styles.espacador} />
        </View>

        <View style={styles.buscaContainer}>
          <View style={styles.buscaLinha}>
            <MaterialCommunityIcons
              name="magnify"
              size={ICON_SIZE.md}
              color={COLORS.textLight}
            />
            <TextInput
              value={termoBusca}
              onChangeText={(texto) => {
                setTermoBusca(texto);
                setConsulta(texto);
                setMostrarSugestoes(true);
              }}
              onFocus={() => setMostrarSugestoes(true)}
              placeholder="Buscar rua ou endereço em São Caetano do Sul"
              placeholderTextColor={COLORS.textLight}
              returnKeyType="search"
              autoCorrect={false}
              accessibilityLabel="Buscar rua ou endereço em São Caetano do Sul"
              style={styles.buscaInput}
            />
            {buscandoEndereco ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : termoBusca.length > 0 ? (
              <Pressable
                onPress={() => {
                  setTermoBusca('');
                  setConsulta('');
                  setSugestoes([]);
                  setErroBusca(null);
                  setMostrarSugestoes(false);
                  Keyboard.dismiss();
                }}
                hitSlop={{
                  top: SPACING.sm,
                  bottom: SPACING.sm,
                  left: SPACING.sm,
                  right: SPACING.sm,
                }}
                accessibilityRole="button"
                accessibilityLabel="Limpar busca"
                style={styles.buscaLimpar}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={ICON_SIZE.md}
                  color={COLORS.textLight}
                />
              </Pressable>
            ) : null}
          </View>

          {mostrarSugestoes &&
          consulta.trim().length >= TAMANHO_MINIMO_BUSCA ? (
            <ScrollView
              style={styles.sugestoesContainer}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {erroBusca ? (
                <Text style={styles.sugestaoMensagem}>{erroBusca}</Text>
              ) : buscandoEndereco && sugestoes.length === 0 ? (
                <Text style={styles.sugestaoMensagem}>Buscando endereços...</Text>
              ) : !buscandoEndereco && sugestoes.length === 0 ? (
                <Text style={styles.sugestaoMensagem}>
                  Nenhum endereço encontrado em São Caetano do Sul.
                </Text>
              ) : (
                sugestoes.map((sugestao) => (
                  <Pressable
                    key={`${sugestao.coordenada.latitude},${sugestao.coordenada.longitude}`}
                    onPress={() => selecionarSugestao(sugestao)}
                    accessibilityRole="button"
                    accessibilityLabel={`Selecionar ${sugestao.descricao}`}
                    style={styles.sugestaoItem}
                  >
                    <MaterialCommunityIcons
                      name="map-marker-outline"
                      size={ICON_SIZE.md}
                      color={COLORS.primary}
                    />
                    <Text style={styles.sugestaoTexto} numberOfLines={2}>
                      {sugestao.descricao}
                    </Text>
                  </Pressable>
                ))
              )}
            </ScrollView>
          ) : null}
        </View>

        <View style={styles.mapaContainer}>
          {Platform.OS === 'web' ? (
            <MapaSelecao
              iframeRef={iframeRef}
              html={html}
              onLoad={centralizarNoPonto}
            />
          ) : (
            <WebView
              ref={webViewRef}
              source={{ html }}
              style={styles.mapa}
              javaScriptEnabled
              domStorageEnabled
              originWhitelist={['*']}
              onMessage={handleMessage}
              onLoadEnd={centralizarNoPonto}
            />
          )}

          <View style={styles.instrucao}>
            <Text style={styles.instrucaoTexto}>
              Toque no mapa para marcar o local
            </Text>
          </View>
        </View>

        <View style={[styles.rodape, { paddingBottom: Math.max(insets.bottom, SPACING.lg) }]}>
          <Pressable
            onPress={() => {
              void usarLocalizacaoAtual();
            }}
            disabled={carregandoGps}
            style={[styles.botaoGps, carregandoGps && styles.botaoGpsInativo]}
          >
            {carregandoGps ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <MaterialCommunityIcons
                name="crosshairs-gps"
                size={ICON_SIZE.md}
                color={COLORS.primary}
              />
            )}
            <Text style={styles.botaoGpsTexto}>Usar minha localização</Text>
          </Pressable>

          {erroGps ? <Text style={styles.erroGps}>{erroGps}</Text> : null}

          <PrimaryButton title="Confirmar local" onPress={() => onConfirmar(ponto)} />
        </View>
      </View>
    </Modal>
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
    paddingHorizontal: LAYOUT.headerPaddingX,
    paddingVertical: LAYOUT.headerPaddingY,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  botaoFechar: {
    width: LAYOUT.iconButton,
  },
  espacador: {
    width: LAYOUT.iconButton,
  },
  tituloHeader: {
    fontSize: FONT_SIZE.title,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textDark,
  },
  buscaContainer: {
    zIndex: 5,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  buscaLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    minHeight: LAYOUT.touchTarget,
  },
  buscaInput: {
    flex: 1,
    fontSize: FONT_SIZE.bodyLg,
    color: COLORS.textDark,
    paddingVertical: SPACING.sm,
  },
  buscaLimpar: {
    padding: SPACING.xs,
  },
  sugestoesContainer: {
    position: 'absolute',
    top: '100%',
    left: SPACING.lg,
    right: SPACING.lg,
    maxHeight: LAYOUT.sugestoesMaxHeight,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.md,
    overflow: 'hidden',
    zIndex: 10,
  },
  sugestaoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  sugestaoTexto: {
    flex: 1,
    fontSize: FONT_SIZE.body,
    color: COLORS.textDark,
  },
  sugestaoMensagem: {
    padding: SPACING.md,
    fontSize: FONT_SIZE.label,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  mapaContainer: {
    flex: 1,
  },
  mapa: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  instrucao: {
    position: 'absolute',
    top: SPACING.md,
    left: SPACING.lg,
    right: SPACING.lg,
    alignItems: 'center',
    pointerEvents: 'none',
  },
  instrucaoTexto: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    paddingHorizontal: LAYOUT.fieldPadding,
    paddingVertical: LAYOUT.chipPaddingY,
    fontSize: FONT_SIZE.label,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textDark,
    ...SHADOWS.sm,
    overflow: 'hidden',
  },
  rodape: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    gap: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  botaoGps: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    minHeight: LAYOUT.touchTarget,
  },
  botaoGpsInativo: {
    opacity: 0.6,
  },
  botaoGpsTexto: {
    fontSize: FONT_SIZE.bodyLg,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.primary,
  },
  erroGps: {
    color: COLORS.danger,
    fontSize: FONT_SIZE.label,
    textAlign: 'center',
  },
});
