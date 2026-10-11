import { useTranslation } from 'react-i18next';
import { useAuth } from '../../features/auth/useAuth';
import LeaderPanel from '../../features/admin/components/LeaderPanel';
import AdminPanel from '../../features/admin/components/AdminPanel';

export default function DashboardPage() {
  const { t } = useTranslation();
  const { profile } = useAuth();

  if (profile.role === 'admin') return <AdminPanel />;
  if (profile.role === 'leader') return <LeaderPanel associationId={profile.association_id} />;
  return <p>{t('admin.guideNotice')}</p>;
}
