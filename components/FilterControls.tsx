import React from 'react';
import MultiSelectDropdown from './MultiSelectDropdown';

interface FilterControlsProps {
  filters: {
    clients: string[];
    salesmen: string[];
    year: string;
  };
  onFilterChange: (newFilters: { clients: string[]; salesmen: string[]; year: string }) => void;
  options: {
    clients: string[];
    salesmen: string[];
    years: string[];
  };
}

const FilterControls: React.FC<FilterControlsProps> = ({ filters, onFilterChange, options }) => {
  const handleMultiSelectChange = (filterName: 'clients' | 'salesmen', value: string[]) => {
    onFilterChange({ ...filters, [filterName]: value });
  };

  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, year: event.target.value });
  };

  return (
    <div className="p-6 bg-white dark:bg-card-dark rounded-lg shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Client</label>
          <MultiSelectDropdown
            options={options.clients}
            selected={filters.clients}
            onChange={(selected) => handleMultiSelectChange('clients', selected)}
            label="Client"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Salesman</label>
          <MultiSelectDropdown
            options={options.salesmen}
            selected={filters.salesmen}
            onChange={(selected) => handleMultiSelectChange('salesmen', selected)}
            label="Salesman"
          />
        </div>
        <div>
          <label htmlFor="yearFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Year</label>
          <select
            id="yearFilter"
            value={filters.year}
            onChange={handleYearChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white dark:bg-slate-700 dark:text-gray-200"
          >
            <option value="">All Years</option>
            {options.years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default FilterControls;
