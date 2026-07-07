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
    <div className="flex min-h-screen text-[#111111] bg-white">
      
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
        <div className="lg:hidden bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <div className="flex flex-wrap w-6 h-6 rounded overflow-hidden">
                <div className="w-3 h-3 bg-[#4285F4]"></div>
                <div className="w-3 h-3 bg-[#34A853]"></div>
                <div className="w-3 h-3 bg-[#FBBC04]"></div>
                <div className="w-3 h-3 bg-[#EA4335]"></div>
            </div>
            <span className="font-semibold text-gray-900 tracking-tight">Project Hub</span>
          </div>
          <button 
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
          >
            <Menu size={20} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8 lg:p-16 max-w-7xl mx-auto w-full">
          
          {/* Header Section */}
          <div className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
               <h2 className="text-3xl font-semibold text-gray-900 mb-2 tracking-tight">{selectedCategory}</h2>
               <p className="text-gray-500 text-sm font-medium">
                 {filteredProjects.length} projects
               </p>
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="animate-spin text-google-blue" size={32} />
            </div>
          ) : connectionStatus === 'error' ? (
            <div className="flex flex-col items-center justify-center h-64 text-center p-8 bg-white rounded-2xl border border-gray-100">
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
                <WifiOff className="text-google-red" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Connection Error</h3>
              <p className="text-gray-500 max-w-xs mb-6 text-sm">
                Unable to connect to the project database.
              </p>
              <button 
                onClick={loadProjects}
                className="px-8 py-2.5 bg-google-red hover:bg-[#d93025] text-white rounded-full font-medium text-sm transition-all shadow-sm"
              >
                Retry
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
            <div className="flex flex-col items-center justify-center h-80 text-center p-8">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <Menu className="text-gray-300" size={28} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No projects found</h3>
              <p className="text-gray-500 max-w-xs mb-8 text-sm">
                Try adjusting your search or category filter.
              </p>
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="px-8 py-2.5 bg-google-blue hover:bg-[#1a73e8] text-white rounded-full font-medium text-sm transition-all shadow-sm"
              >
                Create project
              </button>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <footer className="mt-auto py-8 text-center text-[10px] text-gray-400 uppercase tracking-widest font-medium">
            &copy; {new Date().getFullYear()} Project Hub &middot; Portfolio
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