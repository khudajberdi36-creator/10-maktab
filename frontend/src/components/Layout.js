import React, { useEffect, useRef, useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const roleLabels = { admin: 'Administrator', direktor: 'Direktor', oquvchi: "O'qituvchi" };

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const mainRef = useRef(null);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem('token');
      if (!token) { logout(); navigate('/login'); return; }
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp < now) { logout(); navigate('/login'); }
      } catch { logout(); navigate('/login'); }
    };
    checkToken();
    const interval = setInterval(checkToken, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.style.animation = 'none';
      void mainRef.current.offsetHeight;
      mainRef.current.style.animation = 'fadeInUp 0.35s cubic-bezier(0.22,1,0.36,1) both';
    }
  }, [location.pathname]);

  const getTitle = () => {
    if (location.pathname === '/') return '📊 Bosh sahifa';
    if (location.pathname.includes('/teachers/new')) return "➕ Yangi o'qituvchi";
    if (location.pathname.includes('/edit')) return "✏️ Tahrirlash";
    if (location.pathname.includes('/teachers/')) return "👤 O'qituvchi ma'lumotlari";
    if (location.pathname === '/teachers') return "👨‍🏫 O'qituvchilar ro'yxati";
    if (location.pathname === '/certificates') return "🏆 Sertifikatlar";
    if (location.pathname === '/documents') return "📁 Hujjatlar";
    if (location.pathname === '/import') return "📥 Excel/CSV Import";
    if (location.pathname === '/users') return "👥 Foydalanuvchilar";
    return "Tizim";
  };

  const isAdminOrDirektor = user?.role === 'admin' || user?.role === 'direktor';

  const NavContent = () => (
    <>
      <div className="sidebar-logo">
        <h2>🏫 Maktab Tizimi</h2>
        <span>O'qituvchilar Ma'lumotlar Bazasi</span>
      </div>
      <nav className="sidebar-nav">
        <div className="nav-section">
          <div className="nav-section-title">Asosiy</div>
          <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="icon">📊</span> Bosh sahifa
          </NavLink>
          <NavLink to="/teachers" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="icon">👨‍🏫</span> O'qituvchilar
          </NavLink>
        </div>
        {isAdminOrDirektor && (
          <div className="nav-section">
            <div className="nav-section-title">Boshqaruv</div>
            <NavLink to="/teachers/new" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <span className="icon">➕</span> Yangi qo'shish
            </NavLink>
            <NavLink to="/import" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <span className="icon">📥</span> Excel Import
            </NavLink>
          </div>
        )}
        <div className="nav-section">
          <div className="nav-section-title">Ma'lumot</div>
          <NavLink to="/certificates" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="icon">🏆</span> Sertifikatlar
          </NavLink>
          <NavLink to="/documents" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="icon">📁</span> Hujjatlar
          </NavLink>
        </div>
        {isAdminOrDirektor && (
          <div className="nav-section">
            <div className="nav-section-title">Tizim</div>
            <NavLink to="/users" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <span className="icon">👥</span> Foydalanuvchilar
            </NavLink>
          </div>
        )}
      </nav>
      <div className="sidebar-user">
        <div className="sidebar-user-info">
          <div className="sidebar-avatar">{user?.full_name?.[0] || 'A'}</div>
          <div>
            <div className="sidebar-user-name">{user?.full_name}</div>
            <div className="sidebar-user-role">{roleLabels[user?.role]}</div>
          </div>
        </div>
        <button className="logout-btn" onClick={() => { logout(); navigate('/login'); }}>
          🚪 Chiqish
        </button>
      </div>
    </>
  );

  return (
    <div className="layout">
      <style>{`
        .dm-toggle {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 7px 16px;
          border-radius: 20px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 700;
          font-family: inherit;
          transition: all 0.2s;
          background: #f1f5f9;
          border: 1.5px solid #e2e8f0;
          color: #475569;
        }
        .dm-toggle:hover { transform: scale(1.05); box-shadow: 0 2px 8px rgba(0,0,0,0.1); }

        .hamburger-btn {
          display: none;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          font-size: 22px;
          cursor: pointer;
          padding: 6px 10px;
          border-radius: 8px;
          color: var(--text, #1e293b);
          line-height: 1;
          margin-right: 4px;
        }

        .mobile-sidebar {
          display: none;
          position: fixed;
          top: 0; left: 0; bottom: 0;
          width: 268px;
          z-index: 200;
          flex-direction: column;
          transform: translateX(-100%);
          transition: transform 0.28s cubic-bezier(0.22,1,0.36,1);
          background: linear-gradient(170deg, #0d1e33 0%, #162840 40%, #1a3254 100%);
          box-shadow: 4px 0 32px rgba(0,0,0,0.3);
          overflow-y: auto;
        }
        .mobile-sidebar.open { transform: translateX(0); }

        .mob-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          z-index: 199;
        }

        @media (max-width: 768px) {
          .sidebar { display: none !important; }
          .mobile-sidebar { display: flex !important; }
          .hamburger-btn { display: flex !important; }
          .topbar-date { display: none !important; }
          .page { padding: 16px !important; }
          .topbar { padding: 0 12px !important; }
        }

        [data-theme="dark"] .dm-toggle {
          background: #334155;
          border-color: #475569;
          color: #e2e8f0;
        }
        [data-theme="dark"] body { background: #0f172a !important; color: #f1f5f9; }
        [data-theme="dark"] .main-content { background: #0f172a !important; }
        [data-theme="dark"] .topbar {
          background: #1e293b !important;
          border-bottom-color: #334155 !important;
          backdrop-filter: none !important;
        }
        [data-theme="dark"] .topbar-title { color: #f1f5f9 !important; }
        [data-theme="dark"] .hamburger-btn { color: #e2e8f0 !important; }
        [data-theme="dark"] .card { background: #1e293b !important; border-color: #334155 !important; }
        [data-theme="dark"] .stat-card { background: #1e293b !important; border-color: #334155 !important; }
        [data-theme="dark"] .stat-num { color: #f1f5f9 !important; }
        [data-theme="dark"] .stat-label { color: #94a3b8 !important; }
        [data-theme="dark"] th { background: #0f172a !important; color: #94a3b8 !important; border-color: #334155 !important; }
        [data-theme="dark"] td { border-color: #1e293b !important; color: #e2e8f0 !important; }
        [data-theme="dark"] tr:hover td { background: #263044 !important; }
        [data-theme="dark"] .form-control { background: #0f172a !important; border-color: #334155 !important; color: #f1f5f9 !important; }
        [data-theme="dark"] .search-bar { background: #0f172a !important; border-color: #334155 !important; }
        [data-theme="dark"] .search-bar input { color: #f1f5f9 !important; background: transparent !important; }
        [data-theme="dark"] .btn-outline { border-color: #334155 !important; color: #cbd5e1 !important; background: transparent !important; }
        [data-theme="dark"] .btn-outline:hover { background: #1e293b !important; }
        [data-theme="dark"] .tabs { border-bottom-color: #334155 !important; }
        [data-theme="dark"] .tab-btn { color: #64748b !important; }
        [data-theme="dark"] .tab-btn.active { color: #60a5fa !important; border-bottom-color: #3b82f6 !important; background: rgba(96,165,250,0.08) !important; }
        [data-theme="dark"] .tab-btn:hover { color: #cbd5e1 !important; background: rgba(255,255,255,0.05) !important; }
        [data-theme="dark"] .card-title { color: #f1f5f9 !important; }
        [data-theme="dark"] .empty-state h3 { color: #e2e8f0 !important; }
      `}</style>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="mob-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Mobile sidebar */}
      <aside className={`mobile-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <NavContent />
      </aside>

      {/* Desktop sidebar */}
      <aside className="sidebar">
        <NavContent />
      </aside>

      <div className="main-content">
        <header className="topbar">
          <div style={{display:'flex', alignItems:'center', gap:8}}>
            <button className="hamburger-btn" onClick={() => setSidebarOpen(v => !v)}>☰</button>
            <h1 className="topbar-title">{getTitle()}</h1>
          </div>

          <div className="topbar-right" style={{display:'flex', alignItems:'center', gap:12}}>
            <span className="topbar-date" style={{fontSize:13, color:'var(--text-muted)', fontWeight:600}}>
              {new Date().toLocaleDateString('uz-UZ', {year:'numeric', month:'long', day:'numeric'})}
            </span>
            <button className="dm-toggle" onClick={() => setDarkMode(v => !v)}>
              {darkMode ? '☀️ Kun' : '🌙 Tun'}
            </button>
          </div>
        </header>

        <main className="page" ref={mainRef}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}