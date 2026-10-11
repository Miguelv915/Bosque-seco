import { useTranslation } from 'react-i18next';

export default function LugaresPage() {
  const { t } = useTranslation();
  return <h1 className="page-stub">{t('places.title')}</h1>;
}
