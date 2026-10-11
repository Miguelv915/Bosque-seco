import { useTranslation } from 'react-i18next';
import { esText } from '../../../lib/esText';
import styles from './OfferBlocks.module.css';

/** Actividades con tarifa, prestador, duración y capacidad. */
export default function ActivityList({ activities, title }) {
  const { t } = useTranslation();
  if (!activities.length) return null;

  return (
    <section className={styles.block}>
      <h2 className={styles.heading}>{title ?? t('associations.activities')}</h2>
      <ul className={styles.cards}>
        {activities.map((activity) => {
          const details = [
            activity.duration_minutes != null &&
              t('associations.minutes', { count: activity.duration_minutes }),
            activity.max_capacity != null &&
              t('associations.maxPeople', { count: activity.max_capacity }),
            activity.providers?.name &&
              t('associations.withProvider', { name: activity.providers.name }),
          ].filter(Boolean);

          return (
            <li key={activity.id} className={styles.card}>
              <h3>{esText(activity, 'name')}</h3>
              {activity.description_es && <p>{esText(activity, 'description')}</p>}
              {activity.price != null && (
                <p className={styles.price}>
                  {activity.currency} {Number(activity.price).toFixed(2)}
                  {' · '}
                  {esText(activity, 'price_unit')}
                </p>
              )}
              {details.length > 0 && <p className={styles.meta}>{details.join(' · ')}</p>}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
