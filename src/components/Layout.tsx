import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  TrendingUp, 
  LogOut, 
  ChevronLeft, 
  ChevronRight
} from 'lucide-react';
import '../styles/Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getMenuItems = () => {
    if (user?.role === 'principal') {
      return [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: Building2, label: 'Departments', path: '/departments' }
      ];
    } else if (user?.role === 'hod') {
      return [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: TrendingUp, label: 'Success Index', path: '/success-index' }
      ];
    }
    return [];
  };

  const menuItems = getMenuItems();

  const getPageTitle = () => {
    const currentPath = location.pathname;
    if (currentPath === '/dashboard') return 'Dashboard';
    if (currentPath === '/departments') return 'Departments';
    if (currentPath === '/success-index') return 'Success Index';
    return 'Dashboard';
  };

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`} data-testid="sidebar">
        <div className="sidebar-header">
          <div className="app-branding">
            <div className="app-icon">🎓</div>
            {!sidebarCollapsed && <span className="app-name">Success Helper</span>}
          </div>
          {!sidebarCollapsed && (
            <button 
              className="collapse-btn"
              onClick={() => setSidebarCollapsed(true)}
              data-testid="collapse-sidebar-button"
            >
              <ChevronLeft size={18} />
            </button>
          )}
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
                data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
              >
                <Icon size={20} />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button 
            className="nav-item logout-btn" 
            onClick={handleLogout}
            data-testid="logout-button"
          >
            <LogOut size={20} />
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>

        {sidebarCollapsed && (
          <button 
            className="expand-btn"
            onClick={() => setSidebarCollapsed(false)}
            data-testid="expand-sidebar-button"
          >
            <ChevronRight size={18} />
          </button>
        )}
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="page-header">
          <div className="page-title">
            <h1 data-testid="page-title">{getPageTitle()}</h1>
          </div>
          <div className="user-info">
            <div className="user-details">
              <div className="user-name">{user?.name}</div>
              <div className="user-role">{user?.role.toUpperCase()}</div>
            </div>
            <div className="user-avatar">{user?.name.charAt(0)}</div>
          </div>
        </header>

        <div className="page-content" data-testid="page-content">
          {children}
        </div>
      </main>
    </div>
  );
}
