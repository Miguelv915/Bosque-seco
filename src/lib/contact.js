import { contactLink } from './whatsapp';

// Enlaces públicos configurables por entorno (ver .env.example). Vacíos = no configurados.

/** WhatsApp de contacto general: enlace (https://wa.me/519XXXXXXXX) o solo el número. */
export const WHATSAPP_URL = contactLink(import.meta.env.VITE_WHATSAPP_URL);

/** Descarga de la app móvil (Play Store o APK). */
export const APP_URL = import.meta.env.VITE_APP_URL || '';

export const AIDER_URL = 'https://www.aider.com.pe';
