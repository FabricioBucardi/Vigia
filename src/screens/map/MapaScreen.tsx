import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../styles/colors';
import { FONT_SIZE, FONT_WEIGHT, ICON_SIZE, LAYOUT, RADIUS, SHADOWS, SPACING } from '../../styles/tokens';
import { useReports } from '../../context/ReportsContext';
import { useAuth } from '../../context/AuthContext';
import type { FiltroTipoReporte } from '../../context/ReportsContext.type';
import type { Reporte } from '../../types/report';
import scsGeoJSON from '../../data/saoCaetanoGeoJSON.json';
import ReportDetailCard from '../../components/ReportDetailCard';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../../navigation/MainStack';
import { bairrosOSM, type BairroOSM } from '../../services/bairroService';
import { bairros } from '../../data';
import CartaoBairro from '../../components/CartaoBairro';
import { contarPorCategoria, obterBairroPorNome } from '../../utils/bairroUtils';
import { pontoDentroDaGeometria } from '../../utils/geoUtils';

type Nav = NativeStackNavigationProp<MainStackParamList, 'Tabs'>;

const FILTROS: { chave: FiltroTipoReporte; cor: string; label: string }[] = [
  { chave: 'Todos', cor: COLORS.primary, label: 'Todos' },
  { chave: 'Segurança', cor: COLORS.success, label: 'Segurança' },
  { chave: 'Insegurança', cor: COLORS.danger, label: 'Insegurança' },
];

