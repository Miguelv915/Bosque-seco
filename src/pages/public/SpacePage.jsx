import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ImagePlaceholder from '../../components/shared/ImagePlaceholder';
import { localized } from '../../lib/localized';
import { useAsync } from '../../lib/useAsync';
import { getSpaceById, mediaUrl, pickCover } from '../../services/associations.service';
import MediaGallery from '../../features/associations/components/MediaGallery';
import styles from './PublicPage.module.css';

export default function SpacePage() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage;
  const { data: space, error, loading } = useAsync(() => getSpaceById(id), [id]);

  if (loading) return <p className={styles.page}>{t('common.loading')}</p>;
  if (error) return <p className={styles.page}>{t('common.error')}</p>;
  if (!space) return <p className={styles.page}>{t('associations.notFound')}</p>;

  const { associations: association } = space;
  const cover = pickCover(space.media);
  const subspaces = [...space.subspaces]
    .filter((s) => s.is_active)
    .sort((a, b) => a.sort_order - b.sort_order);

  return (
    <article className={styles.page}>
      <Link to={`/asociaciones/${association.slug}`} className={styles.back}>
        ← {association.name}
      </Link>

      <header className={styles.header}>
        <p className={styles.kicker}>{space.departments.join(' · ')}</p>
        <h1 className={styles.title}>{space.name}</h1>
        <p className={styles.badge}>
          {t('associations.endorsed', {
            by: association.endorsed_by,
            association: association.acronym || association.name,
          })}
        </p>
        {localized(space, 'location', lang) && (
          <p className={styles.meta}>{localized(space, 'location', lang)}</p>
        )}
      </header>

      {cover && (
        <div className={styles.cover}>
          <ImagePlaceholder
            src={mediaUrl(cover.storage_path)}
            alt={localized(cover, 'alt', lang) || space.name}
            label={space.name}
            priority
          />
        </div>
      )}

      {space.description_es && (
        <p className={styles.description}>{localized(space, 'description', lang)}</p>
      )}

      <section className={styles.block}>
        <h2 className={styles.heading}>{t('associations.subspaces')}</h2>
        {subspaces.length === 0 ? (
          <p className={styles.muted}>{t('associations.noSubspaces')}</p>
        ) : (
          <ul className={styles.list}>
            {subspaces.map((subspace) => (
              <li key={subspace.id}>
                <Link to={`/subespacios/${subspace.id}`} className={styles.item}>
                  <h3>{subspace.name}</h3>
                  <p>{localized(subspace, 'description', lang)}</p>
                  <span className={styles.more}>
                    {t('associations.viewSubspace').toUpperCase()} →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <MediaGallery media={space.media} fallbackAlt={space.name} />
    </article>
  );
}
