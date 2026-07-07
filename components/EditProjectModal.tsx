import React, { useState, useEffect } from 'react';
import { X, Loader2, Save, Type, Link as LinkIcon, Image as ImageIcon, User, Tag, Code, FileCode, Zap, Download, Printer, RefreshCw, ArrowLeft } from 'lucide-react';
import { Project, DisplayType } from '../types';
import { updateProject } from '../services/firebase';

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onProjectUpdated: () => void;
  categories: string[];
}

// --- SNIPPET LIBRARY DEFINITIONS ---
const SNIPPETS = [
  {
    id: 'csv',
    label: 'Save CSV Button',
    icon: <Download size={14} />,
    color: 'text-[#1a73e8] bg-[#e8f0fe] border-[#d2e3fc] hover:bg-[#d2e3fc]',
    code: `
<!-- SNIPPET: SAVE CSV BUTTON -->
<div style="position: fixed; bottom: 20px; right: 20px; z-index: 9999; font-family: sans-serif;">
    <button onclick="exportToCSV()" style="background: #1a73e8; color: white; padding: 10px 20px; border-radius: 4px; border: none; font-weight: 500; box-shadow: 0 2px 5px rgba(0,0,0,0.2); cursor: pointer; display: flex; align-items: center; gap: 6px;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        Save CSV
    </button>
</div>
<script>
function exportToCSV() {
    let data = window.historyData || window.data || window.chartData || [];
    if(!data || data.length===0) { alert("No data found (variable: historyData/data)"); return; }
    
    let csvContent = "data:text/csv;charset=utf-8,";
    // Check format
    if(Array.isArray(data) && typeof data[0] === 'object') {
        const headers = Object.keys(data[0]);
        csvContent += headers.join(",") + "\\r\\n";
        data.forEach(row => {
             csvContent += headers.map(h => JSON.stringify(row[h])).join(",") + "\\r\\n";
        });
    } else {
        csvContent += "Value\\r\\n" + data.join("\\r\\n");
    }
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "data_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
</script>
<!-- END SNIPPET -->
`
  },
  {
    id: 'print',
    label: 'Print / PDF',
    icon: <Printer size={14} />,
    color: 'text-gray-700 bg-gray-100 border-gray-200 hover:bg-gray-200',
    code: `
<!-- SNIPPET: PRINT BUTTON -->
<div style="position: fixed; bottom: 20px; right: 140px; z-index: 9999;">
    <button onclick="window.print()" style="background: white; color: #333; padding: 10px; border-radius: 50%; border: 1px solid #ddd; box-shadow: 0 2px 5px rgba(0,0,0,0.1); cursor: pointer; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;" title="Print Page">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
    </button>
</div>
<!-- END SNIPPET -->
`
  },
  {
    id: 'refresh',
    label: 'Refresh Page',
    icon: <RefreshCw size={14} />,
    color: 'text-[#34A853] bg-[#e6f4ea] border-[#ceead6] hover:bg-[#ceead6]',
    code: `
<!-- SNIPPET: REFRESH BUTTON -->
<div style="position: fixed; top: 20px; right: 20px; z-index: 9999;">
    <button onclick="location.reload()" style="background: rgba(255,255,255,0.9); color: #34A853; padding: 8px 12px; border-radius: 4px; border: 1px solid #ceead6; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 5px; font-family: sans-serif; font-size: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
        Refresh
    </button>
</div>
<!-- END SNIPPET -->
`
  },
  {
    id: 'back',
    label: 'Close / Back',
    icon: <ArrowLeft size={14} />,
    color: 'text-[#EA4335] bg-[#fce8e6] border-[#fad2cf] hover:bg-[#fad2cf]',
    code: `
<!-- SNIPPET: CLOSE WINDOW BUTTON -->
<div style="position: fixed; top: 20px; left: 20px; z-index: 9999;">
    <button onclick="window.close()" style="background: rgba(0,0,0,0.6); color: white; width: 32px; height: 32px; border-radius: 50%; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
</div>
<!-- END SNIPPET -->
`
  }
];

