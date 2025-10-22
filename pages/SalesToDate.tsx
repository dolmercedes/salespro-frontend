import React, { useState, useEffect, useMemo } from 'react';
import { SalesOrder } from '../types';
import { API_BASE_URL } from '../constants';
import FilterControls from '../components/FilterControls';
import PrintableView from '../components/PrintableView';

const formatCurrency = (value: number) => `₱${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const SalesToDate: React.FC = () => {
  const [allRecords, setAllRecords] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPrintViewOpen, setPrintViewOpen] = useState(false);
  const [filters, setFilters] = useState({
    clients: [] as string[],
    salesmen: [] as string[],
    year: '',
  });

  useEffect(() => {
    const fetchSalesData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}?action=get_so_records`);
        if (!response.ok) throw new Error('Network response was not ok');
        const result = await response.json();
        if (result.success) {
          setAllRecords(result.data);
        } else {
          throw new Error(result.error || 'Failed to fetch sales data');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchSalesData();
  }, []);

  const filterOptions = useMemo(() => {
    const clients = [...new Set(allRecords.map(r => r.client))].sort();
    const salesmen = [...new Set(allRecords.map(r => r.salesman))].sort();
    const years = [...new Set(allRecords.map(r => new Date(r.date_so_approved).getFullYear().toString()))].sort((a,b) => Number(b) - Number(a));
    return { clients, salesmen, years };
  }, [allRecords]);

  const filteredRecords = useMemo(() => {
    return allRecords.filter(record => {
      const recordYear = new Date(record.date_so_approved).getFullYear().toString();
      const clientMatch = filters.clients.length === 0 || filters.clients.includes(record.client);
      const salesmanMatch = filters.salesmen.length === 0 || filters.salesmen.includes(record.salesman);
      const yearMatch = filters.year === '' || filters.year === recordYear;
      return clientMatch && salesmanMatch && yearMatch;
    });
  }, [allRecords, filters]);

  const summary = useMemo(() => {
    const totalSales = filteredRecords.reduce((acc, record) => acc + record.total_price, 0);
    const totalOrders = filteredRecords.length;
    return {
      'Total Sales': formatCurrency(totalSales),
      'Total Orders': totalOrders.toLocaleString(),
    };
  }, [filteredRecords]);

  const columns = [
    { header: 'SO Number', accessor: 'so_number' },
    { header: 'Date Approved', accessor: 'date_so_approved' },
    { header: 'Salesman', accessor: 'salesman' },
    { header: 'Client', accessor: 'client' },
    { header: 'Total Price', accessor: 'total_price', isNumeric: true, isCurrency: true },
    { header: 'Status', accessor: 'status', isStatus: true },
  ];

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div></div>;
  if (error) return <div className="p-4 rounded-md bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200">{`Error: ${error}`}</div>;
  
  return (
    <>
      <div className="space-y-6">
        <FilterControls filters={filters} onFilterChange={setFilters} options={filterOptions} />
        
        <div className="bg-white dark:bg-card-dark p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Sales Report</h2>
            <button onClick={() => setPrintViewOpen(true)} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
              Print Report
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-100 dark:bg-slate-700 p-4 rounded-md">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Sales</p>
                <p className="text-2xl font-bold text-primary">{summary['Total Sales']}</p>
            </div>
            <div className="bg-gray-100 dark:bg-slate-700 p-4 rounded-md">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Orders</p>
                <p className="text-2xl font-bold text-primary">{summary['Total Orders']}</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-slate-700">
                <tr>
                  {columns.map(col => <th key={col.accessor} scope="col" className="px-4 py-3">{col.header}</th>)}
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length > 0 ? filteredRecords.map((record) => (
                  <tr key={record.id} className="bg-white dark:bg-card-dark border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800">
                    <td className="px-4 py-3">{record.so_number}</td>
                    <td className="px-4 py-3">{record.date_so_approved}</td>
                    <td className="px-4 py-3">{record.salesman}</td>
                    <td className="px-4 py-3">{record.client}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(record.total_price)}</td>
                    <td className="px-4 py-3">{record.status}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={columns.length} className="text-center py-10">No records found for the selected filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {isPrintViewOpen && (
        <PrintableView
          data={filteredRecords}
          columns={columns}
          filters={{
            Clients: filters.clients.join(', ') || 'All',
            Salesmen: filters.salesmen.join(', ') || 'All',
            Year: filters.year || 'All'
          }}
          title="Sales to Date Report"
          onClose={() => setPrintViewOpen(false)}
          summaryCards={summary}
        />
      )}
    </>
  );
};

export default SalesToDate;
