import type { GeometriaGeoJSON } from '../services/bairroService';

function pontoNoAnel(
  latitude: number,
  longitude: number,
  anel: number[][],
): boolean {
  let dentro = false;

  for (let i = 0, j = anel.length - 1; i < anel.length; j = i++) {
    const [xi, yi] = anel[i];
    const [xj, yj] = anel[j];
    const cruza =
      yi > latitude !== yj > latitude &&
      longitude < ((xj - xi) * (latitude - yi)) / (yj - yi) + xi;
    if (cruza) dentro = !dentro;
  }

  return dentro;
}

export function pontoDentroDaGeometria(
  latitude: number,
  longitude: number,
  geometria: GeometriaGeoJSON | null,
): boolean {
  if (!geometria) return false;

  if (geometria.type === 'Polygon') {
    const [anel, ...buracos] = geometria.coordinates;
    if (!pontoNoAnel(latitude, longitude, anel)) return false;
    return !buracos.some((buraco) => pontoNoAnel(latitude, longitude, buraco));
  }

  return geometria.coordinates.some((poligono) => {
    const [anel, ...buracos] = poligono;
    return (
      pontoNoAnel(latitude, longitude, anel) &&
      !buracos.some((buraco) => pontoNoAnel(latitude, longitude, buraco))
    );
  });
}
