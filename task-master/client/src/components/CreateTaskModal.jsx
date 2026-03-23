import { useState } from 'react';

function CreateTaskModal({ projectId, isAdmin, members, onClose, onSubmit }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('todo');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [reminderOption, setReminderOption] = useState('none');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    onSubmit({
      title,
      description,
      status,
      priority,
      projectId,
      assignedTo: assignedTo || undefined,
      dueDate: dueDate || undefined,
      reminderOption: reminderOption !== 'none' ? reminderOption : undefined,
    });
  };

  const inputBaseClass = "w-full bg-[var(--bg-secondary)] border border-transparent rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-glow)] transition-all placeholder-[var(--text-muted)]";
  const selectBaseClass = "w-full bg-[var(--bg-secondary)] border border-transparent rounded-xl py-3 pl-4 pr-10 text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-glow)] transition-all appearance-none cursor-pointer";

  return (
    <div className="fixed inset-0 bg-[#0b1020]/80 backdrop-blur-md flex justify-center items-center z-50 p-4 transition-opacity duration-300 overflow-y-auto">
      <div 
        className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[24px] w-full max-w-xl shadow-2xl relative overflow-hidden flex flex-col my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle Decorative Top Border Glow */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--accent-light)] to-[var(--accent)] opacity-80"></div>

        {/* Header */}
        <div className="flex justify-between items-center px-8 py-6 border-b border-[var(--border)]/50 relative z-10">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">New Task</h2>
            <p className="text-xs text-[var(--text-muted)] mt-1">Add an actionable item to this project.</p>
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
              Task Title <span className="text-[var(--accent)]">*</span>
            </label>
            <input
              type="text"
              className={inputBaseClass}
              placeholder="e.g. Design Login Page"
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
              placeholder="Task details and subtasks..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
            />
          </div>

          {isAdmin && members && members.length > 0 && (
            <div className="space-y-2">
              <label className="block text-[var(--text-muted)] text-xs font-semibold uppercase tracking-wider">
                Assign To
              </label>
              <div className="relative">
                <select
                  className={selectBaseClass}
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                >
                  <option value="">Unassigned</option>
                  {members.map(m => (
                    <option key={m.user._id} value={m.user._id}>{m.user.name}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-[var(--text-muted)]">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-[var(--text-muted)] text-xs font-semibold uppercase tracking-wider">
                Status
              </label>
              <div className="relative">
                <select
                  className={selectBaseClass}
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-[var(--text-muted)]">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-[var(--text-muted)] text-xs font-semibold uppercase tracking-wider">
                Priority
              </label>
              <div className="relative">
                <select
                  className={selectBaseClass}
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-[var(--text-muted)]">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-[var(--text-muted)] text-xs font-semibold uppercase tracking-wider">
                Due Date
              </label>
              <input
                type="date"
                className={`${inputBaseClass} [color-scheme:dark]`}
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            {dueDate && (
              <div className="space-y-2">
                <label className="block text-[var(--text-muted)] text-xs font-semibold uppercase tracking-wider">
                  Reminder
                </label>
                <div className="relative">
                  <select
                    className={selectBaseClass}
                    value={reminderOption}
                    onChange={(e) => setReminderOption(e.target.value)}
                  >
                    <option value="none">No Reminder</option>
                    <option value="at_due_time">At due time</option>
                    <option value="10_min_before">10 mins before</option>
                    <option value="30_min_before">30 mins before</option>
                    <option value="1_hour_before">1 hour before</option>
                    <option value="1_day_before">1 day before</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-[var(--text-muted)]">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="flex justify-end gap-3 pt-6 mt-2 border-t border-[var(--border)]/50">
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
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateTaskModal;
