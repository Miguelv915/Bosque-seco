import { useTranslation } from 'react-i18next';
import { esText } from '../../../lib/esText';
import { whatsappLink } from '../../../lib/whatsapp';
import styles from './OfferBlocks.module.css';

function ContactCard({ provider, t }) {
  return (
    <li className={styles.card}>
      <h3>{provider.name}</h3>
      <p>{esText(provider, 'specialty')}</p>
      {provider.rate_text_es && <p className={styles.price}>{provider.rate_text_es}</p>}
      <a
        className={styles.whatsapp}
        href={whatsappLink(provider.whatsapp)}
        target="_blank"
        rel="noopener noreferrer"
      >
        {t('associations.contactGuide').toUpperCase()}
      </a>
    </li>
  );
}

/**
 * Contacto por WhatsApp de la oferta local: primero los guías (el guiado es
 * obligatorio) y luego alimentación, hospedaje y transporte. Se publica el
 * WhatsApp de cada servicio; el teléfono del líder nunca existe en el portal.
 */
export default function GuideContact({ guides: providers }) {
  const { t } = useTranslation();
  const reachable = providers.filter((p) => whatsappLink(p.whatsapp));
  const guides = reachable.filter((p) => p.kind === 'guide');
  const others = reachable.filter((p) => p.kind !== 'guide');

  return (
    <>
      <section className={styles.block}>
        <h2 className={styles.heading}>{t('associations.guides')}</h2>
        {guides.length === 0 ? (
          <p className={styles.notice}>{t('associations.noGuides')}</p>
        ) : (
          <>
            <p className={styles.notice}>{t('associations.guideNotice')}</p>
            <ul className={styles.cards}>
              {guides.map((guide) => (
                <ContactCard key={guide.id} provider={guide} t={t} />
              ))}
            </ul>
          </>
        )}
      </section>

      {others.length > 0 && (
        <section className={styles.block}>
          <h2 className={styles.heading}>{t('associations.otherServices')}</h2>
          <ul className={styles.cards}>
            {others.map((provider) => (
              <ContactCard key={provider.id} provider={provider} t={t} />
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
