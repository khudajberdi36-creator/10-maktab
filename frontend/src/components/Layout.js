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

  // Dark mode ni <html> ga qo'llash
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  // Sahifa o'zgarganda sidebar yopilsin (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

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

  const SidebarContent = () => (
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
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position:'fixed', inset:0, background:'rgba(0,0,0,0.5)',
            zIndex:99, display:'none'
          }}
          className="mobile-overlay"
        />
      )}

      {/* Desktop sidebar */}
      <aside className="sidebar">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      <aside className={`sidebar mobile-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <SidebarContent />
      </aside>

      <div className="main-content">
        <header className="topbar">
          {/* Mobile hamburger */}
          <button
            className="hamburger-btn"
            onClick={() => setSidebarOpen(v => !v)}
            style={{
              display:'none', background:'none', border:'none',
              fontSize:22, cursor:'pointer', color:'var(--text-primary)',
              padding:'4px 8px', borderRadius:8
            }}>
            ☰
          </button>

          <h1 className="topbar-title">{getTitle()}</h1>

          <div className="topbar-right" style={{display:'flex', alignItems:'center', gap:12}}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
              {new Date().toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>

            {/* Dark mode toggle */}
            <button
              onClick={() => setDarkMode(v => !v)}
              title={darkMode ? "Kunduzgi rejim" : "Tungi rejim"}
              style={{
                background: darkMode ? '#334155' : '#f1f5f9',
                border: 'none', borderRadius:20, padding:'6px 12px',
                cursor:'pointer', fontSize:16, display:'flex',
                alignItems:'center', gap:6, fontWeight:600,
                color: darkMode ? '#e2e8f0' : '#475569',
                transition:'all 0.2s'
              }}>
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </header>

        <main className="page" ref={mainRef}>
          <Outlet />
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .sidebar { display: none !important; }
          .mobile-sidebar { display: flex !important; }
          .hamburger-btn { display: flex !important; }
          .mobile-overlay { display: block !important; }
          .topbar-title { font-size: 15px !important; }
        }
        .mobile-sidebar {
          display: none;
          position: fixed;
          top: 0; left: 0; bottom: 0;
          width: 260px;
          z-index: 100;
          transform: translateX(-100%);
          transition: transform 0.28s cubic-bezier(0.22,1,0.36,1);
          flex-direction: column;
        }
        .mobile-sidebar.open {
          transform: translateX(0);
        }
      `}</style>
    </div>
  );
}