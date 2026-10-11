import { useTranslation } from 'react-i18next';
import { esText } from '../../../lib/esText';
import styles from './OfferBlocks.module.css';

/** Medios de pago con su nota (p. ej. aviso de señal limitada). */
export default function PaymentMethods({ methods }) {
  const { t } = useTranslation();
  if (!methods.length) return null;

  return (
    <section className={styles.block}>
      <h2 className={styles.heading}>{t('associations.payments')}</h2>
      <ul className={styles.cards}>
        {methods.map((method) => (
          <li key={method.id} className={styles.card}>
            <h3>{t(`associations.payment.${method.kind}`)}</h3>
            {method.note_es && <p>{esText(method, 'note')}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}
