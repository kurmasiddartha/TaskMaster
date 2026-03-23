import { useState } from 'react';

function CreateProjectModal({ onClose, onSubmit }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({ title, description });
  };

  const inputBaseClass = "w-full bg-[var(--bg-secondary)] border border-transparent rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-glow)] transition-all placeholder-[var(--text-muted)]";

  return (
    <div className="fixed inset-0 bg-[#0b1020]/80 backdrop-blur-md flex justify-center items-center z-50 p-4 transition-opacity duration-300">
      <div 
        className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[24px] w-full max-w-lg shadow-2xl relative overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle Decorative Top Border Glow */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--accent-light)] to-[var(--accent)] opacity-80"></div>

        {/* Header */}
        <div className="flex justify-between items-center px-8 py-6 border-b border-[var(--border)]/50 relative z-10">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">New Project</h2>
            <p className="text-xs text-[var(--text-muted)] mt-1">Create a new workspace for your team.</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] p-2 rounded-full"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Body */}
        <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-6 relative z-10">
          
          <div className="space-y-2">
            <label className="block text-[var(--text-muted)] text-xs font-semibold uppercase tracking-wider">
              Project Title <span className="text-[var(--accent)]">*</span>
            </label>
            <input
              type="text"
              className={inputBaseClass}
              placeholder="e.g. Q1 Marketing Campaign"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-[var(--text-muted)] text-xs font-semibold uppercase tracking-wider">
              Description <span className="text-[var(--text-secondary)] font-normal normal-case tracking-normal ml-1">(Optional)</span>
            </label>
            <textarea
              className={`${inputBaseClass} resize-none`}
              placeholder="Briefly describe the project goals..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="4"
            />
          </div>
          
          {/* Footer */}
          <div className="flex justify-end items-center gap-3 pt-6 mt-4 border-t border-[var(--border)]/50">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-xl hover:bg-[var(--bg-hover)] transition-all font-medium text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-xl transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[var(--accent)]/20 hover:shadow-[var(--accent-glow)] hover:-translate-y-0.5"
              disabled={!title.trim()}
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateProjectModal;
