import { useTranslation } from 'react-i18next';
import SectionHeader from '../../../components/shared/SectionHeader';
import { DESTINATIONS } from '../data/destinations';
import { useAutoTour } from '../hooks/useAutoTour';
import SchematicMap from './SchematicMap';
import DestinationCard from './DestinationCard';
import styles from './DestinationExplorer.module.css';

export default function DestinationExplorer() {
  const { t } = useTranslation();
  const [activeIndex, select] = useAutoTour(DESTINATIONS.length);

  return (
    <section id="explorar" className={styles.section} aria-labelledby="explorer-title">
      <SectionHeader
        id="explorer-title"
        eyebrow={t('explorer.eyebrow')}
        titleA={t('explorer.titleA')}
        titleB={t('explorer.titleB')}
        lead={t('explorer.lead')}
      />
      <div className={styles.layout}>
        <SchematicMap activeIndex={activeIndex} onSelect={select} />
        <DestinationCard activeIndex={activeIndex} onSelect={select} />
      </div>
    </section>
  );
}
