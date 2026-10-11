import { useTranslation } from 'react-i18next';

export default function RutasPage() {
  const { t } = useTranslation();
  return <h1 className="page-stub">{t('routes.title')}</h1>;
}
