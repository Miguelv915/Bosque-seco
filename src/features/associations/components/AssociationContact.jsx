import { useTranslation } from 'react-i18next';
import { MessageCircle } from 'lucide-react';
import { buttonClass } from '../../../components/shared/buttonClass';
import { whatsappLink, withMessage } from '../../../lib/whatsapp';
import styles from './AssociationContact.module.css';

/**
 * Botón de WhatsApp de la asociación; solo aparece si publicó un número de contacto.
 * `message` (opcional) llega prellenado en el chat.
 */
export default function AssociationContact({ number, message }) {
  const { t } = useTranslation();
  const href = withMessage(whatsappLink(number), message);
  if (!href) return null;

  return (
    <a
      className={`${buttonClass('primary', { size: 'lg' })} ${styles.button}`}
      href={href}
      target="_blank"
      rel="noreferrer"
    >
      <MessageCircle size={18} aria-hidden="true" />
      {t('associations.contactWhatsapp')}
    </a>
  );
}
