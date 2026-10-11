import { useTranslation } from 'react-i18next';
import { splitDuration } from '../../lib/analytics';
import { BarList, Stat, StatGrid } from './Widgets';
import styles from '../../admin.module.css';

/**
 * Visitas, rangos de edad, espacios visitados y tiempo de recorrido con datos de
 * ejemplo (`data`, de demoVisits). La app móvil los registrará; hasta que
 * sincronice se muestran marcados como ficticios.
 */
export default function VisitsDemo({ data }) {
  const { t, i18n } = useTranslation();
  const duration = splitDuration(data.avgMinutes / 60);

  const monthFormat = new Intl.DateTimeFormat(i18n.language, { month: 'short' });
  const monthRows = data.byMonth.map(({ month, value }) => {
    const [year, number] = month.split('-').map(Number);
    return { label: monthFormat.format(new Date(year, number - 1, 1)), value };
  });

  const spaceRows = [...data.bySpace].sort((a, b) => b.value - a.value).slice(0, 10);

  return (
    <section className={styles.demoBlock}>
      <header className={styles.demoHeader}>
        <h3 className={styles.cardTitle}>{t('admin.analytics.visitsTitle')}</h3>
        <span className={styles.demoBadge}>{t('admin.analytics.demoBadge')}</span>
      </header>
      <p className={styles.hint}>{t('admin.analytics.demoNotice')}</p>

      <StatGrid>
        <Stat label={t('admin.analytics.visits')} value={data.visits} />
        <Stat label={t('admin.analytics.visitors')} value={data.visitors} />
        <Stat
          label={t('admin.analytics.avgDuration')}
          value={t(`admin.analytics.unit.${duration.unit}`, { value: duration.value })}
        />
      </StatGrid>

      <div className={styles.twoCols}>
        <BarList
          title={t('admin.analytics.visitsByMonth')}
          rows={monthRows}
          empty={t('admin.analytics.noData')}
        />
        <BarList
          title={t('admin.analytics.visitorsByAge')}
          rows={data.byAge}
          empty={t('admin.analytics.noData')}
        />
      </div>

      <BarList
        title={t('admin.analytics.visitsBySpace')}
        rows={spaceRows}
        empty={t('admin.analytics.noData')}
      />
    </section>
  );
}
