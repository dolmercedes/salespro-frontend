import React, { useState, useEffect, useMemo } from 'react';
import { API_BASE_URL } from '../constants';
import { SalesOrder } from '../types';
import FilterControls from '../components/FilterControls';
import PrintableView from '../components/PrintableView';

type GroupedSales = {
  name: string;
  totalSales: number;
  orderCount: number;
};

const SalesToDate: React.FC = () => {
  const [records, setRecords] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({ clients: [], salesmen: [], year: new Date().getFullYear().toString() });
  const [options, setOptions] = useState({ clients: [], salesmen: [], years: [] });
  const [groupBy, setGroupBy] = useState<'salesman' | 'client'>('salesman');
  const [isPrinting, setIsPrinting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(15);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}?action=get_so_records`);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
        }
        
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            const responseText = await response.text();
            console.error("Received non-JSON response:", responseText);
            throw new TypeError(`Expected JSON, but got ${contentType}. Response body: ${responseText.substring(0, 500)}...`);
        }

        const result = await response.json();
        if (result.success) {
          setRecords(result.data.records);
          setOptions(result.data.options);
        } else {
          throw new Error(result.error || 'Failed to fetch sales data.');
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

  const { groupedData, totalSales, totalOrders } = useMemo(() => {
    const filtered = records.filter(record => {
      const yearMatch = filters.year ? new Date(record.date_so_approved).getFullYear().toString() === filters.year : true;
      const clientMatch = filters.clients.length > 0 ? filters.clients.includes(record.client) : true;
      const salesmanMatch = filters.salesmen.length > 0 ? filters.salesmen.includes(record.salesman) : true;
      return yearMatch && clientMatch && salesmanMatch;
    });

    const totalSales = filtered.reduce((acc, curr) => acc + curr.total_price, 0);
    const totalOrders = filtered.length;

    const grouped = filtered.reduce<Record<string, { totalSales: number, orderCount: number }>>((acc, record) => {
      const key = record[groupBy];
      if (!acc[key]) {
        acc[key] = { totalSales: 0, orderCount: 0 };
      }
      acc[key].totalSales += record.total_price;
      acc[key].orderCount += 1;
      return acc;
    }, {});
    
    const groupedData = Object.entries(grouped)
      // Fix: Replaced spread operator with explicit properties to resolve the error.
      .map(([name, data]) => ({ name, totalSales: data.totalSales, orderCount: data.orderCount }))
      .sort((a, b) => b.totalSales - a.totalSales);

    return { groupedData, totalSales, totalOrders };
  }, [records, filters, groupBy]);
  
  const totalPages = Math.max(1, Math.ceil(groupedData.length / recordsPerPage));
  const currentGroupedData = groupedData.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);

  const formatCurrency = (value: number) => `₱${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const columns = [
    { header: groupBy === 'salesman' ? 'Salesman' : 'Client', accessor: 'name' as keyof GroupedSales },
    { header: 'Total Sales', accessor: 'totalSales' as keyof GroupedSales, isNumeric: true, isCurrency: true },
    { header: 'Total Orders', accessor: 'orderCount' as keyof GroupedSales, isNumeric: true },
  ];

  if (loading) return <div className="text-center p-10">Loading Sales Data...</div>;
  if (error) return <div className="text-center p-10 text-red-500 bg-red-100 dark:bg-red-900 dark:text-red-200 rounded-lg">{error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Sales to Date</h1>
        <button onClick={() => setIsPrinting(true)} className="px-4 py-2 bg-primary text-white rounded-lg shadow hover:bg-indigo-700 transition">Print View</button>
      </div>
      
      <FilterControls filters={filters} onFilterChange={setFilters} options={options} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="bg-white dark:bg-card-dark p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300">Total Sales</h3>
            <p className="text-3xl font-bold text-primary">{formatCurrency(totalSales)}</p>
          </div>
          <div className="bg-white dark:bg-card-dark p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300">Total Orders</h3>
            <p className="text-3xl font-bold text-secondary">{totalOrders.toLocaleString()}</p>
          </div>
      </div>

      <div className="mt-6 bg-white dark:bg-card-dark rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b dark:border-slate-700 flex justify-end items-center">
            <span className="mr-4 text-sm font-medium text-gray-700 dark:text-gray-300">Group by:</span>
            <div className="flex rounded-md shadow-sm">
                <button onClick={() => setGroupBy('salesman')} className={`px-4 py-2 text-sm font-medium rounded-l-md ${groupBy === 'salesman' ? 'bg-primary text-white' : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-600'}`}>Salesman</button>
                <button onClick={() => setGroupBy('client')} className={`-ml-px px-4 py-2 text-sm font-medium rounded-r-md ${groupBy === 'client' ? 'bg-primary text-white' : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-600'}`}>Client</button>
            </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-slate-700">
              <tr>
                {columns.map(col => (
                    <th key={String(col.accessor)} scope="col" className={`px-6 py-3 ${col.isNumeric ? 'text-right' : ''}`}>{col.header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentGroupedData.map((item, index) => (
                <tr key={index} className="bg-white dark:bg-card-dark border-b last:border-b-0 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">{item.name}</td>
                  <td className="px-6 py-4 text-right">{formatCurrency(item.totalSales)}</td>
                  <td className="px-6 py-4 text-right">{item.orderCount.toLocaleString()}</td>
                </tr>
              ))}
              {groupedData.length === 0 && (
                <tr><td colSpan={columns.length} className="text-center py-10">No data available for the current filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
         {groupedData.length > 0 && (
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
              Page {currentPage} of {totalPages} ({groupedData.length} records)
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
          data={groupedData}
          columns={columns}
          filters={filters}
          title={`Sales to Date - Grouped by ${groupBy}`}
          onClose={() => setIsPrinting(false)}
          summaryCards={{ "Total Sales": formatCurrency(totalSales), "Total Orders": totalOrders }}
        />
      )}
    </div>
  );
};

export default SalesToDate;