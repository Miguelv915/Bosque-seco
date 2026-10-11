import { Navigate, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from './useAuth';

/**
 * Exige sesión iniciada. Esto es solo experiencia de usuario: la seguridad
 * real la imponen las políticas RLS de Supabase.
 */
export default function ProtectedRoute() {
  const { t } = useTranslation();
  const { session, profile, loading } = useAuth();

  if (loading) return <p>{t('common.loading')}</p>;
  if (!session) return <Navigate to="/admin/login" replace />;
  if (!profile) return <p>{t('admin.noProfile')}</p>;
  return <Outlet />;
}
