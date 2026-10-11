import { useTranslation } from 'react-i18next';
import ImagePlaceholder from '../../../components/shared/ImagePlaceholder';
import SectionHeader from '../../../components/shared/SectionHeader';
import { SPECIES } from '../data/species';
import styles from './SpeciesSection.module.css';

export default function SpeciesSection() {
  const { t } = useTranslation();

  return (
    <section id="ecosistema" className={styles.section} aria-labelledby="ecosystem-title">
      <SectionHeader
        id="ecosystem-title"
        eyebrow={t('ecosystem.eyebrow')}
        titleA={t('ecosystem.titleA')}
        titleB={t('ecosystem.titleB')}
        lead={t('ecosystem.lead')}
      />
      <ul className={styles.grid}>
        {SPECIES.map((species, i) => {
          const name = t(`species.${species.id}.name`);
          return (
            <li key={species.id}>
              <article className={styles.card}>
                <div className={styles.photo}>
                  <ImagePlaceholder
                    src={species.image}
                    alt={name}
                    label={t('explorer.photo', { name })}
                  />
                </div>
                <div className={styles.body}>
                  <div className={styles.meta}>
                    <span>{t(`ecosystem.${species.kind}`).toUpperCase()}</span>
                    <span className={styles.code}>SP-{String(i + 1).padStart(2, '0')}</span>
                  </div>
                  <h3 className={styles.name}>{name}</h3>
                  <p className={styles.scientific}>{species.scientific}</p>
                  <p className={styles.note}>{t(`species.${species.id}.note`)}</p>
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
