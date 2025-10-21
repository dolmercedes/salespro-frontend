import React, { useState, useEffect, useContext } from 'react';
import Dashboard from './pages/Dashboard';
import SORecords from './pages/SORecords';
import SalesToDate from './pages/SalesToDate';
import AddSO from './pages/AddSO';
import { ThemeContext } from './contexts/ThemeContext';

const pages: { [key: string]: React.ComponentType } = {
  '': Dashboard,
  '#dashboard': Dashboard,
  '#so-records': SORecords,
  '#sales-to-date': SalesToDate,
  '#add-so': AddSO,
};

const App: React.FC = () => {
  const [activePage, setActivePage] = useState(window.location.hash || '#dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { theme, toggleTheme } = useContext(ThemeContext);

  useEffect(() => {
    const handleHashChange = () => {
      setActivePage(window.location.hash || '#dashboard');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const PageComponent = pages[activePage] || Dashboard;

  const navLinks = [
    { href: '#dashboard', icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>, label: 'Dashboard' },
    { href: '#so-records', icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>, label: 'SO Records' },
    { href: '#sales-to-date', icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>, label: 'Sales to Date' },
    { href: '#add-so', icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>, label: 'Add SO Approved' },
  ];
  
  const getPageTitle = () => {
    const currentLink = navLinks.find(link => link.href === activePage);
    return currentLink ? currentLink.label : 'Dashboard';
  };

  const getLinkClasses = (href: string) => {
    const isActive = activePage === href;
    const baseClasses = 'flex items-center px-4 py-2 mt-2 transition-colors duration-300 transform rounded-lg';
    const activeClasses = 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-200';
    const inactiveClasses = 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700 hover:text-gray-700 dark:hover:text-gray-200';
    return `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;
  };

  return (
    <div className="relative min-h-screen font-sans">
      <aside className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col transform bg-white dark:bg-card-dark transition-transform duration-300 ease-in-out border-r dark:border-slate-700 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 shrink-0 items-center justify-center border-b dark:border-slate-700">
          <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span className="ml-2 text-xl font-bold text-gray-800 dark:text-gray-200">SalesPro</span>
        </div>
        <div className="flex flex-col flex-grow overflow-y-auto p-4">
          <nav>
            {navLinks.map(link => (
              <a key={link.href} href={link.href} className={getLinkClasses(link.href)} onClick={() => setSidebarOpen(false)}>
                {link.icon}
                <span className="mx-4 font-medium">{link.label}</span>
              </a>
            ))}
          </nav>
          <div className="mt-auto">
            <div className="flex items-center justify-between p-4 border-t dark:border-slate-700">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Dark Mode</span>
              <button onClick={toggleTheme} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-dark-bg ${theme === 'dark' ? 'bg-primary' : 'bg-gray-300'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`}></span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {isSidebarOpen && <div className="fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity duration-300" onClick={() => setSidebarOpen(false)}></div>}
      
      <div className="flex flex-col">
        <header className="flex items-center p-4 bg-white dark:bg-card-dark border-b dark:border-slate-700 sticky top-0 z-10">
           <button onClick={() => setSidebarOpen(true)} className="p-2 mr-2 text-gray-600 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200">{getPageTitle()}</h1>
        </header>
        <main className="flex-1 p-6 sm:p-10">
          <PageComponent />
        </main>
      </div>
    </div>
  );
};

export default App;
