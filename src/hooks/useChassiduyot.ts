import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Chassidut {
  id: string;
  name: string;
  created_at: string;
}

export function useChassiduyot() {
  const [chassiduyot, setChassiduyot] = useState<Chassidut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChassiduyot = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('chassiduyot')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setChassiduyot(data || []);
    } catch (err) {
      console.error('Error fetching chassiduyot:', err);
      setError('שגיאה בטעינת רשימת החסידויות');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChassiduyot();
  }, []);

  const addChassidut = async (name: string): Promise<Chassidut | null> => {
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('chassiduyot')
        .insert({ name: name.trim() })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          // Duplicate - fetch the existing one
          const { data: existing } = await supabase
            .from('chassiduyot')
            .select('*')
            .eq('name', name.trim())
            .single();
          if (existing) {
            return existing;
          }
        }
        throw error;
      }

      setChassiduyot((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      return data;
    } catch (err) {
      console.error('Error adding chassidut:', err);
      return null;
    }
  };

  const updateChassidut = async (id: string, name: string): Promise<boolean> => {
    if (!supabase) return false;

    try {
      const { error } = await supabase
        .from('chassiduyot')
        .update({ name: name.trim() })
        .eq('id', id);

      if (error) throw error;
      await fetchChassiduyot();
      return true;
    } catch (err) {
      console.error('Error updating chassidut:', err);
      return false;
    }
  };

  const deleteChassidut = async (id: string): Promise<boolean> => {
    if (!supabase) return false;

    try {
      const { error } = await supabase
        .from('chassiduyot')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setChassiduyot((prev) => prev.filter((c) => c.id !== id));
      return true;
    } catch (err) {
      console.error('Error deleting chassidut:', err);
      return false;
    }
  };

  return {
    chassiduyot,
    loading,
    error,
    addChassidut,
    updateChassidut,
    deleteChassidut,
    refetch: fetchChassiduyot
  };
}
