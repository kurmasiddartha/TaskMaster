import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import NotificationDropdown from './NotificationDropdown';
import { ShieldCheck, HelpCircle, FileText } from 'lucide-react';

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <div className="dashboard-wrapper">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="logo-icon">✓</span>
          <span className="logo-text">TaskMaster</span>
        </div>
        <nav className="sidebar-nav">
          <Link 
            to="/dashboard" 
            className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
          >
            <span className="nav-icon">⊞</span>
            Dashboard
          </Link>
          <Link 
            to="/my-tasks"
            className={`nav-item ${location.pathname === '/my-tasks' ? 'active' : ''}`}
          >
            <span className="nav-icon">✓</span>
            My Tasks
          </Link>
          <Link 
            to="/projects" 
            className={`nav-item ${location.pathname.startsWith('/projects') ? 'active' : ''}`}
          >
            <span className="nav-icon">◈</span>
            Projects
          </Link>
          <Link 
            to="/ai-assistant" 
            className={`nav-item ${location.pathname === '/ai-assistant' ? 'active' : ''}`}
          >
            <span className="nav-icon">✨</span>
            AI Assistant
          </Link>
          <Link 
            to="/settings" 
            className={`nav-item ${location.pathname === '/settings' ? 'active' : ''}`}
          >
            <span className="nav-icon">⚙</span>
            Settings
          </Link>
        </nav>
        <button className="sidebar-logout" onClick={handleLogout}>
          <span>↪</span> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main flex flex-col h-screen">
        {/* Top bar */}
        <header className="dashboard-header shrink-0">
          <div>
            <h1 className="dashboard-greeting">
              Good day, <span>{user?.name?.split(' ')[0] || 'there'}</span> 👋
            </h1>
            <p className="dashboard-subtext">Here&apos;s what&apos;s on your plate today</p>
          </div>
          <div className="flex items-center gap-6">
            <NotificationDropdown />
            <Link to="/profile" className="header-avatar cursor-pointer" title="Go to Profile">
              <div className="avatar">{user?.avatar ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover rounded-full" /> : initials}</div>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto w-full flex flex-col justify-between">
          <div className="flex-1">
            {children}
          </div>
          <footer className="dashboard-footer shrink-0">
            <div className="footer-content">
              <div className="footer-left">
                <span className="footer-logo">✓</span>
                <span className="footer-copyright">
                  © {new Date().getFullYear()} <strong>TaskMaster</strong>. Workspace active & secure.
                </span>
              </div>
              <div className="footer-links">
                <a href="#docs" className="footer-link">
                  <FileText size={13} style={{ display: 'inline', marginRight: 4, verticalAlign: 'text-bottom' }} /> Docs
                </a>
                <a href="#support" className="footer-link">
                  <HelpCircle size={13} style={{ display: 'inline', marginRight: 4, verticalAlign: 'text-bottom' }} /> Help
                </a>
                <a href="#security" className="footer-link">
                  <ShieldCheck size={13} style={{ display: 'inline', marginRight: 4, verticalAlign: 'text-bottom' }} /> Security
                </a>
              </div>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
