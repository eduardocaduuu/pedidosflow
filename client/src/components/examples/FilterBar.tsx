import FilterBar from '../FilterBar';
import type { FilterOptions } from '../FilterBar';

export default function FilterBarExample() {
  const handleFilterChange = (filters: FilterOptions) => {
    console.log('Filters changed:', filters);
  };

  return (
    <div className="p-6 max-w-6xl">
      <FilterBar onFilterChange={handleFilterChange} totalOrders={147} />
    </div>
  );
}