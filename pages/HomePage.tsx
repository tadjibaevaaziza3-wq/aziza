
import React, { useState, useEffect } from 'react';
import { getCategories, getFurnitureForCategory } from '../services/mockApi';
import { Category, FurnitureItem } from '../types';

const HomePage: React.FC = () => {
  const categories = getCategories();
  const [activeCategory, setActiveCategory] = useState<Category>(categories[0]);
  const [furniture, setFurniture] = useState<FurnitureItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFurniture = async () => {
      setLoading(true);
      try {
        const items = await getFurnitureForCategory(activeCategory);
        setFurniture(items);
      } catch (error) {
        console.error("Failed to fetch furniture:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFurniture();
  }, [activeCategory]);
  
  const CategoryTabs: React.FC = () => (
    <div className="mb-8 overflow-x-auto">
      <div className="flex space-x-2 border-b-2 border-brand-secondary pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 text-sm md:text-base font-semibold rounded-t-lg whitespace-nowrap transition-all duration-300 ${
              activeCategory === cat
                ? 'bg-brand-secondary text-brand-accent border-b-2 border-brand-accent'
                : 'text-brand-text hover:bg-brand-secondary/50 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );

  const FurnitureGrid: React.FC = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-brand-secondary rounded-lg p-4 animate-pulse">
              <div className="w-full h-48 bg-brand-primary rounded-md mb-4"></div>
              <div className="h-6 w-3/4 bg-brand-primary rounded-md mb-2"></div>
              <div className="h-4 w-1/4 bg-brand-primary rounded-md"></div>
            </div>
          ))}
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {furniture.map((item) => (
          <div key={item.id} className="bg-brand-secondary rounded-lg overflow-hidden shadow-lg transform hover:-translate-y-1 transition-transform duration-300 group">
            <img src={item.imageUrl} alt={item.name} className="w-full h-48 object-cover" />
            <div className="p-4">
              <h3 className="text-lg font-bold text-white mb-1">{item.name}</h3>
              <p className="text-brand-accent font-semibold text-xl">${item.basePrice.toFixed(2)}</p>
            </div>
             <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-white text-lg font-bold">Customize in Room</span>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div>
      <h1 className="text-4xl font-bold text-white mb-2">Our Collection</h1>
      <p className="text-brand-text mb-8">Discover furniture that defines your space.</p>
      <CategoryTabs />
      <FurnitureGrid />
    </div>
  );
};

export default HomePage;