
import React from 'react';
import { Page } from '../App';
import { BuildingStorefrontIcon, CubeTransparentIcon, UserCircleIcon, Cog6ToothIcon } from './icons';

interface HeaderProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}

const Header: React.FC<HeaderProps> = ({ currentPage, setCurrentPage }) => {
  const navItemClass = (page: Page) =>
    `flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
      currentPage === page
        ? 'bg-brand-accent text-white'
        : 'text-brand-text hover:bg-brand-secondary hover:text-brand-light'
    }`;

  return (
    <header className="bg-brand-primary/80 backdrop-blur-sm sticky top-0 z-50 border-b border-brand-secondary">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setCurrentPage('home')}>
             <CubeTransparentIcon className="h-8 w-8 text-brand-accent" />
            <span className="text-xl font-bold text-white">IntelliCASA</span>
          </div>
          <nav className="hidden md:flex items-center space-x-2 bg-brand-secondary/50 p-1 rounded-lg">
            <button onClick={() => setCurrentPage('home')} className={navItemClass('home')}>
              <BuildingStorefrontIcon className="h-5 w-5 mr-2" />
              Shop
            </button>
            <button onClick={() => setCurrentPage('builder')} className={navItemClass('builder')}>
              <CubeTransparentIcon className="h-5 w-5 mr-2" />
              Room Builder
            </button>
          </nav>
          <div className="flex items-center space-x-1">
             <button onClick={() => setCurrentPage('admin')} className={navItemClass('admin')}>
                <Cog6ToothIcon className="h-6 w-6"/>
            </button>
            <button onClick={() => setCurrentPage('account')} className={navItemClass('account')}>
                <UserCircleIcon className="h-6 w-6"/>
            </button>
          </div>
        </div>
      </div>
       <nav className="md:hidden flex items-center justify-around space-x-1 bg-brand-secondary/50 p-2">
            <button onClick={() => setCurrentPage('home')} className={`${navItemClass('home')} flex-1 justify-center`}>
              <BuildingStorefrontIcon className="h-5 w-5 md:mr-2" />
              <span className="ml-2 md:ml-0">Shop</span>
            </button>
            <button onClick={() => setCurrentPage('builder')} className={`${navItemClass('builder')} flex-1 justify-center`}>
              <CubeTransparentIcon className="h-5 w-5 md:mr-2" />
              <span className="ml-2 md:ml-0">Room Builder</span>
            </button>
        </nav>
    </header>
  );
};

export default Header;