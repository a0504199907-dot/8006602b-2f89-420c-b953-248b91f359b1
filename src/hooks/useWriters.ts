import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Writer {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  created_at: string;
}

export function useWriters() {
  const [writers, setWriters] = useState<Writer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWriters = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('writers')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setWriters(data || []);
    } catch (err) {
      console.error('Error fetching writers:', err);
      setError('שגיאה בטעינת רשימת הכתבים');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWriters();
  }, []);

  const addWriter = async (name: string, phone?: string, email?: string): Promise<Writer | null> => {
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('writers')
        .insert({ name: name.trim(), phone: phone || null, email: email || null })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          // Duplicate - fetch the existing one
          const { data: existing } = await supabase
            .from('writers')
            .select('*')
            .eq('name', name.trim())
            .single();
          if (existing) {
            return existing;
          }
        }
        throw error;
      }

      setWriters((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      return data;
    } catch (err) {
      console.error('Error adding writer:', err);
      return null;
    }
  };

  const updateWriter = async (id: string, updates: Partial<Writer>): Promise<boolean> => {
    if (!supabase) return false;

    try {
      const { error } = await supabase
        .from('writers')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      await fetchWriters();
      return true;
    } catch (err) {
      console.error('Error updating writer:', err);
      return false;
    }
  };

  const deleteWriter = async (id: string): Promise<boolean> => {
    if (!supabase) return false;

    try {
      const { error } = await supabase
        .from('writers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setWriters((prev) => prev.filter((w) => w.id !== id));
      return true;
    } catch (err) {
      console.error('Error deleting writer:', err);
      return false;
    }
  };

  return {
    writers,
    loading,
    error,
    addWriter,
    updateWriter,
    deleteWriter,
    refetch: fetchWriters
  };
}
