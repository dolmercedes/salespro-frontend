import React, { useState, useEffect, useMemo } from 'react';
import { API_BASE_URL } from '../constants';
import { SalesOrder } from '../types';
import FilterControls from '../components/FilterControls';
import PrintableView from '../components/PrintableView';

type SortConfig = {
  key: keyof SalesOrder;
  direction: 'ascending' | 'descending';
};

type ColumnDefinition = {
  header: string;
  accessor: keyof SalesOrder | string;
  sortable?: boolean;
  isNumeric?: boolean;
  isCurrency?: boolean;
  isStatus?: boolean;
  render?: (record: SalesOrder) => string | number;
};


const SORecords: React.FC = () => {
  const [records, setRecords] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({ clients: [], salesmen: [], year: new Date().getFullYear().toString() });
  const [options, setOptions] = useState({ clients: [], salesmen: [], years: [] });
  const [sortConfig, setSortConfig] = useState<SortConfig | null>({ key: 'date_so_approved', direction: 'descending' });
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(15);
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}?action=get_so_records`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        if (result.success) {
          setRecords(result.data.records);
          setOptions(result.data.options);
        } else {
          throw new Error(result.error || 'Failed to fetch SO records.');
        }
      } catch (e) {
        if (e instanceof Error) setError(`Error loading data: ${e.message}`);
        else setError('An unknown error occurred.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      const yearMatch = filters.year ? new Date(record.date_so_approved).getFullYear().toString() === filters.year : true;
      const clientMatch = filters.clients.length > 0 ? filters.clients.includes(record.client) : true;
      const salesmanMatch = filters.salesmen.length > 0 ? filters.salesmen.includes(record.salesman) : true;
      return yearMatch && clientMatch && salesmanMatch;
    });
  }, [records, filters]);

  const sortedRecords = useMemo(() => {
    let sortableItems = [...filteredRecords];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];
        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;
        if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filteredRecords, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(sortedRecords.length / recordsPerPage));
  const currentRecords = sortedRecords.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);
  
  const requestSort = (key: keyof SalesOrder) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };
  
  const getSortIndicator = (key: keyof SalesOrder) => {
    if (!sortConfig || sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? '▲' : '▼';
  };

  const columns: ColumnDefinition[] = [
    { header: 'SALESMAN', accessor: 'salesman', sortable: true },
    { header: 'DATE S.O. APPROVED', accessor: 'date_so_approved', sortable: true },
    { header: 'CLIENT', accessor: 'client', sortable: true },
    { header: 'PRODUCT TYPE', accessor: 'product_type', sortable: true },
    { header: 'ITEM DESCRIPTION', accessor: 'item_description', sortable: true },
    { header: 'QUANTITY', accessor: 'quantity', isNumeric: true, sortable: true },
    { header: 'UOM', accessor: 'uom', sortable: true },
    { header: 'GROSS PRICE', accessor: 'gross_price', isNumeric: true, isCurrency: true, sortable: true },
    { header: 'TOTAL NET AMOUNT', accessor: 'total_price', isNumeric: true, isCurrency: true, sortable: true },
    { header: 'STATUS', accessor: 'status', isStatus: true, sortable: true },
    { header: 'REMARKS', accessor: 'remarks', sortable: true },
    { header: 'DELIVERY DATE', accessor: 'delivery_date', sortable: true },
    { header: 'DATE S.O. APPROVED (MONTH)', accessor: 'date_so_approved_month', sortable: false, render: (record: SalesOrder) => new Date(record.date_so_approved).toLocaleString('default', { month: 'long' }) },
    { header: 'DELIVER YEAR', accessor: 'delivery_year', sortable: false, render: (record: SalesOrder) => record.delivery_date ? new Date(record.delivery_date).getFullYear().toString() : '' },
    { header: 'TOTAL GROSS AMOUNT', accessor: 'total_gross_amount', sortable: false, isNumeric: true, isCurrency: true, render: (record: SalesOrder) => record.quantity * record.gross_price },
  ];

  if (loading) return <div className="text-center p-10">Loading SO Records...</div>;
  if (error) return <div className="text-center p-10 text-red-500">{error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Sales Order Records</h1>
        <button onClick={() => setIsPrinting(true)} className="px-4 py-2 bg-primary text-white rounded-lg shadow hover:bg-indigo-700 transition">Print View</button>
      </div>

      <FilterControls filters={filters} onFilterChange={setFilters} options={options} />

      <div className="mt-6 bg-white dark:bg-card-dark rounded-lg shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-slate-700">
              <tr>
                {columns.map(col => (
                  <th key={String(col.accessor)} scope="col" className={`px-6 py-3 whitespace-nowrap ${col.sortable ? 'cursor-pointer' : ''}`} onClick={() => col.sortable && requestSort(col.accessor as keyof SalesOrder)}>
                    {col.header} {col.sortable && getSortIndicator(col.accessor as keyof SalesOrder)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentRecords.map((record) => (
                <tr key={record.id} className="bg-white dark:bg-card-dark border-b last:border-b-0 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800">
                  {columns.map(col => {
                    let content: any;
                    if (col.render) {
                        content = col.render(record);
                    } else {
                        content = record[col.accessor as keyof SalesOrder] ?? '';
                    }

                    if (col.isCurrency) content = `₱${parseFloat(String(content)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                    if (col.isStatus) return <td key={String(col.accessor)} className="px-6 py-4 text-center"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${content === 'Delivered' ? 'text-green-800 bg-green-100 dark:bg-green-900 dark:text-green-200' : content === 'Pending' ? 'text-amber-800 bg-amber-100 dark:bg-amber-900 dark:text-amber-200' : 'text-red-800 bg-red-100 dark:bg-red-900 dark:text-red-200'}`}>{content}</span></td>;
                    return <td key={String(col.accessor)} className={`px-6 py-4 ${col.isNumeric ? 'text-right' : ''}`}>{content}</td>;
                  })}
                </tr>
              ))}
              {currentRecords.length === 0 && (
                <tr><td colSpan={columns.length} className="text-center py-10">No records match the current filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {sortedRecords.length > 0 && (
          <div className="p-4 flex justify-between items-center border-t dark:border-slate-700 flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <label htmlFor="recordsPerPage" className="text-sm font-medium text-gray-700 dark:text-gray-400">Rows:</label>
              <select
                id="recordsPerPage"
                value={recordsPerPage}
                onChange={(e) => {
                  setRecordsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white dark:bg-slate-700 dark:text-gray-200"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
            <span className="text-sm text-gray-700 dark:text-gray-400">
              Page {currentPage} of {totalPages} ({sortedRecords.length} records)
            </span>
            <div className="flex items-center">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 border rounded-md mr-2 disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
            </div>
          </div>
        )}
      </div>

      {isPrinting && (
        <PrintableView
          data={sortedRecords}
          columns={columns}
          filters={filters}
          title="Sales Order Records"
          onClose={() => setIsPrinting(false)}
        />
      )}
    </div>
  );
};

export default SORecords;