import { useTranslation } from 'react-i18next';
import styles from '../../admin.module.css';

/** Aviso honesto: las visitas y visitantes los registra la app móvil. */
export default function VisitsNotice() {
  const { t } = useTranslation();
  return (
    <section className={styles.notice}>
      <h3 className={styles.cardTitle}>{t('admin.analytics.visitsTitle')}</h3>
      <p>{t('admin.analytics.visitsNotice')}</p>
    </section>
  );
}
