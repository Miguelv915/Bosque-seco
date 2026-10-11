import { useTranslation } from 'react-i18next';
import ImagePlaceholder from '../../../components/shared/ImagePlaceholder';
import { buttonClass } from '../../../components/shared/buttonClass';
import { OFFERS } from '../data/offers';
import styles from './CommunitySection.module.css';

export default function CommunitySection() {
  const { t } = useTranslation();

  return (
    <section id="comunidades" className={styles.section} aria-labelledby="community-title">
      <div className={styles.layout}>
        <div>
          <p className={styles.eyebrow}>{t('community.eyebrow')}</p>
          <h2 id="community-title" className={styles.title}>
            {t('community.title1')}
            <br />
            {t('community.title2')}
            <br />
            {t('community.title3')}
          </h2>
          <p className={styles.lead}>{t('community.lead')}</p>
          <div className={styles.photo}>
            <ImagePlaceholder label={t('community.photo')} />
          </div>
        </div>

        <div className={styles.offers}>
          <ol className={styles.list}>
            {OFFERS.map((offer, i) => (
              <li key={offer} className={styles.offer}>
                <span className={styles.number}>{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h3 className={styles.offerTitle}>{t(`offers.${offer}.title`)}</h3>
                  <p>{t(`offers.${offer}.text`)}</p>
                </div>
              </li>
            ))}
          </ol>
          <a href="#visita" className={`${buttonClass('dark', { size: 'lg' })} ${styles.cta}`}>
            {t('community.cta')}
          </a>
        </div>
      </div>
    </section>
  );
}
