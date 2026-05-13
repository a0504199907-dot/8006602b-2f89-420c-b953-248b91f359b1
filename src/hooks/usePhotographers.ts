import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Photographer {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  created_at: string;
}

export function usePhotographers() {
  const [photographers, setPhotographers] = useState<Photographer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPhotographers = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('photographers')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setPhotographers(data || []);
    } catch (err) {
      console.error('Error fetching photographers:', err);
      setError('שגיאה בטעינת רשימת הצלמים');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotographers();
  }, []);

  const addPhotographer = async (name: string, phone?: string, email?: string): Promise<Photographer | null> => {
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('photographers')
        .insert({ name: name.trim(), phone: phone || null, email: email || null })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          // Duplicate - fetch the existing one
          const { data: existing } = await supabase
            .from('photographers')
            .select('*')
            .eq('name', name.trim())
            .single();
          if (existing) {
            return existing;
          }
        }
        throw error;
      }

      setPhotographers((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      return data;
    } catch (err) {
      console.error('Error adding photographer:', err);
      return null;
    }
  };

  const updatePhotographer = async (id: string, updates: Partial<Photographer>): Promise<boolean> => {
    if (!supabase) return false;

    try {
      const { error } = await supabase
        .from('photographers')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      await fetchPhotographers();
      return true;
    } catch (err) {
      console.error('Error updating photographer:', err);
      return false;
    }
  };

  const deletePhotographer = async (id: string): Promise<boolean> => {
    if (!supabase) return false;

    try {
      const { error } = await supabase
        .from('photographers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setPhotographers((prev) => prev.filter((p) => p.id !== id));
      return true;
    } catch (err) {
      console.error('Error deleting photographer:', err);
      return false;
    }
  };

  return {
    photographers,
    loading,
    error,
    addPhotographer,
    updatePhotographer,
    deletePhotographer,
    refetch: fetchPhotographers
  };
}
