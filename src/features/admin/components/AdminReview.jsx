import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAsync } from '../../../lib/useAsync';
import {
  approveRequest,
  listPendingRequests,
  rejectRequest,
} from '../../../services/changeRequests.service';
import PayloadView from './PayloadView';
import { useSubmitRequest } from '../hooks/useSubmitRequest';
import styles from '../admin.module.css';

function PendingItem({ request, onDone }) {
  const { t } = useTranslation();
  const [note, setNote] = useState('');
  const { busy, result, run } = useSubmitRequest();

  const act = (task) => run(task).then((ok) => ok && onDone());

  return (
    <li className={styles.request}>
      <p className={styles.hint}>
        {t('admin.review.from')}: <strong>{request.associations?.name}</strong>
      </p>
      <strong>
        {t(`admin.requests.action.${request.action}`)} ·{' '}
        {t(`admin.requests.entity.${request.entity_type}`)}
      </strong>
      <PayloadView request={request} />
      <div className={styles.reviewRow}>
        <input
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder={t('admin.review.notePlaceholder')}
          aria-label={t('admin.review.notePlaceholder')}
        />
        <button
          type="button"
          className={styles.primary}
          disabled={busy}
          onClick={() => act(() => approveRequest(request.id))}
        >
          {t('admin.review.approve')}
        </button>
        <button
          type="button"
          className={styles.secondary}
          disabled={busy}
          onClick={() => act(() => rejectRequest(request.id, note))}
        >
          {t('admin.review.reject')}
        </button>
      </div>
      {result === 'error' && <p className={styles.error}>{t('admin.sendError')}</p>}
    </li>
  );
}

export default function AdminReview() {
  const { t } = useTranslation();
  const { data, error, loading, reload } = useAsync(listPendingRequests);

  return (
    <>
      <h1 className={styles.title}>{t('admin.review.title')}</h1>
      {loading && <p>{t('common.loading')}</p>}
      {error && <p className={styles.error}>{t('common.error')}</p>}
      {data && data.length === 0 && <p className={styles.hint}>{t('admin.review.empty')}</p>}
      {data && data.length > 0 && (
        <ul className={styles.requests}>
          {data.map((request) => (
            <PendingItem key={request.id} request={request} onDone={reload} />
          ))}
        </ul>
      )}
    </>
  );
}
