import { useTranslation } from 'react-i18next';
import { useAsync } from '../../../lib/useAsync';
import { getAssociationTree } from '../../../services/associations.service';
import { listRequests } from '../../../services/changeRequests.service';
import {
  activityFields,
  normalizeProvider,
  paymentFields,
  providerFields,
  spaceFields,
  subspaceFields,
} from '../lib/entityFields';
import CreateEntityForm from './CreateEntityForm';
import ImageForm from './ImageForm';
import ProfileForm from './ProfileForm';
import RequestList from './RequestList';
import SpacesOverview from './SpacesOverview';
import styles from '../admin.module.css';

export default function LeaderPanel({ associationId }) {
  const { t } = useTranslation();
  const tree = useAsync(() => getAssociationTree(associationId), [associationId]);
  const requests = useAsync(() => listRequests(associationId), [associationId]);

  if (tree.loading) return <p>{t('common.loading')}</p>;
  if (tree.error || !tree.data) return <p>{t('common.error')}</p>;

  const association = tree.data;
  const spaces = association.spaces.map((s) => ({ ...s, subspaces: s.subspaces ?? [] }));
  const subspaces = spaces.flatMap((s) => s.subspaces);
  const providers = association.providers;
  const common = { associationId, onSent: requests.reload };

  return (
    <>
      <h1 className={styles.title}>{association.name}</h1>
      <p className={styles.intro}>{t('admin.leader.intro')}</p>

      <SpacesOverview spaces={spaces} providers={providers} />

      <CreateEntityForm
        {...common}
        entityType="space"
        title={t('admin.sections.addSpace')}
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
      <CreateEntityForm
        {...common}
        entityType="provider"
        title={t('admin.sections.addProvider')}
        fields={providerFields(subspaces, t)}
        normalize={normalizeProvider}
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
      <ImageForm associationId={associationId} spaces={spaces} onSent={requests.reload} />
      <ProfileForm {...common} />
      <RequestList requests={requests.data ?? []} />
    </>
  );
}