const LEAFLET_HTML = `
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
    .bairro-label.leaflet-tooltip {
      background: #ffffff;
      color: #0a2369;
      border: none;
      box-shadow: none;
      font: 600 10px sans-serif;
      padding: 1px 5px;
      border-radius: 8px;
      white-space: nowrap;
    }
    .bairro-label.leaflet-tooltip:before { display: none; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    var map = L.map('map', {
      zoomControl: false,
      minZoom: 13,
      maxZoom: 18,
      preferCanvas: true
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

    var markersLayer = L.layerGroup().addTo(map);
    var bairrosLayer = L.layerGroup().addTo(map);
    var camadaBairro = null;
    var bairrosCache = [];
    var reportesCache = [];
    var DISTANCIA_AGRUPAMENTO = 100;
    var DISTANCIA_REPORTES = 36;

    function centroDoGrupo(itens) {
      var lat = 0;
      var lon = 0;
      itens.forEach(function(b) { lat += b.latitude; lon += b.longitude; });
      return [lat / itens.length, lon / itens.length];
    }

    function adicionarCirculo(camada, centro, raio, raioToque, estilo, aoClicar) {
      if (raioToque > raio) {
        var area = L.circleMarker(centro, {
          radius: raioToque,
          stroke: false,
          fill: true,
          fillColor: '#ffffff',
          fillOpacity: 0.001,
          bubblingMouseEvents: false
        });
        area.on('click', aoClicar);
        camada.addLayer(area);
      }
      var visivel = L.circleMarker(centro, estilo);
      visivel.on('click', aoClicar);
      camada.addLayer(visivel);
      return visivel;
    }

    function agruparBairros() {
      var grupos = [];
      bairrosCache.forEach(function(b) {
        var ponto = map.latLngToLayerPoint([b.latitude, b.longitude]);
        var alvo = null;
        for (var i = 0; i < grupos.length; i++) {
          var centro = map.latLngToLayerPoint(centroDoGrupo(grupos[i].itens));
          if (centro.distanceTo(ponto) < DISTANCIA_AGRUPAMENTO) {
            alvo = grupos[i];
            break;
          }
        }
        if (alvo) alvo.itens.push(b);
        else grupos.push({ itens: [b] });
      });
      return grupos;
    }

    function atualizarMarcadoresBairros() {
      bairrosLayer.clearLayers();
      var ampliado = map.getZoom() >= 15;
      agruparBairros().forEach(function(grupo) {
        var quantidade = grupo.itens.length;
        var centro = centroDoGrupo(grupo.itens);
        var raio = quantidade > 1 ? (ampliado ? 15 : 13) : (ampliado ? 10 : 8);
        var aoClicar;
        var etiqueta = null;
        if (quantidade > 1) {
          etiqueta = quantidade + ' bairros';
          aoClicar = function() {
            var limites = L.latLngBounds(grupo.itens.map(function(b) {
              return [b.latitude, b.longitude];
            }));
            map.flyToBounds(limites.pad(0.2), { duration: 0.8, maxZoom: 16 });
          };
        } else {
          var bairro = grupo.itens[0];
          etiqueta = ampliado ? bairro.nome : null;
          aoClicar = function() {
            sendToHost({ type: 'BAIRRO_CLICK', payload: { osmId: bairro.osmId } });
          };
        }
        var marcador = adicionarCirculo(bairrosLayer, centro, raio, raio + 8, {
          radius: raio,
          color: '#ffffff',
          weight: ampliado ? 3 : 2,
          fillColor: '#0a2369',
          fillOpacity: 1,
          bubblingMouseEvents: false
        }, aoClicar);
        if (etiqueta) {
          marcador.bindTooltip(etiqueta, {
            permanent: true,
            direction: 'top',
            offset: [0, -6],
            className: 'bairro-label'
          });
        }
      });
    }

    window.renderBairros = function(lista) {
      bairrosCache = lista || [];
      atualizarMarcadoresBairros();
    };

    map.on('zoomend', function() {
      atualizarMarcadoresBairros();
      atualizarMarcadoresReportes();
    });

    window.focarBairro = function(bairro) {
      if (camadaBairro) map.removeLayer(camadaBairro);
      camadaBairro = L.geoJSON(bairro.geojson, {
        style: {
          color: '#f33311',
          weight: 3,
          dashArray: '6, 6',
          fillColor: '#f33311',
          fillOpacity: 0.08,
          interactive: false
        }
      }).addTo(map);
      var caixa = bairro.boundingbox;
      var limites = L.latLngBounds([caixa[0], caixa[2]], [caixa[1], caixa[3]]);
      map.flyToBounds(limites, { padding: [24, 24], duration: 0.8, maxZoom: 16 });
    };

    window.limparBairro = function() {
      if (camadaBairro) {
        map.removeLayer(camadaBairro);
        camadaBairro = null;
      }
      map.flyToBounds(scsBounds, { padding: [20, 20], duration: 0.8 });
    };

    window.receberComando = function(comando) {
      if (!comando) return;
      if (comando.type === 'RENDER_MARKERS') window.renderMarkers(comando.payload);
      else if (comando.type === 'RENDER_BAIRROS') window.renderBairros(comando.payload);
      else if (comando.type === 'FOCAR_BAIRRO') window.focarBairro(comando.payload);
      else if (comando.type === 'LIMPAR_BAIRRO') window.limparBairro();
    };

    function sendToHost(data) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify(data));
      } else if (window.parent !== window) {
        window.parent.postMessage(data, '*');
      }
    }

    function agruparReportes() {
      var grupos = [];
      reportesCache.forEach(function(rep) {
        var ponto = map.latLngToLayerPoint([rep.latitude, rep.longitude]);
        var alvo = null;
        for (var i = 0; i < grupos.length; i++) {
          var centro = map.latLngToLayerPoint(centroDoGrupo(grupos[i].itens));
          if (centro.distanceTo(ponto) < DISTANCIA_REPORTES) {
            alvo = grupos[i];
            break;
          }
        }
        if (alvo) alvo.itens.push(rep);
        else grupos.push({ itens: [rep] });
      });
      return grupos;
    }

    function corGrupoReportes(itens) {
      var seguranca = 0;
      var inseguranca = 0;
      itens.forEach(function(rep) {
        if (rep.tipoCategoria === 'Seguran\u00e7a') seguranca++;
        else inseguranca++;
      });
      if (seguranca > 0 && inseguranca > 0) return '#0a2369';
      return inseguranca > 0 ? '#f33311' : '#0ab732';
    }

    function atualizarMarcadoresReportes() {
      markersLayer.clearLayers();
      var ampliado = map.getZoom() >= 15;
      agruparReportes().forEach(function(grupo) {
        var quantidade = grupo.itens.length;
        var centro = centroDoGrupo(grupo.itens);
        var raio = quantidade > 1 ? (ampliado ? 15 : 12) : (ampliado ? 11 : 8);
        var aoClicar;
        var etiqueta = null;
        if (quantidade > 1) {
          etiqueta = quantidade + ' reportes';
          aoClicar = function() {
            var limites = L.latLngBounds(grupo.itens.map(function(rep) {
              return [rep.latitude, rep.longitude];
            }));
            map.flyToBounds(limites.pad(0.3), { duration: 0.8, maxZoom: 17 });
          };
        } else {
          var reporte = grupo.itens[0];
          aoClicar = function() {
            map.flyTo(
              [reporte.latitude, reporte.longitude],
              Math.max(map.getZoom(), 16),
              { duration: 0.8 }
            );
            sendToHost({
              type: 'MARKER_CLICK',
              payload: { idReporte: reporte.idReporte }
            });
          };
        }
        var marcador = adicionarCirculo(markersLayer, centro, raio, raio + 8, {
          radius: raio,
          color: '#ffffff',
          weight: ampliado ? 3 : 2,
          fillColor: corGrupoReportes(grupo.itens),
          fillOpacity: 1,
          bubblingMouseEvents: false
        }, aoClicar);
        if (etiqueta) {
          marcador.bindTooltip(etiqueta, {
            permanent: true,
            direction: 'top',
            offset: [0, -6],
            className: 'bairro-label'
          });
        }
      });
    }

    window.renderMarkers = function(reportsData) {
      reportesCache = reportsData || [];
      atualizarMarcadoresReportes();
    };

    window.addEventListener('message', function(event) {
      window.receberComando(event.data);
    });

    map.on('click', function(e) {
      sendToHost({ type: 'MAP_CLICK' });
    });
  </script>
</body>
</html>
`;

