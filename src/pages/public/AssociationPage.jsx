import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { esText } from '../../lib/esText';
import { useAsync } from '../../lib/useAsync';
import { getAssociationBySlug } from '../../services/associations.service';
import AssociationContact from '../../features/associations/components/AssociationContact';
import ActivityList from '../../features/associations/components/ActivityList';
import GuideContact from '../../features/associations/components/GuideContact';
import PaymentMethods from '../../features/associations/components/PaymentMethods';
import TranslateHint from '../../components/shared/TranslateHint';
import styles from './PublicPage.module.css';

export default function AssociationPage() {
  const { slug } = useParams();
  const { t } = useTranslation();
  const { data: association, error, loading } = useAsync(() => getAssociationBySlug(slug), [slug]);

  if (loading) return <p className={styles.page}>{t('common.loading')}</p>;
  if (error) return <p className={styles.page}>{t('common.error')}</p>;
  if (!association) return <p className={styles.page}>{t('associations.notFound')}</p>;

  const spaces = [...association.spaces].sort((a, b) => a.sort_order - b.sort_order);
  const generalOffer = association.activities.filter((a) => a.is_active && !a.subspace_id);

  return (
    <article className={styles.page}>
      <Link to="/#asociaciones" className={styles.back}>
        ← {t('common.back')}
      </Link>

      <TranslateHint />

      <header className={styles.header}>
        {association.acronym && <p className={styles.kicker}>{association.acronym}</p>}
        <h1 className={styles.title}>{association.name}</h1>
        <p className={styles.badge}>
          {t('associations.endorsed', { by: association.endorsed_by, association: association.acronym || association.name })}
        </p>
        <p className={styles.summary}>{esText(association, 'summary')}</p>
        <AssociationContact number={association.contact_whatsapp} />
      </header>

      {association.description_es && (
        <p className={styles.description}>{esText(association, 'description')}</p>
      )}

      <section className={styles.block}>
        <h2 className={styles.heading}>{t('associations.spaces')}</h2>
        {spaces.length === 0 ? (
          <p className={styles.muted}>{t('associations.noSpaces')}</p>
        ) : (
          <ul className={styles.list}>
            {spaces.map((space) => (
              <li key={space.id}>
                <Link to={`/espacios/${space.id}`} className={styles.item}>
                  <h3>{space.name}</h3>
                  <p className={styles.meta}>{space.departments.join(' · ')}</p>
                  <p>{esText(space, 'description')}</p>
                  <span className={styles.more}>{t('associations.viewSpace').toUpperCase()} →</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <ActivityList
        activities={generalOffer}
        title={t('associations.generalOffer')}
      />
      <GuideContact guides={association.providers.filter((p) => p.is_active)} />
      <PaymentMethods methods={association.payment_methods.filter((m) => m.is_active)} />
    </article>
  );
}
