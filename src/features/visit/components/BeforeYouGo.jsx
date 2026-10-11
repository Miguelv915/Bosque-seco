import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Backpack, Car, SignalZero, Wallet } from 'lucide-react';
import SectionHeader from '../../../components/shared/SectionHeader';
import ContactButton from '../../../components/shared/ContactButton';
import styles from './BeforeYouGo.module.css';

const TIPS = [
  { key: 'arrive', Icon: Car },
  { key: 'signal', Icon: SignalZero, link: { to: '/#app', labelKey: 'beforeYouGo.signal.link' } },
  { key: 'payments', Icon: Wallet },
];

// Elementos de la lista «Qué llevar» (textos en `beforeYouGo.pack.items.<id>`).
const PACK = ['water', 'sun', 'clothes', 'shoes', 'repellent', 'trash'];

/** Información práctica para el turista antes de viajar, con contacto por WhatsApp. */
export default function BeforeYouGo() {
  const { t } = useTranslation();

  return (
    <section id="antes-de-ir" className={styles.section} aria-labelledby="before-title">
      <SectionHeader
        id="before-title"
        eyebrow={t('beforeYouGo.eyebrow')}
        titleA={t('beforeYouGo.titleA')}
        titleB={t('beforeYouGo.titleB')}
        lead={t('beforeYouGo.lead')}
      />

      <div className={styles.grid}>
        {TIPS.map(({ key, Icon, link }) => (
          <article key={key} className={styles.card}>
            <span className={styles.icon} aria-hidden="true">
              <Icon size={22} />
            </span>
            <h3 className={styles.cardTitle}>{t(`beforeYouGo.${key}.title`)}</h3>
            <p className={styles.cardText}>{t(`beforeYouGo.${key}.text`)}</p>
            {link && (
              <Link to={link.to} className={styles.cardLink}>
                {t(link.labelKey)} →
              </Link>
            )}
          </article>
        ))}

        <article className={`${styles.card} ${styles.pack}`}>
          <span className={styles.icon} aria-hidden="true">
            <Backpack size={22} />
          </span>
          <h3 className={styles.cardTitle}>{t('beforeYouGo.pack.title')}</h3>
          <ul className={styles.packList}>
            {PACK.map((item) => (
              <li key={item}>{t(`beforeYouGo.pack.items.${item}`)}</li>
            ))}
          </ul>
        </article>
      </div>

      <div className={styles.cta}>
        <div>
          <h3 className={styles.ctaTitle}>{t('beforeYouGo.ctaTitle')}</h3>
          <p className={styles.ctaText}>{t('beforeYouGo.ctaText')}</p>
        </div>
        <ContactButton message={t('beforeYouGo.whatsappMessage')} size="lg" />
      </div>
    </section>
  );
}
