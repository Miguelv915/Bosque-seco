import { useTranslation } from 'react-i18next';
import { useAuth } from '../../features/auth/useAuth';
import LeaderPanel from '../../features/admin/components/LeaderPanel';
import AdminReview from '../../features/admin/components/AdminReview';

export default function DashboardPage() {
  const { t } = useTranslation();
  const { profile } = useAuth();

  if (profile.role === 'admin') return <AdminReview />;
  if (profile.role === 'leader') return <LeaderPanel associationId={profile.association_id} />;
  return <p>{t('admin.guideNotice')}</p>;
}
