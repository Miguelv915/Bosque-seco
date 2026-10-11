import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import { buttonClass } from '../../../components/shared/buttonClass';
import SectionHeader from '../../../components/shared/SectionHeader';
import { DESTINATIONS } from '../data/destinations';
import { useAutoTour } from '../hooks/useAutoTour';
import SchematicMap from './SchematicMap';
import DestinationCard from './DestinationCard';
import styles from './DestinationExplorer.module.css';

/** Mapa + ficha. `showHeader` = cabecera de sección; `start` = destino inicial. */
export default function DestinationExplorer({ showHeader = true, start = null }) {
  const { t } = useTranslation();
  const [activeIndex, select] = useAutoTour(DESTINATIONS.length, undefined, start);

  return (
    <section
      id="explorar"
      className={styles.section}
      aria-labelledby={showHeader ? 'explorer-title' : undefined}
    >
      {showHeader && (
        <SectionHeader
          id="explorer-title"
          eyebrow={t('explorer.eyebrow')}
          titleA={t('explorer.titleA')}
          titleB={t('explorer.titleB')}
          lead={t('explorer.lead')}
        />
      )}
      <div className={styles.layout}>
        <SchematicMap activeIndex={activeIndex} onSelect={select} />
        <DestinationCard activeIndex={activeIndex} onSelect={select} />
      </div>
      {showHeader && (
        <div className={styles.more}>
          <Link to="/lugares" className={buttonClass('secondary', { size: 'lg' })}>
            {t('explorer.viewAll')}
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      )}
    </section>
  );
}
