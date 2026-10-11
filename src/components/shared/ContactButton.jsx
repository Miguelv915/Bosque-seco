import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MessageCircle } from 'lucide-react';
import { WHATSAPP_URL } from '../../lib/contact';
import { withMessage } from '../../lib/whatsapp';
import { buttonClass } from './buttonClass';

/**
 * WhatsApp con mensaje prellenado. Si no hay número configurado, lleva a las
 * asociaciones, donde cada guía publica su propio WhatsApp.
 */
export default function ContactButton({ message, variant = 'primary', size, block = false }) {
  const { t } = useTranslation();
  const href = withMessage(WHATSAPP_URL, message);
  const className = buttonClass(variant, { size, block });
  const icon = <MessageCircle size={18} aria-hidden="true" />;

  return href ? (
    <a href={href} className={className} target="_blank" rel="noopener noreferrer">
      {icon}
      {t('contact.whatsapp')}
    </a>
  ) : (
    <Link to="/#asociaciones" className={className}>
      {icon}
      {t('contact.guide')}
    </Link>
  );
}
