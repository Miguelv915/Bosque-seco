import { features } from '../../../config/features';

/** Clave de texto del flujo de cambios: con aprobación o de publicación directa. */
export const copy = (key) => (features.approvals ? key : `${key}Direct`);
