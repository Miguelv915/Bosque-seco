import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAsync } from '../../../lib/useAsync';
import { listPendingRequests } from '../../../services/changeRequests.service';
import { features } from '../../../config/features';
import AdminAnalytics from './AdminAnalytics';
import AdminReview from './AdminReview';
import SectionNav from './SectionNav';
import styles from '../admin.module.css';

const SECTIONS = features.approvals ? ['review', 'analytics'] : ['analytics'];

/** Backoffice del administrador: revisión de solicitudes y análisis. */
export default function AdminPanel() {
  const { t } = useTranslation();
  const [section, setSection] = useState(SECTIONS[0]);
  const pending = useAsync(features.approvals ? listPendingRequests : async () => []);

  return (
    <>
      <h1 className={styles.title}>{t('admin.dashboard')}</h1>
      <div className={styles.panelLayout}>
        <SectionNav
          sections={SECTIONS}
          current={section}
          onChange={setSection}
          badge={{ section: 'review', count: pending.data?.length ?? 0 }}
        />
        <div className={styles.panelContent}>
          {section === 'review' && <AdminReview requests={pending} />}
          {section === 'analytics' && <AdminAnalytics />}
        </div>
      </div>
    </>
  );
}
