import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAsync } from '../../../lib/useAsync';
import { getAssociationTree } from '../../../services/associations.service';
import { features } from '../../../config/features';
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
import { CardGrid, DataTable, ItemCard, Registered } from './Registered';
import RequestList from './RequestList';
import RoutePointForm from './RoutePointForm';
import SectionNav from './SectionNav';
import styles from '../admin.module.css';

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

      <div className={styles.panelLayout}>
        <SectionNav current={section} onChange={setSection} pendingCount={pending} />
        <div className={styles.panelContent}>

          {section === 'summary' && (
            <ReadinessSummary
              tree={{ ...association, spaces, providers, routes }}
              onGoTo={setSection}
            />
          )}

          {section === 'association' && <ProfileForm {...common} />}

          {section === 'spaces' && (
            <>
              <Registered
                title={t('admin.sections.spaces')}
                count={spaces.length}
                empty={t('admin.sections.noSpaces')}
              >
                <CardGrid>
                  {spaces.map((space) => (
                    <ItemCard
                      key={space.id}
                      title={space.name}
                      subtitle={space.departments.join(' · ')}
                      tags={[
                        {
                          label: space.signal_es || t('admin.sections.noSignal'),
                          tone: space.signal_es ? 'ok' : 'warn',
                        },
                        {
                          label: space.access_es || t('admin.sections.noAccess'),
                          tone: space.access_es ? 'ok' : 'warn',
                        },
                        ...(space.subspaces.length > 0
                          ? [
                              {
                                label: t('admin.sections.subspacesCount', {
                                  count: space.subspaces.length,
                                }),
                              },
                            ]
                          : []),
                      ]}
                    >
                      {space.subspaces.length > 0 && (
                        <span className={styles.hint}>
                          {space.subspaces.map((s) => s.name).join(', ')}
                        </span>
                      )}
                    </ItemCard>
                  ))}
                </CardGrid>
              </Registered>
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
              <Registered
                title={t('admin.sections.providers')}
                count={providers.length}
                empty={t('admin.sections.noProviders')}
              >
                <DataTable
                  rowKey={(p) => p.id}
                  columns={[
                    { key: 'name', label: t('admin.table.name'), render: (p) => <strong>{p.name}</strong> },
                    { key: 'kind', label: t('admin.table.kind'), render: (p) => t(`admin.kind.${p.kind}`) },
                    {
                      key: 'whatsapp',
                      label: t('admin.table.whatsapp'),
                      render: (p) => p.whatsapp || <span className={styles.hint}>{t('admin.sections.noPhone')}</span>,
                    },
                    { key: 'rate', label: t('admin.table.rate'), render: (p) => p.rate_text_es || '—' },
                    {
                      key: 'status',
                      label: t('admin.table.status'),
                      render: (p) => (
                        <span className={styles.tag} data-tone={p.is_active ? 'ok' : 'warn'}>
                          {t(p.is_active ? 'admin.status.active' : 'admin.status.inactive')}
                        </span>
                      ),
                    },
                  ]}
                  rows={providers}
                />
              </Registered>
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

          {features.routes && section === 'routes' && (
            <>
              <Registered
                title={t('admin.sections.routes')}
                count={routes.length}
                empty={t('admin.sections.noRoutes')}
              >
                <ul className={styles.routeList}>
                  {routes.map((route) => (
                    <li key={route.id} className={styles.itemCard}>
                      <strong className={styles.itemTitle}>{route.name_es}</strong>
                      <span className={styles.hint}>
                        {t('admin.sections.pointsCount', { count: route.route_points.length })}
                      </span>
                      {route.route_points.length === 0 && (
                        <span className={styles.hint}>{t('admin.sections.noPoints')}</span>
                      )}
                      <ol className={styles.points}>
                        {route.route_points.map((point) => (
                          <li key={point.id}>
                            <span className={styles.pointInfo}>
                              <strong>{point.name_es}</strong> <code>{point.code}</code>
                              <span className={styles.tags}>
                                <span className={styles.tag}>
                                  {point.minutes_from_previous} min · {point.meters_from_previous} m
                                </span>
                                {point.lat == null && (
                                  <span className={styles.tag} data-tone="warn">
                                    {t('admin.sections.noGps')}
                                  </span>
                                )}
                                {!point.photo_path && (
                                  <span className={styles.tag} data-tone="warn">
                                    {t('admin.sections.noPhoto')}
                                  </span>
                                )}
                              </span>
                            </span>
                            <button
                              type="button"
                              className={styles.link}
                              onClick={() => setOpenQr(openQr === point.id ? null : point.id)}
                            >
                              {t('admin.qr.show')}
                            </button>
                            {openQr === point.id && <QrPreview code={point.code} name={point.name_es} />}
                          </li>
                        ))}
                      </ol>
                    </li>
                  ))}
                </ul>
              </Registered>
              <CreateEntityForm
                {...common}
                entityType="route"
                title={t('admin.sections.addRoute')}
                fields={routeFields(spaces)}
              />
              <RoutePointForm {...common} routes={routes} />
            </>
          )}

          {features.routes && section === 'rewards' && (
            <>
              <Registered
                title={t('admin.sections.rewards')}
                count={rewards.length}
                empty={t('admin.sections.noRewards')}
              >
                <CardGrid>
                  {rewards.map((reward) => (
                    <ItemCard
                      key={reward.id}
                      title={reward.name_es}
                      tags={[
                        { label: `${reward.points_required} ${t('admin.sections.points')}` },
                        { label: `${reward.discount_percent}%`, tone: 'ok' },
                      ]}
                    />
                  ))}
                </CardGrid>
              </Registered>
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
        </div>
      </div>
    </>
  );
}
