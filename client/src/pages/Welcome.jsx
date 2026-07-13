import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowRight, 
  Users, 
  BarChart3, 
  Lock, 
  Github, 
  Twitter, 
  Linkedin, 
  Sparkles
} from 'lucide-react';
import '../styles/welcome.css';

const Welcome = () => {
  const { user } = useAuth();

  return (
    <div className="welcome-page">
      {/* Background Glowing Blobs */}
      <div className="welcome-glow-1"></div>
      <div className="welcome-glow-2"></div>

      {/* Glassmorphic Navbar */}
      <header className="welcome-header">
        <div className="welcome-nav">
          <Link to="/" className="welcome-logo">
            <span className="logo-icon">✓</span>
            <span className="logo-text">TaskMaster</span>
          </Link>
          
          <div className="welcome-nav-actions">
            {user ? (
              <Link to="/dashboard" className="btn-nav-primary">
                Go to Dashboard <ArrowRight size={15} style={{ display: 'inline', marginLeft: 4 }} />
              </Link>
            ) : (
              <>
                <Link to="/login" className="welcome-nav-link">Sign In</Link>
                <Link to="/register" className="btn-nav-primary">Register</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="welcome-hero">
        <div className="hero-tagline">
          <Sparkles size={14} style={{ marginRight: 6 }} /> Next-Generation Collaboration for Students
        </div>
        
        <h1 className="hero-title">
          Master Your Tasks.<br />
          <span>Collaborate Seamlessly.</span>
        </h1>
        
        <p className="hero-subtitle">
          An ultra-premium, context-aware academic task management system designed to elevate student work. 
          Manage assignments, sync group projects, and succeed together.
        </p>

        <div className="hero-actions">
          {user ? (
            <Link to="/dashboard" className="btn-hero-primary">
              Enter Workspace <ArrowRight size={18} />
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn-hero-primary">
                Get Started for Free <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="btn-hero-secondary">
                Sign In to Account
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Feature Catalog Grid */}
      <section className="welcome-features">
        <div className="section-header">
          <h2 className="section-title">Everything You Need To Excel</h2>
          <p className="section-subtitle">A collection of robust, developer-first modules optimized to streamline your academic journey.</p>
        </div>

        <div className="features-grid">
          {/* Card 1 */}
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <Users size={22} />
            </div>
            <h3 className="feature-title">Real-Time Team Sync</h3>
            <p className="feature-description">
              Create robust projects, assign tickets to classmates, track individual status progress, and share feedback instantly.
            </p>
          </div>

          {/* Card 2 */}
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <BarChart3 size={22} />
            </div>
            <h3 className="feature-title">Deep Analytics</h3>
            <p className="feature-description">
              Visualize completion rates, sprint statistics, performance trends, and dynamic burn-down charts instantly.
            </p>
          </div>

          {/* Card 3 */}
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <Lock size={22} />
            </div>
            <h3 className="feature-title">Secure Workspace</h3>
            <p className="feature-description">
              Industry-standard JWT authentication keeps academic resources shielded from external unauthorized visitors.
            </p>
          </div>
        </div>
      </section>

      {/* Metric Highlighting Section */}
      <section className="welcome-stats">
        <div className="stats-container">
          <div className="welcome-stat-item">
            <h3>99.9%</h3>
            <p>Uptime & Availability</p>
          </div>
          <div className="welcome-stat-item">
            <h3>256-bit</h3>
            <p>Data Transit Protection</p>
          </div>
          <div className="welcome-stat-item">
            <h3>100%</h3>
            <p>Free for Students</p>
          </div>
        </div>
      </section>

      {/* Premium Deep Footer */}
      <footer className="premium-footer">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="logo">
              <span className="logo-icon">✓</span>
              <span className="logo-text">TaskMaster</span>
            </div>
            <p className="footer-desc">
              Organize projects, streamline student assignments, and accelerate academic learning.
            </p>
            <div className="footer-socials">
              <a href="https://github.com" className="social-icon" target="_blank" rel="noopener noreferrer">
                <Github size={16} />
              </a>
              <a href="https://twitter.com" className="social-icon" target="_blank" rel="noopener noreferrer">
                <Twitter size={16} />
              </a>
              <a href="https://linkedin.com" className="social-icon" target="_blank" rel="noopener noreferrer">
                <Linkedin size={16} />
              </a>
            </div>
          </div>

          <div className="footer-col">
            <h4>Product</h4>
            <ul className="footer-ul">
              <li><Link to="/login" className="footer-ul-link">Dashboard</Link></li>
              <li><Link to="/register" className="footer-ul-link">Sign Up</Link></li>
              <li><Link to="/login" className="footer-ul-link">Team Board</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Resources</h4>
            <ul className="footer-ul">
              <li><a href="#docs" className="footer-ul-link">API Reference</a></li>
              <li><a href="#guides" className="footer-ul-link">Integration Guides</a></li>
              <li><a href="#system" className="footer-ul-link">System Status</a></li>
              <li><a href="#support" className="footer-ul-link">Help Center</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Company</h4>
            <ul className="footer-ul">
              <li><a href="#about" className="footer-ul-link">About Us</a></li>
              <li><a href="#careers" className="footer-ul-link">Careers</a></li>
              <li><a href="#privacy" className="footer-ul-link">Privacy Policy</a></li>
              <li><a href="#terms" className="footer-ul-link">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-left">
            © {new Date().getFullYear()} TaskMaster. Designed with premium HSL glassmorphism. All rights reserved.
          </div>
          <div className="footer-bottom-right">
            <a href="#privacy" className="footer-bottom-link">Privacy Policy</a>
            <a href="#terms" className="footer-bottom-link">Terms of Service</a>
            <a href="#cookies" className="footer-bottom-link">Cookies Settings</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Welcome;
