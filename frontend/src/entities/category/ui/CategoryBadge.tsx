import './CategoryBadge.css';

export function CategoryBadge({ name }: { name: string }) {
  return <span className="category-badge">{name}</span>;
}
