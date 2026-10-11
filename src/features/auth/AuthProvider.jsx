import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { AuthContext } from './authContext';

/** Sesión de Supabase + perfil (rol y asociación) del usuario autenticado. */
export default function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sesión: carga inicial y cambios posteriores.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (!data.session) setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      if (!next) {
        setProfile(null);
        setLoading(false);
      }
    });
    return () => data.subscription.unsubscribe();
  }, []);

  // Perfil: se consulta aparte para no hacer llamadas dentro del callback de auth.
  const userId = session?.user?.id;
  useEffect(() => {
    if (!userId) return undefined;
    let cancelled = false;
    supabase
      .from('profiles')
      .select('id, full_name, role, association_id')
      .eq('id', userId)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        setProfile(data);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const signIn = useCallback(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signOut = useCallback(() => supabase.auth.signOut(), []);

  const value = useMemo(
    () => ({ session, profile, loading, signIn, signOut }),
    [session, profile, loading, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
