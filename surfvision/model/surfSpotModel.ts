import { supabase } from '../src/components/ui/lib/supabaseClient';

export interface SurfSpot {
  id: number;
  name: string;
  wave_height: number;
  video_url: string;
}

export const getAllSurfSpots = async (): Promise<SurfSpot[] | null> => {
  const { data, error } = await supabase.from('surf_spots').select('*');
  if (error) {
    console.error('Erro ao buscar surf spots:', error);
    return null;
  }
  return data;
};

export const createSurfSpot = async (surfSpot: Omit<SurfSpot, 'id'>) => {
  const { data, error } = await supabase.from('surf_spots').insert([surfSpot]);
  if (error) {
    console.error('Erro ao criar surf spot:', error);
    return null;
  }
  return data;
};

export const updateSurfSpot = async (id: number, surfSpot: Partial<SurfSpot>) => {
  const { data, error } = await supabase.from('surf_spots').update(surfSpot).eq('id', id);
  if (error) {
    console.error('Erro ao atualizar surf spot:', error);
    return null;
  }
  return data;
};

export const deleteSurfSpot = async (id: number) => {
  const { data, error } = await supabase.from('surf_spots').delete().eq('id', id);
  if (error) {
    console.error('Erro ao deletar surf spot:', error);
    return null;
  }
  return data;
};
