import React, { useState, useEffect, useContext } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import StatCard from '../components/StatCard';
import { ThemeContext } from '../contexts/ThemeContext';
import { API_BASE_URL } from '../constants';

interface MonthlySale {
  name: string;
  sales: number;
}
interface ClientsPerSalesman {
  name: string;
  value: number;
}
interface TopSalesman {
    name: string;
    sales: number;
}

const Dashboard: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState({
        totalSales: '₱0.00',
        newSOsThisMonth: 0,
        activeClients: 0,
        totalOrders: 0,
    });
    const [monthlySales, setMonthlySales] = useState<MonthlySale[]>([]);
    const [clientsPerSalesman, setClientsPerSalesman] = useState<ClientsPerSalesman[]>([]);
    const [topSalesmen, setTopSalesmen] = useState<TopSalesman[]>([]);
    const { theme } = useContext(ThemeContext);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}?action=get_dashboard_data`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const result = await response.json();
                if (result.success) {
                    setStats(result.data.stats);
                    setMonthlySales(result.data.monthlySales);
                    setClientsPerSalesman(result.data.clientsPerSalesman);
                    setTopSalesmen(result.data.topSalesmen);
                } else {
                    throw new Error(result.error || 'Failed to fetch data from API.');
                }
            } catch (e) {
                if (e instanceof Error) {
                    setError(`Error loading dashboard data: ${e.message}`);
                } else {
                    setError('An unknown error occurred.');
                }
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#34d399', '#fbbf24', '#f87171'];
    const tickColor = theme === 'dark' ? '#94a3b8' : '#6b7280';
    
    if (loading) return <div className="text-center p-10">Loading Dashboard...</div>;
    if (error) return <div className="text-center p-10 text-red-500">{error}</div>;

    return (
    <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Total Sales (YTD)" value={stats.totalSales} icon="currency" color="primary" />
            <StatCard title="New SOs This Month" value={String(stats.newSOsThisMonth)} icon="sales" color="secondary" />
            <StatCard title="Active Clients (YTD)" value={String(stats.activeClients)} icon="user" color="warning" />
            <StatCard title="Total Orders (YTD)" value={String(stats.totalOrders)} icon="sales" color="danger" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
            <div className="bg-white dark:bg-card-dark p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Monthly Sales Overview</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlySales}>
                        <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#334155' : '#e5e7eb'} />
                        <XAxis dataKey="name" stroke={tickColor} />
                        <YAxis stroke={tickColor} tickFormatter={(value) => `₱${(Number(value)/1000).toLocaleString()}k`} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
                                border: `1px solid ${theme === 'dark' ? '#334155' : '#e5e7eb'}`
                            }}
                            cursor={{ fill: theme === 'dark' ? 'rgba(148, 163, 184, 0.1)' : 'rgba(229, 231, 235, 0.4)' }}
                            formatter={(value) => [`₱${Number(value).toLocaleString()}`, 'Sales']}
                        />
                        <Bar dataKey="sales" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
             <div className="bg-white dark:bg-card-dark p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Clients per Salesman</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={clientsPerSalesman}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={(entry) => `${entry.name}: ${entry.value}`}
                        >
                            {clientsPerSalesman.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                         <Tooltip
                            contentStyle={{
                                backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
                                border: `1px solid ${theme === 'dark' ? '#334155' : '#e5e7eb'}`
                            }}
                            formatter={(value, name) => [`${value} clients`, name]}
                        />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>

        <div className="mt-10 bg-white dark:bg-card-dark p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Top 5 Salesmen by Sales (YTD)</h2>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={topSalesmen}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#334155' : '#e5e7eb'} />
                    <XAxis dataKey="name" stroke={tickColor} />
                    <YAxis stroke={tickColor} tickFormatter={(value) => `₱${(Number(value)/1000).toLocaleString()}k`} />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
                            border: `1px solid ${theme === 'dark' ? '#334155' : '#e5e7eb'}`
                        }}
                        formatter={(value) => [`₱${Number(value).toLocaleString()}`, 'Total Sales']}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={2} activeDot={{ r: 8 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    </div>
    );
};

export default Dashboard;
