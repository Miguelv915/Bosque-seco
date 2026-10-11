// Prefijo del texto que lleva el QR impreso en cada cartel.
// La app móvil lo reconoce con el mismo valor: cambiarlo implica reimprimir carteles.
export const QR_PREFIX = 'ecorumbo:punto:';

export const pointQrText = (code) => `${QR_PREFIX}${code}`;
