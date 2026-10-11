import { useTranslation } from 'react-i18next';
import { localized } from '../../../lib/localized';
import { whatsappLink } from '../../../lib/whatsapp';
import styles from './OfferBlocks.module.css';

/**
 * Guías de la asociación con un botón de WhatsApp por cada uno.
 * Solo los prestadores de tipo `guide` publican WhatsApp (nunca el líder).
 */
export default function GuideContact({ guides }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage;
  const reachable = guides.filter((g) => g.kind === 'guide' && whatsappLink(g.whatsapp));

  return (
    <section className={styles.block}>
      <h2 className={styles.heading}>{t('associations.guides')}</h2>
      {reachable.length === 0 ? (
        <p className={styles.notice}>{t('associations.noGuides')}</p>
      ) : (
        <>
          <p className={styles.notice}>{t('associations.guideNotice')}</p>
          <ul className={styles.cards}>
            {reachable.map((guide) => (
              <li key={guide.id} className={styles.card}>
                <h3>{guide.name}</h3>
                <p>{localized(guide, 'specialty', lang)}</p>
                <a
                  className={styles.whatsapp}
                  href={whatsappLink(guide.whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('associations.contactGuide').toUpperCase()}
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
