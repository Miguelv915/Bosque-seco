import { useTranslation } from 'react-i18next';
import { useAsync } from '../../../lib/useAsync';
import { listAssociationsForAnalytics } from '../../../services/associations.service';
import { listAllRequests } from '../../../services/changeRequests.service';
import { spacesByDepartment, summarizeContent, summarizeRequests } from '../lib/analytics';
import { computeReadiness } from '../lib/readiness';
import ContentStats from './analytics/ContentStats';
import VisitsNotice from './analytics/VisitsNotice';
import { BarList } from './analytics/Widgets';
import { DataTable } from './Registered';
import styles from '../admin.module.css';

const load = () => Promise.all([listAssociationsForAnalytics(), listAllRequests()]);

/** Análisis de todas las asociaciones (solo administrador). */
export default function AdminAnalytics() {
  const { t } = useTranslation();
  const { data, error, loading } = useAsync(load);

  if (loading) return <p>{t('common.loading')}</p>;
  if (error || !data) return <p className={styles.error}>{t('common.error')}</p>;

  const [associations, requests] = data;
  const total = summarizeContent({
    spaces: associations.flatMap((a) => a.spaces ?? []),
    providers: associations.flatMap((a) => a.providers ?? []),
    activities: associations.flatMap((a) => a.activities ?? []),
    payment_methods: associations.flatMap((a) => a.payment_methods ?? []),
    media: associations.flatMap((a) => a.media ?? []),
  });

  const pendingByAssociation = requests.reduce((acc, r) => {
    if (r.status === 'pending') acc[r.association_id] = (acc[r.association_id] ?? 0) + 1;
    return acc;
  }, {});

  const rows = associations.map((association) => {
    const { requiredDone, requiredTotal } = computeReadiness(association);
    return {
      id: association.id,
      name: association.name,
      percent: Math.round((requiredDone / requiredTotal) * 100),
      spaces: (association.spaces ?? []).length,
      providers: (association.providers ?? []).length,
      photos: (association.media ?? []).length,
      pending: pendingByAssociation[association.id] ?? 0,
    };
  });

  const departmentRows = Object.entries(spacesByDepartment(associations))
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({ label, value }));

  return (
    <>
      <h2 className={styles.sectionTitle}>{t('admin.analytics.title')}</h2>
      <ContentStats content={total} requests={summarizeRequests(requests)} />

      <BarList
        title={t('admin.analytics.byDepartment')}
        rows={departmentRows}
        empty={t('admin.analytics.noData')}
      />

      <section className={styles.card}>
        <h3 className={styles.cardTitle}>{t('admin.analytics.associations')}</h3>
        <DataTable
          rowKey={(row) => row.id}
          rows={rows}
          columns={[
            {
              key: 'name',
              label: t('admin.analytics.association'),
              render: (r) => <strong>{r.name}</strong>,
            },
            { key: 'percent', label: t('admin.analytics.readiness'), render: (r) => `${r.percent}%` },
            { key: 'spaces', label: t('admin.analytics.spaces'), render: (r) => r.spaces },
            { key: 'providers', label: t('admin.analytics.providers'), render: (r) => r.providers },
            { key: 'photos', label: t('admin.analytics.photos'), render: (r) => r.photos },
            { key: 'pending', label: t('admin.analytics.pending'), render: (r) => r.pending },
          ]}
        />
      </section>

      <VisitsNotice />
    </>
  );
}