function MapaWeb({
  iframeRef,
  onLoad,
}: {
  iframeRef: RefObject<HTMLIFrameElement | null>;
  onLoad: () => void;
}) {
  return (
    <iframe
      ref={iframeRef}
      title="Mapa Vigia"
      srcDoc={LEAFLET_HTML}
      onLoad={onLoad}
      style={{ border: 'none', width: '100%', height: '100%', flex: 1 }}
    />
  );
}

type MensagemMapa = {
  type?: string;
  payload?: { idReporte?: number; osmId?: number };
};

export default function MapaScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const {
    filteredReports,
    reports,
    filtroAtivo,
    setFiltroAtivo,
    selectedReport,
    setSelectedReport,
    isLoading,
    erro,
    recarregarReportes,
  } = useReports();

  const webViewRef = useRef<WebView>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [bairroAtivo, setBairroAtivo] = useState<BairroOSM | null>(null);

  const enviarComando = useCallback((tipo: string, payload: unknown) => {
    const comando = { type: tipo, payload };
    if (Platform.OS === 'web') {
      iframeRef.current?.contentWindow?.postMessage(comando, '*');
      return;
    }
    webViewRef.current?.injectJavaScript(
      'window.receberComando(' + JSON.stringify(comando) + '); true;',
    );
  }, []);

  const abrirBairro = useCallback(
    (bairro: BairroOSM) => {
      setSelectedReport(null);
      setBairroAtivo(bairro);
      enviarComando('FOCAR_BAIRRO', bairro);
    },
    [enviarComando, setSelectedReport],
  );

  const fecharBairro = useCallback(() => {
    setSelectedReport(null);
    setBairroAtivo(null);
    enviarComando('LIMPAR_BAIRRO', null);
  }, [enviarComando, setSelectedReport]);

  const marcadoresVisiveis = useMemo(() => {
    const geometria = bairroAtivo?.geojson;
    if (!geometria) return filteredReports;
    return filteredReports.filter((reporte) =>
      pontoDentroDaGeometria(
        reporte.latitude,
        reporte.longitude,
        geometria,
      ),
    );
  }, [filteredReports, bairroAtivo]);

  const { seguranca, inseguranca } = useMemo(
    () => contarPorCategoria(marcadoresVisiveis),
    [marcadoresVisiveis],
  );

  const nota = useMemo(
    () =>
      bairroAtivo
        ? obterBairroPorNome(bairroAtivo.nome, bairros)?.classificacaoSeguranca ??
          null
        : null,
    [bairroAtivo],
  );

  const injetarMarcadores = useCallback(
    (lista: Reporte[]) => enviarComando('RENDER_MARKERS', lista),
    [enviarComando],
  );

  useEffect(() => {
    injetarMarcadores(marcadoresVisiveis);
  }, [marcadoresVisiveis, injetarMarcadores]);

  useEffect(() => {
    enviarComando('RENDER_BAIRROS', bairroAtivo ? [] : bairrosOSM);
  }, [bairroAtivo, enviarComando]);

  const handleMapaLoad = useCallback(() => {
    injetarMarcadores(marcadoresVisiveis);
    enviarComando('RENDER_BAIRROS', bairroAtivo ? [] : bairrosOSM);
    if (bairroAtivo) enviarComando('FOCAR_BAIRRO', bairroAtivo);
  }, [injetarMarcadores, marcadoresVisiveis, bairroAtivo, enviarComando]);

  const processarMensagem = useCallback(
    (dados: MensagemMapa) => {
      if (dados?.type === 'MARKER_CLICK' && dados.payload?.idReporte) {
        const encontrado = reports.find(
          (r) => r.idReporte === dados.payload?.idReporte,
        );
        if (encontrado) setSelectedReport(encontrado);
      } else if (dados?.type === 'BAIRRO_CLICK' && dados.payload?.osmId) {
        const bairro = bairrosOSM.find(
          (item) => item.osmId === dados.payload?.osmId,
        );
        if (bairro) abrirBairro(bairro);
      } else if (dados?.type === 'MAP_CLICK') {
        setSelectedReport(null);
      }
    },
    [reports, setSelectedReport, abrirBairro],
  );

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
    if (Platform.OS !== 'web') return;
    const handler = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow) return;
      processarMensagem(event.data as MensagemMapa);
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [processarMensagem]);

  return (
    <View style={styles.container}>
      {Platform.OS === 'web' ? (
        <MapaWeb
          iframeRef={iframeRef}
          onLoad={handleMapaLoad}
        />
      ) : (
        <WebView
          ref={webViewRef}
          source={{ html: LEAFLET_HTML }}
          style={styles.map}
          javaScriptEnabled
          domStorageEnabled
          originWhitelist={['*']}
          onLoad={handleMapaLoad}
          onMessage={handleMessage}
        />
      )}

      <View style={[styles.filtrosContainer, { top: insets.top + 12 }]}>
        {FILTROS.map((f) => {
          const ativo = filtroAtivo === f.chave;
          return (
            <Pressable
              key={f.chave}
              onPress={() => setFiltroAtivo(f.chave)}
              style={[
                styles.chip,
                ativo
                  ? { backgroundColor: f.cor, borderColor: f.cor }
                  : styles.chipInativo,
              ]}
            >
              <Text
                style={[
                  styles.chipTexto,
                  ativo
                    ? styles.chipTextoAtivo
                    : styles.chipTextoInativo,
                ]}
              >
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <CartaoBairro
        bairro={bairroAtivo}
        nota={nota}
        seguranca={seguranca}
        inseguranca={inseguranca}
        onFechar={fecharBairro}
      />

      {(isLoading || erro) && (
        <Pressable
          style={[styles.aviso, { top: insets.top + LAYOUT.overlayTopOffset }]}
          onPress={() => {
            if (erro && !isLoading) void recarregarReportes();
          }}
          disabled={isLoading || !erro}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <MaterialCommunityIcons
              name="alert-circle-outline"
              size={ICON_SIZE.sm}
              color={COLORS.danger}
            />
          )}
          <Text style={styles.avisoTexto}>
            {isLoading
              ? 'Carregando reportes...'
              : `${erro} Toque para tentar novamente.`}
          </Text>
        </Pressable>
      )}

      <ReportDetailCard
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
      />

      {!selectedReport && (
        <Pressable
          style={[styles.fab, { bottom: insets.bottom + SPACING.lg }]}
          onPress={() => navigation.navigate('CriarReporte')}
          accessibilityRole="button"
          accessibilityLabel="Criar reporte"
        >
          <MaterialCommunityIcons name="plus" size={ICON_SIZE.xl} color={COLORS.surface} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  filtrosContainer: {
    position: 'absolute',
    top: SPACING.lg,
    left: SPACING.lg,
    right: SPACING.lg,
    flexDirection: 'row',
    gap: SPACING.sm,
    zIndex: 10,
  },
  chip: {
    paddingHorizontal: LAYOUT.chipPaddingX,
    paddingVertical: LAYOUT.chipPaddingY,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    ...SHADOWS.mdStrong,
  },
  chipInativo: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
  },
  chipTexto: {
    fontSize: FONT_SIZE.label,
    fontWeight: FONT_WEIGHT.semibold,
  },
  chipTextoAtivo: {
    color: COLORS.surface,
  },
  chipTextoInativo: {
    color: COLORS.textDark,
  },
  aviso: {
    position: 'absolute',
    left: SPACING.lg,
    right: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: LAYOUT.bannerPaddingY,
    ...SHADOWS.md,
    zIndex: 9,
  },
  avisoTexto: {
    flex: 1,
    fontSize: FONT_SIZE.label,
    color: COLORS.textDark,
  },
  fab: {
    position: 'absolute',
    bottom: SPACING.xxl,
    right: SPACING.xl,
    width: LAYOUT.fab,
    height: LAYOUT.fab,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.fab,
    zIndex: 20,
  },
});
