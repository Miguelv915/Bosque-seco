import { useTranslation } from 'react-i18next';
import SectionHeader from '../../../components/shared/SectionHeader';
import styles from './VisitSection.module.css';

const SEASONS = [
  { key: 'green', className: styles.green },
  { key: 'dry', className: styles.dry },
];

export default function VisitSection() {
  const { t } = useTranslation();

  return (
    <section id="visita" className={styles.section} aria-labelledby="visit-title">
      <SectionHeader
        id="visit-title"
        eyebrow={t('visit.eyebrow')}
        titleA={t('visit.titleA')}
        titleB={t('visit.titleB')}
      />

      <div className={styles.seasons}>
        {SEASONS.map(({ key, className }) => (
          <article key={key} className={`${styles.season} ${className}`}>
            <p className={styles.range}>{t(`visit.${key}.range`)}</p>
            <h3 className={styles.seasonTitle}>{t(`visit.${key}.title`)}</h3>
            <p className={styles.seasonText}>{t(`visit.${key}.text`)}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
