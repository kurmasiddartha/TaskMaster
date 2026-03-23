import { useState, useEffect } from 'react';
import api from '../api/axios';
import DashboardLayout from '../components/DashboardLayout';

const Settings = () => {
  const [preferences, setPreferences] = useState({
    notifications: { email: true, inApp: true, taskAssignment: true, taskStatus: true, comments: true },
    reminders: { enabled: true, defaultOffset: '10_min_before' },
    appearance: { theme: 'system' },
  });

  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get('/api/settings');
        setPreferences(prev => ({
          notifications: { ...prev.notifications, ...(data.notifications || {}) },
          reminders: { ...prev.reminders, ...(data.reminders || {}) },
          appearance: { ...prev.appearance, ...(data.appearance || {}) }
        }));
        
        if (data?.appearance?.theme) {
          applyTheme(data.appearance.theme);
        }
      } catch (error) {
        console.error('Failed to fetch settings', error);
        setFetchError('Could not load your settings. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const applyTheme = (themeStr) => {
    let activeTheme = themeStr || 'system';
    if (activeTheme === 'system') activeTheme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    if (activeTheme === 'light') document.documentElement.classList.add('light-theme');
    else document.documentElement.classList.remove('light-theme');
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ text: '', type: '' });
    try {
      const { data } = await api.put('/api/settings', preferences);
      setPreferences(prev => ({
        notifications: { ...prev.notifications, ...(data.notifications || {}) },
        reminders: { ...prev.reminders, ...(data.reminders || {}) },
        appearance: { ...prev.appearance, ...(data.appearance || {}) }
      }));
      setMessage({ text: 'Preferences saved successfully', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 4000);
    } catch (error) {
      console.error('Failed to save settings', error);
      setMessage({ text: 'Failed to save settings. Try again.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationToggle = (field) => {
    setPreferences((prev) => ({
      ...prev, notifications: { ...prev.notifications, [field]: !prev.notifications[field] }
    }));
  };

  const handleReminderToggle = () => {
    setPreferences((prev) => ({
      ...prev, reminders: { ...prev.reminders, enabled: !prev.reminders.enabled }
    }));
  };

  const handleReminderOffsetChange = (e) => {
    setPreferences((prev) => ({
      ...prev, reminders: { ...prev.reminders, defaultOffset: e.target.value }
    }));
  };

  const handleThemeChange = (newTheme) => {
    applyTheme(newTheme);
    setPreferences((prev) => ({
      ...prev, appearance: { ...prev.appearance, theme: newTheme }
    }));
  };

  if (loading) {
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
           <div className="p-8 max-w-4xl mx-auto w-full">
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

  const formatNotificationLabel = (key) => {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  };

  const cardBaseClass = "bg-[var(--bg-card)] border border-[var(--border)] rounded-[24px] overflow-hidden shadow-[var(--shadow-sm)] flex flex-col transition-all duration-300 hover:shadow-[var(--shadow-md)]";
  const selectBaseClass = "w-full sm:w-[350px] bg-[var(--bg-secondary)] border border-transparent rounded-xl py-3 pl-4 pr-10 text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-glow)] transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 max-w-5xl mx-auto w-full mb-12">
        
        {/* Header Component */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] tracking-tight">Settings</h2>
            <p className="text-[var(--text-secondary)] mt-2 text-sm md:text-base">Manage application preferences and system behavior.</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-[var(--shadow-md)] shadow-[var(--accent)]/20 hover:shadow-[var(--shadow-glow)] hover:-translate-y-0.5 min-w-[180px] flex justify-center"
          >
            {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Save Preferences'}
          </button>
        </div>

        {/* Global Feedback Message */}
        {message.text && (
          <div className={`p-4 rounded-xl mb-8 text-sm font-medium border transition-all ${message.type === 'success' ? 'bg-[var(--success-bg)] border-[var(--success)]/30 text-[var(--success)]' : 'bg-[var(--error-bg)] border-[var(--error)]/30 text-[var(--error)]'}`}>
            {message.text}
          </div>
        )}

        <div className="space-y-10">
          
          {/* A. Notifications Section */}
          <section className={cardBaseClass}>
            <div className="p-8 border-b border-[var(--border)]/50 relative overflow-hidden bg-gradient-to-r from-[var(--bg-secondary)] to-[var(--bg-card)]">
               <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent-glow)] rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
               <div className="flex items-center gap-4 relative z-10">
                 <div className="w-12 h-12 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border)] flex items-center justify-center text-xl shadow-inner">
                   🔔
                 </div>
                 <div>
                   <h3 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Notifications</h3>
                   <p className="text-sm text-[var(--text-secondary)] mt-1">Control which events trigger a notification.</p>
                 </div>
               </div>
            </div>
            
            <div className="p-8 flex flex-col gap-2">
              {['email', 'inApp', 'taskAssignment', 'taskStatus', 'comments'].map((key) => (
                <div key={key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 hover:bg-[var(--bg-secondary)]/50 rounded-xl transition-colors border border-transparent hover:border-[var(--border)]/50">
                  <div className="flex-1">
                    <p className="font-semibold text-[var(--text-primary)] tracking-wide text-sm">{formatNotificationLabel(key)}</p>
                    <p className="text-sm text-[var(--text-muted)] mt-0.5">Receive {formatNotificationLabel(key).toLowerCase()} system alerts</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={!!preferences.notifications[key]}
                      onChange={() => handleNotificationToggle(key)}
                    />
                    <div className="w-12 h-6 bg-[var(--border)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-transform peer-checked:bg-[var(--accent)] shadow-inner"></div>
                  </label>
                </div>
              ))}
            </div>
          </section>

          {/* B. Reminders Section */}
          <section className={cardBaseClass}>
            <div className="p-8 border-b border-[var(--border)]/50 relative overflow-hidden bg-gradient-to-r from-[var(--bg-secondary)] to-[var(--bg-card)]">
               <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent-glow)] rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
               <div className="flex items-center gap-4 relative z-10">
                 <div className="w-12 h-12 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border)] flex items-center justify-center text-xl shadow-inner">
                   ⏰
                 </div>
                 <div>
                   <h3 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Reminders</h3>
                   <p className="text-sm text-[var(--text-secondary)] mt-1">Configure automated nudge behaviors for due dates.</p>
                 </div>
               </div>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[var(--bg-primary)] border border-[var(--border)]/50 rounded-xl">
                <div>
                  <p className="font-semibold text-[var(--text-primary)] tracking-wide text-sm">Enable System Reminders</p>
                  <p className="text-sm text-[var(--text-muted)] mt-0.5">Allow TaskMaster to send you reminder push notifications.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={!!preferences.reminders.enabled}
                    onChange={handleReminderToggle}
                  />
                  <div className="w-12 h-6 bg-[var(--border)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-transform peer-checked:bg-[var(--accent)] shadow-inner"></div>
                </label>
              </div>

              <div className={`p-6 rounded-2xl border transition-all duration-300 ${preferences.reminders.enabled ? 'bg-[var(--bg-secondary)] border-[var(--border)] shadow-sm' : 'bg-transparent border-[var(--border)]/30 opacity-60'}`}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-6 justify-between">
                  <div>
                    <label className="block text-sm font-semibold text-[var(--text-primary)] mb-1">Default Reminder Offset</label>
                    <p className="text-sm text-[var(--text-muted)]">Fallback time before due date if none is chosen.</p>
                  </div>
                  <div className="relative shrink-0">
                    <select
                      value={preferences.reminders.defaultOffset}
                      onChange={handleReminderOffsetChange}
                      disabled={!preferences.reminders.enabled}
                      className={selectBaseClass}
                    >
                      <option value="due_time">At time of due date</option>
                      <option value="10_min_before">10 minutes before</option>
                      <option value="30_min_before">30 minutes before</option>
                      <option value="1_hour_before">1 hour before</option>
                      <option value="1_day_before">1 day before</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-[var(--text-muted)]">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* C. Appearance Section */}
          <section className={cardBaseClass}>
             <div className="p-8 border-b border-[var(--border)]/50 relative overflow-hidden bg-gradient-to-r from-[var(--bg-secondary)] to-[var(--bg-card)]">
               <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent-glow)] rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
               <div className="flex items-center gap-4 relative z-10">
                 <div className="w-12 h-12 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border)] flex items-center justify-center text-xl shadow-inner">
                   ✨
                 </div>
                 <div>
                   <h3 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Appearance</h3>
                   <p className="text-sm text-[var(--text-secondary)] mt-1">Customize your workspace visual identity.</p>
                 </div>
               </div>
            </div>
            
            <div className="p-8">
              <label className="block text-sm font-semibold text-[var(--text-primary)] mb-4 tracking-wide">Interface Theme</label>
              
              {/* Segmented control for themes */}
              <div className="inline-flex flex-col sm:flex-row gap-2 w-full sm:w-auto p-1.5 rounded-[16px] bg-[var(--bg-primary)] border border-[var(--border)]/50 shadow-inner">
                {[
                  { id: 'system', icon: '💻', label: 'System' },
                  { id: 'light', icon: '☀️', label: 'Light' },
                  { id: 'dark', icon: '🌙', label: 'Dark' }
                ].map((themeOpt) => (
                  <button
                    key={themeOpt.id}
                    onClick={() => handleThemeChange(themeOpt.id)}
                    className={`flex items-center justify-center gap-2.5 px-6 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 min-w-[140px] ${
                       preferences.appearance.theme === themeOpt.id 
                       ? 'bg-[var(--accent)] text-white shadow-md shadow-[var(--accent)]/30 scale-[1.02]' 
                       : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                    }`}
                  >
                    <span className="opacity-80">{themeOpt.icon}</span>
                    {themeOpt.label}
                  </button>
                ))}
              </div>
            </div>
          </section>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
