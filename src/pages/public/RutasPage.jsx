import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Download, MapPinned, MessageCircle } from 'lucide-react';
import PageHero from '../../components/shared/PageHero';
import ContactButton from '../../components/shared/ContactButton';
import DestinationExplorer from '../../features/destinations/components/DestinationExplorer';
import { DESTINATIONS } from '../../features/destinations/data/destinations';
import heroImage from '../../assets/images/hero-senderismo.png';
import styles from './ListingPage.module.css';

const STEPS = [
  { key: 'choose', Icon: MapPinned },
  { key: 'contact', Icon: MessageCircle },
  { key: 'app', Icon: Download },
];

export default function RutasPage() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const index = DESTINATIONS.findIndex((d) => d.id === params.get('destino'));
  const start = index >= 0 ? index : null;

  return (
    <>
      <PageHero
        image={heroImage}
        imageAlt={t('hero.imageAlt')}
        eyebrow={t('routes.eyebrow')}
        title={t('routes.title')}
        lead={t('routes.lead')}
      />

      <DestinationExplorer key={start ?? 'tour'} showHeader={false} start={start} />

      <section className={styles.section} aria-labelledby="rutas-pasos">
        <h2 id="rutas-pasos" className={styles.heading}>
          {t('routes.stepsTitle')}
        </h2>
        <ol className={styles.steps}>
          {STEPS.map(({ key, Icon }, i) => (
            <li key={key} className={styles.step}>
              <span className={styles.stepIcon} aria-hidden="true">
                <Icon size={22} />
              </span>
              <p className={styles.stepNumber}>{String(i + 1).padStart(2, '0')}</p>
              <h3 className={styles.stepTitle}>{t(`routes.steps.${key}.title`)}</h3>
              <p className={styles.stepText}>{t(`routes.steps.${key}.text`)}</p>
            </li>
          ))}
        </ol>
        <div className={styles.stepsCta}>
          <ContactButton message={t('routes.whatsappMessage')} size="lg" />
        </div>
      </section>
    </>
  );
}
