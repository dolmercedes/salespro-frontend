import React from 'react';

interface PrintableViewProps<T> {
  data: T[];
  columns: {
    header: string;
    accessor: keyof T | string;
    isNumeric?: boolean;
    isCurrency?: boolean;
    isStatus?: boolean;
    render?: (item: T) => string | number;
  }[];
  filters: { [key: string]: string | string[] };
  title: string;
  onClose: () => void;
  summaryCards?: { [key: string]: string | number };
}

const formatCurrency = (value: any) => `₱${parseFloat(String(value).replace(/,/g, '')).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const PrintableView = <T extends object>({ data, columns, filters, title, onClose, summaryCards }: PrintableViewProps<T>) => {
  const activeFilters = Object.entries(filters)
    .filter(([, value]) => (Array.isArray(value) ? value.length > 0 : !!value));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" onClick={onClose} aria-modal="true" role="dialog">
      <div className="bg-white dark:bg-dark-bg w-11/12 max-w-7xl h-[90vh] rounded-lg shadow-2xl flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <header className="p-4 border-b dark:border-slate-700 flex justify-between items-center flex-shrink-0 no-print">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{title}</h2>
          <div>
            <button onClick={() => window.print()} className="p-2 mr-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors" title="Print">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            </button>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors" title="Close">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </header>
        <div id="printable-area" className="p-6 flex-grow overflow-y-auto">
           <style>{`
            @media print {
              body * {
                visibility: hidden;
              }
              .fixed.inset-0 {
                position: relative !important;
                background: none !important;
              }
              #printable-area, #printable-area * {
                visibility: visible;
              }
              #printable-area {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                height: auto;
                padding: 20px;
                margin: 0;
                overflow: visible;
              }
              .no-print {
                display: none !important;
              }
               .bg-white.dark\\:bg-dark-bg.w-11\\/12 {
                 box-shadow: none !important;
                 height: auto !important;
                 max-width: 100% !important;
                 width: 100% !important;
               }
            }
          `}</style>
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Applied Filters</h3>
            <div className="flex flex-wrap gap-2">
              {activeFilters.length > 0 ? activeFilters.map(([key, value]) => (
                <div key={key} className="bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200 text-sm font-medium px-3 py-1 rounded-full">
                  <span className="capitalize font-normal">{key}: </span>{Array.isArray(value) ? value.join(', ') : value}
                </div>
              )) : <p className="text-sm text-gray-500 dark:text-gray-400">No filters applied.</p>}
            </div>
          </div>

          {summaryCards && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {Object.entries(summaryCards).map(([label, value]) => (
                <div key={label} className="bg-gray-50 dark:bg-card-dark p-4 rounded-lg">
                  <h3 className="text-base font-semibold text-gray-600 dark:text-gray-300">{label}</h3>
                  <p className="text-2xl font-bold text-primary">{value}</p>
                </div>
              ))}
            </div>
          )}
          
          <div className="border dark:border-slate-700 rounded-lg overflow-hidden">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-100 dark:bg-slate-700">
                <tr>{columns.map(c => <th key={String(c.accessor)} scope="col" className={`px-2 py-1 text-xs ${c.isNumeric ? 'text-right' : ''}`}>{c.header}</th>)}</tr>
              </thead>
              <tbody>
                {data.length > 0 ? data.map((item, index) => (
                  <tr key={index} className="bg-white dark:bg-card-dark border-b last:border-b-0 dark:border-slate-700">
                    {columns.map(col => {
                      let content: any;
                      if (col.render) {
                        content = col.render(item);
                      } else {
                        content = item[col.accessor as keyof T] ?? '';
                      }
                      
                      if (col.isCurrency) content = formatCurrency(content);
                      if (col.isStatus) {
                        const status = String(content);
                        const colorClasses = status === 'Delivered' ? 'text-green-800 bg-green-100 dark:bg-green-900 dark:text-green-200' : status === 'Pending' ? 'text-amber-800 bg-amber-100 dark:bg-amber-900 dark:text-amber-200' : 'text-red-800 bg-red-100 dark:bg-red-900 dark:text-red-200';
                        return <td key={String(col.accessor)} className="px-2 py-1 text-xs text-center"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${colorClasses}`}>{status}</span></td>;
                      }
                      return <td key={String(col.accessor)} className={`px-2 py-1 text-xs font-medium text-gray-800 dark:text-gray-100 whitespace-normal break-words ${col.isNumeric ? 'text-right' : ''}`}>{content}</td>
                    })}
                  </tr>
                )) : <tr><td colSpan={columns.length} className="text-center py-10">No records found.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintableView;
