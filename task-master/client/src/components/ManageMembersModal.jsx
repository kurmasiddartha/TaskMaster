import { useState } from 'react';
import { addProjectMember, removeProjectMember } from '../api/projectService';

const ManageMembersModal = ({ project, onClose, onUpdate }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Member');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      setIsLoading(true);
      setError('');
      await addProjectMember(project._id, { email, role });
      onUpdate(); // refresh project data
      setEmail('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error adding member');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this member?')) return;
    try {
      setIsLoading(true);
      setError('');
      await removeProjectMember(project._id, userId);
      onUpdate();
    } catch (err) {
      setError(err.response?.data?.message || 'Error removing member');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="bg-[var(--bg-card)] rounded-2xl w-full max-w-md shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-10 overflow-hidden border border-[var(--border)] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[var(--border)] flex justify-between items-center bg-[var(--bg-secondary)] relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-[var(--accent)]"></div>
          <h2 className="text-xl font-bold text-white">Manage Members</h2>
          <button 
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-white transition-colors p-1"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {error && <div className="mb-4 text-sm text-[var(--error)] bg-red-500/10 p-3 rounded-lg border border-red-500/20">{error}</div>}

          {/* Add Member Form */}
          <form onSubmit={handleAddMember} className="mb-6 flex gap-2 items-end">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1.5 ml-1">User Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-glow)] focus:border-[var(--accent)] transition-all font-medium placeholder:text-[var(--text-muted)]"
                placeholder="colleague@example.com"
                required
              />
            </div>
            <div className="w-28">
              <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1.5 ml-1">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-glow)] transition-all cursor-pointer"
              >
                <option value="Member">Member</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl font-bold text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] transition-all transform active:scale-95 disabled:opacity-50 h-11"
            >
              Add
            </button>
          </form>

          {/* Member List */}
          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            <div className="flex justify-between items-center p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border)]">
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center text-xs font-bold text-white">
                   {project.createdBy?.name?.charAt(0) || 'C'}
                 </div>
                 <div>
                   <p className="text-sm font-semibold text-white">{project.createdBy?.name} <span className="text-xs text-[var(--text-muted)] ml-1">(Creator)</span></p>
                   <p className="text-xs text-[var(--text-secondary)]">{project.createdBy?.email}</p>
                 </div>
               </div>
               <span className="text-xs font-bold text-[var(--accent-light)] bg-blue-500/10 px-2 py-1 rounded">Admin</span>
            </div>

            {project.members && project.members.map((member) => (
              <div key={member.user._id} className="flex justify-between items-center p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border)] group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-xs font-bold text-white border border-[var(--border)]">
                    {member.user.name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{member.user.name}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{member.user.email}</p>
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <span className={`text-xs font-bold px-2 py-1 rounded ${member.role === 'Admin' ? 'text-[var(--accent-light)] bg-blue-500/10' : 'text-[var(--text-secondary)] bg-[var(--bg-hover)]'}`}>
                    {member.role}
                  </span>
                  <button 
                    onClick={() => handleRemoveMember(member.user._id)}
                    className="text-[var(--text-muted)] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                    title="Remove member"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ManageMembersModal;
