import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ImagePlaceholder from '../../../components/shared/ImagePlaceholder';
import SectionHeader from '../../../components/shared/SectionHeader';
import { localized } from '../../../lib/localized';
import { useAsync } from '../../../lib/useAsync';
import { listAssociations, mediaUrl, pickCover } from '../../../services/associations.service';
import styles from './AssociationsSection.module.css';

const ALL = 'all';

const departmentsOf = (association) => association.spaces.flatMap((s) => s.departments);

export default function AssociationsSection() {
  const { t, i18n } = useTranslation();
  const { data, error, loading } = useAsync(listAssociations);
  const [department, setDepartment] = useState(ALL);

  const departments = data ? [...new Set(data.flatMap(departmentsOf))].sort() : [];
  const visible = data
    ? data.filter((a) => department === ALL || departmentsOf(a).includes(department))
    : [];

  return (
    <section id="asociaciones" className={styles.section} aria-labelledby="associations-title">
      <SectionHeader
        id="associations-title"
        eyebrow={t('associations.eyebrow')}
        titleA={t('associations.titleA')}
        titleB={t('associations.titleB')}
        lead={t('associations.lead')}
      />

      {departments.length > 0 && (
        <div className={styles.filters} role="group" aria-label={t('associations.departmentLabel')}>
          {[ALL, ...departments].map((value) => (
            <button
              key={value}
              type="button"
              className={styles.filter}
              aria-pressed={department === value}
              onClick={() => setDepartment(value)}
            >
              {value === ALL ? t('associations.departmentAll') : value}
            </button>
          ))}
        </div>
      )}

      {loading && <p className={styles.status}>{t('common.loading')}</p>}
      {error && <p className={styles.status}>{t('common.error')}</p>}
      {data && visible.length === 0 && <p className={styles.status}>{t('associations.empty')}</p>}

      {visible.length > 0 && (
        <ul className={styles.grid}>
          {visible.map((association) => {
            const cover = pickCover(association.spaces.flatMap((s) => s.media));
            return (
              <li key={association.id}>
                <Link to={`/asociaciones/${association.slug}`} className={styles.card}>
                  <div className={styles.photo}>
                    <ImagePlaceholder
                      src={cover && mediaUrl(cover.storage_path)}
                      alt={association.name}
                      label={association.name}
                    />
                  </div>
                  <div className={styles.body}>
                    <h3 className={styles.name}>{association.name}</h3>
                    <p className={styles.regions}>{[...new Set(departmentsOf(association))].join(' · ')}</p>
                    <p className={styles.summary}>
                      {localized(association, 'summary', i18n.resolvedLanguage)}
                    </p>
                    <span className={styles.more}>{t('associations.view').toUpperCase()} →</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
