import React from 'react';

type IconType = 'sales' | 'user' | 'currency';
type ColorType = 'primary' | 'secondary' | 'warning' | 'danger';

interface StatCardProps {
  title: string;
  value: string;
  icon: IconType;
  color: ColorType;
}

// Fix: Changed JSX.Element to React.ReactElement to resolve issue with JSX namespace.
const icons: { [key in IconType]: React.ReactElement } = {
  sales: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
  user: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  currency: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>,
};

const colors: { [key in ColorType]: { bg: string; text: string } } = {
  primary: { bg: 'bg-indigo-100 dark:bg-indigo-900', text: 'text-primary' },
  secondary: { bg: 'bg-emerald-100 dark:bg-emerald-900', text: 'text-secondary' },
  warning: { bg: 'bg-amber-100 dark:bg-amber-900', text: 'text-warning' },
  danger: { bg: 'bg-red-100 dark:bg-red-900', text: 'text-danger' },
};

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
  return (
    <div className="bg-white dark:bg-card-dark p-6 rounded-xl shadow-md flex items-center transition-transform transform hover:scale-105 duration-300">
      <div className={`p-3 rounded-full mr-4 ${colors[color].bg} ${colors[color].text}`}>
        {icons[icon]}
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-semibold text-gray-800 dark:text-gray-100 truncate" title={value}>{value}</p>
      </div>
    </div>
  );
};

export default StatCard;