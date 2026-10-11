import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAsync } from '../../../lib/useAsync';
import { getAssociationTree } from '../../../services/associations.service';
import { listRequests } from '../../../services/changeRequests.service';
import {
  activityFields,
  paymentFields,
  providerFields,
  rewardFields,
  routeFields,
  spaceFields,
  subspaceFields,
} from '../lib/entityFields';
import CreateEntityForm from './CreateEntityForm';
import ImageForm from './ImageForm';
import ProfileForm from './ProfileForm';
import QrPreview from './QrPreview';
import ReadinessSummary from './ReadinessSummary';
import RequestList from './RequestList';
import RoutePointForm from './RoutePointForm';
import SectionNav from './SectionNav';
import styles from '../admin.module.css';

/** Lista simple de elementos ya publicados. */
function Published({ title, empty, children }) {
  return (
    <section className={styles.card}>
      <h3 className={styles.cardTitle}>{title}</h3>
      {children ?? <p className={styles.hint}>{empty}</p>}
    </section>
  );
}

export default function LeaderPanel({ associationId }) {
  const { t } = useTranslation();
  const [section, setSection] = useState('summary');
  const [openQr, setOpenQr] = useState(null);
  const tree = useAsync(() => getAssociationTree(associationId), [associationId]);
  const requests = useAsync(() => listRequests(associationId), [associationId]);

  if (tree.loading) return <p>{t('common.loading')}</p>;
  if (tree.error || !tree.data) return <p>{t('common.error')}</p>;

  const association = tree.data;
  const spaces = (association.spaces ?? []).map((s) => ({ ...s, subspaces: s.subspaces ?? [] }));
  const subspaces = spaces.flatMap((s) => s.subspaces);
  const providers = association.providers ?? [];
  const routes = (association.routes ?? []).map((r) => ({
    ...r,
    route_points: [...(r.route_points ?? [])].sort((a, b) => a.position - b.position),
  }));
  const rewards = association.rewards ?? [];
  const pending = (requests.data ?? []).filter((r) => r.status === 'pending').length;
  const common = { associationId, onSent: requests.reload };

  return (
    <>
      <h1 className={styles.title}>{association.name}</h1>
      <p className={styles.intro}>{t('admin.leader.intro')}</p>

      <SectionNav current={section} onChange={setSection} pendingCount={pending} />

      {section === 'summary' && (
        <ReadinessSummary
          tree={{ ...association, spaces, providers, routes }}
          onGoTo={setSection}
        />
      )}

      {section === 'association' && <ProfileForm {...common} />}

      {section === 'spaces' && (
        <>
          <Published title={t('admin.sections.spaces')} empty={t('admin.sections.noSpaces')}>
            {spaces.length > 0 && (
              <ul className={styles.requests}>
                {spaces.map((space) => (
                  <li key={space.id} className={styles.request}>
                    <strong>{space.name}</strong>
                    <span className={styles.hint}>{space.departments.join(' · ')}</span>
                    <span className={styles.hint}>
                      {t('admin.fields.signal')}: {space.signal_es || '—'} ·{' '}
                      {t('admin.fields.access')}: {space.access_es || '—'}
                    </span>
                    {space.subspaces.length > 0 && (
                      <span className={styles.hint}>
                        {t('admin.sections.subspaces')}:{' '}
                        {space.subspaces.map((s) => s.name).join(', ')}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Published>
          <CreateEntityForm
            {...common}
            entityType="space"
            title={t('admin.sections.addSpace')}
            description={t('admin.sections.beforeYouGo')}
            fields={spaceFields}
          />
          {spaces.length > 0 && (
            <CreateEntityForm
              {...common}
              entityType="subspace"
              title={t('admin.sections.addSubspace')}
              fields={subspaceFields(spaces)}
            />
          )}
        </>
      )}

      {section === 'providers' && (
        <>
          <Published title={t('admin.sections.providers')} empty={t('admin.sections.noProviders')}>
            {providers.length > 0 && (
              <ul className={styles.requests}>
                {providers.map((p) => (
                  <li key={p.id} className={styles.request}>
                    <strong>{p.name}</strong>
                    <span className={styles.hint}>
                      {t(`admin.kind.${p.kind}`)} · {p.whatsapp || t('admin.sections.noPhone')}
                      {p.rate_text_es ? ` · ${p.rate_text_es}` : ''}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Published>
          <CreateEntityForm
            {...common}
            entityType="provider"
            title={t('admin.sections.addProvider')}
            description={t('admin.sections.providerRule')}
            fields={providerFields(subspaces, t)}
          />
          <CreateEntityForm
            {...common}
            entityType="activity"
            title={t('admin.sections.addActivity')}
            fields={activityFields(subspaces, providers)}
          />
          <CreateEntityForm
            {...common}
            entityType="payment_method"
            title={t('admin.sections.addPayment')}
            fields={paymentFields(t)}
          />
        </>
      )}

      {section === 'routes' && (
        <>
          <Published title={t('admin.sections.routes')} empty={t('admin.sections.noRoutes')}>
            {routes.length > 0 && (
              <ul className={styles.requests}>
                {routes.map((route) => (
                  <li key={route.id} className={styles.request}>
                    <strong>{route.name_es}</strong>
                    {route.route_points.length === 0 && (
                      <span className={styles.hint}>{t('admin.sections.noPoints')}</span>
                    )}
                    <ol className={styles.points}>
                      {route.route_points.map((point) => (
                        <li key={point.id}>
                          <span>
                            <strong>{point.name_es}</strong> <code>{point.code}</code>
                            <small className={styles.hint}>
                              {' '}
                              {point.minutes_from_previous} min · {point.meters_from_previous} m
                              {point.lat == null ? ` · ${t('admin.sections.noGps')}` : ''}
                              {point.photo_path ? '' : ` · ${t('admin.sections.noPhoto')}`}
                            </small>
                          </span>
                          <button
                            type="button"
                            className={styles.link}
                            onClick={() => setOpenQr(openQr === point.id ? null : point.id)}
                          >
                            {t('admin.qr.show')}
                          </button>
                          {openQr === point.id && (
                            <QrPreview code={point.code} name={point.name_es} />
                          )}
                        </li>
                      ))}
                    </ol>
                  </li>
                ))}
              </ul>
            )}
          </Published>
          <CreateEntityForm
            {...common}
            entityType="route"
            title={t('admin.sections.addRoute')}
            fields={routeFields(spaces)}
          />
          <RoutePointForm {...common} routes={routes} />
        </>
      )}

      {section === 'rewards' && (
        <>
          <Published title={t('admin.sections.rewards')} empty={t('admin.sections.noRewards')}>
            {rewards.length > 0 && (
              <ul className={styles.requests}>
                {rewards.map((reward) => (
                  <li key={reward.id} className={styles.request}>
                    <strong>{reward.name_es}</strong>
                    <span className={styles.hint}>
                      {reward.points_required} {t('admin.sections.points')} · {reward.discount_percent}%
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Published>
          <CreateEntityForm
            {...common}
            entityType="reward"
            title={t('admin.sections.addReward')}
            description={t('admin.sections.rewardRule')}
            fields={rewardFields}
          />
        </>
      )}

      {section === 'gallery' && (
        <ImageForm associationId={associationId} spaces={spaces} onSent={requests.reload} />
      )}

      {section === 'requests' && <RequestList requests={requests.data ?? []} />}
    </>
  );
}
