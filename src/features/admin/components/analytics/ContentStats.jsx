import { useTranslation } from 'react-i18next';
import { features } from '../../../../config/features';
import { splitDuration } from '../../lib/analytics';
import { BarList, Stat, StatGrid } from './Widgets';
import styles from '../../admin.module.css';

/** Cifras de lo publicado (`content`) y del estado de las solicitudes (`requests`). */
export default function ContentStats({ content, requests, readiness }) {
  const { t } = useTranslation();

  const response = splitDuration(requests.avgResponseHours);
  const kindRows = Object.entries(content.providersByKind).map(([kind, value]) => ({
    label: t(`admin.kind.${kind}`),
    value,
  }));
  const categoryRows = Object.entries(content.photosByCategory).map(([category, value]) => ({
    label: t(`admin.categories.${category}`),
    value,
  }));

  return (
    <>
      <StatGrid>
        {readiness && (
          <Stat
            label={t('admin.analytics.readiness')}
            value={`${readiness.percent}%`}
            hint={t('admin.readiness.progress', {
              done: readiness.done,
              total: readiness.total,
            })}
          />
        )}
        <Stat label={t('admin.analytics.spaces')} value={content.spaces} />
        <Stat label={t('admin.analytics.subspaces')} value={content.subspaces} />
        <Stat label={t('admin.analytics.providers')} value={content.providers} />
        <Stat label={t('admin.analytics.activities')} value={content.activities} />
        <Stat label={t('admin.analytics.photos')} value={content.photos} />
      </StatGrid>

      <div className={styles.twoCols}>
        <BarList
          title={t('admin.analytics.providersByKind')}
          rows={kindRows}
          empty={t('admin.analytics.noData')}
        />
        <BarList
          title={t('admin.analytics.photosByCategory')}
          rows={categoryRows}
          empty={t('admin.analytics.noData')}
        />
      </div>

      {features.approvals && (
        <section className={styles.card}>
          <h3 className={styles.cardTitle}>{t('admin.analytics.requests')}</h3>
          <StatGrid>
            <Stat label={t('admin.analytics.pending')} value={requests.pending} />
            <Stat label={t('admin.analytics.approved')} value={requests.approved} />
            <Stat label={t('admin.analytics.rejected')} value={requests.rejected} />
            <Stat
              label={t('admin.analytics.approvalRate')}
              value={
                requests.approvalRate == null ? '—' : `${Math.round(requests.approvalRate * 100)}%`
              }
            />
            <Stat
              label={t('admin.analytics.avgResponse')}
              value={response ? t(`admin.analytics.unit.${response.unit}`, { value: response.value }) : '—'}
            />
          </StatGrid>
        </section>
      )}
    </>
  );
}
