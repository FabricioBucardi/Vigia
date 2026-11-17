import bairrosGeoJSON from '../data/bairrosGeoJSON.json';

export type GeometriaGeoJSON =
  | { type: 'Polygon'; coordinates: number[][][] }
  | { type: 'MultiPolygon'; coordinates: number[][][][] };

export type BairroOSM = {
  nome: string;
  osmId: number;
  latitude: number;
  longitude: number;
  boundingbox: [number, number, number, number];
  geojson: GeometriaGeoJSON | null;
};

export const bairrosOSM: BairroOSM[] = bairrosGeoJSON as BairroOSM[];

export function bairroPorNome(nome: string): BairroOSM | null {
  return bairrosOSM.find((bairro) => bairro.nome === nome) ?? null;
}
