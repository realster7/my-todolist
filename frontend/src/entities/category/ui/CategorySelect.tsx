import { useCategories } from '../api/useCategories';
import './CategorySelect.css';

interface CategorySelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function CategorySelect({ value, onChange }: CategorySelectProps) {
  const { data: categories } = useCategories();

  return (
    <label className="category-select">
      카테고리
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">기본 (자동 지정)</option>
        {categories?.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    </label>
  );
}
