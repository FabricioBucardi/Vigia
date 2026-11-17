import { useCallback, useEffect, useRef, type RefObject } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../styles/colors';
import { useReports } from '../../context/ReportsContext';
import { useAuth } from '../../context/AuthContext';
import type { FiltroTipoReporte } from '../../context/ReportsContext.type';
import type { Reporte } from '../../types/report';
import scsGeoJSON from '../../data/saoCaetanoGeoJSON.json';
import ReportDetailCard from '../../components/ReportDetailCard';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../../navigation/MainStack';

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
      bounds: scsBounds,
      maxZoom: 18
    }).addTo(map);

    var coords = scsFeature.geometry.type === 'MultiPolygon'
      ? scsFeature.geometry.coordinates[0][0]
      : scsFeature.geometry.coordinates[0];

    var invertedGeoJson = {
      "type": "Feature",
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [[-180, -90], [180, -90], [180, 90], [-180, 90], [-180, -90]],
          coords
        ]
      }
    };

    L.geoJSON(invertedGeoJson, {
      style: {
        fillColor: '#e5e7ea',
        fillOpacity: 1.0,
        stroke: false,
        interactive: false
      }
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

    function sendToHost(data) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify(data));
      } else if (window.parent !== window) {
        window.parent.postMessage(data, '*');
      }
    }

    window.renderMarkers = function(reportsData) {
      markersLayer.clearLayers();
      if (!reportsData || !reportsData.length) return;
      reportsData.forEach(function(rep) {
        var isSeguranca = rep.tipoCategoria === 'Seguran\u00e7a';
        var cor = isSeguranca ? '#0ab732' : '#f33311';
        var iconHtml = '<div style="background-color:' + cor + '; width:26px; height:26px; border-radius:50%; border:3px solid #ffffff; box-shadow:0 2px 5px rgba(0,0,0,0.4); display:flex; align-items:center; justify-content:center;"><div style="background-color:#ffffff; width:6px; height:6px; border-radius:50%;"></div></div>';
        var customIcon = L.divIcon({
          className: 'custom-pin',
          html: iconHtml,
          iconSize: [26, 26],
          iconAnchor: [13, 13]
        });
        var m = L.marker([rep.latitude, rep.longitude], { icon: customIcon });
        m.on('click', function() {
          sendToHost({
            type: 'MARKER_CLICK',
            payload: { idReporte: rep.idReporte }
          });
        });
        markersLayer.addLayer(m);
      });
    };

    window.addEventListener('message', function(event) {
      var data = event.data;
      if (data && data.type === 'RENDER_MARKERS') {
        window.renderMarkers(data.payload);
      }
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
  payload?: { idReporte?: number };
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

  const injetarMarcadores = useCallback((lista: Reporte[]) => {
    if (Platform.OS === 'web') {
      iframeRef.current?.contentWindow?.postMessage(
        { type: 'RENDER_MARKERS', payload: lista },
        '*',
      );
      return;
    }
    webViewRef.current?.injectJavaScript(
      'window.renderMarkers(' + JSON.stringify(lista) + '); true;',
    );
  }, []);

  useEffect(() => {
    injetarMarcadores(filteredReports);
  }, [filteredReports, injetarMarcadores]);

  const processarMensagem = useCallback(
    (dados: MensagemMapa) => {
      if (dados?.type === 'MARKER_CLICK' && dados.payload?.idReporte) {
        const encontrado = reports.find(
          (r) => r.idReporte === dados.payload?.idReporte,
        );
        if (encontrado) setSelectedReport(encontrado);
      } else if (dados?.type === 'MAP_CLICK') {
        setSelectedReport(null);
      }
    },
    [reports, setSelectedReport],
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
          onLoad={() => injetarMarcadores(filteredReports)}
        />
      ) : (
        <WebView
          ref={webViewRef}
          source={{ html: LEAFLET_HTML }}
          style={styles.map}
          javaScriptEnabled
          domStorageEnabled
          originWhitelist={['*']}
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

      {(isLoading || erro) && (
        <Pressable
          style={[styles.aviso, { top: insets.top + 56 }]}
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
              size={18}
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
          style={[styles.fab, { bottom: insets.bottom + 16 }]}
          onPress={() => navigation.navigate('CriarReporte')}
        >
          <MaterialCommunityIcons name="plus" size={28} color={COLORS.surface} />
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
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    gap: 8,
    zIndex: 10,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  chipInativo: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
  },
  chipTexto: {
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextoAtivo: {
    color: COLORS.surface,
  },
  chipTextoInativo: {
    color: COLORS.textDark,
  },
  aviso: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    zIndex: 9,
  },
  avisoTexto: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textDark,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    zIndex: 20,
  },
});
