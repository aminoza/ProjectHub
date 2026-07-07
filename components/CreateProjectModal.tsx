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
        className="absolute inset-0 bg-gray-500/40 transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="
        relative z-10 w-full max-w-lg max-h-[90vh] flex flex-col
        bg-white
        rounded-2xl
        transform transition-all animate-in fade-in zoom-in-95 duration-200
      ">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Create New Project</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-black p-2 hover:bg-gray-50 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <div className="p-8 overflow-y-auto no-scrollbar">
          
          {/* Import HTML Section */}
          <div className="mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-50">
             <div className="flex items-start gap-4">
                <div className="p-3 bg-white rounded-xl text-gray-400 border border-gray-100 shadow-sm">
                    <FileCode size={20} />
                </div>
                <div className="flex-1">
                    <h3 className="text-sm font-bold text-gray-900 mb-1">Import from HTML</h3>
                    <p className="text-xs text-gray-500 mb-4">
                        Upload an .html file to auto-fill details.
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
                        className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest bg-white text-google-blue px-6 py-2.5 rounded-full border border-gray-200 hover:bg-gray-50 transition-all shadow-sm"
                    >
                        {importing ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />}
                        {importing ? 'Reading...' : 'Select File'}
                    </button>
                    {fileError && (
                        <div className="mt-4 flex items-center gap-2 text-[10px] text-google-red font-bold uppercase tracking-widest bg-red-50 p-3 rounded-xl border border-red-100">
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
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Project Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Type className="text-gray-300" size={16} />
                </div>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-gray-300 focus:ring-0 outline-none transition-all text-sm"
                  placeholder="e.g. Laboratory Task Manager"
                />
              </div>
            </div>

            {/* Display Type Selector */}
            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-50">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 ml-1">Card Display Type</label>
                <div className="grid grid-cols-3 gap-3">
                    {(['standard', 'metric', 'progress'] as DisplayType[]).map((type) => (
                        <button
                            key={type}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, displayType: type }))}
                            className={`
                                py-2 px-1 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all border
                                ${formData.displayType === type 
                                    ? 'bg-google-blue text-white border-google-blue shadow-sm' 
                                    : 'bg-white text-gray-400 border-gray-200 hover:bg-gray-50'}
                            `}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                {/* Conditional Inputs based on Display Type */}
                {formData.displayType !== 'standard' && (
                    <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-2 gap-4">
                        <div className="col-span-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Value</label>
                            <input 
                                type="text" 
                                name="stats.value" 
                                value={formData.stats?.value} 
                                onChange={handleChange}
                                placeholder={formData.displayType === 'metric' ? "95.5" : "75"}
                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:border-gray-400 outline-none"
                            />
                        </div>
                        <div className="col-span-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Unit</label>
                            <input 
                                type="text" 
                                name="stats.unit" 
                                value={formData.stats?.unit} 
                                onChange={handleChange}
                                placeholder="%, kg, items"
                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:border-gray-400 outline-none"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Label</label>
                            <input 
                                type="text" 
                                name="stats.label" 
                                value={formData.stats?.label} 
                                onChange={handleChange}
                                placeholder={formData.displayType === 'metric' ? "Efficiency Rate" : "Completion"}
                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:border-gray-400 outline-none"
                            />
                        </div>
                        {formData.displayType === 'progress' && (
                             <div className="col-span-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Max Value</label>
                                <input 
                                    type="number" 
                                    name="stats.maxValue" 
                                    value={formData.stats?.maxValue} 
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:border-gray-400 outline-none"
                                />
                             </div>
                        )}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-6">
                {/* Author */}
                <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Author</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="text-gray-300" size={16} />
                    </div>
                    <input
                    type="text"
                    name="author"
                    required
                    value={formData.author}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-gray-300 focus:ring-0 outline-none transition-all text-sm"
                    placeholder="e.g. John Doe"
                    />
                </div>
                </div>

                {/* Category */}
                <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Category</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Tag className="text-gray-300" size={16} />
                    </div>
                    <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-gray-300 focus:ring-0 outline-none transition-all text-sm appearance-none"
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
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Description</label>
              <textarea
                name="description"
                required
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-gray-300 focus:ring-0 outline-none transition-all text-sm resize-none"
                placeholder="Briefly describe what this project does..."
              />
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Image URL</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <ImageIcon className="text-gray-300" size={16} />
                </div>
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-gray-300 focus:ring-0 outline-none transition-all text-sm"
                  placeholder="https://example.com/image.jpg (Optional)"
                />
              </div>
            </div>

            {/* Project Link */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                Project Link <span className="text-gray-300 font-normal ml-1 lowercase">(Optional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <LinkIcon className="text-gray-300" size={16} />
                </div>
                <input
                  type="text"
                  name="link"
                  value={formData.link}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-gray-300 focus:ring-0 outline-none transition-all text-sm truncate"
                  placeholder="https://... (Optional)"
                />
              </div>
               {formData.link.startsWith('data:') && (
                 <p className="text-[10px] text-green-500 mt-2 ml-2 font-bold uppercase tracking-widest flex items-center">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                    Embedded HTML
                 </p>
               )}
            </div>

            <div className="pt-4">
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