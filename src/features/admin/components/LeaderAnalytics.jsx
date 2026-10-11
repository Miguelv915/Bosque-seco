import { useTranslation } from 'react-i18next';
import { summarizeContent, summarizeRequests } from '../lib/analytics';
import { computeReadiness } from '../lib/readiness';
import ContentStats from './analytics/ContentStats';
import VisitsNotice from './analytics/VisitsNotice';
import styles from '../admin.module.css';

/** Análisis de la asociación del líder, con lo que ya cargó el panel. */
export default function LeaderAnalytics({ tree, requests }) {
  const { t } = useTranslation();
  const { requiredDone, requiredTotal } = computeReadiness(tree);

  return (
    <>
      <h2 className={styles.sectionTitle}>{t('admin.analytics.title')}</h2>
      <ContentStats
        content={summarizeContent(tree)}
        requests={summarizeRequests(requests)}
        readiness={{
          done: requiredDone,
          total: requiredTotal,
          percent: Math.round((requiredDone / requiredTotal) * 100),
        }}
      />
      <VisitsNotice />
    </>
  );
}
