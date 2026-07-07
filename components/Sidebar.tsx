import React from 'react';
import { Plus, Search, ChevronRight } from 'lucide-react';
import { CategoryCount } from '../types';

interface SidebarProps {
  categories: CategoryCount[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  onOpenCreateModal: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isMobileOpen: boolean;
  closeMobileSidebar: () => void;
  connectionStatus: 'connecting' | 'connected' | 'error';
}

const Sidebar: React.FC<SidebarProps> = ({ 
  categories, 
  selectedCategory, 
  onSelectCategory,
  onOpenCreateModal,
  searchQuery,
  onSearchChange,
  isMobileOpen,
  closeMobileSidebar,
  connectionStatus
}) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 left-0 z-50 h-screen w-72 
        bg-white
        border-r border-gray-200
        flex flex-col transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header / Logo */}
        <div className="px-8 py-10 flex items-center gap-3">
          <div className="flex flex-wrap w-8 h-8 rounded-lg overflow-hidden border border-gray-100 shadow-sm">
              <div className="w-4 h-4 bg-[#4285F4]"></div>
              <div className="w-4 h-4 bg-[#34A853]"></div>
              <div className="w-4 h-4 bg-[#FBBC04]"></div>
              <div className="w-4 h-4 bg-[#EA4335]"></div>
          </div>
          <h1 className="text-lg font-bold text-gray-900 tracking-tight">Project Hub</h1>
        </div>

        {/* Create Button */}
        <div className="px-6 mb-10">
          <button 
            onClick={onOpenCreateModal}
            className="w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-full transition-all flex items-center justify-center gap-3 shadow-sm border border-gray-100 group"
          >
            <div className="flex items-center justify-center">
                <Plus className="text-google-red" size={20} />
            </div>
            <span className="text-sm font-medium text-gray-600">Create New</span>
          </button>
        </div>

        {/* Search */}
        <div className="px-6 mb-8">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="text-gray-400" size={16} />
            </div>
            <input 
              type="text" 
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:border-gray-200 focus:ring-0 outline-none transition-all"
            />
          </div>
        </div>

        {/* Collections */}
        <div className="flex-grow overflow-y-auto px-4 no-scrollbar">
          <div className="flex items-center gap-2 mb-4 px-2">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Collections</h3>
          </div>

          <ul className="space-y-1">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.name;
              return (
                <li key={cat.name}>
                  <button
                    onClick={() => {
                      onSelectCategory(cat.name);
                      if(window.innerWidth < 1024) closeMobileSidebar();
                    }}
                    className={`
                      w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-all
                      ${isActive 
                        ? 'bg-blue-50 text-google-blue' 
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    <span>{cat.name}</span>
                    <span className={`
                      text-[10px] font-bold
                      ${isActive 
                        ? 'text-google-blue' 
                        : 'text-gray-300'}
                    `}>
                      {cat.count}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* User Footer */}
        <div className="p-6 border-t border-gray-50">
          <div className="flex items-center gap-3 p-2 rounded-lg transition-colors mb-4">
            <div className="w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center font-bold text-xs">
              A
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900 truncate">Administrator</p>
              <p className="text-[10px] text-gray-400 truncate">admin@projecthub.com</p>
            </div>
          </div>

          {/* Connection Status Indicator */}
          <div className="flex items-center gap-2 px-2">
            <div className={`w-1.5 h-1.5 rounded-full ${
              connectionStatus === 'connected' ? 'bg-google-green' :
              connectionStatus === 'error' ? 'bg-google-red' :
              'bg-google-yellow'
            }`} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              {connectionStatus === 'connected' ? 'Online' :
               connectionStatus === 'error' ? 'Offline' :
               'Connecting'}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;