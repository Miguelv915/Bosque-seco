import { useTranslation } from 'react-i18next';
import { Check, Circle } from 'lucide-react';
import { computeReadiness } from '../lib/readiness';
import styles from '../admin.module.css';

/** Qué falta para que la app móvil funcione con datos reales. */
export default function ReadinessSummary({ tree, onGoTo }) {
  const { t } = useTranslation();
  const { items, requiredDone, requiredTotal, complete } = computeReadiness(tree);
  const percent = Math.round((requiredDone / requiredTotal) * 100);

  return (
    <section className={styles.card} aria-labelledby="readiness-title">
      <h2 id="readiness-title" className={styles.cardTitle}>
        {t('admin.readiness.title')}
      </h2>
      <p className={complete ? styles.ok : styles.hint}>
        {complete
          ? t('admin.readiness.complete')
          : t('admin.readiness.progress', { done: requiredDone, total: requiredTotal })}
      </p>
      <div
        className={styles.progress}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-label={t('admin.readiness.title')}
      >
        <span style={{ width: `${percent}%` }} />
      </div>

      <ul className={styles.checklist}>
        {items.map((item) => (
          <li key={item.id} data-ok={item.ok}>
            {item.ok ? <Check size={16} aria-hidden="true" /> : <Circle size={16} aria-hidden="true" />}
            <span>
              {t(`admin.readiness.items.${item.id}.label`)}
              {!item.required && (
                <em className={styles.optional}> · {t('admin.readiness.recommended')}</em>
              )}
            </span>
            {!item.ok && (
              <button type="button" className={styles.link} onClick={() => onGoTo(item.section)}>
                {t('admin.readiness.fix')}
              </button>
            )}
          </li>
        ))}
      </ul>
      <p className={styles.hint}>{t('admin.readiness.pendingNote')}</p>
    </section>
  );
}
