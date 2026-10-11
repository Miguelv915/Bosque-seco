import { useTranslation } from 'react-i18next';
import { whatsappLink } from '../../../lib/whatsapp';
import styles from './AssociationContact.module.css';

/** Botón de WhatsApp de la asociación; solo aparece si publicó un número de contacto. */
export default function AssociationContact({ number }) {
  const { t } = useTranslation();
  const href = whatsappLink(number);
  if (!href) return null;

  return (
    <a className={styles.button} href={href} target="_blank" rel="noreferrer">
      {t('associations.contactWhatsapp')}
    </a>
  );
}
