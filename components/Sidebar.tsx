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
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 left-0 z-50 h-screen w-72 
        bg-gradient-to-b from-white/40 via-white/30 to-white/20
        backdrop-blur-2xl border-r border-white/40 
        flex flex-col transition-transform duration-300 ease-in-out
        shadow-[5px_0_30px_rgba(0,0,0,0.03)]
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header / Logo */}
        <div className="p-8 pb-6 relative">
            {/* Top light reflection */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />
            
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-gradient-to-br from-gray-900 to-gray-700 rounded-xl flex items-center justify-center shadow-[0_8px_16px_rgba(0,0,0,0.2)] border border-white/20 ring-1 ring-white/20">
              <span className="text-white font-serif font-bold text-xl drop-shadow-md">P</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight drop-shadow-sm">Project<span className="text-primary-600">Hub</span></h1>
            </div>
          </div>
          <p className="text-[10px] text-gray-500 font-bold tracking-[0.2em] pl-14 uppercase mix-blend-color-burn">Executive Portfolio</p>
        </div>

        {/* Create Button */}
        <div className="px-6 mb-8">
          <button 
            onClick={onOpenCreateModal}
            className="w-full bg-gradient-to-b from-white/60 to-white/30 hover:to-white/50 border-t border-l border-white/80 border-b border-r border-white/40 text-gray-800 font-bold py-3.5 rounded-2xl transition-all shadow-glass hover:shadow-glass-hover flex items-center justify-center gap-2 group backdrop-blur-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-pressed"
          >
            <div className="bg-gradient-to-tr from-primary-500 to-primary-400 text-white rounded-full p-0.5 shadow-md group-hover:scale-110 transition-transform">
              <Plus size={16} strokeWidth={3} />
            </div>
            <span className="text-sm tracking-wide text-gray-800">CREATE PROJECT</span>
          </button>
        </div>

        {/* Search */}
        <div className="px-6 mb-6">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="text-gray-500 group-focus-within:text-primary-600 transition-colors drop-shadow-sm" size={16} />
            </div>
            <input 
              type="text" 
              placeholder="Search collection..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/20 border-t border-l border-white/30 border-b border-r border-white/10 rounded-xl text-sm text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-primary-400/30 focus:bg-white/40 transition-all outline-none backdrop-blur-sm shadow-inner"
            />
          </div>
        </div>

        {/* Collections */}
        <div className="flex-grow overflow-y-auto px-4 no-scrollbar">
          <div className="flex items-center gap-2 mb-3 px-2">
            <h3 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest pl-1">Collections</h3>
          </div>

          <ul className="space-y-2">
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
                      w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 relative overflow-hidden group
                      ${isActive 
                        ? 'text-primary-800 shadow-glass-3d translate-x-1' 
                        : 'text-gray-600 hover:bg-white/30 hover:text-gray-900 hover:translate-x-1'
                      }
                    `}
                  >
                    {/* Active Background Pill */}
                    {isActive && (
                        <div className="absolute inset-0 bg-gradient-to-r from-white/70 to-white/40 border border-white/60 rounded-xl -z-10" />
                    )}
                    
                    <span className="relative z-10 drop-shadow-sm">{cat.name}</span>
                    <span className={`
                      text-xs py-0.5 px-2.5 rounded-full font-bold relative z-10 border
                      ${isActive 
                        ? 'bg-white/50 text-primary-700 border-white/60 shadow-sm' 
                        : 'bg-black/5 text-gray-500 border-transparent group-hover:bg-white/40 group-hover:border-white/30'}
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
        <div className="p-4 mx-4 mb-4 rounded-2xl bg-gradient-to-br from-white/40 to-white/10 backdrop-blur-md border-t border-l border-white/40 border-b border-r border-white/10 shadow-glass">
          <div className="flex items-center gap-3 cursor-pointer hover:bg-white/30 p-2 -ml-1 rounded-xl transition-colors mb-2">
            <div className="w-10 h-10 bg-gradient-to-tr from-primary-400 to-indigo-400 text-white rounded-full flex items-center justify-center font-bold shadow-[0_4px_10px_rgba(0,0,0,0.15)] text-sm border-2 border-white/80">
              AD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate drop-shadow-sm">Administrator</p>
              <p className="text-[10px] text-gray-600 truncate uppercase tracking-wider font-semibold">Premium Plan</p>
            </div>
            <ChevronRight size={16} className="text-gray-400" />
          </div>

          {/* Connection Status Indicator */}
          <div className="flex items-center justify-between px-2 pt-2 border-t border-gray-400/10">
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full shadow-inner border border-white/30 ${
                connectionStatus === 'connected' ? 'bg-gradient-to-br from-green-300 to-green-500 shadow-[0_0_8px_rgba(74,222,128,0.6)]' :
                connectionStatus === 'error' ? 'bg-gradient-to-br from-red-300 to-red-500' :
                'bg-gradient-to-br from-yellow-300 to-yellow-500 animate-pulse'
              }`} />
              <span className={`text-[10px] font-bold uppercase tracking-wider drop-shadow-sm ${
                connectionStatus === 'connected' ? 'text-green-700' :
                connectionStatus === 'error' ? 'text-red-700' :
                'text-yellow-700'
              }`}>
                {connectionStatus === 'connected' ? 'Online' :
                 connectionStatus === 'error' ? 'Offline' :
                 'Connecting...'}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;