// Defina a interface SurfSpot no início do arquivo
interface SurfSpot {
  id: number;
  name: string;
  wave_height: number;
  video_url: string;
}

// Importe as funções do model
import { createSurfSpot, deleteSurfSpot, getAllSurfSpots, updateSurfSpot } from '../model/surfSpotModel';

export const fetchSurfSpots = async () => {
  return await getAllSurfSpots();
};

export const addSurfSpot = async (spot: Omit<SurfSpot, 'id'>) => {
  return await createSurfSpot(spot);
};

export const editSurfSpot = async (id: number, spot: Partial<SurfSpot>) => {
  return await updateSurfSpot(id, spot);
};

export const removeSurfSpot = async (id: number) => {
  return await deleteSurfSpot(id);
};
