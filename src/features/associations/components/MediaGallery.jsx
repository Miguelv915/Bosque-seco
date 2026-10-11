import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ImagePlaceholder from '../../../components/shared/ImagePlaceholder';
import { localized } from '../../../lib/localized';
import { mediaUrl } from '../../../services/associations.service';
import styles from './MediaGallery.module.css';

const ALL = 'all';

/** Galería filtrable por categoría (flora, fauna, paisaje, instalaciones). */
export default function MediaGallery({ media, fallbackAlt }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage;
  const [category, setCategory] = useState(ALL);

  if (!media.length) return null;

  const categories = [ALL, ...new Set(media.map((m) => m.category))];
  const visible = category === ALL ? media : media.filter((m) => m.category === category);

  return (
    <section className={styles.block}>
      <h2 className={styles.heading}>{t('associations.gallery')}</h2>
      <div className={styles.filters} role="group" aria-label={t('associations.gallery')}>
        {categories.map((value) => (
          <button
            key={value}
            type="button"
            className={styles.filter}
            aria-pressed={category === value}
            onClick={() => setCategory(value)}
          >
            {t(`associations.categories.${value}`)}
          </button>
        ))}
      </div>
      <ul className={styles.grid}>
        {visible.map((item) => (
          <li key={item.id} className={styles.shot}>
            <ImagePlaceholder
              src={mediaUrl(item.storage_path)}
              alt={localized(item, 'alt', lang) || fallbackAlt}
              label={fallbackAlt}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
