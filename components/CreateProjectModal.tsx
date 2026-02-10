import React, { useState, useRef } from 'react';
import { X, Loader2, Image as ImageIcon, Link as LinkIcon, User, Tag, Type, Upload, FileCode, AlertCircle, BarChart3, Layout } from 'lucide-react';
import { Project, DisplayType } from '../types';
import { createProject } from '../services/firebase';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: () => void;
  categories: string[];
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ 
  isOpen, 
  onClose, 
  onProjectCreated,
  categories
}) => {
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Project>({
    title: '',
    author: '',
    description: '',
    category: 'General',
    imageUrl: '',
    link: '',
    displayType: 'standard',
    stats: {
        value: '',
        label: '',
        unit: '',
        maxValue: 100
    }
  });

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
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileError(null);
    setImporting(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        
        if (text.length > 800000) {
            setFileError("File is too large to embed directly (Max 800KB). Metadata imported, but please host the file externally and provide a link.");
        }

        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        
        const title = doc.querySelector('title')?.innerText || file.name.replace('.html', '');
        const description = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
        const author = doc.querySelector('meta[name="author"]')?.getAttribute('content') || '';
        
        let link = formData.link;
        if (text.length <= 800000) {
            const base64 = btoa(unescape(encodeURIComponent(text)));
            link = `data:text/html;base64,${base64}`;
        }

        setFormData(prev => ({
          ...prev,
          title: title.trim() || prev.title,
          description: description.trim() || prev.description,
          author: author.trim() || prev.author,
          link: link
        }));

      } catch (err) {
        console.error("Error parsing HTML", err);
        setFileError("Failed to parse HTML file.");
      } finally {
        setImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createProject(formData);
      onProjectCreated();
      onClose();
      // Reset form
      setFormData({
        title: '',
        author: '',
        description: '',
        category: 'General',
        imageUrl: '',
        link: '',
        displayType: 'standard',
        stats: { value: '', label: '', unit: '', maxValue: 100 }
      });
      setFileError(null);
    } catch (error) {
      alert("Failed to create project. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="
        relative z-10 w-full max-w-lg max-h-[90vh] flex flex-col
        bg-white/80 backdrop-blur-2xl
        rounded-[2rem] shadow-2xl border border-white/50
        transform transition-all animate-in fade-in zoom-in-95 duration-200
      ">
        {/* Header */}
        <div className="px-8 py-5 border-b border-black/5 flex justify-between items-center bg-white/40 rounded-t-[2rem]">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Create New Project</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-900 p-2 hover:bg-black/5 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <div className="p-8 overflow-y-auto no-scrollbar">
          
          {/* Import HTML Section */}
          <div className="mb-8 p-4 bg-primary-50/50 border border-primary-200/50 rounded-2xl backdrop-blur-sm">
             <div className="flex items-start gap-4">
                <div className="p-3 bg-white rounded-xl shadow-sm text-primary-500 ring-1 ring-black/5">
                    <FileCode size={20} />
                </div>
                <div className="flex-1">
                    <h3 className="text-sm font-bold text-gray-900 mb-1">Import from HTML</h3>
                    <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                        Upload an .html file to auto-fill details. Small files will be embedded directly.
                    </p>
                    <input 
                        type="file" 
                        accept=".html,.htm" 
                        className="hidden" 
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                    />
                    <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={importing}
                        className="flex items-center gap-2 text-xs font-bold bg-white text-primary-700 px-4 py-2 rounded-lg hover:bg-white/80 transition-all shadow-sm ring-1 ring-black/5"
                    >
                        {importing ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />}
                        {importing ? 'Reading...' : 'Select File'}
                    </button>
                    {fileError && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-red-600 font-medium bg-red-50 p-2 rounded-lg">
                            <AlertCircle size={14} />
                            {fileError}
                        </div>
                    )}
                </div>
             </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">Project Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Type className="text-gray-400" size={18} />
                </div>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-300 outline-none transition-all text-sm backdrop-blur-sm"
                  placeholder="e.g. Laboratory Task Manager"
                />
              </div>
            </div>

            {/* Display Type Selector */}
            <div className="p-4 bg-gray-50/50 border border-gray-200 rounded-2xl">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 ml-1">Card Display Type</label>
                <div className="grid grid-cols-3 gap-2">
                    {(['standard', 'metric', 'progress'] as DisplayType[]).map((type) => (
                        <button
                            key={type}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, displayType: type }))}
                            className={`
                                py-2 px-1 rounded-lg text-xs font-bold uppercase tracking-wide transition-all border
                                ${formData.displayType === type 
                                    ? 'bg-primary-500 text-white border-primary-600 shadow-md' 
                                    : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-100'}
                            `}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                {/* Conditional Inputs based on Display Type */}
                {formData.displayType !== 'standard' && (
                    <div className="mt-4 pt-4 border-t border-gray-200/50 grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2">
                        <div className="col-span-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Value</label>
                            <input 
                                type="text" 
                                name="stats.value" 
                                value={formData.stats?.value} 
                                onChange={handleChange}
                                placeholder={formData.displayType === 'metric' ? "95.5" : "75"}
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
                            />
                        </div>
                        <div className="col-span-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Unit / Suffix</label>
                            <input 
                                type="text" 
                                name="stats.unit" 
                                value={formData.stats?.unit} 
                                onChange={handleChange}
                                placeholder="%, kg, items"
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Label</label>
                            <input 
                                type="text" 
                                name="stats.label" 
                                value={formData.stats?.label} 
                                onChange={handleChange}
                                placeholder={formData.displayType === 'metric' ? "Efficiency Rate" : "Completion"}
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
                            />
                        </div>
                        {formData.displayType === 'progress' && (
                             <div className="col-span-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase">Max Value</label>
                                <input 
                                    type="number" 
                                    name="stats.maxValue" 
                                    value={formData.stats?.maxValue} 
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
                                />
                             </div>
                        )}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-5">
                {/* Author */}
                <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">Author</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="text-gray-400" size={18} />
                    </div>
                    <input
                    type="text"
                    name="author"
                    required
                    value={formData.author}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-300 outline-none transition-all text-sm backdrop-blur-sm"
                    placeholder="e.g. John Doe"
                    />
                </div>
                </div>

                {/* Category */}
                <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">Category</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Tag className="text-gray-400" size={18} />
                    </div>
                    <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-300 outline-none transition-all text-sm appearance-none backdrop-blur-sm"
                    >
                    <option value="General">General</option>
                    {categories.filter(c => c !== 'All Projects').map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                    <option value="New">Create New...</option>
                    </select>
                </div>
                </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">Description</label>
              <textarea
                name="description"
                required
                value={formData.description}
                onChange={handleChange}
                rows={2}
                className="w-full px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-300 outline-none transition-all text-sm resize-none backdrop-blur-sm"
                placeholder="Briefly describe what this project does..."
              />
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">Image URL</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <ImageIcon className="text-gray-400" size={18} />
                </div>
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-300 outline-none transition-all text-sm backdrop-blur-sm"
                  placeholder="https://example.com/image.jpg (Optional)"
                />
              </div>
            </div>

            {/* Project Link */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">
                Project Link <span className="text-gray-400 font-normal ml-1 lowercase">(Optional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <LinkIcon className="text-gray-400" size={18} />
                </div>
                <input
                  type="text"
                  name="link"
                  value={formData.link}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-300 outline-none transition-all text-sm truncate backdrop-blur-sm"
                  placeholder="https://... (Optional)"
                />
              </div>
               {formData.link.startsWith('data:') && (
                 <p className="text-[10px] text-green-600 mt-1.5 ml-2 font-bold flex items-center">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 shadow-[0_0_5px_rgba(74,222,128,0.5)]"></span>
                    Using embedded HTML content
                 </p>
               )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="
                  w-full bg-gradient-to-r from-gray-900 to-gray-800 hover:from-black hover:to-gray-900 
                  text-white py-3.5 rounded-xl font-bold tracking-wide transition-all 
                  shadow-lg hover:shadow-xl hover:-translate-y-0.5
                  disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none
                  flex items-center justify-center gap-2
                "
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : null}
                {loading ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectModal;