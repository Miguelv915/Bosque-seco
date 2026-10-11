import { useTranslation } from 'react-i18next';
import styles from '../admin.module.css';

/** Listado de los espacios de la asociación con sus subespacios y prestadores. */
export default function SpacesOverview({ spaces, providers }) {
  const { t } = useTranslation();

  return (
    <section className={styles.card}>
      <h2 className={styles.cardTitle}>{t('admin.sections.spaces')}</h2>
      {spaces.length === 0 ? (
        <p className={styles.hint}>{t('admin.sections.noSpaces')}</p>
      ) : (
        <ul className={styles.requests}>
          {spaces.map((space) => (
            <li key={space.id} className={styles.request}>
              <strong>{space.name}</strong>
              <span className={styles.hint}>{space.departments.join(' · ')}</span>
              {space.subspaces.length > 0 && (
                <span className={styles.hint}>
                  {t('admin.sections.subspaces')}: {space.subspaces.map((s) => s.name).join(', ')}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
      {providers.length > 0 && (
        <p className={styles.hint}>
          {t('admin.sections.providers')}:{' '}
          {providers.map((p) => `${p.name} (${t(`admin.kind.${p.kind}`)})`).join(', ')}
        </p>
      )}
    </section>
  );
}
