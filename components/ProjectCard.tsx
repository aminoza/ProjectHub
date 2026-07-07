import React from 'react';
import { ExternalLink, User, TrendingUp, Activity, FileText, Pencil } from 'lucide-react';
import { Project } from '../types';

interface ProjectCardProps {
  project: Project;
  onEdit?: (project: Project) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onEdit }) => {
  // Function to render the specific analysis content
  const renderAnalysisContent = () => {
    switch (project.displayType) {
      case 'metric':
        return (
          <div className="flex flex-col items-center justify-center py-2">
            <div className="text-4xl font-bold text-google-blue">
              {project.stats?.value || '0'}
              <span className="text-sm text-gray-400 ml-1 font-medium">{project.stats?.unit}</span>
            </div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">
              {project.stats?.label || 'Key Metric'}
            </p>
          </div>
        );
      
      case 'progress':
        const value = Number(project.stats?.value) || 0;
        const max = Number(project.stats?.maxValue) || 100;
        const percent = Math.min(100, Math.max(0, (value / max) * 100));
        
        return (
          <div className="py-2 w-full">
            <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
              <span>{project.stats?.label || 'Progress'}</span>
              <span className="text-google-blue">{percent.toFixed(0)}%</span>
            </div>
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-google-blue rounded-full"
                style={{ width: `${percent}%` }}
              />
            </div>
            <p className="text-[10px] text-gray-300 mt-3 text-right font-medium">
              Target: {max} {project.stats?.unit}
            </p>
          </div>
        );

      case 'standard':
      default:
        return (
          <p className="text-gray-500 text-sm line-clamp-3 leading-relaxed font-medium">
            {project.description}
          </p>
        );
    }
  };

  const handleOpenProject = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (project.link && project.link.startsWith('data:text/html')) {
      e.preventDefault();
      try {
        const base64Content = project.link.split(',')[1];
        if (!base64Content) return;
        const htmlContent = decodeURIComponent(escape(window.atob(base64Content)));
        const newWindow = window.open('', '_blank');
        if (newWindow) {
          newWindow.document.open();
          newWindow.document.write(htmlContent);
          newWindow.document.close();
        } else {
          alert("Pop-up blocked. Please allow pop-ups for this site to view the project.");
        }
      } catch (err) {
        console.error("Failed to open embedded project:", err);
        window.open(project.link, '_blank');
      }
    }
  };

  return (
    <div className="
      group relative h-full flex flex-col
      bg-white rounded-2xl
      border border-gray-100
      transition-all duration-300 ease-in-out 
      hover:border-gray-300
      overflow-hidden
    ">
      
      {/* Image Section */}
      <div className="relative h-56 overflow-hidden bg-gray-50">
        <div className="absolute top-4 left-4 z-10">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold bg-white/90 text-gray-900 backdrop-blur-sm">
            {project.category}
          </span>
        </div>
        
        {/* Type Icon Badge */}
        <div className="absolute top-4 right-4 z-10">
          <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-gray-900 backdrop-blur-sm">
             {project.displayType === 'metric' ? <TrendingUp size={14} /> : 
              project.displayType === 'progress' ? <Activity size={14} /> : 
              <FileText size={14} />}
          </div>
        </div>

        <img 
          src={project.imageUrl || `https://picsum.photos/seed/${project.title}/800/600`} 
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://picsum.photos/800/600?grayscale';
          }}
        />
      </div>

      {/* Content Section */}
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-semibold text-gray-900 mb-2 tracking-tight group-hover:text-google-blue transition-colors line-clamp-1">
          {project.title}
        </h3>
        
        <div className="flex items-center text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-6">
          <User size={10} className="mr-1.5" />
          <span>{project.author}</span>
        </div>
        
        {/* Dynamic Analysis Area */}
        <div className="flex-grow flex flex-col justify-center min-h-[6rem] mb-6 bg-gray-50 rounded-xl p-4 border border-gray-50">
             {renderAnalysisContent()}
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-gray-50 mt-auto">
          
          <div className="flex items-center gap-2">
            {onEdit && (
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        onEdit(project);
                    }}
                    className="
                        p-2 rounded-full text-gray-400 hover:bg-gray-50 hover:text-google-blue
                        transition-all
                    "
                    title="Edit Project"
                >
                    <Pencil size={16} />
                </button>
            )}
          </div>

          <div className="flex items-center">
            {project.link && (
              <a 
                  href={project.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={handleOpenProject}
                  className="
                  flex items-center px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest
                  bg-google-blue text-white hover:bg-[#1a73e8]
                  transition-all shadow-sm
                  "
              >
                  View
                  <ExternalLink className="w-3 h-3 ml-2" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;