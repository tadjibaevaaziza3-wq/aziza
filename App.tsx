
import React, { useState } from 'react';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import RoomBuilderPage from './pages/RoomBuilderPage';
import AccountPage from './pages/AccountPage';
import AdminPage from './pages/AdminPage';

export type Page = 'home' | 'builder' | 'account' | 'admin';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'builder':
        return <RoomBuilderPage />;
      case 'account':
        return <AccountPage />;
      case 'admin':
        return <AdminPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage}
      />
      <main className="flex-grow container mx-auto px-4 py-8">
        {renderPage()}
      </main>
    </div>
  );
};

export default App;