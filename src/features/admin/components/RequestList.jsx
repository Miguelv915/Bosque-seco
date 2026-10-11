import { useTranslation } from 'react-i18next';
import PayloadView from './PayloadView';
import styles from '../admin.module.css';

/** Historial de solicitudes de una asociación (vista del líder). */
export default function RequestList({ requests }) {
  const { t } = useTranslation();

  return (
    <section className={styles.card}>
      <h2 className={styles.cardTitle}>{t('admin.requests.title')}</h2>
      {requests.length === 0 ? (
        <p className={styles.hint}>{t('admin.requests.empty')}</p>
      ) : (
        <ul className={styles.requests}>
          {requests.map((request) => (
            <li key={request.id} className={styles.request}>
              <span className={styles.badge} data-status={request.status}>
                {t(`admin.requests.status.${request.status}`).toUpperCase()}
              </span>
              <strong>
                {t(`admin.requests.action.${request.action}`)} ·{' '}
                {t(`admin.requests.entity.${request.entity_type}`)}
              </strong>
              <PayloadView request={request} />
              {request.review_note && (
                <p className={styles.hint}>
                  {t('admin.requests.note')}: {request.review_note}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
