import { DESTINATIONS } from '../../destinations/data/destinations';
import { WHATSAPP_URL } from '../../../lib/contact';
import { withMessage } from '../../../lib/whatsapp';
import { intentById } from '../data/intents';

// Valores que se calculan de los datos del sitio, para que la respuesta no
// repita (ni contradiga) lo que ya publican los destinos.
const PARAMS = {
  destinations: (t) => ({
    count: DESTINATIONS.length,
    names: DESTINATIONS.map((d) => t(`destinations.${d.id}.short`)).join(', '),
  }),
  access: (t) => ({
    list: DESTINATIONS.map(
      (d) => `• ${t(`destinations.${d.id}.short`)}: ${t(`destinations.${d.id}.access`)}`,
    ).join('\n'),
  }),
};

/**
 * Texto y enlace de apoyo de una intención, en el idioma actual de `t`.
 * El enlace es `{ kind: 'route', to, label }` o `{ kind: 'external', href, label }`.
 * Sin WhatsApp configurado, el contacto lleva a las asociaciones.
 */
export function buildAnswer(id, t) {
  const intent = intentById(id);
  const text = t(`chatbot.answers.${id}`, PARAMS[id]?.(t) ?? {});
  const link = intent?.link;
  if (!link) return { text, link: null };

  if (link.type === 'route') {
    return { text, link: { kind: 'route', to: link.to, label: t(`chatbot.links.${id}`) } };
  }

  const href = withMessage(WHATSAPP_URL, t('chatbot.whatsappMessage'));
  return href
    ? { text, link: { kind: 'external', href, label: t('chatbot.links.whatsapp') } }
    : { text, link: { kind: 'route', to: '/#asociaciones', label: t('chatbot.links.guides') } };
}
