import { useCallback, useEffect, useRef } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../styles/colors';
import { useReports } from '../../context/ReportsContext';
import type { FiltroTipoReporte } from '../../context/ReportsContext.type';
import type { Reporte } from '../../types/report';
import scsGeoJSON from '../../data/saoCaetanoGeoJSON.json';

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

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);

    var rawGeoData = ${JSON.stringify(scsGeoJSON)};
    var scsFeature = rawGeoData.features ? rawGeoData.features[0] : rawGeoData;

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
        fillOpacity: 0.82,
        stroke: false,
        interactive: false
      }
    }).addTo(map);

    var borderLayer = L.geoJSON(scsFeature, {
      style: {
        color: '#0a2369',
        weight: 2.5,
        dashArray: '4, 6',
        fillOpacity: 0,
        interactive: false
      }
    }).addTo(map);

    var scsBounds = borderLayer.getBounds();
    map.fitBounds(scsBounds, { padding: [24, 24] });
    map.setMaxBounds(scsBounds.pad(0.1));

    var markersLayer = L.layerGroup().addTo(map);

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
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'MARKER_CLICK',
              payload: { idReporte: rep.idReporte }
            }));
          }
        });
        markersLayer.addLayer(m);
      });
    };
  </script>
</body>
</html>
`;

function WebFallback() {
  return (
    <SafeAreaView style={styles.webContainer}>
      <View style={styles.webCard}>
        <MaterialCommunityIcons
          name="map-outline"
          size={48}
          color={COLORS.primary}
        />
        <Text style={styles.webTitulo}>Visualização de Mapa</Text>
        <Text style={styles.webMensagem}>
          O mapa interativo está configurado via Leaflet + OpenStreetMap.
          Coordenadas padrão: São Caetano do Sul (-23.6182, -46.5645).
        </Text>
      </View>
    </SafeAreaView>
  );
}

export default function MapaScreen() {
  const {
    filteredReports,
    reports,
    filtroAtivo,
    setFiltroAtivo,
    setSelectedReport,
  } = useReports();

  const webViewRef = useRef<WebView>(null);

  const injetarMarcadores = useCallback(
    (lista: Reporte[]) => {
      webViewRef.current?.injectJavaScript(
        'window.renderMarkers(' + JSON.stringify(lista) + '); true;',
      );
    },
    [],
  );

  useEffect(() => {
    injetarMarcadores(filteredReports);
  }, [filteredReports, injetarMarcadores]);

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const dados = JSON.parse(event.nativeEvent.data);
        if (dados.type === 'MARKER_CLICK' && dados.payload?.idReporte) {
          const encontrado = reports.find(
            (r) => r.idReporte === dados.payload.idReporte,
          );
          if (encontrado) setSelectedReport(encontrado);
        }
      } catch {
        // Mensagem não é JSON válido, ignorar
      }
    },
    [reports, setSelectedReport],
  );

  if (Platform.OS === 'web') {
    return <WebFallback />;
  }

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: LEAFLET_HTML }}
        style={styles.map}
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={['*']}
        onMessage={handleMessage}
      />

      <View style={styles.filtrosContainer}>
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
  webContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  webCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 32,
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
  },
  webTitulo: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 16,
    marginBottom: 12,
  },
  webMensagem: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
});
