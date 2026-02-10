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
            <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-primary-600 to-indigo-600 drop-shadow-sm">
              {project.stats?.value || '0'}
              <span className="text-lg text-gray-400 ml-1 font-semibold">{project.stats?.unit}</span>
            </div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">
              {project.stats?.label || 'Key Metric'}
            </p>
          </div>
        );
      
      case 'progress':
        const value = Number(project.stats?.value) || 0;
        const max = Number(project.stats?.maxValue) || 100;
        const percent = Math.min(100, Math.max(0, (value / max) * 100));
        
        return (
          <div className="py-2">
            <div className="flex justify-between text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
              <span>{project.stats?.label || 'Progress'}</span>
              <span>{percent.toFixed(0)}%</span>
            </div>
            <div className="h-3 w-full bg-gray-200/50 rounded-full overflow-hidden shadow-inner border border-white/40">
              <div 
                className="h-full bg-gradient-to-r from-primary-400 to-indigo-500 shadow-[0_0_10px_rgba(56,189,248,0.5)] transition-all duration-1000 ease-out"
                style={{ width: `${percent}%` }}
              />
            </div>
            <p className="text-[10px] text-gray-400 mt-2 text-right">
              Target: {max} {project.stats?.unit}
            </p>
          </div>
        );

      case 'standard':
      default:
        return (
          <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed font-medium opacity-90 drop-shadow-[0_1px_0_rgba(255,255,255,0.5)]">
            {project.description}
          </p>
        );
    }
  };

  const handleOpenProject = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Check if it is a Data URI (Embedded HTML)
    if (project.link && project.link.startsWith('data:text/html')) {
      e.preventDefault();
      
      try {
        // Extract base64 content
        const base64Content = project.link.split(',')[1];
        if (!base64Content) return;

        // Decode Base64 back to HTML string securely
        // Must match encoding: btoa(unescape(encodeURIComponent(text)))
        const htmlContent = decodeURIComponent(escape(window.atob(base64Content)));

        // Open a new blank window
        const newWindow = window.open('', '_blank');
        
        if (newWindow) {
          // Write the HTML directly to the new document
          // This ensures scripts run immediately without needing a refresh
          newWindow.document.open();
          newWindow.document.write(htmlContent);
          newWindow.document.close();
        } else {
          alert("Pop-up blocked. Please allow pop-ups for this site to view the project.");
        }
      } catch (err) {
        console.error("Failed to open embedded project:", err);
        // Fallback to default behavior if decoding fails
        window.open(project.link, '_blank');
      }
    }
    // If standard URL (https://...), let the default <a> tag behavior work
  };

  return (
    <div className="
      relative h-full flex flex-col group
      bg-gradient-to-br from-white/60 to-white/30
      backdrop-blur-xl
      border-t border-l border-white/60 border-b border-r border-white/20
      rounded-[2rem]
      shadow-glass-3d hover:shadow-glass-3d-hover
      transition-all duration-500 ease-out 
      hover:-translate-y-2 hover:scale-[1.02]
      overflow-hidden
    ">
      {/* Specular Highlight */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-0" />
      
      {/* Reflective shine animation on hover */}
      <div className="absolute -inset-full top-0 block h-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine z-0" />

      {/* Image Section */}
      <div className="relative h-44 m-3 overflow-hidden rounded-[1.7rem] bg-gray-50 shadow-inner ring-1 ring-black/5 z-10 shrink-0">
        <div className="absolute top-3 left-3 z-10">
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-bold bg-white/90 text-gray-800 shadow-lg backdrop-blur-md uppercase tracking-wider border border-white">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mr-2 shadow-[0_0_8px_rgba(14,165,233,0.8)]"></span>
            {project.category}
          </span>
        </div>
        
        {/* Type Icon Badge */}
        <div className="absolute top-3 right-3 z-10">
          <div className="w-8 h-8 rounded-full bg-white/40 backdrop-blur-md border border-white/60 flex items-center justify-center shadow-sm text-gray-700">
             {project.displayType === 'metric' ? <TrendingUp size={14} /> : 
              project.displayType === 'progress' ? <Activity size={14} /> : 
              <FileText size={14} />}
          </div>
        </div>

        <img 
          src={project.imageUrl || `https://picsum.photos/seed/${project.title}/400/300`} 
          alt={project.title}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-in-out"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://picsum.photos/400/300?grayscale';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-60" />
      </div>

      {/* Content Section */}
      <div className="px-7 pt-2 pb-7 flex flex-col flex-grow relative z-10">
        <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-primary-700 transition-colors line-clamp-1 drop-shadow-sm leading-tight">
          {project.title}
        </h3>
        
        <div className="flex items-center text-xs text-gray-500 mb-4 font-medium uppercase tracking-wide">
          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-gray-200 to-white flex items-center justify-center mr-2 shadow-sm border border-white">
             <User size={10} className="text-gray-400" />
          </div>
          <span className="text-gray-800">{project.author}</span>
        </div>
        
        {/* Dynamic Analysis Area */}
        <div className="flex-grow flex flex-col justify-center min-h-[5rem] mb-4 bg-white/20 rounded-xl p-3 border border-white/30 shadow-inner relative overflow-hidden">
           {/* Background noise for texture */}
           <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
           <div className="relative z-10">
             {renderAnalysisContent()}
           </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-900/5 mt-auto relative gap-2">
          <div className="absolute top-0 left-0 right-0 h-px bg-white/50"></div>
          
          <div className="flex items-center text-gray-400 text-xs font-bold tracking-widest">
            PROJECT
          </div>
          
          <div className="flex items-center gap-2">
            {onEdit && (
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        onEdit(project);
                    }}
                    className="
                        p-2.5 rounded-full text-gray-600 bg-white/50 hover:bg-white
                        border border-white/60 shadow-sm hover:shadow-md
                        transition-all duration-300 hover:text-primary-600
                    "
                    title="Edit Project"
                >
                    <Pencil size={14} />
                </button>
            )}

            {project.link && (
              <a 
                  href={project.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={handleOpenProject}
                  className="
                  flex items-center px-4 py-2.5 rounded-full text-xs font-bold 
                  bg-white/70 hover:bg-white text-gray-900 
                  border border-white shadow-[0_4px_10px_rgba(0,0,0,0.05)] hover:shadow-[0_6px_15px_rgba(0,0,0,0.1)]
                  transition-all duration-300 uppercase tracking-wider
                  hover:-translate-y-0.5 active:translate-y-0 active:shadow-inner
                  "
              >
                  Open
                  <ExternalLink className="w-3.5 h-3.5 ml-2" />
              </a>
            )}
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes shine {
          0% { left: -100%; opacity: 0; }
          50% { opacity: 0.3; }
          100% { left: 200%; opacity: 0; }
        }
        .group:hover .group-hover\\:animate-shine {
          animation: shine 1.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ProjectCard;