import { humanizeCategory } from '../../data/catalog';

interface CategoryTabsProps {
  categories: string[];
  active: string | null;
  onChange: (category: string | null) => void;
}

export function CategoryTabs({
  categories,
  active,
  onChange,
}: CategoryTabsProps) {
  return (
    <div className='category-tabs'>
      <button
        className={`pill${active === null ? ' active' : ''}`}
        onClick={() => onChange(null)}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          className={`pill${active === cat ? ' active' : ''}`}
          onClick={() => onChange(cat)}
        >
          {humanizeCategory(cat)}
        </button>
      ))}
    </div>
  );
}
