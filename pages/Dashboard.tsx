import React, { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import { SalesData } from '../types';
import { API_BASE_URL } from '../constants';

const formatCurrency = (value: number) => `₱${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const Dashboard: React.FC = () => {
  const [data, setData] = useState<SalesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}?action=get_dashboard_data`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const result = await response.json();
        if (result.success) {
          setData(result.data);
        } else {
          throw new Error(result.error || 'Failed to fetch data');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 rounded-md bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200">{`Error: ${error}`}</div>;
  }

  if (!data) {
    return <div className="text-center text-gray-500">No data available.</div>;
  }

  const BarChart = ({ title, data, dataKey, nameKey }: { title: string, data: any[], dataKey: string, nameKey: string }) => {
    const maxValue = data.length > 0 ? Math.max(...data.map(item => item[dataKey])) : 0;
    return (
      <div className="bg-white dark:bg-card-dark p-6 rounded-xl shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">{title}</h3>
        <div className="space-y-4">
          {data.map(item => (
            <div key={item[nameKey]} className="flex items-center">
              <span className="w-1/4 text-sm text-gray-600 dark:text-gray-400 truncate pr-2" title={item[nameKey]}>{item[nameKey]}</span>
              <div className="w-3/4 bg-gray-200 dark:bg-slate-700 rounded-full h-6">
                <div
                  className="bg-primary h-6 rounded-full flex items-center justify-end px-2"
                  style={{ width: `${maxValue > 0 ? (item[dataKey] / maxValue) * 100 : 0}%` }}
                >
                  <span className="text-xs font-medium text-white">{formatCurrency(item[dataKey])}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Sales" value={formatCurrency(data.totalSales)} icon="currency" color="primary" />
        <StatCard title="Total Orders" value={data.totalOrders.toLocaleString()} icon="sales" color="secondary" />
        <StatCard title="Top Salesman" value={data.salesBySalesman[0]?.name || 'N/A'} icon="user" color="warning" />
        <StatCard title="Top Client" value={data.salesByClient[0]?.name || 'N/A'} icon="user" color="danger" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <BarChart title="Sales by Salesman" data={data.salesBySalesman} nameKey="name" dataKey="sales" />
        <BarChart title="Sales by Client" data={data.salesByClient} nameKey="name" dataKey="sales" />
      </div>
    </div>
  );
};

export default Dashboard;
