import { useTranslation } from 'react-i18next';
import { buttonClass } from '../../../components/shared/buttonClass';
import styles from './VisitSection.module.css';

// URL de contacto configurable por entorno (p. ej. https://wa.me/519XXXXXXXX).
const WHATSAPP_URL = import.meta.env.VITE_WHATSAPP_URL || '#';

const SEASONS = [
  { key: 'green', className: styles.green },
  { key: 'dry', className: styles.dry },
];

export default function VisitSection() {
  const { t } = useTranslation();

  return (
    <section id="visita" className={styles.section} aria-labelledby="visit-title">
      <p className={styles.eyebrow}>{t('visit.eyebrow')}</p>
      <h2 id="visit-title" className={styles.title}>
        {t('visit.titleA')}
        <br />
        <span className={styles.muted}>{t('visit.titleB')}</span>
      </h2>

      <div className={styles.seasons}>
        {SEASONS.map(({ key, className }) => (
          <article key={key} className={`${styles.season} ${className}`}>
            <p className={styles.range}>{t(`visit.${key}.range`).toUpperCase()}</p>
            <h3 className={styles.seasonTitle}>{t(`visit.${key}.title`)}</h3>
            <p className={styles.seasonText}>{t(`visit.${key}.text`)}</p>
          </article>
        ))}
      </div>

      <div className={styles.cta}>
        <h3 className={styles.ctaTitle}>{t('visit.ctaTitle')}</h3>
        <a href={WHATSAPP_URL} className={buttonClass('primary', { size: 'lg' })} target="_blank" rel="noopener noreferrer">
          {t('visit.whatsapp')}
        </a>
      </div>
    </section>
  );
}
