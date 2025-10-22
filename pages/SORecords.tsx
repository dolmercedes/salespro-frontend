import React, { useState, useEffect, useMemo } from 'react';
import { SalesOrder } from '../types';
import { API_BASE_URL } from '../constants';
import PrintableView from '../components/PrintableView';

const formatCurrency = (value: number) => `₱${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const SORecords: React.FC = () => {
  const [soRecords, setSoRecords] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof SalesOrder; direction: 'ascending' | 'descending' } | null>(null);
  const [isPrintViewOpen, setPrintViewOpen] = useState(false);

  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}?action=get_so_records`);
        if (!response.ok) throw new Error('Network response was not ok');
        const result = await response.json();
        if (result.success) {
          setSoRecords(result.data);
        } else {
          throw new Error(result.error || 'Failed to fetch SO records');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, []);

  const filteredRecords = useMemo(() => {
    let records = [...soRecords];
    if (searchTerm) {
      records = records.filter(record =>
        Object.values(record).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    return records;
  }, [soRecords, searchTerm]);
  
  const sortedRecords = useMemo(() => {
    let sortableRecords = [...filteredRecords];
    if (sortConfig !== null) {
      sortableRecords.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableRecords;
  }, [filteredRecords, sortConfig]);

  const requestSort = (key: keyof SalesOrder) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const getSortIcon = (key: keyof SalesOrder) => {
    if (!sortConfig || sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? ' ▲' : ' ▼';
  };
  
  const StatusBadge = ({ status }: { status: 'Pending' | 'Delivered' | 'Cancelled' }) => {
    const colorClasses = status === 'Delivered' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                         status === 'Pending' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' :
                         'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colorClasses}`}>{status}</span>;
  };
  
  const columns = [
      { header: 'SO Number', accessor: 'so_number' },
      { header: 'Date Approved', accessor: 'date_so_approved' },
      { header: 'Salesman', accessor: 'salesman' },
      { header: 'Client', accessor: 'client' },
      { header: 'Item', accessor: 'item_description' },
      { header: 'Qty', accessor: 'quantity', isNumeric: true },
      { header: 'UOM', accessor: 'uom' },
      { header: 'Total Price', accessor: 'total_price', isNumeric: true, isCurrency: true },
      { header: 'Status', accessor: 'status', isStatus: true },
  ];

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div></div>;
  if (error) return <div className="p-4 rounded-md bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200">{`Error: ${error}`}</div>;

  return (
    <>
      <div className="bg-white dark:bg-card-dark p-6 rounded-lg shadow-md space-y-4">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-slate-700 w-full sm:w-64"
            />
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
          </div>
          <button onClick={() => setPrintViewOpen(true)} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            Print
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-slate-700">
              <tr>
                {columns.map(col => (
                  <th key={col.accessor} scope="col" className="px-4 py-3 cursor-pointer" onClick={() => requestSort(col.accessor as keyof SalesOrder)}>
                    {col.header}{getSortIcon(col.accessor as keyof SalesOrder)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedRecords.length > 0 ? sortedRecords.map((record) => (
                <tr key={record.id} className="bg-white dark:bg-card-dark border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800">
                  {columns.map(col => (
                    <td key={col.accessor} className={`px-4 py-3 font-medium text-gray-900 dark:text-white ${col.isNumeric ? 'text-right' : ''}`}>
                      {col.isStatus ? <StatusBadge status={record.status} /> :
                       col.isCurrency ? formatCurrency(record[col.accessor as keyof SalesOrder] as number) :
                       String(record[col.accessor as keyof SalesOrder])}
                    </td>
                  ))}
                </tr>
              )) : (
                <tr>
                  <td colSpan={columns.length} className="text-center py-10">No records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {isPrintViewOpen && (
        <PrintableView
          data={sortedRecords}
          columns={columns}
          filters={{ search: searchTerm }}
          title="Sales Order Records"
          onClose={() => setPrintViewOpen(false)}
        />
      )}
    </>
  );
};

export default SORecords;
