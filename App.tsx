import React, { useState, useEffect, useMemo } from 'react';
import { Menu, Loader2, WifiOff } from 'lucide-react';
import Sidebar from './components/Sidebar';
import ProjectCard from './components/ProjectCard';
import CreateProjectModal from './components/CreateProjectModal';
import EditProjectModal from './components/EditProjectModal';
import { Project, CategoryCount } from './types';
import { fetchProjects } from './services/firebase';

const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [selectedCategory, setSelectedCategory] = useState('All Projects');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Load projects from Firebase
  const loadProjects = async () => {
    setLoading(true);
    setConnectionStatus('connecting');
    try {
      const data = await fetchProjects();
      setProjects(data);
      setConnectionStatus('connected');
    } catch (error) {
      console.error("Failed to load projects", error);
      setConnectionStatus('error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  // Calculate Categories and Counts dynamically
  const categories = useMemo<CategoryCount[]>(() => {
    const counts: Record<string, number> = {};
    projects.forEach(p => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });

    const categoryList = Object.keys(counts).map(name => ({
      name,
      count: counts[name]
    }));

    // Add "All Projects" at the beginning
    return [
      { name: 'All Projects', count: projects.length },
      ...categoryList.sort((a, b) => b.count - a.count) // Sort by popularity
    ];
  }, [projects]);

  // Extract just the names for dropdowns
  const categoryNames = useMemo(() => {
      return categories.map(c => c.name);
  }, [categories]);

  // Filter Projects
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesCategory = selectedCategory === 'All Projects' || project.category === selectedCategory;
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        project.title.toLowerCase().includes(searchLower) || 
        project.description.toLowerCase().includes(searchLower) ||
        project.author.toLowerCase().includes(searchLower);
      
      return matchesCategory && matchesSearch;
    });
  }, [projects, selectedCategory, searchQuery]);

  const handleEditClick = (project: Project) => {
    setProjectToEdit(project);
    setIsEditModalOpen(true);
  };

  return (
    <div className="flex min-h-screen text-gray-800">
      
      {/* Sidebar */}
      <Sidebar 
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isMobileOpen={isMobileSidebarOpen}
        closeMobileSidebar={() => setIsMobileSidebarOpen(false)}
        connectionStatus={connectionStatus}
      />

      {/* Main Content */}
      <main className="flex-1 lg:ml-72 min-h-screen flex flex-col relative z-0">
        {/* Mobile Header */}
        <div className="lg:hidden bg-glass-700 backdrop-blur-xl px-4 py-3 border-b border-white/20 flex items-center justify-between sticky top-0 z-30 shadow-glass">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
               <span className="text-white font-serif font-bold text-lg">P</span>
            </div>
            <span className="font-bold text-gray-900">Project Hub</span>
          </div>
          <button 
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 text-gray-600 hover:bg-white/40 rounded-lg transition-colors"
          >
            <Menu size={24} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full">
          
          {/* Header Section */}
          <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="bg-glass-400 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/40 shadow-glass">
               <h2 className="text-3xl font-bold text-gray-900 mb-1 tracking-tight">{selectedCategory}</h2>
               <p className="text-gray-600 text-sm font-medium">
                 Showing {filteredProjects.length} result{filteredProjects.length !== 1 ? 's' : ''}
               </p>
            </div>
            {/* Can add extra filters or view toggles here if needed */}
          </div>

          {/* Grid */}
          {loading ? (
            <div className="flex items-center justify-center h-64 bg-glass-300 backdrop-blur-md rounded-3xl border border-white/30">
              <Loader2 className="animate-spin text-white drop-shadow-md" size={40} />
            </div>
          ) : connectionStatus === 'error' ? (
            <div className="flex flex-col items-center justify-center h-64 text-center p-8 bg-glass-300 backdrop-blur-xl rounded-3xl border border-red-200/50 shadow-glass">
              <div className="w-16 h-16 bg-red-100/50 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
                <WifiOff className="text-red-500" size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Connection Error</h3>
              <p className="text-gray-600 max-w-xs mb-6">
                Unable to connect to the project database. Please check your internet connection or API configuration.
              </p>
              <button 
                onClick={loadProjects}
                className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full font-semibold shadow-lg transition-all"
              >
                Retry Connection
              </button>
            </div>
          ) : filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredProjects.map((project) => (
                <div key={project.id} className="h-full">
                  <ProjectCard 
                    project={project} 
                    onEdit={handleEditClick}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center p-8 bg-glass-300 backdrop-blur-xl rounded-3xl border border-white/40 shadow-glass">
              <div className="w-16 h-16 bg-white/40 rounded-full flex items-center justify-center mb-4 shadow-inner">
                <Menu className="text-gray-500" size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">No projects found</h3>
              <p className="text-gray-600 max-w-xs mb-6">
                Try adjusting your search or category filter, or create a new project.
              </p>
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-full font-semibold shadow-lg hover:shadow-primary-500/30 transition-all"
              >
                Create new project
              </button>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <footer className="mt-auto py-6 text-center text-xs text-gray-500 font-medium tracking-wide">
            &copy; {new Date().getFullYear()} Project Hub. Designed with Glassmorphism.
        </footer>
      </main>

      {/* Create Modal */}
      <CreateProjectModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onProjectCreated={loadProjects}
        categories={categoryNames}
      />

      {/* Edit Modal */}
      <EditProjectModal
        isOpen={isEditModalOpen}
        onClose={() => {
            setIsEditModalOpen(false);
            setProjectToEdit(null);
        }}
        project={projectToEdit}
        onProjectUpdated={loadProjects}
        categories={categoryNames}
      />
    </div>
  );
};

export default App;