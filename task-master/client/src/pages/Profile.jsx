import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import DashboardLayout from '../components/DashboardLayout';

const Profile = () => {
  const { user, setUser } = useAuth();
  
  // States
  const [profileData, setProfileData] = useState({ name: '', email: '', avatar: '', role: 'user', createdAt: '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  
  // Loading & Messages
  const [initialLoading, setInitialLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [saving, setSaving] = useState(false);
  const [passSaving, setPassSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [passMessage, setPassMessage] = useState({ text: '', type: '' });

  // Fetch Profile on Mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/api/users/profile');
        setProfileData({
          name: data.name || '',
          email: data.email || '',
          avatar: data.avatar || '',
          role: data.role || 'user',
          createdAt: data.createdAt || '',
        });
      } catch (err) {
        console.error('Error fetching profile:', err);
        setFetchError('Failed to load profile. Please try refreshing.');
      } finally {
        setInitialLoading(false);
      }
    };
    
    fetchProfile();
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });
    
    try {
      const { data } = await api.put('/api/users/profile', {
        name: profileData.name,
        email: profileData.email,
        avatar: profileData.avatar,
      });
      
      setProfileData(prev => ({ ...prev, ...data }));
      if (setUser) setUser(prevAuth => ({ ...prevAuth, ...data }));
      
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 4000);
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Error updating profile', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setPassSaving(true);
    setPassMessage({ text: '', type: '' });

    if (passwords.newPassword !== passwords.confirmPassword) {
      setPassSaving(false);
      return setPassMessage({ text: 'New passwords do not match', type: 'error' });
    }
    
    try {
      await api.put('/api/users/change-password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      setPassMessage({ text: 'Password changed successfully!', type: 'success' });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPassMessage({ text: '', type: '' }), 4000);
    } catch (err) {
      setPassMessage({ text: err.response?.data?.message || 'Error changing password', type: 'error' });
    } finally {
      setPassSaving(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Shared Input Classes
  const inputBaseClass = "w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-glow)] transition-all placeholder-[var(--text-muted)]";
  const inputDisabledClass = "w-full bg-[var(--bg-primary)] border border-transparent rounded-xl px-4 py-3 text-[var(--text-secondary)] text-sm font-medium cursor-not-allowed opacity-80";

  if (initialLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-[calc(100vh-100px)]">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[var(--accent)]"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (fetchError) {
    return (
      <DashboardLayout>
         <div className="p-8 max-w-5xl mx-auto w-full">
            <div className="text-center p-10 bg-[var(--bg-card)] border border-[var(--error)]/30 rounded-2xl shadow-[var(--shadow-md)]">
               <div className="text-4xl mb-4">⚠️</div>
               <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">Oops, something went wrong</h3>
               <p className="text-[var(--text-secondary)] mb-6">{fetchError}</p>
               <button 
                  onClick={() => window.location.reload()}
                  className="px-6 py-2.5 bg-[var(--error)] hover:bg-opacity-90 text-white font-medium rounded-xl transition-colors shadow-lg shadow-[var(--error)]/20"
               >
                  Retry Loading
               </button>
            </div>
         </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 max-w-6xl mx-auto w-full mb-12">
        
        {/* Page Header */}
        <div className="mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] tracking-tight">My Profile</h2>
          <p className="text-[var(--text-secondary)] mt-2 text-sm md:text-base">Manage your personal information and application security.</p>
        </div>
        
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 xl:gap-10">
          
          {/* Left Column: Personal Information */}
          <div className="xl:col-span-3 bg-[var(--bg-card)] border border-[var(--border)] rounded-[24px] p-6 sm:p-8 md:p-10 shadow-[var(--shadow-md)] relative overflow-hidden">
            
            {/* Subtle Gradient Glow in background */}
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[var(--accent-glow)] to-transparent opacity-20 pointer-events-none"></div>

            <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-8 relative z-10">Personal Information</h3>
            
            {message.text && (
              <div className={`p-4 rounded-xl mb-8 text-sm font-medium border relative z-10 transition-all ${message.type === 'success' ? 'bg-[var(--success-bg)] border-[var(--success)]/30 text-[var(--success)]' : 'bg-[var(--error-bg)] border-[var(--error)]/30 text-[var(--error)]'}`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleProfileUpdate} className="space-y-8 relative z-10">
              
              {/* Avatar Preview Section */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-6 p-5 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border)]/50">
                <div className="w-[88px] h-[88px] shrink-0 rounded-full bg-gradient-to-tr from-[var(--accent)] to-[var(--accent-light)] flex items-center justify-center text-3xl font-bold text-white overflow-hidden border-4 border-[var(--bg-card)] shadow-[var(--shadow-glow)]">
                  {profileData.avatar ? (
                    <img src={profileData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span>{getInitials(profileData.name)}</span>
                  )}
                </div>
                <div className="flex-1 w-full">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Avatar URL</label>
                  <input
                    type="url"
                    value={profileData.avatar}
                    onChange={(e) => setProfileData({ ...profileData, avatar: e.target.value })}
                    className={inputBaseClass}
                    placeholder="https://example.com/photo.jpg"
                  />
                  <p className="text-xs text-[var(--text-muted)] mt-2">Leave empty to use your initials.</p>
                </div>
              </div>

              {/* Editable Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Full Name</label>
                  <input
                    type="text"
                    required
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className={inputBaseClass}
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Email Address</label>
                  <input
                    type="email"
                    required
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className={inputBaseClass}
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              {/* Read-Only Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-[var(--border)]/50">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Account Role</label>
                  <input
                    type="text"
                    disabled
                    value={profileData.role === 'admin' ? 'Administrator' : 'Team Member'}
                    className={inputDisabledClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Date Joined</label>
                  <input
                    type="text"
                    disabled
                    value={formatDate(profileData.createdAt)}
                    className={inputDisabledClass}
                  />
                </div>
              </div>

              {/* Submit Area */}
              <div className="pt-4 flex items-center justify-end border-t border-[var(--border)]/50 mt-8">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-medium px-8 py-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-[var(--shadow-md)] shadow-[var(--accent)]/20 hover:shadow-[var(--shadow-glow)] hover:-translate-y-0.5 active:translate-y-0 min-w-[160px] flex justify-center"
                >
                  {saving ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Change Password */}
          <div className="xl:col-span-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-[24px] p-6 sm:p-8 md:p-10 shadow-[var(--shadow-md)] h-fit flex flex-col">
            <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-8">Security Details</h3>
            
            {passMessage.text && (
              <div className={`p-4 rounded-xl mb-6 text-sm font-medium border transition-all ${passMessage.type === 'success' ? 'bg-[var(--success-bg)] border-[var(--success)]/30 text-[var(--success)]' : 'bg-[var(--error-bg)] border-[var(--error)]/30 text-[var(--error)]'}`}>
                {passMessage.text}
              </div>
            )}

            <form onSubmit={handlePasswordUpdate} className="flex flex-col flex-1">
              <div className="space-y-6 flex-1">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Current Password</label>
                  <input
                    type="password"
                    required
                    value={passwords.currentPassword}
                    onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                    className={inputBaseClass}
                    placeholder="Enter current password"
                  />
                </div>
                
                <div className="pt-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">New Password</label>
                  <input
                    type="password"
                    required
                    minLength="6"
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                    className={inputBaseClass}
                    placeholder="Must be at least 6 characters"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    minLength="6"
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                    className={inputBaseClass}
                    placeholder="Type new password again"
                  />
                </div>
              </div>
              
              <div className="pt-8 mt-auto">
                <button
                  type="submit"
                  disabled={passSaving}
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] font-medium py-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                >
                  {passSaving ? (
                     <div className="w-5 h-5 border-2 border-[var(--text-secondary)]/30 border-t-[var(--text-secondary)] rounded-full animate-spin"></div>
                  ) : (
                    'Update Password'
                  )}
                </button>
              </div>
            </form>
          </div>
          
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