const EditProjectModal: React.FC<EditProjectModalProps> = ({ 
  isOpen, 
  onClose, 
  project,
  onProjectUpdated,
  categories
}) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'code'>('details');
  const [htmlCode, setHtmlCode] = useState('');
  const [isEmbedded, setIsEmbedded] = useState(false);

  const [formData, setFormData] = useState<Project>({
    title: '',
    author: '',
    description: '',
    category: 'General',
    imageUrl: '',
    link: '',
    displayType: 'standard',
    stats: { value: '', label: '', unit: '', maxValue: 100 }
  });

  useEffect(() => {
    if (project && isOpen) {
      setFormData(project);
      
      // Check if it's an embedded HTML project
      if (project.link && project.link.startsWith('data:text/html')) {
        setIsEmbedded(true);
        try {
          const base64Content = project.link.split(',')[1];
          if (base64Content) {
            const decoded = decodeURIComponent(escape(window.atob(base64Content)));
            setHtmlCode(decoded);
          }
        } catch (e) {
          console.error("Error decoding base64", e);
          setHtmlCode("<!-- Error decoding content -->");
        }
      } else {
        setIsEmbedded(false);
        setHtmlCode('');
      }
    }
  }, [project, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('stats.')) {
        const statField = name.split('.')[1];
        setFormData(prev => ({
            ...prev,
            stats: {
                ...prev.stats,
                [statField]: value
            }
        }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));

        // Check if link input is changing to update embedded status
        if (name === 'link') {
            if (value.startsWith('data:text/html')) {
                setIsEmbedded(true);
                // Attempt to decode if pasting new data uri
                try {
                    const base64Content = value.split(',')[1];
                    if (base64Content) {
                        const decoded = decodeURIComponent(escape(window.atob(base64Content)));
                        setHtmlCode(decoded);
                    }
                } catch (e) {
                    // ignore decode errors on typing
                }
            } else {
                setIsEmbedded(false);
            }
        }
    }
  };

  const insertSnippet = (snippetCode: string) => {
    setHtmlCode(prev => prev + "\n" + snippetCode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project?.id) return;

    setLoading(true);
    try {
      let finalLink = formData.link;

      // If embedded and code was changed (or we are in code mode), re-encode it
      // We prioritize htmlCode if we are in embedded mode, to ensure code edits are captured
      if (isEmbedded && htmlCode) {
         try {
            const base64 = btoa(unescape(encodeURIComponent(htmlCode)));
            finalLink = `data:text/html;base64,${base64}`;
         } catch (err) {
            console.error("Error encoding code", err);
            // If encoding fails, fallback to existing link or let it be.
            // But we should warn user ideally. For now, alert.
            alert("Error encoding code. Please check for special characters.");
            setLoading(false);
            return;
         }
      }

      await updateProject(project.id, {
        ...formData,
        link: finalLink
      });
      
      onProjectUpdated();
      onClose();
    } catch (error) {
      alert("Failed to update project. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-gray-500/40 transition-opacity" 
        onClick={onClose}
      />

      <div className="
        relative z-10 w-full max-w-2xl max-h-[90vh] flex flex-col
        bg-white
        rounded-2xl
        transform transition-all animate-in fade-in zoom-in-95 duration-200
      ">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center bg-white rounded-t-2xl">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
             Edit Project
             <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-100 uppercase tracking-widest">
                {formData.title}
             </span>
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-black p-2 hover:bg-gray-50 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs for Embedded Projects */}
        {isEmbedded && (
            <div className="flex items-center justify-between px-8 pt-8">
                <div className="flex gap-3">
                    <button
                        onClick={() => setActiveTab('details')}
                        className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border ${
                            activeTab === 'details' 
                            ? 'bg-google-blue text-white border-google-blue' 
                            : 'bg-white text-gray-400 border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                        Metadata
                    </button>
                    <button
                        onClick={() => setActiveTab('code')}
                        className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border flex items-center gap-2 ${
                            activeTab === 'code' 
                            ? 'bg-gray-900 text-white border-gray-900' 
                            : 'bg-white text-gray-400 border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                        <Code size={14} /> Source Code
                    </button>
                </div>
            </div>
        )}

        <div className="p-8 overflow-y-auto no-scrollbar flex-1">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {activeTab === 'details' ? (
                <>
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Title</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Type className="text-gray-300" size={16} /></div>
                                <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-gray-300 outline-none text-sm transition-all" />
                            </div>
                        </div>
                        <div>
                             <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Category</label>
                             <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Tag className="text-gray-300" size={16} /></div>
                                <select name="category" value={formData.category} onChange={handleChange} className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-gray-300 outline-none text-sm appearance-none transition-all">
                                    {categories.filter(c => c !== 'All Projects').map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    <option value="New">New Category...</option>
                                </select>
                             </div>
                        </div>
                    </div>

                    {/* Stats Section */}
                    <div className="p-6 bg-gray-50 rounded-2xl border border-gray-50">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 ml-1">Card Display</label>
                        <div className="grid grid-cols-3 gap-3 mb-6">
                            {(['standard', 'metric', 'progress'] as DisplayType[]).map((type) => (
                                <button key={type} type="button" onClick={() => setFormData(prev => ({ ...prev, displayType: type }))} className={`py-2 px-1 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all border ${formData.displayType === type ? 'bg-google-blue text-white border-google-blue' : 'bg-white text-gray-400 border-gray-200 hover:bg-gray-50'}`}>{type}</button>
                            ))}
                        </div>
                        {formData.displayType !== 'standard' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Value</label><input type="text" name="stats.value" value={formData.stats?.value} onChange={handleChange} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:border-gray-400 outline-none" /></div>
                                <div><label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Unit</label><input type="text" name="stats.unit" value={formData.stats?.unit} onChange={handleChange} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:border-gray-400 outline-none" /></div>
                                <div className="col-span-2"><label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Label</label><input type="text" name="stats.label" value={formData.stats?.label} onChange={handleChange} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:border-gray-400 outline-none" /></div>
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Description</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-gray-300 outline-none text-sm resize-none transition-all" />
                    </div>

                    {/* Links */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                                Project Link <span className="text-gray-300 font-normal ml-1 lowercase">(Optional)</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><LinkIcon className="text-gray-300" size={16} /></div>
                                <input type="text" name="link" value={formData.link} onChange={handleChange} className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-gray-300 outline-none text-sm truncate transition-all" />
                            </div>
                            {isEmbedded && (
                                <p className="text-[10px] text-green-500 mt-2 ml-2 font-bold uppercase tracking-widest flex items-center">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                                    Embedded HTML
                                </p>
                            )}
                        </div>
                        <div>
                             <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Image URL</label>
                             <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><ImageIcon className="text-gray-300" size={16} /></div>
                                <input type="text" name="imageUrl" value={formData.imageUrl} onChange={handleChange} className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-gray-300 outline-none text-sm transition-all" />
                             </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="h-full flex flex-col">
                    {/* Snippet Library Toolbar */}
                    <div className="mb-6 bg-gray-50 p-4 rounded-2xl border border-gray-50">
                        <div className="flex items-center gap-2 mb-4">
                            <Zap size={12} className="text-yellow-500 fill-yellow-500" />
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Snippet Library</span>
                        </div>
                        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                            {SNIPPETS.map(snippet => (
                                <button
                                    key={snippet.id}
                                    type="button"
                                    onClick={() => insertSnippet(snippet.code)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest bg-white border border-gray-100 text-gray-600 hover:bg-gray-50 transition-all shadow-sm whitespace-nowrap"
                                    title={`Insert ${snippet.label} code`}
                                >
                                    {snippet.icon}
                                    {snippet.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Embedded HTML Source</label>
                        <span className="text-[10px] text-black bg-gray-100 px-3 py-1 rounded-full font-bold uppercase tracking-widest">Live Editor</span>
                    </div>
                    <div className="relative flex-grow min-h-[400px]">
                        <textarea
                            value={htmlCode}
                            onChange={(e) => setHtmlCode(e.target.value)}
                            className="w-full h-full p-6 bg-gray-900 text-gray-100 font-mono text-sm rounded-2xl border border-gray-800 focus:ring-0 outline-none resize-none leading-relaxed shadow-inner"
                            spellCheck={false}
                        />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-4 text-right font-medium">
                        Changes to code will be re-encoded to Base64 upon saving.
                    </p>
                </div>
            )}

            <div className="pt-4 border-t border-gray-50 mt-8">
              <button
                type="submit"
                disabled={loading}
                className="
                  w-full bg-google-blue hover:bg-[#1a73e8]
                  text-white py-4 rounded-full font-bold text-xs uppercase tracking-widest transition-all 
                  disabled:opacity-50 disabled:cursor-not-allowed
                  flex items-center justify-center gap-2 shadow-sm
                "
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                {loading ? 'Updating...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProjectModal;