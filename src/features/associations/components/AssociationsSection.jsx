import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ImagePlaceholder from '../../../components/shared/ImagePlaceholder';
import SectionHeader from '../../../components/shared/SectionHeader';
import { esText } from '../../../lib/esText';
import { useAsync } from '../../../lib/useAsync';
import { pickCover } from '../../../lib/media';
import { listAssociations, mediaUrl } from '../../../services/associations.service';
import TranslateHint from '../../../components/shared/TranslateHint';
import {
  ALL_DEPARTMENTS as ALL,
  departmentsOf,
  filterByDepartment,
  listDepartments,
  spacesIn,
} from '../lib/departments';
import { FALLBACK_COVERS } from '../data/fallbackCovers';
import { coverFor } from '../lib/cover';
import styles from './AssociationsSection.module.css';

export default function AssociationsSection() {
  const { t } = useTranslation();
  const { data, error, loading } = useAsync(listAssociations);
  const [department, setDepartment] = useState(ALL);

  const departments = data ? listDepartments(data) : [];
  const visible = data ? filterByDepartment(data, department) : [];

  return (
    <section id="asociaciones" className={styles.section} aria-labelledby="associations-title">
      <SectionHeader
        id="associations-title"
        eyebrow={t('associations.eyebrow')}
        titleA={t('associations.titleA')}
        titleB={t('associations.titleB')}
        lead={t('associations.lead')}
      />

      <TranslateHint />

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
            const uploaded = pickCover(association.spaces.flatMap((s) => s.media));
            const cover = coverFor(
              association.name,
              uploaded && mediaUrl(uploaded.storage_path),
              FALLBACK_COVERS,
            );
            return (
              <li key={association.id}>
                <Link to={`/asociaciones/${association.slug}`} className={styles.card}>
                  <div className={styles.photo}>
                    <ImagePlaceholder
                      src={cover?.src}
                      credit={cover?.credit}
                      alt={association.name}
                      label={association.name}
                    />
                  </div>
                  <div className={styles.body}>
                    <h3 className={styles.name}>{association.name}</h3>
                    <p className={styles.regions}>{departmentsOf(association).join(' · ')}</p>
                    <p className={styles.spaces}>
                      {spacesIn(association, department)
                        .map((space) => space.name)
                        .join(' · ')}
                    </p>
                    <p className={styles.summary}>
                      {esText(association, 'summary')}
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
