import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { useTranslation } from 'react-i18next';
import { pointQrText } from '../lib/qr';
import styles from '../admin.module.css';

/** Vista previa del QR del cartel de un punto, con descarga en PNG. */
export default function QrPreview({ code, name }) {
  const { t } = useTranslation();
  const [dataUrl, setDataUrl] = useState(null);
  const text = pointQrText(code);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(text, { width: 480, margin: 2, errorCorrectionLevel: 'M' })
      .then((url) => !cancelled && setDataUrl(url))
      .catch(() => !cancelled && setDataUrl(null));
    return () => {
      cancelled = true;
    };
  }, [text]);

  if (!dataUrl) return null;

  return (
    <figure className={styles.qr}>
      <img src={dataUrl} width={160} height={160} alt={t('admin.qr.alt', { code })} />
      <figcaption>
        <strong>{name || code}</strong>
        <code>{text}</code>
        <a className={styles.secondary} href={dataUrl} download={`qr-${code}.png`}>
          {t('admin.qr.download')}
        </a>
      </figcaption>
    </figure>
  );
}
