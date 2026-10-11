import { useTranslation } from 'react-i18next';
import { HeartHandshake, MessageCircle, Users, WifiOff } from 'lucide-react';
import styles from './Highlights.module.css';

const ITEMS = [
  { key: 'guides', Icon: Users },
  { key: 'offline', Icon: WifiOff },
  { key: 'direct', Icon: MessageCircle },
  { key: 'impact', Icon: HeartHandshake },
];

/** Franja de beneficios para el turista, justo debajo del hero. */
export default function Highlights() {
  const { t } = useTranslation();

  return (
    <section className={styles.section} aria-label={t('highlights.label')}>
      <ul className={styles.list}>
        {ITEMS.map(({ key, Icon }) => (
          <li key={key} className={styles.item}>
            <span className={styles.icon} aria-hidden="true">
              <Icon size={22} />
            </span>
            <div>
              <h2 className={styles.title}>{t(`highlights.${key}.title`)}</h2>
              <p className={styles.text}>{t(`highlights.${key}.text`)}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
