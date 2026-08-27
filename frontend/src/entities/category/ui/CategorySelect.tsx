import { useCategories } from '../api/useCategories';
import { useLocale } from '../../../shared/lib/i18n/LocaleContext';
import './CategorySelect.css';

interface CategorySelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function CategorySelect({ value, onChange }: CategorySelectProps) {
  const { data: categories } = useCategories();
  const { t } = useLocale();

  return (
    <label className="category-select">
      {t('field.category')}
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">{t('field.categoryDefault')}</option>
        {categories?.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    </label>
  );
}
